# Duet Community (MVP)

The free tier of **Duet, the headhunter for creative collaboration**: a social app where creatives
showcase their portfolio, discover people in their scene, and get suggested matches.
Premium ("we do the search for you") is shown as a brief form at the end of the funnel.

## Features

- **Onboarding**: create a profile (discipline, location, styles, who you want to work with, availability).
  "Try as William" fills in the persona from customer interviews.
- **Showcase**: a feed of community work (audio, video, image, text) with likes, filters, and posting to your own portfolio.
- **Discover**: search and filter creatives by discipline, style, location and availability. Follow or message them.
- **Matches**: ranked collaborator suggestions, each with a fit score and the reasons behind it.
- **Profiles**: portfolio, styles, what they're looking for, and "why you two might click".
- **Messages**: one-to-one threads with a suggested opener (seed users send a demo reply).
- **Premium**: submit a brief (project, disciplines, style, timeline) for a vetted shortlist. No payment is taken.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check and production build into dist/
```

## How it works

- React + TypeScript + Vite, no backend. State lives in `localStorage` (`src/lib/store.tsx`);
  **Reset** in the top bar restores the seed data in `src/data/seed.ts`.
- Matching (`src/lib/match.ts`) is a transparent weighted score standing in for the AI matcher:
  discipline fit in both directions, shared styles, same city or region, and availability.
  Swapping in a model-backed matcher means replacing `scoreMatch` / `suggestMatches`.

## Next steps toward production

Auth and a real database, media uploads, real-time messaging, notifications,
an AI matcher trained on profile and portfolio signals, and payments for Premium briefs.

## Deploy

Pushes to the default branch deploy to GitHub Pages via `.github/workflows/deploy.yml`
(one-time setup: repo **Settings → Pages → Source: GitHub Actions**).
Live at https://bchristensen14.github.io/duet/
