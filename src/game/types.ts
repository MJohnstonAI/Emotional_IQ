export const TONES = [
  "anger",
  "affection",
  "anxiety",
  "joy",
  "control",
] as const;

export type Tone = (typeof TONES)[number];

export type SliderGuess = Record<Tone, number>;

export type SliderHintDirection = "higher" | "lower" | "close";

export type PerSliderHints = Record<Tone, SliderHintDirection>;

export type Puzzle = {
  id: string;
  date: string; // YYYY-MM-DD (UTC)
  message: string;
  category: string;
  difficulty: number;
  isActive: boolean;
  target: SliderGuess;
};

export type AttemptResult = {
  guess: SliderGuess;
  resonance: number;
  hints: PerSliderHints;
  createdAt: string; // ISO
};
