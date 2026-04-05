import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

import type {
  SeminarCallSignalKind,
  SeminarRoomAttachment,
  SeminarRoomCallParticipant,
  SeminarRoomCallSignal,
  SeminarRoomCallState,
  SeminarRoomDetail,
  SeminarRoomMessage,
  SeminarRoomSummary,
} from "@/components/discussion/seminar-types";
import type { DiscussionCategory } from "@/components/discussion/types";
import { getCurrentAuthIdentity } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import {
  SEMINAR_CALL_SIGNAL_RETENTION_MS,
  SEMINAR_CALL_STALE_AFTER_MS,
  isSeminarManagerRole,
} from "@/lib/seminar-room";
import { hashPassword, verifyPassword } from "@/lib/local-auth";

const SEMINAR_LOCAL_DB_PATH = join(process.cwd(), "data", "seminar-rooms.json");
let localDbOperation = Promise.resolve<void>(undefined);
let seminarStoreDecision:
  | {
      expiresAt: number;
      useLocalStore: boolean;
    }
  | null = null;
let seminarStoreDecisionPromise: Promise<boolean> | null = null;

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

type LocalSeminarCallParticipant = {
  id: string;
  roomId: string;
  userId: string;
  sessionId: string;
  displayName: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  joinedAt: string;
  lastSeenAt: string;
};

type LocalSeminarCallSignal = {
  id: string;
  sequence: number;
  roomId: string;
  fromSessionId: string;
  toSessionId: string;
  kind: SeminarCallSignalKind;
  payload: unknown;
  createdAt: string;
};

