import { utcDateKey } from "@/game/date";
import type { BranchingPuzzle } from "@/game/puzzleTypes";

const seedPuzzle: Omit<BranchingPuzzle, "isDaily" | "dailyDate"> = {
  id: "seed-dating-standup",
  category: "Dating & Romance",
  context:
    "You were supposed to meet for dinner. You waited 45 minutes, then they text.",
  message: "I'm fine, really. No big deal.",
  rounds: [
    {
      id: "r1",
      question: "Are they saying what they feel?",
      options: [
        { key: "genuine_ok", label: "Yes, they are fine" },
        { key: "hurt_underneath", label: "No, there is hurt underneath" },
        { key: "teasing", label: "They are teasing" },
      ],
      correct_key: "hurt_underneath",
    },
    {
      id: "r2",
      question: "Where is the hurt aimed?",
      options: [
        { key: "at_you", label: "At you for letting them down" },
        { key: "at_self", label: "At themselves for caring" },
        { key: "at_circumstances", label: "At the situation" },
      ],
      correct_key: "at_you",
    },
    {
      id: "r3",
      question: "What do they want now?",
      options: [
        { key: "space_and_silence", label: "Space and no follow-up" },
        { key: "sincere_apology", label: "A sincere apology and effort" },
        { key: "end_things", label: "To end things quietly" },
      ],
      correct_key: "sincere_apology",
    },
  ],
  reveal: {
    truth: "They are hurt and want you to notice and repair it.",
    explanation:
      "I am fine is a cover for disappointment and a wish for a real apology.",
    pattern: "After a letdown, minimization often masks a desire for repair.",
  },
  isActive: true,
};

export const getFallbackDailyPuzzle = (dateKey = utcDateKey()): BranchingPuzzle => ({
  ...seedPuzzle,
  isDaily: true,
  dailyDate: dateKey,
});
