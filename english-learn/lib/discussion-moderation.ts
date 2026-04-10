export type DiscussionModerationStatus = "pending" | "approved" | "rejected";
export type StoredDiscussionModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

export function normalizeDiscussionModerationStatus(
  value?: string | null,
): DiscussionModerationStatus {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "pending") return "pending";
  if (normalized === "rejected") return "rejected";
  return "approved";
}

export function toStoredDiscussionModerationStatus(
  value: DiscussionModerationStatus,
): StoredDiscussionModerationStatus {
  if (value === "pending") return "PENDING";
  if (value === "rejected") return "REJECTED";
  return "APPROVED";
}

export function isApprovedDiscussionPost(value?: string | null) {
  return normalizeDiscussionModerationStatus(value) === "approved";
}

export function canAccessDiscussionPost(options: {
  moderationStatus?: string | null;
  isManager?: boolean;
  currentUserId?: bigint | null;
  authorId?: bigint | null;
}) {
  if (isApprovedDiscussionPost(options.moderationStatus)) {
    return true;
  }

  if (options.isManager) {
    return true;
  }

  return Boolean(
    options.currentUserId &&
      options.authorId &&
      options.currentUserId === options.authorId,
  );
}
