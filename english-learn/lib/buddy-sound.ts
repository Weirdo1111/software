"use client";

type BuddySoundKind = "click" | "bounce" | "wave" | "easter" | "step";
type BuddyBgmVariant = "classic" | "bear" | "bunny" | "cat";

let audioContextRef: AudioContext | null = null;
let walkLoopTimerRef: number | null = null;
let bgmGainRef: GainNode | null = null;
let bgmLoopTimerRef: number | null = null;
let bgmVariantRef: BuddyBgmVariant = "classic";

function getAudioContext() {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) return null;
  if (!audioContextRef) {
    audioContextRef = new AudioContextClass();
  }
  return audioContextRef;
}

async function withContext(run: (context: AudioContext) => void) {
  const context = getAudioContext();
  if (!context) return false;

  if (context.state === "suspended") {
    await context.resume().catch(() => {});
  }

  if (context.state !== "running") return false;
  run(context);
  return true;
}

function playTone(
  context: AudioContext,
  {
    frequency,
    startOffset,
    duration,
    gain,
    type = "sine",
  }: {
    frequency: number;
    startOffset: number;
    duration: number;
    gain: number;
    type?: OscillatorType;
  },
) {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const startTime = context.currentTime + startOffset;
  const endTime = startTime + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(gain, startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(startTime);
  oscillator.stop(endTime);
}

export async function unlockBuddySound() {
  return withContext(() => {});
}

export function isBuddySoundEnabled() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem("english-learn:buddy-sound") !== "off";
}

export function setBuddySoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("english-learn:buddy-sound", enabled ? "on" : "off");
  if (!enabled) {
    stopBuddyBgmLoop();
  }
}

export function stopBuddyWalkLoop() {
  if (walkLoopTimerRef !== null) {
    window.clearInterval(walkLoopTimerRef);
    walkLoopTimerRef = null;
  }
}

function scheduleBuddyBgmLoop(context: AudioContext, gainNode: GainNode, variant: BuddyBgmVariant) {
  const bgmProfiles: Record<BuddyBgmVariant, { melody: number[]; bass: number[] }> = {
    classic: {
      melody: [659.25, 783.99, 880, 783.99, 698.46, 783.99],
      bass: [220, 261.63, 293.66],
    },
    bear: {
      melody: [523.25, 659.25, 698.46, 659.25, 587.33, 659.25],
      bass: [196, 220, 261.63],
    },
    bunny: {
      melody: [783.99, 880, 987.77, 880, 830.61, 880],
      bass: [261.63, 293.66, 329.63],
    },
    cat: {
      melody: [698.46, 880, 987.77, 880, 783.99, 932.33],
      bass: [246.94, 293.66, 329.63],
    },
  };

  const profile = bgmProfiles[variant];
  const startAt = context.currentTime + 0.02;

  profile.melody.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const noteGain = context.createGain();
    const noteTime = startAt + index * 0.22;
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, noteTime);
    noteGain.gain.setValueAtTime(0.0001, noteTime);
    noteGain.gain.linearRampToValueAtTime(0.11, noteTime + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.2);
    oscillator.connect(noteGain);
    noteGain.connect(gainNode);
    oscillator.start(noteTime);
    oscillator.stop(noteTime + 0.22);
  });

  profile.bass.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const noteGain = context.createGain();
    const noteTime = startAt + index * 0.44;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, noteTime);
    noteGain.gain.setValueAtTime(0.0001, noteTime);
    noteGain.gain.linearRampToValueAtTime(0.055, noteTime + 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.38);
    oscillator.connect(noteGain);
    noteGain.connect(gainNode);
    oscillator.start(noteTime);
    oscillator.stop(noteTime + 0.4);
  });

  bgmLoopTimerRef = window.setTimeout(() => {
    if (!bgmGainRef || !isBuddySoundEnabled()) {
      stopBuddyBgmLoop();
      return;
    }
    scheduleBuddyBgmLoop(context, gainNode, bgmVariantRef);
  }, 1320);
}

export function stopBuddyBgmLoop() {
  if (typeof window === "undefined") return;
  if (bgmLoopTimerRef !== null) {
    window.clearTimeout(bgmLoopTimerRef);
    bgmLoopTimerRef = null;
  }
  if (!bgmGainRef) return;

  const gainNode = bgmGainRef;
  const context = gainNode.context;
  const now = context.currentTime;
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(gainNode.gain.value, now);
  gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.24);
  window.setTimeout(() => {
    gainNode.disconnect();
  }, 280);
  bgmGainRef = null;
}

export async function startBuddyBgmLoop(variant: BuddyBgmVariant = bgmVariantRef) {
  if (typeof window === "undefined") return;
  if (!isBuddySoundEnabled()) return;

  const unlocked = await unlockBuddySound();
  if (!unlocked) return;

  const context = getAudioContext();
  if (!context) return;

  bgmVariantRef = variant;

  if (!bgmGainRef) {
    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(0.0001, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.12, context.currentTime + 0.3);
    gainNode.connect(context.destination);
    bgmGainRef = gainNode;
    scheduleBuddyBgmLoop(context, gainNode, bgmVariantRef);
    return;
  }

  if (bgmLoopTimerRef === null) {
    scheduleBuddyBgmLoop(context, bgmGainRef, bgmVariantRef);
  }
}

export async function startBuddyWalkLoop() {
  if (typeof window === "undefined") return;
  if (!isBuddySoundEnabled()) return;
  if (walkLoopTimerRef !== null) return;

  const unlocked = await unlockBuddySound();
  if (!unlocked) return;

  void playBuddySound("step");
  walkLoopTimerRef = window.setInterval(() => {
    if (!isBuddySoundEnabled()) {
      stopBuddyWalkLoop();
      return;
    }
    void playBuddySound("step");
  }, 280);
}

export async function playBuddySound(kind: BuddySoundKind) {
  return withContext((context) => {
    if (kind === "step") {
      playTone(context, { frequency: 180, startOffset: 0, duration: 0.05, gain: 0.02, type: "triangle" });
      playTone(context, { frequency: 140, startOffset: 0.04, duration: 0.06, gain: 0.015, type: "sine" });
      return;
    }

    if (kind === "click") {
      playTone(context, { frequency: 620, startOffset: 0, duration: 0.08, gain: 0.03, type: "triangle" });
      playTone(context, { frequency: 820, startOffset: 0.06, duration: 0.09, gain: 0.025, type: "sine" });
      return;
    }

    if (kind === "bounce") {
      playTone(context, { frequency: 420, startOffset: 0, duration: 0.11, gain: 0.04, type: "sine" });
      playTone(context, { frequency: 540, startOffset: 0.08, duration: 0.12, gain: 0.03, type: "triangle" });
      return;
    }

    if (kind === "wave") {
      playTone(context, { frequency: 520, startOffset: 0, duration: 0.07, gain: 0.022, type: "triangle" });
      playTone(context, { frequency: 660, startOffset: 0.08, duration: 0.07, gain: 0.02, type: "triangle" });
      return;
    }

    playTone(context, { frequency: 740, startOffset: 0, duration: 0.08, gain: 0.03, type: "triangle" });
    playTone(context, { frequency: 980, startOffset: 0.07, duration: 0.08, gain: 0.028, type: "triangle" });
    playTone(context, { frequency: 1240, startOffset: 0.14, duration: 0.1, gain: 0.024, type: "sine" });
  });
}
