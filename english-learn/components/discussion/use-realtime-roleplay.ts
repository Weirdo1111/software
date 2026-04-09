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
  | { type: "turn_session_prepared" }
  | { type: "upstream_event"; event?: number; payload?: unknown }
  | { type: "error"; message: string; reason?: string; shouldClose?: boolean }
  | { type: "pong" };

export type RoleplayRealtimeLog = {
  id: string;
  tone: "neutral" | "success" | "warn" | "error";
  message: string;
};

export type RoleplayAssistantTurn = {
  id: string;
  text: string;
};

function normalizeTranscriptText(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

type PlaybackController = {
  enqueue: (buffer: ArrayBuffer) => void;
  clear: () => void;
  close: () => Promise<void>;
};

type CaptureController = {
  stop: () => Promise<void>;
};

type AssistantTurnResolver = {
  afterCount: number;
  resolve: (text: string) => void;
  resolveOnJson: boolean;
};

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function extractJsonLikeText(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  try {
    JSON.parse(trimmed);
    return trimmed;
  } catch {}

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return "";
  }

  const candidate = trimmed.slice(start, end + 1);
  try {
    JSON.parse(candidate);
    return candidate;
  } catch {
    return "";
  }
}

function summarizeOutboundText(content: string) {
  const trimmed = content.trim();
  if (!trimmed.startsWith("[SYSTEM CONTROL]")) {
    return `Text sent: ${trimmed}`;
  }

  if (trimmed.includes("Return one JSON object only")) {
    return "Platform scoring request sent.";
  }

  if (trimmed.includes("candidate is now answering")) {
    return "Platform switched the examiner to silent listening mode.";
  }

  if (trimmed.includes("administering question")) {
    return "Platform queued the next exam question.";
  }

  return "Platform control sent.";
}

function collectTranscriptCandidates(value: unknown, keyHint = ""): string[] {
  if (typeof value === "string") {
    const normalized = normalizeTranscriptText(value);
    if (!normalized) {
      return [];
    }

    if (
      !keyHint ||
      /(text|content|transcript|utterance|utter|result|sentence|message|display|recognized|recognition|caption)/i.test(
        keyHint,
      ) ||
      /[a-zA-Z]{3,}/.test(normalized)
    ) {
      return [normalized];
    }

    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectTranscriptCandidates(item, keyHint));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.entries(value).flatMap(([key, nestedValue]) => collectTranscriptCandidates(nestedValue, key));
}

function pickTranscriptChunk(value: unknown) {
  const candidates = collectTranscriptCandidates(value);
  if (candidates.length === 0) {
    return "";
  }

  const unique = Array.from(new Set(candidates));
  return unique.sort((left, right) => right.length - left.length)[0] ?? "";
}

function summarizeUpstreamPayload(value: unknown) {
  if (typeof value === "string") {
    return normalizeTranscriptText(value).slice(0, 220);
  }

  try {
    return JSON.stringify(value).slice(0, 220);
  } catch {
    return String(value).slice(0, 220);
  }
}

function shouldSuppressUpstreamLog(event?: number, payload?: unknown) {
  if (event === 154) {
    return true;
  }

  if (event === 459) {
    return true;
  }

  if (event === 359 && payload && typeof payload === "object") {
    return true;
  }

  return false;
}