type LocalSeminarDb = {
  users: LocalSeminarUser[];
  rooms: LocalSeminarRoom[];
  members: LocalSeminarMember[];
  messages: LocalSeminarMessage[];
  attachments: LocalSeminarAttachment[];
  callParticipants: LocalSeminarCallParticipant[];
  callSignals: LocalSeminarCallSignal[];
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

function withLocalDbLock<T>(task: () => Promise<T>) {
  const next = localDbOperation.catch(() => undefined).then(task);
  localDbOperation = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

function createEmptyDb(): LocalSeminarDb {
  return {
    users: [],
    rooms: [],
    members: [],
    messages: [],
    attachments: [],
    callParticipants: [],
    callSignals: [],
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
      callParticipants: Array.isArray(parsed.callParticipants) ? parsed.callParticipants : [],
      callSignals: Array.isArray(parsed.callSignals) ? parsed.callSignals : [],
    } satisfies LocalSeminarDb;
  } catch {
    return createEmptyDb();
  }
}

async function writeLocalDb(db: LocalSeminarDb) {
  const tempPath = `${SEMINAR_LOCAL_DB_PATH}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tempPath, SEMINAR_LOCAL_DB_PATH);
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

function getRoomCallParticipants(db: LocalSeminarDb, roomId: string) {
  return db.callParticipants.filter((participant) => participant.roomId === roomId);
}

function cleanupLocalCallState(db: LocalSeminarDb, roomId?: string) {
  const staleBefore = Date.now() - SEMINAR_CALL_STALE_AFTER_MS;
  const signalRetentionBefore = Date.now() - SEMINAR_CALL_SIGNAL_RETENTION_MS;
  const staleIds = new Set(
    db.callParticipants
      .filter((participant) => {
        if (roomId && participant.roomId !== roomId) return false;
        return new Date(participant.lastSeenAt).getTime() < staleBefore;
      })
      .map((participant) => participant.id),
  );

  if (staleIds.size > 0) {
    db.callParticipants = db.callParticipants.filter((participant) => !staleIds.has(participant.id));
  }

  db.callSignals = db.callSignals.filter((signal) => {
    if (roomId && signal.roomId !== roomId) {
      return true;
    }

    if (new Date(signal.createdAt).getTime() < signalRetentionBefore) {
      return false;
    }

    if (staleIds.size === 0) {
      return true;
    }

    const sender = db.callParticipants.find(
      (participant) => participant.roomId === signal.roomId && participant.sessionId === signal.fromSessionId,
    );
    const receiver = db.callParticipants.find(
      (participant) => participant.roomId === signal.roomId && participant.sessionId === signal.toSessionId,
    );

    return Boolean(sender && receiver);
  });
}

function findCallParticipant(
  db: LocalSeminarDb,
  roomId: string,
  sessionId: string,
) {
  return (
    db.callParticipants.find(
      (participant) => participant.roomId === roomId && participant.sessionId === sessionId,
    ) ?? null
  );
}

function mapCallParticipant(
  participant: LocalSeminarCallParticipant,
  selfSessionId: string,
): SeminarRoomCallParticipant {
  return {
    sessionId: participant.sessionId,
    displayName: participant.displayName,
    audioEnabled: participant.audioEnabled,
    videoEnabled: participant.videoEnabled,
    joinedAt: participant.joinedAt,
    isSelf: participant.sessionId === selfSessionId,
  };
}

function mapCallSignal(signal: LocalSeminarCallSignal): SeminarRoomCallSignal {
  return {
    id: signal.id,
    kind: signal.kind,
    fromSessionId: signal.fromSessionId,
    payload: signal.payload,
    createdAt: signal.createdAt,
  };
}

function buildLocalCallState(
  db: LocalSeminarDb,
  roomId: string,
  sessionId: string,
  afterSignalId?: string,
): SeminarRoomCallState {
  const participants = getRoomCallParticipants(db, roomId)
    .sort((left, right) => new Date(left.joinedAt).getTime() - new Date(right.joinedAt).getTime())
    .map((participant) => mapCallParticipant(participant, sessionId));

  const afterSequence = afterSignalId ? Number(afterSignalId) : 0;
  const signals = db.callSignals
    .filter((signal) => signal.roomId === roomId && signal.toSessionId === sessionId)
    .filter((signal) => (Number.isFinite(afterSequence) ? signal.sequence > afterSequence : true))
    .sort((left, right) => left.sequence - right.sequence)
    .map(mapCallSignal);

  return {
    sessionId,
    participants,
    signals,
    refreshedAt: nowIso(),
  };
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

export async function shouldUseSeminarLocalStore() {
  if (process.env.NODE_ENV === "test") {
    return false;
  }

  if (!process.env.DATABASE_URL?.trim()) {
    return true;
  }

  const now = Date.now();
  if (seminarStoreDecision && seminarStoreDecision.expiresAt > now) {
    return seminarStoreDecision.useLocalStore;
  }

  if (!seminarStoreDecisionPromise) {
    seminarStoreDecisionPromise = (async () => {
      const prismaWithSeminarModels = prisma as typeof prisma & {
        seminarRoom?: unknown;
        seminarRoomMember?: unknown;
        seminarRoomMessage?: unknown;
        seminarRoomAttachment?: unknown;
        seminarRoomCallParticipant?: unknown;
        seminarRoomCallSignal?: unknown;
      };

      const hasSeminarModels = Boolean(
        prismaWithSeminarModels.seminarRoom &&
          prismaWithSeminarModels.seminarRoomMember &&
          prismaWithSeminarModels.seminarRoomMessage &&
          prismaWithSeminarModels.seminarRoomAttachment &&
          prismaWithSeminarModels.seminarRoomCallParticipant &&
          prismaWithSeminarModels.seminarRoomCallSignal,
      );

      if (!hasSeminarModels) {
        seminarStoreDecision = {
          expiresAt: now + 15_000,
          useLocalStore: true,
        };
        return true;
      }

      try {
        await prisma.$queryRawUnsafe("SELECT 1");
        seminarStoreDecision = {
          expiresAt: now + 15_000,
          useLocalStore: false,
        };
        return false;
      } catch {
        seminarStoreDecision = {
          expiresAt: now + 15_000,
          useLocalStore: true,
        };
        return true;
      }
    })().finally(() => {
      seminarStoreDecisionPromise = null;
    });
  }

  return seminarStoreDecisionPromise;
}

export async function getCurrentSeminarLocalActor(required: true): Promise<LocalSeminarUser>;
export async function getCurrentSeminarLocalActor(required?: false): Promise<LocalSeminarUser | null>;
export async function getCurrentSeminarLocalActor(required = false) {
  return withLocalDbLock(async () => {
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
  });
}

export async function listLocalSeminarRooms(currentUserId?: string | null) {
  return withLocalDbLock(async () => {
    const db = await readLocalDb();

    return [...db.rooms]
      .sort(sortRooms)
      .map((room) => mapSummary(db, room, currentUserId));
  });
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
  return withLocalDbLock(async () => {
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
  });
}

export async function getLocalSeminarRoomDetail(
  roomId: string,
  currentUserId?: string | null,
) {
  return withLocalDbLock(async () => {
    const db = await readLocalDb();
    const room = requireRoom(findRoom(db, roomId));

    if (hasRoomAccess(db, room, currentUserId)) {
      ensureViewerMembership(db, room, currentUserId);
      await writeLocalDb(db);
    }

    return mapDetail(db, room, currentUserId);
  });
}

export async function joinLocalProtectedSeminarRoom(
  roomId: string,
  actor: LocalSeminarUser,
  password: string,
) {
  return withLocalDbLock(async () => {
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
  });
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
  return withLocalDbLock(async () => {
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
  });
}

export async function deleteLocalSeminarRoom(roomId: string, actor: LocalSeminarUser) {
  return withLocalDbLock(async () => {
    const db = await readLocalDb();
    const room = requireRoom(findRoom(db, roomId));

    assertCanManageRoom(db, room, actor.id);

    const attachments = db.attachments.filter((attachment) => attachment.roomId === room.id);

    db.rooms = db.rooms.filter((item) => item.id !== room.id);
    db.members = db.members.filter((item) => item.roomId !== room.id);
    db.messages = db.messages.filter((item) => item.roomId !== room.id);
    db.attachments = db.attachments.filter((item) => item.roomId !== room.id);
    db.callParticipants = db.callParticipants.filter((item) => item.roomId !== room.id);
    db.callSignals = db.callSignals.filter((item) => item.roomId !== room.id);

    await writeLocalDb(db);
    return attachments;
  });
}

export async function listLocalSeminarMessages(
  roomId: string,
  currentUserId?: string | null,
  afterId?: string | null,
) {
  return withLocalDbLock(async () => {
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
  });
}

export async function createLocalSeminarMessage(
  roomId: string,
  actor: LocalSeminarUser,
  content: string,
  attachments: LocalSeminarMessageInput[],
) {
  return withLocalDbLock(async () => {
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
  });
}

export async function joinLocalSeminarCall(
  roomId: string,
  actor: LocalSeminarUser,
  input: {
    sessionId: string;
    displayName?: string;
    audioEnabled: boolean;
    videoEnabled: boolean;
  },
) {
  return withLocalDbLock(async () => {
    const db = await readLocalDb();
    const room = requireRoom(findRoom(db, roomId));

    if (!hasRoomAccess(db, room, actor.id)) {
      throw new SeminarLocalStoreError("You do not have access to this room", 403);
    }

    if (room.status !== "ACTIVE") {
      throw new SeminarLocalStoreError("This room is closed for live calls", 409);
    }

    cleanupLocalCallState(db, room.id);
    ensureViewerMembership(db, room, actor.id);

    const timestamp = nowIso();
    const existing = findCallParticipant(db, room.id, input.sessionId);

    if (existing) {
      existing.displayName = input.displayName?.trim() || actor.displayName;
      existing.audioEnabled = input.audioEnabled;
      existing.videoEnabled = input.videoEnabled;
      existing.lastSeenAt = timestamp;
    } else {
      db.callParticipants.push({
        id: randomUUID(),
        roomId: room.id,
        userId: actor.id,
        sessionId: input.sessionId,
        displayName: input.displayName?.trim() || actor.displayName,
        audioEnabled: input.audioEnabled,
        videoEnabled: input.videoEnabled,
        joinedAt: timestamp,
        lastSeenAt: timestamp,
      });
    }

    await writeLocalDb(db);
    return buildLocalCallState(db, room.id, input.sessionId);
  });
}

export async function syncLocalSeminarCallPresence(
  roomId: string,
  actor: LocalSeminarUser,
  input: {
    sessionId: string;
    afterSignalId?: string;
    audioEnabled: boolean;
    videoEnabled: boolean;
  },
) {
  return withLocalDbLock(async () => {
    const db = await readLocalDb();
    const room = requireRoom(findRoom(db, roomId));

    if (!hasRoomAccess(db, room, actor.id)) {
      throw new SeminarLocalStoreError("You do not have access to this room", 403);
    }

    cleanupLocalCallState(db, room.id);
    const participant = findCallParticipant(db, room.id, input.sessionId);

    if (!participant || participant.userId !== actor.id) {
      throw new SeminarLocalStoreError("Live call session not found", 404);
    }

    if (room.status !== "ACTIVE") {
      throw new SeminarLocalStoreError("This room is closed for live calls", 409);
    }

    participant.audioEnabled = input.audioEnabled;
    participant.videoEnabled = input.videoEnabled;
    participant.lastSeenAt = nowIso();

    await writeLocalDb(db);
    return buildLocalCallState(db, room.id, input.sessionId, input.afterSignalId);
  });
}

export async function createLocalSeminarCallSignal(
  roomId: string,
  actor: LocalSeminarUser,
  input: {
    sessionId: string;
    toSessionId: string;
    kind: SeminarCallSignalKind;
    payload: unknown;
  },
) {
  return withLocalDbLock(async () => {
    const db = await readLocalDb();
    const room = requireRoom(findRoom(db, roomId));

    if (!hasRoomAccess(db, room, actor.id)) {
      throw new SeminarLocalStoreError("You do not have access to this room", 403);
    }

    cleanupLocalCallState(db, room.id);
    const sender = findCallParticipant(db, room.id, input.sessionId);
    const receiver = findCallParticipant(db, room.id, input.toSessionId);

    if (!sender || sender.userId !== actor.id) {
      throw new SeminarLocalStoreError("Live call session not found", 404);
    }

    if (!receiver) {
      throw new SeminarLocalStoreError("Target participant is no longer connected", 404);
    }

    const maxSequence = db.callSignals.reduce(
      (current, signal) => (signal.sequence > current ? signal.sequence : current),
      0,
    );

    db.callSignals.push({
      id: String(maxSequence + 1),
      sequence: maxSequence + 1,
      roomId: room.id,
      fromSessionId: sender.sessionId,
      toSessionId: receiver.sessionId,
      kind: input.kind,
      payload: input.payload,
      createdAt: nowIso(),
    });

    sender.lastSeenAt = nowIso();
    await writeLocalDb(db);
  });
}

export async function leaveLocalSeminarCall(
  roomId: string,
  actor: LocalSeminarUser,
  sessionId: string,
) {
  return withLocalDbLock(async () => {
    const db = await readLocalDb();
    const room = requireRoom(findRoom(db, roomId));

    if (!hasRoomAccess(db, room, actor.id)) {
      throw new SeminarLocalStoreError("You do not have access to this room", 403);
    }

    const participant = findCallParticipant(db, room.id, sessionId);

    if (!participant || participant.userId !== actor.id) {
      return;
    }

    db.callParticipants = db.callParticipants.filter((item) => item.id !== participant.id);
    db.callSignals = db.callSignals.filter(
      (signal) => signal.fromSessionId !== sessionId && signal.toSessionId !== sessionId,
    );
    await writeLocalDb(db);
  });
}

export async function getLocalSeminarAttachment(
  roomId: string,
  attachmentId: string,
  currentUserId?: string | null,
) {
  return withLocalDbLock(async () => {
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
  });
}
