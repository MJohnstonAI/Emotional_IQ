import type { PerSliderHints, SliderGuess, Tone } from "./types";
import { TONES } from "./types";

export type TileColor = "green" | "yellow" | "gray";

export const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
export const clamp100 = (value: number) => Math.min(Math.max(value, 0), 100);

export const diffForTone = (guess: SliderGuess, target: SliderGuess, tone: Tone) =>
  Math.abs(clamp100(guess[tone]) - clamp100(target[tone]));

export const perSliderScore = (diff: number, k = 4) => {
  const nd = clamp01(diff / 100);
  return Math.exp(-k * nd * nd);
};

export const resonanceScore = (guess: SliderGuess, target: SliderGuess, k = 4) => {
  const scores = TONES.map((tone) => perSliderScore(diffForTone(guess, target, tone), k));
  const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
  return Math.round(avg * 100);
};

export const perSliderHints = (
  guess: SliderGuess,
  target: SliderGuess,
  closeThreshold = 7
): PerSliderHints => {
  const result = {} as PerSliderHints;
  TONES.forEach((tone) => {
    const guessValue = clamp100(guess[tone]);
    const targetValue = clamp100(target[tone]);
    const diff = Math.abs(guessValue - targetValue);
    if (diff <= closeThreshold) {
      result[tone] = "close";
    } else if (guessValue < targetValue) {
      result[tone] = "higher";
    } else {
      result[tone] = "lower";
    }
  });
  return result;
};

export const tileForDiff = (diff: number, close = 7, near = 18): TileColor => {
  if (diff <= close) return "green";
  if (diff <= near) return "yellow";
  return "gray";
};

export const isSolved = (guess: SliderGuess, target: SliderGuess) => {
  return TONES.every((tone) => diffForTone(guess, target, tone) <= 7);
};

export const emojiForTone = (tone: Tone) => {
  switch (tone) {
    case "anger":
      return "😡";
    case "affection":
      return "❤️";
    case "anxiety":
      return "😬";
    case "joy":
      return "😄";
    case "control":
      return "🕹️";
  }
};

export const blockForTile = (tile: TileColor) => {
  switch (tile) {
    case "green":
      return "🟩";
    case "yellow":
      return "🟨";
    case "gray":
      return "⬛";
  }
};

export const shareGrid = (attempts: SliderGuess[], target: SliderGuess) => {
  return TONES.map((tone) => {
    const row = attempts
      .map((guess) => blockForTile(tileForDiff(diffForTone(guess, target, tone))))
      .join("");
    return `${emojiForTone(tone)} ${row}`;
  }).join("\n");
};
