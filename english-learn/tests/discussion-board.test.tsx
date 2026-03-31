import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DiscussionBoard } from "@/components/discussion/discussion-board";
import type { DiscussionNotification, DiscussionPost } from "@/components/discussion/types";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const basePost: DiscussionPost = {
  id: "post-1",
  title: "How should I prepare for a speaking quiz?",
  content: "I want a simple checklist that helps me practice before the quiz.",
  excerpt: "I want a simple checklist that helps me practice before the quiz.",
  author: "Ken",
  tag: "assessment",
  likes: 3,
  liked: false,
  pinned: false,
  createdAt: "2026-03-30T08:00:00.000Z",
  comments: [],
  views: 12,
};

const notifications: DiscussionNotification[] = [];

describe("DiscussionBoard", () => {
  it("uses the list like action instead of making the card action display-only", async () => {
    const user = userEvent.setup();
    const onToggleLike = vi.fn();

    render(
      <DiscussionBoard
        locale="en"
        posts={[basePost]}
        notifications={notifications}
        onOpenComposer={() => {}}
        onToggleLike={onToggleLike}
      />,
    );

    await user.click(screen.getByRole("button", { name: /like: how should i prepare/i }));

    expect(onToggleLike).toHaveBeenCalledWith("post-1");
  });

  it("renders assessment posts and category filters without crashing", () => {
    render(
      <DiscussionBoard
        locale="en"
        posts={[basePost]}
        notifications={notifications}
        onOpenComposer={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Assessment" })).toBeInTheDocument();
    expect(screen.getAllByText("Assessment").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /view comments: how should i prepare/i })).toHaveAttribute(
      "href",
      "/posts/post-1",
    );
  });
});
