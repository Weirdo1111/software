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

export function useShadowingPractice() {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const [status, setStatus] = useState<"idle" | "listening" | "stopped" | "error">("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const isSupported = Boolean(getSpeechRecognitionConstructor());

  const startListening = useCallback((locale = "en-GB") => {
    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) {
      setStatus("error");
      setError("Speech recognition is not available in this browser.");
      return;
    }

    recognitionRef.current?.abort();

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = locale;

    setTranscript("");
    setError("");
    setStatus("listening");

    recognition.onresult = (event) => {
      const nextTranscript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      setTranscript(nextTranscript);
    };

    recognition.onerror = (event) => {
      setStatus("error");
      setError(event.error ? `Speech recognition failed: ${event.error}.` : "Speech recognition failed.");
    };

    recognition.onend = () => {
      setStatus((current) => (current === "listening" ? "stopped" : current));
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const resetListening = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setTranscript("");
    setError("");
    setStatus("idle");
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  return {
    isSupported,
    status,
    transcript,
    error,
    startListening,
    stopListening,
    resetListening,
  };
}
