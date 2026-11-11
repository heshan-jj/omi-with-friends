# Omi with friends

A private, browser-based table for the Sri Lankan partnership card game Omi. Built with Next.js, TypeScript, Tailwind CSS, Motion, and PartyServer on Cloudflare Durable Objects.

## Play locally

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev:room
# In a second terminal:
npm run dev
```

Open http://localhost:3000. Create a private table and share the room link. Each friend should use a separate browser profile or device. Take a seat, mark ready, and let the host deal. The first seated player is the host. Partners sit opposite: seats 1/3 versus 2/4. Nicknames are limited to 24 characters.

`NEXT_PUBLIC_PARTYKIT_HOST` defaults to `localhost:1999` or `127.0.0.1:1999` only on those loopback hosts. For a remote preview, set it explicitly to a reachable Cloudflare Worker host. The service must allow the exact frontend origin.

## What works

- Private invite links and room codes, with guest nicknames.
- Four human players, seat selection, readiness, host-controlled dealing.
- Counterclockwise two-stage deal and play; trumps chosen after the first four cards.
- Follow-suit validation, trump resolution, eight tricks per hand, token scoring to ten.
- Repeated draw carryovers, automatic three-token Kapothi, next hands, rematches.
- Server-authoritative state; each connection receives only its own hand. Only the first four cards are sent before the trump call.
- Persisted room state and browser-held reconnect credentials; play pauses until all four players reconnect.
- Responsive table, reduced-motion support, keyboard-operable cards, and in-game rules.

## Rules used here

Cards rank A, K, Q, J, 10, 9, 8, 7. A player must follow the led suit if able; otherwise any card is legal. Trump callers earn one token for 5–7 tricks, defenders two, either team three for all eight. Each 4–4 hand adds one carry token to the next decisive hand. First team to ten or more earned tokens wins. This initial version does not implement the announced-Kapothi penalty variation.

Rules reference: https://www.pagat.com/whist/omi.html

## Validate

```sh
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Browser tests cover home/join validation, rules, four separate players, an eight-trick hand, hidden-card payloads, page refresh, disconnect/pause/rejoin, mobile overflow, and the next deal. Linux cloud development uses `/usr/bin/chromium` when available; otherwise Playwright uses its installed browser. Install it with `npx playwright install chromium`.

## Publish to GitHub, Cloudflare, and Vercel

### 1. Push the repository

Authenticate GitHub CLI, then create a private repository from this directory:

```sh
gh auth login
gh repo create omi-with-friends --private --source=. --remote=origin --push
```

### 2. Deploy the room service

```sh
npx wrangler login --device
npm run deploy:room
```

The CLI returns the actual Cloudflare Worker hostname. Use that returned value. Room data lives in SQLite-backed Durable Objects in your Cloudflare account. The `Main` binding preserves the default `/parties/main/:room` socket URL. The hosted PartyKit platform shut down on 23 October 2026; this repository uses its supported successor, PartyServer, directly on Cloudflare.

### 3. Deploy the frontend

Import the GitHub repository into Vercel as a Next.js project. Set **NEXT_PUBLIC_PARTYKIT_HOST** to the deployed Cloudflare Worker hostname, without `https://`. Deploy. This variable is included at build time; redeploy when it changes.

### 4. Allow the frontend origin on the room service

```sh
# Set vars.ALLOWED_ORIGINS in wrangler.jsonc to the exact frontend origin.
# Example: https://your-app.vercel.app
npm run deploy:room
```

Use a comma-separated list for multiple exact origins. No wildcard origins are accepted. New preview deployment URLs need their own allowlist entry. Production connections fail closed when this setting is absent.

Verify the deployed URL with four separate sessions, including a refresh and a disconnect/rejoin, before sharing with friends. A Vercel frontend alone is not a playable multiplayer deployment.

## Privacy and limits

Rooms are unlisted, accessible to anyone holding their invite code. This is link-based privacy, not an authenticated members-only service. Spectators can see public table information but never private hands. Browser storage holds a random, per-room reconnect credential; the server stores its SHA-256 digest and never broadcasts it. Clearing browser storage loses that seat credential. Do not share it.

This first version has no bots, public matchmaking, accounts, chat, rankings, or timer-based forfeits. A disconnected player must return in the same browser profile; otherwise the group can create a new table. Room state is retained until manually removed from the hosting service; automated expiry is not implemented yet.

## Source map

- `lib/game.ts`: pure rules and cryptographically shuffled deck.
- `lib/protocol.ts`: private room state and public view types.
- `party/index.ts`: transport-independent authority, persistence, sessions, presence, origin validation.
- `party/worker.ts`: PartyServer adapter and Cloudflare Worker routing.
- `app/ui.tsx`: home, lobby, table, and browser connection.
- `app/globals.css`: responsive visual system.
- `tests/`, `e2e/`: game/server unit checks and real browser integration tests.

Fonts are self-hosted through the OFL-licensed Fontsource Bodoni Moda and Manrope packages. Card suit icons are authored SVG; UI icons use Lucide (ISC). No remote images or runtime font services are required.
