import type {
  DiscussionNotification,
  DiscussionPost,
} from "@/components/discussion/types";

export const STORAGE_KEY = "discussion_posts_v5";
export const NOTIFICATION_KEY = "discussion_notifications_v1";
export const CURRENT_USER = "You";

export const defaultPosts: DiscussionPost[] = [
  {
    id: "p1",
    title: "How should I improve academic listening under timed note-taking conditions?",
    content:
      "I often miss transitions and supporting details when lectures become denser. My current method is to write almost everything, which causes overload. I want to know how advanced learners balance selective note-taking, keyword capture, and main-idea tracking during listening exercises.",
    excerpt:
      "I often miss transitions and supporting details when lectures become denser. My current method is to write almost everything, which causes overload.",
    author: "You",
    tag: "listening",
    likes: 18,
    liked: false,
    pinned: true,
    createdAt: "2026-03-22 09:30",
    comments: [
      {
        id: "c1",
        author: "Tutor Team",
        content:
          "Start by separating signal phrases, claims, and evidence. Do not attempt full-sentence notes during timed listening.",
        createdAt: "2026-03-22 10:10",
        role: "mentor",
      },
    ],
    views: 142,
  },
  {
    id: "p2",
    title: "Should I avoid phrasal verbs in academic writing tasks?",
    content:
      "I have seen advice suggesting that informal phrasal verbs should be replaced with more formal academic verbs, such as replacing 'look into' with 'investigate'. However, real examples in journal-style writing seem less absolute. I want to understand where the boundary really is.",
    excerpt:
      "I have seen advice suggesting that informal phrasal verbs should be replaced with more formal academic verbs.",
    author: "Mia",
    tag: "writing",
    likes: 9,
    liked: false,
    pinned: false,
    createdAt: "2026-03-21 18:20",
    comments: [],
    views: 88,
  },
];

const defaultPostsString = JSON.stringify(defaultPosts);
const defaultNotificationsString = JSON.stringify([] as DiscussionNotification[]);

export function subscribeDiscussion(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("discussion-posts-changed", handler as EventListener);
  window.addEventListener(
    "discussion-notifications-changed",
    handler as EventListener
  );

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("discussion-posts-changed", handler as EventListener);
    window.removeEventListener(
      "discussion-notifications-changed",
      handler as EventListener
    );
  };
}

export function getPostsSnapshot() {
  if (typeof window === "undefined") return defaultPostsString;
  return window.localStorage.getItem(STORAGE_KEY) ?? defaultPostsString;
}

export function getNotificationsSnapshot() {
  if (typeof window === "undefined") return defaultNotificationsString;
  return (
    window.localStorage.getItem(NOTIFICATION_KEY) ?? defaultNotificationsString
  );
}

export function getPostsServerSnapshot() {
  return defaultPostsString;
}

export function getNotificationsServerSnapshot() {
  return defaultNotificationsString;
}

export function writePosts(nextPosts: DiscussionPost[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPosts));
  window.dispatchEvent(new Event("discussion-posts-changed"));
}

export function writeNotifications(next: DiscussionNotification[]) {
  window.localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("discussion-notifications-changed"));
}

export function pushNotification(
  notification: Omit<DiscussionNotification, "id" | "createdAt" | "read">
) {
  const current = JSON.parse(
    window.localStorage.getItem(NOTIFICATION_KEY) ?? defaultNotificationsString
  ) as DiscussionNotification[];

  const next: DiscussionNotification[] = [
    {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      read: false,
    },
    ...current,
  ];

  writeNotifications(next);
}

export function markAllNotificationsRead() {
  const current = JSON.parse(
    window.localStorage.getItem(NOTIFICATION_KEY) ?? defaultNotificationsString
  ) as DiscussionNotification[];

  writeNotifications(current.map((item) => ({ ...item, read: true })));
}