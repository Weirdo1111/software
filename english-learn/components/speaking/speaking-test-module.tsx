"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  MessageSquareQuote,
  Mic,
  RefreshCcw,
  StopCircle,
  Volume2,
  Waves,
} from "lucide-react";

import { useRealtimeRoleplay } from "@/components/discussion/use-realtime-roleplay";
import { exportAudioBlobAsWavBase64 } from "@/components/forms/speaking/audio-export";
import { useAudioRecorder } from "@/components/forms/speaking/use-audio-recorder";
import { recordSkillAttemptInStorage } from "@/lib/learning-tracker";
import {
  buildMockSpeakingTestFeedback,
  normalizeSpeakingTestFeedback,
  pickRandomSpeakingTestQuestionSet,
  SPEAKING_TEST_EXAMINER_CHARACTER_ID,
  type SpeakingTestAnswerInput,
  type SpeakingTestFeedback,
  type SpeakingTestQuestion,
  type SpeakingTestQuestionSet,
} from "@/lib/speaking-test";

type Locale = "zh" | "en";

function getBridgeUrl() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_ROLEPLAY_BRIDGE_URL || "ws://127.0.0.1:8877";
  }

  return (
    process.env.NEXT_PUBLIC_ROLEPLAY_BRIDGE_URL ||
    `ws://${window.location.hostname || "127.0.0.1"}:8877`
  );
}

function buildQuestionInstruction(question: SpeakingTestQuestion, questionIndex: number) {
  return [
    "[SYSTEM CONTROL]",
    `You are now administering question ${questionIndex + 1} of 3.`,
    "Ask the next question exactly as written.",
    "Use at most one short lead-in sentence.",
    "Do not explain the answer and do not give feedback.",
    `Question: ${question.prompt}`,
  ].join(" ");
}

function buildCompletionInstruction() {
  return [
    "[SYSTEM CONTROL]",
    "The candidate has completed all 3 questions.",
    "Say one short sentence acknowledging completion and say the platform is analysing the test now.",
    "Do not provide any feedback, score, or advice.",
  ].join(" ");
}

function buildOrderedAnswers(questionSet: SpeakingTestQuestionSet, answers: SpeakingTestAnswerInput[]) {
  return [...answers].sort(
    (left, right) =>
      questionSet.questions.findIndex((question) => question.id === left.question_id) -
      questionSet.questions.findIndex((question) => question.id === right.question_id),
  );
}

function buildWaveHeights(isActive: boolean) {
  return isActive ? [22, 38, 54, 30, 62, 40, 56, 34, 50, 24, 46, 28, 58, 36, 22] : [14, 24, 34, 22, 42, 30, 38, 26, 34, 18, 30, 22, 36, 26, 16];
}

