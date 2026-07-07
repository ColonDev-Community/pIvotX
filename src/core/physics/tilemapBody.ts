// ─── Tilemap physics integration ──────────────────────────────────────────────

import { Tilemap } from '../tilemap/Tilemap';
import { PhysicsBody, StaticRect, StepOptions, CollisionResult, stepBody } from './body';

/**
 * Advance a physics body against a Tilemap's solid tiles.
 *
 * Broad-phase: only tiles near the body's swept path are collected (via
 * `getSolidTilesInRegion`), then the normal sub-stepped `stepBody` resolves
 * them — so even huge maps stay fast.
 *
 * @example
 * const hits = stepBodyOnTilemap(player, tilemap, dt, { gravity: 1400 });
 * if (player.grounded && Keyboard.justPressed('space')) player.vy = -520;
 */
export function stepBodyOnTilemap(
  body: PhysicsBody,
  tilemap: Tilemap,
  dt: number,
  options: StepOptions = {},
): CollisionResult[] {
  // Region covering the body plus everywhere it can move this frame (+1 tile margin)
  const cappedDt = Math.min(dt, 0.1);
  const margin = tilemap.tileSize;
  const moveX = Math.abs(body.vx * cappedDt);
  const moveY = Math.abs(body.vy * cappedDt) + Math.abs((options.gravity ?? 0) * cappedDt * cappedDt);

  const region = {
    left:   body.x - moveX - margin,
    right:  body.x + body.width + moveX + margin,
    top:    body.y - moveY - margin,
    bottom: body.y + body.height + moveY + margin,
  };

  const solids: StaticRect[] = tilemap.getSolidTilesInRegion(region).map((aabb) => ({
    x: aabb.left,
    y: aabb.top,
    w: aabb.right - aabb.left,
    h: aabb.bottom - aabb.top,
  }));

  return stepBody(body, solids, dt, options);
}
