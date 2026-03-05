# pIvotX — Complete Implementation Guide

From your first shape to a full animated game, step by step.

---

## Table of Contents

1. [Setup](#1-setup)
2. [Point — the coordinate building block](#2-point)
3. [Canvas — your drawing surface](#3-canvas)
4. [Circle](#4-circle)
5. [Rectangle](#5-rectangle)
6. [Line](#6-line)
7. [Label](#7-label)
8. [The Game Loop](#8-the-game-loop)
9. [Example — Static Scene](#9-example--static-scene)
10. [Example — Animated Clock](#10-example--animated-clock)
11. [Example — Bouncing Ball](#11-example--bouncing-ball)
12. [Example — Keyboard-Controlled Player](#12-example--keyboard-controlled-player)
13. [Example — Complete Mini-Game (Catch the Dots)](#13-example--complete-mini-game-catch-the-dots)
14. [Common Mistakes](#14-common-mistakes)
15. [Loading Images with AssetLoader](#15-loading-images-with-assetloader)
16. [Drawing Images with GameImage](#16-drawing-images-with-gameimage)
17. [Sprites & SpriteSheets](#17-sprites--spritesheets)
18. [Sprite Animation with SpriteAnimator](#18-sprite-animation-with-spriteanimator)
19. [Parallax Scrolling Backgrounds](#19-parallax-scrolling-backgrounds)
20. [Camera — Following the Player](#20-camera--following-the-player)
21. [Platforms & AABB Collision](#21-platforms--aabb-collision)
22. [Tilemaps — Grid-Based Levels](#22-tilemaps--grid-based-levels)
23. [Example — Putting It All Together (Platformer)](#23-example--putting-it-all-together-platformer)

---

## 1. Setup

Create two files side by side:

```
my-game/
├── pIvotX.js
└── index.html
```

In `index.html`, load the library before your own script:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>My Game</title>
    <script src="pIvotX.js"></script>
  </head>
  <body>
    <canvas id="myCanvas" width="600" height="400"
      style="border: 1px solid #ccc; display: block; margin: 0 auto;">
    </canvas>

    <script>
      // your code goes here
    </script>
  </body>
</html>
```

> The `<canvas>` element must come **before** your `<script>` block, or the script must run after `DOMContentLoaded`. The simplest approach is to put your script at the bottom of `<body>`.

---

## 2. Point

`Point` is a plain `{x, y}` object. Every shape uses Points for positions.

```js
var origin  = Point(0, 0);
var middle  = Point(300, 200);
var corner  = Point(50, 50);

console.log(middle.x); // 300
console.log(middle.y); // 200
```

You do **not** use `new` with `Point` — it is a factory function, not a constructor.

---

## 3. Canvas

`Canvas` wraps a `<canvas>` DOM element and provides the drawing API.

```js
var canvas = new Canvas("myCanvas");
```

If the id does not exist or points to a non-canvas element, pIvotX logs an error to the console and does nothing — your page won't crash.

### Useful properties and methods

```js
canvas.getWidth();    // e.g. 600
canvas.getHeight();   // e.g. 400
canvas.getCenter();   // Point(300, 200)

canvas.clear();       // wipe everything — use at the start of each frame
```

### Drawing order matters

Shapes are drawn in the order you call `canvas.add()`. Shapes added later appear on top.

```js
canvas.add(background);  // drawn first — behind everything
canvas.add(player);      // drawn on top
canvas.add(ui);          // drawn last — always on top
```

---

## 4. Circle

```js
var circle = new Circle(centerPoint, radius);
```

### Properties

```js
circle.centerPoint = Point(100, 100);  // move it
circle.radius      = 40;
circle.fillColor   = "tomato";         // CSS colour — name, hex, rgb, hsl all work
circle.strokeColor = "#222";           // outline colour
circle.lineWidth   = 3;                // outline thickness
```

### Draw it

```js
canvas.add(circle);
```

### Example — filled circle with outline

```js
var canvas = new Canvas("myCanvas");

var sun = new Circle(Point(300, 150), 60);
sun.fillColor   = "#FFD700";
sun.strokeColor = "#FFA500";
sun.lineWidth   = 4;

canvas.add(sun);
```

---

## 5. Rectangle

```js
var rect = new Rectangle(topLeftPoint, width, height);
```

The first argument is the **top-left corner**, not the centre.

### Properties

```js
rect.position    = Point(50, 50);  // top-left corner
rect.fillColor   = "skyblue";
rect.strokeColor = "navy";
rect.lineWidth   = 2;
```

### Example — a coloured tile

```js
var canvas = new Canvas("myCanvas");

var tile = new Rectangle(Point(100, 100), 120, 80);
tile.fillColor   = "mediumseagreen";
tile.strokeColor = "#155724";
tile.lineWidth   = 2;

canvas.add(tile);
```

---

## 6. Line

```js
var line = new Line(startPoint, endPoint);
```

### Properties

```js
line.startPoint  = Point(0, 0);
line.endPoint    = Point(200, 150);
line.strokeColor = "crimson";
line.lineWidth   = 2;
```

### Example — a cross-hair

```js
var canvas  = new Canvas("myCanvas");
var cx      = canvas.getWidth()  / 2;
var cy      = canvas.getHeight() / 2;

var hLine = new Line(Point(0, cy), Point(canvas.getWidth(), cy));
hLine.strokeColor = "#999";

var vLine = new Line(Point(cx, 0), Point(cx, canvas.getHeight()));
vLine.strokeColor = "#999";

canvas.add(hLine);
canvas.add(vLine);
```

---

## 7. Label

```js
var label = new Label(text, position, font);
```

`font` is optional and defaults to `"16px Arial"`.

### Properties

```js
label.text        = "Score: 0";
label.position    = Point(300, 30);
label.font        = "24px Arial";
label.fillColor   = "white";
label.textAlign   = "center";    // "left" | "center" | "right"
label.textBaseline = "middle";   // "top"  | "middle" | "bottom"
```

### Example — a title on screen

```js
var canvas = new Canvas("myCanvas");

var title = new Label("pIvotX Demo", canvas.getCenter(), "bold 32px Arial");
title.fillColor = "#333";

canvas.add(title);
```

---

## 8. The Game Loop

For anything that moves you need to redraw the canvas many times per second. `startLoop` handles this using `requestAnimationFrame`, which syncs to the display refresh rate (typically 60 fps).

```js
canvas.startLoop(function (dt) {
  // dt = seconds since last frame, e.g. ~0.016 at 60 fps

  canvas.clear();       // 1. erase previous frame
  // update positions   // 2. move things
  // canvas.add(...)    // 3. redraw everything
});
```

To stop the loop:

```js
canvas.stopLoop();
```

### Why delta time (dt)?

If you move something by a fixed number of pixels per frame, it will move faster on a 120 Hz monitor than on a 60 Hz one. Multiplying by `dt` makes speed **frame-rate independent**:

```js
// Wrong — speed depends on frame rate
x += 3;

// Correct — moves 180 pixels per second regardless of frame rate
x += 180 * dt;
```

---

## 9. Example — Static Scene

A simple landscape with no animation. Good for understanding draw order.

```html
<canvas id="myCanvas" width="600" height="400"></canvas>
<script>
  var canvas = new Canvas("myCanvas");

  // Sky
  var sky = new Rectangle(Point(0, 0), 600, 260);
  sky.fillColor = "#87CEEB";
  canvas.add(sky);

  // Ground
  var ground = new Rectangle(Point(0, 260), 600, 140);
  ground.fillColor = "#8B6914";
  canvas.add(ground);

  // Sun
  var sun = new Circle(Point(500, 80), 50);
  sun.fillColor   = "#FFD700";
  sun.strokeColor = "#FFA500";
  sun.lineWidth   = 3;
  canvas.add(sun);

  // Tree trunk
  var trunk = new Rectangle(Point(270, 200), 30, 80);
  trunk.fillColor = "#6B3A2A";
  canvas.add(trunk);

  // Tree top
  var tree = new Circle(Point(285, 180), 60);
  tree.fillColor = "#228B22";
  canvas.add(tree);

  // Title
  var title = new Label("My Scene", Point(300, 20), "bold 20px Arial");
  title.fillColor = "#333";
  canvas.add(title);
</script>
```

---

## 10. Example — Animated Clock

Introduces `startLoop` and using `new Date()` to drive animation.

```html
<canvas id="myCanvas" width="400" height="400"></canvas>
<script>
  var canvas = new Canvas("myCanvas");
  var cx     = canvas.getCenter();
  var radius = canvas.getHeight() / 2;

  function drawHand(from, angleDeg, length, color, width) {
    var rad = (angleDeg - 90) * Math.PI / 180;
    var to  = Point(
      from.x + Math.cos(rad) * length,
      from.y + Math.sin(rad) * length
    );
    var hand = new Line(from, to);
    hand.strokeColor = color;
    hand.lineWidth   = width;
    canvas.add(hand);
  }

  canvas.startLoop(function (dt) {
    canvas.clear();

    var now     = new Date();
    var hours   = now.getHours() % 12;
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();

    // Face
    var face = new Circle(cx, radius * 0.9);
    face.fillColor   = "white";
    face.strokeColor = "#333";
    face.lineWidth   = 4;
    canvas.add(face);

    // Hour markers
    for (var i = 0; i < 12; i++) {
      var ang = i * 30;
      var rad = (ang - 90) * Math.PI / 180;
      var mx  = cx.x + Math.cos(rad) * radius * 0.78;
      var my  = cx.y + Math.sin(rad) * radius * 0.78;
      var dot = new Circle(Point(mx, my), i === 0 ? 6 : 4);
      dot.fillColor = "#555";
      canvas.add(dot);
    }

    // Hands
    drawHand(cx, (hours + minutes / 60) * 30,       radius * 0.50, "#333", 6);
    drawHand(cx, (minutes + seconds / 60) * 6,      radius * 0.70, "#333", 4);
    drawHand(cx, seconds * 6,                        radius * 0.82, "crimson", 2);

    // Centre dot
    var dot = new Circle(cx, 6);
    dot.fillColor = "crimson";
    canvas.add(dot);
  });
</script>
```

---

## 11. Example — Bouncing Ball

Introduces velocity, boundary collision, and delta time movement.

```html
<canvas id="myCanvas" width="600" height="400"></canvas>
<script>
  var canvas = new Canvas("myCanvas");
  var W = canvas.getWidth();
  var H = canvas.getHeight();

  // Ball state
  var ball = {
    x:  W / 2,
    y:  H / 2,
    r:  20,
    vx: 220,   // pixels per second
    vy: 160
  };

  canvas.startLoop(function (dt) {
    canvas.clear();

    // Background
    var bg = new Rectangle(Point(0, 0), W, H);
    bg.fillColor = "#1a1a2e";
    canvas.add(bg);

    // Move
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Bounce off walls
    if (ball.x - ball.r < 0)  { ball.x = ball.r;    ball.vx *= -1; }
    if (ball.x + ball.r > W)  { ball.x = W - ball.r; ball.vx *= -1; }
    if (ball.y - ball.r < 0)  { ball.y = ball.r;    ball.vy *= -1; }
    if (ball.y + ball.r > H)  { ball.y = H - ball.r; ball.vy *= -1; }

    // Draw ball
    var circle = new Circle(Point(ball.x, ball.y), ball.r);
    circle.fillColor   = "#e94560";
    circle.strokeColor = "white";
    circle.lineWidth   = 2;
    canvas.add(circle);

    // Label
    var info = new Label(
      "vx: " + Math.round(ball.vx) + "  vy: " + Math.round(ball.vy),
      Point(W / 2, 20),
      "14px monospace"
    );
    info.fillColor = "white";
    canvas.add(info);
  });
</script>
```

---

## 12. Example — Keyboard-Controlled Player

Introduces keyboard input alongside the game loop.

```html
<canvas id="myCanvas" width="600" height="400"></canvas>
<script>
  var canvas = new Canvas("myCanvas");
  var W = canvas.getWidth();
  var H = canvas.getHeight();

  // Track which keys are held down
  var keys = {};
  document.addEventListener("keydown", function (e) { keys[e.key] = true; });
  document.addEventListener("keyup",   function (e) { keys[e.key] = false; });

  var player = {
    x:     W / 2,
    y:     H / 2,
    size:  30,
    speed: 250   // pixels per second
  };

  canvas.startLoop(function (dt) {
    canvas.clear();

    // Background
    var bg = new Rectangle(Point(0, 0), W, H);
    bg.fillColor = "#0f3460";
    canvas.add(bg);

    // Move player — clamp to canvas edges
    if (keys["ArrowLeft"]  || keys["a"]) player.x -= player.speed * dt;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed * dt;
    if (keys["ArrowUp"]    || keys["w"]) player.y -= player.speed * dt;
    if (keys["ArrowDown"]  || keys["s"]) player.y += player.speed * dt;

    var half = player.size / 2;
    player.x = Math.max(half, Math.min(W - half, player.x));
    player.y = Math.max(half, Math.min(H - half, player.y));

    // Draw player
    var rect = new Rectangle(
      Point(player.x - half, player.y - half),
      player.size,
      player.size
    );
    rect.fillColor   = "#e94560";
    rect.strokeColor = "white";
    rect.lineWidth   = 2;
    canvas.add(rect);

    // HUD
    var hud = new Label(
      "Use Arrow keys or WASD to move",
      Point(W / 2, H - 20),
      "14px Arial"
    );
    hud.fillColor = "rgba(255,255,255,0.5)";
    canvas.add(hud);
  });
</script>
```

---

## 13. Example — Complete Mini-Game (Catch the Dots)

Brings everything together: player movement, spawning enemies, collision detection, score, lives, and a game-over screen.

```html
<canvas id="myCanvas" width="600" height="450"></canvas>
<script>
  var canvas = new Canvas("myCanvas");
  var W = canvas.getWidth();
  var H = canvas.getHeight();

  // ── Input ──────────────────────────────────────────────────────────────────
  var keys = {};
  document.addEventListener("keydown", function (e) {
    keys[e.key] = true;
    if (e.key === " " && state.gameOver) resetGame();
  });
  document.addEventListener("keyup", function (e) { keys[e.key] = false; });

  // ── Game state ─────────────────────────────────────────────────────────────
  var state;

  function resetGame() {
    state = {
      player:   { x: W / 2, y: H - 60, size: 28, speed: 280 },
      dots:     [],
      score:    0,
      lives:    3,
      spawnTimer: 0,
      spawnRate:  1.2,   // seconds between spawns
      gameOver:   false
    };
  }

  resetGame();

  // ── Helpers ────────────────────────────────────────────────────────────────
  function spawnDot() {
    state.dots.push({
      x:     20 + Math.random() * (W - 40),
      y:     -20,
      r:     10 + Math.random() * 14,
      speed: 80 + Math.random() * 120,
      color: ["#e94560","#0f9","#FFD700","#66cfff"][Math.floor(Math.random() * 4)]
    });
  }

  function circleHitsRect(cx, cy, cr, rx, ry, rw, rh) {
    var nearX = Math.max(rx, Math.min(cx, rx + rw));
    var nearY = Math.max(ry, Math.min(cy, ry + rh));
    var dx    = cx - nearX;
    var dy    = cy - nearY;
    return dx * dx + dy * dy < cr * cr;
  }

  // ── Game loop ──────────────────────────────────────────────────────────────
  canvas.startLoop(function (dt) {
    canvas.clear();

    // Background
    var bg = new Rectangle(Point(0, 0), W, H);
    bg.fillColor = "#1a1a2e";
    canvas.add(bg);

    if (state.gameOver) {
      // ── Game over screen ──
      var overlay = new Rectangle(Point(0, 0), W, H);
      overlay.fillColor = "rgba(0,0,0,0.6)";
      canvas.add(overlay);

      var title = new Label("GAME OVER", Point(W / 2, H / 2 - 40), "bold 48px Arial");
      title.fillColor = "#e94560";
      canvas.add(title);

      var scoreMsg = new Label("Score: " + state.score, Point(W / 2, H / 2 + 20), "28px Arial");
      scoreMsg.fillColor = "white";
      canvas.add(scoreMsg);

      var restart = new Label("Press SPACE to play again", Point(W / 2, H / 2 + 70), "18px Arial");
      restart.fillColor = "#aaa";
      canvas.add(restart);

      return;
    }

    var p = state.player;

    // ── Move player ──
    if (keys["ArrowLeft"]  || keys["a"]) p.x -= p.speed * dt;
    if (keys["ArrowRight"] || keys["d"]) p.x += p.speed * dt;
    p.x = Math.max(p.size / 2, Math.min(W - p.size / 2, p.x));

    // ── Spawn dots ──
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnDot();
      state.spawnTimer = state.spawnRate * (0.8 + Math.random() * 0.4);
      // Gradually speed up
      state.spawnRate = Math.max(0.4, state.spawnRate - 0.01);
    }

    // ── Update dots ──
    var surviving = [];
    for (var i = 0; i < state.dots.length; i++) {
      var d = state.dots[i];
      d.y += d.speed * dt;

      var px = p.x - p.size / 2;
      var py = p.y - p.size / 2;

      if (circleHitsRect(d.x, d.y, d.r, px, py, p.size, p.size)) {
        // Caught!
        state.score += Math.ceil(d.r);   // bigger dot = more points
      } else if (d.y - d.r > H) {
        // Missed
        state.lives -= 1;
        if (state.lives <= 0) state.gameOver = true;
      } else {
        surviving.push(d);
      }
    }
    state.dots = surviving;

    // ── Draw dots ──
    for (var i = 0; i < state.dots.length; i++) {
      var d  = state.dots[i];
      var dc = new Circle(Point(d.x, d.y), d.r);
      dc.fillColor = d.color;
      canvas.add(dc);
    }

    // ── Draw player ──
    var prect = new Rectangle(Point(p.x - p.size / 2, p.y - p.size / 2), p.size, p.size);
    prect.fillColor   = "#e94560";
    prect.strokeColor = "white";
    prect.lineWidth   = 2;
    canvas.add(prect);

    // ── HUD ──
    var scoreLbl = new Label("Score: " + state.score, Point(10, 20), "bold 18px Arial");
    scoreLbl.fillColor  = "white";
    scoreLbl.textAlign  = "left";
    canvas.add(scoreLbl);

    for (var l = 0; l < state.lives; l++) {
      var heart = new Circle(Point(W - 25 - l * 30, 22), 10);
      heart.fillColor = "#e94560";
      canvas.add(heart);
    }

    var hint = new Label("← → or A D to move", Point(W / 2, H - 10), "13px Arial");
    hint.fillColor   = "rgba(255,255,255,0.35)";
    hint.textBaseline = "bottom";
    canvas.add(hint);
  });
</script>
```

**How the game works:**
- Coloured dots fall from the top of the screen.
- Move your red square left and right to catch them.
- Each caught dot scores points equal to its radius — bigger dots are worth more.
- Miss three dots and the game ends. Press Space to restart.
- The spawn rate increases over time, so it gets harder.

---

## 14. Common Mistakes

### Forgetting `canvas.clear()` in the loop
Without it, every frame is painted on top of the last — you get a smear trail instead of animation.

```js
// Wrong
canvas.startLoop(function (dt) {
  ball.x += 100 * dt;
  canvas.add(ballShape);
});

// Correct
canvas.startLoop(function (dt) {
  canvas.clear();                    // ← always first
  ball.x += 100 * dt;
  canvas.add(ballShape);
});
```

### Passing a non-canvas element id
```js
var bad = new Canvas("myDiv");  // logs an error, does nothing — won't crash
var good = new Canvas("myCanvas"); // works correctly
```

### Setting position without `Point`
```js
// Wrong — plain objects work, but Point is the intended pattern
circle.centerPoint = { x: 100, y: 200 };

// Correct
circle.centerPoint = Point(100, 200);
```

### Using speed without delta time
```js
// Wrong — will run at different speeds on different machines/monitors
x += 5;

// Correct — always multiply by dt for consistent physics
x += 300 * dt;
```

### Drawing a shape once and expecting it to persist across frames
`canvas.add()` draws *immediately*. If you call `canvas.clear()`, the shape is gone. You must call `canvas.add()` every frame for things that should remain visible.

```js
// Wrong mindset — "add once, always there"
canvas.add(background);

canvas.startLoop(function (dt) {
  canvas.clear(); // background is now gone
});

// Correct — re-add every frame
canvas.startLoop(function (dt) {
  canvas.clear();
  canvas.add(background);  // redrawn each frame
  canvas.add(player);
});
```

---

## 15. Loading Images with AssetLoader

Before using images, sprites, or tile sheets, you need to preload them. `AssetLoader` provides two static methods for this.

### Loading a single image

```ts
import { AssetLoader } from '@colon-dev/pivotx';

const heroImg = await AssetLoader.loadImage('/sprites/hero.png');
// heroImg is now a fully loaded HTMLImageElement, ready to use
```

### Batch-loading multiple images

For games with many assets, use `loadAssets()` to load everything in parallel:

```ts
const assets = await AssetLoader.loadAssets({
  hero:       '/sprites/hero.png',
  enemy:      '/sprites/enemy.png',
  tileset:    '/tiles/ground.png',
  background: '/bg/sky.png',
});

// Access by name — all are HTMLImageElement
console.log(assets.hero.naturalWidth);    // e.g. 128
console.log(assets.tileset.naturalWidth); // e.g. 256
```

### Error handling

`loadImage()` rejects with an `Error` if the URL is invalid or the server is unreachable:

```ts
try {
  const img = await AssetLoader.loadImage('/missing.png');
} catch (err) {
  console.error(err.message);
  // "pIvotX: Failed to load image "/missing.png""
}
```

### Typical setup pattern

```ts
async function main() {
  // 1. Preload all assets
  const assets = await AssetLoader.loadAssets({
    hero:    '/sprites/hero.png',
    tileset: '/tiles/ground.png',
    sky:     '/bg/sky.png',
  });

  // 2. Create canvas
  const canvas = new Canvas('game');

  // 3. Build sprites, tilemaps, backgrounds from loaded assets
  const heroSheet = Sprite.createSheet(assets.hero, 32, 32);
  const heroSprite = new Sprite(Point(100, 200), heroSheet);

  // 4. Start the game loop
  canvas.startLoop((dt) => {
    canvas.clear();
    canvas.add(heroSprite);
  });
}

main();
```

---

## 16. Drawing Images with GameImage

`GameImage` draws a static image onto the canvas. It accepts either a pre-loaded `HTMLImageElement` or a URL string.

### Using a pre-loaded image (recommended)

```ts
import { GameImage, AssetLoader, Point } from '@colon-dev/pivotx';

const img  = await AssetLoader.loadImage('/background.png');
const bg   = new GameImage(Point(0, 0), img);
bg.width   = 600;  // stretch to canvas width
bg.height  = 400;
canvas.add(bg);
```

### Auto-loading from a URL

When you pass a string, the image loads in the background. `draw()` silently skips until it's ready:

```ts
const bg = new GameImage(Point(0, 0), '/background.png');

canvas.startLoop((dt) => {
  canvas.clear();
  canvas.add(bg);  // nothing shows until loaded, then appears automatically
});
```

### Image properties

```ts
const hero = new GameImage(Point(100, 50), heroImg);

hero.width   = 64;      // display width (null = natural)
hero.height  = 64;      // display height (null = natural)
hero.opacity = 0.8;     // semi-transparent
hero.rotation = Math.PI / 4;  // rotate 45 degrees
```

### Checking load state and swapping images

```ts
if (hero.loaded) {
  console.log('Image is ready!');
}

// Change image at runtime
hero.setSrc('/sprites/hero-powered-up.png');
// hero.loaded becomes false until new image finishes loading
```

### Example — image gallery with opacity

```ts
const canvas = new Canvas('game');

const images = await AssetLoader.loadAssets({
  landscape: '/photos/landscape.png',
  portrait:  '/photos/portrait.png',
});

const bg = new GameImage(Point(0, 0), images.landscape);
bg.width  = 600;
bg.height = 400;

const overlay = new GameImage(Point(150, 50), images.portrait);
overlay.width   = 300;
overlay.height  = 300;
overlay.opacity = 0.7;

canvas.add(bg);
canvas.add(overlay);
```

---

## 17. Sprites & SpriteSheets

A **spritesheet** is a single image containing multiple frames arranged in a grid. `Sprite` draws one frame at a time, making it the building block for character animation.

### Creating a SpriteSheet

```
Your spritesheet image layout:
┌───┬───┬───┬───┐
│ 0 │ 1 │ 2 │ 3 │   row 0
├───┼───┼───┼───┤
│ 4 │ 5 │ 6 │ 7 │   row 1
└───┴───┴───┴───┘
Frames numbered left-to-right, top-to-bottom.
```

```ts
import { Sprite, AssetLoader, Point } from '@colon-dev/pivotx';

const img   = await AssetLoader.loadImage('/hero-sheet.png');
const sheet = Sprite.createSheet(img, 32, 32);  // each frame is 32×32 pixels

console.log(sheet.columns);     // auto-calculated from image width
console.log(sheet.totalFrames); // auto-calculated from image dimensions
```

If your sheet has unused cells at the end, specify the exact count:

```ts
const sheet = Sprite.createSheet(img, 64, 64, 12); // only first 12 frames
```

### Drawing a sprite

```ts
const hero   = new Sprite(Point(100, 200), sheet);
hero.frame   = 0;     // first frame
hero.scale   = 2;     // draw at 2× size
canvas.add(hero);
```

### Flipping and scaling

```ts
// Face left (mirror horizontally)
hero.flipX = true;

// Face right again
hero.flipX = false;

// Flip upside down
hero.flipY = true;

// Half-transparent ghost effect
hero.opacity = 0.5;
```

### Computed dimensions

```ts
// If frame is 32×32 and scale is 2:
console.log(hero.drawWidth);   // 64
console.log(hero.drawHeight);  // 64
```

### Example — cycling through frames manually

```ts
const canvas = new Canvas('game');
const img    = await AssetLoader.loadImage('/coins.png');
const sheet  = Sprite.createSheet(img, 16, 16);
const coin   = new Sprite(Point(200, 150), sheet);
coin.scale   = 3;

let timer = 0;

canvas.startLoop((dt) => {
  canvas.clear();

  timer += dt;
  if (timer > 0.15) {  // change frame every 150ms
    timer = 0;
    coin.frame = (coin.frame + 1) % sheet.totalFrames;
  }

  canvas.add(coin);
});
```

---

## 18. Sprite Animation with SpriteAnimator

Manually cycling frames works, but `SpriteAnimator` makes it much easier. Register named animation **clips** (e.g. "idle", "run", "jump"), then call `play()` to switch and `update(dt)` every frame.

### Basic setup

```ts
import { Sprite, SpriteAnimator, AssetLoader, Point } from '@colon-dev/pivotx';

const img    = await AssetLoader.loadImage('/hero-sheet.png');
const sheet  = Sprite.createSheet(img, 32, 32);
const hero   = new Sprite(Point(100, 200), sheet);
hero.scale   = 2;

const animator = new SpriteAnimator(hero);

// Register clips — addClip is chainable
animator
  .addClip('idle', { frames: [0, 1, 2, 3],    fps: 6,  loop: true  })
  .addClip('run',  { frames: [4, 5, 6, 7, 8], fps: 10, loop: true  })
  .addClip('jump', { frames: [9, 10],          fps: 4,  loop: false });

animator.play('idle');
```

### Using in the game loop

```ts
const canvas = new Canvas('game');

canvas.startLoop((dt) => {
  canvas.clear();

  animator.update(dt);   // advance the animation timer
  canvas.add(hero);      // draw the current frame
});
```

### Switching animations based on input

```ts
var keys = {};
document.addEventListener('keydown', (e) => { keys[e.key] = true;  });
document.addEventListener('keyup',   (e) => { keys[e.key] = false; });

canvas.startLoop((dt) => {
  canvas.clear();

  // Switch clip based on input
  if (keys['ArrowRight']) {
    hero.flipX = false;
    animator.play('run');  // only resets if not already playing 'run'
  } else if (keys['ArrowLeft']) {
    hero.flipX = true;
    animator.play('run');
  } else {
    animator.play('idle');
  }

  animator.update(dt);
  canvas.add(hero);
});
```

### Non-looping animations (attack, death, etc.)

```ts
animator.addClip('attack', { frames: [11, 12, 13, 14], fps: 12, loop: false });

// When player presses attack:
animator.play('attack');

// In the game loop, check when it finishes:
if (animator.isFinished) {
  animator.play('idle');  // return to idle after attack completes
}
```

### Checking animator state

```ts
animator.currentClip;  // "idle", "run", etc.
animator.isPlaying;    // true if actively playing
animator.isFinished;   // true if non-looping clip reached its last frame
animator.currentIndex; // current index within the clip's frames array
```

---

## 19. Parallax Scrolling Backgrounds

`TiledBackground` draws a repeating image that tiles seamlessly and supports parallax scrolling. Stack multiple layers for depth.

### Single scrolling background

```ts
import { TiledBackground, AssetLoader } from '@colon-dev/pivotx';

const skyImg = await AssetLoader.loadImage('/bg/sky.png');
const sky    = new TiledBackground(skyImg, 600, 400);  // canvas size

canvas.startLoop((dt) => {
  canvas.clear();
  sky.scroll(50 * dt);   // scroll 50 pixels per second
  canvas.add(sky);
});
```

### Multi-layer parallax

Create layers with different `parallaxFactor` values. Lower values scroll slower (further away):

```ts
const assets = await AssetLoader.loadAssets({
  sky:    '/bg/sky.png',      // distant sky
  hills:  '/bg/hills.png',    // mid-ground hills
  trees:  '/bg/trees.png',    // foreground trees
});

const sky   = new TiledBackground(assets.sky,   600, 400);
sky.parallaxFactor = 0.2;   // very slow — far away

const hills = new TiledBackground(assets.hills, 600, 400);
hills.parallaxFactor = 0.5; // medium speed

const trees = new TiledBackground(assets.trees, 600, 400);
trees.parallaxFactor = 1.0; // full speed — foreground

canvas.startLoop((dt) => {
  canvas.clear();

  const scrollSpeed = 80 * dt;
  sky.scroll(scrollSpeed);
  hills.scroll(scrollSpeed);
  trees.scroll(scrollSpeed);

  // Draw back-to-front
  canvas.add(sky);
  canvas.add(hills);
  canvas.add(trees);

  // Draw player and other objects on top
  canvas.add(playerSprite);
});
```

### Adjusting opacity

```ts
sky.opacity = 0.8;  // slightly transparent
```

### Vertical scrolling

```ts
sky.scroll(0, 30 * dt);  // scroll vertically instead of horizontally
```

---

## 20. Camera — Following the Player

The `Camera` class transforms the canvas context so the world scrolls while the player stays centred on screen. Anything drawn between `begin()` and `end()` moves with the camera; anything drawn after `end()` (like the HUD) stays fixed.

### Basic camera follow

```ts
import { Camera } from '@colon-dev/pivotx';

const camera = new Camera(600, 400);  // matches canvas size

canvas.startLoop((dt) => {
  canvas.clear();

  // Smoothly follow the player (lerp 0.08 = gentle smoothing)
  camera.follow(player.position, 0.08);

  camera.begin(canvas.ctx);

  // ── World space ──
  // Everything here scrolls with the camera
  canvas.add(tilemap);
  canvas.add(playerSprite);
  canvas.add(enemySprite);

  camera.end(canvas.ctx);

  // ── Screen space ──
  // Everything here stays fixed on screen
  canvas.add(scoreLabel);
  canvas.add(healthBar);
});
```

### Clamping to world boundaries

Prevent the camera from scrolling past the edges of your world:

```ts
camera.follow(player.position, 0.08);
camera.clamp(worldWidth, worldHeight);  // call AFTER follow
camera.begin(canvas.ctx);
```

### Zoom

```ts
camera.zoom = 2;    // 2× zoom in
camera.zoom = 0.5;  // zoom out to see more of the world
```

### Coordinate conversion

Convert between world and screen coordinates for mouse interaction:

```ts
// Mouse click → world position
canvasElement.addEventListener('click', (e) => {
  const rect = canvasElement.getBoundingClientRect();
  const screenPos = Point(e.clientX - rect.left, e.clientY - rect.top);
  const worldPos  = camera.screenToWorld(screenPos);
  console.log('Clicked at world position:', worldPos.x, worldPos.y);
});

// World position → screen position (for UI indicators)
const screenPos = camera.worldToScreen(enemy.position);
```

### Instant snap (no smoothing)

```ts
camera.follow(player.position);      // lerp defaults to 1 = instant
camera.follow(player.position, 1);   // same — instant snap
```

---

## 21. Platforms & AABB Collision

`Platform` is a rectangle shape with a built-in AABB `bounds` getter, designed for platformer games. Use the collision functions (`aabbOverlap`, `aabbOverlapDepth`, `createAABB`) for physics.

### Creating platforms

```ts
import { Platform, Point, aabbOverlap, aabbOverlapDepth, createAABB } from '@colon-dev/pivotx';

// Solid ground
const ground = new Platform(Point(0, 350), 600, 50);
ground.fillColor = '#4a7c59';

// Floating ledge (jump-through)
const ledge = new Platform(Point(200, 250), 120, 16);
ledge.oneWay    = true;
ledge.fillColor = '#8b5e3c';
```

### Creating player AABB

```ts
const playerBox = createAABB(player.x, player.y, player.width, player.height);
```

### Simple overlap check

```ts
if (aabbOverlap(playerBox, ground.bounds)) {
  console.log('Player is touching the ground!');
}
```

### Collision resolution with overlap depth

`aabbOverlapDepth` returns how deeply two boxes overlap, so you can push the player out:

```ts
const platforms = [ground, ledge];

for (const plat of platforms) {
  const depth = aabbOverlapDepth(playerBox, plat.bounds);
  if (!depth) continue;   // no overlap

  if (depth.y < depth.x) {
    // Vertical collision (landing or head bump)
    if (player.vy > 0) {
      // Landing — push player up
      player.y -= depth.y;
      player.vy = 0;
      player.grounded = true;
    } else if (!plat.oneWay) {
      // Head bump — push player down (skip for oneWay platforms)
      player.y += depth.y;
      player.vy = 0;
    }
  } else if (!plat.oneWay) {
    // Horizontal collision (wall) — skip for oneWay platforms
    if (player.vx > 0) {
      player.x -= depth.x;
    } else {
      player.x += depth.x;
    }
    player.vx = 0;
  }
}
```

### One-way platforms

When `oneWay` is `true`, the platform only collides when the player is falling down onto it from above. Your collision code should check this flag:

```ts
if (plat.oneWay && player.vy <= 0) {
  continue; // skip — player is moving upward or stationary
}
```

---

## 22. Tilemaps — Grid-Based Levels

`Tilemap` renders a 2D grid of tiles from a `SpriteSheet` and provides collision queries. Perfect for building levels.

### Building a tilemap

```ts
import { Tilemap, Sprite, AssetLoader, Point } from '@colon-dev/pivotx';

const tileImg = await AssetLoader.loadImage('/tiles/ground.png');
const sheet   = Sprite.createSheet(tileImg, 16, 16);

// Map data: each number is a frame index from the spritesheet.
// -1 means empty (air).
const mapData = [
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1,  0,  1,  1,  2, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [ 0,  1,  1,  1,  1,  1,  1,  1,  1,  2],
  [ 3,  4,  4,  4,  4,  4,  4,  4,  4,  5],
];

const tilemap = new Tilemap(sheet, mapData, 32); // 32px rendered tile size
```

### Defining solid tiles

Tell the tilemap which frame indices are solid for collision:

```ts
tilemap.solidTiles = new Set([0, 1, 2, 3, 4, 5]);
```

### Point-based collision check

Check if a specific world coordinate is on a solid tile:

```ts
// Is the point below the player's feet solid?
if (tilemap.isSolidAt(player.x + 16, player.y + 32)) {
  player.grounded = true;
  player.vy = 0;
}
```

### Region-based collision (recommended for physics)

Get all solid tile AABBs near the player for precise resolution:

```ts
const playerAABB = createAABB(player.x, player.y, 32, 32);
const nearbyTiles = tilemap.getSolidTilesInRegion(playerAABB);

for (const tileBox of nearbyTiles) {
  const depth = aabbOverlapDepth(playerAABB, tileBox);
  if (depth) {
    if (depth.y < depth.x) {
      if (player.vy > 0) {
        player.y -= depth.y;
        player.vy = 0;
      } else {
        player.y += depth.y;
        player.vy = 0;
      }
    } else {
      if (player.vx > 0) player.x -= depth.x;
      else                player.x += depth.x;
      player.vx = 0;
    }
    // Rebuild playerAABB after each resolution
    playerAABB.left   = player.x;
    playerAABB.right  = player.x + 32;
    playerAABB.top    = player.y;
    playerAABB.bottom = player.y + 32;
  }
}
```

### Modifying tiles at runtime

Use `setTile()` for breakable blocks, collectibles, or dynamic terrain:

```ts
// Remove a block when the player hits it from below
tilemap.setTile(col, row, -1);  // -1 = empty

// Replace with a different tile
tilemap.setTile(col, row, 6);   // frame index 6
```

### Tilemap dimensions

```ts
tilemap.rows;           // number of rows
tilemap.cols;           // number of columns
tilemap.tileSize;       // rendered tile size (32)
tilemap.widthInPixels;  // cols × tileSize
tilemap.heightInPixels; // rows × tileSize
```

### Using with Camera

```ts
const camera = new Camera(600, 400);

canvas.startLoop((dt) => {
  canvas.clear();

  camera.follow(player.position, 0.08);
  camera.clamp(tilemap.widthInPixels, tilemap.heightInPixels);
  camera.begin(canvas.ctx);

  canvas.add(tilemap);
  canvas.add(playerSprite);

  camera.end(canvas.ctx);
  canvas.add(hudLabel);
});
```

---

## 23. Example — Putting It All Together (Platformer)

This example combines all the new features into a simple side-scrolling platformer: asset loading, sprites, animation, tilemap collision, camera, and parallax backgrounds.

```ts
import {
  Canvas, Point, Label,
  AssetLoader, Sprite, SpriteAnimator,
  TiledBackground, Tilemap, Camera,
  createAABB, aabbOverlapDepth,
} from '@colon-dev/pivotx';

async function main() {
  // ── 1. Load assets ─────────────────────────────────────────────────────
  const assets = await AssetLoader.loadAssets({
    hero:    '/sprites/hero-32x32.png',
    tileset: '/tiles/tileset-16x16.png',
    sky:     '/bg/sky.png',
    hills:   '/bg/hills.png',
  });

  // ── 2. Create canvas & camera ──────────────────────────────────────────
  const canvas = new Canvas('game');
  const W = canvas.getWidth();
  const H = canvas.getHeight();
  const camera = new Camera(W, H);

  // ── 3. Parallax backgrounds ────────────────────────────────────────────
  const sky  = new TiledBackground(assets.sky, W, H);
  sky.parallaxFactor = 0.2;

  const hills = new TiledBackground(assets.hills, W, H);
  hills.parallaxFactor = 0.5;

  // ── 4. Tilemap ─────────────────────────────────────────────────────────
  const tileSheet = Sprite.createSheet(assets.tileset, 16, 16);

  const mapData = [
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1, 0, 1, 2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1, 0, 1, 2,-1,-1,-1,-1,-1, 0, 1, 1, 2,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [ 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [ 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5],
  ];

  const tilemap = new Tilemap(tileSheet, mapData, 32);
  tilemap.solidTiles = new Set([0, 1, 2, 3, 4, 5]);

  // ── 5. Player sprite + animation ───────────────────────────────────────
  const heroSheet  = Sprite.createSheet(assets.hero, 32, 32);
  const heroSprite = new Sprite(Point(64, 200), heroSheet);
  heroSprite.scale = 2;

  const animator = new SpriteAnimator(heroSprite);
  animator
    .addClip('idle', { frames: [0, 1, 2, 3],    fps: 6,  loop: true })
    .addClip('run',  { frames: [4, 5, 6, 7, 8], fps: 10, loop: true })
    .addClip('jump', { frames: [9, 10],          fps: 4,  loop: false });

  animator.play('idle');

  // ── 6. Player physics state ────────────────────────────────────────────
  const player = {
    x: 64, y: 200,
    vx: 0, vy: 0,
    width: 28, height: 56, // hitbox (smaller than visual sprite)
    speed: 200,
    jumpForce: -450,
    grounded: false,
  };
  const GRAVITY = 800;

  // ── 7. Input ───────────────────────────────────────────────────────────
  const keys: Record<string, boolean> = {};
  document.addEventListener('keydown', (e) => { keys[e.key] = true;  });
  document.addEventListener('keyup',   (e) => { keys[e.key] = false; });

  // ── 8. Game loop ───────────────────────────────────────────────────────
  canvas.startLoop((dt) => {
    canvas.clear();

    // ── Input ──
    player.vx = 0;
    if (keys['ArrowRight'] || keys['d']) { player.vx =  player.speed; heroSprite.flipX = false; }
    if (keys['ArrowLeft']  || keys['a']) { player.vx = -player.speed; heroSprite.flipX = true;  }
    if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.grounded) {
      player.vy = player.jumpForce;
      player.grounded = false;
    }

    // ── Gravity ──
    player.vy += GRAVITY * dt;

    // ── Move ──
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // ── Tilemap collision ──
    player.grounded = false;
    const pBox = createAABB(player.x, player.y, player.width, player.height);
    const nearby = tilemap.getSolidTilesInRegion(pBox);

    for (const tileBox of nearby) {
      const depth = aabbOverlapDepth(
        createAABB(player.x, player.y, player.width, player.height),
        tileBox,
      );
      if (!depth) continue;

      if (depth.y < depth.x) {
        if (player.vy > 0) {
          player.y -= depth.y;
          player.vy = 0;
          player.grounded = true;
        } else {
          player.y += depth.y;
          player.vy = 0;
        }
      } else {
        if (player.vx > 0) player.x -= depth.x;
        else                player.x += depth.x;
        player.vx = 0;
      }
    }

    // ── Animation ──
    if (!player.grounded) {
      animator.play('jump');
    } else if (player.vx !== 0) {
      animator.play('run');
    } else {
      animator.play('idle');
    }
    animator.update(dt);
    heroSprite.position = Point(player.x - 2, player.y - 4); // offset visual

    // ── Scroll parallax based on camera movement ──
    const scrollDelta = player.vx * dt;
    sky.scroll(scrollDelta);
    hills.scroll(scrollDelta);

    // ── Camera ──
    camera.follow({ x: player.x, y: player.y }, 0.08);
    camera.clamp(tilemap.widthInPixels, tilemap.heightInPixels);

    // ── Draw backgrounds (screen space) ──
    canvas.add(sky);
    canvas.add(hills);

    // ── Draw world (camera space) ──
    camera.begin(canvas.ctx);
    canvas.add(tilemap);
    canvas.add(heroSprite);
    camera.end(canvas.ctx);

    // ── HUD (screen space) ──
    const hud = new Label(
      'Arrow keys / WASD to move, Up / Space to jump',
      Point(W / 2, H - 16), '14px Arial',
    );
    hud.fillColor = 'rgba(255,255,255,0.5)';
    canvas.add(hud);
  });
}

main();
```

**How it works:**

1. **Asset loading** — all images load before the game starts, ensuring sprites are ready immediately.
2. **Parallax backgrounds** — sky scrolls slowly (0.2×), hills at half speed (0.5×), creating depth.
3. **Tilemap** — the level is defined as a 2D array. Solid tiles block the player.
4. **Sprite animation** — the animator switches between idle/run/jump clips based on state.
5. **Camera** — follows the player smoothly and clamps to the world boundaries.
6. **Collision** — `getSolidTilesInRegion` queries nearby solid tiles, `aabbOverlapDepth` resolves overlaps by pushing the player out along the smallest axis.