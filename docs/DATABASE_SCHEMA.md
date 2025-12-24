# Database Schema (Supabase)

Supabase is the single source of truth for categories, puzzles, questions, and answers.
Clients **read content** but **cannot read answer keys**; scoring happens server-side.

## 1) Core entities

Relationships:
- `categories` 1 -> many `quiz_puzzles`
- `quiz_puzzles` 1 -> many `quiz_questions`
- `quiz_questions` 1 -> many `quiz_answer_options`
- `quiz_puzzles` 1 -> many `user_quiz_attempts`
- `user_quiz_attempts` 1 -> many `user_quiz_attempt_answers`

## 2) Tables

Content:
- `categories`
  - `id`, `name`
- `quiz_puzzles`
  - `id`, `puzzle_date` (unique UTC date), `category_id`, `context`, `message`
  - `reveal_truth`, `reveal_explanation`, `reveal_pattern`
  - `difficulty`, `is_active`
- `quiz_questions`
  - `id`, `puzzle_id`, `position`
  - `question`, `question_type`
  - `allow_multiple`, `grading_mode`
- `quiz_answer_options`
  - `id`, `question_id`, `position`, `label`, `is_correct`
  - **`is_correct` is hidden from clients**

Per-user data:
- `user_quiz_attempts`
  - `id`, `user_id`, `puzzle_id`
  - `question_count`, `correct_count`, `score`, `is_correct`
  - `submitted_at`
- `user_quiz_attempt_answers`
  - `attempt_id`, `question_id`, `option_id`

Aggregates:
- `quiz_puzzle_stats`
  - `puzzle_id`, `total_plays`, `correct_count`, `updated_at`
- `quiz_answer_option_stats`
  - `option_id`, `question_id`, `puzzle_id`, `selected_count`

Retention:
- `user_streaks`
  - `user_id`, `current_streak`, `longest_streak`, `last_completed_date`

Monetization (kept):
- `entitlements`, `purchases`

## 3) Question types and grading

`quiz_questions.question_type`:
- `yes_no`
- `true_false`
- `single_choice`
- `multi_choice`

`quiz_questions.grading_mode`:
- `exact` (default): selected set must equal correct set.
- `any_correct_without_false`: multi-choice only; correct if at least one correct
  is selected and no incorrect options are selected.

Common patterns:
- "Select the false": `single_choice` and mark the false option as `is_correct = TRUE`.
- "Most options correct except one": use `single_choice` (select the false), or
  `multi_choice` + `any_correct_without_false` if you want partial credit unless
  the false is chosen.

## 4) Security model

RLS:
- Public read access to `categories`, `quiz_puzzles`, `quiz_questions`,
  `quiz_answer_options` (safe columns only), and stats tables.
- Private read/write for `user_quiz_attempts`, `user_quiz_attempt_answers`,
  and `user_streaks`.

Answer key protection:
- Clients **cannot select** `quiz_answer_options.is_correct`.

## 5) Server-side scoring RPC

`submit_quiz_attempt(p_puzzle_id UUID, p_answers JSONB)`:
- Validates date, prevents duplicates, scores server-side.
- Updates `user_quiz_attempts`, `quiz_puzzle_stats`, `quiz_answer_option_stats`,
  and `user_streaks` (when fully correct).

`p_answers` payload shape:
```json
[
  {"question_id": "uuid", "option_ids": ["uuid", "uuid"]}
]
```

## 6) Key client queries

Daily puzzle:
```sql
select
  id, puzzle_date, context, message, reveal_truth, reveal_explanation, reveal_pattern, is_active,
  categories(name),
  quiz_questions(
    id, position, question, question_type, allow_multiple, grading_mode,
    quiz_answer_options(id, position, label)
  )
from quiz_puzzles
where puzzle_date = current_date and is_active = true;
```

Completion check:
```sql
select id from user_quiz_attempts
where user_id = auth.uid() and puzzle_id = :puzzle_id;
```

Stats:
```sql
select total_plays, correct_count from quiz_puzzle_stats
where puzzle_id = :puzzle_id;
```

## 7) Migrations

- `supabase/migrations/003_normalized_quiz_schema.sql` (baseline)
- `supabase/migrations/004_quiz_grading_mode.sql` (grading_mode support)
