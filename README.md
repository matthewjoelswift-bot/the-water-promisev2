# The Water Promise

A typing-speed game that funds clean water. Finish a run → an ad refreshes → a share of the ad revenue funds a cup of clean water through charity: water. **One run, one cup.**

Live: the-water-promise.vercel.app · A project of **The Little Tree Company, LLC**.

## What's here (static prototype)
- `/` landing · `/play` the game · `/impact` charity + the math · `/how` how it works + word-puzzle rules
- `styles.css` shared design system · `app.js` game logic + canvas water physics
- Three modes: **adaptive typing** (desktop), **1-minute face-off**, **word puzzle** (mobile)

This is the front-end prototype. Accounts, saved stats, real ads, and live donations come next (see Roadmap).

## Stack (current + planned)
- **Now:** static HTML/CSS/JS, deployed on **Vercel** (project `the-water-promise`, team `matthewjoelswift-bots-projects`).
- **Next:** rebuild as **Next.js + Supabase** (Postgres + Auth) for accounts, saved WPM history, leaderboards, and server-validated rounds; **Stripe** for donations/merch; a **donations API** (Change/Pledge) to auto-remit to charity: water.

## Infra & accounts (memory — where things live)
- **GitHub:** repo under `matthewjoelswift-bot`. This is the source of truth + history for Codex.
- **Vercel:** team `matthewjoelswift-bots-projects`; project `the-water-promise`.
- **Cloudflare:** Little Tree Co has an account/API token (Matthew holds it). Not required for the Vercel path; noted here so it's not forgotten.
- **Stripe:** Little Tree Co Stripe exists. Secret keys are set in the Vercel project's Environment Variables by a human — never committed to this repo.
- **Ads:** Google AdSense account (Little Tree Co) — banners once the site is approved. Rewarded video via a game network (AdinPlay) later. (AppLixir needs 100k monthly impressions — not yet.)
- **Charity:** an official **charity: water fundraising campaign** (pending) is the legal, transparent way to route giving and use their name.

## Deploy
Static — Vercel serves it as-is (`vercel.json` sets clean URLs). Pushing to the connected GitHub repo auto-deploys once Vercel is linked to it.

## Roadmap
1. Next.js + Supabase rebuild with accounts, saved stats, opt-in leaderboard.
2. Adaptive engine v2 (per-key latency, SM-2 spaced repetition) — see the learning-science design doc.
3. Stripe donations + merch; donations-API auto-remit; live transparency ledger.
4. AdSense banners live → rewarded video → tuning.
5. A/B experiment framework (log everything; improve over time).

## Principles
Honest by construction: "cups" is a storytelling unit for dollars raised; charity: water delivers the water. No false impact claims. Public counters show donations only, never our cut.
