# Duet

**The headhunter for creative collaboration.** This repo holds two pages, deployed together:

| Page | Path | Source |
| --- | --- | --- |
| Landing page with waitlist signup | `/` | `index.html`, `src/landing/` |
| Duet Community demo (MVP) | `/demo/` | `demo/index.html`, `src/main.tsx`, `src/pages/` |

Live at https://bchristensen14.github.io/duet/ (demo at `/duet/demo/`).

## Landing page

Explains the product (problem, what we learned, free Community + Premium search, who it's for, team),
links to the demo, and collects waitlist signups: email (required), plus optional first name, city,
discipline (including "hiring for a label, studio, agency or brand") and a free-text
"What would you want Duet to do for you?" feedback box.

### Connecting the waitlist

GitHub Pages has no server, so signups are POSTed as JSON to a form service.
It's built for [Formspree](https://formspree.io) (free tier: 50 submissions/month, dashboard and CSV export);
any service that accepts a JSON POST and returns a 2xx works the same way.

1. Create a free Formspree account and a new form. Copy its endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
2. In GitHub: **Settings → Secrets and variables → Actions → Variables → New repository variable**,
   name `WAITLIST_ENDPOINT`, value = that URL.
3. Re-run the **Deploy to GitHub Pages** workflow (Actions tab), or push any change.

Signups then appear in the Formspree dashboard. In Formspree's form settings, consider restricting
submissions to the `bchristensen14.github.io` domain.

Until the variable is set, the form still works but signups are only remembered in the visitor's
browser, and the form shows a "Preview: the waitlist isn't connected yet" note so nobody is misled.
Locally, put `VITE_WAITLIST_ENDPOINT=https://formspree.io/f/...` in `.env.local` to test against a real form.

## Demo (Duet Community MVP)

The free tier: a social app where creatives showcase their portfolio, discover people in their scene,
and get suggested matches. Premium ("we do the search for you") is shown as a brief form.

- **Onboarding**: create a profile (discipline, location, styles, who you want to work with, availability).
  "Try as William" fills in the persona from customer interviews.
- **Showcase**: a feed of community work (audio, video, image, text) with likes, filters, and posting to your own portfolio.
- **Discover**: search and filter creatives by discipline, style, location and availability. Follow or message them.
- **Matches**: ranked collaborator suggestions, each with a fit score and the reasons behind it.
- **Profiles**: portfolio, styles, what they're looking for, and "why you two might click".
- **Messages**: one-to-one threads with a suggested opener (seed users send a demo reply).
- **Premium**: submit a brief (project, disciplines, style, timeline) for a vetted shortlist. No payment is taken.

How it works:

- No backend. Demo state lives in `localStorage` (`src/lib/store.tsx`);
  **Reset** in the top bar restores the seed data in `src/data/seed.ts`.
- Matching (`src/lib/match.ts`) is a transparent weighted score standing in for the AI matcher:
  discipline fit in both directions, shared styles, same city or region, and availability.
  Swapping in a model-backed matcher means replacing `scoreMatch` / `suggestMatches`.

## Run it

```bash
npm install
npm run dev      # landing at http://localhost:5173/, demo at http://localhost:5173/demo/
npm run build    # type-check and production build of both pages into dist/
npm run lint
```

## Deploy

Pushes to the default branch deploy to GitHub Pages via `.github/workflows/deploy.yml`
(one-time setup: repo **Settings → Pages → Source: GitHub Actions**).

## Next steps toward production

Auth and a real database, media uploads, real-time messaging, notifications,
an AI matcher trained on profile and portfolio signals, and payments for Premium briefs.
