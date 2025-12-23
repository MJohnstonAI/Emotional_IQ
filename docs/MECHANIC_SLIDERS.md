# Emotional IQ v1 — Slider Mechanic

Each daily puzzle is a short message (text/email). Your goal is to infer the “true emotional intent” by setting 5 tone sliders:

- Anger 😡 (0–100)
- Affection ❤️ (0–100)
- Anxiety 😬 (0–100)
- Joy 😄 (0–100)
- Control 🕹️ (0–100)

## Attempts

- You get up to 6 attempts per day.
- After each attempt the app shows:
  - Overall Resonance Score (0–100)
  - A per-slider directional hint: `↑ higher` / `↓ lower` / `✓ close`

## Win/Loss

- Win: all 5 sliders are within ±7 of the target.
- Loss: 6 attempts used without a win.

## Scoring (Resonance)

For each slider `s`:

- `diff = abs(guess[s] - target[s])`  (0..100)
- `nd = diff / 100`
- `perSlider = exp(-k * nd^2)`  (k defaults to 4.0)

Overall resonance:

- `resonance = round(100 * average(perSlider over 5 sliders))`

