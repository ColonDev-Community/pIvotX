// ─── Shape collision & raycast helpers ────────────────────────────────────────
//
// Pure-math helpers complementing the AABB utilities: circles and rays.
//

import { IPoint } from '../types';
import { AABB } from '../types';

/** A circle for collision tests. */
export interface CollisionCircle {
  x: number;
  y: number;
  radius: number;
}

/** Result of a raycast hit. */
export interface RaycastHit {
  /** Distance along the ray (in units of the direction vector's length). */
  t: number;
  /** World-space hit point. */
  point: IPoint;
  /** Surface normal at the hit (unit axis-aligned vector). */
  normal: IPoint;
}

/** True if two circles overlap. */
export function circlesOverlap(a: CollisionCircle, b: CollisionCircle): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const r = a.radius + b.radius;
  return dx * dx + dy * dy < r * r;
}

/**
 * True if a circle overlaps an AABB.
 * Uses closest-point distance, so corners are handled correctly.
 */
export function circleAABBOverlap(circle: CollisionCircle, box: AABB): boolean {
  const cx = Math.max(box.left, Math.min(circle.x, box.right));
  const cy = Math.max(box.top, Math.min(circle.y, box.bottom));
  const dx = circle.x - cx;
  const dy = circle.y - cy;
  return dx * dx + dy * dy < circle.radius * circle.radius;
}

/**
 * Cast a ray against a circle.
 *
 * @param origin  Ray start point.
 * @param dir     Ray direction (t is measured in multiples of this vector).
 * @param center  Circle centre.
 * @param radius  Circle radius.
 * @param maxT    Only report hits with `t <= maxT`. Default Infinity.
 * @returns The nearest hit (entry point), or null.
 */
export function raycastCircle(
  origin: IPoint,
  dir: IPoint,
  center: IPoint,
  radius: number,
  maxT: number = Infinity,
): RaycastHit | null {
  // Solve |origin + t·dir - center|² = radius²
  const ox = origin.x - center.x;
  const oy = origin.y - center.y;
  const a = dir.x * dir.x + dir.y * dir.y;
  if (a === 0) return null;
  const b = 2 * (ox * dir.x + oy * dir.y);
  const c = ox * ox + oy * oy - radius * radius;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;

  const sqrtDisc = Math.sqrt(disc);
  let t = (-b - sqrtDisc) / (2 * a);       // entry point
  if (t < 0) t = (-b + sqrtDisc) / (2 * a); // origin inside: exit point
  if (t < 0 || t > maxT) return null;

  const point = { x: origin.x + dir.x * t, y: origin.y + dir.y * t };
  const nx = point.x - center.x;
  const ny = point.y - center.y;
  const len = Math.sqrt(nx * nx + ny * ny) || 1;
  return { t, point, normal: { x: nx / len, y: ny / len } };
}

/**
 * Sweep a moving circle against an AABB (continuous collision — no tunneling
 * at any speed). Equivalent to raycasting the circle's centre against the
 * box expanded by the radius (Minkowski sum with rounded corners).
 *
 * @param circle  The circle at its start position.
 * @param dir     Movement vector for the sweep (e.g. `{x: vx*dt, y: vy*dt}`);
 *                `t` in the result is a 0–1 fraction of this movement.
 * @param box     The AABB to test.
 * @returns The earliest hit along the movement, or null.
 *
 * @example
 * const hit = sweepCircleAABB(ball, { x: ball.vx * dt, y: ball.vy * dt }, wall.bounds);
 * if (hit) {
 *   ball.x += ball.vx * dt * hit.t;   // move up to the contact point
 *   ball.y += ball.vy * dt * hit.t;
 *   // reflect velocity off hit.normal for a bounce
 * }
 */
export function sweepCircleAABB(
  circle: CollisionCircle,
  dir: IPoint,
  box: AABB,
): RaycastHit | null {
  const origin = { x: circle.x, y: circle.y };
  const r = circle.radius;
  let best: RaycastHit | null = null;
  const consider = (hit: RaycastHit | null) => {
    if (hit && hit.t <= 1 && (!best || hit.t < best.t)) best = hit;
  };

  // Flat faces: box expanded on one axis at a time
  consider(raycastAABB(origin, dir, {
    left: box.left - r, right: box.right + r, top: box.top, bottom: box.bottom,
  }, 1));
  consider(raycastAABB(origin, dir, {
    left: box.left, right: box.right, top: box.top - r, bottom: box.bottom + r,
  }, 1));

  // Rounded corners: circles of radius r at each box corner
  consider(raycastCircle(origin, dir, { x: box.left, y: box.top }, r, 1));
  consider(raycastCircle(origin, dir, { x: box.right, y: box.top }, r, 1));
  consider(raycastCircle(origin, dir, { x: box.left, y: box.bottom }, r, 1));
  consider(raycastCircle(origin, dir, { x: box.right, y: box.bottom }, r, 1));

  return best;
}

