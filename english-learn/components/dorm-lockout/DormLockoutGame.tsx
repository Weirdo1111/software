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
import { formatGameTime, getTimeRank } from "@/components/escape-room/time-utils";
import { useEscapeTimer } from "@/components/escape-room/use-escape-timer";
import {
  createInitialDormProgress,
  dormHasItem,
  dormLockoutReducer,
  getDormCompletionPercent,
  isDormReadyToUnlock,
  tryUnlockDormDoor,
} from "@/components/dorm-lockout/dorm-engine";
import {
  dormClueModalContent,
  dormDeskPuzzle,
  dormProgressTasks,
  dormRoomObjects,
  dormSpeakerPuzzle,
  DORM_BACKPACK_CLUE,
  DORM_BACKPACK_NOTE,
  DORM_CUBBY_CLUE,
  DORM_CUBBY_NOTE,
  DORM_HANDBOOK_CLUE,
  DORM_HANDBOOK_NOTE,
  DORM_INTERCOM_NOTE,
  DORM_LOCKOUT_ATTEMPT_LIMIT,
  DORM_LOCKOUT_CODE,
  DORM_LOCKOUT_COUNTDOWN_SECONDS,
  DORM_NOTICE_CLUE,
  DORM_NOTICE_NOTE,
  DORM_REWARD,
  DORM_DESK_NOTE,
  HALL_ACCESS_CARD_ITEM,
  RA_PASS_ITEM,
  UNIT_MAIL_SLIP_ITEM,
} from "@/components/dorm-lockout/dorm-data";
import type { ModalType, RoomObjectId, SceneId } from "@/components/escape-room/types";
import type { Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

const DORM_BEST_TIME_KEY = "dorm-lockout-best-seconds-v1";

const missingLabelByTask = {
  "notice-board": "quiet-hours notice",
  "return-cart": "unit cubby lead",
  bookshelf: "matching backpack",
  "circulation-desk": "hall access card",
  speaker: "intercom order",
  "floor-map": "handbook format",
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

export function DormLockoutGame({ locale }: { locale: Locale }) {
  const [progress, dispatch] = useReducer(dormLockoutReducer, undefined, createInitialDormProgress);
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
    durationSeconds: DORM_LOCKOUT_COUNTDOWN_SECONDS,
    bestTimeKey: DORM_BEST_TIME_KEY,
  });

  const copy = {
    back: "Back to Game Center",
    stage: "Dorm Lounge Lockout",
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

  const readyToUnlock = isDormReadyToUnlock(progress);
  const attemptFailure = !progress.reward.escaped && progress.keypadAttempts >= DORM_LOCKOUT_ATTEMPT_LIMIT;
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
    dispatch({ type: "SET_PROGRESS", progress: createInitialDormProgress() });
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

  const missingSteps = dormProgressTasks
    .filter((task) => !progress.completedPuzzles[task.id])
    .map((task) => missingLabelByTask[task.id]);
  const completionPercent = getDormCompletionPercent(progress);
  const codeClues = progress.inventory.clues.filter((clue) => clue.kind === "code");
  const intelClues = progress.inventory.clues.filter((clue) => clue.kind === "intel");
  const clueValues = codeClues.map((clue) => clue.value);
  const intelValues = intelClues.map((clue) => clue.value);
  const activeRoomObjects = dormRoomObjects.filter((roomObject) => roomObject.id !== "exit-door");
  const activeClueContent = activeClueObjectId ? dormClueModalContent[activeClueObjectId] : null;
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
              dispatch({ type: "COLLECT_NOTICE_BOARD", clue: DORM_NOTICE_CLUE, note: DORM_NOTICE_NOTE });
            }

            if (activeClueObjectId === "return-cart") {
              dispatch({ type: "COLLECT_RETURN_CART", clue: DORM_CUBBY_CLUE, item: UNIT_MAIL_SLIP_ITEM, note: DORM_CUBBY_NOTE });
            }

            if (activeClueObjectId === "bookshelf") {
              dispatch({ type: "COLLECT_BOOKSHELF", clue: DORM_BACKPACK_CLUE, item: RA_PASS_ITEM, note: DORM_BACKPACK_NOTE });
            }

            if (activeClueObjectId === "floor-map") {
              dispatch({ type: "COLLECT_FLOOR_MAP", clue: DORM_HANDBOOK_CLUE, note: DORM_HANDBOOK_NOTE });
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
          puzzle={dormSpeakerPuzzle}
          title="Hall Intercom"
          subtitle="Replay the dorm announcement and confirm the final hallway code order."
          completed={progress.completedPuzzles.speaker}
          onSolved={() => dispatch({ type: "COMPLETE_AUDIO", note: DORM_INTERCOM_NOTE })}
          onClose={() => setActiveModal(null)}
        />
      ) : null}

      {activeModal === "desk" ? (
        <DeskPuzzleModal
          puzzle={dormDeskPuzzle}
          rewardItem={HALL_ACCESS_CARD_ITEM}
          title="RA Desk Drawer"
          subtitle="Use the returned passcard and identify the correct after-hours hall access card."
          completed={progress.completedPuzzles["circulation-desk"]}
          hasKey={dormHasItem(progress, RA_PASS_ITEM.id)}
          requiredItemLabel="RA Passcard"
          missingItemMessage="The drawer is locked. Recover the returned RA passcard from the Unit 105 backpack first."
          drawerDescription="The passcard opens the RA desk drawer and reveals the after-hours hall access cards."
          onSolved={() => {
            dispatch({ type: "COMPLETE_DESK", item: HALL_ACCESS_CARD_ITEM, note: DORM_DESK_NOTE, usedItemId: RA_PASS_ITEM.id });
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      ) : null}

      {activeModal === "keypad" ? (
        <KeypadModal
          ready={readyToUnlock}
          codeLength={DORM_LOCKOUT_CODE.length}
          attempts={progress.keypadAttempts}
          attemptLimit={DORM_LOCKOUT_ATTEMPT_LIMIT}
          codeClues={clueValues}
          intelClues={intelValues}
          items={progress.inventory.items}
          notes={progress.inventory.notes}
          missingSteps={missingSteps}
          feedback={doorFeedback}
          onSubmit={(code) => {
            const result = tryUnlockDormDoor(progress, code, DORM_LOCKOUT_CODE);
            dispatch({ type: "SET_PROGRESS", progress: result.nextProgress });
            setDoorFeedback(result.message);

            if (result.success || result.nextProgress.keypadAttempts >= DORM_LOCKOUT_ATTEMPT_LIMIT) {
              setActiveModal(null);
            }
          }}
          onClose={() => setActiveModal(null)}
        />
      ) : null}

      {progress.reward.escaped ? (
        <RewardModal
          reward={progress.reward}
          elapsedLabel={elapsedLabel}
          bestLabel={bestLabel}
          rank={rank}
          title="Stage Reward"
          subtitle="The dorm hallway lock releases and the lounge finally opens back into the corridor."
          successTitle="You cleared the dorm lounge!"
          onClose={handleResetRun}
        />
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
          successTitle="Dorm Lounge Cleared"
          successBody="You completed the dorm stage. Your clear time, rank, and rewards have been recorded locally."
          failAttemptsTitle="Hall Lock Reset"
          failAttemptsBody="Too many wrong attempts triggered a hall lock reset. Restart the run and rebuild the resident sequence."
          failTimerTitle="Quiet Hours Took Over"
          failTimerBody="You ran out of time before clearing the dorm lounge. Restart the stage and take a cleaner route."
          onRetry={handleResetRun}
        />
      ) : null}
    </>
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f2e8] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,215,128,0.28),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(123,205,196,0.24),transparent_20%),radial-gradient(circle_at_50%_100%,rgba(112,163,255,0.16),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <div
        className={cn(
          "relative mx-auto flex min-h-screen w-full flex-col",
          isFullscreen ? "max-w-none px-0 py-0" : "max-w-[1680px] px-3 py-3 sm:px-4 sm:py-4 lg:px-5",
        )}
      >
        {!isFullscreen ? (
          <header className="rounded-[1.6rem] border border-[#e8dcc7] bg-[linear-gradient(145deg,rgba(255,252,245,0.96),rgba(248,242,230,0.94))] p-4 shadow-[0_24px_70px_rgba(80,60,20,0.12)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/games?lang=${locale}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#ddd7ca] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
                >
                  <ArrowLeft className="size-4" />
                  {copy.back}
                </Link>

                <div className="rounded-full border border-teal-300 bg-teal-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-teal-800">
                  {copy.stage}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className={`inline-flex items-center gap-2 rounded-full border border-[#ddd7ca] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800 ${chipTone}`}>
                  {remainingSeconds === 0 ? <TimerOff className="size-4 text-rose-500" /> : <Timer className="size-4 text-teal-700" />}
                  {copy.timer}: {countdownLabel}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd7ca] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800">
                  <Timer className="size-4 text-teal-700" />
                  {copy.runtime}: {elapsedLabel}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd7ca] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800">
                  <Trophy className="size-4 text-amber-600" />
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
              "relative isolate rounded-[2rem] border border-[#e8dcc7] bg-[linear-gradient(145deg,rgba(255,252,245,0.96),rgba(248,242,230,0.94))] p-4 shadow-[0_30px_90px_rgba(80,60,20,0.12)] sm:p-5",
              isFullscreen ? "h-screen w-screen overflow-hidden rounded-none border-0 p-0 shadow-none" : "",
            )}
          >
            {isFullscreen ? (
              <div className="pointer-events-none absolute inset-0 z-30">
                <div className="corner-hud pointer-events-auto absolute left-4 top-4 w-[min(430px,calc(100vw-2rem))] rounded-[1.7rem] border border-[#eadfcb] bg-[rgba(255,250,242,0.78)] p-4 shadow-[0_22px_60px_rgba(80,60,20,0.16)] backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-700/70">{copy.stage}</p>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#ddd7ca] bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800">
                        <ScanFace className="size-4 text-teal-700" />
                        {statusLabel}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/games?lang=${locale}`}
                        className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#ddd7ca] bg-white/90 text-slate-700 transition hover:bg-white"
                        aria-label={copy.back}
                      >
                        <ArrowLeft className="size-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#ddd7ca] bg-white/90 text-slate-700 transition hover:bg-white"
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
                  <div className={cn("rounded-[1.5rem] border border-[#eadfcb] bg-[rgba(255,250,242,0.8)] p-4 shadow-[0_18px_48px_rgba(80,60,20,0.14)] backdrop-blur-xl", chipTone)}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{copy.timer}</p>
                    <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      {remainingSeconds === 0 ? <TimerOff className="size-5 text-rose-500" /> : <Timer className="size-5 text-teal-700" />}
                      {countdownLabel}
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-[#eadfcb] bg-[rgba(255,250,242,0.8)] p-4 shadow-[0_18px_48px_rgba(80,60,20,0.14)] backdrop-blur-xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{copy.runtime}</p>
                    <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <Timer className="size-5 text-teal-700" />
                      {elapsedLabel}
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-[#eadfcb] bg-[rgba(255,250,242,0.8)] p-4 shadow-[0_18px_48px_rgba(80,60,20,0.14)] backdrop-blur-xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{copy.best}</p>
                    <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <Trophy className="size-5 text-amber-600" />
                      {bestLabel}
                    </div>
                  </div>
                </div>

                <div className="corner-hud pointer-events-auto absolute bottom-4 left-4 w-[min(380px,calc(100vw-2rem))] rounded-[1.6rem] border border-[#eadfcb] bg-[rgba(255,250,242,0.82)] p-4 shadow-[0_18px_48px_rgba(80,60,20,0.14)] backdrop-blur-xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700/70">Objective</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-800">{progress.currentObjective}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eadfcb]">
                    <div
                      className="progress-stripe h-full rounded-full bg-[linear-gradient(90deg,#19d3c5,#2c8cff,#ffd166)]"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-600">{"Sequence: board -> cubbies -> backpack -> RA desk -> intercom -> handbook -> exit."}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd7ca] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800">
                      <ScanFace className="size-4 text-teal-700" />
                      {statusLabel}
                    </div>
                    <div className={cn("inline-flex items-center gap-2 rounded-full border border-[#ddd7ca] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800", chipTone)}>
                      {remainingSeconds === 0 ? <TimerOff className="size-4 text-rose-500" /> : <Timer className="size-4 text-teal-700" />}
                      {countdownLabel}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd7ca] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800">
                      <Timer className="size-4 text-teal-700" />
                      {elapsedLabel}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd7ca] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800">
                      <Trophy className="size-4 text-amber-600" />
                      {bestLabel}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-[#ddd7ca] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
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
                <BriefingScene
                  started={progress.started}
                  elapsedLabel={elapsedLabel}
                  countdownLabel={countdownLabel}
                  fullscreen={isFullscreen}
                  onStart={handleStartRun}
                  stageLabel="Official Stage 02"
                  title="Dorm Lounge Lockout"
                  description="The residence hall has locked down for the night. Read the board, trace the right unit, recover the returned passcard, and clear the hallway door before quiet hours fully settle in."
                  difficulty="Residence Puzzle"
                  reward={`+${DORM_REWARD.xpEarned} XP`}
                  featureChips={["Notice Logic", "Unit Match", "Bag Search", "Desk Pass", "Intercom Listening", "7-Digit Exit"]}
                  rules={[
                    "Hotspots only. No character movement.",
                    "The next lead only opens after the previous dorm clue is logged.",
                    "Collect slips and access cards before you ever touch the hallway keypad.",
                  ]}
                  previewImage="/quests/escape-room/dorm.png"
                  startLabel="Start dorm run"
                  resumeLabel="Resume run"
                />
              ) : null}

              {scene === "library" ? (
                <RoomScene
                  roomObjects={activeRoomObjects}
                  progress={progress}
                  disabled={sceneDisabled}
                  fullscreen={isFullscreen}
                  onHotspotSelect={handleHotspotSelect}
                  sceneLabel="Scene 02"
                  title="Dorm Common Lounge"
                  description="Read the board, check the cubbies, match the backpack, unlock the RA desk, confirm the intercom, then verify the handbook."
                  backgroundImage="/quests/escape-room/dorm.png"
                  standbyLabel="Lounge standby"
                  unlockedLabel="Hall clear"
                />
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
                  backgroundImage="/quests/escape-room/dorm.png"
                  sceneLabel="Scene 03"
                  title="Hallway Exit Console"
                  blockedDescription="The hallway console is still missing part of the resident access chain."
                  readyDescription="Board, cubby, backpack, desk, intercom, and handbook checks are complete. The keypad is armed."
                  escapedDescription="Hallway exit unlocked."
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
              tasks={dormProgressTasks}
              completionPercent={completionPercent}
              bestLabel={bestLabel}
              onStart={handleStartRun}
              onReset={handleResetRun}
              onOpenGate={() => {
                setScene("exit");
                setDoorFeedback(null);
                setActiveModal("keypad");
              }}
              itemsPlaceholder="Resident slips, passcards, and desk cards will appear here."
              intelPlaceholder="Bag matches and keypad format clues will appear here."
              notesPlaceholder="Board notes, cubby leads, desk rules, and intercom confirmations will appear here."
              footerNote="The hallway code only works when the unit number, intercom order, and 7-digit handbook format all line up."
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
