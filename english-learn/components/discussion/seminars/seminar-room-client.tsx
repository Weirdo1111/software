"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Archive,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  LockKeyhole,
  MoreHorizontal,
  Paperclip,
  Send,
  Users,
  Volume2,
  Video,
  X,
} from "lucide-react";
import { useEffect, useEffectEvent, useMemo, useState } from "react";

import type {
  SeminarRoomAttachment,
  SeminarRoomDetail,
  SeminarRoomMessage,
} from "@/components/discussion/seminar-types";
import type { Locale } from "@/components/discussion/types";

async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function formatRelativeTime(value: string, locale: Locale) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) {
    const amount = Math.max(1, Math.floor(diff / minute));
    return locale === "zh" ? `${amount} 分钟前` : `${amount}m ago`;
  }

  if (diff < day) {
    const amount = Math.max(1, Math.floor(diff / hour));
    return locale === "zh" ? `${amount} 小时前` : `${amount}h ago`;
  }

  const amount = Math.max(1, Math.floor(diff / day));
  return locale === "zh" ? `${amount} 天前` : `${amount}d ago`;
}

function formatAbsoluteTime(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function mergeMessages(current: SeminarRoomMessage[], incoming: SeminarRoomMessage[]) {
  const existing = new Map(current.map((message) => [message.id, message]));

  for (const message of incoming) {
    existing.set(message.id, message);
  }

  return [...existing.values()].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

function fileSizeLabel(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function attachmentIcon(kind: SeminarRoomAttachment["fileKind"]) {
  if (kind === "image") return ImageIcon;
  if (kind === "video") return Video;
  if (kind === "audio") return Volume2;
  return FileText;
}

function renderAttachment(attachment: SeminarRoomAttachment) {
  if (attachment.fileKind === "image") {
    return (
      <a
        key={attachment.id}
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className="overflow-hidden rounded-[1.25rem] border border-white/70 bg-white/85"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={attachment.url} alt={attachment.fileName} className="h-52 w-full object-cover" />
      </a>
    );
  }

  if (attachment.fileKind === "video") {
    return (
      <video
        key={attachment.id}
        controls
        className="w-full rounded-[1.25rem] border border-white/70 bg-black/80"
        src={attachment.url}
      />
    );
  }

  if (attachment.fileKind === "audio") {
    return (
      <audio
        key={attachment.id}
        controls
        className="w-full"
        src={attachment.url}
      />
    );
  }

  const Icon = attachmentIcon(attachment.fileKind);

  return (
    <a
      key={attachment.id}
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-[1.2rem] border border-white/70 bg-white/90 px-4 py-3 text-sm text-[var(--ink)] shadow-[0_10px_20px_rgba(20,50,75,0.06)]"
    >
      <span className="rounded-full bg-[rgba(90,123,255,0.12)] p-2 text-[var(--navy)]">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 truncate">{attachment.fileName}</span>
      <span className="text-xs text-[var(--ink-soft)]">{fileSizeLabel(attachment.fileSize)}</span>
    </a>
  );
}

export function SeminarRoomClient({ locale, roomId }: { locale: Locale; roomId: string }) {
  const router = useRouter();
  const [room, setRoom] = useState<SeminarRoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [composerText, setComposerText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [joinPassword, setJoinPassword] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsTitle, setSettingsTitle] = useState("");
  const [settingsDescription, setSettingsDescription] = useState("");
  const [settingsVisibility, setSettingsVisibility] =
    useState<SeminarRoomDetail["visibility"]>("PUBLIC");
  const [settingsPassword, setSettingsPassword] = useState("");
  const [settingsTopicTag, setSettingsTopicTag] = useState("");
  const [settingsStatus, setSettingsStatus] = useState<SeminarRoomDetail["status"]>("ACTIVE");

  const text = {
    zh: {
      back: "返回研讨室列表",
      participants: "参与者",
      host: "主持人",
      lastActive: "最后活跃",
      passwordTitle: "此房间需要密码",
      passwordHint: "通过密码后会为当前账号记录访问成员身份。",
      passwordInput: "输入房间密码",
      unlock: "进入房间",
      signInHint: "加入受保护房间需要先登录。",
      roomClosed: "该房间已归档或关闭，历史消息可读但不能发送新消息。",
      composerPlaceholder: "输入文本，或附上图片、视频、音频和文档。",
      attach: "添加附件",
      send: "发送",
      sending: "发送中...",
      settings: "房间设置",
      saveSettings: "保存设置",
      deleteRoom: "删除房间",
      close: "关闭",
      noMessages: "还没有消息。用第一条发言把这个 seminar room 启动起来。",
      loadError: "加载房间失败。",
      sendError: "消息发送失败。",
      settingsError: "房间更新失败。",
      deleteConfirm: "确定删除该房间吗？消息和附件都会被移除。",
      composerLabel: "消息输入",
      publicPasswordHint: "切换为公开房间后会移除当前密码。",
      status: {
        ACTIVE: "开放中",
        ARCHIVED: "已归档",
        CLOSED: "已关闭",
      },
      visibility: {
        PUBLIC: "公开",
        PROTECTED: "密码保护",
      },
      fieldTitle: "标题",
      fieldDescription: "简介",
      fieldVisibility: "可见性",
      fieldPassword: "新密码",
      fieldTopic: "主题",
      fieldStatus: "状态",
    },
    en: {
      back: "Back to seminar rooms",
      participants: "participants",
      host: "Host",
      lastActive: "Last active",
      passwordTitle: "This room is protected",
      passwordHint: "After verification, the current account is recorded as an authorized member.",
      passwordInput: "Enter room password",
      unlock: "Unlock room",
      signInHint: "Signing in is required before joining a protected room.",
      roomClosed: "This room is archived or closed. History stays visible, but new messages are disabled.",
      composerPlaceholder: "Write a message, or attach images, video, audio, and files.",
      attach: "Attach files",
      send: "Send",
      sending: "Sending...",
      settings: "Room settings",
      saveSettings: "Save settings",
      deleteRoom: "Delete room",
      close: "Close",
      noMessages: "No messages yet. Start the seminar thread with the first message.",
      loadError: "Failed to load the room.",
      sendError: "Failed to send the message.",
      settingsError: "Failed to update the room.",
      deleteConfirm: "Delete this room? Messages and attachments will also be removed.",
      composerLabel: "Composer",
      publicPasswordHint: "Switching to public removes the current room password.",
      status: {
        ACTIVE: "Active",
        ARCHIVED: "Archived",
        CLOSED: "Closed",
      },
      visibility: {
        PUBLIC: "Public",
        PROTECTED: "Protected",
      },
      fieldTitle: "Title",
      fieldDescription: "Description",
      fieldVisibility: "Visibility",
      fieldPassword: "New password",
      fieldTopic: "Topic",
      fieldStatus: "Status",
    },
  }[locale];

  const canCompose = room?.canSend && room.status === "ACTIVE";
  const latestMessageId = room?.messages.at(-1)?.id ?? null;

  const applyRoomDetail = (detail: SeminarRoomDetail) => {
    setRoom(detail);
    setSettingsTitle(detail.title);
    setSettingsDescription(detail.description ?? "");
    setSettingsVisibility(detail.visibility);
    setSettingsTopicTag(detail.topicTag ?? "");
    setSettingsStatus(detail.status);
    setSettingsPassword("");
  };

  const refreshRoom = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/discussion/seminars/rooms/${roomId}`, {
        cache: "no-store",
      });
      const payload = await readJson<SeminarRoomDetail | { error?: string }>(response);

      if (!payload || !("id" in payload)) {
        throw new Error(text.loadError);
      }

      applyRoomDetail(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : text.loadError);
    } finally {
      setLoading(false);
    }
  };

  const pollMessages = useEffectEvent(async () => {
    if (!room?.hasAccess) {
      return;
    }

    const response = await fetch(
      `/api/discussion/seminars/rooms/${roomId}/messages${latestMessageId ? `?after=${latestMessageId}` : ""}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return;
    }

    const payload = await readJson<{ messages?: SeminarRoomMessage[] }>(response);

    if (!payload?.messages?.length) {
      return;
    }

    setRoom((current) =>
      current
        ? {
            ...current,
            messages: mergeMessages(current.messages, payload.messages ?? []),
            lastActiveAt: (payload.messages ?? []).at(-1)?.createdAt ?? current.lastActiveAt,
          }
        : current,
    );
  });

  useEffect(() => {
    let cancelled = false;

    const loadOnMount = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/discussion/seminars/rooms/${roomId}`, {
          cache: "no-store",
        });
        const detail = await readJson<SeminarRoomDetail | { error?: string }>(response);

        if (!detail || !("id" in detail)) {
          throw new Error(text.loadError);
        }

        if (!cancelled) {
          applyRoomDetail(detail);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : text.loadError);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOnMount();

    return () => {
      cancelled = true;
    };
  }, [locale, roomId, text.loadError]);

  useEffect(() => {
    if (!room?.hasAccess) {
      return;
    }

    const timer = window.setInterval(() => {
      void pollMessages();
    }, 3_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [room?.hasAccess]);

  const groupedMessages = useMemo(() => room?.messages ?? [], [room?.messages]);

  const handleJoinRoom = async () => {
    setJoining(true);
    setJoinError("");

    try {
      const response = await fetch(`/api/discussion/seminars/rooms/${roomId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: joinPassword.trim(),
        }),
      });

      if (!response.ok) {
        const payload = await readJson<{ error?: string }>(response);
        setJoinError(payload?.error ?? text.signInHint);
        return;
      }

      setJoinPassword("");
      await refreshRoom();
    } finally {
      setJoining(false);
    }
  };

  const handleSendMessage = async () => {
    if (!room || !canCompose || sending) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const formData = new FormData();
      formData.set("content", composerText.trim());
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`/api/discussion/seminars/rooms/${roomId}/messages`, {
        method: "POST",
        body: formData,
      });

      const payload = await readJson<SeminarRoomMessage | { error?: string }>(response);

      if (!response.ok || !payload || !("id" in payload)) {
        setError(payload && "error" in payload && payload.error ? payload.error : text.sendError);
        return;
      }

      setRoom((current) =>
        current
          ? {
              ...current,
              messages: mergeMessages(current.messages, [payload]),
              lastActiveAt: payload.createdAt,
            }
          : current,
      );
      setComposerText("");
      setSelectedFiles([]);
    } catch {
      setError(text.sendError);
    } finally {
      setSending(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!room) {
      return;
    }

    setSavingSettings(true);
    setSettingsError("");

    try {
      const response = await fetch(`/api/discussion/seminars/rooms/${roomId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: settingsTitle,
          description: settingsDescription,
          visibility: settingsVisibility,
          password: settingsVisibility === "PROTECTED" ? settingsPassword.trim() || undefined : undefined,
          topicTag: settingsTopicTag || null,
          status: settingsStatus,
        }),
      });

      if (!response.ok) {
        const payload = await readJson<{ error?: string }>(response);
        setSettingsError(payload?.error ?? text.settingsError);
        return;
      }

      setSettingsOpen(false);
      await refreshRoom();
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm(text.deleteConfirm)) {
      return;
    }

    const response = await fetch(`/api/discussion/seminars/rooms/${roomId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = await readJson<{ error?: string }>(response);
      setSettingsError(payload?.error ?? text.settingsError);
      return;
    }

    router.push(`/discussion/seminars?lang=${locale}`);
  };

  if (loading) {
    return (
      <div className="surface-panel flex items-center gap-3 rounded-[2rem] p-8 text-sm text-[var(--ink-soft)]">
        <LoaderCircle className="size-4 animate-spin" />
        Loading seminar room...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="surface-panel rounded-[2rem] p-8 text-sm text-[#8c3e3a]">
        {error || text.loadError}
      </div>
    );
  }

  return (
    <>
      <section className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <Link
              href={`/discussion/seminars?lang=${locale}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)]"
            >
              <ArrowLeft className="size-4" />
              {text.back}
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-[rgba(90,123,255,0.14)] px-2.5 py-1 text-[#3654b5]">
                {text.visibility[room.visibility]}
              </span>
              <span className="rounded-full bg-[rgba(56,199,180,0.16)] px-2.5 py-1 text-[#165e56]">
                {text.status[room.status]}
              </span>
            </div>

            <div>
              <h2 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
                {room.title}
              </h2>
              {room.description ? (
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
                  {room.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px]">
            <div className="rounded-[1.4rem] border border-white/80 bg-white/84 p-4 shadow-[0_10px_22px_rgba(20,50,75,0.05)]">
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">{text.host}</div>
              <div className="mt-2 text-sm font-semibold text-[var(--ink)]">{room.ownerName}</div>
            </div>
            <div className="rounded-[1.4rem] border border-white/80 bg-white/84 p-4 shadow-[0_10px_22px_rgba(20,50,75,0.05)]">
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                {text.participants}
              </div>
              <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
                <Users className="size-4 text-[var(--navy)]" />
                {room.participantCount}
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-white/80 bg-white/84 p-4 shadow-[0_10px_22px_rgba(20,50,75,0.05)] sm:col-span-2">
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                {text.lastActive}
              </div>
              <div className="mt-2 text-sm font-semibold text-[var(--ink)]">
                {formatRelativeTime(room.lastActiveAt, locale)}
                <span className="ml-2 text-[var(--ink-soft)]">({formatAbsoluteTime(room.lastActiveAt, locale)})</span>
              </div>
            </div>
          </div>
        </div>

        {room.canManage ? (
          <div className="mt-5 flex justify-end">
            <button type="button" onClick={() => setSettingsOpen(true)} className="party-button-ghost">
              <MoreHorizontal className="size-4" />
              {text.settings}
            </button>
          </div>
        ) : null}
      </section>

      {!room.hasAccess ? (
        <section className="mt-6 surface-panel rounded-[2rem] p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="rounded-full bg-[rgba(255,143,129,0.16)] p-3 text-[#92443a]">
              <LockKeyhole className="size-5" />
            </span>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-[var(--ink)]">{text.passwordTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{text.passwordHint}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{text.signInHint}</p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  type="password"
                  value={joinPassword}
                  onChange={(event) => setJoinPassword(event.target.value)}
                  placeholder={text.passwordInput}
                  className="flex-1 rounded-[1.2rem] border border-white/80 bg-white/88 px-4 py-3 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => void handleJoinRoom()}
                  disabled={joining}
                  className="party-button disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {joining ? text.sending : text.unlock}
                </button>
              </div>

              {joinError ? <p className="mt-3 text-sm text-[#8c3e3a]">{joinError}</p> : null}
            </div>
          </div>
        </section>
      ) : (
        <>
          {room.status !== "ACTIVE" ? (
            <div className="mt-6 rounded-[1.6rem] border border-[rgba(255,190,73,0.35)] bg-[rgba(255,248,225,0.88)] px-5 py-4 text-sm text-[#7b5d1a]">
              {text.roomClosed}
            </div>
          ) : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="surface-panel rounded-[2rem] p-4 sm:p-5">
              <div className="max-h-[62vh] space-y-4 overflow-y-auto px-1 py-1">
                {groupedMessages.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-white/70 bg-white/70 px-5 py-10 text-center text-sm text-[var(--ink-soft)]">
                    {text.noMessages}
                  </div>
                ) : (
                  groupedMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[min(100%,44rem)] rounded-[1.6rem] px-4 py-3 shadow-[0_10px_20px_rgba(20,50,75,0.06)] ${
                          message.isOwn
                            ? "bg-[linear-gradient(135deg,rgba(90,123,255,0.98),rgba(56,199,180,0.86))] text-white"
                            : "border border-white/75 bg-white/92 text-[var(--ink)]"
                        }`}
                      >
                        <div className={`flex items-center gap-3 text-xs ${message.isOwn ? "text-white/80" : "text-[var(--ink-soft)]"}`}>
                          <span className="font-semibold">{message.senderName}</span>
                          <span>{formatRelativeTime(message.createdAt, locale)}</span>
                        </div>

                        {message.content ? (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                        ) : null}

                        {message.attachments.length > 0 ? (
                          <div className="mt-3 grid gap-3">
                            {message.attachments.map((attachment) => renderAttachment(attachment))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <aside className="surface-panel rounded-[2rem] p-4 sm:p-5">
              <div className="space-y-4">
                <div>
                  <p className="section-label">{text.composerLabel}</p>
                  <textarea
                    value={composerText}
                    onChange={(event) => setComposerText(event.target.value)}
                    placeholder={text.composerPlaceholder}
                    disabled={!canCompose}
                    className="mt-4 min-h-36 w-full rounded-[1.4rem] border border-white/80 bg-white/88 px-4 py-3 text-sm leading-6 outline-none disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-between rounded-[1.35rem] border border-dashed border-white/80 bg-white/80 px-4 py-3 text-sm font-semibold text-[var(--ink)]">
                  <span className="inline-flex items-center gap-2">
                    <Paperclip className="size-4 text-[var(--navy)]" />
                    {text.attach}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.zip"
                    className="hidden"
                    disabled={!canCompose}
                    onChange={(event) =>
                      setSelectedFiles(Array.from(event.target.files ?? []).slice(0, 6))
                    }
                  />
                </label>

                {selectedFiles.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => {
                      const Icon = file.type.startsWith("image/")
                        ? ImageIcon
                        : file.type.startsWith("video/")
                          ? Video
                          : file.type.startsWith("audio/")
                            ? Volume2
                            : FileText;

                      return (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center gap-3 rounded-[1.2rem] border border-white/70 bg-white/90 px-4 py-3 text-sm"
                        >
                          <Icon className="size-4 text-[var(--navy)]" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium text-[var(--ink)]">{file.name}</div>
                            <div className="text-xs text-[var(--ink-soft)]">{fileSizeLabel(file.size)}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedFiles((current) => current.filter((_, currentIndex) => currentIndex !== index))
                            }
                            className="rounded-full bg-[rgba(20,50,75,0.06)] p-1.5 text-[var(--ink-soft)]"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {error ? <p className="text-sm text-[#8c3e3a]">{error}</p> : null}

                <button
                  type="button"
                  onClick={() => void handleSendMessage()}
                  disabled={!canCompose || sending}
                  className="party-button w-full justify-center disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Send className="size-4" />
                  {sending ? text.sending : text.send}
                </button>
              </div>
            </aside>
          </section>
        </>
      )}

      {settingsOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(20,35,64,0.42)] px-4"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="surface-panel w-full max-w-2xl rounded-[2rem] p-6 sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-label">{text.settings}</p>
                <h3 className="mt-4 text-2xl font-semibold text-[var(--ink)]">{text.settings}</h3>
              </div>

              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-full bg-white/80 p-2 text-[var(--ink-soft)]"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[var(--ink)]">{text.fieldTitle}</span>
                <input
                  value={settingsTitle}
                  onChange={(event) => setSettingsTitle(event.target.value)}
                  className="rounded-[1.2rem] border border-white/80 bg-white/88 px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[var(--ink)]">{text.fieldDescription}</span>
                <textarea
                  value={settingsDescription}
                  onChange={(event) => setSettingsDescription(event.target.value)}
                  className="min-h-24 rounded-[1.2rem] border border-white/80 bg-white/88 px-4 py-3 text-sm outline-none"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[var(--ink)]">{text.fieldVisibility}</span>
                  <select
                    value={settingsVisibility}
                    onChange={(event) =>
                      setSettingsVisibility(event.target.value as SeminarRoomDetail["visibility"])
                    }
                    className="rounded-[1.2rem] border border-white/80 bg-white/88 px-4 py-3 text-sm outline-none"
                  >
                    <option value="PUBLIC">{text.visibility.PUBLIC}</option>
                    <option value="PROTECTED">{text.visibility.PROTECTED}</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[var(--ink)]">{text.fieldStatus}</span>
                  <select
                    value={settingsStatus}
                    onChange={(event) =>
                      setSettingsStatus(event.target.value as SeminarRoomDetail["status"])
                    }
                    className="rounded-[1.2rem] border border-white/80 bg-white/88 px-4 py-3 text-sm outline-none"
                  >
                    <option value="ACTIVE">{text.status.ACTIVE}</option>
                    <option value="ARCHIVED">{text.status.ARCHIVED}</option>
                    <option value="CLOSED">{text.status.CLOSED}</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[var(--ink)]">{text.fieldTopic}</span>
                  <select
                    value={settingsTopicTag}
                    onChange={(event) => setSettingsTopicTag(event.target.value)}
                    className="rounded-[1.2rem] border border-white/80 bg-white/88 px-4 py-3 text-sm outline-none"
                  >
                    <option value="">General</option>
                    <option value="grammar">Grammar</option>
                    <option value="listening">Listening</option>
                    <option value="reading">Reading</option>
                    <option value="writing">Writing</option>
                    <option value="speaking">Speaking</option>
                    <option value="assessment">Assessment</option>
                    <option value="experience">Experience</option>
                  </select>
                </label>

                {settingsVisibility === "PROTECTED" ? (
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-[var(--ink)]">{text.fieldPassword}</span>
                    <input
                      type="password"
                      value={settingsPassword}
                      onChange={(event) => setSettingsPassword(event.target.value)}
                      className="rounded-[1.2rem] border border-white/80 bg-white/88 px-4 py-3 text-sm outline-none"
                    />
                  </label>
                ) : (
                  <div className="rounded-[1.2rem] border border-dashed border-white/70 bg-white/72 px-4 py-3 text-sm text-[var(--ink-soft)]">
                    {text.publicPasswordHint}
                  </div>
                )}
              </div>
            </div>

            {settingsError ? <p className="mt-4 text-sm text-[#8c3e3a]">{settingsError}</p> : null}

            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={() => void handleDeleteRoom()}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,143,129,0.35)] bg-[rgba(255,143,129,0.1)] px-4 py-2.5 text-sm font-semibold text-[#92443a]"
              >
                <Archive className="size-4" />
                {text.deleteRoom}
              </button>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setSettingsOpen(false)} className="party-button-ghost">
                  {text.close}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSaveSettings()}
                  disabled={savingSettings}
                  className="party-button disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingSettings ? text.sending : text.saveSettings}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
