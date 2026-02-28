/**
 * TypeScript usage example — src/game.ts
 *
 * Import directly from the ESM build or from the package root.
 * Full type safety, autocompletion, and compile-time checks.
 *
 * To compile:
 *   npx tsc src/game.ts --target ES2017 --lib ES2017,DOM --moduleResolution bundler
 */

import { Canvas, Circle, Rectangle, Line, Label, Point, IPoint } from 'pivotx';

// ── Types for your own game state ──────────────────────────────────────────────

interface Ball {
  pos:    IPoint;
  radius: number;
  vel:    IPoint;
  color:  string;
}

// ── Setup ──────────────────────────────────────────────────────────────────────

const canvas = new Canvas('game');
const W      = canvas.getWidth();
const H      = canvas.getHeight();

// ── Game state ─────────────────────────────────────────────────────────────────

const ball: Ball = {
  pos:    Point(W / 2, H / 2),
  radius: 24,
  vel:    Point(220, 160),
  color:  '#e94560',
};

const keys: Record<string, boolean> = {};
document.addEventListener('keydown', (e) => { keys[e.key] = true;  });
document.addEventListener('keyup',   (e) => { keys[e.key] = false; });

// ── Helper: draw a hand (for a clock, etc.) ────────────────────────────────────

function drawHand(from: IPoint, angleDeg: number, length: number, color: string, width: number): void {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  const to  = Point(
    from.x + Math.cos(rad) * length,
    from.y + Math.sin(rad) * length,
  );
  const hand       = new Line(from, to);
  hand.strokeColor = color;
  hand.lineWidth   = width;
  canvas.add(hand);
}

// ── Game loop ──────────────────────────────────────────────────────────────────

canvas.startLoop((dt: number) => {
  canvas.clear();

  // Background
  const bg      = new Rectangle(Point(0, 0), W, H);
  bg.fillColor  = '#1a1a2e';
  canvas.add(bg);

  // Move ball (keyboard control example)
  const speed = 250;
  if (keys['ArrowLeft'])  ball.vel.x = -speed;
  if (keys['ArrowRight']) ball.vel.x =  speed;
  if (keys['ArrowUp'])    ball.vel.y = -speed;
  if (keys['ArrowDown'])  ball.vel.y =  speed;

  ball.pos.x += ball.vel.x * dt;
  ball.pos.y += ball.vel.y * dt;

  // Clamp to bounds
  ball.pos.x = Math.max(ball.radius, Math.min(W - ball.radius, ball.pos.x));
  ball.pos.y = Math.max(ball.radius, Math.min(H - ball.radius, ball.pos.y));

  // Draw ball — TypeScript knows Circle.fillColor is string | null
  const circle       = new Circle(ball.pos, ball.radius);
  circle.fillColor   = ball.color;
  circle.strokeColor = 'white';
  circle.lineWidth   = 2;
  canvas.add(circle);

  // HUD
  const hud      = new Label('Arrow keys to move', Point(W / 2, H - 20), '14px Arial');
  hud.fillColor  = 'rgba(255,255,255,0.4)';
  canvas.add(hud);

  // TypeScript error example (caught at compile time, not runtime):
  // const bad = new Canvas(42);  // ← Error: Argument of type 'number' is not assignable to 'string'
  // circle.radius = "big";       // ← Error: Type 'string' is not assignable to type 'number'
});
