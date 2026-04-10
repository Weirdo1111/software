"use client";

import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState, startTransition } from "react";
import { LoaderCircle, Mic, RotateCcw, Send, Volume2, X } from "lucide-react";

import { DiscussionBoard } from "@/components/discussion/discussion-board";
import { formatRecordingTime } from "@/components/forms/speaking/formatters";
import { useAudioRecorder } from "@/components/forms/speaking/use-audio-recorder";
import type {
  DiscussionCategory,
  DiscussionNotification,
  DiscussionPost,
  Locale,
} from "@/components/discussion/types";

type DiscussionViewMode = "all" | "latest" | "popular";

const MAX_VOICE_MS = 59_000;
const MAX_VOICE_DATA_URL_LENGTH = 3_000_000;

async function readJsonOrFallback<T>(response: Response, fallback: T): Promise<T> {
  const text = await response.text();
  if (!text.trim()) return fallback;

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

function normalizeCategory(value?: string): DiscussionCategory | "all" {
  if (!value || value === "all") return "all";

  const valid: Array<DiscussionCategory> = [
    "grammar",
    "listening",
    "reading",
    "writing",
    "speaking",
    "assessment",
    "experience",
  ];

  return valid.includes(value as DiscussionCategory) ? (value as DiscussionCategory) : "all";
}

function normalizeView(value?: string): DiscussionViewMode {
  return value === "latest" || value === "popular" ? value : "all";
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

export function DiscussionClient({
  locale,
  initialCategory,
  initialView,
  initialSearch,
}: {
  locale: Locale;
  initialCategory?: string;
  initialView?: string;
  initialSearch?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const recorder = useAudioRecorder({ maxDurationMs: MAX_VOICE_MS });
  const {
    audioClip,
    audioLevel,
    elapsedMs,
    error: recorderError,
    isSupported,
    resetRecording,
    startRecording,
    status,
    stopRecording,
  } = recorder;

  const [openComposer, setOpenComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<DiscussionCategory>("grammar");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [notifications, setNotifications] = useState<DiscussionNotification[]>([]);
  const [selectedTag, setSelectedTag] = useState<DiscussionCategory | "all">(() =>
    normalizeCategory(initialCategory),
  );
  const [view, setView] = useState<DiscussionViewMode>(() => normalizeView(initialView));
  const [search, setSearch] = useState(initialSearch ?? "");
  const deferredSearch = useDeferredValue(search);

  const text = {
    zh: {
      dialogTitle: "发起新讨论",
      dialogSubtitle: "现在主贴支持文字和语音，可以只发文字，也可以附带一段语音说明。",
      category: "分类",
      title: "标题",
      content: "正文",
      contentHint: "可输入文字，或直接录制一段语音主贴。",
      cancel: "取消",
      publish: "发布",
      publishing: "发布中...",
      placeholderTitle: "请输入一个清晰的帖子标题",
      placeholderContent: "写下你的问题、背景、分析或学习经验...",
      titleRequired: "标题不能为空",
      titleShort: "标题至少需要 6 个字符",
      contentRequired: "请填写正文或录制语音",
      contentShort: "纯文字帖子正文至少需要 20 个字符",
      publishFailed: "发布失败，请稍后再试。",
      voicePost: "语音主贴",
      voicePreview: "语音预览",
      voiceAttached: "语音已添加到帖子",
      voiceLimit: "建议单条语音控制在 60 秒内。",
      voiceAutoStopped: "录音接近 60 秒上限，已自动停止。",
      voiceReadFailed: "语音读取失败，请重新录制。",
      voiceTooLarge: "语音文件过大，请控制在约 60 秒内。",
      recorderUnsupported: "当前浏览器不支持麦克风录音。",
      startRecording: "开始录音",
      stopRecording: "停止录音",
      reset: "重录",
      categories: {
        grammar: "语法",
        listening: "听力",
        reading: "阅读",
        writing: "写作",
        speaking: "口语",
        assessment: "测评",
        experience: "经验分享",
      },
      loading: "加载中...",
    },
    en: {
      dialogTitle: "Start New Discussion",
      dialogSubtitle:
        "Main posts can now include text and voice. You can publish text only or attach a short audio clip.",
      category: "Category",
      title: "Title",
      content: "Content",
      contentHint: "Text is optional when a voice clip is attached.",
      cancel: "Cancel",
      publish: "Publish",
      publishing: "Publishing...",
      placeholderTitle: "Enter a clear topic title",
      placeholderContent: "Write your question, context, analysis, or learning experience...",
      titleRequired: "Title is required",
      titleShort: "Title must be at least 6 characters",
      contentRequired: "Add text or a voice message",
      contentShort: "Text-only posts must be at least 20 characters",
      publishFailed: "Failed to create post",
      voicePost: "Voice post",
      voicePreview: "Voice preview",
      voiceAttached: "Voice attached to the post",
      voiceLimit: "Keep each voice message under about 60 seconds.",
      voiceAutoStopped: "The recorder stopped automatically near the 60 second limit.",
      voiceReadFailed: "The voice clip could not be processed. Please record again.",
      voiceTooLarge: "The voice message is too large. Keep it under about 60 seconds.",
      recorderUnsupported: "Microphone recording is not available in this browser.",
      startRecording: "Start recording",
      stopRecording: "Stop recording",
      reset: "Reset",
      categories: {
        grammar: "Grammar",
        listening: "Listening",
        reading: "Reading",
        writing: "Writing",
        speaking: "Speaking",
        assessment: "Assessment",
        experience: "Experience",
      },
      loading: "Loading...",
    },
  }[locale];

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const activityRes = await fetch("/api/discussion/activity", { cache: "no-store" });
        const activityJson = await readJsonOrFallback<{ notifications?: DiscussionNotification[] }>(
          activityRes,
          {},
        );
        setNotifications(activityJson.notifications ?? []);
      } catch {
        setNotifications([]);
      }
    };

    void loadNotifications();
  }, []);

  const postsQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedTag !== "all") params.set("category", selectedTag);
    if (view !== "all") params.set("view", view);
    if (deferredSearch.trim()) params.set("search", deferredSearch.trim());
    return params.toString();
  }, [deferredSearch, selectedTag, view]);

  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      setLoading(true);

      try {
        const postsRes = await fetch(`/api/discussion/posts${postsQuery ? `?${postsQuery}` : ""}`, {
          cache: "no-store",
        });
        const postsJson = await readJsonOrFallback<DiscussionPost[]>(postsRes, []);

        if (!cancelled) {
          setPosts(postsJson);
        }
      } catch {
        if (!cancelled) {
          setPosts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPosts();

    return () => {
      cancelled = true;
    };
  }, [postsQuery]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("lang", locale);
    if (selectedTag !== "all") params.set("category", selectedTag);
    if (view !== "all") params.set("view", view);
    if (deferredSearch.trim()) params.set("search", deferredSearch.trim());

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [deferredSearch, locale, pathname, router, selectedTag, view]);

  useEffect(() => {
    if (status === "recording" && elapsedMs >= MAX_VOICE_MS) {
      stopRecording();
      setError(text.voiceAutoStopped);
    }
  }, [elapsedMs, status, stopRecording, text.voiceAutoStopped]);

  useEffect(() => {
    if (error) {
      setError("");
    }
  }, [audioClip, content, title]);

  const isRecording = status === "recording" || status === "paused";
  const levelWidth = `${Math.max(6, Math.round(audioLevel * 100))}%`;
  const composerStatusLabel = !isSupported
    ? text.recorderUnsupported
    : isRecording
      ? `${text.stopRecording} ${formatRecordingTime(elapsedMs)}`
      : audioClip
        ? `${text.voiceAttached} ${formatRecordingTime(audioClip.durationMs)}`
        : text.voiceLimit;

  const closeComposer = () => {
    if (isRecording) {
      stopRecording();
    }
    setOpenComposer(false);
  };

  const handleMicToggle = async () => {
    if (!isSupported) {
      setError(text.recorderUnsupported);
      return;
    }

    setError("");

    if (isRecording) {
      stopRecording();
      return;
    }

    await startRecording();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setError(text.titleRequired);
      return;
    }

    if (trimmedTitle.length < 6) {
      setError(text.titleShort);
      return;
    }

    if (!trimmedContent && !audioClip) {
      setError(text.contentRequired);
      return;
    }

    if (!audioClip && trimmedContent.length < 20) {
      setError(text.contentShort);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      let audioDataUrl: string | undefined;

      if (audioClip) {
        audioDataUrl = await blobToDataUrl(audioClip.blob);
        if (audioDataUrl.length > MAX_VOICE_DATA_URL_LENGTH) {
          setError(text.voiceTooLarge);
          return;
        }
      }

      const res = await fetch("/api/discussion/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          category,
          audioDataUrl,
          audioMimeType: audioClip?.mimeType,
          audioDurationSec: audioClip ? Math.max(1, Math.round(audioClip.durationMs / 1000)) : undefined,
        }),
      });

      const result = await readJsonOrFallback<DiscussionPost | { error?: string } | null>(res, null);

      if (!res.ok) {
        const message =
          result && typeof result === "object" && "error" in result ? result.error : undefined;
        setError(message || text.publishFailed);
        return;
      }

      const created =
        result && typeof result === "object" && "id" in result ? (result as DiscussionPost) : null;
      if (!created) {
        setError(text.publishFailed);
        return;
      }

      setPosts((prev) => [created, ...prev]);
      setTitle("");
      setContent("");
      setCategory("grammar");
      if (audioClip) {
        await resetRecording();
      }
      setOpenComposer(false);
    } catch {
      setError(audioClip ? text.voiceReadFailed : text.publishFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    const res = await fetch(`/api/discussion/posts/${postId}/like`, {
      method: "POST",
    });

    const data = await readJsonOrFallback<
      { liked: boolean; likes: number } | { error?: string } | null
    >(res, null);

    if (!res.ok || !data || !("liked" in data)) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, liked: data.liked, likes: data.likes } : post,
      ),
    );

    const activityRes = await fetch("/api/discussion/activity", { cache: "no-store" });
    const activityJson = await readJsonOrFallback<{ notifications?: DiscussionNotification[] }>(
      activityRes,
      {},
    );
    setNotifications(activityJson.notifications ?? []);
  };

  return (
    <>
      {loading ? (
        <div className="p-8 text-sm text-slate-500">{text.loading}</div>
      ) : (
        <DiscussionBoard
          locale={locale}
          posts={posts}
          notifications={notifications}
          selectedTag={selectedTag}
          view={view}
          search={search}
          roleplayHref={`/discussion/roleplay?lang=${locale}`}
          seminarHref={`/discussion/seminars?lang=${locale}`}
          onSearchChange={setSearch}
          onSelectTag={setSelectedTag}
          onSelectView={setView}
          onOpenComposer={() => setOpenComposer(true)}
          onToggleLike={handleToggleLike}
        />
      )}

      {openComposer ? (
        <div
          className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-24 sm:py-28"
          onClick={closeComposer}
        >
          <div
            className="my-auto max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto bg-[#f9f9ff] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-[#dde2f3] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl text-[#030813]">{text.dialogTitle}</h2>
                  <p className="mt-2 text-sm text-[#45474C]">{text.dialogSubtitle}</p>
                </div>

                <button
                  type="button"
                  onClick={closeComposer}
                  className="shrink-0 text-[#45474C]"
                  aria-label={text.cancel}
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#45474C]">
                  {text.category}
                </label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as DiscussionCategory)}
                  className="h-12 w-full border border-[#c6c6cc] bg-white px-4 outline-none"
                >
                  <option value="grammar">{text.categories.grammar}</option>
                  <option value="listening">{text.categories.listening}</option>
                  <option value="reading">{text.categories.reading}</option>
                  <option value="writing">{text.categories.writing}</option>
                  <option value="speaking">{text.categories.speaking}</option>
                  <option value="assessment">{text.categories.assessment}</option>
                  <option value="experience">{text.categories.experience}</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#45474C]">
                  {text.title}
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={text.placeholderTitle}
                  className="w-full border border-[#c6c6cc] bg-white px-4 py-3 outline-none"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#45474C]">
                    {text.content}
                  </label>
                  <span className="text-xs text-[#6b7280]">{text.contentHint}</span>
                </div>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={text.placeholderContent}
                  rows={10}
                  className="w-full resize-none border border-[#c6c6cc] bg-white px-4 py-3 outline-none"
                />
              </div>

              <div className="rounded-[1.75rem] border border-[#dde2f3] bg-[#f3f5ff] p-4">
                {audioClip ? (
                  <div className="mb-3 rounded-2xl border border-[#dde2f3] bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#45474C]">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#f3f5ff] px-3 py-1 font-medium text-[#030813]">
                          <Volume2 className="size-3.5" />
                          {text.voicePreview}
                        </span>
                        <span>
                          {formatRecordingTime(audioClip.durationMs)} • {getClipSizeLabel(audioClip.blob)}
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
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#030813]">{text.voicePost}</p>
                        <p className="mt-1 text-xs text-[#45474C]">
                          {composerStatusLabel}
                        </p>
                      </div>
                    </div>

                    {isRecording ? (
                      <>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8ebf7]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#2a6958] via-[#d88e34] to-[#c36d59] transition-all duration-150"
                            style={{ width: levelWidth }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-[#be123c]">{formatRecordingTime(elapsedMs)}</p>
                      </>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleMicToggle()}
                    disabled={!isSupported && !isRecording}
                    className={`inline-flex size-12 shrink-0 items-center justify-center rounded-full border transition ${
                      isRecording
                        ? "border-[#f1c3cf] bg-[#fff1f5] text-[#be123c]"
                        : "border-[#cfd5ea] bg-white text-[#030813]"
                    } disabled:cursor-not-allowed disabled:opacity-45`}
                    aria-label={isRecording ? text.stopRecording : text.startRecording}
                    title={isRecording ? text.stopRecording : text.startRecording}
                  >
                    <Mic className={`size-5 ${isRecording ? "animate-pulse" : ""}`} />
                  </button>
                </div>

                {recorderError ? (
                  <p className="mt-4 rounded-xl bg-[#fff7fa] px-4 py-3 text-sm text-[#be123c]">
                    {recorderError}
                  </p>
                ) : null}
              </div>

              {error ? (
                <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3 border-t border-[#dde2f3] pt-5">
                <button
                  type="button"
                  onClick={closeComposer}
                  className="text-sm font-medium text-[#45474C]"
                >
                  {text.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={isSubmitting || isRecording}
                  className="inline-flex items-center gap-2 bg-[#030813] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isSubmitting ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {isSubmitting ? text.publishing : text.publish}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default DiscussionClient;
