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
const crisp  = new Canvas("myCanvasId", { hiDPI: true });  // Retina-sharp rendering
```

| Method | Returns | Description |
|---|---|---|
| `getWidth()` | `number` | Canvas width in logical pixels |
| `getHeight()` | `number` | Canvas height in logical pixels |
| `getCenter()` | `IPoint` | Centre point of the canvas |
| `clear()` | `void` | Erase everything — call at start of each frame |
| `add(shape)` | `void` | Draw any `IDrawable` immediately |
| `startLoop(fn)` | `void` | Start rAF loop, `fn(dt)` called each frame |
| `stopLoop()` | `void` | Stop the running loop |
| `ctx` | `CanvasRenderingContext2D` | Raw 2D context for advanced use |
| `pixelRatio` | `number` | Device-pixel ratio in use (1 unless `hiDPI`) |
| `enableAutoResize()` | `void` | CSS-scale to fill the parent (aspect preserved, follows resizes) |
| `disableAutoResize()` | `void` | Stop auto-resizing, restore natural size |

With `{ hiDPI: true }` the backing store renders at `devicePixelRatio` while all
your coordinates stay logical. If you also use `UIManager` or `Pointer`, keep
input aligned with `ui.pixelRatio = canvas.pixelRatio` / `Pointer.pixelRatio = canvas.pixelRatio`.

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
| `lineHeight` | `number \| null` | 1.25 × font size | Line spacing for multi-line text (`\n`) |
| `maxWidth` | `number \| null` | `null` | Word-wrap the text to this pixel width |
| `strokeColor` | `string \| null` | `null` | Outline colour (drawn under the fill) |
| `strokeWidth` | `number` | `2` | Outline thickness |

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
| `follow(target, lerp?, dt?)` | `void` | Centre on target. `lerp` 0.05–0.15 = smooth, 1 = instant. Pass `dt` for frame-rate-independent smoothing |
| `followWithDeadZone(target, w, h, lerp?, dt?)` | `void` | Only scroll when the target leaves a central dead-zone box |
| `clamp(worldW, worldH)` | `void` | Prevent scrolling past world edges |
| `shake(intensity, duration?)` | `void` | Screen shake (px, seconds) — eases out; needs `update(dt)` |
| `setZoom(zoom, duration?)` | `void` | Set zoom, optionally animated over `duration` seconds |
| `update(dt)` | `void` | Advance shake decay & zoom animation (call before `begin`) |
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
  oneWay?: boolean;   // jump-through platform: only collides when landing from above
  vx?: number;        // moving platform: stepBody advances it and carries
  vy?: number;        //   bodies standing on it
}
```

#### `StepOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `gravity` | `number` | `0` | Gravity in pixels/sec² (applied to `vy`) |
| `maxStep` | `number` | `8` | Max movement per sub-step (smaller = more accurate) |
| `friction` | `number` | `1` | Friction multiplier on `vx` (0–1), frame-rate independent (per 1/60 s) |
| `maxFallSpeed` | `number` | — | Terminal falling velocity in pixels/sec (caps `vy`) |
| `bounce` | `number` | `0` | Restitution 0–1: velocity kept (reversed) on impact |

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

#### `stepBodyOnTilemap(body, tilemap, dt, options?)`

Like `stepBody`, but collides directly against a `Tilemap`'s solid tiles with automatic broad-phase culling (only nearby tiles are checked, so huge maps stay fast).

#### Circle & raycast helpers

```ts
circlesOverlap({ x, y, radius }, { x, y, radius });      // boolean
circleAABBOverlap({ x, y, radius }, aabb);               // boolean, corners handled
circleAABBResolve(circle, aabb);                         // pushes circle out, returns move | null
const hit = raycastAABB(origin, dir, aabb, maxT?);       // { t, point, normal } | null
raycastCircle(origin, dir, center, radius, maxT?);       // ray vs circle

// Continuous (swept) cast — a moving circle can't tunnel at any speed
const sweep = sweepCircleAABB(ball, { x: vx * dt, y: vy * dt }, wall.bounds);
if (sweep) {
  ball.x += vx * dt * sweep.t;    // move to the contact point
  ball.y += vy * dt * sweep.t;    // then reflect off sweep.normal to bounce
}
```

