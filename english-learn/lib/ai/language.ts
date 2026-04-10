const NON_LATIN_LETTER_PATTERN = /\p{L}/u;
const LATIN_SCRIPT_PATTERN = /\p{Script=Latin}/u;
const FULLWIDTH_OR_CJK_PUNCTUATION_PATTERN = /[\u3000-\u303F\uFF00-\uFFEF]/u;

export function containsNonEnglishContent(text: string) {
  for (const char of text) {
    if (FULLWIDTH_OR_CJK_PUNCTUATION_PATTERN.test(char)) {
      return true;
    }

    if (NON_LATIN_LETTER_PATTERN.test(char) && !LATIN_SCRIPT_PATTERN.test(char)) {
      return true;
    }
  }

  return false;
}

export function hasNonEnglishContent(value: unknown): boolean {
  if (typeof value === "string") {
    return containsNonEnglishContent(value);
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasNonEnglishContent(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value).some((item) => hasNonEnglishContent(item));
  }

  return false;
}
