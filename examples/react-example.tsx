/**
 * React usage example — BouncingBallGame.tsx
 *
 * Shows three patterns:
 *  1. Static render — shape components drawn from props
 *  2. Animated render — useGameLoop + useRef for mutable state
 *  3. Custom hook — useBouncingBall for encapsulated game logic
 */

import React, { useRef, useState } from 'react';
import {
  PivotCanvas,
  PivotCircle,
  PivotRectangle,
  PivotLabel,
  PivotLine,
  useGameLoop,
} from 'pivotx/react';
import { Point } from 'pivotx';

// ─────────────────────────────────────────────────────────────────────────────
// Pattern 1 — Static Scene (pure JSX, no animation)
// ─────────────────────────────────────────────────────────────────────────────

export function StaticScene() {
  return (
    <PivotCanvas width={600} height={300} background="#87CEEB">
      {/* Ground */}
      <PivotRectangle position={{ x: 0, y: 220 }} width={600} height={80} fill="#8B6914" />

      {/* Sun */}
      <PivotCircle center={{ x: 520, y: 70 }} radius={45} fill="#FFD700" stroke="#FFA500" lineWidth={3} />

      {/* Tree trunk */}
      <PivotRectangle position={{ x: 270, y: 160 }} width={28} height={70} fill="#6B3A2A" />

      {/* Tree top */}
      <PivotCircle center={{ x: 284, y: 145 }} radius={55} fill="#228B22" />

      {/* Title */}
      <PivotLabel text="Static Scene — pure JSX props" position={{ x: 300, y: 24 }}
        font="bold 18px Arial" fill="#333" />
    </PivotCanvas>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pattern 2 — Animated Scene (useGameLoop + useRef)
//
// useRef holds mutable game state so updates don't trigger re-renders.
// useGameLoop runs the rAF loop and calls forceUpdate each frame.
// ─────────────────────────────────────────────────────────────────────────────

const W = 600, H = 400;

function useBouncingBall() {
  const ball = useRef({ x: W / 2, y: H / 2, vx: 220, vy: 160, r: 24 });

  // Force re-render each frame so child components see new values
  const [, setTick] = useState(0);

  useGameLoop((dt) => {
    const b  = ball.current;
    b.x     += b.vx * dt;
    b.y     += b.vy * dt;
    if (b.x - b.r < 0 || b.x + b.r > W) b.vx *= -1;
    if (b.y - b.r < 0 || b.y + b.r > H) b.vy *= -1;
    setTick(t => t + 1); // triggers re-render
  });

  return ball.current;
}

export function BouncingBallGame() {
  const ball = useBouncingBall();

  return (
    <PivotCanvas width={W} height={H} background="#1a1a2e">
      <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H} fill="#1a1a2e" />

      <PivotCircle
        center={{ x: ball.x, y: ball.y }}
        radius={ball.r}
        fill="#e94560"
        stroke="white"
        lineWidth={2}
      />

      <PivotLabel
        text={`x: ${Math.round(ball.x)}  y: ${Math.round(ball.y)}`}
        position={{ x: W / 2, y: 20 }}
        font="14px monospace"
        fill="rgba(255,255,255,0.6)"
      />
    </PivotCanvas>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pattern 3 — Keyboard-controlled player with score
// ─────────────────────────────────────────────────────────────────────────────

function useKeys(): React.MutableRefObject<Record<string, boolean>> {
  const keys = useRef<Record<string, boolean>>({});

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.key] = true;  };
    const up   = (e: KeyboardEvent) => { keys.current[e.key] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup',   up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup',   up);
    };
  }, []);

  return keys;
}

export function PlayerGame() {
  const player = useRef({ x: W / 2, y: H - 60, size: 30 });
  const score  = useRef(0);
  const keys   = useKeys();
  const [, setTick] = useState(0);

  useGameLoop((dt) => {
    const p     = player.current;
    const speed = 280;
    if (keys.current['ArrowLeft']  || keys.current['a']) p.x -= speed * dt;
    if (keys.current['ArrowRight'] || keys.current['d']) p.x += speed * dt;
    if (keys.current['ArrowUp']    || keys.current['w']) p.y -= speed * dt;
    if (keys.current['ArrowDown']  || keys.current['s']) p.y += speed * dt;

    const half = p.size / 2;
    p.x = Math.max(half, Math.min(W - half, p.x));
    p.y = Math.max(half, Math.min(H - half, p.y));

    score.current += dt * 10; // 10 points per second survived
    setTick(t => t + 1);
  });

  const p = player.current;

  return (
    <PivotCanvas width={W} height={H} background="#0f3460">
      {/* Player */}
      <PivotRectangle
        position={{ x: p.x - p.size / 2, y: p.y - p.size / 2 }}
        width={p.size}
        height={p.size}
        fill="#e94560"
        stroke="white"
        lineWidth={2}
      />

      {/* Score */}
      <PivotLabel
        text={`Score: ${Math.floor(score.current)}`}
        position={{ x: 10, y: 20 }}
        font="bold 18px Arial"
        fill="white"
        textAlign="left"
      />

      {/* Controls hint */}
      <PivotLabel
        text="WASD or Arrow Keys to move"
        position={{ x: W / 2, y: H - 16 }}
        font="13px Arial"
        fill="rgba(255,255,255,0.35)"
      />
    </PivotCanvas>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App — renders all three examples
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div style={{ padding: 24, background: '#111', minHeight: '100vh', color: 'white', fontFamily: 'Arial, sans-serif' }}>
      <h1>pIvotX React Examples</h1>

      <h2>1. Static Scene</h2>
      <StaticScene />

      <h2>2. Bouncing Ball (useGameLoop)</h2>
      <BouncingBallGame />

      <h2>3. Keyboard Player</h2>
      <PlayerGame />
    </div>
  );
}