#### `SpatialHash` — broad-phase for many objects

```ts
const hash = new SpatialHash(64);          // cell size ≈ average object size
hash.clear();                              // start of frame
for (const e of enemies) hash.insert(e, createAABB(e.x, e.y, e.w, e.h));
const nearby = hash.query(playerBounds);   // narrow-phase only these, not all n
```

#### `CollisionResult`

```ts
interface CollisionResult {
  side: 'top' | 'bottom' | 'left' | 'right';
  platform: StaticRect;
}
```

---

### Sound & Audio

pIvotX includes a built-in sound engine powered by the Web Audio API for playing sound effects and music.

#### `Sound`

A single sound instance. Can be used standalone or via `SoundManager`.

```ts
import { Sound } from '@colon-dev/pivotx';

const jumpSfx = await Sound.load('/sfx/jump.mp3');
jumpSfx.play();
jumpSfx.volume = 0.5;
jumpSfx.loop = true;
jumpSfx.pause();
jumpSfx.resume();
jumpSfx.stop();
```

| Property/Method | Type | Description |
|---|---|---|
| `Sound.load(src)` | `Promise<Sound>` | Load a sound from a URL |
| `Sound.getAudioContext()` | `AudioContext` | Get the shared AudioContext |
| `.play()` | `void` | Start or restart playback |
| `.pause()` | `void` | Pause, keeping position |
| `.resume()` | `void` | Resume from paused position |
| `.stop()` | `void` | Stop and reset to beginning |
| `.playOneShot(volume?)` | `void` | Fire-and-forget overlapping playback (rapid SFX) |
| `.playSegment(start, dur, vol?)` | `void` | Play a slice of the buffer (audio sprites) |
| `.defineSprites(map)` | `this` | Name slices: `{ coin: [0.4, 0.5] }` — then `.playSprite('coin')` |
| `.playSprite(name, vol?)` | `void` | Play a named sprite slice (overlapping) |
| `.fadeTo(volume, seconds)` | `void` | Smoothly ramp volume to a target |
| `.fadeIn(seconds, target?)` | `void` | Play from silence and fade in |
| `.fadeOut(seconds)` | `void` | Fade to silence, then stop |
| `.dispose()` | `void` | Stop and release buffer/audio nodes |
| `.volume` | `number` | Gain from 0 (silent) to 1 (full) |
| `.playbackRate` | `number` | Speed/pitch multiplier (1 = normal), live-adjustable |
| `.pan` | `number` | Stereo pan -1 (left) to 1 (right) — cheap positional audio |
| `.loop` | `boolean` | Whether playback repeats |
| `.playing` | `boolean` | Whether currently playing |
| `.paused` | `boolean` | Whether paused (resume() continues) |
| `.duration` | `number` | Duration in seconds |
| `.currentTime` | `number` | Current playback position in seconds |

#### `SoundManager`

Global manager for named sounds, with master volume and mute control.

```ts
import { SoundManager } from '@colon-dev/pivotx';

// Load sounds (like AssetLoader but for audio)
await SoundManager.loadSounds({
  jump:  '/sfx/jump.mp3',
  coin:  '/sfx/coin.wav',
  theme: '/music/theme.ogg',
});

// Play
SoundManager.play('theme', { loop: true, volume: 0.6 });
SoundManager.play('jump');

// Control
SoundManager.stop('theme');
SoundManager.pause('theme');
SoundManager.resume('theme');
SoundManager.stopAll();

// Master volume
SoundManager.masterVolume = 0.8;
SoundManager.mute();
SoundManager.unmute();
```

