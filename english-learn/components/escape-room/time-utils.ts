export const ESCAPE_ROOM_BEST_TIME_KEY = "escape-room-best-seconds-v1";

export function formatGameTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function getTimeRank(totalSeconds: number): "S" | "A" | "B" {
  if (totalSeconds <= 90) {
    return "S";
  }

  if (totalSeconds <= 180) {
    return "A";
  }

  return "B";
}
