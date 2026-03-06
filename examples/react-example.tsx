/**
 * React usage example — BouncingBallGame.tsx
 *
 * Shows five patterns:
 *  1. Static render — shape components drawn from props
 *  2. Animated render — useGameLoop + useRef for mutable state
 *  3. Custom hook — useBouncingBall for encapsulated game logic
 *  4. Sprite animation — PivotSprite + PivotImage
 *  5. Platformer scene — PivotPlatform + PivotTilemap
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  PivotCanvas,
  PivotCircle,
  PivotRectangle,
  PivotLabel,
  PivotLine,
  PivotImage,
  PivotSprite,
  PivotPlatform,
  PivotTilemap,
  useGameLoop,
} from '@colon-dev/pivotx/react';
import {
  Point, AssetLoader, Sprite, SpriteAnimator,
} from '@colon-dev/pivotx';
import type { SpriteSheet } from '@colon-dev/pivotx';

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
// App — renders all five examples
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

      <h2>4. Sprite Animation (PivotSprite + PivotImage)</h2>
      <SpriteDemo />

      <h2>5. Platforms &amp; Tilemap</h2>
      <PlatformTilemapDemo />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pattern 4 — Sprite Animation (PivotSprite + PivotImage)
//
// Uses AssetLoader to preload a spritesheet, then animates
// with SpriteAnimator via useGameLoop.
// ─────────────────────────────────────────────────────────────────────────────

function SpriteDemo() {
  const [sheet, setSheet] = useState<SpriteSheet | null>(null);
  const frameRef = useRef(0);
  const animRef  = useRef<SpriteAnimator | null>(null);
  const [, setTick] = useState(0);

  // Load spritesheet once
  useEffect(() => {
    AssetLoader.loadImage('/assets/hero-sheet.png').then((img) => {
      const s = Sprite.createSheet(img, 16, 16, 10);
      setSheet(s);

      // Create a temporary Sprite just for the animator to drive frame numbers
      const tempSprite = new Sprite(Point(0, 0), s);
      const anim = new SpriteAnimator(tempSprite);
      anim
        .addClip('idle', { frames: [0, 1, 2, 3], fps: 5, loop: true })
        .addClip('run',  { frames: [4, 5, 6, 7], fps: 8, loop: true });
      anim.play('idle');
      animRef.current = anim;
    });
  }, []);

  useGameLoop((dt) => {
    if (!animRef.current) return;
    animRef.current.update(dt);
    // Read the frame the animator set on its internal sprite
    frameRef.current = animRef.current.currentIndex;
    setTick(t => t + 1);
  });

  if (!sheet) {
    return <p style={{ color: '#888' }}>Loading sprite assets…</p>;
  }

  // Determine frame from the animator's clip
  const clip = animRef.current;
  const activeFrames = clip?.currentClip === 'run' ? [4,5,6,7] : [0,1,2,3];
  const frame = activeFrames[frameRef.current % activeFrames.length];

  return (
    <PivotCanvas width={W} height={200} background="#1a1a2e">
      {/* Background image (auto-load from URL) */}
      <PivotImage
        src="/assets/sky-tile.png"
        position={{ x: 0, y: 0 }}
        width={W}
        height={200}
        opacity={0.6}
      />

      {/* Animated sprite — scaled up 4× */}
      <PivotSprite
        position={{ x: W / 2 - 32, y: 100 }}
        sheet={sheet}
        frame={frame}
        scale={4}
      />

      <PivotLabel
        text={`Clip: ${clip?.currentClip ?? '?'}  Frame: ${frame}`}
        position={{ x: W / 2, y: 20 }}
        font="14px monospace"
        fill="rgba(255,255,255,0.6)"
      />
    </PivotCanvas>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pattern 5 — Platforms + Tilemap
//
// Shows PivotPlatform (including oneWay) and PivotTilemap components.
// ─────────────────────────────────────────────────────────────────────────────

function PlatformTilemapDemo() {
  const [sheet, setSheet] = useState<SpriteSheet | null>(null);

  useEffect(() => {
    AssetLoader.loadImage('/assets/tileset.png').then((img) => {
      setSheet(Sprite.createSheet(img, 16, 16, 8));
    });
  }, []);

  if (!sheet) {
    return <p style={{ color: '#888' }}>Loading tileset…</p>;
  }

  const mapData: number[][] = [
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1, 0, 1, 2,-1,-1,-1,-1,-1, 7, 7,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [ 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [ 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
  ];

  return (
    <PivotCanvas width={W} height={240} background="#1a1a2e">
      {/* Tilemap */}
      <PivotTilemap
        sheet={sheet}
        mapData={mapData}
        tileSize={32}
        solidTiles={new Set([0, 1, 2, 4, 5, 6, 7])}
      />

      {/* Standalone platforms */}
      <PivotPlatform
        position={{ x: 40, y: 100 }}
        width={100}
        height={12}
        fill="#8b5e3c"
        stroke="#6b4226"
        lineWidth={1}
      />

      <PivotPlatform
        position={{ x: 300, y: 80 }}
        width={80}
        height={10}
        fill="#8b5e3c"
        oneWay={true}
      />

      <PivotLabel
        text="Tilemap + Platforms (brown ledges are oneWay)"
        position={{ x: W / 2, y: 14 }}
        font="12px Arial"
        fill="rgba(255,255,255,0.5)"
      />
    </PivotCanvas>
  );
}