| Method | Return | Description |
|---|---|---|
| `SoundManager.loadSound(name, src, opts?)` | `Promise<Sound>` | Load a single sound (`opts.group` assigns a bus) |
| `SoundManager.loadSounds(manifest, opts?)` | `Promise<Record<K, Sound>>` | Load multiple sounds in parallel |
| `SoundManager.setGroupVolume(group, v)` | `void` | Per-bus volume (e.g. `'sfx'` vs `'music'`) |
| `SoundManager.getGroupVolume(group)` | `number` | Current bus volume |
| `SoundManager.getSound(name)` | `Sound \| undefined` | Retrieve a loaded Sound |
| `SoundManager.play(name, opts?)` | `Sound \| undefined` | Play by name (opts: `loop`, `volume`) |
| `SoundManager.stop(name)` | `void` | Stop a named sound |
| `SoundManager.pause(name)` | `void` | Pause a named sound |
| `SoundManager.resume(name)` | `void` | Resume a named sound |
| `SoundManager.stopAll()` | `void` | Stop all sounds |
| `SoundManager.pauseAll()` | `void` | Pause every playing sound (pause menu) |
| `SoundManager.resumeAll()` | `void` | Resume every paused sound |
| `SoundManager.setVolume(name, v)` | `void` | Set a named sound's volume |
| `SoundManager.unload(name)` | `void` | Dispose and remove a named sound |
| `SoundManager.unloadAll()` | `void` | Dispose and remove every sound |
| `SoundManager.masterVolume` | `number` | Get/set master volume (0 – 1) |
| `SoundManager.mute()` | `void` | Mute all |
| `SoundManager.unmute()` | `void` | Unmute all |
| `SoundManager.muted` | `boolean` | Whether currently muted |

---

### Input — Keyboard & Gamepad

Built-in input engines — no manual event listeners needed. The per-frame
"just pressed / just released" states are updated automatically by
`Canvas.startLoop` and `useGameLoop`; in a custom rAF loop call
`updateInputs()` at the end of each frame.

#### `Keyboard`

```ts
import { Keyboard } from '@colon-dev/pivotx';

canvas.startLoop((dt) => {
  player.vx = 240 * Keyboard.getAxis('horizontal');   // arrows + WASD → -1..1
  if (Keyboard.justPressed('space') && player.grounded) player.vy = -500;
  if (Keyboard.isDown('shift')) player.vx *= 1.8;     // sprint
});
```

| Method | Return | Description |
|---|---|---|
| `Keyboard.isDown(key)` | `boolean` | True while the key is held |
| `Keyboard.justPressed(key)` | `boolean` | True only on the frame the key went down |
| `Keyboard.justReleased(key)` | `boolean` | True only on the frame the key was released |
| `Keyboard.getAxis(axis)` | `number` | `'horizontal'` / `'vertical'` → -1..1 (arrows + WASD) |
| `Keyboard.anyDown` | `boolean` | True if any key is held ("press any key" screens) |
| `Keyboard.init()` / `.destroy()` | `void` | Eager attach / full detach (attach is automatic) |

Keys accept friendly names (`'a'`, `'left'`, `'space'`, `'enter'`, `'shift'`, …)
or raw `KeyboardEvent.code` values (`'KeyW'`, `'ArrowLeft'`, `'F1'`).
Keys stuck by a window-focus change are released automatically.

#### `GamepadInput`

```ts
import { GamepadInput } from '@colon-dev/pivotx';

canvas.startLoop((dt) => {
  const stick = GamepadInput.getStick('left');       // { x: -1..1, y: -1..1 }
  player.vx = 240 * stick.x;
  if (GamepadInput.justPressed('a')) player.jump();
  if (GamepadInput.isDown('rt')) player.shoot(GamepadInput.getTrigger('rt'));
});

GamepadInput.vibrate(200, 0.8);   // rumble: 200 ms at 80 %
```

| Method | Return | Description |
|---|---|---|
| `GamepadInput.connected` | `boolean` | True if a controller is connected |
| `GamepadInput.isDown(btn)` | `boolean` | True while a button is held |
| `GamepadInput.justPressed(btn)` | `boolean` | True only on the press frame |
| `GamepadInput.justReleased(btn)` | `boolean` | True only on the release frame |
| `GamepadInput.getStick(side)` | `IPoint` | `'left'` / `'right'` stick with dead-zone applied |
| `GamepadInput.getTrigger(t)` | `number` | `'lt'` / `'rt'` analogue value 0–1 |
| `GamepadInput.vibrate(ms, strong?, weak?)` | `void` | Rumble (where supported) |
| `GamepadInput.deadZone` | `number` | Stick dead-zone (default 0.15) |
| `GamepadInput.raw` | `Gamepad \| null` | Raw Gamepad API object |

Buttons use standard-mapping names — `'a' 'b' 'x' 'y' 'lb' 'rb' 'lt' 'rt'
'back' 'start' 'ls' 'rs' 'up' 'down' 'left' 'right' 'home'` — or a raw index.

