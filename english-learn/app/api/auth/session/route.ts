import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { toPublicUser } from "@/lib/local-auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: toPublicUser(user),
  });
}
