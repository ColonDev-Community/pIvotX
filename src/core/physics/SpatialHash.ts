// ─── SpatialHash ──────────────────────────────────────────────────────────────
//
// Uniform-grid broad-phase for many-object collision. Instead of testing
// every pair (O(n²)), insert objects each frame and query only the region
// you care about.
//
//   const hash = new SpatialHash(64);
//
//   canvas.startLoop((dt) => {
//     hash.clear();
//     for (const e of enemies) hash.insert(e, createAABB(e.x, e.y, e.w, e.h));
//
//     const nearby = hash.query(createAABB(player.x - 50, player.y - 50, 132, 132));
//     for (const e of nearby) { /* narrow-phase test against just these */ }
//   });
//

import { AABB } from '../types';

export class SpatialHash<T> {
  private _cells = new Map<string, T[]>();

  /**
   * @param cellSize  Grid cell size in pixels. Pick roughly the size of your
   *                  average object (too small = many cells per object,
   *                  too large = many objects per cell). Default 64.
   */
  constructor(public readonly cellSize: number = 64) {}

  private _cellsFor(bounds: AABB): string[] {
    const cs = this.cellSize;
    const x0 = Math.floor(bounds.left / cs);
    const x1 = Math.floor(bounds.right / cs);
    const y0 = Math.floor(bounds.top / cs);
    const y1 = Math.floor(bounds.bottom / cs);
    const keys: string[] = [];
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        keys.push(`${x},${y}`);
      }
    }
    return keys;
  }

  /** Insert an item covering the given bounds. */
  insert(item: T, bounds: AABB): void {
    for (const key of this._cellsFor(bounds)) {
      const cell = this._cells.get(key);
      if (cell) cell.push(item);
      else this._cells.set(key, [item]);
    }
  }

  /** All items whose cells overlap the region (deduplicated). */
  query(region: AABB): T[] {
    const seen = new Set<T>();
    for (const key of this._cellsFor(region)) {
      const cell = this._cells.get(key);
      if (!cell) continue;
      for (const item of cell) seen.add(item);
    }
    return [...seen];
  }

  /** Remove everything. Call at the start of each frame before re-inserting. */
  clear(): void {
    this._cells.clear();
  }

  /** Number of occupied cells (for debugging/tuning). */
  get cellCount(): number { return this._cells.size; }
}