#### `Pointer`

Unified mouse/touch state on the canvas (for the game world — UI widgets are
handled by `UIManager`). Coordinates are in canvas pixels.

```ts
import { Pointer } from '@colon-dev/pivotx';

Pointer.attach(document.getElementById('game'));

canvas.startLoop((dt) => {
  if (Pointer.justPressed) shootAt(Pointer.x, Pointer.y);
  if (Pointer.isDown)      aimAt(Pointer.x, Pointer.y);
});
```

`Pointer.x` / `.y` / `.isDown` / `.justPressed` / `.justReleased`, plus
`attach(canvas)` / `detach()`. Use `camera.screenToWorld()` for world coordinates.

#### `InputMap` — action mapping

Name actions once, bind any mix of keys and gamepad buttons, query by action —
rebindable controls with zero physical-input references in game code.

```ts
import { InputMap } from '@colon-dev/pivotx';

InputMap.bind('jump',  ['space', 'w', 'gamepad:a']);
InputMap.bind('shoot', ['f', 'gamepad:rt']);

canvas.startLoop((dt) => {
  if (InputMap.justPressed('jump') && player.grounded) player.vy = -500;
  if (InputMap.isDown('shoot')) fire();
});
```

Plain strings are keyboard keys; prefix `gamepad:` for controller buttons.
Also: `addBinding()`, `unbind()`, `getBindings()`.

---

### UI Engine

Canvas-rendered widgets for building game UI fast — buttons, panels, HUD
text, progress bars, and a virtual joystick for touch controls. `UIManager`
handles pointer input (mouse + multi-touch) and draws everything with one call.

```ts
import {
  UIManager, UIButton, UIPanel, UIText, UIProgressBar, UIJoystick, Point,
} from '@colon-dev/pivotx';

const ui = new UIManager(document.getElementById('game'));

// HUD
const hp = new UIProgressBar(Point(16, 16), 200, 20, { fill: '#22c55e', label: 'HP' });
const score = new UIText('Score: 0', Point(16, 44), { font: 'bold 18px Arial' });

// Menu panel with auto-layout
const menu = new UIPanel(Point(220, 120), 200, 0, { layout: 'column', gap: 12 });
const playBtn = new UIButton('Play', Point(0, 0), 168, 44);
playBtn.onClick = () => startGame();
menu.add(playBtn).add(new UIButton('Options', Point(0, 0), 168, 44));

// Virtual joystick for mobile
const stick = new UIJoystick(Point(90, 330), 60);

ui.add(hp).add(score).add(menu).add(stick);

canvas.startLoop((dt) => {
  player.x += 220 * stick.value.x * dt;   // read the joystick like a gamepad
  hp.value = player.health / 100;

  canvas.clear();
  // ...draw the game world...
  ui.draw(canvas.ctx);                     // UI on top, in screen space
});

// ui.detach() when tearing down
```

| Widget | Description |
|---|---|
| `UIManager` | Attaches pointer events to the canvas, hit-tests topmost-first, `add/remove/clear`, `draw(ctx)`, `detach()` |
| `UIButton` | Rounded-rect button — `text`, `onClick`, hover/pressed/disabled styles via `UIButtonStyle` |
| `UIPanel` | Container with background/border; `layout: 'column' \| 'row'` auto-stacks children with `gap` & `padding` |
| `UIText` | Positioned HUD/menu text (`color`, `font`, `align`, `baseline`) |
| `UIProgressBar` | Health/loading bar — `value` 0–1, `fill`, `background`, optional centred `label` |
| `UIJoystick` | Virtual on-screen stick — read `value {x, y}` (-1..1) each frame, `active` flag |
| `UICheckbox` | Labelled toggle — `checked`, `onChange(checked)` |
| `UISlider` | Draggable slider — `value`, `min`/`max`/`step`, `onChange(value)` |
| `UIImageButton` | Image-skinned button — press-scale & hover-opacity states, optional spritesheet `sourceRect` |
| `UINineSlice` | Nine-slice panel skin from an image/atlas region — corners stay crisp at any size |
| `UIElement` | Abstract base class — extend it (implement `draw`) to build custom widgets |

