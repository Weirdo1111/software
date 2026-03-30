import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const requireCurrentDiscussionUser = vi.fn();
  const getCurrentDiscussionUser = vi.fn();
  const hashPassword = vi.fn();
  const verifyPassword = vi.fn();
  const saveSeminarAttachment = vi.fn();
  const deleteSeminarAttachment = vi.fn();
  const readSeminarAttachment = vi.fn();

  const prismaTx = {
    seminarRoomMember: {
      upsert: vi.fn(),
    },
    seminarRoomMessage: {
      create: vi.fn(),
      findUniqueOrThrow: vi.fn(),
    },
    seminarRoomAttachment: {
      createMany: vi.fn(),
    },
    seminarRoom: {
      update: vi.fn(),
    },
  };

  const prisma = {
    seminarRoom: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    seminarRoomMember: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    seminarRoomMessage: {
      findMany: vi.fn(),
    },
    seminarRoomAttachment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(async (callback: (tx: typeof prismaTx) => Promise<unknown>) => callback(prismaTx)),
  };

  return {
    requireCurrentDiscussionUser,
    getCurrentDiscussionUser,
    hashPassword,
    verifyPassword,
    saveSeminarAttachment,
    deleteSeminarAttachment,
    readSeminarAttachment,
    prisma,
    prismaTx,
  };
});

const {
  requireCurrentDiscussionUser,
  getCurrentDiscussionUser,
  hashPassword,
  verifyPassword,
  saveSeminarAttachment,
  prisma,
  prismaTx,
} = mocks;

vi.mock("@/lib/current-user", () => ({
  requireCurrentDiscussionUser: mocks.requireCurrentDiscussionUser,
  getCurrentDiscussionUser: mocks.getCurrentDiscussionUser,
}));

