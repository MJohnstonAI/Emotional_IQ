import { create } from "zustand";

import { utcDateKey } from "@/game/date";
import type { BranchingPuzzle } from "@/game/puzzleTypes";
import { fetchDailyPuzzle } from "@/lib/puzzleSelection";
import { supabase, supabaseEnabled } from "@/lib/supabase";

type QuizAttemptResult = {
  attemptId: string;
  score: number;
  correctCount: number;
  questionCount: number;
  isCorrect: boolean;
};

type BranchingGameState = {
  puzzle: BranchingPuzzle | null;
  loading: boolean;
  error: string | null;
  isCompleted: boolean;
  dateKey: string;
  selectedDateKey: string | null;
  selections: string[][];
  submitting: boolean;
  submitError: string | null;
  result: QuizAttemptResult | null;
  loadDaily: (dateKey?: string) => Promise<void>;
  setSelectedDateKey: (dateKey: string | null) => void;
  advanceDay: (days: number) => void;
  resetFlow: () => void;
  toggleSelection: (roundIndex: number, choiceKey: string) => void;
  submitAttempt: () => Promise<void>;
};

const emptySelections = (count: number) => Array.from({ length: count }, () => [] as string[]);

const addUtcDays = (key: string, days: number) => {
  const date = new Date(`${key}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return utcDateKey();
  date.setUTCDate(date.getUTCDate() + days);
  return utcDateKey(date);
};

export const useBranchingGameStore = create<BranchingGameState>((set, get) => ({
  puzzle: null,
  loading: false,
  error: null,
  isCompleted: false,
  dateKey: utcDateKey(),
  selectedDateKey: null,
  selections: emptySelections(3),
  submitting: false,
  submitError: null,
  result: null,
  loadDaily: async (dateKey = get().selectedDateKey ?? utcDateKey()) => {
    set({ loading: true, error: null });

    let userId: string | null = null;
    if (supabaseEnabled && supabase) {
      const { data } = await supabase.auth.getSession();
      userId = data.session?.user?.id ?? null;
    }

    if (supabaseEnabled && supabase) {
      const selection = await fetchDailyPuzzle(userId, dateKey);
      if (selection.puzzle) {
        const roundsCount = selection.puzzle.rounds?.length ?? 0;
        let priorResult: QuizAttemptResult | null = null;
        if (userId && selection.isCompleted) {
          const { data: attemptRow } = await supabase
            .from("user_quiz_attempts")
            .select("id,score,correct_count,question_count,is_correct")
            .eq("user_id", userId)
            .eq("puzzle_id", selection.puzzle.id)
            .maybeSingle();
          if (attemptRow) {
            priorResult = {
              attemptId: String((attemptRow as any).id),
              score: Number((attemptRow as any).score ?? 0),
              correctCount: Number((attemptRow as any).correct_count ?? 0),
              questionCount: Number((attemptRow as any).question_count ?? (roundsCount || 3)),
              isCorrect: Boolean((attemptRow as any).is_correct),
            };
          }
        }
        set({
          puzzle: selection.puzzle,
          isCompleted: selection.isCompleted,
          loading: false,
          error: selection.error ?? null,
          dateKey,
          selections: emptySelections(roundsCount || 3),
          result: priorResult,
          submitError: null,
        });
        return;
      }

      if (selection.error) {
        set({ error: selection.error });
      }
    }

    set({
      puzzle: null,
      isCompleted: false,
      loading: false,
      error: "No daily puzzle available for this date.",
      dateKey,
      selections: emptySelections(3),
      result: null,
      submitError: null,
    });
  },
  setSelectedDateKey: (dateKey) => {
    set({ selectedDateKey: dateKey });
    get().loadDaily(dateKey ?? utcDateKey());
  },
  advanceDay: (days) => {
    const current = get().selectedDateKey ?? get().dateKey ?? utcDateKey();
    const next = addUtcDays(current, days);
    get().setSelectedDateKey(next);
  },
  resetFlow: () =>
    set({
      selections: emptySelections(get().puzzle?.rounds?.length ?? 3),
      error: null,
      isCompleted: false,
      result: null,
      submitting: false,
      submitError: null,
    }),
  toggleSelection: (roundIndex, choiceKey) => {
    const current = get().selections;
    const next = current.map((row) => [...row]);
    const existing = next[roundIndex] ?? [];
    const round = get().puzzle?.rounds?.[roundIndex];
    const allowMultiple = Boolean(round?.allow_multiple);
    if (allowMultiple) {
      const has = existing.includes(choiceKey);
      next[roundIndex] = has ? existing.filter((k) => k !== choiceKey) : [...existing, choiceKey];
    } else {
      next[roundIndex] = [choiceKey];
    }
    set({ selections: next });
  },
  submitAttempt: async () => {
    const { puzzle, selections } = get();
    if (!puzzle) return;
    if (!supabaseEnabled || !supabase) {
      set({ submitError: "Supabase not configured" });
      return;
    }

    const looksLikeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      puzzle.id
    );
    if (!looksLikeUuid) {
      set({ submitError: "This puzzle is not from Supabase (cannot submit)." });
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id ?? null;
    if (!userId) {
      set({ submitError: "Sign in required to submit" });
      return;
    }

    set({ submitting: true, submitError: null });
    const answers = puzzle.rounds.map((round, index) => ({
      question_id: round.id,
      option_ids: selections[index] ?? [],
    }));

    const { data, error } = await supabase.rpc("submit_quiz_attempt", {
      p_puzzle_id: puzzle.id,
      p_answers: answers,
    });

    if (error) {
      set({ submitting: false, submitError: error.message });
      return;
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      set({ submitting: false, submitError: "No result returned" });
      return;
    }

    set({
      submitting: false,
      submitError: null,
      isCompleted: true,
      result: {
        attemptId: String(row.attempt_id),
        score: Number(row.score ?? 0),
        correctCount: Number(row.correct_count ?? 0),
        questionCount: Number(row.question_count ?? puzzle.rounds.length),
        isCorrect: Boolean(row.is_correct),
      },
    });
  },
}));
