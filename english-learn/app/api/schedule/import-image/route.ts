import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { createAIClient, getAIConfig, hasAIConfig } from "@/lib/ai/client";
import { tryRecognizeKnownTimetableScreenshot } from "@/lib/schedule-image-template";
import { normalizeImportedClasses } from "@/lib/schedule-import";

export const runtime = "nodejs";

function getMessageText(
  content:
    | string
    | Array<{
        type?: string;
        text?: string;
      }>
    | null
    | undefined,
) {
  if (typeof content === "string") return content;
  if (!content) return "";

  return content
    .map((part) => (part.type === "text" && typeof part.text === "string" ? part.text : ""))
    .join("");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("Please upload a timetable image.", 422);
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const templateClasses = await tryRecognizeKnownTimetableScreenshot(bytes);
    if (templateClasses) {
      return NextResponse.json(
        {
          classes: templateClasses,
          warnings: [],
        },
        { status: 200 },
      );
    }

    if (!hasAIConfig()) {
      return jsonError("This timetable screenshot layout is not supported yet.", 422);
    }

    const client = createAIClient();
    if (!client) {
      return jsonError("Image recognition is not configured yet.", 503);
    }

    const dataUrl = `data:${file.type || "image/png"};base64,${bytes.toString("base64")}`;
    const { model } = getAIConfig();

    const response = await client.chat.completions.create({
      model,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "Extract timetable data from the image and return valid JSON only. Use the shape {\"classes\":[{\"title\":\"...\",\"day\":0,\"slot\":\"01-02\",\"type\":\"lecture\",\"time\":\"08:00\"}],\"warnings\":[\"...\"]}. Days use Monday=0 through Sunday=6. slot must be one of 01-02, 03-04, 05-06, 07-08, 09-10. If type is unclear, use lecture.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Read this timetable image. Extract each visible course cell. Use the row labels to determine slot values and weekday columns to determine day values. Keep only the course title as title, and ignore teacher names, remarks, and notes when possible.",
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
    });

    const rawText = getMessageText(response.choices[0]?.message?.content as never);
    const payload = JSON.parse(rawText || "{}") as {
      classes?: unknown[];
      warnings?: unknown[];
    };
    const normalized = normalizeImportedClasses(Array.isArray(payload.classes) ? payload.classes : []);
    const warnings = [
      ...normalized.warnings,
      ...(Array.isArray(payload.warnings) ? payload.warnings.filter((item): item is string => typeof item === "string") : []),
    ];

    return NextResponse.json(
      {
        classes: normalized.classes,
        warnings,
      },
      { status: normalized.classes.length > 0 ? 200 : 422 },
    );
  } catch {
    return jsonError("Failed to recognize the timetable image.", 500);
  }
}
