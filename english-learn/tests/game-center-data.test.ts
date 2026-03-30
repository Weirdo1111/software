import { describe, expect, it } from "vitest";

import { officialGameLevels } from "@/components/escape-room/game-center-data";

describe("game center data", () => {
  it("keeps Midnight Library Escape listed as a live stage", () => {
    expect(officialGameLevels).toContainEqual(
      expect.objectContaining({
        slug: "escape-room",
        subtitle: "Midnight Library Escape",
        status: "live",
        href: "/games/escape-room",
      }),
    );
  });
});
