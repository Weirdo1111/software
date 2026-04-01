import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WordGameBattle } from "@/components/games/word-game-battle";

const pushSpy = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushSpy,
  }),
}));

describe("WordGameBattle", () => {
  it("renders battle hud and answer area for english locale", () => {
    render(<WordGameBattle locale="en" bank="cs" />);

    expect(screen.getByText("Discipline")).toBeInTheDocument();
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
    expect(screen.getByText("Spelling Mode")).toBeInTheDocument();
    expect(screen.getByText("Answer Area")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type the full word here...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Attack" })).toBeInTheDocument();
  });

  it("renders chinese copy when locale is zh", () => {
    render(<WordGameBattle locale="zh" bank="math" />);

    expect(screen.getByText("学科")).toBeInTheDocument();
    expect(screen.getByText("Mathematics")).toBeInTheDocument();
    expect(screen.getByText("拼写模式")).toBeInTheDocument();
    expect(screen.getByText("作答区")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("输入完整单词...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "攻击" })).toBeInTheDocument();
  });
});
