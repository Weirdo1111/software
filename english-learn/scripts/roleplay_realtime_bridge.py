from __future__ import annotations

import argparse
import asyncio
import gzip
import json
import sys
import uuid
from pathlib import Path
from typing import Any

import websockets

BRIDGE_DIR = Path(__file__).resolve().parent / "roleplay_bridge"
sys.path.insert(0, str(BRIDGE_DIR))

import config  # noqa: E402
import protocol  # noqa: E402
from role_prompts import wrap_user_input  # noqa: E402


def json_message(payload: dict[str, Any]) -> str:
    return json.dumps(payload, ensure_ascii=True)


class RealtimeRoleplayBridgeSession:
    def __init__(
        self,
        client_ws,
        character_id: str | None = None,
        output_audio_format: str = "pcm",
        recv_timeout: int = 120,
    ):
        self.client_ws = client_ws
        self.character_id = character_id or config.DEFAULT_CHARACTER
        self.character = config.get_character(self.character_id)
        self.output_audio_format = output_audio_format
        self.recv_timeout = recv_timeout
        self.session_id = str(uuid.uuid4())
        self.ws = None
        self.log_id = ""
        self.dialog_variant = "default"
        self.resource_id = ""
        self.receive_task = None
        self.hello_finished = False
        self.upstream_finished = False
        self.reset_session_each_turn = config.should_reset_session_each_turn(self.character_id)

    async def connect(self):
        ws_config = config.build_ws_config(self.character_id)
        config.validate_ws_config(ws_config)
        self.dialog_variant = ws_config.get("variant", "default")
        self.resource_id = ws_config.get("resource_id", "")

        self.ws = await websockets.connect(
            ws_config["base_url"],
            extra_headers=ws_config["headers"],
            ping_interval=None,
            max_size=None,
        )
        self.log_id = self.ws.response_headers.get("X-Tt-Logid", "")

        await self._send_start_connection()
        await self._send_start_session()

        await self.client_ws.send(
            json_message(
                {
                    "type": "session_ready",
                    "characterId": self.character_id,
                    "botName": self.character["bot_name"],
                    "speaker": self.character["speaker"],
                    "audioFormat": self.output_audio_format,
                    "sampleRate": 24000,
                    "dialogVariant": self.dialog_variant,
                    "resourceId": self.resource_id,
                    "logId": self.log_id,
                }
            )
        )

    async def _send_start_connection(self):
        request = bytearray(protocol.generate_header())
        request.extend(int(1).to_bytes(4, "big"))
        payload_bytes = gzip.compress(b"{}")
        request.extend(len(payload_bytes).to_bytes(4, "big"))
        request.extend(payload_bytes)
        await self.ws.send(request)
        await self.ws.recv()

    async def _send_start_session(self):
        request_params = config.build_start_session_req(
            character_id=self.character_id,
            output_audio_format=self.output_audio_format,
            input_mod="audio",
            recv_timeout=self.recv_timeout,
        )
        payload_bytes = gzip.compress(json.dumps(request_params).encode("utf-8"))
        request = bytearray(protocol.generate_header())
        request.extend(int(100).to_bytes(4, "big"))
        request.extend(len(self.session_id).to_bytes(4, "big"))
        request.extend(self.session_id.encode("utf-8"))
        request.extend(len(payload_bytes).to_bytes(4, "big"))
        request.extend(payload_bytes)
        await self.ws.send(request)
        await self.ws.recv()

    async def say_hello(self):
        payload_bytes = gzip.compress(
            json.dumps({"content": self.character["hello"]}).encode("utf-8")
        )
        request = bytearray(protocol.generate_header())
        request.extend(int(300).to_bytes(4, "big"))
        request.extend(len(self.session_id).to_bytes(4, "big"))
        request.extend(self.session_id.encode("utf-8"))
        request.extend(len(payload_bytes).to_bytes(4, "big"))
        request.extend(payload_bytes)
        await self.ws.send(request)

    async def send_text(self, content: str):
        payload_bytes = gzip.compress(
            json.dumps({"content": wrap_user_input(content, self.character_id)}).encode("utf-8")
        )
        request = bytearray(protocol.generate_header())
        request.extend(int(501).to_bytes(4, "big"))
        request.extend(len(self.session_id).to_bytes(4, "big"))
        request.extend(self.session_id.encode("utf-8"))
        request.extend(len(payload_bytes).to_bytes(4, "big"))
        request.extend(payload_bytes)
        await self.ws.send(request)

    async def send_audio(self, audio_bytes: bytes):
        request = bytearray(
            protocol.generate_header(
                message_type=protocol.CLIENT_AUDIO_ONLY_REQUEST,
                serial_method=protocol.NO_SERIALIZATION,
            )
        )
        request.extend(int(200).to_bytes(4, "big"))
        request.extend(len(self.session_id).to_bytes(4, "big"))
        request.extend(self.session_id.encode("utf-8"))
        payload_bytes = gzip.compress(audio_bytes)
        request.extend(len(payload_bytes).to_bytes(4, "big"))
        request.extend(payload_bytes)
        await self.ws.send(request)

    async def receive_forever(self):
        try:
            while True:
                response = await self.ws.recv()
                parsed = protocol.parse_response(response)
                message_type = parsed.get("message_type")
                payload = parsed.get("payload_msg")

                if message_type == "SERVER_ACK" and isinstance(payload, (bytes, bytearray)):
                    await self.client_ws.send(bytes(payload))
                    continue

                if message_type == "SERVER_ERROR_RESPONSE":
                    await self.client_ws.send(
                        json_message(
                            {
                                "type": "error",
                                "message": str(payload or "Upstream realtime roleplay service failed."),
                            }
                        )
                    )
                    break

                event = parsed.get("event")
                serializable_payload = (
                    payload
                    if isinstance(payload, (dict, list, str, int, float, bool)) or payload is None
                    else None
                )

                if event == 359:
                    if not self.hello_finished:
                        self.hello_finished = True
                        await self.client_ws.send(json_message({"type": "hello_finished"}))
                    else:
                        await self.client_ws.send(json_message({"type": "assistant_turn_finished"}))
                        if self.reset_session_each_turn:
                            await self._prepare_next_turn_session()
                elif event == 450:
                    await self.client_ws.send(json_message({"type": "barge_in"}))
                elif event == 459:
                    await self.client_ws.send(json_message({"type": "assistant_resumed"}))
                elif event in (152, 153):
                    await self.client_ws.send(json_message({"type": "session_finished", "event": event}))
                    self.upstream_finished = True
                    break

                if event is not None or serializable_payload is not None:
                    await self.client_ws.send(
                        json_message(
                            {
                                "type": "upstream_event",
                                "event": event,
                                "payload": serializable_payload,
                            }
                        )
                    )
        except Exception as exc:
            if not self.client_ws.closed:
                await self.client_ws.send(json_message({"type": "error", "message": str(exc)}))
        finally:
            self.upstream_finished = True

    async def close(self):
        if self.receive_task:
            self.receive_task.cancel()
            try:
                await self.receive_task
            except BaseException:
                pass

        if not self.ws:
            return

        try:
            if not self.upstream_finished:
                await self._finish_session()
                await self._finish_connection()
        except Exception:
            pass

        try:
            await self.ws.close()
        except Exception:
            pass

    async def _finish_session(self):
        request = bytearray(protocol.generate_header())
        request.extend(int(102).to_bytes(4, "big"))
        payload_bytes = gzip.compress(b"{}")
        request.extend(len(self.session_id).to_bytes(4, "big"))
        request.extend(self.session_id.encode("utf-8"))
        request.extend(len(payload_bytes).to_bytes(4, "big"))
        request.extend(payload_bytes)
        await self.ws.send(request)

    async def _prepare_next_turn_session(self):
        if not self.ws or self.upstream_finished:
            return

        await self._finish_session()
        self.session_id = str(uuid.uuid4())
        await self._send_start_session()

    async def _finish_connection(self):
        request = bytearray(protocol.generate_header())
        request.extend(int(2).to_bytes(4, "big"))
        payload_bytes = gzip.compress(b"{}")
        request.extend(len(payload_bytes).to_bytes(4, "big"))
        request.extend(payload_bytes)
        await self.ws.send(request)


