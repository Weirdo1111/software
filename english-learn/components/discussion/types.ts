export type Locale = "zh" | "en";

export type DiscussionCategory =
  | "grammar"
  | "listening"
  | "reading"
  | "writing"
  | "experience"
  | "speaking"
  | "assessment";

export function normalizeDiscussionCategory(value: string): DiscussionCategory {
  const normalized = value.trim().toLowerCase();

  switch (normalized) {
    case "grammar":
    case "语法":
      return "grammar";
    case "listening":
    case "听力":
      return "listening";
    case "reading":
    case "阅读":
      return "reading";
    case "writing":
    case "写作":
      return "writing";
    case "speaking":
    case "口语":
      return "speaking";
    case "assessment":
    case "测评":
    case "reassessment":
      return "assessment";
    case "experience":
    case "经验分享":
    case "discussion":
      return "experience";
    default:
      return "experience";
  }
}

export type DiscussionComment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  role?: "student" | "mentor" | "admin";
  audioDataUrl?: string;
  audioMimeType?: string;
  audioDurationSec?: number;
};

export type DiscussionCommentInput = {
  content: string;
  audioDataUrl?: string;
  audioMimeType?: string;
  audioDurationSec?: number;
};

export type DiscussionPost = {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  tag: DiscussionCategory;
  likes: number;
  liked: boolean;
  pinned: boolean;
  createdAt: string;
  comments: DiscussionComment[];
  views: number;
};

export type DiscussionNotification = {
  id: string;
  type: "like" | "comment";
  actor: string;
  postId: string;
  postTitle: string;
  createdAt: string;
  read: boolean;
};
