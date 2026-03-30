"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Eye,
  Heart,
  LoaderCircle,
  MessageCircle,
  Mic,
  RotateCcw,
  Send,
  Volume2,
} from "lucide-react";

import { formatRecordingTime } from "@/components/forms/speaking/formatters";
import { useAudioRecorder } from "@/components/forms/speaking/use-audio-recorder";
import type {
  DiscussionCommentInput,
  DiscussionPost,
  Locale,
} from "@/components/discussion/types";

const MAX_VOICE_MS = 59_000;
const MAX_VOICE_DATA_URL_LENGTH = 3_000_000;

interface DiscussionDetailProps {
  locale: Locale;
  post: DiscussionPost;
  onLike: () => void;
  onAddComment: (
    input: DiscussionCommentInput
  ) => Promise<{ ok: boolean; error?: string }>;
  commentDraft: string;
  setCommentDraft: (value: string) => void;
}

function formatRelativeDate(dateString: string, locale: Locale) {
  const date = new Date(dateString.replace(" ", "T"));
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) {
    const value = Math.max(1, Math.floor(diff / minute));
    return locale === "zh" ? `${value} 分钟前` : `${value}m ago`;
  }

  if (diff < day) {
    const value = Math.floor(diff / hour);
    return locale === "zh" ? `${value} 小时前` : `${value}h ago`;
  }

  const value = Math.floor(diff / day);
  return locale === "zh" ? `${value} 天前` : `${value}d ago`;
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unexpected FileReader result"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read audio file"));
    reader.readAsDataURL(blob);
  });
}

function getClipSizeLabel(blob: Blob) {
  if (blob.size < 1024 * 1024) {
    return `${Math.max(1, Math.round(blob.size / 1024))} KB`;
  }

  return `${(blob.size / (1024 * 1024)).toFixed(1)} MB`;
}

