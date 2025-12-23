export type Point = { x: number; y: number };

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const distance = (a: Point, b: Point) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const resonanceScore = (target: Point, guess: Point, sigma = 22) => {
  const dist = distance(target, guess);
  const score = Math.exp(-(dist * dist) / (2 * sigma * sigma));
  return Math.round(score * 100);
};

export const isSolved = (target: Point, guess: Point) => {
  const dist = distance(target, guess);
  return dist <= 10;
};

export const hintForGuess = (target: Point, guess: Point) => {
  const hints: string[] = [];
  if (guess.y < target.y) {
    hints.push("Higher Energy");
  } else if (guess.y > target.y) {
    hints.push("Lower Energy");
  }
  if (guess.x < target.x) {
    hints.push("More Positive");
  } else if (guess.x > target.x) {
    hints.push("More Negative");
  }
  return hints.slice(0, 2);
};
