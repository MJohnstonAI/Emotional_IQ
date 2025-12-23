# Emotional IQ (Expo + Supabase)

Pixel-faithful Emotional IQ game built from Stitch exports. Includes UI overlay harness, daily puzzle logic, Supabase schema, and Google Play Billing scaffolding.

## Install & Run

```bash
npm install
npx expo start
```

## Environment Setup

Create `.env.local` with:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Supabase Setup

1. Create a new Supabase project.
2. In the SQL editor, run `supabase/schema.sql`.
3. Enable email magic link in Auth settings.
4. Copy your project URL and anon key into `.env.local`.

## Android Build

```bash
npx expo prebuild -p android
npx expo run:android
```

## Play Console IAP Setup Checklist

1. Create in-app products:
   - `emoiq_remove_ads` (non-consumable)
   - `emoiq_pro_access` (non-consumable)
2. Add license testers.
3. Upload an internal testing build.
4. Verify purchase flow and restore.

## Google Play Purchase Validation

An Edge Function skeleton lives at `supabase/functions/validate_google_play_purchase/index.ts`.
Replace the TODO block with Google Play Developer API validation using a service account key stored in Supabase secrets.

## Notes

- Use the triple-tap in the header area to toggle Stitch overlay.
- Overlay controls allow opacity, offset, and scale nudges for pixel matching.
- Daily puzzle is always free; Pro unlocks archive and ad removal hides the sponsor bar.
