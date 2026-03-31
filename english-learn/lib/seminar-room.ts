import { z } from "zod";

import { normalizeDiscussionCategory } from "@/components/discussion/types";

export const seminarTopicTags = [
  "grammar",
  "listening",
  "reading",
  "writing",
  "speaking",
  "assessment",
  "experience",
] as const;

export const seminarRoomVisibilities = ["PUBLIC", "PROTECTED"] as const;
export const seminarRoomStatuses = ["ACTIVE", "ARCHIVED", "CLOSED"] as const;
export const seminarRoomMemberRoles = ["OWNER", "MODERATOR", "MEMBER"] as const;
export const seminarAttachmentKinds = ["image", "video", "audio", "file"] as const;
export const seminarCallSignalKinds = ["offer", "answer", "ice-candidate"] as const;

export const MAX_SEMINAR_MESSAGE_LENGTH = 4_000;
export const MAX_SEMINAR_ATTACHMENTS_PER_MESSAGE = 6;
export const SEMINAR_CALL_STALE_AFTER_MS = 35_000;
export const SEMINAR_CALL_SIGNAL_RETENTION_MS = 5 * 60_000;

const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const AUDIO_MAX_BYTES = 12 * 1024 * 1024;
const FILE_MAX_BYTES = 12 * 1024 * 1024;
const VIDEO_MAX_BYTES = 25 * 1024 * 1024;

const documentMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
  "text/plain",
  "text/csv",
]);

const seminarTopicTagSchema = z
  .preprocess(
    (value) => {
      if (typeof value !== "string") return undefined;
      const normalized = value.trim();
      return normalized ? normalizeDiscussionCategory(normalized) : undefined;
    },
    z.enum(seminarTopicTags).optional(),
  );

const optionalDescriptionSchema = z
  .preprocess(
    (value) => {
      if (typeof value !== "string") return undefined;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    },
    z.string().max(1_600).optional(),
  );

const optionalPasswordSchema = z
  .preprocess(
    (value) => {
      if (typeof value !== "string") return undefined;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    },
    z.string().min(6).max(80).optional(),
  );

const seminarCallSessionIdSchema = z
  .string()
  .trim()
  .min(12)
  .max(80)
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid session id");

const seminarCallDisplayNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(100);

export const seminarRoomCreateSchema = z
  .object({
    title: z.string().trim().min(3).max(140),
    description: optionalDescriptionSchema,
    visibility: z.enum(seminarRoomVisibilities),
    password: optionalPasswordSchema,
    topicTag: seminarTopicTagSchema,
  })
  .superRefine((value, ctx) => {
    if (value.visibility === "PROTECTED" && !value.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required for protected rooms",
      });
    }
  });

export const seminarRoomUpdateSchema = z
  .object({
    title: z.string().trim().min(3).max(140).optional(),
    description: optionalDescriptionSchema,
    visibility: z.enum(seminarRoomVisibilities).optional(),
    password: optionalPasswordSchema,
    topicTag: seminarTopicTagSchema,
    status: z.enum(seminarRoomStatuses).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.visibility === "PROTECTED" && value.password === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Protected rooms must keep a password",
      });
    }
  });

export const seminarJoinSchema = z.object({
  password: z.string().trim().min(1).max(80),
});

export const seminarCallJoinSchema = z.object({
  sessionId: seminarCallSessionIdSchema,
  displayName: seminarCallDisplayNameSchema.optional(),
  audioEnabled: z.boolean().default(true),
  videoEnabled: z.boolean().default(true),
});

export const seminarCallPresenceSchema = z.object({
  sessionId: seminarCallSessionIdSchema,
  afterSignalId: z.string().trim().max(60).optional(),
  audioEnabled: z.boolean().default(true),
  videoEnabled: z.boolean().default(true),
});

export const seminarCallSignalSchema = z.object({
  sessionId: seminarCallSessionIdSchema,
  toSessionId: seminarCallSessionIdSchema,
  kind: z.enum(seminarCallSignalKinds),
  payload: z.unknown(),
});

export const seminarCallLeaveSchema = z.object({
  sessionId: seminarCallSessionIdSchema,
});

export function isSeminarManagerRole(role?: string | null) {
  return role === "OWNER" || role === "MODERATOR";
}

export function normalizeSeminarTextContent(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, MAX_SEMINAR_MESSAGE_LENGTH);
}

export function describeMessagePreview(content: string | null | undefined, attachmentCount: number) {
  const trimmed = content?.trim();

  if (trimmed) {
    return trimmed.length > 88 ? `${trimmed.slice(0, 88)}...` : trimmed;
  }

  if (attachmentCount === 0) {
    return "";
  }

  return attachmentCount === 1 ? "1 attachment" : `${attachmentCount} attachments`;
}

export function getSeminarAttachmentRule(mimeType: string) {
  const normalized = mimeType.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith("image/")) {
    return { kind: "image" as const, maxBytes: IMAGE_MAX_BYTES };
  }

  if (normalized.startsWith("video/")) {
    return { kind: "video" as const, maxBytes: VIDEO_MAX_BYTES };
  }

  if (normalized.startsWith("audio/")) {
    return { kind: "audio" as const, maxBytes: AUDIO_MAX_BYTES };
  }

  if (documentMimeTypes.has(normalized)) {
    return { kind: "file" as const, maxBytes: FILE_MAX_BYTES };
  }

  return null;
}

export function sanitizeSeminarFileName(fileName: string) {
  const normalized = fileName.trim().replace(/[/\\?%*:|"<>]/g, "-");
  const collapsed = normalized.replace(/\s+/g, " ");
  return collapsed.slice(0, 120) || "attachment";
}
