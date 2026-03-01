# pIvotX

Lightweight 2D game development library. One package, three ways to use it.

| Target | Import style | Build required? |
|---|---|---|
| Vanilla JS | `<script src="cdn">` → `window.PivotX` | No |
| TypeScript | `import { Canvas } from '@colon-dev/pivotx'` | Yes (your project) |
| React | `import { PivotCanvas } from '@colon-dev/pivotx/react'` | Yes (your project) |

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

#### `useGameLoop(callback)`

Starts an rAF loop for the lifetime of the component. Stops automatically on unmount.

```tsx
useGameLoop((dt: number) => {
  // dt = seconds since last frame
  // update state here, then trigger re-render
});
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
| `index.d.ts` | types | TypeScript types for core |
| `react.d.ts` | types | TypeScript types for React layer |

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

## License

MIT
