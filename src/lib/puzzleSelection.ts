import { utcDateKey } from "@/game/date";
import type { BranchingPuzzle, PuzzleCategory, PuzzleReveal, PuzzleRound } from "@/game/puzzleTypes";
import { supabase, supabaseEnabled } from "@/lib/supabase";

type CategoryRow = {
  name: string;
};

type OptionRow = {
  id: string;
  position: number;
  label: string;
};

type QuestionRow = {
  id: string;
  position: number;
  question: string;
  question_type: "yes_no" | "true_false" | "single_choice" | "multi_choice";
  allow_multiple: boolean;
  grading_mode: "exact" | "any_correct_without_false";
  quiz_answer_options: OptionRow[];
};

type QuizPuzzleRow = {
  id: string;
  puzzle_date: string;
  title: string | null;
  context: string;
  message: string;
  reveal_truth: string | null;
  reveal_explanation: string | null;
  reveal_pattern: string | null;
  is_active: boolean;
  category: CategoryRow | null;
  questions: QuestionRow[] | null;
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

const quizPuzzleSelectFields = `
  id,
  puzzle_date,
  title,
  context,
  message,
  reveal_truth,
  reveal_explanation,
  reveal_pattern,
  is_active,
  category:categories(name),
  questions:quiz_questions(
    id,
    position,
    question,
    question_type,
    allow_multiple,
    grading_mode,
    quiz_answer_options(
      id,
      position,
      label
    )
  )
`;

const mapQuizPuzzleRow = (row: QuizPuzzleRow): BranchingPuzzle => {
  const reveal: PuzzleReveal = {
    truth: row.reveal_truth ?? "",
    explanation: row.reveal_explanation ?? "",
    pattern: row.reveal_pattern ?? undefined,
  };

  const rounds: PuzzleRound[] = (row.questions ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((question) => ({
      id: question.id,
      question: question.question,
      question_type: question.question_type,
      allow_multiple: question.allow_multiple,
      grading_mode: question.grading_mode,
      options: (question.quiz_answer_options ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((option) => ({
          key: option.id,
          label: option.label,
        })),
    }));

  return {
    id: row.id,
    category: (row.category?.name ?? "General") as PuzzleCategory,
    context: row.context,
    message: row.message,
    rounds,
    reveal,
    isDaily: true,
    dailyDate: row.puzzle_date,
    isActive: row.is_active,
  };
};

const quoteLiteral = (value: string) => `'${value.replace(/'/g, "''")}'`;

export const fetchDailyPuzzle = async (
  userId: string | null,
  dateKey = utcDateKey()
): Promise<DailyPuzzleSelection> => {
  if (!supabaseEnabled || !supabase) {
    return { puzzle: null, isCompleted: false, error: "Supabase not configured" };
  }

  const { data, error } = await supabase
    .from("quiz_puzzles")
    .select(quizPuzzleSelectFields)
    .eq("puzzle_date", dateKey)
    .eq("is_active", true)
    .order("position", { foreignTable: "quiz_questions", ascending: true })
    .order("position", { foreignTable: "quiz_questions.quiz_answer_options", ascending: true })
    .maybeSingle();

  if (error) {
    return { puzzle: null, isCompleted: false, error: error.message };
  }

  if (!data) {
    return { puzzle: null, isCompleted: false };
  }

  const puzzle = mapQuizPuzzleRow(data as unknown as QuizPuzzleRow);
  if (!userId) {
    return { puzzle, isCompleted: false };
  }

  const { data: completion, error: completionError } = await supabase
    .from("user_quiz_attempts")
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

  const { data: categoryRow, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("name", category)
    .maybeSingle();

  if (categoryError) {
    return { puzzle: null, exhausted: false, error: categoryError.message };
  }

  if (!categoryRow?.id) {
    return { puzzle: null, exhausted: true, error: "Unknown category" };
  }

  const { data: completedRows, error: completedError } = await supabase
    .from("user_quiz_attempts")
    .select("puzzle_id")
    .eq("user_id", userId);

  if (completedError) {
    return { puzzle: null, exhausted: false, error: completedError.message };
  }

  const completedIds = (completedRows ?? [])
    .map((row) => String(row.puzzle_id))
    .filter(Boolean);

  let query = supabase
    .from("quiz_puzzles")
    .select(quizPuzzleSelectFields)
    .eq("is_active", true)
    .eq("category_id", String(categoryRow.id))
    .order("position", { foreignTable: "quiz_questions", ascending: true })
    .order("position", { foreignTable: "quiz_questions.quiz_answer_options", ascending: true })
    .order("puzzle_date", { ascending: false })
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
  const puzzle = mapQuizPuzzleRow(puzzles[randomIndex] as unknown as QuizPuzzleRow);
  return { puzzle, exhausted: false };
};
