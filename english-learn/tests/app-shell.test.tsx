import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/app-shell";

const pushSpy = vi.fn();

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
  usePathname: () => "/",
  useRouter: () => ({
    push: pushSpy,
  }),
}));

vi.mock("@/components/institution-brand", () => ({
  InstitutionBrand: () => <div>Institution Brand</div>,
}));

describe("AppShell", () => {
  afterEach(() => {
    pushSpy.mockReset();
    window.localStorage.clear();
  });

  it("keeps the Games tab public while other study routes stay protected for guests", async () => {
    const user = userEvent.setup();

    render(<AppShell locale="en" />);

    expect(screen.getByRole("link", { name: /games/i })).toHaveAttribute("href", "/games?lang=en");
    expect(screen.getByRole("button", { name: /quests/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /quests/i }));

    expect(screen.getByRole("heading", { name: /log in required/i })).toBeInTheDocument();
  });

  it("still routes signed-in users into protected study sections", async () => {
    const user = userEvent.setup();

    window.localStorage.setItem("demo_logged_in", "true");

    render(<AppShell locale="en" />);

    await user.click(screen.getByRole("button", { name: /quests/i }));

    expect(pushSpy).toHaveBeenCalledWith("/schedule?lang=en");
  });
});
