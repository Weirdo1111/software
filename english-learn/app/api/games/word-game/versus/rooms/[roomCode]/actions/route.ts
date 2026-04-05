import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import {
  WordGameVersusStoreError,
  getVersusRoomState,
  leaveVersusRoom,
  setVersusPlayerReady,
  startVersusMatch,
  submitVersusAnswer,
} from "@/lib/games/word-game-versus-store";

type ActionBody = {
  action?: "set-ready" | "start-match" | "submit-answer" | "leave" | "sync";
  playerId?: string;
  ready?: boolean;
  answer?: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ roomCode: string }> },
) {
  try {
    const { roomCode } = await context.params;
    const body = (await request.json()) as ActionBody;

    if (body.action === "set-ready") {
      const state = await setVersusPlayerReady({
        roomCode,
        playerId: body.playerId ?? "",
        ready: Boolean(body.ready),
      });
      return NextResponse.json(state);
    }

    if (body.action === "start-match") {
      const state = await startVersusMatch({
        roomCode,
        playerId: body.playerId ?? "",
      });
      return NextResponse.json(state);
    }

    if (body.action === "submit-answer") {
      const state = await submitVersusAnswer({
        roomCode,
        playerId: body.playerId ?? "",
        answer: body.answer ?? "",
      });
      return NextResponse.json(state);
    }

    if (body.action === "leave") {
      await leaveVersusRoom(roomCode, body.playerId ?? "");
      return NextResponse.json({ ok: true });
    }

    if (body.action === "sync") {
      const state = await getVersusRoomState(roomCode, body.playerId ?? undefined);
      return NextResponse.json(state);
    }

    return jsonError("Unsupported action.", 422);
  } catch (error) {
    if (error instanceof WordGameVersusStoreError) {
      return jsonError(error.message, error.status);
    }

    console.error("word-game versus action POST failed", error);
    return jsonError("Failed to process action.", 500);
  }
}
