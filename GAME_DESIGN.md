# Emotional IQ — Game Design (v1)

This document explains the **Emotional IQ** game so a new engineer or AI agent can quickly understand how it works, what “good” looks like, and where to improve UX/UI.

## 1) Product intent

**Emotional IQ** is a short-form daily deduction game that trains practical emotional intelligence by forcing players to make *explicit interpretive choices* and then teaching the underlying pattern.

### Design pillars
- **Detective feel:** players infer intent/subtext from a concrete scenario.
- **Earned right/wrong:** one best interpretation path per puzzle.
- **Aha reveal:** explanation connects choices → truth with a reusable pattern.
- **Social proof:** global stats (“Only X% got this right”) and leaderboards.
- **Fast loop:** daily puzzle in ~60–120 seconds.

## 2) Core game loop

1. **Home** shows today’s puzzle, quick stats, and categories for practice.
2. Player enters **Daily Puzzle**.
3. Player reads **Context + Message**.
4. Player answers **3 rounds** (one question per screen).
5. Player sees **Reveal** (truth + explanation + global stats + share).
6. Progress updates: completion, stats aggregation, and (daily only) streak.

## 3) Puzzle format (locked)

Each puzzle is a single, highly specific real-world situation.

### Required fields
- **Category**: one of:
  - Workplace Politics
  - Dating & Romance
  - Family Dynamics
  - Conflict Resolution
  - Social Etiquette
  - Anger Management
  - Sarcasm Detection
- **Context**: who/what/when/relationship dynamics.
- **Message**: the literal text/email/chat being analyzed.
- **Rounds**: exactly **3** sequential decisions.
- **Canonical correct path**: one correct option per round.
- **Reveal**: truth + explanation (and optional “pattern” learning takeaway).

### Round structure
Each round is unique to the puzzle; we avoid templated questions.

```json
{
  "id": "r1",
  "question": "Are they saying what they feel?",
  "options": [
    {"key": "genuine_ok", "label": "Yes, they are fine"},
    {"key": "hurt_underneath", "label": "No, there is hurt underneath"},
    {"key": "teasing", "label": "They are teasing"}
  ],
  "correct_key": "hurt_underneath"
}
```

## 4) Modes and rules

### Daily puzzle (Wordle-style)
- One global daily puzzle per UTC date.
- Only playable on its designated date (v1).
- User can only complete each puzzle once.
- Streak updates only when a daily puzzle is completed.

### Practice mode
- Player chooses a category.
- App serves a random **unplayed** puzzle from that category.
- If category is exhausted: show “Category Complete”.

## 5) Scoring (v1)

- 3 correct → **100**
- 2 correct → **66**
- 1 correct → **33**
- 0 correct → **0**

Implementation should keep scoring logic flexible so weighting can change later without schema changes.

## 6) UX requirements (locked)

- **One decision per screen.**
- Must tap **Commit** to proceed.
- **No back navigation** (or back gesture) during an active puzzle.
- Loading + retry on all network operations.
- Friendly error messages.
- No spoilers in share output (never include the message text).

## 7) Backend model (Supabase Postgres)

The server side is designed for:
- safe public puzzle reads,
- private user data,
- public aggregate stats,
- leaderboards via a public view (no direct access to private profiles).

### Tables (high level)
- `puzzles`: stores puzzle content including `rounds` JSONB and `reveal` JSONB.
- `user_profiles`: private, per-user (pseudonym + optional country).
- `user_puzzle_completions`: one attempt per user per puzzle (stores choices + score).
- `puzzle_stats`: aggregate counters + per-round distributions.
- `user_streaks`: streak tracking for retention.

### Atomic stats update
A SECURITY DEFINER RPC (`update_puzzle_stats`) increments:
- total plays,
- correct count,
- per-round option distributions,
- avg score.

Client behavior: if stats update fails, do not block the user (best-effort).

## 8) Current app UX flow (implemented)

- Home → `Play Today` → `Context (combined with Message)` → `Round 1` → `Round 2` → `Round 3` → `Reveal`.
- Rounds display:
  - header: `ROUND n of 3`
  - question label: `Question n`

## 9) What makes this addictive (applied psychology)

- **Compression:** 3 decisions is just enough to feel meaningful, not exhausting.
- **Commitment:** “no back” increases perceived stakes and ownership.
- **Pattern learning:** reveal gives a reusable mental model (“pattern”).
- **Social comparison:** “Only X% got this right” creates status + share impulse.
- **Daily ritual:** streak + one daily puzzle encourages return.

## 10) UX/UI & aesthetics improvement ideas

These are intentionally actionable and prioritized.

### A) Onboarding and clarity
- Add a 1-time “micro tutorial” overlay on the first daily puzzle: 
  - “You’ll answer 3 questions.”
  - “No back once you start.”
  - “Commit to lock your answer.”
- In the combined Context screen, visually separate **Context** vs **Message** with distinct icons and subtle background tints.

### B) Round screens (decision feel)
- Add a lightweight “selected state” animation: option card slightly enlarges + glow border.
- Add haptic feedback on select and on commit (success haptic).
- Add a tiny progress indicator under the header (3 dots or segmented bar) matching Stitch styling.

### C) Reveal screen (make the “Aha” land)
- Make the reveal feel like a “case file solved”:
  - “Truth” in a bold card,
  - “Why” as a separate paragraph,
  - “Pattern” as a highlighted takeaway.
- Show “Most common wrong path” (e.g., round-by-round distribution snippet) to teach *why people miss it*.
- Add a dedicated **ShareCard** component (PNG capture):
  - Title, category, score, “Only X% got this right”, CTA.

### D) Home screen (retain + direct)
- Replace static “Streak / Level” placeholders with real computed stats (accuracy, streak, completions).
- Add “Daily completed” state:
  - show your score,
  - show “Come back tomorrow”.

### E) Visual polish
- Tighten typography hierarchy:
  - use display font for headers only,
  - body font for long text,
  - consistent uppercase micro-labels.
- Standardize card paddings and vertical rhythm (e.g., 18/22/28 spacing steps).
- Reduce simultaneous glow layers; keep one primary glow accent per screen to avoid visual noise.

### F) Accessibility
- Ensure minimum contrast ratios for muted text.
- Support Dynamic Type (font scaling) and avoid clipped long messages.
- Add “Reduce Motion” to disable selection animations.

## 11) Suggested v1.1 / v2 roadmap

- Practice mode selection using the same 3-round puzzles (random unplayed by category).
- Completion submission to Supabase:
  - insert into `user_puzzle_completions`,
  - call `update_puzzle_stats`,
  - update `user_streaks` for dailies.
- Leaderboards:
  - global top 10,
  - country rankings.
- Content pipeline:
  - puzzle authoring checklist,
  - QA rubric for “one best answer”.

## 12) Puzzle authoring checklist

A puzzle is “shippable” if:
- Context is specific (who/what/why/relationship).
- The message is realistic and short.
- Each round’s options are mutually exclusive and not trivially dismissible.
- The correct path is defensible and teachable.
- The reveal teaches a generalizable pattern.

---

If you are an AI agent continuing this project:
- Keep changes minimal and aligned with the Stitch reference.
- Do not reintroduce slider mechanics.
- Prefer safe, server-validated writes for completions/stats.
