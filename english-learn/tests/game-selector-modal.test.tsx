import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GameSelectorModal } from "@/components/games/game-selector-modal";

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

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} {...props} />,
}));

describe("GameSelectorModal", () => {
  it("uses the stage one scene art for the escape room card", () => {
    render(<GameSelectorModal locale="en" />);

    expect(screen.getByAltText("Escape Room")).toHaveAttribute(
      "src",
      "/quests/escape-room/scenes/library-briefing.png",
    );
  });
});
