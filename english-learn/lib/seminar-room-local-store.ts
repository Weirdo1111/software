import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

import type {
  SeminarRoomAttachment,
  SeminarRoomDetail,
  SeminarRoomMessage,
  SeminarRoomSummary,
} from "@/components/discussion/seminar-types";
import type { DiscussionCategory } from "@/components/discussion/types";
import { getCurrentAuthIdentity } from "@/lib/current-user";
import { isSeminarManagerRole } from "@/lib/seminar-room";
import { hashPassword, verifyPassword } from "@/lib/local-auth";

const SEMINAR_LOCAL_DB_PATH = join(process.cwd(), "data", "seminar-rooms.json");

type LocalSeminarVisibility = "PUBLIC" | "PROTECTED";
type LocalSeminarStatus = "ACTIVE" | "ARCHIVED" | "CLOSED";
type LocalSeminarMemberRole = "OWNER" | "MODERATOR" | "MEMBER";

type LocalSeminarUser = {
  id: string;
  authProvider: string;
  authUserId: string;
  username: string;
  email?: string;
  displayName: string;
};

type LocalSeminarRoom = {
  id: string;
  title: string;
  description?: string;
  topicTag?: DiscussionCategory;
  visibility: LocalSeminarVisibility;
  passwordHash?: string;
  status: LocalSeminarStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
};

type LocalSeminarMember = {
  id: string;
  roomId: string;
  userId: string;
  role: LocalSeminarMemberRole;
  joinedAt: string;
  lastSeenAt: string;
};

type LocalSeminarMessage = {
  id: string;
  roomId: string;
  senderId: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
};

type LocalSeminarAttachment = {
  id: string;
  messageId: string;
  roomId: string;
  uploadedById: string;
  fileName: string;
  fileKind: SeminarRoomAttachment["fileKind"];
  mimeType: string;
  fileSize: number;
  storageDriver: string;
  storagePath: string;
  createdAt: string;
};

type LocalSeminarDb = {
  users: LocalSeminarUser[];
  rooms: LocalSeminarRoom[];
  members: LocalSeminarMember[];
  messages: LocalSeminarMessage[];
  attachments: LocalSeminarAttachment[];
};

type LocalSeminarMessageInput = {
  fileName: string;
  fileKind: SeminarRoomAttachment["fileKind"];
  mimeType: string;
  fileSize: number;
  storageDriver: string;
  storagePath: string;
};

export class SeminarLocalStoreError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function createEmptyDb(): LocalSeminarDb {
  return {
    users: [],
    rooms: [],
    members: [],
    messages: [],
    attachments: [],
  };
}

async function ensureLocalDb() {
  try {
    await fs.access(SEMINAR_LOCAL_DB_PATH);
  } catch {
    await fs.mkdir(join(process.cwd(), "data"), { recursive: true });
    await fs.writeFile(SEMINAR_LOCAL_DB_PATH, JSON.stringify(createEmptyDb(), null, 2), "utf8");
  }
}

async function readLocalDb() {
  await ensureLocalDb();
  const raw = await fs.readFile(SEMINAR_LOCAL_DB_PATH, "utf8");

  try {
    const parsed = JSON.parse(raw) as Partial<LocalSeminarDb>;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
      members: Array.isArray(parsed.members) ? parsed.members : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      attachments: Array.isArray(parsed.attachments) ? parsed.attachments : [],
    } satisfies LocalSeminarDb;
  } catch {
    return createEmptyDb();
  }
}