**Anchoring:** set `el.anchor = { h: 'right', v: 'top' }` and `el.anchorOffset = { x: 16, y: 16 }`
to pin elements to canvas edges/centre — recomputed every frame, so resizes just work.

**Keyboard navigation:** call `ui.enableKeyboardNav()` — Tab/arrows move focus between
buttons/checkboxes/sliders, Enter/Space activates, Left/Right adjusts a focused slider,
and a dashed focus ring is drawn automatically (`ui.focusRingColor`).

All elements share `position`, `width`, `height`, `visible`, `enabled`,
`hovered`, `pressed`, and `onClick` / `onPress` / `onRelease` callbacks.
Works on desktop (mouse) and mobile (multi-touch: joystick + buttons at once).
In React, attach via the canvas ref: `new UIManager(canvasRef.current.element)`.

---

### Game Utilities

Small engines that remove the boilerplate around every game. All are
plain objects driven by your loop's `dt` — call their `update(dt)` each frame.

#### `Vec2` — vector math

```ts
const dir = Vec2.normalize(Vec2.sub(target, enemy.position));
enemy.vx = dir.x * speed;
```

`of, add, sub, scale, dot, length, lengthSq, distance, normalize, lerp,
rotate, clampLength, angle, fromAngle` — all pure, all return new objects.

#### `Timers` — game-time timers

```ts
const timers = new Timers();
timers.after(2, () => spawnBoss());              // one-shot
const h = timers.every(0.5, () => spawnEnemy()); // repeating, h.cancel() to stop

canvas.startLoop((dt) => { timers.update(dt); ... });
```

Unlike `setTimeout`, these advance with game time — they pause when your game pauses.

#### `TweenManager` — property animation

```ts
const tweens = new TweenManager();
tweens.to(player.position, { x: 400, y: 100 }, 0.6, 'easeOutQuad')
      .then(() => console.log('arrived'));
tweens.to(title, { opacity: 1 }, 1, 'easeOutCubic', 0.5);   // 0.5 s delay

canvas.startLoop((dt) => { tweens.update(dt); ... });
```

Easings: `linear`, `easeIn/Out/InOutQuad`, `easeIn/Out/InOutCubic`,
`easeOutBack`, `easeOutElastic`, `easeOutBounce`, or any custom `(t) => t` function.

#### `ParticleEmitter` — pooled particles

```ts
const sparks = new ParticleEmitter({
  colors: ['#fbbf24', '#f97316'], speed: [80, 260],
  life: [0.3, 0.8], size: [2, 5], gravity: 400,
});
sparks.burst(x, y, 24);            // explosion
sparks.rate = 40;                  // or continuous emission from sparks.position

canvas.startLoop((dt) => {
  sparks.update(dt);
  canvas.add(sparks);              // it's an IDrawable
});
```

#### `Scene` & `SceneManager` — game states

```ts
class MenuScene extends Scene {
  update(dt) { if (Keyboard.justPressed('enter')) this.manager.switch(new GameScene()); }
  draw(ctx)  { /* title screen */ }
}

const scenes = new SceneManager(new MenuScene());
canvas.startLoop((dt) => {
  canvas.clear();
  scenes.update(dt);
  scenes.draw(canvas.ctx);
});
```

`switch(scene)` replaces everything; `push(scene)` / `pop()` create overlays
(pause menu over a frozen game — only the top scene updates, all scenes draw).

---

### React Components

#### `<PivotCanvas>`
The root component. All shape components must be inside it.

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `number` | `600` | Width in pixels |
| `height` | `number` | `400` | Height in pixels |
| `background` | `string` | transparent | CSS background |
| `autoClear` | `boolean` | `false` | Clear before child shapes draw each render (no smearing) |
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

#### `<PivotTiledBackground>`

Draws a repeating tiled background with parallax scrolling support.

| Prop | Type | Default | Description |
|---|---|---|---|
| `image` | `HTMLImageElement` | — | Pre-loaded tile image (use `AssetLoader.loadImage`) |
| `canvasWidth` | `number` | — | Viewport width |
| `canvasHeight` | `number` | — | Viewport height |
| `scrollX` | `number` | `0` | Horizontal scroll offset |
| `scrollY` | `number` | `0` | Vertical scroll offset |
| `opacity` | `number` | `1` | 0–1 opacity |
| `parallaxFactor` | `number` | `1` | Parallax speed multiplier (0.5 = half speed) |

