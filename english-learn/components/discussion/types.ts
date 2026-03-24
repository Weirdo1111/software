export type Locale = "zh" | "en";

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
  comments: DiscussionComment[];
};