vi.mock("@/lib/local-auth", () => ({
  hashPassword: mocks.hashPassword,
  verifyPassword: mocks.verifyPassword,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

vi.mock("@/lib/seminar-room-storage", () => ({
  saveSeminarAttachment: mocks.saveSeminarAttachment,
  deleteSeminarAttachment: mocks.deleteSeminarAttachment,
  readSeminarAttachment: mocks.readSeminarAttachment,
}));

import { POST as createRoom } from "@/app/api/discussion/seminars/rooms/route";
import { GET as getRoomDetail, PATCH as updateRoom } from "@/app/api/discussion/seminars/rooms/[roomId]/route";
import { POST as joinRoom } from "@/app/api/discussion/seminars/rooms/[roomId]/join/route";
import { POST as sendMessage } from "@/app/api/discussion/seminars/rooms/[roomId]/messages/route";

const b = (value: number) => BigInt(value);

function buildRoomRecord(overrides: Partial<{
  id: bigint;
  ownerId: bigint;
  title: string;
  description: string | null;
  topicTag: string | null;
  visibility: "PUBLIC" | "PROTECTED";
  status: "ACTIVE" | "ARCHIVED" | "CLOSED";
  passwordHash: string | null;
  owner: { displayName: string };
  _count: { members: number };
  members: Array<{ userId: bigint; role: string }>;
  messages: Array<{
    id: bigint;
    content: string | null;
    createdAt: Date;
    senderId: bigint;
    sender: { displayName: string };
    attachments: Array<{ id: bigint; fileName: string; fileKind: "image" | "video" | "audio" | "file"; mimeType: string; fileSize: number }>;
  }>;
  createdAt: Date;
  lastActiveAt: Date;
}> = {}) {
  return {
    id: b(11),
    ownerId: b(1),
    title: "Seminar Room",
    description: "Discuss Friday's topic",
    topicTag: "speaking",
    visibility: "PUBLIC" as const,
    status: "ACTIVE" as const,
    passwordHash: null,
    owner: { displayName: "Tutor Team" },
    _count: { members: 2 },
    members: [{ userId: b(1), role: "OWNER" }],
    messages: [],
    createdAt: new Date("2026-03-31T09:00:00.000Z"),
    lastActiveAt: new Date("2026-03-31T09:00:00.000Z"),
    ...overrides,
  };
}

function buildMessageRecord(overrides: Partial<{
  id: bigint;
  content: string | null;
  createdAt: Date;
  senderId: bigint;
  sender: { displayName: string };
  attachments: Array<{
    id: bigint;
    fileName: string;
    fileKind: "image" | "video" | "audio" | "file";
    mimeType: string;
    fileSize: number;
  }>;
}> = {}) {
  return {
    id: b(91),
    content: "Draft claim and evidence are ready.",
    createdAt: new Date("2026-03-31T09:15:00.000Z"),
    senderId: b(1),
    sender: { displayName: "You" },
    attachments: [],
    ...overrides,
  };
}

describe("seminar room routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireCurrentDiscussionUser.mockResolvedValue({
      id: b(1),
      displayName: "You",
    });
    getCurrentDiscussionUser.mockResolvedValue({
      id: b(1),
      displayName: "You",
    });
    hashPassword.mockResolvedValue("hashed-room-password");
    verifyPassword.mockResolvedValue(true);
    saveSeminarAttachment.mockResolvedValue({
      storageDriver: "local",
      storagePath: "11/2026-03-31/mock-file.pdf",
    });
    prisma.$transaction.mockImplementation(async (callback: (tx: typeof prismaTx) => Promise<unknown>) =>
      callback(prismaTx),
    );
  });

  it("creates a public seminar room", async () => {
    prisma.seminarRoom.create.mockResolvedValue(buildRoomRecord());

    const response = await createRoom(
      new Request("http://localhost/api/discussion/seminars/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Friday Seminar Clinic",
          visibility: "PUBLIC",
          description: "Share your evidence chain.",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(hashPassword).not.toHaveBeenCalled();
    expect(prisma.seminarRoom.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Friday Seminar Clinic",
          visibility: "PUBLIC",
          passwordHash: null,
        }),
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      visibility: "PUBLIC",
      requiresPassword: false,
    });
  });

  it("creates a protected seminar room with a hashed password", async () => {
    prisma.seminarRoom.create.mockResolvedValue(
      buildRoomRecord({
        visibility: "PROTECTED",
        passwordHash: "hashed-room-password",
      }),
    );

    const response = await createRoom(
      new Request("http://localhost/api/discussion/seminars/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Protected Evidence Review",
          visibility: "PROTECTED",
          password: "secret123",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(hashPassword).toHaveBeenCalledWith("secret123");
    expect(prisma.seminarRoom.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          visibility: "PROTECTED",
          passwordHash: "hashed-room-password",
        }),
      }),
    );
  });

  it("validates the password before joining a protected room", async () => {
    prisma.seminarRoom.findUnique.mockResolvedValue({
      id: b(11),
      visibility: "PROTECTED",
      passwordHash: "hashed-room-password",
    });

    const response = await joinRoom(
      new Request("http://localhost/api/discussion/seminars/rooms/11/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: "secret123",
        }),
      }),
      { params: Promise.resolve({ roomId: "11" }) },
    );

    expect(response.status).toBe(200);
    expect(verifyPassword).toHaveBeenCalledWith("secret123", "hashed-room-password");
    expect(prisma.seminarRoomMember.upsert).toHaveBeenCalled();
  });

  it("blocks detail access to protected rooms until membership exists", async () => {
    getCurrentDiscussionUser.mockResolvedValue(null);
    prisma.seminarRoom.findUnique.mockResolvedValue(
      buildRoomRecord({
        visibility: "PROTECTED",
        members: [],
      }),
    );

    const response = await getRoomDetail(new Request("http://localhost/api/discussion/seminars/rooms/11"), {
      params: Promise.resolve({ roomId: "11" }),
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      visibility: "PROTECTED",
      hasAccess: false,
      canSend: false,
      messages: [],
    });
  });

  it("sends a text seminar message when the user is authorized", async () => {
    prisma.seminarRoom.findUnique.mockResolvedValue(buildRoomRecord({ members: [] }));
    prismaTx.seminarRoomMessage.create.mockResolvedValue({ id: b(91) });
    prismaTx.seminarRoomMessage.findUniqueOrThrow.mockResolvedValue(buildMessageRecord());

    const formData = new FormData();
    formData.set("content", "I think the strongest evidence is in paragraph two.");

    const response = await sendMessage(
      new Request("http://localhost/api/discussion/seminars/rooms/11/messages", {
        method: "POST",
        body: formData,
      }),
      { params: Promise.resolve({ roomId: "11" }) },
    );

    expect(response.status).toBe(200);
    expect(prismaTx.seminarRoomMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          content: "I think the strongest evidence is in paragraph two.",
        }),
      }),
    );
    await expect(response.json()).resolves.toMatchObject({
      content: "Draft claim and evidence are ready.",
    });
  });

  it("stores attachment metadata when sending a file message", async () => {
    prisma.seminarRoom.findUnique.mockResolvedValue(buildRoomRecord({ members: [] }));
    prismaTx.seminarRoomMessage.create.mockResolvedValue({ id: b(92) });
    prismaTx.seminarRoomMessage.findUniqueOrThrow.mockResolvedValue(
      buildMessageRecord({
        id: b(92),
        content: null,
        attachments: [
          {
            id: b(201),
            fileName: "brief.pdf",
            fileKind: "file",
            mimeType: "application/pdf",
            fileSize: 2048,
          },
        ],
      }),
    );

    const formData = new FormData();
    const file = new File(["seminar brief"], "brief.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(file, "arrayBuffer", {
      value: async () => new TextEncoder().encode("seminar brief").buffer,
    });
    formData.append("files", file);

    const response = await sendMessage(
      {
        formData: async () => formData,
      } as Request,
      { params: Promise.resolve({ roomId: "11" }) },
    );

    expect(response.status).toBe(200);
    expect(saveSeminarAttachment).toHaveBeenCalled();
    expect(prismaTx.seminarRoomAttachment.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          expect.objectContaining({
            fileName: "brief.pdf",
            mimeType: "application/pdf",
          }),
        ],
      }),
    );
  });

  it("rejects room management updates from non-owners", async () => {
    prisma.seminarRoom.findUnique.mockResolvedValue(
      buildRoomRecord({
        ownerId: b(5),
        members: [{ userId: b(1), role: "MEMBER" }],
      }),
    );

    const response = await updateRoom(
      new Request("http://localhost/api/discussion/seminars/rooms/11", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "New title",
        }),
      }),
      { params: Promise.resolve({ roomId: "11" }) },
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: "You do not have permission to manage this room",
    });
  });
});
