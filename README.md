# pIvotX

Lightweight 2D game development library. One package, four ways to use it.

[🌐 Website](https://pivotx.colondev.com/) · [🎮 Sample Games & Tutorials](https://pivotx.colondev.com/tutorials) · [📖 Guide](./GUIDE.md) · [📦 npm](https://www.npmjs.com/package/@colon-dev/pivotx) · [🐙 GitHub](https://github.com/ColonDev-Community/pIvotX)

| Target | Import style | Build required? |
|---|---|---|
| Vanilla JS | `<script src="cdn">` → `window.PivotX` | No |
| TypeScript | `import { Canvas } from '@colon-dev/pivotx'` | Yes (your project) |
| React | `import { PivotCanvas } from '@colon-dev/pivotx/react'` | Yes (your project) |
| React Native / Expo | `import { PivotNativeCanvas } from '@colon-dev/pivotx/react-native'` | Yes (Expo / RN) — iOS, Android & Web |

---

## Install

```bash
npm install @colon-dev/pivotx
```

Or via CDN (no npm, no build step):

```html
<!-- Minified — for production -->
<script src="https://cdn.jsdelivr.net/npm/@colon-dev/pivotx/dist/pivotx.umd.min.js"></script>

<!-- Unminified — for development -->
<script src="https://cdn.jsdelivr.net/npm/@colon-dev/pivotx/dist/pivotx.umd.js"></script>
```

---

## Usage

### Vanilla JS (CDN)

Drop one `<script>` tag in and everything is on `window.PivotX`.

```html
<canvas id="game" width="600" height="400"></canvas>
<script src="https://cdn.jsdelivr.net/npm/@colon-dev/pivotx/dist/pivotx.umd.min.js"></script>
<script>
  var { Canvas, Circle, Rectangle, Line, Label, Point } = PivotX;

  var canvas = new Canvas("game");
  var W = canvas.getWidth();
  var H = canvas.getHeight();

  var ball = { x: W/2, y: H/2, r: 24, vx: 200, vy: 150 };

  canvas.startLoop(function(dt) {
    canvas.clear();

    var bg = new Rectangle(Point(0,0), W, H);
    bg.fillColor = "#1a1a2e";
    canvas.add(bg);

    ball.x += ball.vx * dt;   // dt = seconds since last frame
    ball.y += ball.vy * dt;
    if (ball.x < ball.r || ball.x > W - ball.r) ball.vx *= -1;
    if (ball.y < ball.r || ball.y > H - ball.r) ball.vy *= -1;

    var circle = new Circle(Point(ball.x, ball.y), ball.r);
    circle.fillColor   = "#e94560";
    circle.strokeColor = "white";
    circle.lineWidth   = 2;
    canvas.add(circle);
  });
</script>
```

---

### TypeScript (ESM)

```ts
import { Canvas, Circle, Rectangle, Line, Label, Point } from '@colon-dev/pivotx';
import type { IPoint } from '@colon-dev/pivotx';

const canvas = new Canvas('game');
const W      = canvas.getWidth();
const H      = canvas.getHeight();

interface Ball { pos: IPoint; vel: IPoint; radius: number; }

const ball: Ball = {
  pos:    Point(W / 2, H / 2),
  vel:    Point(220, 160),
  radius: 24,
};

canvas.startLoop((dt: number) => {
  canvas.clear();

  ball.pos.x += ball.vel.x * dt;
  ball.pos.y += ball.vel.y * dt;
  if (ball.pos.x < ball.radius || ball.pos.x > W - ball.radius) ball.vel.x *= -1;
  if (ball.pos.y < ball.radius || ball.pos.y > H - ball.radius) ball.vel.y *= -1;

  const shape       = new Circle(ball.pos, ball.radius);
  shape.fillColor   = '#e94560';
  shape.strokeColor = 'white';
  canvas.add(shape);
});
```

TypeScript will catch wrong types at compile time:
```ts
circle.radius = "big";    // ❌ Error: Type 'string' is not assignable to type 'number'
new Canvas(42);           // ❌ Error: Argument of type 'number' is not assignable to 'string'
```

---

### React — JSX components

```tsx
import { PivotCanvas, PivotCircle, PivotRectangle, PivotLabel } from '@colon-dev/pivotx/react';

function MyScene() {
  return (
    <PivotCanvas width={600} height={400} background="#1a1a2e">
      <PivotCircle
        center={{ x: 300, y: 200 }}
        radius={60}
        fill="#e94560"
        stroke="white"
        lineWidth={3}
      />
      <PivotLabel
        text="Hello pIvotX"
        position={{ x: 300, y: 360 }}
        font="20px Arial"
        fill="white"
      />
    </PivotCanvas>
  );
}
```

### React — Animated with `useGameLoop`

```tsx
import { useState, useRef }          from 'react';
import { PivotCanvas, PivotCircle, useGameLoop } from '@colon-dev/pivotx/react';

function BouncingBall() {
  // useRef for mutable game state — doesn't cause extra re-renders
  const ball = useRef({ x: 300, y: 200, vx: 200, vy: 150 });
  // useState(0) is just a frame counter — triggers the re-render each frame
  const [, tick] = useState(0);

  useGameLoop((dt) => {
    const b = ball.current;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x < 24 || b.x > 576) b.vx *= -1;
    if (b.y < 24 || b.y > 376) b.vy *= -1;
    tick(n => n + 1);  // trigger re-render so shape props update
  });

  return (
    <PivotCanvas width={600} height={400} background="#1a1a2e">
      <PivotCircle
        center={{ x: ball.current.x, y: ball.current.y }}
        radius={24}
        fill="#e94560"
      />
    </PivotCanvas>
  );
}
```

---

### React Native / Expo

Run pIvotX games inside React Native or Expo apps. Works on **iOS, Android, and Expo Web** — same code, every platform.

- **Native (iOS / Android):** renders a `<WebView>` running the pIvotX UMD bundle + bridge renderer. Draw commands are JSON-serialized and injected via `injectJavaScript`.
- **Web (Expo Web / react-native-web):** renders a plain `<canvas>` element directly — no WebView needed. Draw commands are executed synchronously via `executeCommands()`. Detected automatically via `Platform.OS === 'web'`.

```bash
npm install @colon-dev/pivotx react-native-webview
npx expo install react-native-webview   # Expo managed workflow
```

> `react-native-webview` is only needed on native (iOS/Android). On Expo Web it's not used. pIvotX marks it as an optional peer dependency.

**JSX mode** — declarative components:

```tsx
import { useState } from 'react';
import {
  PivotNativeCanvas, PivotCircle, PivotLabel, useNativeGameLoop,
} from '@colon-dev/pivotx/react-native';

export default function GameScreen() {
  const [x, setX] = useState(200);

  useNativeGameLoop((dt) => {
    setX(prev => (prev + 100 * dt) % 400);
  });

  return (
    <PivotNativeCanvas width={400} height={300} background="#1a1a2e">
      <PivotCircle center={{ x, y: 150 }} radius={24} fill="#e94560" />
      <PivotLabel text="Hello Expo!" position={{ x: 200, y: 30 }} fill="white" />
    </PivotNativeCanvas>
  );
}
```

**JSX mode with camera and touch input:**

```tsx
import { useState, useRef, useCallback } from 'react';
import {
  PivotNativeCanvas, PivotNativeCamera, PivotCircle, PivotRectangle,
  PivotPlatform, PivotLabel, useNativeGameLoop,
} from '@colon-dev/pivotx/react-native';

export default function PlatformerScreen() {
  const player = useRef({ x: 100, y: 200, vy: 0 });
  const camera = useRef({ x: 0, y: 0 });
  const [, tick] = useState(0);

  useNativeGameLoop((dt) => {
    const p = player.current;
    p.vy += 800 * dt;         // gravity
    p.y  += p.vy * dt;
    if (p.y > 250) { p.y = 250; p.vy = 0; }  // simple floor
    camera.current = { x: p.x - 200, y: 0 };
    tick(n => n + 1);
  });

  const handleTouch = useCallback((action: string, touches: Array<{x: number; y: number}>) => {
    if (action === 'start') {
      player.current.vy = -400;  // jump on tap
    }
  }, []);

  const p = player.current;
  return (
    <PivotNativeCanvas width={400} height={300} background="#1a1a2e" onTouch={handleTouch}>
      <PivotNativeCamera position={camera.current}>
        <PivotPlatform position={{ x: 0, y: 280 }} width={800} height={20} fill="#4a7c59" />
        <PivotRectangle position={{ x: p.x, y: p.y }} width={24} height={24} fill="#e94560" />
      </PivotNativeCamera>
      <PivotLabel text="Tap to jump" position={{ x: 200, y: 15 }} fill="white" />
    </PivotNativeCanvas>
  );
}
```

**Script mode** — full 60fps game loop running inside the WebView:

```tsx
import { PivotNativeCanvas } from '@colon-dev/pivotx/react-native';

export default function GameScreen() {
  return (
    <PivotNativeCanvas
      width={400}
      height={300}
      script={`
        var { Canvas, Circle, Point } = PivotX;
        var canvas = new Canvas("game");
        var ball = { x: 200, y: 150, vx: 160, vy: 120, r: 20 };
        canvas.startLoop(function(dt) {
          canvas.clear();
          ball.x += ball.vx * dt;
          ball.y += ball.vy * dt;
          if (ball.x < ball.r || ball.x > 400 - ball.r) ball.vx *= -1;
          if (ball.y < ball.r || ball.y > 300 - ball.r) ball.vy *= -1;
          var c = new Circle(Point(ball.x, ball.y), ball.r);
          c.fillColor = "#e94560";
          canvas.add(c);
        });
      `}
    />
  );
}
```

On native, the WebView loads the pIvotX UMD bundle and runs the bridge renderer internally. On Expo Web, `PivotNativeCanvas` detects `Platform.OS === 'web'` and renders a direct `<canvas>` element instead — no WebView involved. All touch events are forwarded back to React Native. On web, both touch and mouse events are handled so desktop browsers work too.

---

## API Reference

### `Point(x, y)`

Creates a plain `{ x, y }` coordinate object. Used everywhere positions are needed.

```js
const p = Point(100, 200);
```

---

### `Canvas`

Wraps a `<canvas>` DOM element.

```js
const canvas = new Canvas("myCanvasId");
```

| Method | Returns | Description |
|---|---|---|
| `getWidth()` | `number` | Canvas width in pixels |
| `getHeight()` | `number` | Canvas height in pixels |
| `getCenter()` | `IPoint` | Centre point of the canvas |
| `clear()` | `void` | Erase everything — call at start of each frame |
| `add(shape)` | `void` | Draw any `IDrawable` immediately |
| `startLoop(fn)` | `void` | Start rAF loop, `fn(dt)` called each frame |
| `stopLoop()` | `void` | Stop the running loop |
| `ctx` | `CanvasRenderingContext2D` | Raw 2D context for advanced use |

---

### `Circle`

```js
const c = new Circle(Point(x, y), radius);
```

| Property | Type | Description |
|---|---|---|
| `centerPoint` | `IPoint` | Centre position |
| `radius` | `number` | Radius in pixels |
| `fillColor` | `string \| null` | CSS fill colour |
| `strokeColor` | `string \| null` | CSS outline colour |
| `lineWidth` | `number` | Outline thickness |

---

### `Rectangle`

```js
const r = new Rectangle(Point(x, y), width, height);
```

`Point(x, y)` is the **top-left corner**.

| Property | Type | Description |
|---|---|---|
| `position` | `IPoint` | Top-left corner |
| `width` | `number` | Width in pixels |
| `height` | `number` | Height in pixels |
| `fillColor` | `string \| null` | CSS fill colour |
| `strokeColor` | `string \| null` | CSS outline colour |
| `lineWidth` | `number` | Outline thickness |

---

### `Line`

```js
const l = new Line(Point(x1, y1), Point(x2, y2));
```

| Property | Type | Description |
|---|---|---|
| `startPoint` | `IPoint` | Start coordinate |
| `endPoint` | `IPoint` | End coordinate |
| `strokeColor` | `string` | Line colour |
| `lineWidth` | `number` | Line thickness |

---

### `Label`

```js
const l = new Label("text", Point(x, y), "20px Arial");
```

`font` is optional, defaults to `"16px Arial"`.

| Property | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | — | Text to display |
| `position` | `IPoint` | — | Anchor point |
| `font` | `string` | `"16px Arial"` | CSS font string |
| `fillColor` | `string` | `"#000"` | Text colour |
| `textAlign` | `"left" \| "center" \| "right"` | `"center"` | Horizontal anchor |
| `textBaseline` | `"top" \| "middle" \| "bottom"` | `"middle"` | Vertical anchor |

---

### `AssetLoader`

Static utility for preloading image assets before the game loop starts.

```ts
import { AssetLoader } from '@colon-dev/pivotx';
```

| Method | Returns | Description |
|---|---|---|
| `AssetLoader.loadImage(src)` | `Promise<HTMLImageElement>` | Load a single image from a URL |
| `AssetLoader.loadAssets(manifest)` | `Promise<Record<K, HTMLImageElement>>` | Load multiple images in parallel |

```ts
// Single image
const heroImg = await AssetLoader.loadImage('/hero.png');

// Batch — keys become properties on the result
const assets = await AssetLoader.loadAssets({
  hero:       '/sprites/hero.png',
  background: '/bg/sky.png',
  tileset:    '/tiles/ground.png',
});
// assets.hero, assets.background, assets.tileset — all HTMLImageElement
```

---

### `GameImage`

Draws a static image on the canvas. Accepts a pre-loaded `HTMLImageElement` **or** a URL string (auto-loads in background; `draw()` skips until ready).

```ts
import { GameImage, AssetLoader, Point } from '@colon-dev/pivotx';

// Recommended: pre-load first
const img  = await AssetLoader.loadImage('/hero.png');
const hero = new GameImage(Point(100, 50), img);
hero.width  = 64;
hero.height = 64;
canvas.add(hero);

// Auto-load shorthand (draws once loaded)
const bg = new GameImage(Point(0, 0), '/background.png');
canvas.add(bg);
```

| Property | Type | Default | Description |
|---|---|---|---|
| `position` | `IPoint` | — | Top-left draw position |
| `width` | `number \| null` | `null` | Display width (`null` = natural) |
| `height` | `number \| null` | `null` | Display height (`null` = natural) |
| `opacity` | `number` | `1` | 0 (transparent) to 1 (opaque) |
| `rotation` | `number` | `0` | Rotation in radians (around centre) |
| `pixelPerfect` | `boolean` | `false` | Disable image smoothing for crisp pixel art |

| Method / Getter | Returns | Description |
|---|---|---|
| `loaded` | `boolean` | `true` once the image is ready to draw |
| `imageElement` | `HTMLImageElement` | The underlying image element |
| `setSrc(url)` | `void` | Change the source at runtime |

---

### `Sprite` & `SpriteSheet`

Renders a single frame from a grid-based spritesheet.

```ts
import { Sprite, AssetLoader, Point } from '@colon-dev/pivotx';
import type { SpriteSheet } from '@colon-dev/pivotx';

const img   = await AssetLoader.loadImage('/hero-sheet.png');
const sheet = Sprite.createSheet(img, 32, 32);   // 32×32 frame size
const hero  = new Sprite(Point(100, 200), sheet);
hero.frame  = 0;    // which frame to show
hero.scale  = 2;    // 2× size
hero.flipX  = true; // mirror horizontally
canvas.add(hero);
```

#### `SpriteSheet` interface

| Property | Type | Description |
|---|---|---|
| `image` | `HTMLImageElement` | The spritesheet image |
| `frameWidth` | `number` | Width of one frame |
| `frameHeight` | `number` | Height of one frame |
| `columns` | `number` | Frames per row |
| `totalFrames` | `number` | Total usable frames |

#### `Sprite` class

| Property | Type | Default | Description |
|---|---|---|---|
| `position` | `IPoint` | — | Top-left draw position |
| `frame` | `number` | `0` | Current frame index (wraps) |
| `scale` | `number` | `1` | Scale multiplier |
| `flipX` | `boolean` | `false` | Mirror horizontally |
| `flipY` | `boolean` | `false` | Mirror vertically |
| `opacity` | `number` | `1` | 0–1 opacity |
| `pixelPerfect` | `boolean` | `true` | Disable image smoothing for crisp pixel art |

| Method / Getter | Returns | Description |
|---|---|---|
| `Sprite.createSheet(img, fw, fh, total?)` | `SpriteSheet` | Build a sheet from a loaded image |
| `drawWidth` | `number` | `frameWidth × scale` |
| `drawHeight` | `number` | `frameHeight × scale` |
| `sheet` | `SpriteSheet` | The sprite's SpriteSheet |

---

### `SpriteAnimator` & `AnimationClip`

Named animation clip controller for a `Sprite`. Register clips, play them, and call `update(dt)` every frame.

```ts
import { SpriteAnimator } from '@colon-dev/pivotx';
import type { AnimationClip } from '@colon-dev/pivotx';

const animator = new SpriteAnimator(heroSprite);
animator
  .addClip('idle', { frames: [0, 1, 2, 3],    fps: 6,  loop: true })
  .addClip('run',  { frames: [4, 5, 6, 7, 8], fps: 10, loop: true })
  .addClip('jump', { frames: [9, 10],          fps: 4,  loop: false });

animator.play('idle');

// In game loop:
canvas.startLoop((dt) => {
  canvas.clear();
  animator.update(dt);     // advance the frame
  canvas.add(heroSprite);  // draw current frame
});
```

#### `AnimationClip` interface

| Property | Type | Description |
|---|---|---|
| `frames` | `number[]` | Ordered frame indices from the SpriteSheet |
| `fps` | `number` | Playback speed (frames per second) |
| `loop` | `boolean` | Loop or stop on last frame |

#### `SpriteAnimator` class

| Method | Returns | Description |
|---|---|---|
| `addClip(name, clip)` | `this` | Register a clip (chainable) |
| `removeClip(name)` | `this` | Remove a clip (chainable) |
| `hasClip(name)` | `boolean` | Check if a clip exists |
| `play(name)` | `void` | Switch to a clip (resets only if different) |
| `stop()` | `void` | Pause playback on current frame |
| `update(dt)` | `void` | Advance timer — call once per frame |

| Getter | Type | Description |
|---|---|---|
| `currentClip` | `string` | Name of the active clip |
| `isPlaying` | `boolean` | Currently playing |
| `isFinished` | `boolean` | Non-looping clip reached last frame |
| `currentIndex` | `number` | Index within the clip's frames array |

---

### `Camera`

2D viewport that translates and scales the canvas context. Draw world objects between `begin()` and `end()`. Anything drawn after `end()` (HUD, score) stays fixed on screen.

```ts
import { Camera } from '@colon-dev/pivotx';

const camera = new Camera(600, 400); // viewport size

canvas.startLoop((dt) => {
  canvas.clear();

  camera.follow(player.position, 0.08); // smooth follow
  camera.clamp(worldWidth, worldHeight); // don't scroll past edges
  camera.begin(canvas.ctx);

  // World objects — scroll with camera
  canvas.add(tilemap);
  canvas.add(playerSprite);

  camera.end(canvas.ctx);

  // HUD — fixed on screen
  canvas.add(scoreLabel);
});
```

| Property | Type | Default | Description |
|---|---|---|---|
| `position` | `IPoint` | `{x:0, y:0}` | Top-left of viewport in world coords |
| `zoom` | `number` | `1` | Zoom level (2 = 2× zoom in) |
| `viewportWidth` | `number` | — | Viewport width |
| `viewportHeight` | `number` | — | Viewport height |

| Method | Returns | Description |
|---|---|---|
| `follow(target, lerp?)` | `void` | Centre on target. `lerp` 0.05–0.15 = smooth, 1 = instant |
| `clamp(worldW, worldH)` | `void` | Prevent scrolling past world edges |
| `begin(ctx)` | `void` | Apply camera transform (call before world drawing) |
| `end(ctx)` | `void` | Restore screen space (call after world drawing) |
| `worldToScreen(p)` | `IPoint` | Convert world position to screen coordinates |
| `screenToWorld(p)` | `IPoint` | Convert screen position to world coordinates |

---

### `TiledBackground`

Draws a repeating, scrollable background image with parallax support. Stack multiple instances for multi-layer parallax.

```ts
import { TiledBackground, AssetLoader } from '@colon-dev/pivotx';

const skyImg = await AssetLoader.loadImage('/bg/sky.png');
const sky    = new TiledBackground(skyImg, 600, 400);
sky.parallaxFactor = 0.3; // distant — scrolls slowly

canvas.startLoop((dt) => {
  canvas.clear();
  sky.scroll(100 * dt);   // scroll speed (parallax applied automatically)
  canvas.add(sky);
});
```

| Property | Type | Default | Description |
|---|---|---|---|
| `scrollX` | `number` | `0` | Horizontal offset |
| `scrollY` | `number` | `0` | Vertical offset |
| `opacity` | `number` | `1` | 0–1 opacity |
| `parallaxFactor` | `number` | `1` | 1 = full speed, 0.3 = slow (distant) |

| Method | Returns | Description |
|---|---|---|
| `scroll(dx, dy?)` | `void` | Advance scroll offset (parallax applied) |
| `setViewport(w, h)` | `void` | Update viewport size on resize |

---

### `Platform`

A rectangular shape with AABB collision support and a `oneWay` flag for jump-through platforms.

```ts
import { Platform, Point, aabbOverlap } from '@colon-dev/pivotx';

const ground = new Platform(Point(0, 350), 600, 50);
ground.fillColor = '#4a7c59';
canvas.add(ground);

const ledge = new Platform(Point(200, 260), 120, 16);
ledge.oneWay = true; // jump-through from below

if (aabbOverlap(playerBounds, ground.bounds)) {
  // collision!
}
```

| Property | Type | Default | Description |
|---|---|---|---|
| `position` | `IPoint` | — | Top-left corner |
| `width` | `number` | — | Width in pixels |
| `height` | `number` | — | Height in pixels |
| `fillColor` | `CSSColor \| null` | `'#555'` | Fill colour |
| `strokeColor` | `CSSColor \| null` | `null` | Outline colour |
| `lineWidth` | `number` | `0` | Outline thickness |
| `oneWay` | `boolean` | `false` | Jump-through from below |

| Getter | Type | Description |
|---|---|---|
| `bounds` | `AABB` | AABB for collision functions |

---

### `Tilemap`

Grid-based tile map. Renders tiles from a `SpriteSheet` and provides collision queries.

```ts
import { Tilemap, Sprite, AssetLoader, Point } from '@colon-dev/pivotx';

const tileImg  = await AssetLoader.loadImage('/tiles/ground.png');
const sheet    = Sprite.createSheet(tileImg, 16, 16);

const mapData = [
  [-1, -1, -1, -1, -1],   // -1 = empty/air
  [-1, -1, -1, -1, -1],
  [ 0,  1,  1,  1,  2],   // frame indices from sheet
  [ 3,  4,  4,  4,  5],
];

const tilemap = new Tilemap(sheet, mapData, 32); // 32px rendered tile size
tilemap.solidTiles = new Set([0, 1, 2, 3, 4, 5]);

// Collision check
if (tilemap.isSolidAt(player.x, player.y + 32)) {
  // standing on solid ground
}

// Region query for nearby solid tiles
const nearby = tilemap.getSolidTilesInRegion(playerAABB);
```

| Property | Type | Default | Description |
|---|---|---|---|
| `solidTiles` | `Set<number>` | `new Set()` | Frame indices considered solid |
| `pixelPerfect` | `boolean` | `true` | Disable image smoothing for crisp pixel art |

| Method | Returns | Description |
|---|---|---|
| `getTileAt(worldX, worldY)` | `number` | Frame index at world position (-1 if empty/OOB) |
| `isSolidAt(worldX, worldY)` | `boolean` | True if tile at position is in `solidTiles` |
| `setTile(col, row, frame)` | `void` | Change a tile at runtime (breakable blocks, pickups) |
| `getTileBounds(col, row)` | `AABB` | AABB for a specific tile cell |
| `getSolidTilesInRegion(region)` | `AABB[]` | All solid tile AABBs overlapping a region |

| Getter | Type | Description |
|---|---|---|
| `rows` | `number` | Number of rows |
| `cols` | `number` | Number of columns |
| `tileSize` | `number` | Rendered tile size |
| `widthInPixels` | `number` | Total map width |
| `heightInPixels` | `number` | Total map height |
| `mapData` | `number[][]` | Underlying map data |

---

### Collision Functions

AABB collision detection utilities. Works with `Platform.bounds`, `Tilemap.getTileBounds()`, or any `AABB` object.

```ts
import { aabbOverlap, aabbOverlapDepth, createAABB } from '@colon-dev/pivotx';
import type { AABB } from '@colon-dev/pivotx';
```

#### `AABB` interface

```ts
interface AABB {
  left:   number;
  right:  number;
  top:    number;
  bottom: number;
}
```

#### `createAABB(x, y, width, height)`

Convenience helper to build an AABB from position + dimensions.

```ts
const playerBox = createAABB(player.x, player.y, 32, 32);
```

#### `aabbOverlap(a, b)`

Returns `true` if two AABBs overlap.

```ts
if (aabbOverlap(playerBox, platform.bounds)) {
  // collision!
}
```

#### `aabbOverlapDepth(a, b)`

Returns `{ x, y }` overlap depth (always positive), or `null` if no overlap. Use the smaller axis for minimum translation.

```ts
const depth = aabbOverlapDepth(playerBox, platform.bounds);
if (depth) {
  if (depth.y < depth.x) {
    player.y -= depth.y; // resolve vertically
    player.vy = 0;
  } else {
    player.x -= depth.x; // resolve horizontally
  }
}
```

---

### Physics Body Helpers

Sub-stepped physics integrator and collision resolver. Prevents tunneling through thin platforms by breaking movement into smaller steps. Available from all three entry points: `pivotx`, `pivotx/react`, and `pivotx/react-native`.

```ts
import { stepBody, resolveCollisions } from '@colon-dev/pivotx';
import type { PhysicsBody, StaticRect, StepOptions, CollisionResult } from '@colon-dev/pivotx';
```

#### `PhysicsBody` interface

```ts
interface PhysicsBody {
  x: number;  y: number;
  vx: number; vy: number;
  width: number; height: number;
  grounded: boolean;
}
```

#### `StaticRect` interface

```ts
interface StaticRect {
  x: number; y: number;
  w: number; h: number;
}
```

#### `StepOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `gravity` | `number` | `0` | Gravity in pixels/sec² (applied to `vy`) |
| `maxStep` | `number` | `8` | Max movement per sub-step (smaller = more accurate) |
| `friction` | `number` | `1` | Friction multiplier applied to `vx` each frame (0–1) |

#### `stepBody(body, platforms, dt, options?)`

Advance a physics body by `dt` seconds. Applies gravity, friction, and resolves all collisions via sub-stepping. Modifies `body` in place. Returns `CollisionResult[]` describing which platforms and sides were hit.

```ts
const player: PhysicsBody = { x: 50, y: 100, vx: 0, vy: 0, width: 32, height: 32, grounded: false };
const platforms: StaticRect[] = [{ x: 0, y: 350, w: 600, h: 50 }];

canvas.startLoop((dt) => {
  canvas.clear();
  player.vx = 0;
  if (keys['ArrowRight']) player.vx = 200;
  if (keys['ArrowLeft'])  player.vx = -200;
  if (keys[' '] && player.grounded) player.vy = -400;

  const hits = stepBody(player, platforms, dt, { gravity: 800, friction: 0.9 });

  // React to specific collisions
  for (const hit of hits) {
    if (hit.side === 'top') console.log('Landed on platform');
  }
});
```

#### `resolveCollisions(body, platforms)`

Resolve collisions for a single position (no sub-stepping). Called internally by `stepBody`, but can be used directly for custom integration.

#### `CollisionResult`

```ts
interface CollisionResult {
  side: 'top' | 'bottom' | 'left' | 'right';
  platform: StaticRect;
}
```

---

### React Components

#### `<PivotCanvas>`
The root component. All shape components must be inside it.

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `number` | `600` | Width in pixels |
| `height` | `number` | `400` | Height in pixels |
| `background` | `string` | transparent | CSS background |
| `ref` | `PivotCanvasHandle` | — | Access `.ctx`, `.element`, `.clear()` |

#### `<PivotCircle>`, `<PivotRectangle>`, `<PivotLine>`, `<PivotLabel>`

All accept the same props as their class equivalents, using React naming:
`fill` → `fillColor`, `stroke` → `strokeColor`, `center` → `centerPoint`, `start`/`end` → `startPoint`/`endPoint`.

#### `<PivotImage>`

Draws an image on the canvas.

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string \| HTMLImageElement` | — | URL or pre-loaded image |
| `position` | `IPoint` | — | Top-left draw position |
| `width` | `number` | natural | Display width |
| `height` | `number` | natural | Display height |
| `opacity` | `number` | `1` | 0–1 opacity |
| `rotation` | `number` | `0` | Rotation in radians |
| `pixelPerfect` | `boolean` | `false` | Disable image smoothing for crisp pixel art |

```tsx
<PivotImage src="/hero.png" position={{ x: 100, y: 50 }} width={64} height={64} />
```

#### `<PivotSprite>`

Draws a single sprite frame.

| Prop | Type | Default | Description |
|---|---|---|---|
| `position` | `IPoint` | — | Top-left position |
| `sheet` | `SpriteSheet` | — | SpriteSheet to draw from |
| `frame` | `number` | — | Frame index |
| `scale` | `number` | `1` | Scale multiplier |
| `flipX` | `boolean` | `false` | Mirror horizontally |
| `flipY` | `boolean` | `false` | Mirror vertically |
| `opacity` | `number` | `1` | 0–1 opacity |
| `pixelPerfect` | `boolean` | `true` | Disable image smoothing for crisp pixel art |

```tsx
<PivotSprite position={{ x: 100, y: 200 }} sheet={heroSheet} frame={currentFrame} scale={2} />
```

#### `<PivotPlatform>`

Draws a rectangular platform.

| Prop | Type | Default | Description |
|---|---|---|---|
| `position` | `IPoint` | — | Top-left corner |
| `width` | `number` | — | Width |
| `height` | `number` | — | Height |
| `fill` | `CSSColor` | `'#555'` | Fill colour |
| `stroke` | `CSSColor` | `null` | Stroke colour |
| `lineWidth` | `number` | `0` | Stroke thickness |
| `oneWay` | `boolean` | `false` | Jump-through |

```tsx
<PivotPlatform position={{ x: 0, y: 350 }} width={600} height={50} fill="#4a7c59" />
```

#### `<PivotTilemap>`

Draws a grid-based tile map.

| Prop | Type | Default | Description |
|---|---|---|---|
| `sheet` | `SpriteSheet` | — | Tile SpriteSheet |
| `mapData` | `number[][]` | — | 2D map data (-1 = empty) |
| `tileSize` | `number` | — | Rendered tile size |
| `solidTiles` | `Set<number>` | `new Set()` | Solid tile indices |
| `pixelPerfect` | `boolean` | `true` | Disable image smoothing for crisp pixel art |

```tsx
<PivotTilemap sheet={tileSheet} mapData={levelData} tileSize={32} />
```

#### `useGameLoop(callback)`

Starts an rAF loop for the lifetime of the component. Stops automatically on unmount.

```tsx
useGameLoop((dt: number) => {
  // dt = seconds since last frame
  // update state here, then trigger re-render
});
```

---

### React Native / Expo Components

Import from `@colon-dev/pivotx/react-native`. Requires `react-native-webview` as a peer dependency (native only — not used on Expo Web).

**Platform support:** Components work identically on iOS, Android, and Expo Web. `PivotNativeCanvas` automatically detects the platform via `Platform.OS` and switches between WebView rendering (native) and direct `<canvas>` rendering (web).

#### `<PivotNativeCanvas>`

Root component. Renders a WebView (native) or a direct HTML5 Canvas (Expo Web) with the full pIvotX engine.

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `number` | `400` | Canvas width |
| `height` | `number` | `300` | Canvas height |
| `background` | `string` | `'#000'` | CSS background colour |
| `script` | `string` | — | Game code string (script mode) |
| `onGameEvent` | `(name, data?) => void` | — | Receive events from WebView game |
| `onTouch` | `(action, touches) => void` | — | Touch events from the canvas |
| `style` | `object` | — | React Native view style |
| `children` | `ReactNode` | — | PivotNative* shape components (JSX mode) |
| `ref` | `PivotNativeCanvasHandle` | — | `.postMessage()`, `.injectScript()` |

#### Native Shape Components

All accept the same props as web React components, with one key difference:
**Image-based components use `src: string` (URL)** instead of `HTMLImageElement` or `SpriteSheet`, because `HTMLImageElement` doesn't exist in React Native.

| Component | Key Props |
|---|---|
| `<PivotCircle>` | `center`, `radius`, `fill`, `stroke`, `lineWidth` |
| `<PivotRectangle>` | `position`, `width`, `height`, `fill`, `stroke` |
| `<PivotLine>` | `start`, `end`, `stroke`, `lineWidth` |
| `<PivotLabel>` | `text`, `position`, `font`, `fill`, `textAlign` |
| `<PivotImage>` | `src`, `position`, `width`, `height`, `opacity`, `rotation` |
| `<PivotSprite>` | `sheetSrc`, `frameWidth`, `frameHeight`, `position`, `frame`, `scale`, `flipX` |
| `<PivotPlatform>` | `position`, `width`, `height`, `fill`, `stroke`, `oneWay` |
| `<PivotTilemap>` | `sheetSrc`, `frameWidth`, `frameHeight`, `mapData`, `tileSize`, `solidTiles` |
| `<PivotTiledBackground>` | `src`, `canvasWidth`, `canvasHeight`, `scrollX`, `scrollY`, `parallaxFactor` |

#### `<PivotNativeCamera>`

Wraps children with camera transforms. Shapes outside the camera render in screen space (HUD).

| Prop | Type | Default | Description |
|---|---|---|---|
| `position` | `IPoint` | — | Camera viewport top-left |
| `zoom` | `number` | `1` | Zoom level |
| `children` | `ReactNode` | — | World-space shapes |

#### `useNativeGameLoop(callback)`

Same pattern as `useGameLoop` — runs an rAF loop for driving state updates.

#### `useNativePostMessage(canvasRef, handlers?)`

Bidirectional messaging between RN and the WebView game. `handlers` maps event names to callbacks.

---

### Custom Shapes

Implement `IDrawable` to create shapes that work with `canvas.add()`:

```ts
import type { IDrawable } from '@colon-dev/pivotx';

class Star implements IDrawable {
  readonly tag = 'star';

  constructor(
    public cx: number, public cy: number,
    public points: number,
    public outer: number, public inner: number,
    public color = 'gold'
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    const step = Math.PI / this.points;
    ctx.beginPath();
    for (let i = 0; i < 2 * this.points; i++) {
      const r   = i % 2 === 0 ? this.outer : this.inner;
      const ang = i * step - Math.PI / 2;
      i === 0
        ? ctx.moveTo(this.cx + Math.cos(ang) * r, this.cy + Math.sin(ang) * r)
        : ctx.lineTo(this.cx + Math.cos(ang) * r, this.cy + Math.sin(ang) * r);
    }
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

canvas.add(new Star(300, 200, 5, 60, 25));
```

---

## Build Outputs

After `npm run build`, the `dist/` folder contains:

| File | Format | Use case |
|---|---|---|
| `pivotx.umd.js` | UMD | `<script>` tag, dev (unminified + source maps) |
| `pivotx.umd.min.js` | UMD | `<script>` tag, production / CDN |
| `pivotx.esm.js` | ESM | `import` in bundlers / TypeScript |
| `pivotx.cjs.js` | CJS | `require()` in Node / older toolchains |
| `react.esm.js` | ESM | React components + hooks |
| `react.cjs.js` | CJS | React (CommonJS) |
| `react-native.esm.js` | ESM | React Native / Expo components + hooks |
| `react-native.cjs.js` | CJS | React Native (CommonJS) |
| `index.d.ts` | types | TypeScript types for core |
| `react.d.ts` | types | TypeScript types for React layer |
| `react-native.d.ts` | types | TypeScript types for React Native layer |

---

## Publishing to npm

```bash
# 1. Set your name in package.json
# 2. Login to npm
npm login

# 3. Publish — this runs type-check + build first automatically
npm publish
```

After publishing, users can use the CDN immediately:
```html
<script src="https://cdn.jsdelivr.net/npm/@colon-dev/pivotx/dist/pivotx.umd.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@colon-dev/pivotx/dist/pivotx.umd.min.js"></script>
```

---

## Sample Games & Tutorials

Learn pIvotX by building real games — from a bouncing ball to a full platformer.
All tutorials include step-by-step code breakdowns.

👉 **[Browse all tutorials →](https://pivotx.colondev.com/tutorials)**

| Game | Level | What you'll learn |
|---|---|---|
| **Bouncing Ball** | Beginner | Canvas setup, game loop, simple physics |
| **Player Movement** | Beginner | Keyboard input, WASD + arrow keys, boundary clamping |
| **Static Scene** | Beginner | Layered rendering without a game loop |
| **Space Shooter** | Intermediate | Enemies, waves, power-ups, explosions |
| **Dungeon of Shadows** | Advanced | Procedural dungeons, melee & ranged combat, loot, bosses |
| **Nitro Highway** | Advanced | Endless runner, police AI, nitro boost, wanted levels |
| **NEXUS 2500: The Last Signal** | Advanced | 5-chapter story, 14 enemy types, boss phases, weapon upgrades |
| **Aetherdrift** | Advanced | Wall-jumping, dashing, 3-hit combos, 3 realms, boss fights |

---

## Links

| | |
|---|---|
| 🌐 Website | <https://pivotx.colondev.com/> |
| 🎮 Tutorials & Sample Games | <https://pivotx.colondev.com/tutorials> |
| 📦 npm | <https://www.npmjs.com/package/@colon-dev/pivotx> |
| 🐙 GitHub | <https://github.com/ColonDev-Community/pIvotX> |
| 🐛 Issues | <https://github.com/ColonDev-Community/pIvotX/issues> |

---

## License

MIT
