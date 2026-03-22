# WordPour

A liquid-themed word game where letters flow and cascade. Spell words by pouring letter tiles together before they settle.

## Play

Open `index.html` in a browser, or deploy to any static host.

## Features

- Liquid-inspired animations — letter tiles pour and settle with fluid motion
- Valid English word checking
- Particle effects and celebrations on successful words
- Global leaderboard via Firebase Firestore
- Mobile-friendly (no zoom, touch-optimized)
- Animated background with blobs

## Stack

- Vanilla HTML/CSS/JS (no build step)
- Firebase Firestore for leaderboard
- Google Fonts (Outfit)

## Run Locally

```bash
# Any static file server:
python3 -m http.server 8080
# Then open http://localhost:8080
```

No Node, no build required.