async function writeLocalDb(db: LocalSeminarDb) {
  await fs.writeFile(SEMINAR_LOCAL_DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function sortRooms(left: LocalSeminarRoom, right: LocalSeminarRoom) {
  const rank = (status: LocalSeminarStatus) =>
    status === "ACTIVE" ? 0 : status === "ARCHIVED" ? 1 : 2;

  if (rank(left.status) !== rank(right.status)) {
    return rank(left.status) - rank(right.status);
  }

  return new Date(right.lastActiveAt).getTime() - new Date(left.lastActiveAt).getTime();
}

function getRoomMembers(db: LocalSeminarDb, roomId: string) {
  return db.members.filter((member) => member.roomId === roomId);
}

function getRoomMessages(db: LocalSeminarDb, roomId: string) {
  return db.messages
    .filter((message) => message.roomId === roomId)
    .sort((left, right) => {
      const dateDiff = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      if (dateDiff !== 0) return dateDiff;
      return left.id.localeCompare(right.id);
    });
}

function getMessageAttachments(db: LocalSeminarDb, messageId: string) {
  return db.attachments.filter((attachment) => attachment.messageId === messageId);
}

function findUser(db: LocalSeminarDb, userId: string) {
  return db.users.find((user) => user.id === userId) ?? null;
}

function findRoom(db: LocalSeminarDb, roomId: string) {
  return db.rooms.find((room) => room.id === roomId) ?? null;
}

function findMembership(db: LocalSeminarDb, roomId: string, userId?: string | null) {
  if (!userId) return null;
  return (
    db.members.find((member) => member.roomId === roomId && member.userId === userId) ?? null
  );
}

function hasRoomAccess(db: LocalSeminarDb, room: LocalSeminarRoom, userId?: string | null) {
  return room.visibility === "PUBLIC" || room.ownerId === userId || Boolean(findMembership(db, room.id, userId));
}

function requireRoom(room: LocalSeminarRoom | null, message = "Seminar room not found") {
  if (!room) {
    throw new SeminarLocalStoreError(message, 404);
  }

  return room;
}

function ensureViewerMembership(
  db: LocalSeminarDb,
  room: LocalSeminarRoom,
  userId?: string | null,
) {
  if (!userId) return;

  const existing = findMembership(db, room.id, userId);
  const timestamp = nowIso();

  if (existing) {
    existing.lastSeenAt = timestamp;
    return;
  }

  db.members.push({
    id: randomUUID(),
    roomId: room.id,
    userId,
    role: room.ownerId === userId ? "OWNER" : "MEMBER",
    joinedAt: timestamp,
    lastSeenAt: timestamp,
  });
}

function assertCanManageRoom(
  db: LocalSeminarDb,
  room: LocalSeminarRoom,
  userId: string,
) {
  const membership = findMembership(db, room.id, userId);

  if (room.ownerId !== userId && !isSeminarManagerRole(membership?.role)) {
    throw new SeminarLocalStoreError("You do not have permission to manage this room", 403);
  }
}

function mapAttachment(attachment: LocalSeminarAttachment): SeminarRoomAttachment {
  return {
    id: attachment.id,
    fileName: attachment.fileName,
    fileKind: attachment.fileKind,
    mimeType: attachment.mimeType,
    fileSize: attachment.fileSize,
    url: `/api/discussion/seminars/rooms/${attachment.roomId}/attachments/${attachment.id}`,
  };
}

function mapMessage(
  db: LocalSeminarDb,
  message: LocalSeminarMessage,
  currentUserId?: string | null,
): SeminarRoomMessage {
  const sender = findUser(db, message.senderId);

  return {
    id: message.id,
    content: message.content?.trim() || undefined,
    createdAt: message.createdAt,
    senderName: sender?.displayName ?? "Learner",
    isOwn: currentUserId === message.senderId,
    attachments: getMessageAttachments(db, message.id).map(mapAttachment),
  };
}

function mapSummary(
  db: LocalSeminarDb,
  room: LocalSeminarRoom,
  currentUserId?: string | null,
): SeminarRoomSummary {
  const owner = findUser(db, room.ownerId);
  const membership = findMembership(db, room.id, currentUserId);
  const messages = getRoomMessages(db, room.id);
  const lastMessage = messages[messages.length - 1];
  const preview =
    room.visibility === "PROTECTED" && !hasRoomAccess(db, room, currentUserId)
      ? undefined
      : lastMessage?.content?.trim() ||
        (lastMessage
          ? `${getMessageAttachments(db, lastMessage.id).length} attachment${getMessageAttachments(db, lastMessage.id).length === 1 ? "" : "s"}`
          : undefined);

  return {
    id: room.id,
    title: room.title,
    description: room.description,
    topicTag: room.topicTag,
    visibility: room.visibility,
    status: room.status,
    ownerName: owner?.displayName ?? "Tutor Team",
    participantCount: getRoomMembers(db, room.id).length,
    createdAt: room.createdAt,
    lastActiveAt: room.lastActiveAt,
    lastMessagePreview: preview,
    requiresPassword: room.visibility === "PROTECTED",
    canManage: room.ownerId === currentUserId || isSeminarManagerRole(membership?.role),
  };
}

function mapDetail(
  db: LocalSeminarDb,
  room: LocalSeminarRoom,
  currentUserId?: string | null,
): SeminarRoomDetail {
  const owner = findUser(db, room.ownerId);
  const membership = findMembership(db, room.id, currentUserId);
  const access = hasRoomAccess(db, room, currentUserId);
  const messages = access
    ? getRoomMessages(db, room.id).map((message) => mapMessage(db, message, currentUserId))
    : [];

  return {
    id: room.id,
    title: room.title,
    description: room.description,
    topicTag: room.topicTag,
    visibility: room.visibility,
    status: room.status,
    ownerName: owner?.displayName ?? "Tutor Team",
    participantCount: getRoomMembers(db, room.id).length,
    createdAt: room.createdAt,
    lastActiveAt: room.lastActiveAt,
    requiresPassword: room.visibility === "PROTECTED",
    hasAccess: access,
    canSend: Boolean(currentUserId) && access && room.status === "ACTIVE",
    canManage: room.ownerId === currentUserId || isSeminarManagerRole(membership?.role),
    membershipRole: membership?.role,
    messages,
  };
}

export function shouldUseSeminarLocalStore() {
  return !process.env.DATABASE_URL && process.env.NODE_ENV !== "test";
}

export async function getCurrentSeminarLocalActor(required: true): Promise<LocalSeminarUser>;
export async function getCurrentSeminarLocalActor(required?: false): Promise<LocalSeminarUser | null>;
export async function getCurrentSeminarLocalActor(required = false) {
  const identity = await getCurrentAuthIdentity();

  if (!identity) {
    if (required) {
      throw new SeminarLocalStoreError("Please sign in first", 401);
    }

    return null;
  }

  const db = await readLocalDb();
  const userId = `${identity.authProvider}:${identity.authUserId}`;
  const existing = db.users.find((user) => user.id === userId);

  if (existing) {
    existing.displayName = identity.displayName;
    existing.email = identity.email;
    existing.username = identity.username;
    await writeLocalDb(db);
    return existing;
  }

  const created: LocalSeminarUser = {
    id: userId,
    authProvider: identity.authProvider,
    authUserId: identity.authUserId,
    username: identity.username,
    email: identity.email,
    displayName: identity.displayName,
  };

  db.users.push(created);
  await writeLocalDb(db);
  return created;
}

export async function listLocalSeminarRooms(currentUserId?: string | null) {
  const db = await readLocalDb();

  return [...db.rooms]
    .sort(sortRooms)
    .map((room) => mapSummary(db, room, currentUserId));
}

export async function createLocalSeminarRoom(
  actor: LocalSeminarUser,
  input: {
    title: string;
    description?: string;
    topicTag?: DiscussionCategory;
    visibility: LocalSeminarVisibility;
    password?: string;
  },
) {
  const db = await readLocalDb();
  const timestamp = nowIso();
  const room: LocalSeminarRoom = {
    id: randomUUID(),
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    topicTag: input.topicTag,
    visibility: input.visibility,
    passwordHash:
      input.visibility === "PROTECTED" && input.password ? await hashPassword(input.password) : undefined,
    status: "ACTIVE",
    ownerId: actor.id,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastActiveAt: timestamp,
  };

  db.rooms.push(room);
  db.members.push({
    id: randomUUID(),
    roomId: room.id,
    userId: actor.id,
    role: "OWNER",
    joinedAt: timestamp,
    lastSeenAt: timestamp,
  });
  await writeLocalDb(db);

  return mapSummary(db, room, actor.id);
}

export async function getLocalSeminarRoomDetail(
  roomId: string,
  currentUserId?: string | null,
) {
  const db = await readLocalDb();
  const room = requireRoom(findRoom(db, roomId));

  if (hasRoomAccess(db, room, currentUserId)) {
    ensureViewerMembership(db, room, currentUserId);
    await writeLocalDb(db);
  }

  return mapDetail(db, room, currentUserId);
}

export async function joinLocalProtectedSeminarRoom(
  roomId: string,
  actor: LocalSeminarUser,
  password: string,
) {
  const db = await readLocalDb();
  const room = requireRoom(findRoom(db, roomId));

  if (room.visibility === "PROTECTED") {
    if (!room.passwordHash) {
      throw new SeminarLocalStoreError("This protected room is missing a password", 500);
    }

    const valid = await verifyPassword(password, room.passwordHash);

    if (!valid) {
      throw new SeminarLocalStoreError("Incorrect room password", 403);
    }
  }

  ensureViewerMembership(db, room, actor.id);
  room.updatedAt = nowIso();
  await writeLocalDb(db);
}

export async function updateLocalSeminarRoom(
  roomId: string,
  actor: LocalSeminarUser,
  input: {
    title?: string;
    description?: string | null;
    topicTag?: DiscussionCategory | null;
    visibility?: LocalSeminarVisibility;
    password?: string;
    status?: LocalSeminarStatus;
  },
) {
  const db = await readLocalDb();
  const room = requireRoom(findRoom(db, roomId));

  assertCanManageRoom(db, room, actor.id);

  const targetVisibility = input.visibility ?? room.visibility;

  if (targetVisibility === "PROTECTED" && !input.password && !room.passwordHash) {
    throw new SeminarLocalStoreError("Protected rooms need a password", 422);
  }

  if (typeof input.title === "string") {
    room.title = input.title.trim();
  }

  if (Object.prototype.hasOwnProperty.call(input, "description")) {
    room.description = input.description?.trim() || undefined;
  }

  if (Object.prototype.hasOwnProperty.call(input, "topicTag")) {
    room.topicTag = input.topicTag || undefined;
  }

  if (input.visibility) {
    room.visibility = input.visibility;
  }

  if (input.status) {
    room.status = input.status;
  }

  if (targetVisibility === "PUBLIC") {
    room.passwordHash = undefined;
  } else if (input.password) {
    room.passwordHash = await hashPassword(input.password);
  }

  room.updatedAt = nowIso();
  await writeLocalDb(db);

  return mapSummary(db, room, actor.id);
}

export async function deleteLocalSeminarRoom(roomId: string, actor: LocalSeminarUser) {
  const db = await readLocalDb();
  const room = requireRoom(findRoom(db, roomId));

  assertCanManageRoom(db, room, actor.id);

  const attachments = db.attachments.filter((attachment) => attachment.roomId === room.id);

  db.rooms = db.rooms.filter((item) => item.id !== room.id);
  db.members = db.members.filter((item) => item.roomId !== room.id);
  db.messages = db.messages.filter((item) => item.roomId !== room.id);
  db.attachments = db.attachments.filter((item) => item.roomId !== room.id);

  await writeLocalDb(db);
  return attachments;
}

export async function listLocalSeminarMessages(
  roomId: string,
  currentUserId?: string | null,
  afterId?: string | null,
) {
  const db = await readLocalDb();
  const room = requireRoom(findRoom(db, roomId));

  if (!hasRoomAccess(db, room, currentUserId)) {
    throw new SeminarLocalStoreError("You do not have access to this room", 403);
  }

  const messages = getRoomMessages(db, room.id);

  if (!afterId) {
    return messages.map((message) => mapMessage(db, message, currentUserId));
  }

  const index = messages.findIndex((message) => message.id === afterId);
  const nextMessages = index >= 0 ? messages.slice(index + 1) : messages;

  return nextMessages.map((message) => mapMessage(db, message, currentUserId));
}

export async function createLocalSeminarMessage(
  roomId: string,
  actor: LocalSeminarUser,
  content: string,
  attachments: LocalSeminarMessageInput[],
) {
  const db = await readLocalDb();
  const room = requireRoom(findRoom(db, roomId));

  if (!hasRoomAccess(db, room, actor.id)) {
    throw new SeminarLocalStoreError("You do not have access to this room", 403);
  }

  if (room.status !== "ACTIVE") {
    throw new SeminarLocalStoreError("This room is closed for new messages", 409);
  }

  ensureViewerMembership(db, room, actor.id);

  const timestamp = nowIso();
  const message: LocalSeminarMessage = {
    id: randomUUID(),
    roomId: room.id,
    senderId: actor.id,
    content: content.trim() || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  db.messages.push(message);

  for (const attachment of attachments) {
    db.attachments.push({
      id: randomUUID(),
      messageId: message.id,
      roomId: room.id,
      uploadedById: actor.id,
      fileName: attachment.fileName,
      fileKind: attachment.fileKind,
      mimeType: attachment.mimeType,
      fileSize: attachment.fileSize,
      storageDriver: attachment.storageDriver,
      storagePath: attachment.storagePath,
      createdAt: timestamp,
    });
  }

  room.lastActiveAt = timestamp;
  room.updatedAt = timestamp;
  await writeLocalDb(db);

  return mapMessage(db, message, actor.id);
}

export async function getLocalSeminarAttachment(
  roomId: string,
  attachmentId: string,
  currentUserId?: string | null,
) {
  const db = await readLocalDb();
  const attachment =
    db.attachments.find((item) => item.id === attachmentId && item.roomId === roomId) ?? null;

  if (!attachment) {
    throw new SeminarLocalStoreError("Attachment not found", 404);
  }

  const room = requireRoom(findRoom(db, roomId));

  if (!hasRoomAccess(db, room, currentUserId)) {
    throw new SeminarLocalStoreError("You do not have access to this attachment", 403);
  }

  return attachment;
}
