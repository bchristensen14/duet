# Duet

**The headhunter for creative collaboration.** This repo holds two pages, deployed together:

| Page | Path | Source |
| --- | --- | --- |
| Landing page with waitlist signup | `/` | `index.html`, `src/landing/` |
| Duet Community demo (MVP) | `/demo/` | `demo/index.html`, `src/main.tsx`, `src/pages/` |

Live at https://bchristensen14.github.io/duet/ (demo at `/duet/demo/`).

## Landing page

A minimal page (system UI font, no third-party requests until someone signs up) that explains the product with a product
preview, the key interview insight, the free Community and Premium search, and the team; links to the
demo; and collects waitlist signups: email (required) plus an optional
"Any feedback, or features you'd like to see?" box.

### Connecting the waitlist (Google Forms)

GitHub Pages has no server, so the page submits signups to a Google Form in the background.
Visitors only ever see Duet's own form; responses land in Google Forms (and a Google Sheet if you link one).
Free, with no response limit.

1. Create a Google Form with two questions:
   - **Email**: short answer, required.
   - **Feedback or features you'd like to see**: paragraph, optional.
2. In the form's **Settings → Responses**: set *Collect email addresses* to **Do not collect**, and turn
   **off** *Limit to 1 response* and any *Restrict to users in…* option (these require a Google sign-in).
   Keep *Accepting responses* on, and **Publish** the form.
3. Optional: in **Responses**, click *Link to Sheets* to collect signups in a spreadsheet.
4. Copy the form's public link (**Send → link**) and run:

   ```bash
   npm run waitlist:ids -- "https://docs.google.com/forms/d/e/…/viewform"
   ```

   It prints three lines; paste them into `.env` and push. The deploy picks them up automatically.

The script also catches the settings that would make Google silently reject signups.
That matters because Google doesn't let other sites read its replies (the page posts in `no-cors` mode),
so only network failures show up as errors on the page. Re-run it whenever you edit the form's questions.

While `.env` is empty, the site is a preview: the form says signups aren't collected, nothing is sent
or stored, and the deploy workflow logs a warning.

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
npm run waitlist:ids -- "<Google Form link>"   # print the waitlist .env lines
```

## Deploy

Pushes to the default branch deploy to GitHub Pages via `.github/workflows/deploy.yml`
(one-time setup: repo **Settings → Pages → Source: GitHub Actions**).

## Next steps toward production

Auth and a real database, media uploads, real-time messaging, notifications,
an AI matcher trained on profile and portfolio signals, and payments for Premium briefs.