function isIdleTimeoutBridgeError(payload: Extract<BridgeMessage, { type: "error" }>) {
  if (payload.reason === "idle_timeout") {
    return true;
  }

  return /DialogAudioIdleTimeoutError|52000042/i.test(payload.message);
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
  const bridgeConnectHelp =
    "Could not connect to the local realtime bridge. Run `npm run roleplay:bridge:setup` once, then `npm run roleplay:bridge` in another terminal, and confirm the ROLEPLAY_DIALOG_* env vars are configured on this machine.";
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [isMicActive, setIsMicActive] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [logs, setLogs] = useState<RoleplayRealtimeLog[]>([]);
  const [assistantTurns, setAssistantTurns] = useState<RoleplayAssistantTurn[]>([]);
  const [liveUserTranscript, setLiveUserTranscript] = useState("");
  const [status, setStatus] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [dialogVariant, setDialogVariant] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [logId, setLogId] = useState("");
  const [botName, setBotName] = useState("");

  const websocketRef = useRef<WebSocket | null>(null);
  const playbackRef = useRef<PlaybackController | null>(null);
  const captureRef = useRef<CaptureController | null>(null);
  const assistantTurnsRef = useRef<RoleplayAssistantTurn[]>([]);
  const currentAssistantTextRef = useRef("");
  const currentUserTranscriptRef = useRef("");
  const assistantTurnResolversRef = useRef<AssistantTurnResolver[]>([]);
  const nextTurnPreparationResolverRef = useRef<(() => void) | null>(null);
  const isAssistantAudioMutedRef = useRef(false);
  const isMicActiveRef = useRef(false);
  const botNameRef = useRef("");
  const connectionNonceRef = useRef(0);

  function isActiveConnection(socket: WebSocket, connectionNonce: number) {
    return websocketRef.current === socket && connectionNonceRef.current === connectionNonce;
  }

  function pushLog(message: string, tone: RoleplayRealtimeLog["tone"] = "neutral") {
    setLogs((current) => [...current.slice(-19), { id: nextId("log"), message, tone }]);
  }

  function resolveAssistantTurnWaiters(nextTurns: RoleplayAssistantTurn[]) {
    const pendingResolvers = assistantTurnResolversRef.current;
    if (pendingResolvers.length === 0) {
      return;
    }

    const remainingResolvers: AssistantTurnResolver[] = [];
    for (const pending of pendingResolvers) {
      if (nextTurns.length > pending.afterCount) {
        pending.resolve(nextTurns[pending.afterCount]?.text ?? "");
      } else {
        remainingResolvers.push(pending);
      }
    }

    assistantTurnResolversRef.current = remainingResolvers;
  }

  function resolveAssistantJsonWaiters() {
    const pendingJsonText = extractJsonLikeText(currentAssistantTextRef.current);
    if (!pendingJsonText) {
      return;
    }

    const pendingResolvers = assistantTurnResolversRef.current;
    if (pendingResolvers.length === 0) {
      return;
    }

    const currentTurnCount = assistantTurnsRef.current.length;
    const remainingResolvers: AssistantTurnResolver[] = [];
    for (const pending of pendingResolvers) {
      if (pending.resolveOnJson && pending.afterCount === currentTurnCount) {
        pending.resolve(pendingJsonText);
      } else {
        remainingResolvers.push(pending);
      }
    }

    assistantTurnResolversRef.current = remainingResolvers;
  }

  function finalizeAssistantTurn() {
    const nextText = currentAssistantTextRef.current.trim();
    currentAssistantTextRef.current = "";

    if (!nextText) {
      return;
    }

    const nextTurns = [...assistantTurnsRef.current, { id: nextId("assistant-turn"), text: nextText }];
    assistantTurnsRef.current = nextTurns;
    setAssistantTurns(nextTurns);
    resolveAssistantTurnWaiters(nextTurns);
  }

  function appendAssistantTextChunk(chunk: string) {
    const nextChunk = chunk.trim();
    if (!nextChunk) {
      return;
    }

    const current = currentAssistantTextRef.current;
    if (!current) {
      currentAssistantTextRef.current = chunk;
      return;
    }

    const normalizedCurrent = current.replace(/\s+/g, " ").trim();
    const normalizedChunk = nextChunk.replace(/\s+/g, " ").trim();
    if (normalizedCurrent === normalizedChunk || normalizedCurrent.includes(normalizedChunk)) {
      return;
    }

    currentAssistantTextRef.current = `${current}${chunk}`;
    resolveAssistantJsonWaiters();
  }

  function appendUserTranscriptChunk(chunk: string) {
    const nextChunk = normalizeTranscriptText(chunk);
    if (!nextChunk) {
      return;
    }

    const current = currentUserTranscriptRef.current;
    if (!current) {
      currentUserTranscriptRef.current = nextChunk;
      setLiveUserTranscript(nextChunk);
      return;
    }

    const normalizedCurrent = normalizeTranscriptText(current);
    if (normalizedCurrent === nextChunk || normalizedCurrent.includes(nextChunk)) {
      return;
    }

    if (nextChunk.includes(normalizedCurrent)) {
      currentUserTranscriptRef.current = nextChunk;
      setLiveUserTranscript(nextChunk);
      return;
    }

    const merged = `${normalizedCurrent} ${nextChunk}`.trim();
    currentUserTranscriptRef.current = merged;
    setLiveUserTranscript(merged);
  }

  async function stopMicrophone() {
    const capture = captureRef.current;
    captureRef.current = null;

    if (capture) {
      await capture.stop();
    }
    isMicActiveRef.current = false;
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
    currentAssistantTextRef.current = "";
    currentUserTranscriptRef.current = "";
    setLiveUserTranscript("");
    assistantTurnsRef.current = [];
    setAssistantTurns([]);
    for (const pending of assistantTurnResolversRef.current) {
      pending.resolve("");
    }
    assistantTurnResolversRef.current = [];
    nextTurnPreparationResolverRef.current?.();
    nextTurnPreparationResolverRef.current = null;
    isAssistantAudioMutedRef.current = false;
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
    pushLog(`Connecting to the local realtime roleplay bridge at ${bridgeUrl}.`);

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
        if (!isAssistantAudioMutedRef.current) {
          playback.enqueue(buffer);
          setIsAssistantSpeaking(true);
        }
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
        pushLog(`Connected to ${payload.botName}.`, "success");
        return;
      }

      if (payload.type === "hello_finished") {
        finalizeAssistantTurn();
        setStatus(`${botNameRef.current || "The character"} finished the opening line. You can start the microphone now.`);
        pushLog("Opening line finished. You can start speaking now.", "success");
        return;
      }

      if (payload.type === "assistant_turn_finished") {
        finalizeAssistantTurn();
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
        return;
      }

      if (payload.type === "text_sent") {
        pushLog(summarizeOutboundText(payload.content));
        return;
      }

      if (payload.type === "turn_session_prepared") {
        nextTurnPreparationResolverRef.current?.();
        nextTurnPreparationResolverRef.current = null;
        return;
      }

      if (payload.type === "session_finished") {
        setIsAssistantSpeaking(false);
        setStatus("Realtime session finished.");
        pushLog("Realtime upstream session finished.", "warn");
        return;
      }

      if (payload.type === "upstream_event") {
        if (payload.event === 550 && payload.payload && typeof payload.payload === "object" && "content" in payload.payload) {
          const chunk = typeof payload.payload.content === "string" ? payload.payload.content : "";
          appendAssistantTextChunk(chunk);
        }

        if (payload.event === 351 && payload.payload && typeof payload.payload === "object" && "text" in payload.payload) {
          const chunk = typeof payload.payload.text === "string" ? payload.payload.text : "";
          appendAssistantTextChunk(chunk);
        }

        if (isMicActiveRef.current && payload.event !== 550 && payload.event !== 351) {
          const userChunk = pickTranscriptChunk(payload.payload);
          appendUserTranscriptChunk(userChunk);

          if (payload.payload && !userChunk && !shouldSuppressUpstreamLog(payload.event, payload.payload)) {
            pushLog(`Upstream event ${payload.event ?? "?"}: ${summarizeUpstreamPayload(payload.payload)}`);
          }
        }

        if (
          typeof payload.payload === "string" &&
          payload.payload.trim() &&
          !shouldSuppressUpstreamLog(payload.event, payload.payload)
        ) {
          pushLog(`Upstream event ${payload.event ?? "?"}: ${payload.payload}`);
        }
        return;
      }

      if (payload.type === "error") {
        if (payload.shouldClose || isIdleTimeoutBridgeError(payload)) {
          await disconnectSession();
          setStatus(payload.message);
          pushLog(payload.message, "warn");
          return;
        }

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
      setStatus(bridgeConnectHelp);
      pushLog(bridgeConnectHelp, "error");
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
      isMicActiveRef.current = false;
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
    currentUserTranscriptRef.current = "";
    setLiveUserTranscript("");
    isMicActiveRef.current = true;
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

  async function prepareNextTurn() {
    const socket = websocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setStatus("Start the realtime session before moving to the next turn.");
      return;
    }

    await new Promise<void>((resolve) => {
      nextTurnPreparationResolverRef.current = resolve;
      socket.send(JSON.stringify({ type: "prepare_next_turn" }));
      window.setTimeout(() => {
        if (nextTurnPreparationResolverRef.current === resolve) {
          nextTurnPreparationResolverRef.current = null;
          resolve();
        }
      }, 1500);
    });
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
    liveUserTranscript,
    logs,
    status,
    speaker,
    dialogVariant,
    resourceId,
    logId,
    botName,
    assistantTurns,
    connectSession,
    disconnectSession,
    startMicrophone,
    stopMicrophone,
    sendTextTurn,
    prepareNextTurn,
    setAssistantAudioMuted(muted: boolean) {
      isAssistantAudioMutedRef.current = muted;
      if (muted) {
        playbackRef.current?.clear();
        setIsAssistantSpeaking(false);
      }
    },
    waitForNextAssistantTurn(
      afterCount = assistantTurnsRef.current.length,
      options?: {
        timeoutMs?: number;
        resolveOnJson?: boolean;
      },
    ) {
      const currentTurns = assistantTurnsRef.current;
      if (currentTurns.length > afterCount) {
        return Promise.resolve(currentTurns[afterCount]?.text ?? "");
      }

      if (options?.resolveOnJson) {
        const pendingJsonText = extractJsonLikeText(currentAssistantTextRef.current);
        if (pendingJsonText && currentTurns.length === afterCount) {
          return Promise.resolve(pendingJsonText);
        }
      }

      return new Promise<string>((resolve) => {
        const resolver: AssistantTurnResolver = {
          afterCount,
          resolve: (text) => {
            if (timeoutId !== null) {
              window.clearTimeout(timeoutId);
            }
            resolve(text);
          },
          resolveOnJson: options?.resolveOnJson ?? false,
        };

        let timeoutId: number | null = null;
        if ((options?.timeoutMs ?? 0) > 0) {
          timeoutId = window.setTimeout(() => {
            assistantTurnResolversRef.current = assistantTurnResolversRef.current.filter((item) => item !== resolver);
            resolve("");
          }, options?.timeoutMs);
        }

        assistantTurnResolversRef.current.push(resolver);
      });
    },
    clearLogs() {
      setLogs([]);
    },
    clearLiveUserTranscript() {
      currentUserTranscriptRef.current = "";
      setLiveUserTranscript("");
    },
  };
}
