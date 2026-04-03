"use client";

import { use, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ChangeEvent } from "react";
import {
  Mic,
  Pause,
  Plus,
  RotateCcw,
  Send,
  Square,
  Upload,
  Waves,
  X,
} from "lucide-react";

import { DiscussionBoard } from "@/components/discussion/discussion-board";
import { formatRecordingTime } from "@/components/forms/speaking/formatters";
import { useAudioRecorder } from "@/components/forms/speaking/use-audio-recorder";
import { PageFrame } from "@/components/page-frame";

type Locale = "zh" | "en";

export type DiscussionVoiceNote = {
  dataUrl: string;
  mimeType: string;
  durationMs: number;
};

export type DiscussionComment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

export type DiscussionPost = {
  id: string;
  title: string;
  content: string;
  author: string;
  tag: string;
  likes: number;
  liked: boolean;
  pinned: boolean;
  createdAt: string;
  voiceNote?: DiscussionVoiceNote;
  comments: DiscussionComment[];
};

type UploadedVoiceDraft = DiscussionVoiceNote & {
  sizeBytes: number;
};

const STORAGE_KEY = "discussion_posts_v1";
const MAX_VOICE_NOTE_BYTES = 2 * 1024 * 1024;

const defaultPosts: DiscussionPost[] = [
  {
    id: "p1",
    title: "How should I prepare for reassessment next week?",
    content:
      "My current band is Medium. I want to know whether I should spend more time on speaking or reading before the next reassessment window opens.",
    author: "Shengze",
    tag: "Assessment",
    likes: 8,
    liked: false,
    pinned: true,
    createdAt: "2026-03-20 09:30",
    comments: [
      {
        id: "c1",
        author: "Tutor Team",
        content:
          "If speaking is lagging behind your reading metrics, prioritize one output task each day before reassessment.",
        createdAt: "2026-03-20 10:10",
      },
    ],
  },
  {
    id: "p2",
    title: "Useful strategy for academic listening note-taking",
    content:
      "I started splitting notes into keywords, argument flow, and evidence. It reduced overload during longer listening tasks.",
    author: "Mia",
    tag: "Listening",
    likes: 5,
    liked: false,
    pinned: false,
    createdAt: "2026-03-19 18:20",
    comments: [],
  },
];

const defaultPostsString = JSON.stringify(defaultPosts);

function subscribePosts(onStoreChange: () => void) {
  const handler = () => onStoreChange();

  window.addEventListener("storage", handler);
  window.addEventListener(
    "discussion-posts-changed",
    handler as EventListener,
  );

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(
      "discussion-posts-changed",
      handler as EventListener,
    );
  };
}

function getPostsSnapshot() {
  if (typeof window === "undefined") return defaultPostsString;
  return window.localStorage.getItem(STORAGE_KEY) ?? defaultPostsString;
}

function getPostsServerSnapshot() {
  return defaultPostsString;
}

function writePosts(nextPosts: DiscussionPost[]) {
  const serialized = JSON.stringify(nextPosts);
  window.localStorage.setItem(STORAGE_KEY, serialized);
  window.dispatchEvent(new Event("discussion-posts-changed"));
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Could not encode the audio clip."));
    };
    reader.onerror = () => reject(new Error("Could not encode the audio clip."));
    reader.readAsDataURL(blob);
  });
}

function getAudioDurationMs(file: File) {
  return new Promise<number>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const audio = document.createElement("audio");

    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const durationMs = Number.isFinite(audio.duration)
        ? Math.round(audio.duration * 1000)
        : 0;
      URL.revokeObjectURL(objectUrl);
      resolve(durationMs);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read the audio length."));
    };
    audio.src = objectUrl;
  });
}

interface DiscussionPageProps {
  searchParams: Promise<{
    lang?: string;
  }>;
}

