// ─── Vec2 ─────────────────────────────────────────────────────────────────────
//
// Pure 2D vector math helpers operating on plain {x, y} objects (IPoint).
// All functions return NEW objects — inputs are never mutated.
//
//   import { Vec2 } from '@colon-dev/pivotx';
//   const dir = Vec2.normalize(Vec2.sub(target, player.position));
//   player.vx = dir.x * speed;
//

import { IPoint } from '../types';

export const Vec2 = {
  /** Create a vector. */
  of(x: number, y: number): IPoint { return { x, y }; },

  /** a + b */
  add(a: IPoint, b: IPoint): IPoint { return { x: a.x + b.x, y: a.y + b.y }; },

  /** a - b */
  sub(a: IPoint, b: IPoint): IPoint { return { x: a.x - b.x, y: a.y - b.y }; },

  /** v * s */
  scale(v: IPoint, s: number): IPoint { return { x: v.x * s, y: v.y * s }; },

  /** Dot product. */
  dot(a: IPoint, b: IPoint): number { return a.x * b.x + a.y * b.y; },

  /** Euclidean length. */
  length(v: IPoint): number { return Math.sqrt(v.x * v.x + v.y * v.y); },

  /** Squared length (cheaper for comparisons). */
  lengthSq(v: IPoint): number { return v.x * v.x + v.y * v.y; },

  /** Distance between two points. */
  distance(a: IPoint, b: IPoint): number {
    const dx = b.x - a.x, dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /** Unit vector in the same direction ({0,0} stays {0,0}). */
  normalize(v: IPoint): IPoint {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
  },

  /** Angle of the vector in radians (atan2). */
  angle(v: IPoint): number { return Math.atan2(v.y, v.x); },

  /** Unit vector pointing at `radians`. */
  fromAngle(radians: number): IPoint {
    return { x: Math.cos(radians), y: Math.sin(radians) };
  },

  /** Linear interpolation between a and b (t = 0..1). */
  lerp(a: IPoint, b: IPoint, t: number): IPoint {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  },

  /** Clamp the vector's length to `max`. */
  clampLength(v: IPoint, max: number): IPoint {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    if (len <= max || len === 0) return { x: v.x, y: v.y };
    const s = max / len;
    return { x: v.x * s, y: v.y * s };
  },

  /** Rotate the vector by `radians`. */
  rotate(v: IPoint, radians: number): IPoint {
    const c = Math.cos(radians), s = Math.sin(radians);
    return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
  },
};
