/**
 * Server-side content filter. Keep this module dependency-free so moderation
 * is deterministic and does not depend on a third-party service.
 */
const PROFANE_TERMS = [
  // English and common evasions
  "fuck", "fck", "fvck", "fuk", "fucker", "fucking", "shit", "sh1t", "bitch",
  "bastard", "dick", "dickhead", "pussy", "asshole", "a$$hole", "ass",
  "motherfucker", "whore", "slut", "cunt", "cock", "jerkoff",
  // Hindi / Hinglish (romanized)
  "madarchod", "maderchod", "maa chod", "ma chod", "behenchod", "bhenchod",
  "bhen chhod", "chutiya", "chutia", "chutiyapa", "gandu", "gand", "harami",
  "randi", "lund", "lauda", "lawda", "lavda", "lavde", "gaand", "chodu",
  "chhod", "bhadwa", "kamina", "kameena", "suar", "kutti", "kutta",
  // Punjabi (romanized) and common phrases
  "teri maa di", "teri ma di", "bhen de", "bhen da", "pen de", "pen da",
  "puth", "puttar", "chup kar lavde", "bhenchod", "madarchod",
] as const;

const LEET_CHARACTERS: Record<string, string> = {
  "@": "a",
  "4": "a",
  "3": "e",
  "0": "o",
  "1": "i",
  "!": "i",
  "5": "s",
  "$": "s",
};

/** Converts casing, leet characters, punctuation, and stretched words to a compact form. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[a-z0-9@$!]/g, (character) => LEET_CHARACTERS[character] ?? character)
    .replace(/[^a-z0-9]+/g, "")
    .replace(/(.)\1+/g, "$1")
    // A targeted evasion spelling; mapping every "v" would corrupt normal words.
    .replace(/fvck/g, "fuck");
}

const NORMALIZED_TERMS = PROFANE_TERMS.map(normalize).filter((term) => term.length >= 3);

export function isProfane(text: string | null | undefined): boolean {
  if (!text) return false;

  const normalizedText = normalize(text);
  return NORMALIZED_TERMS.some((term) => {
    if (term === "ass") {
      // Avoid ordinary classroom language such as "class" and "assignment",
      // while still matching a standalone leet-spelled "a$$".
      return text.split(/\s+/).some((word) => normalize(word) === term);
    }
    return normalizedText.includes(term);
  });
}
