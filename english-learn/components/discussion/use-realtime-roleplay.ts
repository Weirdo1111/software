"use client";

import { useEffect, useRef, useState } from "react";

import type { RoleplayCharacterId } from "@/lib/roleplay";

type BridgeMessage =
  | {
      type: "session_ready";
      characterId?: string;
      botName: string;
      speaker: string;
      audioFormat: string;
      sampleRate: number;
      dialogVariant?: string;
      resourceId?: string;
      logId?: string;
    }
  | { type: "hello_finished" }
  | { type: "assistant_turn_finished" }
  | { type: "barge_in" }
  | { type: "assistant_resumed" }
  | { type: "session_finished"; event?: number }
  | { type: "text_sent"; content: string }
  | { type: "upstream_event"; event?: number; payload?: unknown }
  | { type: "error"; message: string }
  | { type: "pong" };

export type RoleplayRealtimeLog = {
  id: string;
  tone: "neutral" | "success" | "warn" | "error";
  message: string;
};

type PlaybackController = {
  enqueue: (buffer: ArrayBuffer) => void;
  clear: () => void;
  close: () => Promise<void>;
};

type CaptureController = {
  stop: () => Promise<void>;
};

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function appendUint8Arrays(left: Uint8Array, right: Uint8Array) {
  const merged = new Uint8Array(left.byteLength + right.byteLength);
  merged.set(left, 0);
  merged.set(right, left.byteLength);
  return merged;
}

function rmsLevel(input: Float32Array) {
  let sum = 0;
  for (const sample of input) {
    sum += sample * sample;
  }
  return Math.min(1, Math.sqrt(sum / Math.max(1, input.length)) * 4);
}

