export type WritingModuleId = "language-lab" | "studio";

export function isWritingModuleId(value: string | undefined): value is WritingModuleId {
  return value === "language-lab" || value === "studio";
}
