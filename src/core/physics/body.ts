// ─── Physics Body Helpers ─────────────────────────────────────────────────────
//
// Sub-stepped integrator and AABB platform collision resolver.
// Prevents tunneling for fast-moving bodies and thin platforms.
//

// ── Types ────────────────────────────────────────────────────────────────────

/** A physics body with position, velocity, and size. */
export interface PhysicsBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  grounded: boolean;
}

/** A solid rectangle that bodies collide with. */
export interface StaticRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Options for the physics step. */
export interface StepOptions {
  /** Gravity in pixels/sec² (applied to vy). Default: 0 */
  gravity?: number;
  /** Maximum movement per sub-step in pixels. Smaller = more accurate but slower.
   *  Default: 8 (half of a typical 16px platform). */
  maxStep?: number;
  /** Friction multiplier applied to vx each frame (0–1). Default: 1 (no friction). */
  friction?: number;
}

/** Result of a collision resolution. */
export interface CollisionResult {
  /** Which side of the platform was hit. */
  side: 'top' | 'bottom' | 'left' | 'right';
  /** The platform that was hit. */
  platform: StaticRect;
}

// ── Sub-stepped physics integrator ───────────────────────────────────────────

/**
 * Advance a physics body by `dt` seconds using sub-stepping to prevent
 * tunneling through thin platforms.
 *
 * Applies gravity, friction, and resolves collisions against the given
 * static rectangles. Modifies `body` in place and returns an array of
 * collisions that occurred.
 *
 * @example
 * ```ts
 * import { stepBody } from '@colon-dev/pivotx/react-native';
 *
 * const player: PhysicsBody = { x: 50, y: 100, vx: 0, vy: 0, width: 32, height: 32, grounded: false };
 * const platforms: StaticRect[] = [{ x: 0, y: 400, w: 800, h: 40 }];
 *
 * useNativeGameLoop((dt) => {
 *   const hits = stepBody(player, platforms, dt, { gravity: 1400, friction: 0.85 });
 *   // hits tells you which platforms & sides were touched
 * });
 * ```
 */
export function stepBody(
  body: PhysicsBody,
  platforms: StaticRect[],
  dt: number,
  options: StepOptions = {},
): CollisionResult[] {
  const { gravity = 0, maxStep = 8, friction = 1 } = options;

  // Cap dt to prevent spiral of death
  if (dt > 0.1) dt = 0.1;

  // Apply friction
  body.vx *= friction;

  // Calculate sub-steps needed
  const speed = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
  const steps = Math.max(1, Math.ceil(speed * dt / maxStep));
  const subDt = dt / steps;

  const collisions: CollisionResult[] = [];
  body.grounded = false;

  for (let step = 0; step < steps; step++) {
    // Apply gravity per sub-step
    body.vy += gravity * subDt;

    // Integrate position
    body.x += body.vx * subDt;
    body.y += body.vy * subDt;

    // Resolve collisions
    const hits = resolveCollisions(body, platforms);
    for (const hit of hits) {
      collisions.push(hit);
    }
  }

  return collisions;
}

// ── Collision resolution ─────────────────────────────────────────────────────

/**
 * Resolve collisions between a body and static rectangles using
 * minimum translation vector (MTV) approach.
 *
 * Modifies `body` in place. Returns which platforms/sides were hit.
 */
export function resolveCollisions(
  body: PhysicsBody,
  platforms: StaticRect[],
): CollisionResult[] {
  const results: CollisionResult[] = [];

  for (const pl of platforms) {
    if (
      body.x + body.width > pl.x && body.x < pl.x + pl.w &&
      body.y + body.height > pl.y && body.y < pl.y + pl.h
    ) {
      const oL = (body.x + body.width) - pl.x;
      const oR = (pl.x + pl.w) - body.x;
      const oT = (body.y + body.height) - pl.y;
      const oB = (pl.y + pl.h) - body.y;
      const min = Math.min(oL, oR, oT, oB);

      if (min === oT && body.vy >= 0) {
        body.y = pl.y - body.height;
        body.vy = 0;
        body.grounded = true;
        results.push({ side: 'top', platform: pl });
      } else if (min === oB && body.vy < 0) {
        body.y = pl.y + pl.h;
        body.vy = 0;
        results.push({ side: 'bottom', platform: pl });
      } else if (min === oL) {
        body.x = pl.x - body.width;
        body.vx = 0;
        results.push({ side: 'left', platform: pl });
      } else if (min === oR) {
        body.x = pl.x + pl.w;
        body.vx = 0;
        results.push({ side: 'right', platform: pl });
      }
    }
  }

  return results;
}
