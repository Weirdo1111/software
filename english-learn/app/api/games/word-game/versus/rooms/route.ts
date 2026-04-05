import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import {
  WordGameVersusStoreError,
  createVersusRoom,
  joinVersusRoom,
} from "@/lib/games/word-game-versus-store";

type CreateOrJoinBody = {
  action?: "create" | "join";
  roomCode?: string;
  playerId?: string;
  playerName?: string;
  bank?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrJoinBody;

    if (body.action === "create") {
      const state = await createVersusRoom({
        playerId: body.playerId ?? "",
        playerName: body.playerName,
        bank: body.bank ?? "general",
        preferredRoomCode: body.roomCode,
      });
      return NextResponse.json(state);
    }

    if (body.action === "join") {
      const state = await joinVersusRoom({
        roomCode: body.roomCode ?? "",
        playerId: body.playerId ?? "",
        playerName: body.playerName,
      });
      return NextResponse.json(state);
    }

    return jsonError("Unsupported action.", 422);
  } catch (error) {
    if (error instanceof WordGameVersusStoreError) {
      return jsonError(error.message, error.status);
    }

    console.error("word-game versus rooms POST failed", error);
    return jsonError("Failed to process room request.", 500);
  }
}
