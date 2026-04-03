import { type BuddyVariant } from "@/components/home/buddy-companion";

export type BuddyHat = "none" | "sunhat" | "strawhat" | "cap" | "magichat" | "chefhat" | "catears" | "beret";
export type BuddyClothing = "none" | "shorts" | "jeans" | "bloomers" | "jk" | "pleated" | "petal";
export type BuddyGlasses = "none" | "star" | "heart" | "square" | "sunglasses" | "round" | "goggles";
export type BuddyHeldItem = "none" | "flower" | "tea" | "starwand" | "notebook" | "paintbrush" | "moonwand";

export type BuddyOutfit = {
  hat: BuddyHat;
  clothing: BuddyClothing;
  glasses: BuddyGlasses;
  heldItem: BuddyHeldItem;
};

const STORAGE_KEY = "english-learn:buddy-outfit";
const VARIANT_STORAGE_KEY = "english-learn:buddy-variant";

export const DEFAULT_BUDDY_OUTFIT: BuddyOutfit = {
  hat: "none",
  clothing: "none",
  glasses: "none",
  heldItem: "none",
};
export const DEFAULT_BUDDY_VARIANT: BuddyVariant = "bear";

function isHat(value: unknown): value is BuddyHat {
  return value === "none" || value === "sunhat" || value === "strawhat" || value === "cap" || value === "magichat" || value === "chefhat" || value === "catears" || value === "beret";
}

function isClothing(value: unknown): value is BuddyClothing {
  return value === "none" || value === "shorts" || value === "jeans" || value === "bloomers" || value === "jk" || value === "pleated" || value === "petal";
}

function isGlasses(value: unknown): value is BuddyGlasses {
  return value === "none" || value === "star" || value === "heart" || value === "square" || value === "sunglasses" || value === "round" || value === "goggles";
}

function isHeldItem(value: unknown): value is BuddyHeldItem {
  return value === "none" || value === "flower" || value === "tea" || value === "starwand" || value === "notebook" || value === "paintbrush" || value === "moonwand";
}

function isBuddyVariant(value: unknown): value is BuddyVariant {
  return value === "classic" || value === "bear" || value === "bunny" || value === "cat";
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

export function loadBuddyVariantFromStorage(fallback: BuddyVariant = DEFAULT_BUDDY_VARIANT): BuddyVariant {
  if (typeof window === "undefined") return fallback;

  const raw = window.localStorage.getItem(VARIANT_STORAGE_KEY);
  return isBuddyVariant(raw) ? raw : fallback;
}

export function saveBuddyVariantToStorage(variant: BuddyVariant) {
  if (typeof window === "undefined") return variant;
  window.localStorage.setItem(VARIANT_STORAGE_KEY, variant);
  window.dispatchEvent(new CustomEvent("buddy-variant-changed"));
  return variant;
}

export function subscribeBuddyOutfit(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleChange = () => callback();
  window.addEventListener("storage", handleChange);
  window.addEventListener("buddy-outfit-changed", handleChange as EventListener);
  window.addEventListener("buddy-variant-changed", handleChange as EventListener);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener("buddy-outfit-changed", handleChange as EventListener);
    window.removeEventListener("buddy-variant-changed", handleChange as EventListener);
  };
}
