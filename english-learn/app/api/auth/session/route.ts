import { NextResponse } from "next/server";

import { getCurrentAuthIdentity } from "@/lib/current-user";

export async function GET() {
  const identity = await getCurrentAuthIdentity();

  if (!identity) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      username: identity.username,
      email: identity.email ?? null,
    },
    auth_provider: identity.authProvider,
    auth_user_id: identity.authUserId,
  });
}
