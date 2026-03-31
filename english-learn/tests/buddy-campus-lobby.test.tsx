import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BuddyCampusLobby } from "@/components/home/buddy-campus-lobby";

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

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("BuddyCampusLobby", () => {
  it("shows a visible game center zone and quick access chip", () => {
    render(
      <BuddyCampusLobby
        locale="en"
        levelPrefix="B1"
        nextQuestHref="/schedule?lang=en"
        buddyStage="fresh"
        buddyFocus="coursework"
        buddyOutfit={{ hat: "none", clothing: "none", glasses: "none", heldItem: "none" }}
        selectedGoal="coursework"
      />,
    );

    const lobby = screen.getByRole("region", { name: /learning lobby/i });

    expect(screen.getAllByRole("button", { name: /game center/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/escape room \+ word game/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/left learning wing/i)).toBeInTheDocument();
    expect(screen.queryByText(/current zone/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/directional pad/i)).not.toBeInTheDocument();
    expect(within(lobby).queryByText(/buddy crew/i)).not.toBeInTheDocument();
    expect(within(lobby).queryByText(/left learning wing/i)).not.toBeInTheDocument();
  });
});
