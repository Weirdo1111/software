import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WordGameRecovery } from "@/components/games/word-game-recovery";

const pushSpy = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushSpy,
  }),
}));

describe("WordGameRecovery", () => {
  const queue = [
    {
      word: "ability",
      meaningEn: "The power or skill needed to do something.",
      meaningZh: "能力；才能；本领。",
      examples: [{ en: "She has the ability to solve hard problems.", zh: "她有能力解决难题。" }],
      uk: "UK /əˈbɪləti/",
      us: "US /əˈbɪləti/",
    },
  ];

  it("renders recovery card and marks completion", () => {
    render(<WordGameRecovery locale="en" bank="cs" initialQueue={queue} source="critical" />);

    expect(screen.getByText("WORD REVIEW")).toBeInTheDocument();
    expect(screen.getByText("ability")).toBeInTheDocument();
    expect(screen.getByText("Meaning")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Next Word|Complete Recovery/i }));

    expect(screen.getByText("Recovery Complete")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Return to Defense" })).toBeInTheDocument();
  });
});
