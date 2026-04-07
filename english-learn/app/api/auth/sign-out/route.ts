import { NextResponse } from "next/server";

import { AUTH_SESSION_COOKIE, createSessionCookieOptions, deleteAuthSession } from "@/lib/auth-session";
import {
  AUTH_EMAIL_COOKIE,
  AUTH_PROVIDER_COOKIE,
  AUTH_USER_ID_COOKIE,
  AUTH_USERNAME_COOKIE,
} from "@/lib/current-user";

function clearCookie(response: NextResponse, name: string, request: Request) {
  response.cookies.set(name, "", createSessionCookieOptions(new Date(0), request));
}

export async function POST(request: Request) {
  const sessionToken = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_SESSION_COOKIE}=`))
    ?.split("=")[1];

  await deleteAuthSession(sessionToken);

  const response = NextResponse.json({ signedOut: true });

  clearCookie(response, AUTH_SESSION_COOKIE, request);
  clearCookie(response, AUTH_PROVIDER_COOKIE, request);
  clearCookie(response, AUTH_USER_ID_COOKIE, request);
  clearCookie(response, AUTH_USERNAME_COOKIE, request);
  clearCookie(response, AUTH_EMAIL_COOKIE, request);

  return response;
}