export function DiscussionDetail({
  locale,
  post,
  onLike,
  onAddComment,
  commentDraft,
  setCommentDraft,
}: DiscussionDetailProps) {
  const recorder = useAudioRecorder();
  const {
    audioClip,
    audioLevel,
    elapsedMs,
    error,
    isSupported,
    resetRecording,
    startRecording,
    status,
    stopRecording,
  } = recorder;
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const text = {
    zh: {
      back: "返回讨论区",
      reply: "发送评论",
      sending: "发送中...",
      replyPlaceholder: "写下你的回复，或者录一段语音留言。",
      comments: "评论区",
      noComments: "还没有评论。",
      views: "浏览",
      recorderTitle: "语音评论",
      recorderHint: "录音会先保留在浏览器里，确认后再随评论一起发送。",
      startRecording: "开始录音",
      stopRecordingInline: "结束录音",
      tapToStop: "再次点击麦克风结束",
      pause: "暂停",
      resume: "继续",
      stop: "停止",
      reset: "重录",
      recorderUnsupported: "当前浏览器不支持麦克风录音。",
      recorderReady: "麦克风已就绪",
      recorderRecording: "正在录音",
      recorderPaused: "录音已暂停",
      recorderSaved: "语音已保存",
      voicePreview: "语音预览",
      voiceComment: "语音评论",
      voiceOnly: "仅语音评论",
      voiceLimit: "单条语音建议控制在 60 秒内。",
      voiceAutoStopped: "已接近 60 秒上限，录音已自动停止。",
      voiceReadFailed: "语音读取失败，请重新录制。",
      voiceTooLarge: "语音过大，请控制在约 60 秒内。",
      requireContent: "请输入文字或录制语音。",
      submitFailed: "评论发送失败，请稍后重试。",
      audioSummary: "本地预览",
      levelLabel: "麦克风电平",
      live: "录音中",
      idle: "待机",
      voiceAttached: "语音已加入输入区",
    },
    en: {
      back: "Back to Forum",
      reply: "Post reply",
      sending: "Posting...",
      replyPlaceholder: "Write your response or record a short voice message.",
      comments: "Discussion Replies",
      noComments: "No replies yet.",
      views: "Views",
      recorderTitle: "Voice reply",
      recorderHint: "The clip stays in your browser until you post the comment.",
      startRecording: "Start recording",
      stopRecordingInline: "Stop recording",
      tapToStop: "Tap the mic again to stop",
      pause: "Pause",
      resume: "Resume",
      stop: "Stop",
      reset: "Reset",
      recorderUnsupported: "Microphone recording is not available in this browser.",
      recorderReady: "Recorder ready",
      recorderRecording: "Recording live",
      recorderPaused: "Recording paused",
      recorderSaved: "Voice saved",
      voicePreview: "Voice preview",
      voiceComment: "Voice comment",
      voiceOnly: "Voice-only comment",
      voiceLimit: "Keep each voice message under about 60 seconds.",
      voiceAutoStopped: "The recorder stopped automatically near the 60 second limit.",
      voiceReadFailed: "The voice clip could not be processed. Please record again.",
      voiceTooLarge: "The voice message is too large. Keep it under about 60 seconds.",
      requireContent: "Add text or a voice message.",
      submitFailed: "Failed to post comment. Please try again.",
      audioSummary: "Local preview",
      levelLabel: "Mic level",
      live: "LIVE",
      idle: "IDLE",
      voiceAttached: "Voice attached to the composer",
    },
  }[locale];

  useEffect(() => {
    if (submitError) {
      setSubmitError("");
    }
  }, [audioClip, commentDraft, submitError]);

  useEffect(() => {
    if (status === "recording" && elapsedMs >= MAX_VOICE_MS) {
      stopRecording();
      setSubmitError(text.voiceAutoStopped);
    }
  }, [elapsedMs, status, stopRecording, text.voiceAutoStopped]);

  const levelWidth = `${Math.max(6, Math.round(audioLevel * 100))}%`;
  const isRecording = status === "recording" || status === "paused";
  const composerStatusLabel = !isSupported
    ? text.recorderUnsupported
    : isRecording
      ? `${text.recorderRecording} ${formatRecordingTime(elapsedMs)}`
      : audioClip
        ? `${text.voiceAttached} ${formatRecordingTime(audioClip.durationMs)}`
        : text.voiceLimit;

  const handleMicToggle = async () => {
    if (!isSupported) {
      setSubmitError(text.recorderUnsupported);
      return;
    }

    setSubmitError("");

    if (isRecording) {
      stopRecording();
      return;
    }

    await startRecording();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const trimmed = commentDraft.trim();
    if (!trimmed && !audioClip) {
      setSubmitError(text.requireContent);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      let audioDataUrl: string | undefined;

      if (audioClip) {
        audioDataUrl = await blobToDataUrl(audioClip.blob);
        if (audioDataUrl.length > MAX_VOICE_DATA_URL_LENGTH) {
          setSubmitError(text.voiceTooLarge);
          return;
        }
      }

      const result = await onAddComment({
        content: trimmed,
        audioDataUrl,
        audioMimeType: audioClip?.mimeType,
        audioDurationSec: audioClip
          ? Math.max(1, Math.round(audioClip.durationMs / 1000))
          : undefined,
      });

      if (!result.ok) {
        setSubmitError(result.error ?? text.submitFailed);
        return;
      }

      if (audioClip) {
        await resetRecording();
      }
    } catch {
      setSubmitError(text.voiceReadFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <header className="border-b border-[#dde2f3] bg-[#f9f9ff] px-8 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-serif text-2xl font-bold text-[#1A202C]">
            LearnEnglishRight
          </span>
          <Link
            href={`/discussion?lang=${locale}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#45474C]"
          >
            <ChevronLeft className="size-4" />
            {text.back}
          </Link>
        </div>
      </header>

      <main className="px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <article className="bg-white px-8 py-10 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              {post.pinned ? (
                <span className="bg-[#eddfbd] px-2 py-0.5 text-[10px] font-bold uppercase text-[#6c6247]">
                  Pinned
                </span>
              ) : null}
              <span className="bg-[#bdc7dc] px-2 py-0.5 text-[10px] font-bold uppercase text-[#3d4759]">
                {post.tag}
              </span>
            </div>

            <h1 className="font-serif text-4xl leading-tight text-[#030813]">
              {post.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#45474C]">
              <span className="font-medium text-[#030813]">{post.author}</span>
              <span>&bull;</span>
              <span>{formatRelativeDate(post.createdAt, locale)}</span>
            </div>

            <div className="mt-8 border-t border-[#dde2f3] pt-8">
              <p className="whitespace-pre-line text-[17px] leading-8 text-[#2a303d]">
                {post.content}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-[#dde2f3] pt-6">
              <button
                type="button"
                onClick={onLike}
                className={`inline-flex items-center gap-2 text-sm font-medium ${
                  post.liked ? "text-rose-600" : "text-[#45474C]"
                }`}
              >
                <Heart className={`size-4 ${post.liked ? "fill-current" : ""}`} />
                {post.likes}
              </button>

              <div className="inline-flex items-center gap-2 text-sm text-[#45474C]">
                <MessageCircle className="size-4" />
                {post.comments.length}
              </div>

              <div className="inline-flex items-center gap-2 text-sm text-[#45474C]">
                <Eye className="size-4" />
                {post.views} {text.views}
              </div>
            </div>
          </article>

          <section className="mt-10 bg-white px-8 py-8 shadow-sm">
            <h2 className="font-serif text-2xl text-[#030813]">{text.comments}</h2>

            <div className="mt-6 space-y-4">
              {post.comments.length === 0 ? (
                <div className="text-sm text-[#45474C]">{text.noComments}</div>
              ) : null}

              {post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-t border-[#eef2ff] pt-4 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-[#030813]">{comment.author}</span>
                    <span className="text-xs text-[#45474C]">
                      {formatRelativeDate(comment.createdAt, locale)}
                    </span>
                  </div>

                  {comment.content ? (
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#2a303d]">
                      {comment.content}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm italic text-[#6b7280]">{text.voiceOnly}</p>
                  )}

                  {comment.audioDataUrl ? (
                    <div className="mt-3 rounded-2xl border border-[#dde2f3] bg-[#f9f9ff] p-4">
                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#45474C]">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1">
                          <Volume2 className="size-3.5" />
                          {text.voiceComment}
                        </span>
                        {comment.audioDurationSec ? (
                          <span>{formatRecordingTime(comment.audioDurationSec * 1000)}</span>
                        ) : null}
                      </div>
                      <audio
                        controls
                        preload="none"
                        src={comment.audioDataUrl}
                        className="mt-3 w-full"
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-[#dde2f3] pt-6">
              <div className="rounded-[1.75rem] border border-[#dde2f3] bg-[#f9f9ff] p-4">
                {audioClip ? (
                  <div className="mb-3 rounded-2xl border border-[#dde2f3] bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#45474C]">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#f3f5ff] px-3 py-1 font-medium text-[#030813]">
                          <Volume2 className="size-3.5" />
                          {text.voicePreview}
                        </span>
                        <span>
                          {formatRecordingTime(audioClip.durationMs)} &bull;{" "}
                          {getClipSizeLabel(audioClip.blob)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => void resetRecording()}
                        className="inline-flex items-center gap-2 rounded-full border border-[#cfd5ea] bg-white px-3 py-1.5 text-xs font-medium text-[#030813]"
                      >
                        <RotateCcw className="size-3.5" />
                        {text.reset}
                      </button>
                    </div>
                    <audio controls src={audioClip.url} className="mt-3 w-full" />
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <div className="flex-1 rounded-[1.5rem] border border-[#c6c6cc] bg-white px-4 py-3">
                    <textarea
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      placeholder={text.replyPlaceholder}
                      rows={audioClip ? 3 : 4}
                      className="w-full resize-none bg-transparent text-sm outline-none"
                    />

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[#45474C]">
                          {composerStatusLabel}
                        </p>
                        {isRecording ? (
                          <>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8ebf7]">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#2a6958] via-[#d88e34] to-[#c36d59] transition-all duration-150"
                                style={{ width: levelWidth }}
                              />
                            </div>
                            <p className="mt-2 text-xs text-[#be123c]">{text.tapToStop}</p>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => void handleMicToggle()}
                      disabled={!isSupported && !isRecording}
                      className={`inline-flex size-12 items-center justify-center rounded-full border transition ${
                        isRecording
                          ? "border-[#f1c3cf] bg-[#fff1f5] text-[#be123c]"
                          : "border-[#cfd5ea] bg-white text-[#030813]"
                      } disabled:cursor-not-allowed disabled:opacity-45`}
                      aria-label={
                        isRecording ? text.stopRecordingInline : text.startRecording
                      }
                      title={
                        isRecording ? text.stopRecordingInline : text.startRecording
                      }
                    >
                      <Mic className={`size-5 ${isRecording ? "animate-pulse" : ""}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleSubmit()}
                      disabled={isSubmitting || isRecording}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#030813] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {isSubmitting ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                      <span>{isSubmitting ? text.sending : text.reply}</span>
                    </button>
                  </div>
                </div>

                {error ? (
                  <p className="mt-4 rounded-xl bg-[#fff7fa] px-4 py-3 text-sm text-[#be123c]">
                    {error}
                  </p>
                ) : null}
              </div>

              {submitError ? (
                <p className="mt-4 rounded-xl bg-[#fff7fa] px-4 py-3 text-sm text-[#be123c]">
                  {submitError}
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default DiscussionDetail;
