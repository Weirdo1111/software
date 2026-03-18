import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json({ user_id: "mock-user", message: "Supabase not configured." });
    }

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
    });

    if (error) {
      return jsonError(error.message, 400);
    }

    return NextResponse.json({ user_id: data.user?.id, session: Boolean(data.session) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to sign up", 500);
  }
}
