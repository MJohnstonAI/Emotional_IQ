# Emotional IQ - Game Design (v2)

This document explains the **Emotional IQ** quiz game for new engineers and AI agents.
Supabase is the single source of truth for puzzle content, questions, and answer options.

## 1) Product intent

**Emotional IQ** is a short-form daily deduction game that teaches social insight through explicit choices.

Design pillars:
- Detective feel: infer subtext from a concrete scenario.
- Earned right/wrong: answers are defensible and teachable.
- Aha reveal: explanation turns the decision into a reusable pattern.
- Daily ritual: one shared puzzle per day.

## 2) Core loop

1. Home shows today's puzzle summary.
2. Player reads **Context** and **Message**.
3. Player answers **N questions (N >= 3)**, one per screen.
4. Reveal shows truth, explanation, and social stats.
5. Completion updates stats and streaks (daily only).

## 3) Puzzle format

Each puzzle is a single real-world situation.

Required fields:
- **Category**: stored in `categories`.
- **Context**: story/setup of the situation.
- **Message**: the literal text/email/chat being analyzed.
- **Questions**: ordered list, `position` ascending, N >= 3.
- **Reveal**: truth + explanation (+ optional pattern takeaway).

Question types (stored in `quiz_questions.question_type`):
- `yes_no`
- `true_false`
- `single_choice`
- `multi_choice`

Answer options:
- Stored in `quiz_answer_options`.
- `is_correct` exists on the server but is **not readable by clients**.

## 4) Grading modes

Grading mode is stored on the question (`quiz_questions.grading_mode`):

- `exact` (default): selected set must exactly match the correct set.
- `any_correct_without_false`: multi-choice only; the user is correct if they select
  at least one correct option and **no incorrect options**. This supports ambiguous
  or psychological "poll-style" questions.

Special patterns:
- "Select the false": use `single_choice`, and mark the false option as `is_correct = TRUE`.
- "Most options correct except one": either `single_choice` (select the false) or
  `multi_choice` with `any_correct_without_false` if you want partial credit unless
  the false is chosen.

## 5) Daily puzzle rules

- One global puzzle per UTC date (`quiz_puzzles.puzzle_date` unique).
- Submission is allowed only for that date (enforced by RPC).
- One submission per user per puzzle.

## 6) Scoring

- `score = round((correct_count / question_count) * 100)`
- `is_correct = (correct_count == question_count)`
- Scoring is **server-side** via `submit_quiz_attempt(...)`.

## 7) Backend model (Supabase)

Core tables:
- `categories`
- `quiz_puzzles` (daily puzzle content)
- `quiz_questions` (ordered questions)
- `quiz_answer_options` (ordered options, answer key hidden)
- `user_quiz_attempts` + `user_quiz_attempt_answers`
- `quiz_puzzle_stats` + `quiz_answer_option_stats`
- `user_streaks`

RPC:
- `submit_quiz_attempt(p_puzzle_id, p_answers)` calculates score, updates stats,
  and updates streaks.

## 8) UX requirements

- One decision per screen.
- Must tap **Commit** to proceed.
- No back navigation during active puzzle.
- Loading + retry on network operations.
- No spoilers in share output (never include message text).

## 9) Puzzle authoring checklist

A puzzle is shippable if:
- Context is specific and clear.
- Message is realistic and short.
- Options are mutually understandable.
- Correctness is defensible (even for multi-correct).
- Reveal teaches a generalizable pattern.
