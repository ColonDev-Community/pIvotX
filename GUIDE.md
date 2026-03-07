# pIvotX — Complete Implementation Guide

From your first shape to a full animated game, step by step.

> **🌐 Website:** <https://pivotx.colondev.com/>  
> **🎮 Sample Games & Tutorials:** <https://pivotx.colondev.com/tutorials>  
> Learn by building — 8 complete games from beginner to advanced.

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
22. [Physics Body — Sub-Stepped Collision](#22-physics-body--sub-stepped-collision)
23. [Tilemaps — Grid-Based Levels](#23-tilemaps--grid-based-levels)
24. [Example — Putting It All Together (Platformer)](#24-example--putting-it-all-together-platformer)
25. [React Native / Expo — Getting Started](#25-react-native--expo--getting-started)
26. [PivotNativeCanvas — The Root Component](#26-pivotnativecanvas--the-root-component)
27. [Shape Components in React Native](#27-shape-components-in-react-native)
28. [useNativeGameLoop — The Animation Loop](#28-usenativegameloop--the-animation-loop)
29. [PivotNativeCamera — World Scrolling](#29-pivotnativecamera--world-scrolling)
30. [Touch Input & Keyboard Controls](#30-touch-input--keyboard-controls)
31. [Example — React Native Platformer](#31-example--react-native-platformer)

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

// For pixel art scaled up, disable smoothing:
hero.pixelPerfect = true;  // crisp edges instead of blurry
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

### Pixel-perfect rendering

By default, `Sprite` sets `pixelPerfect = true`, which disables the browser's image smoothing. This keeps small pixel art crisp when scaled up (e.g. 16×16 → 64×64). If you want smooth (bilinear) scaling instead, turn it off:

```ts
hero.pixelPerfect = false;  // smooth scaling (for high-res art)
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

## 22. Physics Body — Sub-Stepped Collision

In Section 21 you learned to resolve collisions manually with `aabbOverlapDepth`. That works well, but fast-moving bodies can **tunnel through thin platforms** — they move so far in one frame that they skip right past a 16-pixel ledge.

`stepBody` solves this by breaking each frame into **sub-steps**. It also handles gravity, friction, and collision resolution for you, returning a list of which platforms were hit and from which side.

### The interfaces

```ts
import { stepBody } from '@colon-dev/pivotx';
import type { PhysicsBody, StaticRect, StepOptions, CollisionResult } from '@colon-dev/pivotx';
```

A `PhysicsBody` is a plain object with position, velocity, and size:

```ts
const player: PhysicsBody = {
  x: 50, y: 200,
  vx: 0, vy: 0,
  width: 28, height: 32,
  grounded: false,
};
```

Platforms are `StaticRect` — simple `{ x, y, w, h }` objects:

```ts
const platforms: StaticRect[] = [
  { x: 0,   y: 350, w: 600, h: 50 },  // ground
  { x: 150, y: 250, w: 100, h: 16 },  // floating ledge
];
```

### Basic usage

```ts
const canvas = new Canvas('game');

const keys: Record<string, boolean> = {};
document.addEventListener('keydown', (e) => { keys[e.key] = true;  });
document.addEventListener('keyup',   (e) => { keys[e.key] = false; });

canvas.startLoop((dt) => {
  canvas.clear();

  // ── Input → velocity ──
  player.vx = 0;
  if (keys['ArrowRight'] || keys['d']) player.vx =  200;
  if (keys['ArrowLeft']  || keys['a']) player.vx = -200;
  if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.grounded) {
    player.vy = -400;
  }

  // ── Physics — one call does everything ──
  const hits = stepBody(player, platforms, dt, {
    gravity:  800,   // pixels/sec²
    friction: 0.9,   // slight horizontal drag
    maxStep:  8,     // sub-step size (smaller = more accurate)
  });

  // ── React to collisions ──
  for (const hit of hits) {
    if (hit.side === 'top') {
      // Landed on a platform — player.grounded is already true
    }
  }

  // ── Draw ──
  for (const p of platforms) {
    const rect = new Rectangle(Point(p.x, p.y), p.w, p.h);
    rect.fillColor = '#4a7c59';
    canvas.add(rect);
  }

  const pr = new Rectangle(Point(player.x, player.y), player.width, player.height);
  pr.fillColor = '#e94560';
  canvas.add(pr);
});
```

Compare this with Section 21 — the manual gravity, position updates, and collision loops are all replaced by a single `stepBody()` call.

### How sub-stepping works

`stepBody` calculates how far the body would travel in this frame (`speed × dt`). If that distance exceeds `maxStep` (default 8 pixels), it splits the frame into multiple smaller steps:

```
Frame dt = 0.016s, body speed = 600 px/s
→ distance = 600 × 0.016 = 9.6 px
→ 9.6 / 8 = 2 sub-steps (each moves ~4.8 px)
```

Each sub-step applies gravity, moves the body, and resolves collisions. This prevents the body from passing through platforms that are thinner than the per-frame movement distance.

### StepOptions

| Option | Type | Default | Description |
|---|---|---|---|
| `gravity` | `number` | `0` | Gravity in pixels/sec² (applied to `vy`) |
| `maxStep` | `number` | `8` | Max movement per sub-step in pixels |
| `friction` | `number` | `1` | Multiplier applied to `vx` each frame (0–1) |

### Reacting to specific collisions

`stepBody` returns a `CollisionResult[]` telling you which side of which platform was hit:

```ts
const hits = stepBody(player, platforms, dt, { gravity: 800 });

for (const hit of hits) {
  if (hit.side === 'top' && isLava(hit.platform)) {
    // Player landed on lava — take damage!
    player.health -= 1;
  }
  if (hit.side === 'left' || hit.side === 'right') {
    // Wall collision — could trigger wall-slide animation
  }
}
```

### Using with React Native

`stepBody` is a pure function — no DOM or canvas dependency. It's exported from all three entry points:

```ts
// From core
import { stepBody } from '@colon-dev/pivotx';

// From React
import { stepBody } from '@colon-dev/pivotx/react';

// From React Native
import { stepBody } from '@colon-dev/pivotx/react-native';
```

Typical React Native usage:

```tsx
const player = useRef<PhysicsBody>({ x: 50, y: 200, vx: 0, vy: 0, width: 24, height: 24, grounded: false });

useNativeGameLoop((dt) => {
  const p = player.current;
  // Set vx from input...
  stepBody(p, platforms, dt, { gravity: 800 });
  tick(n => n + 1);
});
```

### When to use `stepBody` vs manual collision

| Use `stepBody` | Use manual (`aabbOverlapDepth`) |
|---|---|
| Simple platformer with rectangular platforms | Complex collision with non-AABB shapes |
| Fast-moving bodies that might tunnel | Slow bodies where tunneling isn't a concern |
| Want gravity + friction handled for you | Need custom gravity per region |
| Want collision results (side + platform) | Need fine-grained per-axis resolution control |

Both approaches work — `stepBody` is a convenience that covers the common case.

---

## 23. Tilemaps — Grid-Based Levels

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

### Pixel-perfect tiles

Like `Sprite`, `Tilemap` defaults to `pixelPerfect = true` so pixel-art tiles stay crisp when the rendered `tileSize` is larger than the source frame size:

```ts
tilemap.pixelPerfect = false;  // opt into smooth scaling if needed
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

## 24. Example — Putting It All Together (Platformer)

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

---

## 25. React Native / Expo — Getting Started

Everything you've learned so far (shapes, sprites, cameras, physics) works on mobile too. The `pivotx/react-native` entry point provides JSX components that mirror the web React layer, plus hooks for game loops and touch input.

**How it works under the hood:**

- **iOS & Android:** `PivotNativeCanvas` renders a `<WebView>` containing an HTML5 Canvas with the full pIvotX engine. Your shape components register draw commands, which are JSON-serialized and injected into the WebView each frame.
- **Expo Web:** `PivotNativeCanvas` detects `Platform.OS === 'web'` and renders a plain `<canvas>` element directly — no WebView involved. Draw commands are executed synchronously on the canvas context.

You write the **same code** for all three platforms. The rendering path switches automatically.

### Setting up an Expo project

```bash
npx create-expo-app my-pivotx-game
cd my-pivotx-game
npm install @colon-dev/pivotx react-native-webview
npx expo install react-native-webview
```

> `react-native-webview` is only needed on native (iOS/Android). On Expo Web it's not loaded. pIvotX treats it as an optional peer dependency.

### Your first mobile game screen

```tsx
import { PivotNativeCanvas, PivotCircle, PivotLabel } from '@colon-dev/pivotx/react-native';

export default function GameScreen() {
  return (
    <PivotNativeCanvas width={400} height={300} background="#1a1a2e">
      <PivotCircle center={{ x: 200, y: 150 }} radius={40} fill="#e94560" stroke="white" lineWidth={3} />
      <PivotLabel text="Hello Mobile!" position={{ x: 200, y: 30 }} font="20px Arial" fill="white" />
    </PivotNativeCanvas>
  );
}
```

This renders a red circle with a label — identical output on iOS, Android, and web.

---

## 26. PivotNativeCanvas — The Root Component

`PivotNativeCanvas` is the root container for all native shape components. It replaces both `Canvas` (core) and `PivotCanvas` (React) when building for React Native / Expo.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `number` | `400` | Canvas width in pixels |
| `height` | `number` | `300` | Canvas height in pixels |
| `background` | `string` | `'#000'` | CSS background colour |
| `script` | `string` | — | Game code string (script mode — runs inside WebView) |
| `onGameEvent` | `(name, data?) => void` | — | Receive custom events from WebView game code |
| `onTouch` | `(action, touches) => void` | — | Touch/mouse events from the canvas |
| `style` | `object` | — | React Native view style for the wrapper |
| `children` | `ReactNode` | — | PivotNative\* shape components |

### Ref handle

Access the imperative API via `useRef`:

```tsx
import { useRef } from 'react';
import { PivotNativeCanvas, PivotNativeCanvasHandle } from '@colon-dev/pivotx/react-native';

const canvasRef = useRef<PivotNativeCanvasHandle>(null);

// Send data to the WebView game
canvasRef.current?.postMessage({ type: 'pause' });

// Execute raw JS inside the WebView
canvasRef.current?.injectScript('console.log("hello from RN")');
```

### JSX mode vs Script mode

There are two ways to build games:

**JSX mode** — shape components as children, state in React:
```tsx
<PivotNativeCanvas width={400} height={300}>
  <PivotCircle center={{ x, y: 150 }} radius={20} fill="gold" />
</PivotNativeCanvas>
```

**Script mode** — full game loop running inside the WebView (native only):
```tsx
<PivotNativeCanvas width={400} height={300} script={`
  var canvas = new PivotX.Canvas("game");
  canvas.startLoop(function(dt) {
    canvas.clear();
    // your full game here — uses core API directly
  });
`} />
```

JSX mode is recommended for most games. Script mode is useful when you want to run an existing vanilla JS pIvotX game inside a mobile app.

---

## 27. Shape Components in React Native

Every core shape has a matching native component. They work just like the React web components, with one important difference: **image-based components use `src: string` (URL) instead of `HTMLImageElement` or `SpriteSheet`**, because `HTMLImageElement` doesn't exist in React Native.

### Basic shapes

```tsx
import {
  PivotCircle, PivotRectangle, PivotLine, PivotLabel,
} from '@colon-dev/pivotx/react-native';
```

```tsx
<PivotCircle center={{ x: 100, y: 100 }} radius={30} fill="#e94560" stroke="white" lineWidth={2} />
<PivotRectangle position={{ x: 50, y: 200 }} width={100} height={60} fill="skyblue" />
<PivotLine start={{ x: 0, y: 0 }} end={{ x: 200, y: 150 }} stroke="crimson" lineWidth={2} />
<PivotLabel text="Score: 42" position={{ x: 10, y: 20 }} font="bold 18px Arial" fill="white" textAlign="left" />
```

### Images

```tsx
import { PivotImage } from '@colon-dev/pivotx/react-native';

<PivotImage
  src="https://example.com/hero.png"
  position={{ x: 100, y: 50 }}
  width={64}
  height={64}
  opacity={0.9}
  rotation={0.1}
  pixelPerfect
/>
```

### Sprites

Instead of creating a `SpriteSheet` object, you provide the spritesheet URL and frame dimensions directly:

```tsx
import { PivotSprite } from '@colon-dev/pivotx/react-native';

<PivotSprite
  sheetSrc="https://example.com/hero-sheet.png"
  frameWidth={32}
  frameHeight={32}
  position={{ x: 100, y: 200 }}
  frame={currentFrame}
  scale={2}
  flipX={facingLeft}
  pixelPerfect
/>
```

### Platforms

```tsx
import { PivotPlatform } from '@colon-dev/pivotx/react-native';

<PivotPlatform position={{ x: 0, y: 280 }} width={400} height={20} fill="#4a7c59" />
<PivotPlatform position={{ x: 150, y: 200 }} width={80} height={12} fill="#8b5e3c" oneWay />
```

### Tilemaps

```tsx
import { PivotTilemap } from '@colon-dev/pivotx/react-native';

const mapData = [
  [-1, -1, -1, -1, -1],
  [ 0,  1,  1,  1,  2],
  [ 3,  4,  4,  4,  5],
];

<PivotTilemap
  sheetSrc="https://example.com/tiles.png"
  frameWidth={16}
  frameHeight={16}
  mapData={mapData}
  tileSize={32}
  solidTiles={[0, 1, 2, 3, 4, 5]}
  pixelPerfect
/>
```

> Note: `solidTiles` accepts an array of numbers (not a `Set`) in the native components. This is because the values are serialized to JSON for the WebView bridge.

### Tiled backgrounds

```tsx
import { PivotTiledBackground } from '@colon-dev/pivotx/react-native';

<PivotTiledBackground
  src="https://example.com/sky.png"
  canvasWidth={400}
  canvasHeight={300}
  scrollX={scrollOffset}
  parallaxFactor={0.3}
  opacity={0.8}
/>
```

---

## 28. useNativeGameLoop — The Animation Loop

`useNativeGameLoop` is the React Native equivalent of `useGameLoop`. It runs a `requestAnimationFrame` loop for the lifetime of the component.

```tsx
import { useState } from 'react';
import {
  PivotNativeCanvas, PivotCircle, useNativeGameLoop,
} from '@colon-dev/pivotx/react-native';

export default function BouncingBall() {
  const [pos, setPos] = useState({ x: 200, y: 150, vx: 160, vy: 120 });

  useNativeGameLoop((dt) => {
    setPos(prev => {
      let { x, y, vx, vy } = prev;
      x += vx * dt;
      y += vy * dt;
      if (x < 20 || x > 380) vx *= -1;
      if (y < 20 || y > 280) vy *= -1;
      return { x, y, vx, vy };
    });
  });

  return (
    <PivotNativeCanvas width={400} height={300} background="#1a1a2e">
      <PivotCircle center={{ x: pos.x, y: pos.y }} radius={20} fill="#e94560" />
    </PivotNativeCanvas>
  );
}
```

### Using `useRef` for mutable state (recommended for complex games)

For games with lots of state (player position, velocity, scores, etc.), `useRef` avoids unnecessary React reconciliation:

```tsx
import { useState, useRef } from 'react';
import {
  PivotNativeCanvas, PivotRectangle, useNativeGameLoop,
} from '@colon-dev/pivotx/react-native';

export default function Game() {
  const player = useRef({ x: 200, y: 200, vx: 0, vy: 0 });
  const [, tick] = useState(0);

  useNativeGameLoop((dt) => {
    const p = player.current;
    p.vy += 800 * dt;     // gravity
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.y > 260) { p.y = 260; p.vy = 0; }
    tick(n => n + 1);     // trigger re-render
  });

  const p = player.current;
  return (
    <PivotNativeCanvas width={400} height={300} background="#1a1a2e">
      <PivotRectangle position={{ x: p.x, y: p.y }} width={24} height={24} fill="#e94560" />
    </PivotNativeCanvas>
  );
}
```

The `tick(n => n + 1)` pattern triggers a React re-render each frame so the shape props update. The actual game state lives in `useRef`, which is faster than `useState` for high-frequency updates.

---

## 29. PivotNativeCamera — World Scrolling

`PivotNativeCamera` wraps shapes in a camera transform. Shapes inside the camera move with the world; shapes outside stay fixed on screen (perfect for HUD elements).

```tsx
import {
  PivotNativeCanvas, PivotNativeCamera, PivotRectangle, PivotLabel,
} from '@colon-dev/pivotx/react-native';
```

### Basic usage

```tsx
<PivotNativeCanvas width={400} height={300} background="#1a1a2e">
  {/* World-space — scrolls with camera */}
  <PivotNativeCamera position={cameraPos}>
    <PivotRectangle position={{ x: 0, y: 260 }} width={2000} height={40} fill="#4a7c59" />
    <PivotRectangle position={{ x: player.x, y: player.y }} width={24} height={24} fill="#e94560" />
  </PivotNativeCamera>

  {/* Screen-space — stays fixed */}
  <PivotLabel text={`Score: ${score}`} position={{ x: 10, y: 20 }} fill="white" />
</PivotNativeCanvas>
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `position` | `IPoint` | — | Camera viewport top-left in world coordinates |
| `zoom` | `number` | `1` | Zoom level (2 = 2× zoom in) |
| `children` | `ReactNode` | — | World-space shapes |

### Camera follow pattern

In your game loop, calculate the camera position to follow the player:

```tsx
const player = useRef({ x: 100, y: 200, vx: 100, vy: 0 });
const cam    = useRef({ x: 0, y: 0 });
const [, tick] = useState(0);

useNativeGameLoop((dt) => {
  const p = player.current;
  p.x += p.vx * dt;

  // Smooth follow with lerp
  const lerp = 0.08;
  const targetX = p.x - 200;  // centre player on screen
  const targetY = p.y - 150;
  cam.current.x += (targetX - cam.current.x) * lerp;
  cam.current.y += (targetY - cam.current.y) * lerp;

  tick(n => n + 1);
});

// In JSX:
<PivotNativeCamera position={cam.current}>
  {/* world shapes */}
</PivotNativeCamera>
```

---

## 30. Touch Input & Keyboard Controls

### Touch input (mobile)

`PivotNativeCanvas` provides touch events via the `onTouch` prop. Touches are reported as `{ x, y, id }` relative to the canvas.

```tsx
const handleTouch = useCallback((action: string, touches: Array<{ x: number; y: number; id: number }>) => {
  if (action === 'start') {
    const touch = touches[0];
    // Divide canvas into zones: left third, right third, top half = jump
    const W = 400;
    if (touch.x < W / 3) {
      // move left
    } else if (touch.x > W * 2 / 3) {
      // move right
    } else {
      // jump
    }
  }
  if (action === 'end') {
    // stop moving
  }
}, []);

<PivotNativeCanvas width={400} height={300} onTouch={handleTouch}>
  {/* shapes */}
</PivotNativeCanvas>
```

Touch actions are `'start'`, `'move'`, and `'end'`. On Expo Web, both touch and mouse events are automatically handled, so the game works on desktop browsers too.

### Keyboard controls (Expo Web)

When running on Expo Web, you can add keyboard input for a better desktop experience. Use `Platform.OS` to only attach keyboard listeners on web:

```tsx
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export default function Game() {
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const onDown = (e: KeyboardEvent) => { keys.current[e.key] = true; };
    const onUp   = (e: KeyboardEvent) => { keys.current[e.key] = false; };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  useNativeGameLoop((dt) => {
    const p = player.current;
    if (keys.current['ArrowLeft']  || keys.current['a']) p.x -= 200 * dt;
    if (keys.current['ArrowRight'] || keys.current['d']) p.x += 200 * dt;
    if (keys.current['ArrowUp']    || keys.current['w']) {
      // jump
    }
    tick(n => n + 1);
  });

  // ...
}
```

### Combining touch and keyboard

For a game that works on both mobile and desktop:

```tsx
const input = useRef({ left: false, right: false, jump: false });

// Touch handler — zones
const handleTouch = useCallback((action: string, touches: Array<{ x: number; y: number }>) => {
  if (action === 'start' || action === 'move') {
    const t = touches[0];
    input.current.left  = t.x < 133;
    input.current.right = t.x > 267;
    input.current.jump  = t.y < 150;
  }
  if (action === 'end') {
    input.current.left = false;
    input.current.right = false;
    input.current.jump = false;
  }
}, []);

// Keyboard (web only)
useEffect(() => {
  if (Platform.OS !== 'web') return;
  const onDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') input.current.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') input.current.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') input.current.jump = true;
  };
  const onUp = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') input.current.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') input.current.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') input.current.jump = false;
  };
  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);
  return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
}, []);

// In game loop — works with both input methods
useNativeGameLoop((dt) => {
  if (input.current.left)  player.current.x -= 200 * dt;
  if (input.current.right) player.current.x += 200 * dt;
  if (input.current.jump)  { /* jump logic */ }
  tick(n => n + 1);
});
```

---

## 31. Example — React Native Platformer

A complete mini-platformer using the React Native components. This example uses JSX mode with `useNativeGameLoop`, camera follow, platform collision, and touch + keyboard input.

```tsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  PivotNativeCanvas, PivotNativeCamera,
  PivotRectangle, PivotPlatform, PivotCircle, PivotLabel,
  useNativeGameLoop, createAABB, aabbOverlapDepth,
} from '@colon-dev/pivotx/react-native';

// ── Level data ──────────────────────────────────────────────────────────────
const PLATFORMS = [
  { x: 0,   y: 280, w: 800, h: 20 },   // ground
  { x: 100, y: 220, w: 80,  h: 12 },   // ledge 1
  { x: 250, y: 180, w: 80,  h: 12 },   // ledge 2
  { x: 400, y: 140, w: 80,  h: 12 },   // ledge 3
];

const COINS = [
  { x: 130, y: 200 },
  { x: 280, y: 160 },
  { x: 430, y: 120 },
  { x: 550, y: 260 },
];

// ── Constants ───────────────────────────────────────────────────────────────
const W = 400, H = 300;
const GRAVITY = 800;
const PLAYER_SPEED = 180;
const JUMP_FORCE = -380;
const PLAYER_W = 20, PLAYER_H = 24;

export default function MobilePlatformer() {
  const player = useRef({ x: 50, y: 200, vx: 0, vy: 0, grounded: false });
  const cam = useRef({ x: 0, y: 0 });
  const coins = useRef([...COINS]);
  const score = useRef(0);
  const input = useRef({ left: false, right: false, jump: false });
  const [, tick] = useState(0);

  // ── Touch input ─────────────────────────────────────────────────────────
  const handleTouch = useCallback((action: string, touches: Array<{ x: number; y: number }>) => {
    if (action === 'start' || action === 'move') {
      const t = touches[0];
      input.current.left  = t.x < W / 3;
      input.current.right = t.x > W * 2 / 3;
      input.current.jump  = t.y < H / 2;
    }
    if (action === 'end') {
      input.current.left = false;
      input.current.right = false;
      input.current.jump = false;
    }
  }, []);

  // ── Keyboard (Expo Web only) ────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft'  || e.key === 'a') input.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') input.current.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') input.current.jump = true;
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft'  || e.key === 'a') input.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') input.current.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') input.current.jump = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // ── Game loop ───────────────────────────────────────────────────────────
  useNativeGameLoop((dt) => {
    const p = player.current;

    // Input → velocity
    p.vx = 0;
    if (input.current.left)  p.vx = -PLAYER_SPEED;
    if (input.current.right) p.vx =  PLAYER_SPEED;
    if (input.current.jump && p.grounded) {
      p.vy = JUMP_FORCE;
      p.grounded = false;
      input.current.jump = false;  // consume jump
    }

    // Gravity
    p.vy += GRAVITY * dt;

    // Move
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Platform collision
    p.grounded = false;
    const pBox = createAABB(p.x, p.y, PLAYER_W, PLAYER_H);

    for (const plat of PLATFORMS) {
      const platBox = createAABB(plat.x, plat.y, plat.w, plat.h);
      const depth = aabbOverlapDepth(pBox, platBox);
      if (!depth) continue;

      if (depth.y < depth.x) {
        if (p.vy > 0) {
          p.y -= depth.y;
          p.vy = 0;
          p.grounded = true;
        } else {
          p.y += depth.y;
          p.vy = 0;
        }
      } else {
        if (p.vx > 0) p.x -= depth.x;
        else           p.x += depth.x;
      }
      // Rebuild player box after resolution
      pBox.left   = p.x;
      pBox.right  = p.x + PLAYER_W;
      pBox.top    = p.y;
      pBox.bottom = p.y + PLAYER_H;
    }

    // Coin collection
    coins.current = coins.current.filter(c => {
      const dx = (p.x + PLAYER_W / 2) - c.x;
      const dy = (p.y + PLAYER_H / 2) - c.y;
      if (dx * dx + dy * dy < 20 * 20) {
        score.current += 10;
        return false;
      }
      return true;
    });

    // Fall off screen → reset
    if (p.y > 400) {
      p.x = 50; p.y = 200; p.vx = 0; p.vy = 0;
    }

    // Camera follow (smooth lerp)
    cam.current.x += ((p.x - W / 2) - cam.current.x) * 0.08;
    cam.current.y += ((p.y - H / 2 - 30) - cam.current.y) * 0.08;

    tick(n => n + 1);
  });

  const p = player.current;

  return (
    <PivotNativeCanvas width={W} height={H} background="#1a1a2e" onTouch={handleTouch}>
      <PivotNativeCamera position={cam.current}>
        {/* Platforms */}
        {PLATFORMS.map((plat, i) => (
          <PivotPlatform
            key={i}
            position={{ x: plat.x, y: plat.y }}
            width={plat.w}
            height={plat.h}
            fill="#4a7c59"
          />
        ))}

        {/* Coins */}
        {coins.current.map((c, i) => (
          <PivotCircle key={i} center={{ x: c.x, y: c.y }} radius={8} fill="gold" />
        ))}

        {/* Player */}
        <PivotRectangle
          position={{ x: p.x, y: p.y }}
          width={PLAYER_W}
          height={PLAYER_H}
          fill="#e94560"
          stroke="white"
          lineWidth={1}
        />
      </PivotNativeCamera>

      {/* HUD (screen space) */}
      <PivotLabel
        text={`Score: ${score.current}`}
        position={{ x: 10, y: 20 }}
        font="bold 16px Arial"
        fill="white"
        textAlign="left"
      />
      <PivotLabel
        text={Platform.OS === 'web' ? 'Arrow keys / WASD' : 'Tap left/right to move, top to jump'}
        position={{ x: W / 2, y: H - 12 }}
        font="12px Arial"
        fill="rgba(255,255,255,0.4)"
      />
    </PivotNativeCanvas>
  );
}
```

**How it works:**

1. **Platform detection** — `Platform.OS` from React Native selects touch zones (mobile) or keyboard listeners (web). Both feed the same `input` ref.
2. **Game loop** — `useNativeGameLoop` runs 60fps. Gravity, movement, and collision happen every frame using delta time.
3. **Collision** — `createAABB` and `aabbOverlapDepth` from the core physics module work in React Native too. They resolve overlaps by pushing along the smallest axis.
4. **Camera** — `PivotNativeCamera` wraps world-space shapes. The HUD labels sit outside the camera, so they stay fixed on screen.
5. **Coins** — simple circle-to-rect distance check. Collected coins are filtered out each frame.
6. **Cross-platform** — this exact code runs on iOS, Android, and Expo Web with no changes.