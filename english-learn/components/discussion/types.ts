export type Locale = "zh" | "en";

export type DiscussionCategory =
  | "grammar"
  | "listening"
  | "writing"
  | "experience"
  | "speaking";

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