async def handle_browser_client(client_ws):
    session = None

    try:
        async for message in client_ws:
            if isinstance(message, bytes):
                if session is not None:
                    await session.send_audio(message)
                continue

            try:
                command = json.loads(message)
            except json.JSONDecodeError:
                await client_ws.send(json_message({"type": "error", "message": "Invalid bridge command."}))
                continue

            command_type = command.get("type")

            if command_type == "start":
                try:
                    if session is not None:
                        await session.close()

                    session = RealtimeRoleplayBridgeSession(
                        client_ws=client_ws,
                        character_id=str(command.get("characterId") or config.DEFAULT_CHARACTER),
                        output_audio_format=command.get("outputAudioFormat", "pcm"),
                        recv_timeout=int(command.get("recvTimeout", 120)),
                    )
                    await session.connect()
                    session.receive_task = asyncio.create_task(session.receive_forever())
                    await session.say_hello()
                except Exception as exc:
                    await client_ws.send(json_message({"type": "error", "message": str(exc)}))
            elif command_type == "text":
                if session is None:
                    await client_ws.send(json_message({"type": "error", "message": "Session has not started yet."}))
                    continue
                content = str(command.get("content", "")).strip()
                if content:
                    await session.send_text(content)
                    await client_ws.send(json_message({"type": "text_sent", "content": content}))
            elif command_type == "finish":
                break
            elif command_type == "ping":
                await client_ws.send(json_message({"type": "pong"}))
    finally:
        if session is not None:
            await session.close()


async def main():
    parser = argparse.ArgumentParser(description="Realtime roleplay bridge server")
    parser.add_argument("--host", type=str, default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8876)
    args = parser.parse_args()

    async with websockets.serve(
        handle_browser_client,
        args.host,
        args.port,
        max_size=None,
        ping_interval=None,
    ):
        print(f"Roleplay realtime bridge listening on ws://{args.host}:{args.port}")
        await asyncio.Future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
