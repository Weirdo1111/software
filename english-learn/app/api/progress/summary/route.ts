import { NextResponse } from "next/server";

import { summary30d, summary7d } from "@/lib/mock-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const range = url.searchParams.get("range") === "30d" ? "30d" : "7d";

  return NextResponse.json(range === "30d" ? summary30d : summary7d);
}
