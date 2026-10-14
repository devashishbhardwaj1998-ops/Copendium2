# Compendium

**A private-markets complexity knowledge book.** Compendium is an analyst encyclopedia and casebook of
complicated private-market situations — reverse mergers, De-SPACs, carve-outs, unitranche facilities, VIE
structures and more — each with plain-language explanations, why it's hard to record correctly, an analyst
checklist, and real Gain asset examples.

Built with **React 19 + TypeScript + Vite + Tailwind CSS v4**. It is a fully static single-page app: no server,
no database, no API keys.

---

## Features

- **Three-section library** (Background, Financials, Others) of case types with descriptions, complexity notes,
  analyst checklists and tags
- **Real asset examples** linked to one or more case types, with Gain asset links, tickers and takeaways
- **Global search** (`⌘K` / `Ctrl K` / `/`) across names, descriptions, checklists, tags and examples
- **Shareable URLs** — every section and case has its own link (`#/case/case-spac-deals`), and back/forward and
  refresh work as expected
- **Editor mode** behind a passcode to add, edit, move and delete cases and examples
- **Backup & restore** — export the whole knowledge book as JSON, import it elsewhere, or reset to defaults
- Light/dark theme, mobile layout, keyboard-accessible dialogs

## Quick start

Requires **Node.js 20+** (22 recommended — see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script              | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the dev server with hot reload           |
| `npm run build`     | Type-check and build to `dist/`                |
| `npm run preview`   | Serve the production build locally             |
| `npm run typecheck` | Run the TypeScript compiler only               |
| `npm test`          | Run the unit tests (Vitest)                    |

## Deploying

### GitHub Pages (included)

The repo ships with `.github/workflows/deploy.yml`, which type-checks, tests, builds and publishes on every push
to `main`.

1. Push this repository to GitHub.
2. In the repo, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).

Your site will be at `https://<user>.github.io/<repo>/`. No base-path configuration is needed — the build uses
relative asset paths and hash-based routing, so it works at any sub-path.

> **Heads-up:** on free GitHub plans, Pages sites are public even if the repository is private. If the seed data
> or your edits are internal-only, use a plan with private Pages, or one of the hosts below with access control.

### Other static hosts

Any static host works with the defaults — no rewrites or redirects required:

- **Netlify / Cloudflare Pages:** build command `npm run build`, publish directory `dist`
- **Vercel:** framework preset *Vite* (auto-detected)

### Configuration

All optional. Copy `.env.example` to `.env.local` for local use, or set them in your host's build settings.

| Variable               | Default | Purpose                                                                     |
| ---------------------- | ------- | --------------------------------------------------------------------------- |
| `VITE_EDITOR_PASSCODE` | `gain`  | Default passcode for Editor mode. On GitHub, set a repo secret named `EDITOR_PASSCODE`. |
| `BASE_PATH`            | `./`    | Absolute base path, only if you need one (e.g. `/compendium/`).             |

## How data works

- The bundled knowledge book lives in [`src/data/seedData.ts`](src/data/seedData.ts). **Editing that file and
  redeploying is how you change what everyone sees.**
- Edits made in the browser in Editor mode are saved to that browser's `localStorage` only. They are not shared
  with other users. Use **Export** in the data dialog to download them as JSON, and either **Import** them in
  another browser or paste the content into `seedData.ts` to publish them.
- The editor passcode is a **soft lock against accidental edits, not security.** The app is entirely client-side,
  so anyone can bypass it with dev tools. Changed passcodes are stored as a SHA-256 hash in the browser.

## Project structure

```
src/
├── App.tsx                 # Layout, routing and dialog orchestration
├── main.tsx                # Entry point
├── types.ts                # Domain types
├── data/seedData.ts        # Default knowledge book content
├── store/
│   ├── knowledgeBook.ts    # Immutable store + localStorage persistence (useSyncExternalStore)
│   └── selectors.ts        # Pure read helpers
├── hooks/
│   ├── useHashRoute.ts     # Tiny hash router
│   └── usePersistentState.ts  # Theme and role
├── lib/                    # Search, passcode hashing, checklist parsing, helpers
└── components/
    ├── ui/                 # Modal, form fields, section icon
    └── *.tsx               # Pages and dialogs
```

## Changes from the AI Studio export

This codebase was rewritten from a Google AI Studio export:

- Removed unused dependencies (Gemini SDK, Express, dotenv, motion) and AI Studio config
- Replaced the mutable singleton service with an immutable store wired through `useSyncExternalStore`, with
  cross-tab sync
- Added hash routing (deep links, back button, refresh) and a not-found page
- Collapsed ~15 pieces of modal state into a single dialog state; editor-only actions share one passcode gate
- Shared, accessible `Modal` (Escape to close, focus handling, scroll lock) — previously Escape did nothing
- Passcode is hashed instead of stored in plain text; legacy plain-text passcodes migrate automatically
- Fixed checklist parsing (`1. item` used to render as `. item`), undefined animation and colour classes, and
  the mobile header overflowing on phones
- Section icons now come from each section's `iconName` / `colorTheme` instead of hard-coded IDs
- Strict TypeScript, unit tests, CI and a GitHub Pages workflow
