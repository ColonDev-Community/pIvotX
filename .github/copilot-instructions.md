# pIvotX — Copilot Instructions

## Project overview

pIvotX (`@colon-dev/pivotx`) is a lightweight 2D canvas game library shipped as a single npm package with two entry points:

- **Core** (`pivotx`) — framework-agnostic classes that wrap the HTML Canvas 2D API: shapes (`Circle`, `Rectangle`, `Line`, `Label`, `GameImage`, `Sprite`, `Platform`), utilities (`Point`, `Canvas`, `AssetLoader`, `Camera`, `SpriteAnimator`, `TiledBackground`, `Tilemap`), and physics helpers (`aabbOverlap`, `aabbOverlapDepth`, `createAABB`).
- **React** (`pivotx/react`) — declarative JSX components (`PivotCanvas`, `PivotCircle`, `PivotImage`, `PivotSprite`, `PivotPlatform`, `PivotTilemap`, etc.) and the `useGameLoop` hook. React is an optional peer dependency.

## Architecture

```
src/core/                ← framework-agnostic, no React dependency
  types.ts               ← shared interfaces: IDrawable, IShape, IPoint, CSSColor, AABB
  Point.ts               ← factory function (not a class), returns plain {x, y}
  Canvas.ts              ← wraps HTMLCanvasElement; owns the game loop (rAF)
  shapes/                ← each shape implements IDrawable or IShape
    Circle.ts, Rectangle.ts, Line.ts, Label.ts  ← basic vector shapes
    GameImage.ts         ← static image (accepts HTMLImageElement or src string)
    Sprite.ts            ← spritesheet frame rendering + SpriteSheet interface
    TiledBackground.ts   ← scrollable/parallax repeating background
    Platform.ts          ← AABB platform with oneWay flag
  assets/
    AssetLoader.ts       ← static loadImage() and loadAssets() batch preloader
  animation/
    SpriteAnimator.ts    ← named clip playback controller for Sprite
  camera/
    Camera.ts            ← viewport transform: follow, zoom, clamp, begin/end
  tilemap/
    Tilemap.ts           ← grid-based tile map with collision queries
  physics/
    collision.ts         ← aabbOverlap, aabbOverlapDepth, createAABB
src/react/               ← thin React wrapper, imports core classes internally
  PivotCanvas.tsx        ← root component, provides CanvasRenderingContext2D via context
  components/shapes.tsx  ← each component instantiates a core shape in useEffect
  hooks/useGameLoop.ts   ← rAF loop hook using callback-ref pattern
```

**Key design rule:** React components are thin wrappers — all drawing logic lives in core classes. When adding a new drawable, create the core class first, then add a React wrapper.

## Adding a new shape

1. Create `src/core/shapes/MyShape.ts` implementing `IShape` (fill+stroke) or `IDrawable` (draw-only). Set a unique `readonly tag` string.
2. Export it from `src/core/index.ts`.
3. Add a `PivotMyShape` function component in `src/react/components/shapes.tsx` — use `useCanvasContext()` and draw via `useEffect` (no deps array, redraws every render).
4. Export the component and its props interface from `src/react/index.ts`.

## Adding animation or physics modules

- Animation classes go in `src/core/animation/`. They operate on core shapes (e.g. `SpriteAnimator` mutates a `Sprite`).
- Physics utilities go in `src/core/physics/`. Export pure functions, not classes.
- Both are exported from `src/core/index.ts`. React wrappers are only needed for drawable things.

## Conventions

- **`Point(x, y)` is a factory function**, not a class. Do not use `new Point(...)`.
- Shapes use **mutable public properties** (`fillColor`, `strokeColor`, `lineWidth`) set after construction, not constructor params.
- React shape props use **shortened names**: `fill` → `fillColor`, `stroke` → `strokeColor`, `center` → `centerPoint`, `start`/`end` → `startPoint`/`endPoint`.
- Colors are typed as `CSSColor` (alias for `string`).
- The `Canvas` class takes a **DOM element id** string, not a ref or element.
- **`GameImage` accepts both `HTMLImageElement` and `string`**. String triggers auto-loading; `draw()` skips until loaded.
- **`Sprite` uses `ctx.save()`/`ctx.restore()`** for flip/scale transforms. Other shapes avoid save/restore.
- **`Sprite`, `Tilemap` default `pixelPerfect = true`**; `GameImage` defaults to `false`. When `true`, `ctx.imageSmoothingEnabled` is disabled so scaled-up pixel art stays crisp.
- **`SpriteAnimator.update(dt)` must be called every frame** — it's not automatic.
- **`Camera.begin(ctx)`/`end(ctx)` wrap world drawing.** HUD is drawn after `end()`.
- **`Platform.bounds`** returns an `AABB` compatible with `aabbOverlap()`.
- **`Tilemap` uses `getTileAt()` + `solidTiles` Set + `isSolidAt()` for collision.**
- TypeScript is strict (`"strict": true`). Target ES2017 with DOM lib.

## Build & development

| Command | Purpose |
|---|---|
| `yarn build` | Rollup build → dist files (ESM/CJS/UMD + types for core and React) |
| `yarn dev` | Rollup watch mode |
| `yarn type-check` | `tsc --noEmit` — validates types without emitting |

Build is Rollup-based (`rollup.config.js`). The UMD bundle exposes `window.PivotX`. React bundles mark `react` and `react/jsx-runtime` as external.

## Game loop pattern

- **Core:** `canvas.startLoop((dt) => { ... })` — `dt` is seconds since last frame. Call `canvas.clear()` at the top of each frame.
- **React:** `useGameLoop((dt) => { ... })` — uses `useRef` for the callback to avoid stale closures. Mutable game state → `useRef`; trigger re-renders with `setTick(t => t + 1)`.

## Asset loading pattern

```ts
const assets = await AssetLoader.loadAssets({ hero: '/hero.png', tiles: '/tiles.png' });
const sheet = Sprite.createSheet(assets.hero, 32, 32);
```

## Sprite animation pattern

```ts
const anim = new SpriteAnimator(sprite);
anim.addClip('idle', { frames: [0,1,2,3], fps: 6, loop: true });
anim.play('idle');
// In loop: anim.update(dt); canvas.add(sprite);
```

## Camera pattern

```ts
const camera = new Camera(600, 400);
// In loop: camera.follow(player, 0.08); camera.begin(ctx); ...world... camera.end(ctx); ...HUD...
```

## Tilemap collision pattern

```ts
tilemap.solidTiles = new Set([0, 1, 2]);
if (tilemap.isSolidAt(player.x, player.y + 32)) { /* grounded */ }
const nearby = tilemap.getSolidTilesInRegion(playerAABB);
```

## Package exports

`package.json` `"exports"` defines `"."` (core) and `"./react"` (React layer). Both have `import`, `require`, and `types` conditions. Keep in sync when changing output filenames.
