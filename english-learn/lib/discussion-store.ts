import type {
  DiscussionComment,
  DiscussionPost,
} from "@/components/discussion/types";

export const DISCUSSION_STORAGE_KEY = "discussion_posts_v1";
const DISCUSSION_CHANGE_EVENT = "discussion-posts-changed";

export const defaultDiscussionPosts: DiscussionPost[] = [
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

export const defaultDiscussionPostsString = JSON.stringify(defaultDiscussionPosts);

function isDiscussionComment(value: unknown): value is DiscussionComment {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.author === "string" &&
    typeof record.content === "string" &&
    typeof record.createdAt === "string"
  );
}

function isDiscussionPost(value: unknown): value is DiscussionPost {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    typeof record.content === "string" &&
    typeof record.author === "string" &&
    typeof record.tag === "string" &&
    typeof record.likes === "number" &&
    typeof record.liked === "boolean" &&
    typeof record.pinned === "boolean" &&
    typeof record.createdAt === "string" &&
    Array.isArray(record.comments) &&
    record.comments.every(isDiscussionComment)
  );
}

function isDiscussionPostArray(value: unknown): value is DiscussionPost[] {
  return Array.isArray(value) && value.every(isDiscussionPost);
}

export function subscribeDiscussionPosts(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => onStoreChange();

  window.addEventListener("storage", handler);
  window.addEventListener(DISCUSSION_CHANGE_EVENT, handler as EventListener);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(DISCUSSION_CHANGE_EVENT, handler as EventListener);
  };
}

export function getDiscussionPostsSnapshot() {
  if (typeof window === "undefined") return defaultDiscussionPostsString;
  return (
    window.localStorage.getItem(DISCUSSION_STORAGE_KEY) ??
    defaultDiscussionPostsString
  );
}

export function getDiscussionPostsServerSnapshot() {
  return defaultDiscussionPostsString;
}

export function parseDiscussionPosts(raw: string) {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isDiscussionPostArray(parsed) ? parsed : defaultDiscussionPosts;
  } catch {
    return defaultDiscussionPosts;
  }
}

export function readDiscussionPosts() {
  return parseDiscussionPosts(getDiscussionPostsSnapshot());
}

export function writeDiscussionPosts(nextPosts: DiscussionPost[]) {
  if (typeof window === "undefined") return;

  const serialized = JSON.stringify(nextPosts);
  window.localStorage.setItem(DISCUSSION_STORAGE_KEY, serialized);
  window.dispatchEvent(new Event(DISCUSSION_CHANGE_EVENT));
}

export function appendDiscussionPost(post: DiscussionPost) {
  const currentPosts = readDiscussionPosts();
  writeDiscussionPosts([post, ...currentPosts]);
}
