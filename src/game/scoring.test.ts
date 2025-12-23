import assert from "node:assert/strict";
import test from "node:test";

import { perSliderHints, resonanceScore, shareGrid, tileForDiff } from "./scoring";
import type { SliderGuess } from "./types";

const target: SliderGuess = {
  anger: 10,
  affection: 70,
  anxiety: 30,
  joy: 80,
  control: 50,
};

test("tileForDiff thresholds", () => {
  assert.equal(tileForDiff(0), "green");
  assert.equal(tileForDiff(7), "green");
  assert.equal(tileForDiff(8), "yellow");
  assert.equal(tileForDiff(18), "yellow");
  assert.equal(tileForDiff(19), "gray");
});

test("perSliderHints directions", () => {
  const guess: SliderGuess = {
    anger: 0,
    affection: 100,
    anxiety: 30,
    joy: 70,
    control: 90,
  };
  const hints = perSliderHints(guess, target);
  assert.equal(hints.anger, "higher");
  assert.equal(hints.affection, "lower");
  assert.equal(hints.anxiety, "close");
  assert.equal(hints.joy, "higher");
  assert.equal(hints.control, "lower");
});

test("resonanceScore range", () => {
  const perfect = { ...target };
  const worst: SliderGuess = {
    anger: 100,
    affection: 0,
    anxiety: 100,
    joy: 0,
    control: 0,
  };
  assert.equal(resonanceScore(perfect, target), 100);
  assert.ok(resonanceScore(worst, target) < 20);
});

test("shareGrid output shape", () => {
  const attempts: SliderGuess[] = [
    { anger: 10, affection: 70, anxiety: 30, joy: 80, control: 50 },
    { anger: 20, affection: 60, anxiety: 10, joy: 80, control: 40 },
  ];
  const grid = shareGrid(attempts, target);
  const lines = grid.split("\n");
  assert.equal(lines.length, 5);
  assert.ok(lines.every((line) => line.includes("🟩") || line.includes("🟨") || line.includes("⬛")));
});