function downsampleToInt16(input: Float32Array, inputSampleRate: number, outputSampleRate: number) {
  if (inputSampleRate === outputSampleRate) {
    const output = new Int16Array(input.length);
    for (let index = 0; index < input.length; index += 1) {
      const sample = Math.max(-1, Math.min(1, input[index] ?? 0));
      output[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    return output;
  }

  const ratio = inputSampleRate / outputSampleRate;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Int16Array(outputLength);

  let outputOffset = 0;
  let inputOffset = 0;
  while (outputOffset < outputLength) {
    const nextOffset = Math.round((outputOffset + 1) * ratio);
    let accumulator = 0;
    let count = 0;

    for (let index = inputOffset; index < nextOffset && index < input.length; index += 1) {
      accumulator += input[index] ?? 0;
      count += 1;
    }

    const averaged = count > 0 ? accumulator / count : 0;
    const sample = Math.max(-1, Math.min(1, averaged));
    output[outputOffset] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;

    outputOffset += 1;
    inputOffset = nextOffset;
  }

  return output;
}

async function createFloat32PlaybackController() {
  const context = new AudioContext({ sampleRate: 24000 });
  const processor = context.createScriptProcessor(4096, 0, 1);
  const queue: Float32Array[] = [];
  let queueOffset = 0;

  processor.onaudioprocess = (event) => {
    const output = event.outputBuffer.getChannelData(0);
    output.fill(0);

    let outputOffset = 0;
    while (outputOffset < output.length && queue.length > 0) {
      const current = queue[0];
      const remaining = current.length - queueOffset;
      const writable = Math.min(remaining, output.length - outputOffset);
      output.set(current.subarray(queueOffset, queueOffset + writable), outputOffset);
      outputOffset += writable;
      queueOffset += writable;

      if (queueOffset >= current.length) {
        queue.shift();
        queueOffset = 0;
      }
    }
  };

  processor.connect(context.destination);
  await context.resume();

  return {
    enqueue(buffer: ArrayBuffer) {
      const usableLength = buffer.byteLength - (buffer.byteLength % 4);
      if (usableLength <= 0) return;
      const chunk = new Float32Array(buffer.slice(0, usableLength));
      queue.push(chunk);
    },
    clear() {
      queue.length = 0;
      queueOffset = 0;
    },
    async close() {
      processor.disconnect();
      await context.close().catch(() => {});
    },
  } satisfies PlaybackController;
}

async function createMicCapture(websocket: WebSocket, onLevelChange: (value: number) => void) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  const processor = context.createScriptProcessor(4096, 1, 1);
  const muteGain = context.createGain();
  muteGain.gain.value = 0;
  let pending = new Uint8Array(0);

  processor.onaudioprocess = (event) => {
    if (websocket.readyState !== WebSocket.OPEN) {
      return;
    }

    const channelData = event.inputBuffer.getChannelData(0);
    onLevelChange(rmsLevel(channelData));

    const pcm = downsampleToInt16(channelData, context.sampleRate, 16000);
    pending = appendUint8Arrays(pending, new Uint8Array(pcm.buffer));

    while (pending.byteLength >= 3200) {
      const packet = pending.slice(0, 3200);
      websocket.send(packet.buffer);
      pending = pending.slice(3200);
    }
  };

  source.connect(processor);
  processor.connect(muteGain);
  muteGain.connect(context.destination);
  await context.resume();

  return {
    async stop() {
      if (pending.byteLength > 0 && websocket.readyState === WebSocket.OPEN) {
        websocket.send(pending.buffer.slice(0));
      }

      processor.disconnect();
      source.disconnect();
      muteGain.disconnect();
      stream.getTracks().forEach((track) => track.stop());
      await context.close().catch(() => {});
      onLevelChange(0);
    },
  } satisfies CaptureController;
}

export function useRealtimeRoleplay(bridgeUrl: string) {
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [isMicActive, setIsMicActive] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [logs, setLogs] = useState<RoleplayRealtimeLog[]>([]);
  const [status, setStatus] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [dialogVariant, setDialogVariant] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [logId, setLogId] = useState("");
  const [botName, setBotName] = useState("");

  const websocketRef = useRef<WebSocket | null>(null);
  const playbackRef = useRef<PlaybackController | null>(null);
  const captureRef = useRef<CaptureController | null>(null);
  const botNameRef = useRef("");
  const connectionNonceRef = useRef(0);

  function isActiveConnection(socket: WebSocket, connectionNonce: number) {
    return websocketRef.current === socket && connectionNonceRef.current === connectionNonce;
  }

  function pushLog(message: string, tone: RoleplayRealtimeLog["tone"] = "neutral") {
    setLogs((current) => [...current.slice(-11), { id: nextId("log"), message, tone }]);
  }

  async function stopMicrophone() {
    const capture = captureRef.current;
    captureRef.current = null;

    if (capture) {
      await capture.stop();
    }
    setIsMicActive(false);
  }

  async function disconnectSession() {
    connectionNonceRef.current += 1;
    await stopMicrophone();

    const playback = playbackRef.current;
    playbackRef.current = null;
    if (playback) {
      await playback.close();
    }

    const socket = websocketRef.current;
    websocketRef.current = null;

    if (socket) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "finish" }));
      }
      socket.close();
    }

    setIsAssistantSpeaking(false);
    setConnectionState("idle");
    setStatus("");
    setAudioLevel(0);
    setSpeaker("");
    setDialogVariant("");
    setResourceId("");
    setLogId("");
    setBotName("");
    botNameRef.current = "";
  }

  async function connectSession(characterId?: RoleplayCharacterId) {
    if (websocketRef.current) {
      return;
    }

    const connectionNonce = connectionNonceRef.current + 1;
    connectionNonceRef.current = connectionNonce;
    setConnectionState("connecting");
    setStatus("Connecting to the realtime bridge...");
    pushLog("Connecting to the local realtime roleplay bridge.");

    const playback = await createFloat32PlaybackController();
    if (connectionNonceRef.current !== connectionNonce) {
      await playback.close();
      return;
    }

    playbackRef.current = playback;

    const socket = new WebSocket(bridgeUrl);
    socket.binaryType = "arraybuffer";
    websocketRef.current = socket;

    socket.onopen = () => {
      if (!isActiveConnection(socket, connectionNonce)) {
        socket.close();
        return;
      }

      socket.send(
        JSON.stringify({
          type: "start",
          characterId,
          outputAudioFormat: "pcm",
          recvTimeout: 120,
        }),
      );
    };

    socket.onmessage = async (event) => {
      if (!isActiveConnection(socket, connectionNonce)) {
        return;
      }

      if (typeof event.data !== "string") {
        const buffer =
          event.data instanceof ArrayBuffer ? event.data : await event.data.arrayBuffer();
        playback.enqueue(buffer);
        setIsAssistantSpeaking(true);
        return;
      }

      const payload = JSON.parse(event.data) as BridgeMessage;

      if (payload.type === "session_ready") {
        setConnectionState("connected");
        setStatus(`${payload.botName} is ready for realtime conversation.`);
        setBotName(payload.botName);
        botNameRef.current = payload.botName;
        setSpeaker(payload.speaker);
        setDialogVariant(payload.dialogVariant ?? "");
        setResourceId(payload.resourceId ?? "");
        setLogId(payload.logId ?? "");
        pushLog(
          `Connected to ${payload.botName}. Voice speaker: ${payload.speaker}.${payload.dialogVariant ? ` Variant: ${payload.dialogVariant}.` : ""}${payload.resourceId ? ` Resource: ${payload.resourceId}.` : ""}`,
          "success",
        );
        return;
      }

      if (payload.type === "hello_finished") {
        setStatus(`${botNameRef.current || "The character"} finished the opening line. You can start the microphone now.`);
        pushLog("Opening line finished. You can start speaking now.", "success");
        return;
      }

      if (payload.type === "assistant_turn_finished") {
        setIsAssistantSpeaking(false);
        pushLog(`${botNameRef.current || "The character"} finished the current voice turn.`);
        return;
      }

      if (payload.type === "barge_in") {
        playbackRef.current?.clear();
        setIsAssistantSpeaking(false);
        pushLog("Assistant playback was interrupted because you started speaking.", "warn");
        return;
      }

      if (payload.type === "assistant_resumed") {
        pushLog("Assistant resumed after interruption.");
        return;
      }

      if (payload.type === "text_sent") {
        pushLog(`Text sent: ${payload.content}`);
        return;
      }

      if (payload.type === "session_finished") {
        setIsAssistantSpeaking(false);
        setStatus("Realtime session finished.");
        pushLog("Realtime upstream session finished.", "warn");
        return;
      }

      if (payload.type === "upstream_event") {
        if (typeof payload.payload === "string" && payload.payload.trim()) {
          pushLog(`Upstream event ${payload.event ?? "?"}: ${payload.payload}`);
        }
        return;
      }

      if (payload.type === "error") {
        setConnectionState("error");
        setStatus(payload.message);
        pushLog(payload.message, "error");
      }
    };

    socket.onerror = () => {
      if (!isActiveConnection(socket, connectionNonce)) {
        return;
      }

      setConnectionState("error");
      setStatus("Could not connect to the local realtime bridge.");
      pushLog("Could not connect to the local realtime bridge.", "error");
    };

    socket.onclose = () => {
      if (!isActiveConnection(socket, connectionNonce)) {
        return;
      }

      websocketRef.current = null;
      if (playbackRef.current === playback) {
        playbackRef.current = null;
        void playback.close();
      }
      setIsAssistantSpeaking(false);
      setIsMicActive(false);
      setAudioLevel(0);
      setConnectionState((current) => (current === "error" ? current : "idle"));
    };
  }

  async function startMicrophone() {
    const socket = websocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN || captureRef.current) {
      return;
    }

    captureRef.current = await createMicCapture(socket, setAudioLevel);
    setIsMicActive(true);
    setStatus("Microphone is live. Speak naturally and the audio is streamed in realtime.");
    pushLog("Microphone streaming started.", "success");
  }

  async function sendTextTurn(content: string) {
    const socket = websocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setStatus("Start the realtime session before sending text.");
      return;
    }

    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    socket.send(JSON.stringify({ type: "text", content: trimmed }));
  }

  useEffect(() => {
    return () => {
      void disconnectSession();
    };
  }, []);

  return {
    connectionState,
    isMicActive,
    isAssistantSpeaking,
    audioLevel,
    logs,
    status,
    speaker,
    dialogVariant,
    resourceId,
    logId,
    botName,
    connectSession,
    disconnectSession,
    startMicrophone,
    stopMicrophone,
    sendTextTurn,
    clearLogs() {
      setLogs([]);
    },
  };
}
