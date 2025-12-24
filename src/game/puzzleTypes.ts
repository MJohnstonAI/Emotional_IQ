export const PUZZLE_CATEGORIES = [
  "Workplace Politics",
  "Dating & Romance",
  "Family Dynamics",
  "Conflict Resolution",
  "Social Etiquette",
  "Anger Management",
  "Sarcasm Detection",
] as const;

export type PuzzleCategory = string;

export type PuzzleRoundOption = {
  key: string;
  label: string;
};

export type PuzzleRound = {
  id: string;
  question: string;
  question_type?: "yes_no" | "true_false" | "single_choice" | "multi_choice";
  allow_multiple?: boolean;
  grading_mode?: "exact" | "any_correct_without_false";
  options: PuzzleRoundOption[];
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
