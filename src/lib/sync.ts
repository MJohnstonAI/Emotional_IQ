import { supabase, supabaseEnabled } from "@/lib/supabase";
import type { Puzzle } from "@/game/types";
import type { AttemptResult } from "@/game/types";
import type { GameStatus } from "@/state/gameStore";

type ProgressRecord = {
  attempts: AttemptResult[];
  status: GameStatus;
};

export const syncLocalProgress = async (
  userId: string,
  puzzles: Puzzle[],
  progress: Record<string, ProgressRecord>
) => {
  if (!supabaseEnabled || !supabase) return;
  const dates = Object.keys(progress);
  if (!dates.length) return;

  const puzzleRows = dates
    .map((date) => puzzles.find((p) => p.date === date))
    .filter(Boolean)
    .map((puzzle) => ({
      date: puzzle!.date,
      message: puzzle!.message,
      category: puzzle!.category,
      difficulty: puzzle!.difficulty,
      is_active: puzzle!.isActive,
      target_anger: puzzle!.target.anger,
      target_affection: puzzle!.target.affection,
      target_anxiety: puzzle!.target.anxiety,
      target_joy: puzzle!.target.joy,
      target_control: puzzle!.target.control,
    }));

  if (!puzzleRows.length) return;

  try {
    await supabase.from("puzzles").upsert(puzzleRows, {
      onConflict: "date",
    });
  } catch {
    return;
  }

  const { data: puzzleIds } = await supabase.from("puzzles").select("id,date").in("date", dates);

  if (!puzzleIds?.length) return;
  const puzzleMap = new Map(puzzleIds.map((row) => [row.date, row.id]));

  const attemptRows: {
    user_id: string;
    puzzle_id: string;
    resonance: number;
    attempt_index: number;
    guess_anger: number;
    guess_affection: number;
    guess_anxiety: number;
    guess_joy: number;
    guess_control: number;
    hints: Record<string, string>;
    created_at: string;
  }[] = [];

  dates.forEach((date) => {
    const record = progress[date];
    const puzzleId = puzzleMap.get(date);
    if (!record || !puzzleId) return;
    record.attempts.forEach((attempt, index) => {
      attemptRows.push({
        user_id: userId,
        puzzle_id: puzzleId,
        resonance: attempt.resonance,
        attempt_index: index + 1,
        guess_anger: attempt.guess.anger,
        guess_affection: attempt.guess.affection,
        guess_anxiety: attempt.guess.anxiety,
        guess_joy: attempt.guess.joy,
        guess_control: attempt.guess.control,
        hints: attempt.hints,
        created_at: attempt.createdAt,
      });
    });
  });

  if (attemptRows.length) {
    try {
      await supabase.from("tone_attempts").upsert(attemptRows, {
        onConflict: "user_id,puzzle_id,attempt_index",
      });
    } catch {
      // ignore
    }
  }
};
