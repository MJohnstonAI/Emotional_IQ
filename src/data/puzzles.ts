import type { Puzzle } from "@/game/types";
import { utcDateKey } from "@/game/date";

const seedMessages: Omit<Puzzle, "id" | "date">[] = [
  {
    message:
      "Hey - saw your note. I'm fine. Just... busy. Don't worry about it.",
    category: "Friendship",
    difficulty: 1,
    isActive: true,
    target: { anger: 22, affection: 54, anxiety: 48, joy: 28, control: 36 },
  },
  {
    message:
      "Can you send that update by EOD? If not, I'll just do it myself.",
    category: "Work",
    difficulty: 2,
    isActive: true,
    target: { anger: 34, affection: 18, anxiety: 42, joy: 10, control: 72 },
  },
  {
    message:
      "No pressure - I just wanted to check you got home safe.",
    category: "Care",
    difficulty: 1,
    isActive: true,
    target: { anger: 6, affection: 78, anxiety: 30, joy: 40, control: 22 },
  },
  {
    message:
      "I'm excited about this, but I'm also nervous it won't land the way I hope.",
    category: "Vulnerability",
    difficulty: 2,
    isActive: true,
    target: { anger: 10, affection: 62, anxiety: 70, joy: 58, control: 28 },
  },
  {
    message:
      "That's a good idea. Let's do it your way (for now).",
    category: "Negotiation",
    difficulty: 2,
    isActive: true,
    target: { anger: 16, affection: 38, anxiety: 24, joy: 26, control: 60 },
  },
  {
    message:
      "I'm proud of you. You've been showing up even when it's hard.",
    category: "Support",
    difficulty: 1,
    isActive: true,
    target: { anger: 2, affection: 86, anxiety: 18, joy: 74, control: 12 },
  },
  {
    message:
      "We need to talk about what happened. Not to blame - to understand.",
    category: "Repair",
    difficulty: 3,
    isActive: true,
    target: { anger: 26, affection: 44, anxiety: 52, joy: 16, control: 58 },
  },
];

export const getSeedPuzzles = (): Puzzle[] => {
  const today = new Date();
  return seedMessages.map((seed, index) => {
    const day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + index));
    const date = utcDateKey(day);
    return {
      id: `seed-${date}`,
      date,
      ...seed,
    };
  });
};
