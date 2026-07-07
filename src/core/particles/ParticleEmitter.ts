// ─── ParticleEmitter ──────────────────────────────────────────────────────────
//
// Pooled particle system for explosions, dust, sparks, rain, pickups…
//
//   const sparks = new ParticleEmitter({
//     colors: ['#fbbf24', '#f97316', '#ef4444'],
//     speed: [80, 260],
//     life: [0.3, 0.8],
//     size: [2, 5],
//     gravity: 400,
//   });
//
//   sparks.burst(player.x, player.y, 24);   // one-off explosion
//   sparks.rate = 40; sparks.position = torch;  // or continuous emission
//
//   canvas.startLoop((dt) => {
//     canvas.clear();
//     sparks.update(dt);
//     sparks.draw(canvas.ctx);
//   });
//

import { IPoint, IDrawable, CSSColor } from '../types';

export interface ParticleOptions {
  /** Particle colours, picked randomly per particle. Default ['#fff']. */
  colors?: CSSColor[];
  /** [min, max] initial speed in px/sec. Default [50, 150]. */
  speed?: [number, number];
  /** Emission direction in radians. Default 0. */
  angle?: number;
  /** Spread around `angle` in radians. Default 2π (all directions). */
  spread?: number;
  /** [min, max] particle lifetime in seconds. Default [0.5, 1]. */
  life?: [number, number];
  /** [min, max] particle radius in px. Default [2, 4]. */
  size?: [number, number];
  /** Downward acceleration in px/sec². Default 0. */
  gravity?: number;
  /** Velocity damping per second (0 = none, 1 ≈ heavy drag). Default 0. */
  drag?: number;
  /** Fade particles out over their lifetime. Default true. */
  fade?: boolean;
  /** Shrink particles over their lifetime. Default false. */
  shrink?: boolean;
  /** Maximum simultaneously alive particles (pool size). Default 500. */
  max?: number;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
  color: CSSColor;
  alive: boolean;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export class ParticleEmitter implements IDrawable {
  readonly tag = 'particle-emitter';

  /** Emitter position for continuous emission (`rate > 0`). */
  public position: IPoint = { x: 0, y: 0 };
  /** Particles emitted per second (0 = burst-only). */
  public rate = 0;

  // Live-tweakable emission settings
  public colors: CSSColor[];
  public speed: [number, number];
  public angle: number;
  public spread: number;
  public life: [number, number];
  public size: [number, number];
  public gravity: number;
  public drag: number;
  public fade: boolean;
  public shrink: boolean;

  private _pool: Particle[] = [];
  private _emitAccumulator = 0;

  constructor(options: ParticleOptions = {}) {
    this.colors = options.colors ?? ['#fff'];
    this.speed = options.speed ?? [50, 150];
    this.angle = options.angle ?? 0;
    this.spread = options.spread ?? Math.PI * 2;
    this.life = options.life ?? [0.5, 1];
    this.size = options.size ?? [2, 4];
    this.gravity = options.gravity ?? 0;
    this.drag = options.drag ?? 0;
    this.fade = options.fade ?? true;
    this.shrink = options.shrink ?? false;

    const max = options.max ?? 500;
    for (let i = 0; i < max; i++) {
      this._pool.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 0, color: '#fff', alive: false });
    }
  }

  /** Number of currently alive particles. */
  get aliveCount(): number {
    let n = 0;
    for (const p of this._pool) if (p.alive) n++;
    return n;
  }

  /** Emit a burst of `count` particles at (x, y). */
  burst(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) this._spawn(x, y);
  }

  /** Kill all particles immediately. */
  clear(): void {
    for (const p of this._pool) p.alive = false;
  }

  private _spawn(x: number, y: number): void {
    const p = this._pool.find((q) => !q.alive);
    if (!p) return; // pool exhausted — drop the particle

    const dir = this.angle + (Math.random() - 0.5) * this.spread;
    const spd = rand(this.speed[0], this.speed[1]);
    p.x = x;
    p.y = y;
    p.vx = Math.cos(dir) * spd;
    p.vy = Math.sin(dir) * spd;
    p.maxLife = rand(this.life[0], this.life[1]);
    p.life = p.maxLife;
    p.size = rand(this.size[0], this.size[1]);
    p.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    p.alive = true;
  }

  /** Advance the simulation. Call once per frame. */
  update(dt: number): void {
    // Continuous emission
    if (this.rate > 0) {
      this._emitAccumulator += this.rate * dt;
      while (this._emitAccumulator >= 1) {
        this._emitAccumulator -= 1;
        this._spawn(this.position.x, this.position.y);
      }
    }

    const dragFactor = this.drag > 0 ? Math.max(0, 1 - this.drag * dt) : 1;
    for (const p of this._pool) {
      if (!p.alive) continue;
      p.life -= dt;
      if (p.life <= 0) { p.alive = false; continue; }
      p.vy += this.gravity * dt;
      p.vx *= dragFactor;
      p.vy *= dragFactor;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this._pool) {
      if (!p.alive) continue;
      const t = p.life / p.maxLife; // 1 → 0
      ctx.globalAlpha = this.fade ? t : 1;
      const r = this.shrink ? p.size * t : p.size;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
