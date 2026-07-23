# The Water Promise

A typing-speed game that funds clean water. Play a round, an ad refreshes, and a share of that revenue funds a real cup of clean water through charity: water. Get faster; someone gets water. **One run, one cup.**

**Live site:** https://the-water-promise.vercel.app
A project of **The Little Tree Company, LLC**.

## Auto-deploy

This repo is connected to Vercel. **Any commit pushed to `main` deploys itself** to the live site — no manual steps. Edit a file, commit, and it's live in about a minute.

## How it's built

Plain static site — HTML, CSS, and one JavaScript file. No framework, no build step. Open `index.html` in a browser and it just runs.

- `index.html` — home
- `play.html` + `app.js` — the game: adaptive typing coach, 1-minute face-off, mobile word puzzle, the canvas water-pour animation, plus live accounts and leaderboard
- `impact.html`, `how.html`, `about.html`, `missions.html`, `milestones.html`, `shop.html`, `donate.html`, `leaderboard.html` — the rest of the pages
- `privacy.html` — privacy policy (required for Google AdSense)
- `styles.css` — all styling
- `vercel.json` — tells Vercel to serve this as a static site (no framework build)

## Run it locally

No install needed. Open `index.html` directly, or serve the folder:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Backend

Accounts and the live leaderboard use **Supabase** (the keys in `app.js` are public "publishable" keys, safe to expose — the database is protected by row-level security). Donations go directly to **charity: water**; **Stripe** handles any payments. The exact setup steps live in the handoff package (the "Money Rails" guide).

## Editing with Codex

There's a full build spec in the handoff package you can paste into Codex to rebuild or extend the whole thing.

## Principles

Honest by construction: "cups" is a storytelling unit for dollars raised; charity: water delivers the actual water. No false impact claims. Public counters show donations only, never our cut.
