import { AABB } from '../types';

// ─── AABB Collision Utilities ─────────────────────────────────────────────────

/**
 * Returns true if two axis-aligned bounding boxes overlap.
 *
 * @example
 * const playerBox: AABB = { left: 10, right: 42, top: 20, bottom: 52 };
 * if (aabbOverlap(playerBox, platform.bounds)) {
 *   // collision!
 * }
 */
export function aabbOverlap(a: AABB, b: AABB): boolean {
  return (
    a.left   < b.right  &&
    a.right  > b.left   &&
    a.top    < b.bottom &&
    a.bottom > b.top
  );
}

/**
 * Returns the overlap depth on each axis if two AABBs overlap,
 * or `null` if they don't overlap.
 *
 * The returned `x` and `y` values are always positive when overlapping.
 * Use the smaller axis to determine the minimum translation vector (MTV).
 *
 * @example
 * const depth = aabbOverlapDepth(playerBox, platform.bounds);
 * if (depth) {
 *   if (depth.y < depth.x) {
 *     // resolve vertically (landing or head bump)
 *     player.y -= depth.y;
 *     player.vy = 0;
 *   } else {
 *     // resolve horizontally (wall collision)
 *     player.x -= depth.x;
 *   }
 * }
 */
export function aabbOverlapDepth(a: AABB, b: AABB): { x: number; y: number } | null {
  const dx = Math.min(a.right - b.left, b.right - a.left);
  const dy = Math.min(a.bottom - b.top, b.bottom - a.top);

  if (dx <= 0 || dy <= 0) return null;
  return { x: dx, y: dy };
}

/**
 * Create an AABB from a position and dimensions.
 * Convenience helper so you don't have to do the math manually.
 *
 * @example
 * const playerBox = createAABB(player.x, player.y, 32, 32);
 */
export function createAABB(x: number, y: number, width: number, height: number): AABB {
  return {
    left:   x,
    right:  x + width,
    top:    y,
    bottom: y + height,
  };
}
