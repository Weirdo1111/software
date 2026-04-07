import { describe, expect, it } from "vitest";

import { officialGameLevels } from "@/components/escape-room/game-center-data";

describe("game center data", () => {
  it("keeps Midnight Library Escape listed as a live stage", () => {
    expect(officialGameLevels).toContainEqual(
      expect.objectContaining({
        slug: "escape-room",
        subtitle: "Midnight Library Escape",
        status: "live",
        href: expect.stringMatching(/^\/games\/escape-room(?:\/library)?$/),
      }),
    );
  });

  it("uses stage scene art for the escape room cards", () => {
    expect(officialGameLevels).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          stageSlug: "library",
          cover: "/quests/escape-room/scenes/library-briefing.png",
        }),
        expect.objectContaining({
          stageSlug: "dorm",
          cover: "/quests/escape-room/scenes/dorm-briefing.png",
        }),
        expect.objectContaining({
          stageSlug: "station",
          cover: "/quests/escape-room/scenes/station-briefing.png",
        }),
      ]),
    );
  });
});
