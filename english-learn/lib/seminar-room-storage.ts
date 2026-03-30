import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

const LOCAL_STORAGE_ROOT = join(process.cwd(), "data", "seminar-room-attachments");

type StoredAttachment = {
  storageDriver: "local" | "supabase";
  storagePath: string;
};

type StoredAttachmentRecord = {
  storageDriver: string;
  storagePath: string;
  mimeType: string;
};

export async function saveSeminarAttachment(input: {
  roomId: string;
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
}): Promise<StoredAttachment> {
  const relativePath = `${input.roomId}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${input.fileName}`;
  const supabase = createSupabaseServiceClient();
  const bucket = env.server.SUPABASE_STORAGE_BUCKET_SEMINARS;

  if (supabase && bucket) {
    const { error } = await supabase.storage.from(bucket).upload(relativePath, input.bytes, {
      contentType: input.mimeType,
      upsert: false,
    });

    if (!error) {
      return {
        storageDriver: "supabase",
        storagePath: relativePath,
      };
    }
  }

  const absolutePath = join(LOCAL_STORAGE_ROOT, relativePath);
  await fs.mkdir(dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, input.bytes);

  return {
    storageDriver: "local",
    storagePath: relativePath,
  };
}

export async function deleteSeminarAttachment(record: {
  storageDriver: string;
  storagePath: string;
}) {
  if (record.storageDriver === "supabase") {
    const supabase = createSupabaseServiceClient();
    const bucket = env.server.SUPABASE_STORAGE_BUCKET_SEMINARS;

    if (supabase && bucket) {
      await supabase.storage.from(bucket).remove([record.storagePath]);
    }

    return;
  }

  const absolutePath = join(LOCAL_STORAGE_ROOT, record.storagePath);

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    if (err.code !== "ENOENT") {
      throw error;
    }
  }
}

export async function readSeminarAttachment(record: StoredAttachmentRecord) {
  if (record.storageDriver === "supabase") {
    const supabase = createSupabaseServiceClient();
    const bucket = env.server.SUPABASE_STORAGE_BUCKET_SEMINARS;

    if (!supabase || !bucket) {
      throw new Error("Supabase storage is not configured for seminar attachments");
    }

    const { data, error } = await supabase.storage.from(bucket).download(record.storagePath);

    if (error || !data) {
      throw new Error("Failed to download seminar attachment");
    }

    return new Uint8Array(await data.arrayBuffer());
  }

  return new Uint8Array(await fs.readFile(join(LOCAL_STORAGE_ROOT, record.storagePath)));
}
