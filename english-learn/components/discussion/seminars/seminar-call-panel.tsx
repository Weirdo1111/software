"use client";

import {
  AlertCircle,
  LoaderCircle,
  Mic,
  MicOff,
  PhoneOff,
  RadioTower,
  Video,
  VideoOff,
} from "lucide-react";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import type { SeminarRoomCallParticipant, SeminarRoomCallSignal, SeminarRoomCallState } from "@/components/discussion/seminar-types";
import type { Locale } from "@/components/discussion/types";

const rtcConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
  ],
};

type RemoteTile = SeminarRoomCallParticipant & {
  stream: MediaStream | null;
};

type CallViewMode = "focus" | "grid";
type TileScale = "sm" | "md" | "lg";

const tileScaleClasses: Record<TileScale, { stage: string; thumb: string; grid: string }> = {
  sm: {
    stage: "h-72 sm:h-[22rem]",
    thumb: "h-28",
    grid: "h-44",
  },
  md: {
    stage: "h-80 sm:h-[28rem]",
    thumb: "h-32",
    grid: "h-52",
  },
  lg: {
    stage: "h-[24rem] sm:h-[34rem]",
    thumb: "h-40",
    grid: "h-64",
  },
};

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `seminar-${Math.random().toString(36).slice(2, 14)}`;
}

function readErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function participantInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function SeminarCallPanel({
  locale,
  roomId,
  enabled,
}: {
  locale: Locale;
  roomId: string;
  enabled: boolean;
}) {
  const [participants, setParticipants] = useState<SeminarRoomCallParticipant[]>([]);
  const [remoteTiles, setRemoteTiles] = useState<RemoteTile[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [streamError, setStreamError] = useState("");
  const [viewMode, setViewMode] = useState<CallViewMode>("focus");
  const [tileScale, setTileScale] = useState<TileScale>("md");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRefs = useRef(new Map<string, HTMLVideoElement>());
  const peerConnectionsRef = useRef(new Map<string, RTCPeerConnection>());
  const remoteStreamsRef = useRef(new Map<string, MediaStream>());
  const pendingCandidatesRef = useRef(new Map<string, RTCIceCandidateInit[]>());
  const makingOfferRef = useRef(new Set<string>());
  const offeredPeersRef = useRef(new Set<string>());
  const lastSignalIdRef = useRef<string | undefined>(undefined);
  const processedSignalIdsRef = useRef(new Set<string>());
  const participantsRef = useRef<SeminarRoomCallParticipant[]>([]);
  const joinedRef = useRef(false);
  const audioEnabledRef = useRef(true);
  const videoEnabledRef = useRef(true);
  const presenceSyncInFlightRef = useRef(false);

  const text = {
    zh: {
      title: "语音 / 视频研讨",
      subtitle: "轻量会议层直接嵌在房间里，适合小规模 seminar rehearsal 与口语讨论。",
      live: "通话进行中",
      ready: "准备加入",
      joinVideo: "加入视频",
      joinAudio: "仅语音加入",
      leave: "离开会议",
      microphone: "麦克风",
      camera: "摄像头",
      noCameraTrack: "当前是语音模式，重新以视频方式加入即可开启摄像头。",
      waiting: "当前还没有其他参与者。",
      permissionError: "无法获取麦克风或摄像头权限。",
      joinError: "加入会议失败。",
      syncError: "会议状态同步失败。",
      tiles: "参会者",
      self: "你",
      audioOnly: "Audio only",
      hiddenVideo: "Camera off",
      disabled: "该房间当前不能开启实时会议。",
      connectedCount: "在线连接",
      connecting: "连接中...",
      on: "开启",
      off: "关闭",
      focusView: "聚焦视图",
      gridView: "多人网格",
      tileSize: "画面尺寸",
      small: "S",
      medium: "M",
      large: "L",
      stage: "主画面",
      filmstrip: "缩略条",
      participantsHint: "点击成员可切换主画面。",
      videoPending: "Connecting video",
    },
    en: {
      title: "Voice / Video Session",
      subtitle: "A lightweight meeting layer inside the room for small seminar rehearsals and spoken discussion.",
      live: "Call live",
      ready: "Ready to join",
      joinVideo: "Join with video",
      joinAudio: "Join audio only",
      leave: "Leave call",
      microphone: "Microphone",
      camera: "Camera",
      noCameraTrack: "This session started in audio mode. Rejoin with video to enable the camera.",
      waiting: "No other participants are connected yet.",
      permissionError: "Camera or microphone permission was not granted.",
      joinError: "Failed to join the call.",
      syncError: "Failed to sync the live call.",
      tiles: "Participants",
      self: "You",
      audioOnly: "Audio only",
      hiddenVideo: "Camera off",
      disabled: "This room cannot start live calls right now.",
      connectedCount: "Connected",
      connecting: "Connecting...",
      on: "On",
      off: "Off",
      focusView: "Focus view",
      gridView: "Grid view",
      tileSize: "Tile size",
      small: "S",
      medium: "M",
      large: "L",
      stage: "Main stage",
      filmstrip: "Filmstrip",
      participantsHint: "Select a participant to move them to the main stage.",
      videoPending: "Connecting video",
    },
  }[locale];

  function syncRemoteTiles(nextParticipants = participantsRef.current) {
    const tiles = nextParticipants
      .filter((participant) => !participant.isSelf)
      .map((participant) => ({
        ...participant,
        stream: remoteStreamsRef.current.get(participant.sessionId) ?? null,
      }));

    setRemoteTiles(tiles);
  }

  function attachVideoElement(element: HTMLVideoElement | null, stream: MediaStream | null) {
    if (!element) return;
    if (element.srcObject !== stream) {
      element.srcObject = stream;
    }
  }

  function cleanupPeer(remoteSessionId: string) {
    const peer = peerConnectionsRef.current.get(remoteSessionId);
    if (peer) {
      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.onconnectionstatechange = null;
      peer.close();
      peerConnectionsRef.current.delete(remoteSessionId);
    }

    offeredPeersRef.current.delete(remoteSessionId);
    makingOfferRef.current.delete(remoteSessionId);
    pendingCandidatesRef.current.delete(remoteSessionId);
    remoteStreamsRef.current.delete(remoteSessionId);
    remoteVideoRefs.current.delete(remoteSessionId);
    syncRemoteTiles();
  }

  async function sendSignal(toSessionId: string, kind: SeminarRoomCallSignal["kind"], payload: unknown) {
    const sessionId = sessionIdRef.current;

    if (!sessionId) {
      return;
    }

    const response = await fetch(`/api/discussion/seminars/rooms/${roomId}/call/signal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        toSessionId,
        kind,
        payload,
      }),
    });

    if (!response.ok) {
      const payload = await readJson<{ error?: string }>(response);
      throw new Error(payload?.error ?? text.syncError);
    }
  }

  async function flushPendingCandidates(remoteSessionId: string) {
    const peer = peerConnectionsRef.current.get(remoteSessionId);
    const pending = pendingCandidatesRef.current.get(remoteSessionId) ?? [];

    if (!peer || !peer.remoteDescription || pending.length === 0) {
      return;
    }

    pendingCandidatesRef.current.delete(remoteSessionId);

    for (const candidate of pending) {
      await peer.addIceCandidate(candidate);
    }
  }

  function ensurePeerConnection(remoteSessionId: string) {
    const existing = peerConnectionsRef.current.get(remoteSessionId);

    if (existing) {
      return existing;
    }

    const peer = new RTCPeerConnection(rtcConfig);
    peerConnectionsRef.current.set(remoteSessionId, peer);

    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });
    }

    peer.onicecandidate = (event) => {
      if (!event.candidate) {
        return;
      }

      void sendSignal(remoteSessionId, "ice-candidate", event.candidate.toJSON()).catch((signalError) => {
        setError(readErrorMessage(signalError, text.syncError));
      });
    };

    peer.ontrack = (event) => {
      const nextStream = event.streams[0] ?? new MediaStream([event.track]);
      remoteStreamsRef.current.set(remoteSessionId, nextStream);
      syncRemoteTiles();
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "failed" || peer.connectionState === "closed") {
        cleanupPeer(remoteSessionId);
      }
    };

    return peer;
  }

  async function createOffer(remoteSessionId: string) {
    const sessionId = sessionIdRef.current;

    if (!sessionId || offeredPeersRef.current.has(remoteSessionId)) {
      return;
    }

    const peer = ensurePeerConnection(remoteSessionId);
    makingOfferRef.current.add(remoteSessionId);

    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      offeredPeersRef.current.add(remoteSessionId);
      await sendSignal(remoteSessionId, "offer", peer.localDescription?.toJSON() ?? offer);
    } finally {
      makingOfferRef.current.delete(remoteSessionId);
    }
  }

  async function handleIncomingSignal(signal: SeminarRoomCallSignal) {
    const selfSessionId = sessionIdRef.current;

    if (!selfSessionId) {
      return;
    }

    const peer = ensurePeerConnection(signal.fromSessionId);

    if (signal.kind === "ice-candidate") {
      const candidate = signal.payload as RTCIceCandidateInit;

      if (peer.remoteDescription) {
        await peer.addIceCandidate(candidate);
      } else {
        const queue = pendingCandidatesRef.current.get(signal.fromSessionId) ?? [];
        queue.push(candidate);
        pendingCandidatesRef.current.set(signal.fromSessionId, queue);
      }
      return;
    }

    const description = signal.payload as RTCSessionDescriptionInit;
    const polite = selfSessionId > signal.fromSessionId;
    const offerCollision =
      description.type === "offer" &&
      (makingOfferRef.current.has(signal.fromSessionId) || peer.signalingState !== "stable");

    if (offerCollision && !polite) {
      return;
    }

    if (offerCollision) {
      try {
        await peer.setLocalDescription({ type: "rollback" });
      } catch {
        // Ignore rollback failures and let the next sync retry.
      }
    }

    await peer.setRemoteDescription(description);
    await flushPendingCandidates(signal.fromSessionId);

    if (description.type === "offer") {
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      await sendSignal(signal.fromSessionId, "answer", peer.localDescription?.toJSON() ?? answer);
    }
  }

  async function reconcileParticipants(nextParticipants: SeminarRoomCallParticipant[]) {
    const selfSessionId = sessionIdRef.current;

    if (!selfSessionId) {
      return;
    }

    const liveRemoteIds = new Set(nextParticipants.filter((participant) => !participant.isSelf).map((participant) => participant.sessionId));

    Array.from(peerConnectionsRef.current.keys()).forEach((remoteSessionId) => {
      if (!liveRemoteIds.has(remoteSessionId)) {
        cleanupPeer(remoteSessionId);
      }
    });

    for (const participant of nextParticipants) {
      if (participant.isSelf) {
        continue;
      }

      if (!peerConnectionsRef.current.has(participant.sessionId) && selfSessionId < participant.sessionId) {
        await createOffer(participant.sessionId);
      }
    }
  }

  async function applyCallState(state: SeminarRoomCallState) {
    participantsRef.current = state.participants;
    setParticipants(state.participants);
    syncRemoteTiles(state.participants);

    const unseenSignals = state.signals.filter((signal) => !processedSignalIdsRef.current.has(signal.id));

    if (state.signals.length > 0) {
      lastSignalIdRef.current = state.signals.at(-1)?.id;
    }

    unseenSignals.forEach((signal) => {
      processedSignalIdsRef.current.add(signal.id);
    });

    await reconcileParticipants(state.participants);

    for (const signal of unseenSignals) {
      await handleIncomingSignal(signal);
    }
  }

  const leaveCall = useCallback(async (notifyServer = true) => {
    const sessionId = sessionIdRef.current;

    sessionIdRef.current = null;
    lastSignalIdRef.current = undefined;
    processedSignalIdsRef.current.clear();
    presenceSyncInFlightRef.current = false;
    joinedRef.current = false;
    participantsRef.current = [];
    setParticipants([]);
    setRemoteTiles([]);
    setJoined(false);
    setStatusMessage("");

    Array.from(peerConnectionsRef.current.entries()).forEach(([remoteSessionId, peer]) => {
      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.onconnectionstatechange = null;
      peer.close();
      peerConnectionsRef.current.delete(remoteSessionId);
      offeredPeersRef.current.delete(remoteSessionId);
      makingOfferRef.current.delete(remoteSessionId);
      pendingCandidatesRef.current.delete(remoteSessionId);
      remoteStreamsRef.current.delete(remoteSessionId);
      remoteVideoRefs.current.delete(remoteSessionId);
    });
    syncRemoteTiles([]);

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);

    if (!notifyServer || !sessionId) {
      return;
    }

    try {
      await fetch(`/api/discussion/seminars/rooms/${roomId}/call/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
        }),
        keepalive: true,
      });
    } catch {
      // Ignore best-effort leave failures.
    }
  }, [roomId]);

  const syncPresence = useEffectEvent(async () => {
    const sessionId = sessionIdRef.current;

    if (!joinedRef.current || !sessionId || presenceSyncInFlightRef.current) {
      return;
    }

    presenceSyncInFlightRef.current = true;

    try {
      const response = await fetch(`/api/discussion/seminars/rooms/${roomId}/call/presence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          afterSignalId: lastSignalIdRef.current,
          audioEnabled: audioEnabledRef.current,
          videoEnabled: videoEnabledRef.current,
        }),
      });

      const payload = await readJson<SeminarRoomCallState | { error?: string }>(response);

      if (!response.ok || !payload || !("sessionId" in payload)) {
        throw new Error(payload && "error" in payload && payload.error ? payload.error : text.syncError);
      }

      await applyCallState(payload);
    } finally {
      presenceSyncInFlightRef.current = false;
    }
  });

  async function joinCall(mode: "video" | "audio") {
    if (!enabled || joining) {
      return;
    }

    setJoining(true);
    setError("");
    setStreamError("");

    try {
      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: mode === "video",
        });
      } catch (permissionError) {
        if (mode === "video") {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
          setStreamError(text.permissionError);
        } else {
          throw permissionError;
        }
      }

      const nextSessionId = createSessionId();
      const nextAudioEnabled = stream.getAudioTracks().some((track) => track.enabled);
      const nextVideoEnabled = stream.getVideoTracks().some((track) => track.enabled);

      localStreamRef.current = stream;
      setLocalStream(stream);
      setAudioEnabled(nextAudioEnabled);
      setVideoEnabled(nextVideoEnabled);
      audioEnabledRef.current = nextAudioEnabled;
      videoEnabledRef.current = nextVideoEnabled;
      processedSignalIdsRef.current.clear();
      presenceSyncInFlightRef.current = false;
      sessionIdRef.current = nextSessionId;
      joinedRef.current = true;

      const response = await fetch(`/api/discussion/seminars/rooms/${roomId}/call/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: nextSessionId,
          audioEnabled: nextAudioEnabled,
          videoEnabled: nextVideoEnabled,
        }),
      });

      const payload = await readJson<SeminarRoomCallState | { error?: string }>(response);

      if (!response.ok || !payload || !("sessionId" in payload)) {
        throw new Error(payload && "error" in payload && payload.error ? payload.error : text.joinError);
      }

      setJoined(true);
      setStatusMessage(text.live);
      await applyCallState(payload);
    } catch (joinError) {
      await leaveCall(false);
      setError(readErrorMessage(joinError, text.joinError));
    } finally {
      setJoining(false);
    }
  }

  async function toggleAudio() {
    const stream = localStreamRef.current;
    const track = stream?.getAudioTracks()[0];

    if (!track) {
      return;
    }

    const nextEnabled = !track.enabled;
    track.enabled = nextEnabled;
    audioEnabledRef.current = nextEnabled;
    setAudioEnabled(nextEnabled);
  }

  async function toggleVideo() {
    const stream = localStreamRef.current;
    const track = stream?.getVideoTracks()[0];

    if (!track) {
      setStreamError(text.noCameraTrack);
      return;
    }

    const nextEnabled = !track.enabled;
    track.enabled = nextEnabled;
    videoEnabledRef.current = nextEnabled;
    setVideoEnabled(nextEnabled);
  }

  useEffect(() => {
    attachVideoElement(localVideoRef.current, localStream);
  }, [localStream]);

  useEffect(() => {
    remoteTiles.forEach((tile) => {
      const element = remoteVideoRefs.current.get(tile.sessionId) ?? null;
      attachVideoElement(element, tile.stream);
    });
  }, [remoteTiles]);

  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  useEffect(() => {
    videoEnabledRef.current = videoEnabled;
  }, [videoEnabled]);

  useEffect(() => {
    if (!enabled) {
      void leaveCall();
    }
  }, [enabled, leaveCall]);

  useEffect(() => {
    if (!joined) {
      return;
    }

    let cancelled = false;

    const tick = async () => {
      try {
        await syncPresence();
        if (!cancelled) {
          setError("");
        }
      } catch (syncError) {
        if (!cancelled) {
          setError(readErrorMessage(syncError, text.syncError));
        }
      }
    };

    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, 2_500);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [joined, roomId, text.syncError]);

  useEffect(() => {
    return () => {
      void leaveCall();
    };
  }, [leaveCall]);

  const selfParticipant = useMemo(
    () => participants.find((participant) => participant.isSelf) ?? null,
    [participants],
  );
  const selfTile = useMemo(
    () => (selfParticipant ? { ...selfParticipant, stream: localStream } : null),
    [localStream, selfParticipant],
  );
  const allTiles = useMemo(
    () => (selfTile ? [selfTile, ...remoteTiles] : remoteTiles),
    [remoteTiles, selfTile],
  );
  const spotlightTile = useMemo(
    () =>
      allTiles.find((participant) => participant.sessionId === activeSessionId) ??
      remoteTiles[0] ??
      selfTile ??
      null,
    [activeSessionId, allTiles, remoteTiles, selfTile],
  );
  const filmstripTiles = useMemo(
    () =>
      spotlightTile
        ? allTiles.filter((participant) => participant.sessionId !== spotlightTile.sessionId)
        : allTiles,
    [allTiles, spotlightTile],
  );
  const connectedCount = participants.length;

  useEffect(() => {
    const available = new Set(allTiles.map((participant) => participant.sessionId));

    setActiveSessionId((current) => {
      if (current && available.has(current)) {
        return current;
      }

      return remoteTiles[0]?.sessionId ?? selfTile?.sessionId ?? null;
    });
  }, [allTiles, remoteTiles, selfTile]);

  function renderVideoTile(
    participant: RemoteTile,
    options: {
      heightClass: string;
      featured?: boolean;
      interactive?: boolean;
    },
  ) {
    const showingVideo = Boolean(participant.stream) && participant.videoEnabled;

    return (
      <button
        key={participant.sessionId}
        type="button"
        onClick={options.interactive ? () => setActiveSessionId(participant.sessionId) : undefined}
        className={`relative overflow-hidden rounded-[1.7rem] border border-[rgba(31,58,98,0.08)] bg-[linear-gradient(180deg,#18243b,#223251)] p-3 text-left text-white shadow-[0_16px_32px_rgba(18,31,55,0.18)] ${
          options.interactive ? "transition hover:translate-y-[-1px]" : ""
        } ${options.featured ? "ring-1 ring-white/18" : ""}`}
      >
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
          <span className="truncate">
            {participant.displayName}
            {participant.isSelf ? ` · ${text.self}` : ""}
          </span>
          <span>{participant.videoEnabled ? "Video" : text.audioOnly}</span>
        </div>
        <div className={`relative overflow-hidden rounded-[1.2rem] bg-black/20 ${options.heightClass}`}>
          {participant.isSelf ? (
            <video
              ref={(element) => {
                localVideoRef.current = element;
                attachVideoElement(element, participant.stream);
              }}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${showingVideo ? "opacity-100" : "opacity-0"}`}
            />
          ) : (
            <video
              ref={(element) => {
                if (element) {
                  remoteVideoRefs.current.set(participant.sessionId, element);
                  attachVideoElement(element, participant.stream);
                } else {
                  remoteVideoRefs.current.delete(participant.sessionId);
                }
              }}
              autoPlay
              playsInline
              className={`h-full w-full object-cover ${showingVideo ? "opacity-100" : "opacity-0"}`}
            />
          )}
          <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 ${showingVideo ? "pointer-events-none opacity-0" : "opacity-100"}`}>
            <div className={`${options.featured ? "size-20 text-lg" : "size-16 text-base"} flex items-center justify-center rounded-full bg-white/10 font-semibold`}>
              {participantInitials(participant.displayName)}
            </div>
            <div className="text-sm text-white/78">
              {participant.videoEnabled ? text.videoPending : text.hiddenVideo}
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <section className="rounded-[2rem] border border-[rgba(31,58,98,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,249,255,0.92))] p-5 shadow-[0_24px_60px_rgba(31,58,98,0.08)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(49,76,122,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            <RadioTower className="size-3.5" />
            {joined ? text.live : text.ready}
          </div>
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-[var(--ink)] sm:text-2xl">{text.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">{text.subtitle}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.25rem] border border-[rgba(31,58,98,0.08)] bg-white/82 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              {text.connectedCount}
            </div>
            <div className="mt-2 text-lg font-semibold text-[var(--ink)]">{connectedCount}</div>
          </div>
          <div className="rounded-[1.25rem] border border-[rgba(31,58,98,0.08)] bg-white/82 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              {text.microphone}
            </div>
            <div className="mt-2 text-sm font-semibold text-[var(--ink)]">
              {audioEnabled && joined ? text.on : text.off}
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-[rgba(31,58,98,0.08)] bg-white/82 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              {text.camera}
            </div>
            <div className="mt-2 text-sm font-semibold text-[var(--ink)]">
              {videoEnabled && joined ? text.on : text.off}
            </div>
          </div>
        </div>
      </div>

      {!enabled ? (
        <div className="mt-5 rounded-[1.4rem] border border-[rgba(255,190,73,0.3)] bg-[rgba(255,248,225,0.72)] px-4 py-3 text-sm text-[#7b5d1a]">
          {text.disabled}
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 flex items-start gap-3 rounded-[1.4rem] border border-[rgba(255,143,129,0.28)] bg-[rgba(255,244,242,0.84)] px-4 py-3 text-sm text-[#92443a]">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {streamError ? (
        <div className="mt-3 rounded-[1.2rem] border border-[rgba(49,76,122,0.08)] bg-[rgba(248,251,255,0.86)] px-4 py-3 text-sm text-[var(--ink-soft)]">
          {streamError}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-[rgba(31,58,98,0.08)] bg-white/72 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {([
            ["focus", text.focusView],
            ["grid", text.gridView],
          ] as Array<[CallViewMode, string]>).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setViewMode(value)}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                viewMode === value
                  ? "bg-[var(--navy)] text-white shadow-[0_10px_24px_rgba(31,58,98,0.16)]"
                  : "border border-[rgba(31,58,98,0.08)] bg-white/82 text-[var(--ink)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">{text.tileSize}</span>
          {([
            ["sm", text.small],
            ["md", text.medium],
            ["lg", text.large],
          ] as Array<[TileScale, string]>).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTileScale(value)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                tileScale === value
                  ? "bg-[rgba(49,76,122,0.12)] text-[var(--navy)]"
                  : "text-[var(--ink-soft)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.85fr)]">
        <div className="space-y-4">
          {viewMode === "focus" ? (
            <>
              <div className="rounded-[1.7rem] border border-[rgba(31,58,98,0.08)] bg-[radial-gradient(circle_at_top,rgba(112,143,255,0.18),rgba(255,255,255,0.12)_55%),linear-gradient(180deg,#11192a,#1b2842)] p-4 text-white shadow-[0_18px_40px_rgba(16,28,54,0.22)]">
                <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  <span>{text.stage}</span>
                  <span>{statusMessage || text.ready}</span>
                </div>
                {spotlightTile ? (
                  renderVideoTile(spotlightTile, {
                    heightClass: tileScaleClasses[tileScale].stage,
                    featured: true,
                  })
                ) : (
                  <div className="flex min-h-56 flex-col items-center justify-center rounded-[1.3rem] border border-dashed border-white/15 bg-white/5 px-6 text-center text-sm text-white/76">
                    <div className="flex size-14 items-center justify-center rounded-full bg-white/10">
                      <RadioTower className="size-6" />
                    </div>
                    <p className="mt-4 max-w-xs leading-6">{text.waiting}</p>
                  </div>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-[rgba(31,58,98,0.08)] bg-white/82 p-4 shadow-[0_12px_28px_rgba(31,58,98,0.05)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                    {text.filmstrip}
                  </div>
                  <div className="text-xs text-[var(--ink-soft)]">{text.participantsHint}</div>
                </div>
                {filmstripTiles.length === 0 ? (
                  <div className="rounded-[1.2rem] border border-dashed border-[rgba(31,58,98,0.14)] bg-[rgba(248,251,255,0.86)] px-4 py-8 text-center text-sm text-[var(--ink-soft)]">
                    {text.waiting}
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filmstripTiles.map((participant) =>
                      renderVideoTile(participant, {
                        heightClass: tileScaleClasses[tileScale].thumb,
                        interactive: true,
                        featured: participant.sessionId === activeSessionId,
                      }),
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-[1.7rem] border border-[rgba(31,58,98,0.08)] bg-[linear-gradient(180deg,#11192a,#1b2842)] p-4 text-white shadow-[0_18px_40px_rgba(16,28,54,0.22)]">
              <div className="mb-4 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                <span>{text.gridView}</span>
                <span>{statusMessage || text.ready}</span>
              </div>
              {allTiles.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center rounded-[1.3rem] border border-dashed border-white/15 bg-white/5 px-6 text-center text-sm text-white/76">
                  <div className="flex size-14 items-center justify-center rounded-full bg-white/10">
                    <RadioTower className="size-6" />
                  </div>
                  <p className="mt-4 max-w-xs leading-6">{text.waiting}</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {allTiles.map((participant) =>
                    renderVideoTile(participant, {
                      heightClass: tileScaleClasses[tileScale].grid,
                      interactive: true,
                      featured: participant.sessionId === activeSessionId,
                    }),
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-[1.7rem] border border-[rgba(31,58,98,0.08)] bg-white/82 p-4 shadow-[0_14px_28px_rgba(31,58,98,0.05)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            {text.tiles}
          </div>
          <div className="mt-2 text-sm text-[var(--ink-soft)]">{text.participantsHint}</div>
          <div className="mt-4 space-y-3">
            {participants.map((participant) => (
              <button
                key={participant.sessionId}
                type="button"
                onClick={() => setActiveSessionId(participant.sessionId)}
                className={`flex w-full items-center justify-between rounded-[1.15rem] border px-4 py-3 text-left transition ${
                  activeSessionId === participant.sessionId
                    ? "border-[rgba(49,76,122,0.22)] bg-[rgba(232,240,255,0.9)]"
                    : "border-[rgba(31,58,98,0.08)] bg-[rgba(248,251,255,0.86)]"
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--ink)]">
                    {participant.displayName}
                    {participant.isSelf ? ` · ${text.self}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[var(--ink-soft)]">
                  {participant.audioEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
                  {participant.videoEnabled ? <Video className="size-4" /> : <VideoOff className="size-4" />}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3">
            {!joined ? (
              <>
                <button
                  type="button"
                  onClick={() => void joinCall("video")}
                  disabled={!enabled || joining}
                  className="party-button w-full justify-center disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {joining ? <LoaderCircle className="size-4 animate-spin" /> : <Video className="size-4" />}
                  {joining ? text.connecting : text.joinVideo}
                </button>
                <button
                  type="button"
                  onClick={() => void joinCall("audio")}
                  disabled={!enabled || joining}
                  className="party-button-ghost w-full justify-center disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Mic className="size-4" />
                  {text.joinAudio}
                </button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => void toggleAudio()}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(31,58,98,0.08)] bg-[rgba(248,251,255,0.9)] px-4 py-3 text-sm font-semibold text-[var(--ink)]"
                  >
                    {audioEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
                    {text.microphone}
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleVideo()}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(31,58,98,0.08)] bg-[rgba(248,251,255,0.9)] px-4 py-3 text-sm font-semibold text-[var(--ink)]"
                  >
                    {videoEnabled ? <Video className="size-4" /> : <VideoOff className="size-4" />}
                    {text.camera}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void leaveCall()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(255,143,129,0.35)] bg-[rgba(255,143,129,0.1)] px-4 py-3 text-sm font-semibold text-[#92443a]"
                >
                  <PhoneOff className="size-4" />
                  {text.leave}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
