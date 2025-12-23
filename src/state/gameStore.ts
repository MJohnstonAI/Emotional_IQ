import { create } from "zustand";

import { getSeedPuzzles } from "@/data/puzzles";
import { utcDateKey } from "@/game/date";
import { isSolved, perSliderHints, resonanceScore } from "@/game/scoring";
import type { AttemptResult, Puzzle, SliderGuess, Tone } from "@/game/types";
import { TONES } from "@/game/types";
import { readJson, STORAGE_KEYS, writeJson } from "@/lib/storage";
import { supabase, supabaseEnabled } from "@/lib/supabase";

type ProgressRecord = {
  attempts: AttemptResult[];
  status: GameStatus;
};

type GameState = {
  puzzles: Puzzle[];
  today: Puzzle | null;
  selectedDate: string | null;
  currentGuess: SliderGuess;
  attempts: AttemptResult[];
  status: GameStatus;
  progress: Record<string, ProgressRecord>;
  hydrated: boolean;
  load: () => Promise<void>;
  setTone: (tone: Tone, value: number) => void;
  setGuess: (guess: SliderGuess) => void;
  submitGuess: () => AttemptResult | null;
  resetForToday: () => void;
  setSelectedDate: (date: string | null) => void;
  advanceDay: (days: number) => void;
};

export type GameStatus = "not_started" | "in_progress" | "won" | "lost";

const defaultGuess = TONES.reduce((acc, tone) => {
  acc[tone] = 50;
  return acc;
}, {} as SliderGuess);

const MAX_ATTEMPTS = 6;

const coerceProgress = (
  raw: unknown
): Record<string, ProgressRecord> => {
  if (!raw || typeof raw !== "object") return {};
  const record = raw as Record<string, unknown>;
  const out: Record<string, ProgressRecord> = {};
  Object.entries(record).forEach(([date, value]) => {
    if (!value || typeof value !== "object") return;
    const attempts = (value as any).attempts;
    const status = (value as any).status;
    if (!Array.isArray(attempts)) return;
    if (attempts.length && attempts[0]?.guess?.x != null) return; // legacy grid progress
    const safeAttempts = attempts
      .filter((a) => a && typeof a === "object" && a.guess && a.hints)
      .slice(0, MAX_ATTEMPTS) as AttemptResult[];
    const safeStatus: GameStatus =
      status === "won" || status === "lost" || status === "in_progress"
        ? status
        : "not_started";
    out[date] = { attempts: safeAttempts, status: safeStatus };
  });
  return out;
};

export const useGameStore = create<GameState>((set, get) => ({
  puzzles: [],
  today: null,
  selectedDate: null,
  currentGuess: defaultGuess,
  attempts: [],
  status: "not_started",
  progress: {},
  hydrated: false,
  load: async () => {
    let puzzles: Puzzle[] = getSeedPuzzles();
    if (supabaseEnabled && supabase) {
      const { data, error } = await supabase
        .from("puzzles")
        .select(
          "id,date,message,category,difficulty,is_active,target_anger,target_affection,target_anxiety,target_joy,target_control"
        )
        .eq("is_active", true)
        .order("date", { ascending: true });
      if (!error && data && data.length) {
        puzzles = data.map((row: any) => ({
          id: String(row.id),
          date: String(row.date),
          message: String(row.message),
          category: String(row.category),
          difficulty: Number(row.difficulty ?? 1),
          isActive: Boolean(row.is_active),
          target: {
            anger: Number(row.target_anger ?? 50),
            affection: Number(row.target_affection ?? 50),
            anxiety: Number(row.target_anxiety ?? 50),
            joy: Number(row.target_joy ?? 50),
            control: Number(row.target_control ?? 50),
          },
        }));
      }
    }
    const todayKey = utcDateKey();
    const today = puzzles.find((p) => p.date === todayKey) ?? puzzles.at(-1) ?? null;
    const progress = coerceProgress(await readJson(STORAGE_KEYS.progress, {}));
    const todayProgress = today ? progress[today.date] : undefined;
    set({
      puzzles,
      today,
      selectedDate: null,
      attempts: todayProgress?.attempts ?? [],
      status: todayProgress?.status ?? "not_started",
      progress,
      hydrated: true,
      currentGuess: defaultGuess,
    });
  },
  setTone: (tone, value) =>
    set((state) => ({
      currentGuess: { ...state.currentGuess, [tone]: Math.min(Math.max(value, 0), 100) },
    })),
  setGuess: (guess) => set({ currentGuess: guess }),
  submitGuess: () => {
    const { today, currentGuess, attempts } = get();
    if (!today) return null;
    if (attempts.length >= MAX_ATTEMPTS) return null;
    const resonance = resonanceScore(currentGuess, today.target);
    const hints = perSliderHints(currentGuess, today.target);
    const nextAttempt: AttemptResult = {
      guess: currentGuess,
      resonance,
      hints,
      createdAt: new Date().toISOString(),
    };
    const nextAttempts = [...attempts, nextAttempt];
    const solved = isSolved(currentGuess, today.target);
    const failed = !solved && nextAttempts.length >= MAX_ATTEMPTS;
    const status: GameStatus = solved ? "won" : failed ? "lost" : "in_progress";
    const updatedProgress = {
      ...get().progress,
      [today.date]: { attempts: nextAttempts, status },
    };
    set({ attempts: nextAttempts, status, progress: updatedProgress });
    writeJson(STORAGE_KEYS.progress, updatedProgress);
    return nextAttempt;
  },
  resetForToday: () => {
    const { today } = get();
    if (!today) return;
    const updatedProgress: Record<string, ProgressRecord> = {
      ...get().progress,
      [today.date]: { attempts: [], status: "not_started" },
    };
    set({
      attempts: [],
      status: "not_started",
      currentGuess: defaultGuess,
      progress: updatedProgress,
    });
    writeJson(STORAGE_KEYS.progress, updatedProgress);
  },
  setSelectedDate: (date) => {
    const { puzzles, progress } = get();
    const systemToday = utcDateKey();
    const resolvedKey = date ?? systemToday;
    const resolved =
      puzzles.find((p) => p.date === resolvedKey) ?? puzzles.at(-1) ?? null;
    const record = resolved ? progress[resolved.date] : undefined;
    set({
      selectedDate: date ? resolved?.date ?? null : null,
      today: resolved,
      attempts: record?.attempts ?? [],
      status: record?.status ?? "not_started",
      currentGuess: defaultGuess,
    });
  },
  advanceDay: (days) => {
    const { puzzles, today, selectedDate } = get();
    if (!puzzles.length) return;
    const currentKey = today?.date ?? utcDateKey();
    const currentIndex = puzzles.findIndex((p) => p.date === currentKey);
    if (currentIndex < 0) {
      get().setSelectedDate(selectedDate);
      return;
    }
    const nextIndex = Math.min(
      Math.max(currentIndex + days, 0),
      puzzles.length - 1
    );
    const nextDate = puzzles[nextIndex]?.date ?? null;
    if (!nextDate) return;
    get().setSelectedDate(nextDate);
  },
}));
