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
  /**
   * Jump-through platform: only collides when the body lands on it from
   * above while falling. Matches `Platform.oneWay`.
   */
  oneWay?: boolean;
  /**
   * Moving platform velocity in px/sec. When set, stepBody advances the
   * platform's position each step and carries bodies standing on it.
   */
  vx?: number;
  /** Moving platform vertical velocity in px/sec (positive = down). */
  vy?: number;
}

/** Options for the physics step. */
export interface StepOptions {
  /** Gravity in pixels/sec² (applied to vy). Default: 0 */
  gravity?: number;
  /** Maximum movement per sub-step in pixels. Smaller = more accurate but slower.
   *  Default: 8 (half of a typical 16px platform). */
  maxStep?: number;
  /**
   * Friction multiplier applied to vx (0–1). Frame-rate independent —
   * the value describes the multiplier per 1/60 s, so behaviour is identical
   * at any fps. Default: 1 (no friction).
   */
  friction?: number;
  /** Terminal falling velocity in pixels/sec (caps vy). Default: unlimited. */
  maxFallSpeed?: number;
  /**
   * Restitution 0–1: how much velocity is kept (reversed) on impact.
   * 0 = dead stop (default), 0.6 = bouncy ball, 1 = perfect bounce.
   * Tiny rebounds (< 20 px/s) settle to rest so bodies still ground.
   */
  bounce?: number;
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
 * static rectangles. Rectangles with `oneWay: true` only collide when the
 * body falls onto them from above. Rectangles with `vx`/`vy` are moving
 * platforms — stepBody advances their position automatically and carries
 * bodies standing on them. Modifies `body` (and moving platforms) in place
 * and returns an array of collisions that occurred.
 *
 * @example
 * ```ts
 * import { stepBody } from '@colon-dev/pivotx';
 *
 * const player: PhysicsBody = { x: 50, y: 100, vx: 0, vy: 0, width: 32, height: 32, grounded: false };
 * const platforms: StaticRect[] = [
 *   { x: 0, y: 400, w: 800, h: 40 },
 *   { x: 200, y: 300, w: 120, h: 16, oneWay: true },  // jump-through ledge
 * ];
 *
 * useGameLoop((dt) => {
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
  const { gravity = 0, maxStep = 8, friction = 1, maxFallSpeed, bounce = 0 } = options;

  // Cap dt to prevent spiral of death
  if (dt > 0.1) dt = 0.1;

  // Apply friction, normalised to a per-1/60s multiplier so it is
  // frame-rate independent (identical to the old behaviour at 60 fps)
  if (friction !== 1) {
    body.vx *= Math.pow(friction, dt * 60);
  }

  // Calculate sub-steps needed
  const speed = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
  const steps = Math.max(1, Math.ceil(speed * dt / maxStep));
  const subDt = dt / steps;

  const collisions: CollisionResult[] = [];
  body.grounded = false;

  for (let step = 0; step < steps; step++) {
    // Advance moving platforms, carrying any body standing on one
    for (const pl of platforms) {
      if (!pl.vx && !pl.vy) continue;
      const standingOn =
        body.y + body.height <= pl.y + 1 &&
        body.y + body.height >= pl.y - 1 &&
        body.x + body.width > pl.x && body.x < pl.x + pl.w;
      pl.x += (pl.vx ?? 0) * subDt;
      pl.y += (pl.vy ?? 0) * subDt;
      if (standingOn) {
        body.x += (pl.vx ?? 0) * subDt;
        body.y += (pl.vy ?? 0) * subDt;
      }
    }

    // Apply gravity per sub-step
    body.vy += gravity * subDt;
    if (maxFallSpeed !== undefined && body.vy > maxFallSpeed) {
      body.vy = maxFallSpeed;
    }

    // Integrate position, remembering where the body came from
    const prevBottom = body.y + body.height;
    body.x += body.vx * subDt;
    body.y += body.vy * subDt;

    // Resolve collisions
    const hits = resolveCollisions(body, platforms, prevBottom, bounce);
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
 * Rectangles with `oneWay: true` only collide when the body is moving
 * downward and its bottom edge was above the platform top before the move
 * (pass `prevBottom`; without it, one-way collision falls back to an
 * overlap-depth heuristic).
 *
 * Modifies `body` in place. Returns which platforms/sides were hit.
 */
export function resolveCollisions(
  body: PhysicsBody,
  platforms: StaticRect[],
  prevBottom?: number,
  bounce: number = 0,
): CollisionResult[] {
  const results: CollisionResult[] = [];
  // Rebounds slower than this settle to rest (prevents infinite micro-bounces)
  const restThreshold = 20;
  const reboundY = (vy: number) => {
    const r = -vy * bounce;
    return Math.abs(r) < restThreshold ? 0 : r;
  };
  const reboundX = (vx: number) => {
    const r = -vx * bounce;
    return Math.abs(r) < restThreshold ? 0 : r;
  };

  for (const pl of platforms) {
    if (
      body.x + body.width > pl.x && body.x < pl.x + pl.w &&
      body.y + body.height > pl.y && body.y < pl.y + pl.h
    ) {
      const oL = (body.x + body.width) - pl.x;
      const oR = (pl.x + pl.w) - body.x;
      const oT = (body.y + body.height) - pl.y;
      const oB = (pl.y + pl.h) - body.y;

      if (pl.oneWay) {
        // Jump-through: only land on it while falling from above
        const cameFromAbove = prevBottom !== undefined
          ? prevBottom <= pl.y + 0.001
          : oT <= Math.min(oL, oR, oB);
        if (body.vy >= 0 && cameFromAbove) {
          body.y = pl.y - body.height;
          body.vy = reboundY(body.vy);
          if (body.vy === 0) body.grounded = true;
          results.push({ side: 'top', platform: pl });
        }
        continue;
      }

      const min = Math.min(oL, oR, oT, oB);

      if (min === oT && body.vy >= 0) {
        body.y = pl.y - body.height;
        body.vy = reboundY(body.vy);
        if (body.vy === 0) body.grounded = true;
        results.push({ side: 'top', platform: pl });
      } else if (min === oB && body.vy < 0) {
        body.y = pl.y + pl.h;
        body.vy = reboundY(body.vy);
        results.push({ side: 'bottom', platform: pl });
      } else if (min === oL) {
        body.x = pl.x - body.width;
        body.vx = reboundX(body.vx);
        results.push({ side: 'left', platform: pl });
      } else if (min === oR) {
        body.x = pl.x + pl.w;
        body.vx = reboundX(body.vx);
        results.push({ side: 'right', platform: pl });
      }
    }
  }

  return results;
}
