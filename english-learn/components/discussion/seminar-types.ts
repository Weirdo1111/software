import type { DiscussionCategory, Locale } from "@/components/discussion/types";

export type { Locale };

export type SeminarRoomVisibility = "PUBLIC" | "PROTECTED";
export type SeminarRoomStatus = "ACTIVE" | "ARCHIVED" | "CLOSED";
export type SeminarRoomMemberRole = "OWNER" | "MODERATOR" | "MEMBER";
export type SeminarAttachmentKind = "image" | "video" | "audio" | "file";
export type SeminarCallSignalKind = "offer" | "answer" | "ice-candidate";

export type SeminarRoomSummary = {
  id: string;
  title: string;
  description?: string;
  topicTag?: DiscussionCategory;
  visibility: SeminarRoomVisibility;
  status: SeminarRoomStatus;
  ownerName: string;
  participantCount: number;
  createdAt: string;
  lastActiveAt: string;
  lastMessagePreview?: string;
  requiresPassword: boolean;
  canManage: boolean;
};

export type SeminarRoomAttachment = {
  id: string;
  fileName: string;
  fileKind: SeminarAttachmentKind;
  mimeType: string;
  fileSize: number;
  url: string;
};

export type SeminarRoomMessage = {
  id: string;
  content?: string;
  createdAt: string;
  senderName: string;
  isOwn: boolean;
  attachments: SeminarRoomAttachment[];
};

export type SeminarRoomDetail = {
  id: string;
  title: string;
  description?: string;
  topicTag?: DiscussionCategory;
  visibility: SeminarRoomVisibility;
  status: SeminarRoomStatus;
  ownerName: string;
  participantCount: number;
  createdAt: string;
  lastActiveAt: string;
  requiresPassword: boolean;
  hasAccess: boolean;
  canSend: boolean;
  canManage: boolean;
  membershipRole?: SeminarRoomMemberRole;
  messages: SeminarRoomMessage[];
};

export type SeminarRoomCallParticipant = {
  sessionId: string;
  displayName: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  joinedAt: string;
  isSelf: boolean;
};

export type SeminarRoomCallSignal = {
  id: string;
  kind: SeminarCallSignalKind;
  fromSessionId: string;
  payload: unknown;
  createdAt: string;
};

export type SeminarRoomCallState = {
  sessionId: string;
  participants: SeminarRoomCallParticipant[];
  signals: SeminarRoomCallSignal[];
  refreshedAt: string;
};
