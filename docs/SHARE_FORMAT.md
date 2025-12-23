# Share Format (Spoiler-Free)

The share output is “Wordle-like” and does not reveal numeric targets.

## Tile thresholds (per slider)

- Green `🟩` if `abs(diff) <= 7`
- Yellow `🟨` if `abs(diff) <= 18`
- Gray `⬛` otherwise

## Layout

- 5 rows (one per tone), each row starts with the tone emoji.
- Each attempt adds one tile to each row.
- Up to 6 attempts.

Example (format only):

```
😡 🟨🟩⬛
❤️ 🟩🟨⬛
😬 ⬛🟨🟩
😄 🟨🟨🟩
🕹️ ⬛🟩🟨
```