export default function DiscussionPage({
  searchParams,
}: DiscussionPageProps) {
  const resolvedSearchParams = use(searchParams);
  const locale: Locale = resolvedSearchParams?.lang === "en" ? "en" : "zh";

  const [openComposer, setOpenComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [composerError, setComposerError] = useState("");
  const [uploadedVoice, setUploadedVoice] = useState<UploadedVoiceDraft | null>(
    null,
  );
  const [category, setCategory] = useState(
    locale === "zh" ? "学习讨论" : "Discussion",
  );
  const recorder = useAudioRecorder();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const postsRaw = useSyncExternalStore(
    subscribePosts,
    getPostsSnapshot,
    getPostsServerSnapshot,
  );

  const posts = useMemo<DiscussionPost[]>(() => {
    try {
      return JSON.parse(postsRaw) as DiscussionPost[];
    } catch {
      return defaultPosts;
    }
  }, [postsRaw]);

  const copy = useMemo(
    () => ({
      pageTitle: locale === "zh" ? "讨论区" : "Discussion",
      pageDescription:
        locale === "zh"
          ? "围绕学习任务、测评反馈和学习策略进行交流，也可以在发帖时附上一段语音。"
          : "A focused discussion space for learning strategy, assessment feedback, and voice-supported posts.",
      postTitle: locale === "zh" ? "发布帖子" : "Create a Post",
      postSubtitle:
        locale === "zh"
          ? "分享你的问题、经验、反馈，或直接附上一段语音。"
          : "Share a question, reflection, or voice note with the community.",
      inputTitle: locale === "zh" ? "帖子标题" : "Post Title",
      inputContent: locale === "zh" ? "帖子内容" : "Post Content",
      inputCategory: locale === "zh" ? "帖子分类" : "Category",
      titlePlaceholder:
        locale === "zh" ? "写一个清晰的标题" : "Write a clear title",
      contentPlaceholder:
        locale === "zh"
          ? "写下你的问题、背景、练习反馈或学习心得"
          : "Write your question, feedback, or learning notes",
      cancel: locale === "zh" ? "取消" : "Cancel",
      submit: locale === "zh" ? "发布" : "Submit",
      emptyTitle:
        locale === "zh"
          ? "标题必填，内容和语音至少填写一项。"
          : "A title is required, and you need content or a voice note.",
      voiceSectionTitle: locale === "zh" ? "语音内容" : "Voice Note",
      voiceSectionHint:
        locale === "zh"
          ? "可以录制语音，也可以上传已有音频文件。"
          : "Record a voice note or upload an audio file.",
      voiceLimitHint:
        locale === "zh"
          ? "建议控制在 2MB 以内，避免超出浏览器本地存储限制。"
          : "Keep audio within 2 MB to avoid local storage limits.",
      voiceUpload: locale === "zh" ? "上传音频" : "Upload Audio",
      voiceStart: locale === "zh" ? "开始录音" : "Start",
      voicePause: locale === "zh" ? "暂停" : "Pause",
      voiceResume: locale === "zh" ? "继续" : "Resume",
      voiceStop: locale === "zh" ? "结束" : "Stop",
      voiceReset: locale === "zh" ? "移除语音" : "Remove Audio",
      voicePreview: locale === "zh" ? "语音预览" : "Voice Preview",
      voiceReady:
        locale === "zh"
          ? "语音已准备好，会随帖子一起发布。"
          : "Voice note ready to send.",
      voiceUploadError:
        locale === "zh"
          ? "这个文件无法识别为音频，请更换文件。"
          : "This file is not a supported audio file.",
      voiceTooLarge:
        locale === "zh" ? "音频不能超过 2MB。" : "Audio must be smaller than 2 MB.",
      voiceMicUnsupported:
        locale === "zh"
          ? "当前浏览器不支持麦克风录音，可以改用上传音频。"
          : "Microphone recording is not supported here. Upload an audio file instead.",
      voiceUploadOrRecord:
        locale === "zh"
          ? "你可以上传已有音频，或直接录一段语音。"
          : "Upload an audio file or record one now.",
      categories:
        locale === "zh"
          ? ["学习讨论", "练习反馈", "测评分析", "经验分享"]
          : ["Discussion", "Feedback", "Assessment", "Experience"],
    }),
    [locale],
  );

  const activeVoicePreview = uploadedVoice
    ? {
        url: uploadedVoice.dataUrl,
        durationMs: uploadedVoice.durationMs,
        mimeType: uploadedVoice.mimeType,
      }
    : recorder.audioClip
      ? {
          url: recorder.audioClip.url,
          durationMs: recorder.audioClip.durationMs,
          mimeType: recorder.audioClip.mimeType,
        }
      : null;

  const recordingVoiceTooLarge =
    (recorder.audioClip?.blob.size ?? 0) > MAX_VOICE_NOTE_BYTES;

  async function resetComposer() {
    setTitle("");
    setContent("");
    setComposerError("");
    setUploadedVoice(null);
    setCategory(copy.categories[0]);
    setOpenComposer(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    await recorder.resetRecording();
  }

  async function handleAudioFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setComposerError("");

    if (!file.type.startsWith("audio/")) {
      setUploadedVoice(null);
      setComposerError(copy.voiceUploadError);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_VOICE_NOTE_BYTES) {
      setUploadedVoice(null);
      setComposerError(copy.voiceTooLarge);
      event.target.value = "";
      return;
    }

    try {
      const [durationMs, dataUrl] = await Promise.all([
        getAudioDurationMs(file),
        blobToDataUrl(file),
      ]);

      await recorder.resetRecording();
      setUploadedVoice({
        dataUrl,
        mimeType: file.type || "audio/webm",
        durationMs,
        sizeBytes: file.size,
      });
    } catch {
      setUploadedVoice(null);
      setComposerError(copy.voiceUploadError);
      event.target.value = "";
    }
  }

  async function handleStartRecording() {
    setComposerError("");
    setUploadedVoice(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    await recorder.startRecording();
  }

  async function handleResetVoice() {
    setComposerError("");
    setUploadedVoice(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    await recorder.resetRecording();
  }

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const hasVoice = Boolean(uploadedVoice || recorder.audioClip);

    if (!trimmedTitle || (!trimmedContent && !hasVoice)) {
      setComposerError(copy.emptyTitle);
      return;
    }

    if (recordingVoiceTooLarge) {
      setComposerError(copy.voiceTooLarge);
      return;
    }

    let voiceNote: DiscussionVoiceNote | undefined;

    if (uploadedVoice) {
      voiceNote = {
        dataUrl: uploadedVoice.dataUrl,
        mimeType: uploadedVoice.mimeType,
        durationMs: uploadedVoice.durationMs,
      };
    } else if (recorder.audioClip) {
      const dataUrl = await blobToDataUrl(recorder.audioClip.blob);
      voiceNote = {
        dataUrl,
        mimeType: recorder.audioClip.mimeType,
        durationMs: recorder.audioClip.durationMs,
      };
    }

    const newPost: DiscussionPost = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      content: trimmedContent,
      author: "You",
      tag: category,
      likes: 0,
      liked: false,
      pinned: false,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      voiceNote,
      comments: [],
    };

    writePosts([newPost, ...posts]);
    await resetComposer();
  }

  const handleLike = (postId: string) => {
    const nextPosts = posts.map((post) => {
      if (post.id !== postId) return post;
      const liked = !post.liked;

      return {
        ...post,
        liked,
        likes: liked ? post.likes + 1 : Math.max(0, post.likes - 1),
      };
    });

    writePosts(nextPosts);
  };

  const handleAddComment = (postId: string, commentText: string) => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    const newComment = {
      id: crypto.randomUUID(),
      author: "You",
      content: trimmed,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };

    const nextPosts = posts.map((post) =>
      post.id === postId
        ? { ...post, comments: [...post.comments, newComment] }
        : post,
    );

    writePosts(nextPosts);
  };

  return (
    <PageFrame
      locale={locale}
      title={copy.pageTitle}
      description={copy.pageDescription}
    >
      <div className="mx-auto w-full px-4 py-5 sm:px-6">
        <section className="rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,251,246,0.88)] p-2 shadow-[0_14px_36px_rgba(23,32,51,0.08)] backdrop-blur-md">
          <div className="rounded-[1.35rem] border border-[rgba(20,50,75,0.08)] bg-white/45 px-4 py-4 sm:px-5 sm:py-5">
            <DiscussionBoard
              locale={locale}
              posts={posts}
              onLike={handleLike}
              onAddComment={handleAddComment}
              onOpenComposer={() => setOpenComposer(true)}
            />
          </div>
        </section>

        <button
          type="button"
          onClick={() => setOpenComposer(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--navy)] text-[#f7efe3] shadow-[0_12px_28px_rgba(23,32,51,0.2)] transition hover:scale-[1.03] hover:opacity-95 active:scale-[0.98]"
          aria-label={copy.postTitle}
        >
          <Plus className="size-4.5" />
        </button>

        {openComposer ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[2px]">
            <div className="w-full max-w-xl rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,251,246,0.98)] shadow-[0_22px_50px_rgba(23,32,51,0.14)]">
              <div className="flex items-start justify-between border-b border-[rgba(20,50,75,0.08)] px-5 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--ink)]">
                    {copy.postTitle}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    {copy.postSubtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    void resetComposer();
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[1.1rem] text-[var(--ink-soft)] transition hover:bg-white/80 hover:text-[var(--ink)]"
                  aria-label={copy.cancel}
                >
                  <X className="size-4.5" />
                </button>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--ink)]">
                    {copy.inputCategory}
                  </label>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="h-10 w-full rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/90 px-4 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--navy)]"
                  >
                    {copy.categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--ink)]">
                    {copy.inputTitle}
                  </label>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={copy.titlePlaceholder}
                    className="h-10 w-full rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/90 px-4 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-soft)] transition focus:border-[var(--navy)]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--ink)]">
                    {copy.inputContent}
                  </label>
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder={copy.contentPlaceholder}
                    rows={7}
                    className="w-full rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/90 px-4 py-3 text-sm leading-6 text-[var(--ink)] outline-none placeholder:text-[var(--ink-soft)] transition focus:border-[var(--navy)]"
                  />
                </div>

                <div className="rounded-[1.25rem] border border-[rgba(20,50,75,0.1)] bg-[rgba(255,251,246,0.72)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <label className="block text-sm font-medium text-[var(--ink)]">
                        {copy.voiceSectionTitle}
                      </label>
                      <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                        {copy.voiceSectionHint}
                      </p>
                      <p className="text-xs text-[var(--ink-soft)]">
                        {copy.voiceLimitHint}
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/90 px-4 text-sm font-medium text-[var(--ink)] transition hover:bg-white"
                    >
                      <Upload className="size-4" />
                      {copy.voiceUpload}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        void handleStartRecording();
                      }}
                      disabled={
                        !recorder.isSupported ||
                        recorder.status === "recording" ||
                        recorder.status === "paused"
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-[1.1rem] bg-[var(--navy)] px-4 text-sm font-medium text-[#f7efe3] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Mic className="size-4" />
                      {copy.voiceStart}
                    </button>

                    <button
                      type="button"
                      onClick={recorder.pauseRecording}
                      disabled={recorder.status !== "recording"}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/90 px-4 text-sm font-medium text-[var(--ink)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Pause className="size-4" />
                      {copy.voicePause}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void recorder.resumeRecording();
                      }}
                      disabled={recorder.status !== "paused"}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/90 px-4 text-sm font-medium text-[var(--ink)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Waves className="size-4" />
                      {copy.voiceResume}
                    </button>

                    <button
                      type="button"
                      onClick={recorder.stopRecording}
                      disabled={
                        recorder.status !== "recording" &&
                        recorder.status !== "paused"
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-[1.1rem] border border-[rgba(195,109,89,0.18)] bg-[rgba(255,244,240,0.92)] px-4 text-sm font-medium text-[var(--coral)] transition hover:bg-[rgba(255,244,240,1)] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Square className="size-4" />
                      {copy.voiceStop}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void handleResetVoice();
                      }}
                      disabled={!uploadedVoice && !recorder.audioClip}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/90 px-4 text-sm font-medium text-[var(--ink)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <RotateCcw className="size-4" />
                      {copy.voiceReset}
                    </button>
                  </div>

                  <div className="mt-4 rounded-[1rem] border border-[rgba(20,50,75,0.08)] bg-white/82 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                          {copy.voicePreview}
                        </p>
                        <p className="mt-1 text-sm text-[var(--ink)]">
                          {formatRecordingTime(recorder.elapsedMs)}
                        </p>
                      </div>

                      <div className="h-2.5 w-32 overflow-hidden rounded-full bg-[rgba(20,50,75,0.08)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#2a6958] via-[#d88e34] to-[#c36d59] transition-all duration-150"
                          style={{
                            width: `${Math.max(8, Math.round(recorder.audioLevel * 100))}%`,
                          }}
                        />
                      </div>
                    </div>

                    {activeVoicePreview ? (
                      <div className="mt-3">
                        <p className="text-sm leading-6 text-[var(--ink-soft)]">
                          {copy.voiceReady} {formatRecordingTime(activeVoicePreview.durationMs)} • {activeVoicePreview.mimeType}
                        </p>
                        <audio controls src={activeVoicePreview.url} className="mt-3 w-full" />
                      </div>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                        {recorder.isSupported
                          ? copy.voiceUploadOrRecord
                          : copy.voiceMicUnsupported}
                      </p>
                    )}
                  </div>

                  {recordingVoiceTooLarge ? (
                    <p className="mt-3 text-sm font-medium text-[var(--coral)]">
                      {copy.voiceTooLarge}
                    </p>
                  ) : null}

                  {recorder.error ? (
                    <p className="mt-3 text-sm font-medium text-[var(--coral)]">
                      {recorder.error}
                    </p>
                  ) : null}
                </div>

                {composerError ? (
                  <p className="rounded-[1rem] bg-[rgba(255,244,240,0.92)] px-4 py-3 text-sm font-medium text-[var(--coral)]">
                    {composerError}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[rgba(20,50,75,0.08)] px-5 py-4">
                <button
                  type="button"
                  onClick={() => {
                    void resetComposer();
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/90 px-4 text-sm font-medium text-[var(--ink)] transition hover:bg-white"
                >
                  {copy.cancel}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    void handleSubmit();
                  }}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[1.1rem] bg-[var(--navy)] px-4 text-sm font-medium text-[#f7efe3] transition hover:opacity-95"
                >
                  <Send className="size-4" />
                  {copy.submit}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PageFrame>
  );
}
