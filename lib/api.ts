import { NextResponse } from "next/server";

export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function getRequestUserId(request: Request) {
  return request.headers.get("x-user-id") || DEMO_USER_ID;
}