```tsx
<PivotTiledBackground
  image={skyImg}
  canvasWidth={600}
  canvasHeight={400}
  scrollX={scrollRef.current}
  parallaxFactor={0.3}
/>
```

#### `useGameLoop(callback)`

Starts an rAF loop for the lifetime of the component. Stops automatically on unmount.

```tsx
useGameLoop((dt: number) => {
  // dt = seconds since last frame
  // update state here, then trigger re-render
});
```

#### `useSound()`

React convenience hook for controlling sounds via `SoundManager`.

```tsx
import { useSound, SoundManager } from '@colon-dev/pivotx/react';

// Load sounds once (e.g. in a useEffect)
useEffect(() => {
  SoundManager.loadSounds({ jump: '/sfx/jump.mp3', bgm: '/music/theme.mp3' });
}, []);

const sound = useSound();

// In your game loop or event handler:
sound.play('jump');
sound.play('bgm', { loop: true, volume: 0.5 });
sound.stop('bgm');
sound.setMasterVolume(0.8);
sound.mute();
sound.unmute();
```

#### UI components — `<PivotUI>` and widgets

Declare canvas UI in JSX. `<PivotUI>` hosts a `UIManager` inside the parent
`<PivotCanvas>` and draws it every frame on top of your game; widget props
sync to the underlying widgets on every render.

```tsx
const stickRef = useRef<UIJoystick | null>(null);
const [hp, setHp] = useState(1);
const [volume, setVolume] = useState(0.8);

<PivotCanvas width={600} height={400} autoClear>
  {/* ...game shapes... */}
  <PivotUI>
    <PivotButton x={230} y={170} text="Play" onClick={start} />
    <PivotProgressBar x={16} y={16} value={hp} fill="#22c55e" label="HP" />
    <PivotSlider x={16} y={50} value={volume} onChange={setVolume} />
    <PivotCheckbox x={16} y={84} label="Sound" checked={soundOn} onChange={setSoundOn} />
    <PivotUIText x={16} y={116} text={`Score: ${score}`} font="bold 18px Arial" />
    <PivotJoystick x={80} y={330} radius={55} widgetRef={stickRef} />
  </PivotUI>
</PivotCanvas>
```

- Read continuous values (joystick) inside your game loop via `widgetRef`:
  `stickRef.current?.value.x`.
- Pass `manual` to `<PivotUI uiRef={uiRef} manual>` and call
  `uiRef.current.draw(ctx)` yourself for exact draw-order control.
- Every widget accepts `visible`, and interactive ones accept `disabled`.

#### `useKeyPressed(key)` / `useGamepadConnected()`

Reactive input state for menus and HUDs (they re-render the component —
inside game loops, poll `Keyboard`/`GamepadInput` directly instead).

```tsx
const paused = useKeyPressed('escape');
const hasGamepad = useGamepadConnected();
```

#### `useUIManager(canvasRef, setup?)`

A `UIManager` bound to a `<PivotCanvas>` ref with automatic attach/detach.

```tsx
const canvasRef = useRef<PivotCanvasHandle>(null);
const ui = useUIManager(canvasRef, (ui) => {
  const btn = new UIButton('Play', Point(220, 180));
  btn.onClick = () => setStarted(true);
  ui.add(btn);
});

useGameLoop(() => {
  const ctx = canvasRef.current?.ctx;
  if (ctx && ui.current) ui.current.draw(ctx);
});
```

---

### React Native / Expo Components

Import from `@colon-dev/pivotx/react-native`. Requires `react-native-webview` as a peer dependency (native only — not used on Expo Web).

**Platform support:** Components work identically on iOS, Android, and Expo Web. `PivotNativeCanvas` automatically detects the platform via `Platform.OS` and switches between WebView rendering (native) and direct `<canvas>` rendering (web).

