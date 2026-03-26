"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function formatSpeechText(text: string) {
  return text.replace(/\n+/g, " ").replace(/Follow-up:/g, "Follow-up question:").trim();
}

function getPreferredVoice() {
  if (typeof window === "undefined" || typeof window.speechSynthesis === "undefined") {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ?? voices[0] ?? null;
}

export function useBrowserSpeech() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopPlayback = useCallback(() => {
    if (typeof window === "undefined" || typeof window.speechSynthesis === "undefined") {
      return;
    }

    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setPlayingId(null);
  }, []);

  const playMessage = useCallback((messageId: string, text: string) => {
    if (
      typeof window === "undefined" ||
      typeof window.speechSynthesis === "undefined" ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      setPlaybackStatus("Browser speech playback is not available here.");
      return;
    }

    const speechText = formatSpeechText(text);
    if (!speechText) {
      setPlaybackStatus("The AI reply is empty, so there is nothing to play.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(speechText);
    const voice = getPreferredVoice();

    utterance.voice = voice;
    utterance.lang = voice?.lang ?? "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onend = () => {
      setPlayingId((currentId) => (currentId === messageId ? null : currentId));
    };
    utterance.onerror = () => {
      setPlayingId(null);
      setPlaybackStatus("Could not play the AI reply.");
    };

    utteranceRef.current = utterance;
    setPlaybackStatus("");
    setPlayingId(messageId);
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    playingId,
    playbackStatus,
    playMessage,
    stopPlayback,
  };
}
