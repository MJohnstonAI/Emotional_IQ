export const PUZZLE_CATEGORIES = [
  "Workplace Politics",
  "Dating & Romance",
  "Family Dynamics",
  "Conflict Resolution",
  "Social Etiquette",
  "Anger Management",
  "Sarcasm Detection",
] as const;

export type PuzzleCategory = (typeof PUZZLE_CATEGORIES)[number];

export type PuzzleRoundOption = {
  key: string;
  label: string;
};

export type PuzzleRound = {
  id: string;
  question: string;
  options: PuzzleRoundOption[];
  correct_key: string;
};

export type PuzzleReveal = {
  truth: string;
  explanation: string;
  pattern?: string;
};

export type BranchingPuzzle = {
  id: string;
  category: PuzzleCategory;
  context: string;
  message: string;
  rounds: PuzzleRound[];
  reveal: PuzzleReveal;
  isDaily: boolean;
  dailyDate: string | null;
  isActive: boolean;
};