/**
 * Push a circle out of an AABB it overlaps.
 * Returns the translation applied as `{ x, y }`, or null if not overlapping.
 * Mutates the circle's position.
 *
 * @example
 * for (const wall of walls) {
 *   circleAABBResolve(ball, wall.bounds);   // ball slides along walls
 * }
 */
export function circleAABBResolve(circle: CollisionCircle, box: AABB): IPoint | null {
  const cx = Math.max(box.left, Math.min(circle.x, box.right));
  const cy = Math.max(box.top, Math.min(circle.y, box.bottom));
  const dx = circle.x - cx;
  const dy = circle.y - cy;
  const distSq = dx * dx + dy * dy;

  if (distSq >= circle.radius * circle.radius) return null;

  if (distSq > 0) {
    // Centre outside the box: push along the closest-point normal
    const dist = Math.sqrt(distSq);
    const push = circle.radius - dist;
    const move = { x: (dx / dist) * push, y: (dy / dist) * push };
    circle.x += move.x;
    circle.y += move.y;
    return move;
  }

  // Centre inside the box: push out along the axis of least penetration
  const oL = circle.x - box.left;
  const oR = box.right - circle.x;
  const oT = circle.y - box.top;
  const oB = box.bottom - circle.y;
  const min = Math.min(oL, oR, oT, oB);
  let move: IPoint;
  if (min === oL) move = { x: -(oL + circle.radius), y: 0 };
  else if (min === oR) move = { x: oR + circle.radius, y: 0 };
  else if (min === oT) move = { x: 0, y: -(oT + circle.radius) };
  else move = { x: 0, y: oB + circle.radius };
  circle.x += move.x;
  circle.y += move.y;
  return move;
}

/**
 * Cast a ray against an AABB (slab method).
 *
 * @param origin  Ray start point.
 * @param dir     Ray direction (need not be normalized; `t` is measured in
 *                multiples of this vector, so with a unit vector `t` is pixels).
 * @param box     The AABB to test.
 * @param maxT    Only report hits with `t <= maxT`. Default Infinity.
 * @returns The nearest hit, or null.
 *
 * @example
 * // Line of sight: is there a wall within 300px toward the player?
 * const dir = Vec2.normalize(Vec2.sub(playerPos, enemyPos));
 * const hit = raycastAABB(enemyPos, dir, wallBounds, 300);
 * if (!hit) enemy.canSeePlayer = true;
 */
export function raycastAABB(
  origin: IPoint,
  dir: IPoint,
  box: AABB,
  maxT: number = Infinity,
): RaycastHit | null {
  let tMin = 0;
  let tMax = maxT;
  let normalAxis: 'x' | 'y' = 'x';
  let normalSign = 0;

  // X slab
  if (dir.x === 0) {
    if (origin.x < box.left || origin.x > box.right) return null;
  } else {
    const inv = 1 / dir.x;
    let t1 = (box.left - origin.x) * inv;
    let t2 = (box.right - origin.x) * inv;
    let sign = -1;
    if (t1 > t2) { [t1, t2] = [t2, t1]; sign = 1; }
    if (t1 > tMin) { tMin = t1; normalAxis = 'x'; normalSign = sign; }
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return null;
  }

  // Y slab
  if (dir.y === 0) {
    if (origin.y < box.top || origin.y > box.bottom) return null;
  } else {
    const inv = 1 / dir.y;
    let t1 = (box.top - origin.y) * inv;
    let t2 = (box.bottom - origin.y) * inv;
    let sign = -1;
    if (t1 > t2) { [t1, t2] = [t2, t1]; sign = 1; }
    if (t1 > tMin) { tMin = t1; normalAxis = 'y'; normalSign = sign; }
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return null;
  }

  if (tMin > maxT) return null;

  return {
    t: tMin,
    point: { x: origin.x + dir.x * tMin, y: origin.y + dir.y * tMin },
    normal: normalAxis === 'x'
      ? { x: normalSign, y: 0 }
      : { x: 0, y: normalSign },
  };
}
