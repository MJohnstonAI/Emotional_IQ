-- Seed data for the normalized daily quiz schema.
-- Safe to re-run: uses upserts by (puzzle_date) and positional uniqueness.

WITH category AS (
  INSERT INTO categories (name)
  VALUES ('Workplace Politics')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
puzzle AS (
  INSERT INTO quiz_puzzles (
    puzzle_date,
    category_id,
    title,
    context,
    message,
    reveal_truth,
    reveal_explanation,
    reveal_pattern,
    difficulty,
    is_active
  )
  VALUES (
    CURRENT_DATE,
    (SELECT id FROM category),
    'Subtext in the Meeting',
    'In a team meeting, the project lead role is open and your manager asks for suggestions.',
    'I think Sarah would be great at leading this project, but I''m happy to help however I can.',
    'Subtle self-promotion masked as support for Sarah.',
    'By endorsing Sarah then offering help, they signal they are ready to lead without openly campaigning.',
    'Watch for praise that positions the speaker as the safe fallback choice.',
    'medium',
    TRUE
  )
  ON CONFLICT (puzzle_date) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    title = EXCLUDED.title,
    context = EXCLUDED.context,
    message = EXCLUDED.message,
    reveal_truth = EXCLUDED.reveal_truth,
    reveal_explanation = EXCLUDED.reveal_explanation,
    reveal_pattern = EXCLUDED.reveal_pattern,
    difficulty = EXCLUDED.difficulty,
    is_active = EXCLUDED.is_active
  RETURNING id
),
q1 AS (
  INSERT INTO quiz_questions (puzzle_id, position, question, question_type, allow_multiple)
  VALUES ((SELECT id FROM puzzle), 1, 'What is the strategic move in this line?', 'single_choice', FALSE)
  ON CONFLICT (puzzle_id, position) DO UPDATE SET
    question = EXCLUDED.question,
    question_type = EXCLUDED.question_type,
    allow_multiple = EXCLUDED.allow_multiple
  RETURNING id
),
q2 AS (
  INSERT INTO quiz_questions (puzzle_id, position, question, question_type, allow_multiple)
  VALUES ((SELECT id FROM puzzle), 2, 'Where is the pressure aimed?', 'single_choice', FALSE)
  ON CONFLICT (puzzle_id, position) DO UPDATE SET
    question = EXCLUDED.question,
    question_type = EXCLUDED.question_type,
    allow_multiple = EXCLUDED.allow_multiple
  RETURNING id
),
q3 AS (
  INSERT INTO quiz_questions (puzzle_id, position, question, question_type, allow_multiple)
  VALUES ((SELECT id FROM puzzle), 3, 'Select all outcomes they are hoping for.', 'multi_choice', TRUE)
  ON CONFLICT (puzzle_id, position) DO UPDATE SET
    question = EXCLUDED.question,
    question_type = EXCLUDED.question_type,
    allow_multiple = EXCLUDED.allow_multiple
  RETURNING id
)
INSERT INTO quiz_answer_options (question_id, position, label, is_correct)
VALUES
  ((SELECT id FROM q1), 1, 'Genuine endorsement of Sarah', FALSE),
  ((SELECT id FROM q1), 2, 'Neutral support to avoid conflict', FALSE),
  ((SELECT id FROM q1), 3, 'Positioning themselves as the obvious alternative', TRUE),

  ((SELECT id FROM q2), 1, 'Upward at the manager', TRUE),
  ((SELECT id FROM q2), 2, 'Sideways at Sarah', FALSE),
  ((SELECT id FROM q2), 3, 'Downward at the team', FALSE),

  ((SELECT id FROM q3), 1, 'You give them the lead', TRUE),
  ((SELECT id FROM q3), 2, 'You offer them co-lead with Sarah', TRUE),
  ((SELECT id FROM q3), 3, 'You postpone the decision', FALSE)
ON CONFLICT (question_id, position) DO UPDATE SET
  label = EXCLUDED.label,
  is_correct = EXCLUDED.is_correct;

