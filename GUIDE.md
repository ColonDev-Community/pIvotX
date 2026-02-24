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