"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef, useState } from "react";
import { ArrowLeft, Expand, Minimize2, ScanFace, Timer, TimerOff, Trophy } from "lucide-react";

import { AudioPuzzleModal } from "@/components/escape-room/AudioPuzzleModal";
import { BriefingScene } from "@/components/escape-room/BriefingScene";
import { ClueModal } from "@/components/escape-room/ClueModal";
import { DeskPuzzleModal } from "@/components/escape-room/DeskPuzzleModal";
import { ExitGateScene } from "@/components/escape-room/ExitGateScene";
import { GameResultScreen } from "@/components/escape-room/GameResultScreen";
import { GameSidebar } from "@/components/escape-room/GameSidebar";
import { KeypadModal } from "@/components/escape-room/KeypadModal";
import { RewardModal } from "@/components/escape-room/RewardModal";
import { RoomScene } from "@/components/escape-room/RoomScene";
import { SceneRail } from "@/components/escape-room/SceneRail";
import {
  BOOKSHELF_CLUE,
  BOOKSHELF_NOTE,
  clueModalContent,
  DESK_KEY_ITEM,
  DESK_NOTE,
  ESCAPE_ROOM_ATTEMPT_LIMIT,
  ESCAPE_ROOM_CODE,
  ESCAPE_ROOM_COUNTDOWN_SECONDS,
  FLOOR_MAP_CLUE,
  FLOOR_MAP_NOTE,
  NOTICE_BOARD_CLUE,
  NOTICE_BOARD_NOTE,
  PROCEDURE_CARD_ITEM,
  progressTasks,
  RESHELVING_SLIP_ITEM,
  RETURN_CART_CLUE,
  RETURN_CART_NOTE,
  roomObjects,
  speakerPuzzle,
  circulationDeskPuzzle,
  SPEAKER_NOTE,
} from "@/components/escape-room/room-data";
import { createInitialGameProgress, escapeRoomReducer, getCompletionPercent, hasItem, isReadyToUnlock, tryUnlockDoor } from "@/components/escape-room/puzzle-engine";
import { formatGameTime, getTimeRank } from "@/components/escape-room/time-utils";
import { useEscapeTimer } from "@/components/escape-room/use-escape-timer";
import type { ModalType, RoomObjectId, SceneId } from "@/components/escape-room/types";
import type { Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

const missingLabelByTask = {
  "notice-board": "closing memo",
  "return-cart": "reshelving slip",
  bookshelf: "history shelf and key",
  "circulation-desk": "procedure card",
  speaker: "PA order",
  "floor-map": "keypad format",
} as const;

function playAudioCue(element: HTMLAudioElement | null) {
  if (!element) {
    return;
  }

  try {
    element.currentTime = 0;
    void element.play();
  } catch {
    // Ignore autoplay restrictions until the user interacts again.
  }
}

export function EscapeRoomGame({ locale }: { locale: Locale }) {
  const [progress, dispatch] = useReducer(escapeRoomReducer, undefined, createInitialGameProgress);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [activeClueObjectId, setActiveClueObjectId] = useState<"notice-board" | "bookshelf" | "floor-map" | "return-cart" | null>(null);
  const [doorFeedback, setDoorFeedback] = useState<string | null>(null);
  const [scene, setScene] = useState<SceneId>("briefing");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameViewportRef = useRef<HTMLElement | null>(null);
  const sceneAudioRef = useRef<HTMLAudioElement | null>(null);
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const failureAudioRef = useRef<HTMLAudioElement | null>(null);
  const warningAudioRef = useRef<HTMLAudioElement | null>(null);
  const modalAudioRef = useRef<HTMLAudioElement | null>(null);
  const sceneRef = useRef<SceneId>("briefing");
  const resultRef = useRef<"success" | "failed" | null>(null);
  const warningMarksRef = useRef(new Set<number>());
  const modalRef = useRef<ModalType | null>(null);

  const { elapsedSeconds, bestSeconds, remainingSeconds, expired, resetTimer } = useEscapeTimer({
    started: progress.started,
    escaped: progress.reward.escaped,
    durationSeconds: ESCAPE_ROOM_COUNTDOWN_SECONDS,
  });

  const copy = {
    back: "Back to Game Center",
    stage: "Midnight Library Escape",
    fullscreen: "Full screen",
    exitFullscreen: "Exit full screen",
    timer: "Time left",
    runtime: "Run time",
    best: "Best",
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === gameViewportRef.current);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    onFullscreenChange();

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current === scene) {
      return;
    }

    playAudioCue(sceneAudioRef.current);
    sceneRef.current = scene;
  }, [scene]);

  const readyToUnlock = isReadyToUnlock(progress);
  const attemptFailure = !progress.reward.escaped && progress.keypadAttempts >= ESCAPE_ROOM_ATTEMPT_LIMIT;
  const failureReason: "timer" | "attempts" | null = attemptFailure ? "attempts" : expired ? "timer" : null;

  useEffect(() => {
    if (!progress.started || progress.reward.escaped) {
      return;
    }

    if (![60, 30, 10].includes(remainingSeconds) || warningMarksRef.current.has(remainingSeconds)) {
      return;
    }

    warningMarksRef.current.add(remainingSeconds);
    playAudioCue(warningAudioRef.current);
  }, [progress.reward.escaped, progress.started, remainingSeconds]);

  useEffect(() => {
    if (!activeModal) {
      modalRef.current = null;
      return;
    }

    if (modalRef.current === activeModal) {
      return;
    }

    playAudioCue(modalAudioRef.current);
    modalRef.current = activeModal;
  }, [activeModal]);

  useEffect(() => {
    const nextMode = progress.reward.escaped ? "success" : failureReason ? "failed" : null;

    if (!nextMode || resultRef.current === nextMode) {
      return;
    }

    if (nextMode === "success") {
      playAudioCue(successAudioRef.current);
    } else {
      playAudioCue(failureAudioRef.current);
    }

    resultRef.current = nextMode;
  }, [failureReason, progress.reward.escaped]);

  const handleHotspotSelect = (objectId: RoomObjectId) => {
    if (failureReason) {
      return;
    }

    switch (objectId) {
      case "notice-board":
      case "bookshelf":
      case "floor-map":
      case "return-cart":
        setActiveClueObjectId(objectId);
        setActiveModal("clue");
        break;
      case "speaker":
        setActiveModal("audio");
        break;
      case "circulation-desk":
        setActiveModal("desk");
        break;
      case "exit-door":
        setDoorFeedback(null);
        setScene("exit");
        setActiveModal("keypad");
        break;
    }
  };

  const handleStartRun = () => {
    if (!progress.started) {
      dispatch({ type: "START_GAME" });
      warningMarksRef.current.clear();
      resultRef.current = null;
    }
    setScene("library");
  };

  const handleResetRun = () => {
    dispatch({ type: "SET_PROGRESS", progress: createInitialGameProgress() });
    setActiveModal(null);
    setActiveClueObjectId(null);
    setDoorFeedback(null);
    setScene("briefing");
    warningMarksRef.current.clear();
    resultRef.current = null;
    resetTimer();
  };

  const toggleFullscreen = async () => {
    if (!gameViewportRef.current) {
      return;
    }

    if (document.fullscreenElement === gameViewportRef.current) {
      await document.exitFullscreen();
      return;
    }

    await gameViewportRef.current.requestFullscreen();
  };

  const missingSteps = progressTasks
    .filter((task) => !progress.completedPuzzles[task.id])
    .map((task) => missingLabelByTask[task.id]);
  const completionPercent = getCompletionPercent(progress);
  const codeClues = progress.inventory.clues.filter((clue) => clue.kind === "code");
  const intelClues = progress.inventory.clues.filter((clue) => clue.kind === "intel");
  const clueValues = codeClues.map((clue) => clue.value);
  const intelValues = intelClues.map((clue) => clue.value);
  const activeRoomObjects = roomObjects.filter((roomObject) => roomObject.id !== "exit-door");
  const activeClueContent = activeClueObjectId ? clueModalContent[activeClueObjectId] : null;
  const elapsedLabel = formatGameTime(elapsedSeconds);
  const countdownLabel = formatGameTime(remainingSeconds);
  const bestLabel = bestSeconds === null ? "--:--" : formatGameTime(bestSeconds);
  const rank = getTimeRank(elapsedSeconds);
  const sceneDisabled = !progress.started || Boolean(failureReason);
  const chipTone = remainingSeconds <= 30 && progress.started && !progress.reward.escaped ? "timer-alert" : "";
  const statusLabel = failureReason ? "run failed" : progress.phase.replace(/-/g, " ");

  const overlayLayer = (
    <>
      {activeModal === "clue" ? (
        <ClueModal
          clueContent={activeClueContent}
          collected={activeClueObjectId ? progress.completedPuzzles[activeClueObjectId] : false}
          onCollect={() => {
            if (activeClueObjectId === "notice-board") {
              dispatch({ type: "COLLECT_NOTICE_BOARD", clue: NOTICE_BOARD_CLUE, note: NOTICE_BOARD_NOTE });
            }

            if (activeClueObjectId === "return-cart") {
              dispatch({ type: "COLLECT_RETURN_CART", clue: RETURN_CART_CLUE, item: RESHELVING_SLIP_ITEM, note: RETURN_CART_NOTE });
            }

            if (activeClueObjectId === "bookshelf") {
              dispatch({ type: "COLLECT_BOOKSHELF", clue: BOOKSHELF_CLUE, item: DESK_KEY_ITEM, note: BOOKSHELF_NOTE });
            }

            if (activeClueObjectId === "floor-map") {
              dispatch({ type: "COLLECT_FLOOR_MAP", clue: FLOOR_MAP_CLUE, note: FLOOR_MAP_NOTE });
            }
          }}
          onClose={() => {
            setActiveModal(null);
            setActiveClueObjectId(null);
          }}
        />
      ) : null}

      {activeModal === "audio" ? (
        <AudioPuzzleModal
          puzzle={speakerPuzzle}
          completed={progress.completedPuzzles.speaker}
          onSolved={() => dispatch({ type: "COMPLETE_AUDIO", note: SPEAKER_NOTE })}
          onClose={() => setActiveModal(null)}
        />
      ) : null}

      {activeModal === "desk" ? (
        <DeskPuzzleModal
          puzzle={circulationDeskPuzzle}
          rewardItem={PROCEDURE_CARD_ITEM}
          completed={progress.completedPuzzles["circulation-desk"]}
          hasKey={hasItem(progress, DESK_KEY_ITEM.id)}
          requiredItemLabel="Desk Key"
          missingItemMessage="The drawer is locked. Recover the brass desk key from the history stacks first."
          drawerDescription="Drawer 04 unlocks the circulation procedure cards."
          onSolved={() => {
            dispatch({ type: "COMPLETE_DESK", item: PROCEDURE_CARD_ITEM, note: DESK_NOTE, usedItemId: DESK_KEY_ITEM.id });
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      ) : null}

      {activeModal === "keypad" ? (
        <KeypadModal
          ready={readyToUnlock}
          codeLength={ESCAPE_ROOM_CODE.length}
          attempts={progress.keypadAttempts}
          attemptLimit={ESCAPE_ROOM_ATTEMPT_LIMIT}
          codeClues={clueValues}
          intelClues={intelValues}
          items={progress.inventory.items}
          notes={progress.inventory.notes}
          missingSteps={missingSteps}
          feedback={doorFeedback}
          onSubmit={(code) => {
            const result = tryUnlockDoor(progress, code, ESCAPE_ROOM_CODE);
            dispatch({ type: "SET_PROGRESS", progress: result.nextProgress });
            setDoorFeedback(result.message);

            if (result.success || result.nextProgress.keypadAttempts >= ESCAPE_ROOM_ATTEMPT_LIMIT) {
              setActiveModal(null);
            }
          }}
          onClose={() => setActiveModal(null)}
        />
      ) : null}

      {progress.reward.escaped ? (
        <RewardModal reward={progress.reward} elapsedLabel={elapsedLabel} bestLabel={bestLabel} rank={rank} onClose={handleResetRun} />
      ) : null}

      {failureReason ? (
        <GameResultScreen
          mode="failed"
          locale={locale}
          rank={rank}
          xpEarned={progress.reward.xpEarned}
          badgeUnlocked={progress.reward.badgeUnlocked}
          elapsedLabel={elapsedLabel}
          bestLabel={bestLabel}
          countdownLabel={countdownLabel}
          failureReason={failureReason}
          onRetry={handleResetRun}
        />
      ) : null}
    </>
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#eef5ff] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(147,197,253,0.32),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(191,219,254,0.28),transparent_20%),radial-gradient(circle_at_50%_100%,rgba(112,163,255,0.18),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <div
        className={cn(
          "relative mx-auto flex min-h-screen w-full flex-col",
          isFullscreen ? "max-w-none px-0 py-0" : "max-w-[1680px] px-3 py-3 sm:px-4 sm:py-4 lg:px-5",
        )}
      >
        {!isFullscreen ? (
          <header className="rounded-[1.6rem] border border-[#d7e6fb] bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(238,246,255,0.95))] p-4 shadow-[0_24px_70px_rgba(37,99,235,0.12)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/games?lang=${locale}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d7e6fb] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
                >
                  <ArrowLeft className="size-4" />
                  {copy.back}
                </Link>

                <div className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-800">
                  {copy.stage}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className={`inline-flex items-center gap-2 rounded-full border border-[#d7e6fb] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800 ${chipTone}`}>
                  {remainingSeconds === 0 ? <TimerOff className="size-4 text-rose-500" /> : <Timer className="size-4 text-blue-700" />}
                  {copy.timer}: {countdownLabel}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e6fb] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800">
                  <Timer className="size-4 text-blue-700" />
                  {copy.runtime}: {elapsedLabel}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e6fb] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800">
                  <Trophy className="size-4 text-blue-700" />
                  {copy.best}: {bestLabel}
                </div>
              </div>
            </div>
          </header>
        ) : null}

        <div className={cn("grid flex-1 gap-4", isFullscreen ? "mt-0" : "mt-4 xl:grid-cols-[minmax(0,1.6fr)_360px]")}>
          <section
            ref={gameViewportRef}
            className={cn(
              "relative isolate rounded-[2rem] border border-[#d7e6fb] bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(238,246,255,0.95))] p-4 shadow-[0_30px_90px_rgba(37,99,235,0.12)] sm:p-5",
              isFullscreen ? "h-screen w-screen overflow-hidden rounded-none border-0 p-0 shadow-none" : "",
            )}
          >
            {isFullscreen ? (
              <div className="pointer-events-none absolute inset-0 z-30">
                <div className="corner-hud pointer-events-auto absolute left-4 top-4 w-[min(430px,calc(100vw-2rem))] rounded-[1.7rem] border border-[#d7e6fb] bg-[rgba(247,251,255,0.82)] p-4 shadow-[0_22px_60px_rgba(37,99,235,0.14)] backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-700/70">{copy.stage}</p>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#d7e6fb] bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800">
                        <ScanFace className="size-4 text-blue-700" />
                        {statusLabel}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/games?lang=${locale}`}
                        className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#d7e6fb] bg-white/90 text-slate-700 transition hover:bg-white"
                        aria-label={copy.back}
                      >
                        <ArrowLeft className="size-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#d7e6fb] bg-white/90 text-slate-700 transition hover:bg-white"
                        aria-label={isFullscreen ? copy.exitFullscreen : copy.fullscreen}
                      >
                        {isFullscreen ? <Minimize2 className="size-4" /> : <Expand className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <SceneRail activeScene={scene} unlockedGate={readyToUnlock} fullscreen={isFullscreen} onSceneChange={setScene} />
                  </div>
                </div>

                <div className="corner-hud pointer-events-auto absolute right-4 top-4 flex w-[min(220px,calc(100vw-2rem))] flex-col gap-3">
                  <div className={cn("rounded-[1.5rem] border border-[#d7e6fb] bg-[rgba(247,251,255,0.84)] p-4 shadow-[0_18px_48px_rgba(37,99,235,0.12)] backdrop-blur-xl", chipTone)}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{copy.timer}</p>
                    <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      {remainingSeconds === 0 ? <TimerOff className="size-5 text-rose-500" /> : <Timer className="size-5 text-blue-700" />}
                      {countdownLabel}
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-[#d7e6fb] bg-[rgba(247,251,255,0.84)] p-4 shadow-[0_18px_48px_rgba(37,99,235,0.12)] backdrop-blur-xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{copy.runtime}</p>
                    <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <Timer className="size-5 text-blue-700" />
                      {elapsedLabel}
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-[#d7e6fb] bg-[rgba(247,251,255,0.84)] p-4 shadow-[0_18px_48px_rgba(37,99,235,0.12)] backdrop-blur-xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{copy.best}</p>
                    <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <Trophy className="size-5 text-blue-700" />
                      {bestLabel}
                    </div>
                  </div>
                </div>

                <div className="corner-hud pointer-events-auto absolute bottom-4 left-4 w-[min(380px,calc(100vw-2rem))] rounded-[1.6rem] border border-[#d7e6fb] bg-[rgba(247,251,255,0.86)] p-4 shadow-[0_18px_48px_rgba(37,99,235,0.12)] backdrop-blur-xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-700/70">Objective</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-800">{progress.currentObjective}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#d7e6fb]">
                    <div
                      className="progress-stripe h-full rounded-full bg-[linear-gradient(90deg,#9ed8ff,#4b7dff,#7cbcff)]"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-600">{"Sequence: board -> cart -> stacks -> desk -> speaker -> map -> exit."}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e6fb] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800">
                      <ScanFace className="size-4 text-blue-700" />
                      {statusLabel}
                    </div>
                    <div className={cn("inline-flex items-center gap-2 rounded-full border border-[#d7e6fb] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800", chipTone)}>
                      {remainingSeconds === 0 ? <TimerOff className="size-4 text-rose-500" /> : <Timer className="size-4 text-blue-700" />}
                      {countdownLabel}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e6fb] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800">
                      <Timer className="size-4 text-blue-700" />
                      {elapsedLabel}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e6fb] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800">
                      <Trophy className="size-4 text-blue-700" />
                      {bestLabel}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-[#d7e6fb] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
                  >
                    {isFullscreen ? <Minimize2 className="size-4" /> : <Expand className="size-4" />}
                    {isFullscreen ? copy.exitFullscreen : copy.fullscreen}
                  </button>
                </div>

                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <SceneRail activeScene={scene} unlockedGate={readyToUnlock} fullscreen={isFullscreen} onSceneChange={setScene} />
                </div>
              </div>
            )}

            <div className={cn("relative", isFullscreen ? "h-screen" : "mt-5")}>
              {scene === "briefing" ? (
                <BriefingScene started={progress.started} elapsedLabel={elapsedLabel} countdownLabel={countdownLabel} fullscreen={isFullscreen} onStart={handleStartRun} />
              ) : null}

              {scene === "library" ? (
                <RoomScene roomObjects={activeRoomObjects} progress={progress} disabled={sceneDisabled} fullscreen={isFullscreen} onHotspotSelect={handleHotspotSelect} />
              ) : null}

              {scene === "exit" ? (
                <ExitGateScene
                  ready={readyToUnlock}
                  escaped={progress.reward.escaped}
                  clueValues={clueValues}
                  intelValues={intelValues}
                  items={progress.inventory.items}
                  notes={progress.inventory.notes}
                  missingSteps={missingSteps}
                  fullscreen={isFullscreen}
                  onOpenKeypad={() => {
                    setDoorFeedback(null);
                    setActiveModal("keypad");
                  }}
                />
              ) : null}
            </div>

            {overlayLayer}

            <audio ref={sceneAudioRef} preload="auto">
              <source src="/quests/escape-room/audio/scene-shift.wav" type="audio/wav" />
            </audio>
            <audio ref={successAudioRef} preload="auto">
              <source src="/quests/escape-room/audio/stage-clear.wav" type="audio/wav" />
            </audio>
            <audio ref={failureAudioRef} preload="auto">
              <source src="/quests/escape-room/audio/alarm-soft.wav" type="audio/wav" />
            </audio>
            <audio ref={warningAudioRef} preload="auto">
              <source src="/quests/escape-room/audio/warning-chime.wav" type="audio/wav" />
            </audio>
            <audio ref={modalAudioRef} preload="auto">
              <source src="/quests/escape-room/audio/ui-open.wav" type="audio/wav" />
            </audio>
          </section>

          {!isFullscreen ? (
            <GameSidebar
              progress={progress}
              tasks={progressTasks}
              completionPercent={completionPercent}
              bestLabel={bestLabel}
              onStart={handleStartRun}
              onReset={handleResetRun}
              onOpenGate={() => {
                setScene("exit");
                setDoorFeedback(null);
                setActiveModal("keypad");
              }}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
