import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import {
  WordGameVersusStoreError,
  getVersusRoomState,
} from "@/lib/games/word-game-versus-store";

export async function GET(
  request: Request,
  context: { params: Promise<{ roomCode: string }> },
) {
  try {
    const { roomCode } = await context.params;
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId") ?? undefined;

    const state = await getVersusRoomState(roomCode, playerId);
    return NextResponse.json(state);
  } catch (error) {
    if (error instanceof WordGameVersusStoreError) {
      return jsonError(error.message, error.status);
    }

    console.error("word-game versus room GET failed", error);
    return jsonError("Failed to load room state.", 500);
  }
}
