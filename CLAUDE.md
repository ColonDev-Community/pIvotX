# pIvotX

Lightweight 2D game development library — Vanilla JS, TypeScript, React & React Native / Expo.

- Repo: https://github.com/ColonDev-Community/pIvotX
- Package: `@colon-dev/pivotx`
- Homepage: https://pivotx.colondev.com/
- Currently working on: **v2.0.0** (see `CHANGELOG.md` / `package.json` for current state)

## Structure

- `src/core` — engine-agnostic core (Canvas, Point, animation, audio, camera, physics, shapes, tilemap, assets, input [Keyboard/GamepadInput], ui [UIManager + widgets])
- `src/react` — React bindings (`PivotCanvas`, hooks, components) — entry `./react`
- `src/react-native` — React Native / Expo bindings (`PivotNativeCanvas`, bridge, hooks, web fallback) — entry `./react-native`
- `dist` — built output (cjs/esm/umd + `.d.ts`), generated via `npm run build` (Rollup), do not hand-edit
- `examples` — standalone HTML/TS/TSX usage demos (vanilla, React, Expo, sound, sprite animation, platformer)
- `GUIDE.md` — long-form usage guide; `TYPESCRIPT_REACT_GUIDE.md` — TS+React specific guide
- `README.md` / `CHANGELOG.md` — kept current with each release

## Scripts

- `npm run build` — Rollup build to `dist`
- `npm run dev` — Rollup watch mode
- `npm run type-check` — `tsc --noEmit`
- `npm run lint` / `lint:fix` — ESLint over `src/`
- `prepublishOnly` runs lint + type-check + build

## Related repos — keep in sync on every lib update

This is the **source of truth** library. Two other repos consume it and must be checked/updated whenever core APIs, exports, or behavior change here — especially significant during the v2.0.0 push:

1. **Expo sample app** — `../pIvotX-expo` (local path: `/home/sachitha/Documents/Development/colondev-community/pIvotX-expo`)
   - Consumes `@colon-dev/pivotx` / the `react-native` entry directly.
   - When core or `src/react-native` APIs change (props, hooks, exports, bridge behavior), update this sample so it keeps building and demonstrating current usage.

2. **Docs site** — `pivotx-docs` (local path: `/home/sachitha/Documents/Development/colondev-community/pivotx-docs`, repo: https://github.com/ColonDev-Community/pivotx-docs)
   - Public documentation for the library (deployed via Netlify).
   - When public API surface, props, hooks, or usage patterns change, update the relevant docs pages so they don't drift from the shipped version.

**Workflow when landing a breaking or user-facing change in this repo:**
- Update `CHANGELOG.md`, `README.md`, and bump `package.json` version here as appropriate.
- Check whether the change affects the Expo sample's usage (`App.tsx`, `Game.tsx`, `games/`, `gameConfig.ts`, `useGamePhysics.ts`) — update if needed, including its own `README.md` if usage instructions changed.
- Check whether `pivotx-docs` has pages describing the changed API — update if needed.
- Don't assume these are out of scope just because they're separate repos/directories — they are the two consumers that must not silently fall behind this library.
- **Never skip `README.md` updates** — it's the first thing users/npm/GitHub visitors see, so API changes, new features, or version bumps must be reflected there alongside `CHANGELOG.md`.
