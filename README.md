# Ali Sabbagh — A World of Design

An interactive designer portfolio set in an illustrated fantasy archipelago. Explore Campaigns, Reels, and Social Media islands, zoom into their collections, and discover animated boats, villagers, birds, and water. Visitors can enable an original ambient soundtrack.

## Run locally

Requires Node.js **22.13 or later** and npm.

```sh
npm ci
npm run dev
```

Open the local address printed in the terminal, normally `http://localhost:3000`.

## Build

```sh
npm run build
npm start
```

The build produces a Cloudflare Workers-compatible application. `npm start` runs the production build locally through Wrangler.

## Project guide

- `app/page.tsx` — map navigation, island views, work index, and collection dialogs.
- `app/globals.css` — colors, responsive layouts, transitions, and animation styles.
- `lib/world.ts` — island definitions, collection names, marker positions, and scene crops.
- `lib/art.ts` — artwork paths and dimensions.
- `components/world-life.tsx` — sprite frames and movement routes.
- `lib/ambience.ts` — original music generated with the Web Audio API.
- `public/art/` — map illustrations and animation sprite sheets.
- `public/fonts/` — locally served fonts.
- `.openai/hosting.json` — configuration for the existing Sites deployment.

The initial islands and their navigation are implemented. Project collections currently display “coming soon” states, ready to be replaced with portfolio work.

## Stack

React, TypeScript, Vinext, Vite, Tailwind CSS, Base UI, and Shadcn components. Animations respect reduced-motion preferences, and music starts only after a visitor enables it.