export function SpeakingTestModule({ locale }: { locale: Locale }) {
  const [questionSet, setQuestionSet] = useState<SpeakingTestQuestionSet>(() => pickRandomSpeakingTestQuestionSet());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<SpeakingTestAnswerInput[]>([]);
  const [feedback, setFeedback] = useState<SpeakingTestFeedback | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isQuestionQueued, setIsQuestionQueued] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [pendingQuestionIndex, setPendingQuestionIndex] = useState<number | null>(null);
  const [hasExamStarted, setHasExamStarted] = useState(false);

  const bridgeUrl = useMemo(() => getBridgeUrl(), []);
  const realtime = useRealtimeRoleplay(bridgeUrl);
  const recorder = useAudioRecorder();
  const introFinished = realtime.logs.some((entry) => entry.message.includes("Opening line finished."));
  const currentQuestion = questionSet.questions[currentQuestionIndex] ?? null;
  const orderedAnswers = useMemo(() => buildOrderedAnswers(questionSet, answers), [answers, questionSet]);
  const latestLog = realtime.logs[realtime.logs.length - 1]?.message ?? "";
  const waveformHeights = buildWaveHeights(realtime.isAssistantSpeaking || realtime.isMicActive || isTranscribing);

  const text =
    locale === "zh"
      ? {
          brand: "Academic Excellence Editorial",
          navPrimary: "Assessment Center",
          navSecondary: "Test Library",
          navTertiary: "Faculty Support",
          office: "Digital Dean's Office",
          access: "Institutional Access",
          sideReports: "Score Reports",
          sideVocabulary: "Vocabulary Lab",
          sideSpeech: "Speech Analysis",
          startPractice: "Start Practice Test",
          pageTitle: "Oral Proficiency Interaction",
          pageSubtitle: questionSet.theme,
          systemMessage: "系统提示",
          connect: "Connect",
          disconnect: "Disconnect",
          startMic: "Start Mic",
          over: "Over",
          reset: "Draw Another Test",
          restartRecording: "Restart Recording",
          examinerName: "Dr. Elena Vance",
          examinerRole: "Academic Assessment Lead",
          speaking: "Speaking",
          expertTip: "Expert Tip",
          expertTipBody:
            "Focus on clear articulation and varying your intonation. The AI evaluates both semantic coherence and phonetic precision.",
          waiting:
            "Connect first. After the AI introduction finishes, the first question will be asked automatically.",
          micHint:
            "Use Start Mic when the examiner stops speaking. Click Over after you finish each answer so the next question can be queued.",
          unsupported:
            "This browser cannot record the local answer track required for speaking-test scoring. Use Chrome or Edge.",
          scoring: "Scoring the full oral test...",
          transcribing: "Transcribing the latest answer...",
          analysisTitle: "Professional Evaluation",
          totalScore: "Total Score",
          strengths: "Strengths",
          priorities: "Improvement Priorities",
          transcriptOverview: "Transcript Overview",
          noAnswer: "No answer recorded yet.",
          readyMessage:
            'Welcome to your Speaking Assessment. Please listen carefully to each question. Click "Over" when you finish your response.',
          bridgeHint: "Realtime bridge",
          currentQuestion: "Current Question",
          recordedAnswers: "Recorded Answers",
          question: "Question",
          of: "of",
          completeHint: "Complete all 3 answers to unlock the detailed five-dimension evaluation.",
          liveStatus: "Live Status",
          oralExaminer: "Oral Test Examiner",
          setLabel: "Set",
          themeLabel: "Theme",
          awaitingAnswer: "Awaiting answer",
          recorded: "recorded",
        }
      : {
          brand: "Academic Excellence Editorial",
          navPrimary: "Assessment Center",
          navSecondary: "Test Library",
          navTertiary: "Faculty Support",
          office: "Digital Dean's Office",
          access: "Institutional Access",
          sideReports: "Score Reports",
          sideVocabulary: "Vocabulary Lab",
          sideSpeech: "Speech Analysis",
          startPractice: "Start Practice Test",
          pageTitle: "Oral Proficiency Interaction",
          pageSubtitle: questionSet.theme,
          systemMessage: "System Message",
          connect: "Connect",
          disconnect: "Disconnect",
          startMic: "Start Mic",
          over: "Over",
          reset: "Draw Another Test",
          restartRecording: "Restart Recording",
          examinerName: "Dr. Elena Vance",
          examinerRole: "Academic Assessment Lead",
          speaking: "Speaking",
          expertTip: "Expert Tip",
          expertTipBody:
            "Focus on clear articulation and varying your intonation. The AI evaluates both semantic coherence and phonetic precision.",
          waiting:
            "Connect first. After the AI introduction finishes, the first question will be asked automatically.",
          micHint:
            "Use Start Mic when the examiner stops speaking. Click Over after you finish each answer so the next question can be queued.",
          unsupported:
            "This browser cannot record the local answer track required for speaking-test scoring. Use Chrome or Edge.",
          scoring: "Scoring the full oral test...",
          transcribing: "Transcribing the latest answer...",
          analysisTitle: "Professional Evaluation",
          totalScore: "Total Score",
          strengths: "Strengths",
          priorities: "Improvement Priorities",
          transcriptOverview: "Transcript Overview",
          noAnswer: "No answer recorded yet.",
          readyMessage:
            'Welcome to your Speaking Assessment. Please listen carefully to each question. Click "Over" when you finish your response.',
          bridgeHint: "Realtime bridge",
          currentQuestion: "Current Question",
          recordedAnswers: "Recorded Answers",
          question: "Question",
          of: "of",
          completeHint: "Complete all 3 answers to unlock the detailed five-dimension evaluation.",
          liveStatus: "Live Status",
          oralExaminer: "Oral Test Examiner",
          setLabel: "Set",
          themeLabel: "Theme",
          awaitingAnswer: "Awaiting answer",
          recorded: "recorded",
        };

  useEffect(() => {
    if (!introFinished || hasExamStarted || realtime.connectionState !== "connected") {
      return;
    }

    setHasExamStarted(true);
    setStatus("The AI introduction has finished. Question 1 is being queued.");
    void askQuestion(0);
  }, [hasExamStarted, introFinished, realtime.connectionState]);

  useEffect(() => {
    if (pendingQuestionIndex === null) {
      return;
    }

    if (recorder.status === "error") {
      setError(recorder.error || "Local recording failed before the answer could be transcribed.");
      setPendingQuestionIndex(null);
      return;
    }

    if (recorder.status !== "stopped" || !recorder.audioClip) {
      return;
    }

    void finalizeAnswer(pendingQuestionIndex, recorder.audioClip);
  }, [pendingQuestionIndex, recorder.audioClip, recorder.error, recorder.status]);

  async function askQuestion(questionIndex: number) {
    const nextQuestion = questionSet.questions[questionIndex];
    if (!nextQuestion) {
      return;
    }

    setError("");
    setIsQuestionQueued(true);
    setCurrentQuestionIndex(questionIndex);
    setStatus(`Question ${questionIndex + 1} is being delivered by the examiner.`);

    try {
      await realtime.sendTextTurn(buildQuestionInstruction(nextQuestion, questionIndex));
      setStatus(`Question ${questionIndex + 1} is ready. Start the microphone when the examiner finishes speaking.`);
    } finally {
      setIsQuestionQueued(false);
    }
  }

  async function handleStartMic() {
    if (!currentQuestion || isTranscribing || isScoring) {
      return;
    }

    setError("");
    setStatus(`Recording your answer for Question ${currentQuestionIndex + 1}.`);

    await recorder.resetRecording();
    await recorder.startRecording();
    await realtime.startMicrophone();
  }

  async function handleOver() {
    if (!currentQuestion || isTranscribing || isScoring) {
      return;
    }

    setError("");
    setStatus(text.transcribing);
    setPendingQuestionIndex(currentQuestionIndex);
    await realtime.stopMicrophone();
    recorder.stopRecording();
  }

  async function finalizeAnswer(questionIndex: number, clip: NonNullable<typeof recorder.audioClip>) {
    const question = questionSet.questions[questionIndex];
    if (!question) {
      setPendingQuestionIndex(null);
      return;
    }

    setIsTranscribing(true);
    setError("");

    try {
      const { audioBase64, mimeType } = await exportAudioBlobAsWavBase64(clip.blob);
      const response = await fetch("/api/ai/speaking/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio_base64: audioBase64,
          mime_type: mimeType,
          duration_ms: clip.durationMs,
        }),
      });

      const payload = (await response.json()) as { transcript?: string; error?: string };
      if (!response.ok || !payload.transcript?.trim()) {
        throw new Error(payload.error || "Failed to transcribe the latest answer.");
      }

      const nextAnswer: SpeakingTestAnswerInput = {
        question_id: question.id,
        prompt: question.prompt,
        transcript: payload.transcript.trim(),
        duration_sec: Math.max(1, Math.round(clip.durationMs / 1000)),
      };

      const nextAnswers = buildOrderedAnswers(questionSet, [
        ...answers.filter((answer) => answer.question_id !== question.id),
        nextAnswer,
      ]);

      setAnswers(nextAnswers);
      setPendingQuestionIndex(null);

      if (questionIndex < questionSet.questions.length - 1) {
        const nextIndex = questionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        await recorder.resetRecording();
        setStatus(`Question ${questionIndex + 1} saved. Question ${nextIndex + 1} is being queued.`);
        await askQuestion(nextIndex);
      } else {
        await recorder.resetRecording();
        setStatus(text.scoring);
        await realtime.sendTextTurn(buildCompletionInstruction());
        await scoreSpeakingTest(nextAnswers);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to process the latest answer.");
      setPendingQuestionIndex(null);
      await recorder.resetRecording();
    } finally {
      setIsTranscribing(false);
    }
  }

  async function scoreSpeakingTest(nextAnswers: SpeakingTestAnswerInput[]) {
    setIsScoring(true);

    try {
      const response = await fetch("/api/ai/feedback/speaking-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          set_id: questionSet.id,
          answers: nextAnswers,
        }),
      });

      const payload = (await response.json()) as SpeakingTestFeedback | { error?: string };
      if (!response.ok) {
        throw new Error(
          "error" in payload ? payload.error || "Failed to score the speaking test." : "Failed to score the speaking test.",
        );
      }

      const result = normalizeSpeakingTestFeedback(payload as SpeakingTestFeedback);
      setFeedback(result);
      setStatus(`Speaking test complete. Total score: ${result.overall_score} / 100.`);
      recordSkillAttemptInStorage("speaking", {
        correct: result.overall_score >= 60,
        durationSec: Math.max(90, nextAnswers.reduce((sum, answer) => sum + answer.duration_sec, 0)),
        markCompleted: true,
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to score the speaking test.");
      setFeedback(normalizeSpeakingTestFeedback(buildMockSpeakingTestFeedback(questionSet, nextAnswers)));
    } finally {
      setIsScoring(false);
    }
  }

  async function resetTest() {
    await realtime.disconnectSession();
    realtime.clearLogs();
    await recorder.resetRecording();
    setQuestionSet(pickRandomSpeakingTestQuestionSet());
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setFeedback(null);
    setStatus("");
    setError("");
    setIsQuestionQueued(false);
    setIsTranscribing(false);
    setIsScoring(false);
    setPendingQuestionIndex(null);
    setHasExamStarted(false);
  }

  const canStartMic =
    realtime.connectionState === "connected" &&
    hasExamStarted &&
    !realtime.isAssistantSpeaking &&
    !realtime.isMicActive &&
    !isQuestionQueued &&
    !isTranscribing &&
    !isScoring &&
    pendingQuestionIndex === null &&
    recorder.isSupported &&
    feedback === null;

  const canOver =
    realtime.isMicActive &&
    recorder.status === "recording" &&
    !isTranscribing &&
    !isScoring &&
    pendingQuestionIndex === null;

  const heroMessage =
    error ||
    (isScoring
      ? text.scoring
      : isTranscribing
        ? text.transcribing
        : status || realtime.status || text.readyMessage);

  return (
    <div className="min-h-screen overflow-hidden bg-[#f8f9fa] text-[#191c1d]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Newsreader:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        .font-newsreader { font-family: 'Newsreader', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>

      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-8 py-5">
          <div className="font-newsreader text-[20px] font-bold tracking-tight text-[#000c1e] md:text-[24px]">
            {text.brand}
          </div>

          <nav className="hidden items-center gap-9 md:flex font-inter">
            <a href="#" className="border-b-2 border-[#095bbf] pb-2 text-[15px] font-semibold text-[#095bbf]">
              {text.navPrimary}
            </a>
            <a href="#" className="pb-2 text-[15px] font-medium text-slate-600 transition-colors hover:text-[#000c1e]">
              {text.navSecondary}
            </a>
            <a href="#" className="pb-2 text-[15px] font-medium text-slate-600 transition-colors hover:text-[#000c1e]">
              {text.navTertiary}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100">
              <Volume2 className="h-5 w-5" />
            </button>
            <button className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100">
              <Waves className="h-5 w-5" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
              SV
            </div>
          </div>
        </div>
      </header>

      <div className="relative flex min-h-[calc(100vh-81px)]">
        <aside className="hidden w-[262px] shrink-0 border-r border-slate-200/60 bg-[#f3f4f5] lg:flex lg:flex-col">
          <div className="px-6 pb-8 pt-7">
            <div className="font-newsreader text-[18px] italic text-[#002344]">{text.office}</div>
            <div className="mt-1 font-inter text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              {text.access}
            </div>
          </div>

          <div className="flex-1 px-2 font-inter">
            {[
              { label: text.navPrimary, icon: <CheckCircle2 className="h-5 w-5" />, active: true },
              { label: text.sideReports, icon: <LoaderCircle className="h-5 w-5" />, active: false },
              { label: text.sideVocabulary, icon: <MessageSquareQuote className="h-5 w-5" />, active: false },
              { label: text.sideSpeech, icon: <Mic className="h-5 w-5" />, active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={[
                  "mx-2 my-1 flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-all",
                  item.active
                    ? "bg-white text-[#095bbf] shadow-sm"
                    : "text-slate-500 hover:bg-slate-200/60 hover:text-[#000c1e]",
                ].join(" ")}
              >
                {item.icon}
                <span className="text-[15px] font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto border-t border-slate-200/60 px-4 py-4">
            <button
              type="button"
              onClick={() => void resetTest()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#000c1e] px-4 py-3 font-inter text-[15px] font-medium text-white transition hover:opacity-90"
            >
              <RefreshCcw className="h-4 w-4" />
              {text.startPractice}
            </button>
          </div>
        </aside>

        <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col justify-center px-6 py-10 md:px-10 lg:px-16">
          <div className="mb-10 flex flex-col gap-6 border-b border-slate-200/60 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-newsreader text-[40px] leading-none tracking-tight text-[#000c1e] md:text-[52px]">
                {text.pageTitle}
              </h1>
              <p className="mt-3 font-inter text-[18px] font-medium tracking-tight text-[#43474e]">
                {text.pageSubtitle}
              </p>
            </div>

            <div className="min-w-[132px] text-left md:text-right">
              <div className="font-inter text-[18px] font-bold text-[#095bbf]">
                {text.question} {Math.min(currentQuestionIndex + 1, questionSet.questions.length)} {text.of} {questionSet.questions.length}
              </div>
              <div className="mt-3 h-[3px] w-[132px] bg-[#e1e3e4] md:ml-auto">
                <div
                  className="h-full bg-[#095bbf] transition-all duration-300"
                  style={{ width: `${((Math.min(currentQuestionIndex + (feedback ? 1 : 0), questionSet.questions.length)) / questionSet.questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
            <section className="lg:col-span-5">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-[#095bbf]/10 blur-2xl" />
                  <div className="relative h-[260px] w-[260px] overflow-hidden rounded-[22px] border-4 border-white bg-gradient-to-br from-slate-100 to-slate-200 shadow-[0_20px_45px_rgba(25,28,29,0.10)]">
                    <img
                      className="h-full w-full object-cover"
                      src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=80"
                      alt="Professional academic examiner"
                    />

                    <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full border border-white/20 bg-[#095bbf] px-4 py-1.5 text-white shadow-lg">
                      <div className="flex h-3 items-end gap-1">
                        <span className="block h-full w-1 rounded bg-white" />
                        <span className="block h-2 w-1 rounded bg-white" />
                        <span className="block h-1.5 w-1 rounded bg-white" />
                      </div>
                      <span className="font-inter text-[11px] font-bold uppercase tracking-[0.2em]">{text.speaking}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <h2 className="font-newsreader text-[28px] italic text-[#000c1e]">{text.examinerName}</h2>
                  <p className="mt-1 font-inter text-[15px] text-[#43474e]">{text.examinerRole}</p>
                </div>

                <div className="mt-8 w-full max-w-[320px] rounded-xl bg-white p-5 shadow-[0_12px_30px_rgba(25,28,29,0.04)]">
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    <div className="rounded-lg bg-[#f3f4f5] px-4 py-3">
                      <p className="font-inter text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{text.setLabel}</p>
                      <p className="mt-2 font-inter text-[14px] font-semibold text-[#000c1e]">{questionSet.title}</p>
                    </div>
                    <div className="rounded-lg bg-[#f3f4f5] px-4 py-3">
                      <p className="font-inter text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Examiner</p>
                      <p className="mt-2 font-inter text-[14px] font-semibold text-[#000c1e]">{text.oralExaminer}</p>
                    </div>
                    <div className="rounded-lg bg-[#f3f4f5] px-4 py-3">
                      <p className="font-inter text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{text.themeLabel}</p>
                      <p className="mt-2 font-inter text-[14px] font-semibold text-[#000c1e]">{questionSet.theme}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-8 lg:col-span-7">
              <div className="relative rounded-xl bg-white p-8 shadow-[0_12px_30px_rgba(25,28,29,0.04)]">
                <div className="absolute -top-3 left-8 bg-[#000c1e] px-3 py-1 font-inter text-[10px] font-bold uppercase tracking-[0.24em] text-white">
                  {text.systemMessage}
                </div>
                <p className="max-w-[620px] font-inter text-[18px] leading-[1.65] text-[#000c1e]">
                  {heroMessage.includes('"Over"') ? (
                    <>
                      Welcome to your Speaking Assessment. Please listen carefully to each question. Click{' '}
                      <span className="font-bold text-[#095bbf]">&quot;Over&quot;</span> when you finish your response.
                    </>
                  ) : (
                    heroMessage
                  )}
                </p>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#002344] to-[#001f3c] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:p-10">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-8 flex h-16 w-full items-center justify-center gap-[6px] opacity-70">
                    {waveformHeights.map((height, index) => (
                      <span
                        key={index}
                        className={[
                          "block w-[3px] rounded-full transition-all duration-300",
                          realtime.isMicActive || realtime.isAssistantSpeaking || isTranscribing ? "bg-[#5e97fe]" : "bg-[#095bbf]",
                        ].join(" ")}
                        style={{ height }}
                      />
                    ))}
                  </div>

                  <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:justify-center">
                    <button
                      type="button"
                      onClick={() => void handleStartMic()}
                      disabled={!canStartMic}
                      className="group relative flex h-24 w-24 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="absolute inset-0 rounded-full bg-[#095bbf] opacity-20 blur-sm" />
                      <span className="absolute inset-[8px] flex items-center justify-center rounded-full bg-[#095bbf] shadow-lg transition duration-200 group-hover:scale-[1.03] group-disabled:scale-100">
                        <Mic className={`h-10 w-10 text-white ${realtime.isMicActive ? "animate-pulse" : ""}`} />
                      </span>
                    </button>

                    <div className="flex w-full max-w-[440px] flex-col gap-4">
                      <button
                        type="button"
                        onClick={() => void handleOver()}
                        disabled={!canOver}
                        className="flex items-center justify-center gap-3 rounded bg-[#095bbf] px-8 py-5 font-inter text-[19px] font-bold tracking-tight text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-blue-900/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        {text.over} (Submit Response)
                        <StopCircle className="h-5 w-5" />
                      </button>

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => void realtime.connectSession(SPEAKING_TEST_EXAMINER_CHARACTER_ID)}
                          disabled={realtime.connectionState === "connecting" || realtime.connectionState === "connected"}
                          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2 font-inter text-[14px] font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Waves className="h-4 w-4" />
                          {text.connect}
                        </button>

                        <button
                          type="button"
                          onClick={() => void realtime.disconnectSession()}
                          disabled={realtime.connectionState !== "connected"}
                          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2 font-inter text-[14px] font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Volume2 className="h-4 w-4" />
                          {text.disconnect}
                        </button>

                        <button
                          type="button"
                          onClick={() => void resetTest()}
                          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2 font-inter text-[14px] font-medium text-white transition hover:bg-white/10"
                        >
                          <RefreshCcw className="h-4 w-4" />
                          {text.reset}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          recorder.stopRecording();
                          void recorder.resetRecording();
                        }}
                        className="flex items-center justify-center gap-2 font-inter text-[15px] font-medium text-[#9bb3d1] transition hover:text-white"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        {text.restartRecording}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-28 -top-28 h-64 w-64 rounded-full bg-[#095bbf]/5 blur-3xl" />
              </div>

              <div className="rounded-xl bg-white p-6 shadow-[0_12px_30px_rgba(25,28,29,0.04)]">
                <div className="flex items-start gap-5">
                  <Waves className="mt-1 h-6 w-6 text-[#095bbf]" />
                  <div className="w-full">
                    <h3 className="font-inter text-[14px] font-bold uppercase tracking-[0.22em] text-[#000c1e]">
                      {text.currentQuestion}
                    </h3>
                    <p className="mt-3 font-inter text-[20px] leading-[1.6] text-[#000c1e]">
                      {currentQuestion?.prompt || "All questions have been answered."}
                    </p>
                    <p className="mt-3 font-inter text-[14px] leading-[1.7] text-[#43474e]">
                      {currentQuestion?.preparationHint || "The test is complete."}
                    </p>
                    <div className="mt-4 inline-flex rounded-full bg-[#000c1e] px-4 py-2 font-inter text-[13px] font-semibold text-white">
                      {currentQuestion?.expectedSeconds ?? 0}s suggested
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {questionSet.questions.map((question, index) => {
                  const answer = orderedAnswers.find((item) => item.question_id === question.id);
                  const isCurrent = index === currentQuestionIndex && feedback === null;

                  return (
                    <div
                      key={question.id}
                      className={[
                        "rounded-xl bg-white p-4 shadow-[0_12px_30px_rgba(25,28,29,0.04)]",
                        answer ? "ring-1 ring-[#ccebdc]" : isCurrent ? "ring-1 ring-[#adc6ff]" : "",
                      ].join(" ")}
                    >
                      <p className="font-inter text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        {text.question} {index + 1}
                      </p>
                      <p className="mt-2 font-inter text-[14px] font-semibold leading-6 text-[#000c1e]">{question.prompt}</p>
                      <div className="mt-4 flex items-center gap-2 font-inter text-[12px] font-semibold text-[#486360]">
                        {answer ? <CheckCircle2 className="h-4 w-4 text-[#2c8b62]" /> : <MessageSquareQuote className="h-4 w-4" />}
                        {answer ? `${answer.duration_sec}s ${text.recorded}` : text.awaitingAnswer}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl bg-white p-6 shadow-[0_12px_30px_rgba(25,28,29,0.04)]">
                <div className="flex items-start gap-5">
                  <Mic className="mt-1 h-6 w-6 text-[#095bbf]" />
                  <div>
                    <h3 className="font-inter text-[14px] font-bold uppercase tracking-[0.22em] text-[#000c1e]">
                      {text.expertTip}
                    </h3>
                    <p className="mt-2 max-w-[650px] font-inter text-[15px] leading-[1.7] text-[#43474e]">
                      {recorder.isSupported ? text.expertTipBody : text.unsupported}
                    </p>
                    <p className="mt-3 font-inter text-[13px] text-slate-500">
                      {text.bridgeHint}: {bridgeUrl}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-[0_12px_30px_rgba(25,28,29,0.04)]">
                <p className="font-inter text-[14px] font-bold uppercase tracking-[0.22em] text-[#000c1e]">
                  {text.liveStatus}
                </p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg bg-[#f3f7fb] px-4 py-4 font-inter text-[14px] leading-7 text-[#35546f]">
                    {heroMessage}
                  </div>

                  {latestLog ? (
                    <div className="rounded-lg bg-[#f8f9fa] px-4 py-3 font-inter text-[13px] leading-6 text-[#576c6b]">
                      {latestLog}
                    </div>
                  ) : null}

                  {(isQuestionQueued || isTranscribing || isScoring) && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#000c1e] px-4 py-2 font-inter text-[13px] font-semibold text-white">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      {isScoring ? text.scoring : isTranscribing ? text.transcribing : "Queuing the next examiner turn..."}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-[#f3f4f5] p-6 shadow-[0_12px_30px_rgba(25,28,29,0.04)]">
                <p className="font-inter text-[14px] font-bold uppercase tracking-[0.22em] text-[#000c1e]">
                  {text.recordedAnswers}
                </p>
                <div className="mt-4 space-y-3">
                  {orderedAnswers.length === 0 ? (
                    <div className="rounded-lg bg-white px-4 py-4 font-inter text-[14px] text-[#6a7e7c]">{text.noAnswer}</div>
                  ) : (
                    orderedAnswers.map((answer, index) => (
                      <div key={answer.question_id} className="rounded-lg bg-white px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-inter text-[14px] font-bold text-[#000c1e]">
                            {text.question} {index + 1}
                          </p>
                          <span className="rounded-full bg-[#dff2ea] px-3 py-1 font-inter text-[12px] font-bold text-[#236246]">
                            {answer.duration_sec}s
                          </span>
                        </div>
                        <p className="mt-2 font-inter text-[11px] font-bold uppercase tracking-[0.18em] text-[#78908d]">
                          {answer.prompt}
                        </p>
                        <p className="mt-3 font-inter text-[14px] leading-7 text-[#425756]">{answer.transcript}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-[#fefaf0] p-6 shadow-[0_12px_30px_rgba(25,28,29,0.04)]">
                <p className="font-inter text-[14px] font-bold uppercase tracking-[0.22em] text-[#000c1e]">
                  {text.analysisTitle}
                </p>

                {feedback ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-xl bg-[#000c1e] px-5 py-5 text-white">
                      <p className="font-inter text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">{text.totalScore}</p>
                      <div className="mt-2 flex items-end gap-3">
                        <span className="font-inter text-5xl font-black">{feedback.overall_score}</span>
                        <span className="pb-1 font-inter text-lg font-bold text-white/74">/ 100</span>
                      </div>
                      <p className="mt-3 font-inter text-[14px] leading-7 text-white/78">{feedback.overall_comment}</p>
                    </div>

                    {[
                      ["Fluency", feedback.fluency_score, feedback.fluency_feedback],
                      ["Pronunciation", feedback.pronunciation_score, feedback.pronunciation_feedback],
                      ["Intonation", feedback.intonation_score, feedback.intonation_feedback],
                      ["Vocabulary Range", feedback.vocabulary_score, feedback.vocabulary_feedback],
                      ["Grammar Variety", feedback.grammar_score, feedback.grammar_feedback],
                    ].map(([label, score, comment]) => (
                      <div key={label} className="rounded-lg bg-white px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-inter text-[14px] font-bold text-[#000c1e]">{label}</p>
                          <span className="rounded-full bg-[#fff3cb] px-3 py-1 font-inter text-[12px] font-bold text-[#7e5f13]">
                            {score} / 20
                          </span>
                        </div>
                        <p className="mt-3 font-inter text-[14px] leading-7 text-[#526766]">{comment}</p>
                      </div>
                    ))}

                    <div className="rounded-lg bg-white px-4 py-4">
                      <p className="font-inter text-[14px] font-bold text-[#000c1e]">{text.transcriptOverview}</p>
                      <p className="mt-3 font-inter text-[14px] leading-7 text-[#526766]">{feedback.transcript_overview}</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg bg-white px-4 py-4">
                        <p className="font-inter text-[14px] font-bold text-[#000c1e]">{text.strengths}</p>
                        <ul className="mt-3 space-y-2 font-inter text-[14px] leading-7 text-[#526766]">
                          {feedback.strengths.map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-lg bg-white px-4 py-4">
                        <p className="font-inter text-[14px] font-bold text-[#000c1e]">{text.priorities}</p>
                        <ul className="mt-3 space-y-2 font-inter text-[14px] leading-7 text-[#526766]">
                          {feedback.priorities.map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg bg-white px-4 py-5 font-inter text-[14px] leading-7 text-[#5f7372]">
                    {text.completeHint}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>

        <div className="pointer-events-none fixed right-0 top-0 -z-10 opacity-[0.03]">
          <div className="font-newsreader translate-x-20 -translate-y-10 rotate-12 select-none text-[18rem] italic leading-none text-[#002344]">
            A
          </div>
        </div>
      </div>
    </div>
  );
}
