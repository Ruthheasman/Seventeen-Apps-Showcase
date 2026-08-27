# Seventeen Apps — Ruth Heasman

A static, single-page brochure showcase for Ruth Heasman's seventeen BSV-focused apps. Visitors land on a full-viewport hero with a draggable 3D fan carousel of all seventeen app cards, then scroll through one generous panel per app. Every app links out to the live product in a new tab.

## Run & Operate

- Preview runs from the managed workflow `artifacts/seventeen-apps: web` — do not run `pnpm dev` at the repo root
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/seventeen-apps run typecheck` — typecheck just the site
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/scripts run fetch-app-previews` — refresh app preview images from each app's live Open Graph tags
- No environment variables or secrets are required

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Site: React 18 + Vite + Tailwind v4, `wouter` for routing
- No backend, no database, no auth — the site is fully static

The workspace also ships an unused Express API server, Drizzle/Postgres lib, and OpenAPI codegen from the monorepo template. This project does not use them.

## Where things live

- `artifacts/seventeen-apps/` — the site (the only artifact that matters here), served at `/`
- `artifacts/seventeen-apps/src/data/apps.ts` — **source of truth for all app content.** The ordered list of seventeen apps with name, description, URL and image path, plus `appImageUrl()` for resolving image paths against the Vite base URL
- `artifacts/seventeen-apps/public/apps/` — the seventeen app preview images
- `artifacts/seventeen-apps/src/index.css` — theme tokens and palette
- `scripts/src/fetch-app-previews.mjs` — refreshes preview images from live Open Graph tags
- `attached_assets/Pasted-Thursday-17-Apps-Prompt-*.txt` — the original written design specification for this page

## Architecture decisions

- **App content is data, not markup.** Names, descriptions and URLs were supplied exactly and must not be inferred from repository metadata or rewritten. Everything reads from `src/data/apps.ts` so there is one place to correct.
- **Preview images are real, never generated.** Eleven come from each app's live Open Graph image; six apps publish no usable `og:image` and were captured with a live screenshot instead. Re-running the fetch script only refreshes the Open Graph ones — it reports the other six as MISS and leaves the captures alone.
- **Carousel state is one number.** Every card's position, depth, rotation, scale, opacity, blur and z-index derives from a single fractional carousel position clamped 0–16. There are no independent per-card positions.
- **Transforms run through `requestAnimationFrame`, not layout animation.** CSS transitions are reserved for deliberate settling, tab reveals, arrow movement and panel reveals.

## Product

- Full-viewport hero with the headline and a wide, shallow circular fan of all seventeen app cards, draggable by pointer, trackpad, or arrow keys, with momentum and a settle to the nearest card
- Clicking a card brings it to centre and expands it; clicking again returns it to the fan
- Each card carries its app number, title, description and a real `Open app` anchor that opens in a new tab without toggling the card's focus state
- One near-full-viewport panel per app below the carousel, in three rotating layouts, revealed on scroll
- Keyboard accessible throughout, with a visible vermilion focus treatment, and a static readable fallback under `prefers-reduced-motion`

## User preferences

- Self-host font files rather than loading from third-party font CDNs; system stacks are preferred over a CDN
- App names, descriptions and URLs are fixed — do not reword them
- No generated or decorative artwork on this page; the app screenshots are the only strongly coloured elements
- No emojis in the UI

## Gotchas

- Preview image paths must be resolved with `appImageUrl()`. A bare root-relative path like `/apps/foo.jpg` escapes the artifact's base path and breaks when the site is not served at the root.
- The app screenshots are mixed aspect ratios and mostly landscape. Carousel crops anchor to the left/top rather than centring, at every breakpoint.
- `pnpm --filter @workspace/seventeen-apps run build` needs `PORT` and `BASE_PATH` from the workflow, so it can fail from a bare shell even when the code is fine. Use `typecheck` to verify from the shell.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
