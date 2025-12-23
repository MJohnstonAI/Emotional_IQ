import { utcDateKey } from "@/game/date";
import type { BranchingPuzzle, PuzzleCategory, PuzzleReveal, PuzzleRound } from "@/game/puzzleTypes";
import { supabase, supabaseEnabled } from "@/lib/supabase";

type PuzzleRow = {
  id: string;
  category: PuzzleCategory;
  context: string;
  message: string;
  rounds: PuzzleRound[];
  reveal: PuzzleReveal;
  is_daily: boolean;
  daily_date: string | null;
  is_active: boolean;
};

export type DailyPuzzleSelection = {
  puzzle: BranchingPuzzle | null;
  isCompleted: boolean;
  error?: string;
};

export type PracticePuzzleSelection = {
  puzzle: BranchingPuzzle | null;
  exhausted: boolean;
  error?: string;
};

const puzzleSelectFields =
  "id,category,context,message,rounds,reveal,is_daily,daily_date,is_active";

const mapPuzzleRow = (row: PuzzleRow): BranchingPuzzle => ({
  id: row.id,
  category: row.category,
  context: row.context,
  message: row.message,
  rounds: row.rounds,
  reveal: row.reveal,
  isDaily: row.is_daily,
  dailyDate: row.daily_date,
  isActive: row.is_active,
});

const quoteLiteral = (value: string) => `'${value.replace(/'/g, "''")}'`;

export const fetchDailyPuzzle = async (
  userId: string | null,
  dateKey = utcDateKey()
): Promise<DailyPuzzleSelection> => {
  if (!supabaseEnabled || !supabase) {
    return { puzzle: null, isCompleted: false, error: "Supabase not configured" };
  }

  const { data, error } = await supabase
    .from("puzzles")
    .select(puzzleSelectFields)
    .eq("is_daily", true)
    .eq("daily_date", dateKey)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return { puzzle: null, isCompleted: false, error: error.message };
  }

  if (!data) {
    return { puzzle: null, isCompleted: false };
  }

  const puzzle = mapPuzzleRow(data as PuzzleRow);
  if (!userId) {
    return { puzzle, isCompleted: false };
  }

  const { data: completion, error: completionError } = await supabase
    .from("user_puzzle_completions")
    .select("id")
    .eq("user_id", userId)
    .eq("puzzle_id", puzzle.id)
    .maybeSingle();

  if (completionError) {
    return { puzzle, isCompleted: false, error: completionError.message };
  }

  return { puzzle, isCompleted: Boolean(completion) };
};

export const fetchPracticePuzzle = async (
  userId: string | null,
  category: PuzzleCategory
): Promise<PracticePuzzleSelection> => {
  if (!supabaseEnabled || !supabase) {
    return { puzzle: null, exhausted: false, error: "Supabase not configured" };
  }

  if (!userId) {
    return { puzzle: null, exhausted: false, error: "Auth required" };
  }

  const { data: completedRows, error: completedError } = await supabase
    .from("user_puzzle_completions")
    .select("puzzle_id")
    .eq("user_id", userId)
    .eq("category", category);

  if (completedError) {
    return { puzzle: null, exhausted: false, error: completedError.message };
  }

  const completedIds = (completedRows ?? [])
    .map((row) => String(row.puzzle_id))
    .filter(Boolean);

  let query = supabase
    .from("puzzles")
    .select(puzzleSelectFields)
    .eq("category", category)
    .eq("is_daily", false)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(25);

  if (completedIds.length > 0) {
    const safeList = completedIds.map(quoteLiteral).join(",");
    query = query.not("id", "in", `(${safeList})`);
  }

  const { data: puzzles, error: puzzleError } = await query;

  if (puzzleError) {
    return { puzzle: null, exhausted: false, error: puzzleError.message };
  }

  if (!puzzles || puzzles.length === 0) {
    return { puzzle: null, exhausted: true };
  }

  const randomIndex = Math.floor(Math.random() * puzzles.length);
  const puzzle = mapPuzzleRow(puzzles[randomIndex] as PuzzleRow);
  return { puzzle, exhausted: false };
};
