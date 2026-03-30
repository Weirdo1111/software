import type {
  SeminarAttachmentKind,
  SeminarRoomAttachment,
  SeminarRoomDetail,
  SeminarRoomMemberRole,
  SeminarRoomStatus,
  SeminarRoomMessage,
  SeminarRoomSummary,
  SeminarRoomVisibility,
} from "@/components/discussion/seminar-types";
import { normalizeDiscussionCategory } from "@/components/discussion/types";
import { describeMessagePreview, isSeminarManagerRole } from "@/lib/seminar-room";

type SeminarMemberRecord = {
  userId: bigint;
  role: string;
};

type SeminarAttachmentRecord = {
  id: bigint | number | string;
  fileName?: string;
  fileKind?: string;
  mimeType?: string;
  fileSize?: number;
};

type SeminarMessageRecord = {
  id: bigint | number | string;
  content?: string | null;
  createdAt: Date | string;
  senderId: bigint;
  sender: {
    displayName: string;
  };
  attachments?: SeminarAttachmentRecord[];
};

type SeminarRoomRecord = {
  id: bigint | number | string;
  title: string;
  description?: string | null;
  topicTag?: string | null;
  visibility: string;
  status: string;
  ownerId: bigint;
  createdAt: Date | string;
  lastActiveAt: Date | string;
  owner: {
    displayName: string;
  };
  _count?: {
    members: number;
  };
  members?: SeminarMemberRecord[];
  messages?: SeminarMessageRecord[];
};

function serializeId(id: bigint | number | string) {
  return id.toString();
}

function serializeDate(value: Date | string) {
  return new Date(value).toISOString();
}

function normalizeVisibility(value: string): SeminarRoomVisibility {
  return value === "PROTECTED" ? "PROTECTED" : "PUBLIC";
}

function normalizeStatus(value: string): SeminarRoomStatus {
  if (value === "ARCHIVED") return "ARCHIVED";
  if (value === "CLOSED") return "CLOSED";
  return "ACTIVE";
}

function normalizeMemberRole(value?: string | null): SeminarRoomMemberRole | undefined {
  if (value === "OWNER" || value === "MODERATOR" || value === "MEMBER") {
    return value;
  }

  return undefined;
}

function normalizeAttachmentKind(value: string): SeminarAttachmentKind {
  if (value === "image" || value === "video" || value === "audio") {
    return value;
  }

  return "file";
}

function toSeminarAttachment(roomId: bigint | number | string, attachment: SeminarAttachmentRecord): SeminarRoomAttachment {
  return {
    id: serializeId(attachment.id),
    fileName: attachment.fileName ?? "attachment",
    fileKind: normalizeAttachmentKind(attachment.fileKind ?? "file"),
    mimeType: attachment.mimeType ?? "application/octet-stream",
    fileSize: attachment.fileSize ?? 0,
    url: `/api/discussion/seminars/rooms/${serializeId(roomId)}/attachments/${serializeId(attachment.id)}`,
  };
}

export function toSeminarRoomMessage(
  roomId: bigint | number | string,
  message: SeminarMessageRecord,
  currentUserId?: bigint | null,
): SeminarRoomMessage {
  return {
    id: serializeId(message.id),
    content: message.content?.trim() || undefined,
    createdAt: serializeDate(message.createdAt),
    senderName: message.sender.displayName,
    isOwn: currentUserId ? currentUserId === message.senderId : false,
    attachments: (message.attachments ?? []).map((attachment) => toSeminarAttachment(roomId, attachment)),
  };
}

export function toSeminarRoomSummary(room: SeminarRoomRecord, currentUserId?: bigint | null): SeminarRoomSummary {
  const membership = room.members?.find((item) => item.userId === currentUserId);
  const latestMessage = room.messages?.[0];

  return {
    id: serializeId(room.id),
    title: room.title,
    description: room.description?.trim() || undefined,
    topicTag: room.topicTag ? normalizeDiscussionCategory(room.topicTag) : undefined,
    visibility: normalizeVisibility(room.visibility),
    status: normalizeStatus(room.status),
    ownerName: room.owner.displayName,
    participantCount: room._count?.members ?? 0,
    createdAt: serializeDate(room.createdAt),
    lastActiveAt: serializeDate(room.lastActiveAt),
    lastMessagePreview: latestMessage
      ? describeMessagePreview(latestMessage.content, latestMessage.attachments?.length ?? 0)
      : undefined,
    requiresPassword: room.visibility === "PROTECTED",
    canManage: room.ownerId === currentUserId || isSeminarManagerRole(membership?.role),
  };
}

export function toSeminarRoomDetail(
  room: SeminarRoomRecord,
  messages: SeminarMessageRecord[],
  options: {
    currentUserId?: bigint | null;
    hasAccess: boolean;
    canSend: boolean;
  },
): SeminarRoomDetail {
  const membership = room.members?.find((item) => item.userId === options.currentUserId);

  return {
    id: serializeId(room.id),
    title: room.title,
    description: room.description?.trim() || undefined,
    topicTag: room.topicTag ? normalizeDiscussionCategory(room.topicTag) : undefined,
    visibility: normalizeVisibility(room.visibility),
    status: normalizeStatus(room.status),
    ownerName: room.owner.displayName,
    participantCount: room._count?.members ?? 0,
    createdAt: serializeDate(room.createdAt),
    lastActiveAt: serializeDate(room.lastActiveAt),
    requiresPassword: room.visibility === "PROTECTED",
    hasAccess: options.hasAccess,
    canSend: options.canSend,
    canManage: room.ownerId === options.currentUserId || isSeminarManagerRole(membership?.role),
    membershipRole: normalizeMemberRole(membership?.role),
    messages: messages.map((message) => toSeminarRoomMessage(room.id, message, options.currentUserId)),
  };
}
