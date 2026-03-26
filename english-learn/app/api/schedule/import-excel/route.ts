import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { jsonError } from "@/lib/api";
import { parseSheetRows } from "@/lib/schedule-import";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("Please upload an Excel or CSV file.", 422);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return jsonError("The workbook does not contain any sheets.", 422);
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: false,
      defval: "",
      blankrows: false,
    });

    const parsed = parseSheetRows(rows);
    return NextResponse.json(parsed, { status: parsed.classes.length > 0 ? 200 : 422 });
  } catch {
    return jsonError("Failed to import the timetable file.", 500);
  }
}
