import { create } from "zustand";

import { utcDateKey } from "@/game/date";
import type { BranchingPuzzle } from "@/game/puzzleTypes";
import { fetchDailyPuzzle } from "@/lib/puzzleSelection";
import { supabase, supabaseEnabled } from "@/lib/supabase";
import { getFallbackDailyPuzzle } from "@/data/branchingSeed";

type BranchingGameState = {
  puzzle: BranchingPuzzle | null;
  loading: boolean;
  error: string | null;
  isCompleted: boolean;
  selections: string[];
  loadDaily: (dateKey?: string) => Promise<void>;
  resetFlow: () => void;
  setSelection: (roundIndex: number, choiceKey: string) => void;
};

const defaultSelections = ["", "", ""];

export const useBranchingGameStore = create<BranchingGameState>((set, get) => ({
  puzzle: null,
  loading: false,
  error: null,
  isCompleted: false,
  selections: [...defaultSelections],
  loadDaily: async (dateKey = utcDateKey()) => {
    set({ loading: true, error: null });

    let userId: string | null = null;
    if (supabaseEnabled && supabase) {
      const { data } = await supabase.auth.getSession();
      userId = data.session?.user?.id ?? null;
    }

    if (supabaseEnabled && supabase) {
      const selection = await fetchDailyPuzzle(userId, dateKey);
      if (selection.puzzle) {
        set({
          puzzle: selection.puzzle,
          isCompleted: selection.isCompleted,
          loading: false,
          error: selection.error ?? null,
          selections: [...defaultSelections],
        });
        return;
      }

      if (selection.error) {
        set({ error: selection.error });
      }
    }

    const fallback = getFallbackDailyPuzzle(dateKey);
    set({
      puzzle: fallback,
      isCompleted: false,
      loading: false,
      error: null,
      selections: [...defaultSelections],
    });
  },
  resetFlow: () =>
    set({
      selections: [...defaultSelections],
      error: null,
      isCompleted: false,
    }),
  setSelection: (roundIndex, choiceKey) => {
    const next = [...get().selections];
    next[roundIndex] = choiceKey;
    set({ selections: next });
  },
}));
