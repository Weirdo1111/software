"use client";

import { useEffect, useRef, useState } from "react";

import type { RecorderStatus, SpeakingAudioClip } from "@/components/forms/speaking/types";

const MIME_TYPE_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"] as const;

function hasRecorderSupport() {
  return typeof window !== "undefined" && typeof navigator !== "undefined" && Boolean(window.MediaRecorder) && Boolean(navigator.mediaDevices?.getUserMedia);
}

function pickSupportedAudioMimeType() {
  if (!hasRecorderSupport()) return "";
  if (typeof MediaRecorder.isTypeSupported !== "function") return "";

  return MIME_TYPE_CANDIDATES.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? "";
}

function estimateAudioLevel(analyser: AnalyserNode) {
  const data = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(data);

  let sum = 0;
  for (const value of data) {
    const normalized = (value - 128) / 128;
    sum += normalized * normalized;
  }

  return Math.min(1, Math.sqrt(sum / data.length) * 4);
}

// Date: 2026/3/18
// Author: Tianbo Cao
// Added a browser audio recorder hook so the speaking studio can capture real rehearsal audio before ASR is connected.
export function useAudioRecorder() {
  const [status, setStatus] = useState<RecorderStatus>(hasRecorderSupport() ? "idle" : "unsupported");
  const [error, setError] = useState("");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioClip, setAudioClip] = useState<SpeakingAudioClip | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickTimerRef = useRef<number | null>(null);
  const levelFrameRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const elapsedBeforePauseRef = useRef(0);
  const clipUrlRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  function clearTickTimer() {
    if (tickTimerRef.current !== null) {
      window.clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  }

  function clearLevelFrame() {
    if (levelFrameRef.current !== null) {
      window.cancelAnimationFrame(levelFrameRef.current);
      levelFrameRef.current = null;
    }
  }

  function stopStreamTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function teardownAudioMonitor() {
    clearLevelFrame();
    setAudioLevel(0);
    sourceNodeRef.current?.disconnect();
    analyserRef.current?.disconnect();
    sourceNodeRef.current = null;
    analyserRef.current = null;

    if (audioContextRef.current) {
      await audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }

  function revokeClipUrl() {
    if (clipUrlRef.current) {
      URL.revokeObjectURL(clipUrlRef.current);
      clipUrlRef.current = null;
    }
  }

  function startTickTimer() {
    clearTickTimer();

    tickTimerRef.current = window.setInterval(() => {
      const runningMs = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
      setElapsedMs(elapsedBeforePauseRef.current + runningMs);
    }, 150);
  }

  function startLevelLoop() {
    clearLevelFrame();

    const analyser = analyserRef.current;
    if (!analyser) return;

    const frame = () => {
      setAudioLevel(estimateAudioLevel(analyser));
      levelFrameRef.current = window.requestAnimationFrame(frame);
    };

    frame();
  }

  async function configureAudioMonitor(stream: MediaStream) {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const sourceNode = audioContext.createMediaStreamSource(stream);
    sourceNode.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceNodeRef.current = sourceNode;
    await audioContext.resume().catch(() => {});
    startLevelLoop();
  }

  async function startRecording() {
    if (!hasRecorderSupport()) {
      setStatus("unsupported");
      setError("This browser does not support microphone recording.");
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") return;

    setError("");
    revokeClipUrl();
    setAudioClip(null);
    setElapsedMs(0);
    setAudioLevel(0);
    elapsedBeforePauseRef.current = 0;
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const mimeType = pickSupportedAudioMimeType();
      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const recordedMimeType = mediaRecorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: recordedMimeType });
        const nextUrl = URL.createObjectURL(blob);
        revokeClipUrl();
        clipUrlRef.current = nextUrl;
        setAudioClip({
          blob,
          url: nextUrl,
          mimeType: recordedMimeType,
          durationMs: elapsedBeforePauseRef.current,
          createdAt: new Date().toISOString(),
        });
        setElapsedMs(elapsedBeforePauseRef.current);
        setStatus("stopped");
        chunksRef.current = [];
        startedAtRef.current = null;
        await teardownAudioMonitor();
        stopStreamTracks();
        mediaRecorderRef.current = null;
      };

      mediaRecorder.onerror = async () => {
        setError("Recording failed. Please retry after checking microphone permissions.");
        setStatus("error");
        clearTickTimer();
        startedAtRef.current = null;
        await teardownAudioMonitor();
        stopStreamTracks();
        mediaRecorderRef.current = null;
      };

      await configureAudioMonitor(stream);
      startedAtRef.current = Date.now();
      startTickTimer();
      mediaRecorder.start(250);
      setStatus("recording");
    } catch {
      setStatus("error");
      setError("Microphone access was blocked or unavailable.");
      clearTickTimer();
      startedAtRef.current = null;
      await teardownAudioMonitor();
      stopStreamTracks();
      mediaRecorderRef.current = null;
    }
  }

  function pauseRecording() {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state !== "recording") return;

    mediaRecorder.pause();
    if (startedAtRef.current) {
      elapsedBeforePauseRef.current += Date.now() - startedAtRef.current;
      startedAtRef.current = null;
      setElapsedMs(elapsedBeforePauseRef.current);
    }
    clearTickTimer();
    clearLevelFrame();
    setAudioLevel(0);
    setStatus("paused");
  }

  async function resumeRecording() {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state !== "paused") return;

    startedAtRef.current = Date.now();
    startTickTimer();
    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume().catch(() => {});
    }
    startLevelLoop();
    mediaRecorder.resume();
    setStatus("recording");
  }

  function stopRecording() {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state === "inactive") return;

    if (startedAtRef.current) {
      elapsedBeforePauseRef.current += Date.now() - startedAtRef.current;
      startedAtRef.current = null;
    }
    clearTickTimer();
    clearLevelFrame();
    setAudioLevel(0);
    mediaRecorder.stop();
  }

  async function resetRecording() {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.onstop = null;
      mediaRecorder.onerror = null;
      mediaRecorder.stop();
    }

    clearTickTimer();
    startedAtRef.current = null;
    elapsedBeforePauseRef.current = 0;
    chunksRef.current = [];
    revokeClipUrl();
    setAudioClip(null);
    setElapsedMs(0);
    setError("");
    await teardownAudioMonitor();
    stopStreamTracks();
    mediaRecorderRef.current = null;
    setStatus(hasRecorderSupport() ? "idle" : "unsupported");
  }

  useEffect(() => {
    return () => {
      clearTickTimer();
      clearLevelFrame();
      revokeClipUrl();
      stopStreamTracks();
      sourceNodeRef.current?.disconnect();
      analyserRef.current?.disconnect();
      if (audioContextRef.current) {
        void audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    status,
    error,
    elapsedMs,
    audioLevel,
    audioClip,
    isSupported: status !== "unsupported",
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
  };
}