**Security note:** the native renderer is a WebView bridge, so the component intentionally exposes code-execution primitives — `script` mode and `injectScript()` run whatever JavaScript you pass them (same trust model as `react-native-webview`'s `injectJavaScript`). Only pass code and props you control; never interpolate untrusted user input into `script`. Template interpolations are hardened (dimensions coerced, background CSS-validated, `</script>` breakout escaped, injected JSON sanitized), and the WebView policies are configurable via `allowFileAccess`, `mixedContentMode`, and `originWhitelist` props — tighten them for production builds (e.g. `mixedContentMode="never"` when all assets are https).

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

#### Native UI Components

Declare canvas UI in JSX inside `<PivotNativeCanvas>` — widgets are reconciled
into a real `UIManager` (directly on Expo Web; inside the WebView on
iOS/Android, where touches route to the UI first and events post back over
the bridge).

```tsx
const stick = useRef({ x: 0, y: 0 });

<PivotNativeCanvas width={W} height={H}>
  {/* ...shapes... */}
  <PivotUIText x={16} y={14} text={`Coins: ${score}`} color="#fbbf24" />
  <PivotProgressBar x={16} y={42} value={energy} fill="#22c55e" label="ENERGY" />
  <PivotJoystick x={86} y={H - 96} radius={58} onMove={(v) => (stick.current = v)} />
  <PivotButton x={W - 120} y={H - 130} text="JUMP" onClick={jump} />
</PivotNativeCanvas>
```

| Component | Key Props |
|---|---|
| `<PivotButton>` | `x`, `y`, `text`, `width`, `height`, `background`, `color`, `onClick`, `disabled` |
| `<PivotUIText>` | `x`, `y`, `text`, `color`, `font` |
| `<PivotProgressBar>` | `x`, `y`, `value` (0–1), `width`, `height`, `fill`, `label` |
| `<PivotCheckbox>` | `x`, `y`, `label`, `checked`, `onChange(checked)` |
| `<PivotSlider>` | `x`, `y`, `value`, `width`, `min`, `max`, `step`, `onChange(value)` |
| `<PivotJoystick>` | `x`, `y` (centre), `radius`, `onMove({ x, y })` — store in a ref, read in your loop |

> **Native note:** the WebView loads the pIvotX UMD from the jsDelivr CDN, so
> the UI widgets need the published `@colon-dev/pivotx` ≥ 2.0.0 there (they
> no-op on older bundles). On Expo Web they work with your local build
> immediately.

#### `NativeInput` — hardware keyboard & controllers

Bluetooth/USB keyboards and game controllers work on **web and native** with
one API — on iOS/Android their events reach the WebView's DOM and are
forwarded over the bridge, no native module required.

```tsx
import { NativeInput, useNativeGameLoop } from '@colon-dev/pivotx/react-native';

useNativeGameLoop((dt) => {
  player.vx = 240 * NativeInput.keyAxis('horizontal');     // arrows + WASD
  const stick = NativeInput.getStick('left');              // controller stick
  if (NativeInput.isKeyDown('space') || NativeInput.isButtonDown('a')) jump();
});
```

| Method | Description |
|---|---|
| `NativeInput.isKeyDown(key)` | True while a key is held (same names as `Keyboard`) |
| `NativeInput.keyAxis(axis)` | `'horizontal'` / `'vertical'` → -1..1 (arrows + WASD) |
| `NativeInput.gamepadConnected` | True if a controller is connected |
| `NativeInput.isButtonDown(btn)` | Standard-mapping names (`'a'`, `'start'`, …) or index |
| `NativeInput.getStick(side)` | Dead-zoned stick `{ x, y }` (`deadZone` configurable) |

Held-state only — for `justPressed` edges, compare against the previous
frame in your loop. On native, requires `<PivotNativeCanvas>` to be mounted
(and the ≥ 2.0.0 UMD, as above).

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

#### `useNativeSound()`

Audio control hook for React Native — must be called inside `<PivotNativeCanvas>`. Works identically on both native (WebView) and web (Expo Web).

```tsx
import { PivotNativeCanvas, useNativeSound } from '@colon-dev/pivotx/react-native';

function Game() {
  const sound = useNativeSound();

  // Load sounds (will execute inside the canvas context)
  sound.loadSound('jump', '/sfx/jump.mp3');

  // In game logic:
  sound.play('jump');
  sound.play('bgm', { loop: true, volume: 0.5 });
  sound.setMasterVolume(0.8);
  sound.mute();
  sound.unmute();

  return (
    <PivotNativeCanvas width={400} height={300}>
      ...
    </PivotNativeCanvas>
  );
}
```

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
