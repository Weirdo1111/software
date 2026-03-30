export type BuddyHat = "none" | "sunhat" | "strawhat" | "cap";
export type BuddyClothing = "none" | "shorts" | "jeans" | "bloomers";
export type BuddyGlasses = "none" | "star" | "heart" | "square" | "sunglasses";
export type BuddyHeldItem = "none" | "flower" | "tea" | "starwand";

export type BuddyOutfit = {
  hat: BuddyHat;
  clothing: BuddyClothing;
  glasses: BuddyGlasses;
  heldItem: BuddyHeldItem;
};

const STORAGE_KEY = "english-learn:buddy-outfit";

export const DEFAULT_BUDDY_OUTFIT: BuddyOutfit = {
  hat: "none",
  clothing: "none",
  glasses: "none",
  heldItem: "none",
};

function isHat(value: unknown): value is BuddyHat {
  return value === "none" || value === "sunhat" || value === "strawhat" || value === "cap";
}

function isClothing(value: unknown): value is BuddyClothing {
  return value === "none" || value === "shorts" || value === "jeans" || value === "bloomers";
}

function isGlasses(value: unknown): value is BuddyGlasses {
  return value === "none" || value === "star" || value === "heart" || value === "square" || value === "sunglasses";
}

function isHeldItem(value: unknown): value is BuddyHeldItem {
  return value === "none" || value === "flower" || value === "tea" || value === "starwand";
}

export function loadBuddyOutfitFromStorage(): BuddyOutfit {
  if (typeof window === "undefined") return DEFAULT_BUDDY_OUTFIT;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BUDDY_OUTFIT;
    const parsed = JSON.parse(raw) as Partial<BuddyOutfit>;

    return {
      hat: isHat(parsed.hat) ? parsed.hat : DEFAULT_BUDDY_OUTFIT.hat,
      clothing: isClothing(parsed.clothing) ? parsed.clothing : DEFAULT_BUDDY_OUTFIT.clothing,
      glasses: isGlasses(parsed.glasses) ? parsed.glasses : DEFAULT_BUDDY_OUTFIT.glasses,
      heldItem: isHeldItem(parsed.heldItem) ? parsed.heldItem : DEFAULT_BUDDY_OUTFIT.heldItem,
    };
  } catch {
    return DEFAULT_BUDDY_OUTFIT;
  }
}

export function saveBuddyOutfitToStorage(outfit: BuddyOutfit) {
  if (typeof window === "undefined") return outfit;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(outfit));
  window.dispatchEvent(new CustomEvent("buddy-outfit-changed"));
  return outfit;
}

export function subscribeBuddyOutfit(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleChange = () => callback();
  window.addEventListener("storage", handleChange);
  window.addEventListener("buddy-outfit-changed", handleChange as EventListener);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener("buddy-outfit-changed", handleChange as EventListener);
  };
}
