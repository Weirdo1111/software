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

  const text =
    locale === "zh"
      ? {
          title: "Speaking Test Module",
          subtitle:
            "One fixed oral set is randomly drawn from 5 test banks. The AI examiner introduces the test, asks 3 questions one by one, and the platform scores the full performance out of 100.",
          setLabel: "Drawn Set",
          examinerLabel: "Examiner",
          questionLabel: "Current Question",
          answerLabel: "Recorded Answers",
          connect: "Connect",
          disconnect: "Disconnect",
          startMic: "Start Mic",
          over: "Over",
          reset: "Draw Another Test",
          bridgeHint: "Realtime bridge",
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
        }
      : {
          title: "Speaking Test Module",
          subtitle:
            "One fixed oral set is randomly drawn from 5 test banks. The AI examiner introduces the test, asks 3 questions one by one, and the platform scores the full performance out of 100.",
          setLabel: "Drawn Set",
          examinerLabel: "Examiner",
          questionLabel: "Current Question",
          answerLabel: "Recorded Answers",
          connect: "Connect",
          disconnect: "Disconnect",
          startMic: "Start Mic",
          over: "Over",
          reset: "Draw Another Test",
          bridgeHint: "Realtime bridge",
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

  return (
    <div className="overflow-hidden rounded-[2.4rem] bg-[radial-gradient(circle_at_top_left,#fff6df_0%,#f5fbff_36%,#e6f7f0_100%)] shadow-[0_22px_54px_rgba(34,49,49,0.1)]">
      <div className="grid gap-6 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
        <section className="space-y-5">
          <div className="rounded-[2rem] bg-white/82 p-5 shadow-[0_14px_34px_rgba(34,49,49,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7e6a39]">{text.setLabel}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#223131]">{text.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#5d706f]">{text.subtitle}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] bg-[#fff7de] px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a6a1e]">Set</p>
                <p className="mt-2 text-lg font-black text-[#533500]">{questionSet.title}</p>
              </div>
              <div className="rounded-[1.4rem] bg-[#e0f2ff] px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#245984]">{text.examinerLabel}</p>
                <p className="mt-2 text-lg font-black text-[#163d5a]">Oral Test Examiner</p>
              </div>
              <div className="rounded-[1.4rem] bg-[#e5f8ef] px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1f6a50]">Theme</p>
                <p className="mt-2 text-lg font-black text-[#174638]">{questionSet.theme}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#20312f] p-5 text-white shadow-[0_18px_36px_rgba(20,31,29,0.18)]">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void realtime.connectSession(SPEAKING_TEST_EXAMINER_CHARACTER_ID)}
                disabled={realtime.connectionState === "connecting" || realtime.connectionState === "connected"}
                className="inline-flex items-center gap-2 rounded-full bg-[#ffd548] px-5 py-3 text-sm font-black text-[#5a4700] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Waves className="size-4" />
                {text.connect}
              </button>

              <button
                type="button"
                onClick={() => void handleStartMic()}
                disabled={!canStartMic}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[#223131] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Mic className={`size-4 ${realtime.isMicActive ? "animate-pulse" : ""}`} />
                {text.startMic}
              </button>

              <button
                type="button"
                onClick={() => void handleOver()}
                disabled={!canOver}
                className="inline-flex items-center gap-2 rounded-full bg-[#ff9585] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <StopCircle className="size-4" />
                {text.over}
              </button>

              <button
                type="button"
                onClick={() => void realtime.disconnectSession()}
                disabled={realtime.connectionState !== "connected"}
                className="inline-flex items-center gap-2 rounded-full bg-[#33504d] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Volume2 className="size-4" />
                {text.disconnect}
              </button>

              <button
                type="button"
                onClick={() => void resetTest()}
                className="inline-flex items-center gap-2 rounded-full bg-[#294644] px-5 py-3 text-sm font-black text-white"
              >
                <RefreshCcw className="size-4" />
                {text.reset}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm leading-7 text-white/78">
                {recorder.isSupported ? text.micHint : text.unsupported}
              </p>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                {text.bridgeHint} · {bridgeUrl}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/86 p-5 shadow-[0_14px_34px_rgba(34,49,49,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7c6a37]">{text.questionLabel}</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-[#223131]">
                  Question {Math.min(currentQuestionIndex + 1, questionSet.questions.length)} / {questionSet.questions.length}
                </h3>
              </div>
              <div className="rounded-full bg-[#223131] px-4 py-2 text-sm font-black text-white">
                {currentQuestion?.expectedSeconds ?? 0}s
              </div>
            </div>

            <div className="mt-5 rounded-[1.6rem] bg-[#fff7dd] p-5">
              <p className="text-lg font-bold leading-8 text-[#3a3424]">
                {currentQuestion?.prompt || "All questions have been answered."}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#655a41]">
                {currentQuestion?.preparationHint || "The test is complete."}
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {questionSet.questions.map((question, index) => {
                const answer = orderedAnswers.find((item) => item.question_id === question.id);
                const isCurrent = index === currentQuestionIndex && feedback === null;

                return (
                  <div
                    key={question.id}
                    className={`rounded-[1.4rem] border px-4 py-4 ${
                      answer
                        ? "border-[#ccebdc] bg-[#effaf4]"
                        : isCurrent
                          ? "border-[#ffd57f] bg-[#fff8e5]"
                          : "border-white/70 bg-white/70"
                    }`}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#728382]">Question {index + 1}</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-[#223131]">{question.prompt}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#486360]">
                      {answer ? <CheckCircle2 className="size-4 text-[#2c8b62]" /> : <MessageSquareQuote className="size-4" />}
                      {answer ? `${answer.duration_sec}s recorded` : "Awaiting answer"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/86 p-5 shadow-[0_14px_34px_rgba(34,49,49,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7c6a37]">Live Status</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[1.3rem] bg-[#eef7ff] px-4 py-4 text-sm leading-7 text-[#35546f]">
                {error ||
                  (isScoring
                    ? text.scoring
                    : isTranscribing
                      ? text.transcribing
                      : status || realtime.status || text.waiting)}
              </div>

              {realtime.logs.slice(-5).map((entry) => (
                <div
                  key={entry.id}
                  className={`rounded-[1.2rem] px-4 py-3 text-sm leading-6 ${
                    entry.tone === "error"
                      ? "bg-[#fff2f0] text-[#9f433b]"
                      : entry.tone === "success"
                        ? "bg-[#eef9f3] text-[#226246]"
                        : entry.tone === "warn"
                          ? "bg-[#fff8ea] text-[#88601f]"
                          : "bg-[#f5f8f8] text-[#576c6b]"
                  }`}
                >
                  {entry.message}
                </div>
              ))}

              {(isQuestionQueued || isTranscribing || isScoring) && (
                <div className="inline-flex items-center gap-2 rounded-full bg-[#223131] px-4 py-2 text-sm font-bold text-white">
                  <LoaderCircle className="size-4 animate-spin" />
                  {isScoring ? text.scoring : isTranscribing ? text.transcribing : "Queuing the next examiner turn..."}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="rounded-[2rem] bg-white/88 p-5 shadow-[0_14px_34px_rgba(34,49,49,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7c6a37]">{text.answerLabel}</p>
            <div className="mt-4 space-y-3">
              {orderedAnswers.length === 0 ? (
                <div className="rounded-[1.4rem] bg-[#f7faf9] px-4 py-4 text-sm text-[#6a7e7c]">{text.noAnswer}</div>
              ) : (
                orderedAnswers.map((answer, index) => (
                  <div key={answer.question_id} className="rounded-[1.4rem] bg-[#f7faf9] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-[#223131]">Question {index + 1}</p>
                      <span className="rounded-full bg-[#dff2ea] px-3 py-1 text-xs font-black text-[#236246]">
                        {answer.duration_sec}s
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[#78908d]">{answer.prompt}</p>
                    <p className="mt-3 text-sm leading-7 text-[#425756]">{answer.transcript}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#fefaf0] p-5 shadow-[0_14px_34px_rgba(34,49,49,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#936e19]">{text.analysisTitle}</p>

            {feedback ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-[1.6rem] bg-[#223131] px-5 py-5 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">{text.totalScore}</p>
                  <div className="mt-2 flex items-end gap-3">
                    <span className="text-5xl font-black">{feedback.overall_score}</span>
                    <span className="pb-1 text-lg font-bold text-white/74">/ 100</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/78">{feedback.overall_comment}</p>
                </div>

                {[
                  ["Fluency", feedback.fluency_score, feedback.fluency_feedback],
                  ["Pronunciation", feedback.pronunciation_score, feedback.pronunciation_feedback],
                  ["Intonation", feedback.intonation_score, feedback.intonation_feedback],
                  ["Vocabulary Range", feedback.vocabulary_score, feedback.vocabulary_feedback],
                  ["Grammar Variety", feedback.grammar_score, feedback.grammar_feedback],
                ].map(([label, score, comment]) => (
                  <div key={label} className="rounded-[1.4rem] bg-white px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-[#223131]">{label}</p>
                      <span className="rounded-full bg-[#fff3cb] px-3 py-1 text-xs font-black text-[#7e5f13]">
                        {score} / 20
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[#526766]">{comment}</p>
                  </div>
                ))}

                <div className="rounded-[1.4rem] bg-white px-4 py-4">
                  <p className="text-sm font-black text-[#223131]">{text.transcriptOverview}</p>
                  <p className="mt-3 text-sm leading-7 text-[#526766]">{feedback.transcript_overview}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.4rem] bg-white px-4 py-4">
                    <p className="text-sm font-black text-[#223131]">{text.strengths}</p>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-[#526766]">
                      {feedback.strengths.map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[1.4rem] bg-white px-4 py-4">
                    <p className="text-sm font-black text-[#223131]">{text.priorities}</p>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-[#526766]">
                      {feedback.priorities.map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-[1.5rem] bg-white px-4 py-5 text-sm leading-7 text-[#5f7372]">
                Complete all 3 answers to unlock the detailed five-dimension evaluation.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
