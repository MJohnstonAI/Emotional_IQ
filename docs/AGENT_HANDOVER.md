# Agent Handover

This document gives a new AI agent enough context to continue development safely.

## 1) Product summary

Emotional IQ is a daily quiz game. Players read a context and message, answer N questions
(N >= 3), then see a reveal. Supabase is the single source of truth for all puzzle content.

## 2) Key app flows

Daily puzzle:
- `app/(tabs)/home.tsx` shows today's puzzle.
- `app/play/context.tsx` shows context + message.
- `app/play/round-1.tsx`, `round-2.tsx`, `round-3.tsx` show questions.
- `app/play/reveal.tsx` submits answers and shows score + stats.

State + data:
- `src/state/branchingGameStore.ts` (fetch puzzle, track selections, submit)
- `src/lib/puzzleSelection.ts` (Supabase read queries)
- `src/lib/supabase.ts` (Supabase client)

## 3) Supabase schema and logic

Source of truth:
- `supabase/schema.sql`
- `supabase/migrations/003_normalized_quiz_schema.sql`
- `supabase/migrations/004_quiz_grading_mode.sql`

Schema overview:
- `docs/DATABASE_SCHEMA.md`
- `docs/SUPABASE_DB_REBUILD.md` for rebuild + verification SQL

Server scoring:
- `submit_quiz_attempt(p_puzzle_id, p_answers)` handles scoring, stats, streaks.

## 4) Monetization / Play Store

IAP:
- `src/state/purchaseStore.ts` handles Android billing.
- Product IDs in `src/lib/iap.ts`.
- Supabase tables: `entitlements`, `purchases`.

Server verification:
- `supabase/functions/validate_google_play_purchase/index.ts` is a stub.
  Replace with Google Play Developer API verification.

## 5) Android build notes

From README:
- `npx expo prebuild -p android`
- `npx expo run:android`

When preparing for Play Store:
- Ensure signing configs, versionCode, and build variants are correct.
- Integrate purchase validation in the edge function.

## 6) Known follow-ups

- Add practice mode UI (the fetch helper exists).
- Add admin or content tooling for puzzle creation.
- Improve reveal stats display using `quiz_answer_option_stats`.
