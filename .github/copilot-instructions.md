# pIvotX — Copilot Instructions

## Project overview

pIvotX (`@colon-dev/pivotx`) is a lightweight 2D canvas game library shipped as a single npm package with three entry points:

- **Website:** <https://pivotx.colondev.com/>
- **Sample Games & Tutorials:** <https://pivotx.colondev.com/tutorials>
- **Core** (`pivotx`) — framework-agnostic classes that wrap the HTML Canvas 2D API: shapes (`Circle`, `Rectangle`, `Line`, `Label`, `GameImage`, `Sprite`, `Platform`), utilities (`Point`, `Canvas`, `AssetLoader`, `Camera`, `SpriteAnimator`, `TiledBackground`, `Tilemap`), and physics helpers (`aabbOverlap`, `aabbOverlapDepth`, `createAABB`, `stepBody`, `resolveCollisions`).
- **React** (`pivotx/react`) — declarative JSX components (`PivotCanvas`, `PivotCircle`, `PivotImage`, `PivotSprite`, `PivotPlatform`, `PivotTilemap`, etc.) and the `useGameLoop` hook. React is an optional peer dependency.
- **React Native** (`pivotx/react-native`) — WebView-based bridge for React Native / Expo apps. Same JSX component API (`PivotNativeCanvas`, `PivotCircle`, etc.) with draw commands serialized as JSON and executed inside a WebView running the pIvotX UMD bundle. On Expo Web, `PivotNativeCanvas` automatically falls back to a direct HTML `<canvas>` element (no WebView) via `Platform.OS === 'web'` detection. Requires `react-native-webview` as peer dependency (native only).

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
    body.ts              ← stepBody, resolveCollisions (sub-stepped integrator)
src/react/               ← thin React wrapper, imports core classes internally
  PivotCanvas.tsx        ← root component, provides CanvasRenderingContext2D via context
  components/shapes.tsx  ← each component instantiates a core shape in useEffect
  hooks/useGameLoop.ts   ← rAF loop hook using callback-ref pattern
src/react-native/        ← React Native / Expo bridge via WebView
  env.d.ts               ← type stubs for react-native-webview (dev build only)
  PivotNativeCanvas.tsx  ← root component: WebView on native, <canvas> on web (Platform.OS check)
  web/
    executeCommands.ts   ← direct CanvasRenderingContext2D command executor (web fallback)
  bridge/
    types.ts             ← DrawCommand union (12 types), BridgeEvent, component props
    renderer.ts          ← getBridgeRendererSource() — JS string that runs inside WebView
    html-template.ts     ← generateHTML() — full HTML page with canvas + UMD + bridge
  context/
    NativeDrawContext.ts ← React context for child components to register draw commands
  components/
    shapes.tsx           ← all 9 native shape components (PivotCircle, PivotSprite, etc.)
    NativeCamera.tsx     ← camera transform wrapper (begin/end commands around children)
  hooks/
    useNativeGameLoop.ts ← rAF loop hook (same pattern as web useGameLoop)
    useNativePostMessage.ts ← bidirectional RN ↔ WebView messaging helper
  index.ts               ← public API exports
```

**Key design rule:** React components are thin wrappers — all drawing logic lives in core classes. When adding a new drawable, create the core class first, then add a React wrapper.

## Adding a new shape

1. Create `src/core/shapes/MyShape.ts` implementing `IShape` (fill+stroke) or `IDrawable` (draw-only). Set a unique `readonly tag` string.
2. Export it from `src/core/index.ts`.
3. Add a `PivotMyShape` function component in `src/react/components/shapes.tsx` — use `useCanvasContext()` and draw via `useEffect` (no deps array, redraws every render).
4. Export the component and its props interface from `src/react/index.ts`.
5. Add a `DrawCommand` variant in `src/react-native/bridge/types.ts` and a command executor in `src/react-native/bridge/renderer.ts`.
6. Add a matching command executor function in `src/react-native/web/executeCommands.ts` (the web fallback — must handle the same command type).
7. Add a `PivotMyShape` component in `src/react-native/components/shapes.tsx` that registers the draw command via `useNativeDrawContext()`.
8. Export the component and its props from `src/react-native/index.ts`.

## Adding animation or physics modules

- Animation classes go in `src/core/animation/`. They operate on core shapes (e.g. `SpriteAnimator` mutates a `Sprite`).
- Physics utilities go in `src/core/physics/`. Export pure functions, not classes.
- Both are exported from `src/core/index.ts`. Physics utilities are also re-exported from `src/react/index.ts` and `src/react-native/index.ts` for convenience. React wrappers are only needed for drawable things.

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
| `yarn build` | Rollup build → dist files (ESM/CJS/UMD + types for core, React, and React Native) |
| `yarn dev` | Rollup watch mode |
| `yarn type-check` | `tsc --noEmit` — validates types without emitting |
| `yarn lint` | ESLint (flat config, TypeScript plugin) — checks `src/` |
| `yarn lint:fix` | ESLint auto-fix |

Build is Rollup-based (`rollup.config.js`). The UMD bundle exposes `window.PivotX`. React bundles mark `react` and `react/jsx-runtime` as external. React Native bundles additionally mark `react-native` and `react-native-webview` as external.

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

## Physics body pattern (sub-stepped)

```ts
const player: PhysicsBody = { x: 50, y: 200, vx: 0, vy: 0, width: 28, height: 32, grounded: false };
const platforms: StaticRect[] = [{ x: 0, y: 350, w: 600, h: 50 }];
// In loop: const hits = stepBody(player, platforms, dt, { gravity: 800 });
// hits[n].side === 'top' | 'bottom' | 'left' | 'right'
```

## Expo / React Native web compatibility

`PivotNativeCanvas` uses `Platform.OS === 'web'` to switch between two rendering paths:

- **Native (iOS / Android):** renders a `<WebView>` running the pIvotX UMD bundle + bridge renderer (`renderer.ts`). Draw commands are JSON-serialized and injected via `injectJavaScript`.
- **Web (Expo Web / react-native-web):** renders a plain `<canvas>` element directly. Draw commands are executed synchronously by `executeCommands()` in `src/react-native/web/executeCommands.ts`.

Both paths share the same `NativeDrawContext` so all child shape components (`PivotCircle`, `PivotSprite`, etc.) work identically on every platform without code changes.

### Rules for Expo compatibility

1. **Every `DrawCommand` type must be handled in both renderers.** When adding a command to `renderer.ts` (WebView bridge), add the matching executor in `web/executeCommands.ts`.
2. **Never import `react-native-webview` at the top of a file that runs on web.** The `WebView` component only works on native. Static imports are safe because Rollup marks it external and Metro/webpack resolve it per-platform, but be aware of the boundary.
3. **`Platform.OS` is the single branching point.** All platform-specific rendering logic lives inside `PivotNativeCanvas.tsx`. Shape components and hooks must remain platform-agnostic.
4. **Do not use Node.js APIs or native modules in `web/executeCommands.ts`.** It runs in a plain browser environment.
5. **Touch event handling must cover both touch and mouse.** The `WebCanvas` web path wires up both `touchstart/move/end` and `mousedown/move/up` so desktop browsers work.
6. **Test changes on both platforms.** After modifying any react-native code, verify it works on both native (Expo Go / dev build) and web (`npx expo start --web`).

## Package exports

`package.json` `"exports"` defines `"."` (core), `"./react"` (React layer), and `"./react-native"` (React Native layer). All have `import`, `require`, and `types` conditions. Keep in sync when changing output filenames.
