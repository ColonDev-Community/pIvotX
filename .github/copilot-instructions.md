# pIvotX — Copilot Instructions

## Project overview

pIvotX (`@colon-dev/pivotx`) is a lightweight 2D canvas game library shipped as a single npm package with two entry points:

- **Core** (`pivotx`) — framework-agnostic classes (`Canvas`, `Circle`, `Rectangle`, `Line`, `Label`, `Point`) that wrap the HTML Canvas 2D API.
- **React** (`pivotx/react`) — declarative JSX components (`PivotCanvas`, `PivotCircle`, etc.) and the `useGameLoop` hook. React is an optional peer dependency.

## Architecture

```
src/core/          ← framework-agnostic, no React dependency
  types.ts         ← shared interfaces: IDrawable, IShape, IPoint, CSSColor
  Point.ts         ← factory function (not a class), returns plain {x, y}
  Canvas.ts        ← wraps HTMLCanvasElement; owns the game loop (rAF)
  shapes/          ← each shape implements IDrawable or IShape
src/react/         ← thin React wrapper, imports core classes internally
  PivotCanvas.tsx  ← root component, provides CanvasRenderingContext2D via React context
  components/shapes.tsx ← each component instantiates a core shape and calls .draw() inside useEffect
  hooks/useGameLoop.ts  ← rAF loop hook using callback-ref pattern to avoid stale closures
```

**Key design rule:** React components are thin wrappers — all drawing logic lives in core shape classes. When adding a new shape, create the core class first in `src/core/shapes/`, then add a React wrapper in `src/react/components/shapes.tsx`.

## Adding a new shape

1. Create `src/core/shapes/MyShape.ts` implementing `IShape` (for fill+stroke) or `IDrawable` (for draw-only). Set a unique `readonly tag` string.
2. Export it from `src/core/index.ts`.
3. Add a `PivotMyShape` function component in `src/react/components/shapes.tsx` — use `useCanvasContext()` and draw via `useEffect` (no deps array, redraws every render).
4. Export the component and its props interface from `src/react/index.ts`.

## Conventions

- **`Point(x, y)` is a factory function**, not a class — it returns a plain `{ x, y }` object (`IPoint`). Do not use `new Point(...)`.
- Shapes use **mutable public properties** (`fillColor`, `strokeColor`, `lineWidth`) set after construction, not constructor params.
- React shape props use **shortened names**: `fill` (not `fillColor`), `stroke` (not `strokeColor`), `center` (not `centerPoint`), `start`/`end` (not `startPoint`/`endPoint`).
- Colors are typed as `CSSColor` (alias for `string`). Use any valid CSS color value.
- The `Canvas` class takes a **DOM element id** string, not a ref or element.
- TypeScript is strict (`"strict": true`). The target is ES2017 with DOM lib.

## Build & development

| Command | Purpose |
|---|---|
| `yarn build` | Rollup build → 8 dist files (ESM/CJS/UMD + types for core and React) |
| `yarn dev` | Rollup watch mode |
| `yarn type-check` | `tsc --noEmit` — validates types without emitting |

Build is Rollup-based (`rollup.config.js`). The UMD bundle exposes `window.PivotX`. React bundles mark `react` and `react/jsx-runtime` as external.

## Game loop pattern

- **Core:** `canvas.startLoop((dt) => { ... })` — `dt` is seconds since last frame. Call `canvas.clear()` at the top of each frame.
- **React:** `useGameLoop((dt) => { ... })` — uses `useRef` for the callback to avoid stale closures. Mutable game state should live in `useRef`; trigger re-renders with a `useState` counter (`setTick(t => t + 1)`).

## Package exports

The `package.json` `"exports"` field defines two subpaths — `"."` for core and `"./react"` for the React layer. Both have `import`, `require`, and `types` conditions. Keep these in sync when changing output filenames.
