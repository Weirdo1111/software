import { render, screen } from "@testing-library/react";
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
      />,
    );

    expect(screen.getAllByRole("button", { name: /game center/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/escape room arcade/i)).toBeInTheDocument();
  });
});
