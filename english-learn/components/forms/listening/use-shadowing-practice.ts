"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type StartListeningOptions = {
  initialText?: string;
  continuous?: boolean;
  onTranscriptChange?: (transcript: string) => void;
  fallbackLocale?: string;
  hasRetried?: boolean;
  stopOnSilence?: boolean;
};

const SILENCE_TIMEOUT_MS = 2500;

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

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  const recognitionValue =
    (window as Window & {
      SpeechRecognition?: BrowserSpeechRecognitionConstructor;
      webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
    }).SpeechRecognition ??
    (window as Window & {
      SpeechRecognition?: BrowserSpeechRecognitionConstructor;
      webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
    }).webkitSpeechRecognition;

  return typeof recognitionValue === "function" ? recognitionValue : null;
}

function joinTranscript(baseText: string, spokenText: string) {
  const normalizedBase = baseText.trim();
  const normalizedSpoken = spokenText.trim();

  if (!normalizedBase) return normalizedSpoken;
  if (!normalizedSpoken) return normalizedBase;
  return `${normalizedBase} ${normalizedSpoken}`.trim();
}

export function useShadowingPractice() {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const sessionOptionsRef = useRef<StartListeningOptions>({});
  const silenceTimerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const levelFrameRef = useRef<number | null>(null);
  const startListeningRef = useRef<(locale?: string, options?: StartListeningOptions) => void>(
    () => {},
  );
  const [status, setStatus] = useState<"idle" | "listening" | "stopped" | "error">("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const restartSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      recognitionRef.current?.stop();
    }, SILENCE_TIMEOUT_MS);
  }, [clearSilenceTimer]);

  const clearLevelFrame = useCallback(() => {
    if (levelFrameRef.current !== null) {
      window.cancelAnimationFrame(levelFrameRef.current);
      levelFrameRef.current = null;
    }
  }, []);

  const stopAudioMonitor = useCallback(async () => {
    clearLevelFrame();
    setAudioLevel(0);
    sourceNodeRef.current?.disconnect();
    analyserRef.current?.disconnect();
    sourceNodeRef.current = null;
    analyserRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (audioContextRef.current) {
      await audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, [clearLevelFrame]);

  const startAudioMonitor = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNode.connect(analyser);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceNodeRef.current = sourceNode;
      await audioContext.resume().catch(() => {});

      // Inline startLevelLoop
      clearLevelFrame();
      const frame = () => {
        setAudioLevel(estimateAudioLevel(analyser));
        levelFrameRef.current = window.requestAnimationFrame(frame);
      };
      frame();
    } catch {
      setAudioLevel(0);
    }
  }, [clearLevelFrame]);

  const startListening = useCallback(
    (locale = "en-GB", options?: StartListeningOptions) => {
      const Recognition = getSpeechRecognitionConstructor();
      const initialText = options?.initialText?.trim() ?? "";
      const stopOnSilence = options?.stopOnSilence ?? true;

      if (!Recognition) {
        setStatus("error");
        setError("Speech recognition is not available in this browser.");
        return;
      }

      recognitionRef.current?.abort();

      const recognition = new Recognition();
      recognition.continuous = options?.continuous ?? false;
      recognition.interimResults = true;
      recognition.lang = locale;
      sessionOptionsRef.current = options ?? {};

      setTranscript(initialText);
      setError("");
      setStatus("listening");
      if (stopOnSilence) {
        restartSilenceTimer();
      }
      void startAudioMonitor();

      recognition.onresult = (event) => {
        const spokenTranscript = Array.from(event.results)
          .map((result) => result[0]?.transcript ?? "")
          .join(" ")
          .trim();
        const nextTranscript = joinTranscript(initialText, spokenTranscript);

        if (stopOnSilence) {
          restartSilenceTimer();
        }
        setTranscript(nextTranscript);
        sessionOptionsRef.current.onTranscriptChange?.(nextTranscript);
      };

      recognition.onerror = (event) => {
        clearSilenceTimer();
        void stopAudioMonitor();

        if (event.error === "network" && options?.fallbackLocale && !options?.hasRetried) {
          recognitionRef.current = null;
          setError("Primary speech service did not respond. Retrying once...");
          void Promise.resolve().then(() =>
            startListeningRef.current(options.fallbackLocale, {
              ...options,
              fallbackLocale: undefined,
              hasRetried: true,
            }),
          );
          return;
        }

        setStatus("error");
        setError(
          event.error === "network"
            ? "Browser speech recognition could not reach its online service. Try Chrome or Edge, check your network, or configure a backup speech provider."
            : event.error
              ? `Speech recognition failed: ${event.error}.`
              : "Speech recognition failed.",
        );
      };

      recognition.onend = () => {
        clearSilenceTimer();
        void stopAudioMonitor();
        setStatus((current) => (current === "listening" ? "stopped" : current));
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    [clearSilenceTimer, restartSilenceTimer, startAudioMonitor, stopAudioMonitor],
  );

  // Keep ref in sync so the retry callback always calls the latest version
  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    void stopAudioMonitor();
    recognitionRef.current?.stop();
  }, [clearSilenceTimer, stopAudioMonitor]);

  const resetListening = useCallback(() => {
    clearSilenceTimer();
    void stopAudioMonitor();
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    sessionOptionsRef.current = {};
    setTranscript("");
    setError("");
    setStatus("idle");
  }, [clearSilenceTimer, stopAudioMonitor]);

  const [isSupported] = useState(() => {
    return typeof window !== "undefined" && Boolean(getSpeechRecognitionConstructor());
  });

  useEffect(() => {
    return () => {
      clearSilenceTimer();
      clearLevelFrame();
      void stopAudioMonitor();
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, [clearSilenceTimer, clearLevelFrame, stopAudioMonitor]);

  return {
    isSupported,
    status,
    transcript,
    error,
    audioLevel,
    startListening,
    stopListening,
    resetListening,
  };
}
