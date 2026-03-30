"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { ArrowRight, LockKeyhole, MessageSquareText, Plus, Search, Users, X } from "lucide-react";

import type { SeminarRoomSummary } from "@/components/discussion/seminar-types";
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

function statusTone(status: SeminarRoomSummary["status"]) {
  if (status === "ACTIVE") {
    return "bg-[rgba(56,199,180,0.16)] text-[#165e56]";
  }

  if (status === "ARCHIVED") {
    return "bg-[rgba(255,190,73,0.18)] text-[#7b5d1a]";
  }

  return "bg-[rgba(49,65,102,0.12)] text-[#314166]";
}

function visibilityTone(visibility: SeminarRoomSummary["visibility"]) {
  return visibility === "PUBLIC"
    ? "bg-[rgba(90,123,255,0.14)] text-[#3654b5]"
    : "bg-[rgba(255,143,129,0.18)] text-[#92443a]";
}

type VisibilityFilter = "ALL" | SeminarRoomSummary["visibility"];

export function SeminarRoomsClient({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [rooms, setRooms] = useState<SeminarRoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openComposer, setOpenComposer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<SeminarRoomSummary["visibility"]>("PUBLIC");
  const [password, setPassword] = useState("");
  const [topicTag, setTopicTag] = useState("");
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("ALL");
  const deferredSearch = useDeferredValue(search);

  const text = {
    zh: {
      badge: "Forum Extension",
      title: "在线研讨室",
      subtitle:
        "把 discussion 扩展成更像 seminar workspace 的空间。公开房间可直接进入，受保护房间在通过密码后获得成员权限。",
      create: "创建研讨室",
      forumFeed: "返回论坛帖子",
      searchPlaceholder: "搜索房间标题、简介或主持人",
      all: "全部",
      public: "公开",
      protected: "受保护",
      participants: "参与者",
      host: "主持人",
      active: "活跃于",
      enter: "进入房间",
      empty: "还没有研讨室。创建第一个房间作为 forum 里的专题交流空间。",
      roomStatus: {
        ACTIVE: "开放中",
        ARCHIVED: "已归档",
        CLOSED: "已关闭",
      },
      roomVisibility: {
        PUBLIC: "公开",
        PROTECTED: "密码保护",
      },
      createTitle: "新建研讨室",
      createHint: "保持字段简洁，和论坛版块风格一致。",
      fieldTitle: "标题",
      fieldDescription: "简介",
      fieldVisibility: "可见性",
      fieldTopic: "主题标签",
      fieldPassword: "房间密码",
      titlePlaceholder: "例如：IELTS Seminar Warm-up",
      descriptionPlaceholder: "说明讨论目标、目标同学或资料使用方式。",
      passwordPlaceholder: "仅受保护房间需要填写",
      cancel: "取消",
      publish: "创建并进入",
      creating: "创建中...",
      createError: "创建失败，请稍后重试。",
      titleRequired: "请输入至少 3 个字符的标题。",
      passwordRequired: "受保护房间需要设置密码。",
      noPreview: "进入房间后查看最近消息。",
    },
    en: {
      badge: "Forum Extension",
      title: "Seminar Rooms",
      subtitle:
        "Extend the forum into a seminar-style workspace. Public rooms open directly, while protected rooms grant membership after password verification.",
      create: "Create room",
      forumFeed: "Back to forum posts",
      searchPlaceholder: "Search by room title, summary, or host",
      all: "All",
      public: "Public",
      protected: "Protected",
      participants: "participants",
      host: "Host",
      active: "Active",
      enter: "Enter room",
      empty: "No seminar rooms yet. Create the first room as a focused extension of the forum.",
      roomStatus: {
        ACTIVE: "Active",
        ARCHIVED: "Archived",
        CLOSED: "Closed",
      },
      roomVisibility: {
        PUBLIC: "Public",
        PROTECTED: "Protected",
      },
      createTitle: "Create seminar room",
      createHint: "Keep the setup concise so it feels native to the existing forum.",
      fieldTitle: "Title",
      fieldDescription: "Description",
      fieldVisibility: "Visibility",
      fieldTopic: "Topic",
      fieldPassword: "Room password",
      titlePlaceholder: "For example: Evidence Clinic for Friday Seminar",
      descriptionPlaceholder: "Explain the goal, audience, or how the room should be used.",
      passwordPlaceholder: "Required only for protected rooms",
      cancel: "Cancel",
      publish: "Create and enter",
      creating: "Creating...",
      createError: "Failed to create room. Please try again.",
      titleRequired: "Enter a title with at least 3 characters.",
      passwordRequired: "Protected rooms need a password.",
      noPreview: "Open the room to see the latest messages.",
    },
  }[locale];

  useEffect(() => {
    let cancelled = false;

    const loadRooms = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/discussion/seminars/rooms", { cache: "no-store" });
        const payload = await readJson<SeminarRoomSummary[]>(response);

        if (!response.ok) {
          throw new Error("Failed to load seminar rooms");
        }

        if (!cancelled) {
          setRooms(payload ?? []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setRooms([]);
          setError(loadError instanceof Error ? loadError.message : "Failed to load seminar rooms");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadRooms();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRooms = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return rooms.filter((room) => {
      if (visibilityFilter !== "ALL" && room.visibility !== visibilityFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [room.title, room.description, room.ownerName, room.lastMessagePreview]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [deferredSearch, rooms, visibilityFilter]);

  const handleCreateRoom = async () => {
    const trimmedTitle = title.trim();
    const trimmedPassword = password.trim();

    if (trimmedTitle.length < 3) {
      setError(text.titleRequired);
      return;
    }

    if (visibility === "PROTECTED" && trimmedPassword.length < 6) {
      setError(text.passwordRequired);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/discussion/seminars/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          description: description.trim(),
          visibility,
          password: visibility === "PROTECTED" ? trimmedPassword : undefined,
          topicTag: topicTag || undefined,
        }),
      });

      const payload = await readJson<SeminarRoomSummary | { error?: string }>(response);

      if (!response.ok || !payload || !("id" in payload)) {
        setError(
          payload && "error" in payload && payload.error ? payload.error : text.createError,
        );
        return;
      }

      setRooms((current) => [payload, ...current]);
      setOpenComposer(false);
      setTitle("");
      setDescription("");
      setVisibility("PUBLIC");
      setPassword("");
      setTopicTag("");

      startTransition(() => {
        router.push(`/discussion/seminars/${payload.id}?lang=${locale}`);
      });
    } catch {
      setError(text.createError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <p className="section-label">{text.badge}</p>
            <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
              {text.title}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
              {text.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/discussion?lang=${locale}`} className="party-button-ghost">
              {text.forumFeed}
            </Link>
            <button type="button" onClick={() => setOpenComposer(true)} className="party-button">
              <Plus className="size-4" />
              {text.create}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-3 rounded-[1.4rem] border border-white/80 bg-white/80 px-4 py-3 shadow-[0_8px_22px_rgba(20,50,75,0.06)]">
            <Search className="size-4 text-[var(--ink-soft)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={text.searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--ink-soft)]/80"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {([
              ["ALL", text.all],
              ["PUBLIC", text.public],
              ["PROTECTED", text.protected],
            ] as Array<[VisibilityFilter, string]>).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setVisibilityFilter(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  visibilityFilter === value
                    ? "bg-[var(--navy)] text-white shadow-[0_12px_24px_rgba(90,123,255,0.24)]"
                    : "border border-white/80 bg-white/80 text-[var(--ink)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6">
        {loading ? (
          <div className="surface-panel rounded-[2rem] p-8 text-sm text-[var(--ink-soft)]">
            Loading seminar rooms...
          </div>
        ) : error ? (
          <div className="surface-panel rounded-[2rem] p-8 text-sm text-[#8c3e3a]">{error}</div>
        ) : filteredRooms.length === 0 ? (
          <div className="surface-panel rounded-[2rem] p-10 text-center text-sm text-[var(--ink-soft)]">
            {text.empty}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredRooms.map((room) => (
              <article
                key={room.id}
                className="campus-card bg-[linear-gradient(165deg,rgba(255,255,255,0.99),rgba(246,250,255,0.93),rgba(255,244,248,0.9))] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span className={`rounded-full px-2.5 py-1 ${visibilityTone(room.visibility)}`}>
                        {text.roomVisibility[room.visibility]}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 ${statusTone(room.status)}`}>
                        {text.roomStatus[room.status]}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-[var(--ink)]">{room.title}</h3>
                  </div>

                  {room.visibility === "PROTECTED" ? (
                    <span className="rounded-full bg-[rgba(255,143,129,0.14)] p-2 text-[#92443a]">
                      <LockKeyhole className="size-4" />
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 min-h-16 text-sm leading-6 text-[var(--ink-soft)]">
                  {room.description || text.noPreview}
                </p>

                <div className="mt-4 rounded-[1.4rem] border border-white/80 bg-white/80 p-4 text-sm text-[var(--ink)] shadow-[0_10px_24px_rgba(20,50,75,0.05)]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">
                      {text.host}: {room.ownerName}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[var(--ink-soft)]">
                      <Users className="size-4" />
                      {room.participantCount}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-[var(--ink-soft)]">
                    {text.active} {formatRelativeTime(room.lastActiveAt, locale)}
                  </div>

                  <div className="mt-3 flex items-start gap-2 text-sm text-[var(--ink-soft)]">
                    <MessageSquareText className="mt-0.5 size-4 shrink-0" />
                    <span>{room.lastMessagePreview || text.noPreview}</span>
                  </div>
                </div>

                <Link
                  href={`/discussion/seminars/${room.id}?lang=${locale}`}
                  className="mt-5 inline-flex w-full items-center justify-between rounded-[1.4rem] bg-[var(--navy)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(90,123,255,0.22)] transition hover:translate-y-[-1px]"
                >
                  {text.enter}
                  <ArrowRight className="size-4" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {openComposer ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(20,35,64,0.42)] px-4"
          onClick={() => setOpenComposer(false)}
        >
          <div
            className="surface-panel w-full max-w-2xl rounded-[2rem] p-6 sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-label">{text.createTitle}</p>
                <h3 className="mt-4 text-2xl font-semibold text-[var(--ink)]">{text.createTitle}</h3>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">{text.createHint}</p>
              </div>

              <button
                type="button"
                onClick={() => setOpenComposer(false)}
                className="rounded-full bg-white/80 p-2 text-[var(--ink-soft)]"
                aria-label={text.cancel}
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[var(--ink)]">{text.fieldTitle}</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={text.titlePlaceholder}
                  className="rounded-[1.2rem] border border-white/80 bg-white/88 px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[var(--ink)]">{text.fieldDescription}</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={text.descriptionPlaceholder}
                  className="min-h-28 rounded-[1.2rem] border border-white/80 bg-white/88 px-4 py-3 text-sm outline-none"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[var(--ink)]">{text.fieldVisibility}</span>
                  <select
                    value={visibility}
                    onChange={(event) =>
                      setVisibility(event.target.value as SeminarRoomSummary["visibility"])
                    }
                    className="rounded-[1.2rem] border border-white/80 bg-white/88 px-4 py-3 text-sm outline-none"
                  >
                    <option value="PUBLIC">{text.roomVisibility.PUBLIC}</option>
                    <option value="PROTECTED">{text.roomVisibility.PROTECTED}</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[var(--ink)]">{text.fieldTopic}</span>
                  <select
                    value={topicTag}
                    onChange={(event) => setTopicTag(event.target.value)}
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
              </div>

              {visibility === "PROTECTED" ? (
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[var(--ink)]">{text.fieldPassword}</span>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={text.passwordPlaceholder}
                    type="password"
                    className="rounded-[1.2rem] border border-white/80 bg-white/88 px-4 py-3 text-sm outline-none"
                  />
                </label>
              ) : null}
            </div>

            {error ? <p className="mt-4 text-sm text-[#8c3e3a]">{error}</p> : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setOpenComposer(false)} className="party-button-ghost">
                {text.cancel}
              </button>
              <button
                type="button"
                onClick={() => void handleCreateRoom()}
                disabled={submitting}
                className="party-button disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? text.creating : text.publish}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
