# AGENTS.md

## Commands

Preferred package manager: **yarn** (both `yarn.lock` and `package-lock.json` exist, but scripts reference yarn).

- **Start**: `yarn start` — runs `vite --debug hmr` on `http://localhost:3000`
- **Typecheck**: `yarn tsc_check` — strictly faster than `vite build`
- **Lint**: `yarn lint` — `eslint src --ext .js,.jsx,.ts,.tsx --fix`
- **Build**: `yarn build` — outputs to `build/`, then postbuild copies `index.html` → `404.html` (GH Pages SPA fallback) and runs `sw-setup`
- **Deploy preview**: `yarn preview`
- **Deploy pages**: `yarn deploy` (`predeploy` runs `yarn build` automatically)
- **Analyze bundle**: `yarn analyze`
- **No tests**: No test framework is configured. Do not invent one.

## Architecture

- React 18 + TypeScript 6 app, migrated from CRA to Vite 6. README still shows CRA docs — ignore them.
- State: Redux Toolkit. Slices live in `src/store/` (`layoutSlice`, `settingsSlice`, `dbSlice`, `uiSlice`, `navSlice`, `playerSlice`).
- Router: react-router v7. Entrypoint: `src/index.tsx` → `src/App.tsx`.
- i18n: `react-intl`. Translations are lazy-loaded from `src/translations/${lang}.json`.
- Firebase: v7 SDK. Config is **hardcoded in `src/App.tsx`**, not in env files.
- Icons: FontAwesome via `@fortawesome/react-fontawesome`.
- Styling: SCSS (`.scss` files), not CSS Modules.

## Paths & Env

- Path alias: `@` → `src/` (configured in both `tsconfig.json` and `vite.config.ts`).
- Env prefix: `VITE_` and `PUBLIC_` (see `vite.config.ts` `envPrefix`). Notable vars:
  - `PUBLIC_URL` — base path (default `/`)
  - `VITE_ENABLE_SW` — `false` in dev, `true` in prod
- Env files: `.env`, `.env.development`, `.env.production`. Local overrides (`.env.local`, etc.) are gitignored.

## Build & PWA Quirks

- Service worker is **custom** (`public/sw.js`), not `vite-plugin-pwa` (commented out). After `vite build`, `sw-post-build.mjs` injects timestamps, copies the Vite manifest (`app-manifest.json`), and writes a `public-manifest.json` of static assets.
- `emptyOutDir: true` in Vite config wipes `build/` each build. Do not place authored assets there.
- `postbuild` runs `cpx 'build/index.html' 'build/404.html'` for GH Pages support. If `VITE_ENABLE_SW=false`, the SW setup step still runs but the registration in `src/sw-registration.js` should respect the flag.

## Keyboard & Wake Lock

- Screen wake lock is enabled by default via `useWakeLock` in `App.tsx`. Audio playback also controls wake lock.
- Keyboard shortcuts are wired via `src/hooks/useCommands.tsx`.
