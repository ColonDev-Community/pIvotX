import { IDrawable, AABB } from '../types';
import { SpriteSheet } from '../shapes/Sprite';

// ─── Tilemap ──────────────────────────────────────────────────────────────────

/**
 * Draws a grid-based tile map from a SpriteSheet and 2D map data.
 *
 * Each cell in `mapData` is a frame index into the SpriteSheet.
 * Use -1 (or any negative number) for empty/air tiles.
 *
 * Works with Camera — apply camera transform before drawing.
 *
 * @example
 * const tilesetImg = await AssetLoader.loadImage('/tiles/ground.png');
 * const tileSheet  = Sprite.createSheet(tilesetImg, 16, 16);
 *
 * const mapData = [
 *   [-1, -1, -1, -1, -1, -1],
 *   [-1, -1, -1, -1, -1, -1],
 *   [ 0,  1,  1,  1,  1,  2],
 *   [ 3,  4,  4,  4,  4,  5],
 * ];
 *
 * const tilemap = new Tilemap(tileSheet, mapData, 32); // 32px rendered tile size
 * tilemap.solidTiles = new Set([0, 1, 2, 3, 4, 5]);   // all ground tiles are solid
 *
 * canvas.startLoop((dt) => {
 *   canvas.clear();
 *   canvas.add(tilemap);
 *
 *   // Collision check
 *   if (tilemap.isSolidAt(player.x, player.y + 32)) {
 *     // player is standing on solid ground
 *   }
 * });
 */
export class Tilemap implements IDrawable {
  readonly tag = 'tilemap';

  /**
   * Set of frame indices that are considered solid for collision.
   * Empty by default — you must populate this for `isSolidAt()` to work.
   */
  public solidTiles: Set<number> = new Set();

  /**
   * When `true`, disables image smoothing so pixel-art tiles stay crisp
   * when scaled up.  Defaults to `true`.
   */
  public pixelPerfect: boolean = true;

  /**
   * @param sheet     SpriteSheet containing the tile graphics.
   * @param mapData   2D array (rows × columns) of frame indices. -1 = empty.
   * @param tileSize  Rendered size of each tile in pixels (tiles are drawn as squares).
   */
  constructor(
    private _sheet:   SpriteSheet,
    private _mapData: number[][],
    private _tileSize: number,
  ) {}

  // ── Dimensions ────────────────────────────────────────────────────────────

  /** Number of rows in the map. */
  get rows(): number { return this._mapData.length; }

  /** Number of columns in the map. */
  get cols(): number { return this._mapData.length > 0 ? this._mapData[0].length : 0; }

  /** Total width of the map in pixels. */
  get widthInPixels(): number { return this.cols * this._tileSize; }

  /** Total height of the map in pixels. */
  get heightInPixels(): number { return this.rows * this._tileSize; }

  /** The rendered tile size. */
  get tileSize(): number { return this._tileSize; }

  /** The underlying map data (row-major). */
  get mapData(): number[][] { return this._mapData; }

  // ── Tile access ───────────────────────────────────────────────────────────

  /**
   * Get the frame index at a world coordinate.
   * Returns -1 if out of bounds or the tile is empty.
   *
   * @param worldX  X position in world pixels.
   * @param worldY  Y position in world pixels.
   */
  getTileAt(worldX: number, worldY: number): number {
    const col = Math.floor(worldX / this._tileSize);
    const row = Math.floor(worldY / this._tileSize);

    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return -1;
    const tile = this._mapData[row][col];
    return tile ?? -1;
  }

  /**
   * Set the frame index at a grid position. Use for runtime tile changes
   * (e.g. breakable blocks, pickups).
   *
   * @param col         Column index.
   * @param row         Row index.
   * @param frameIndex  New frame index, or -1 to clear the tile.
   */
  setTile(col: number, row: number, frameIndex: number): void {
    if (!Number.isInteger(row) || !Number.isInteger(col)) {
      console.warn('[Tilemap] setTile: row and col must be integers. Ignoring call.');
      return;
    }
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      console.warn(`[Tilemap] setTile: position (col=${col}, row=${row}) is out of bounds. Ignoring call.`);
      return;
    }
    this._mapData[row][col] = frameIndex;
  }

  /**
   * Check if the tile at a world coordinate is solid.
   * Returns true if the tile's frame index is in the `solidTiles` set.
   *
   * @param worldX  X position in world pixels.
   * @param worldY  Y position in world pixels.
   */
  isSolidAt(worldX: number, worldY: number): boolean {
    const tile = this.getTileAt(worldX, worldY);
    return tile >= 0 && this.solidTiles.has(tile);
  }

  /**
   * Get the AABB bounding box for a specific tile cell.
   * Useful for precise collision resolution against individual tiles.
   *
   * @param col  Column index.
   * @param row  Row index.
   */
  getTileBounds(col: number, row: number): AABB {
    return {
      left:   col * this._tileSize,
      right:  (col + 1) * this._tileSize,
      top:    row * this._tileSize,
      bottom: (row + 1) * this._tileSize,
    };
  }

  /**
   * Get AABBs for all solid tiles that overlap a given AABB region.
   * Useful for broad-phase collision — check only nearby solid tiles.
   *
   * @param region  An AABB in world coordinates to query.
   */
  getSolidTilesInRegion(region: AABB): AABB[] {
    const startCol = Math.max(0, Math.floor(region.left   / this._tileSize));
    const endCol   = Math.min(this.cols - 1, Math.floor(region.right  / this._tileSize));
    const startRow = Math.max(0, Math.floor(region.top    / this._tileSize));
    const endRow   = Math.min(this.rows - 1, Math.floor(region.bottom / this._tileSize));

    const results: AABB[] = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const tile = this._mapData[row][col];
        if (tile >= 0 && this.solidTiles.has(tile)) {
          results.push(this.getTileBounds(col, row));
        }
      }
    }
    return results;
  }

  // ── Drawing ───────────────────────────────────────────────────────────────

  draw(ctx: CanvasRenderingContext2D): void {
    const s  = this._sheet;
    const ts = this._tileSize;

    const prevSmoothing = ctx.imageSmoothingEnabled;
    if (this.pixelPerfect) {
      ctx.imageSmoothingEnabled = false;
    }

    for (let row = 0; row < this._mapData.length; row++) {
      const rowData = this._mapData[row];
      for (let col = 0; col < rowData.length; col++) {
        const frameIndex = rowData[col];
        if (frameIndex < 0) continue; // skip empty tiles

        // Source rect in the spritesheet
        const srcCol = frameIndex % s.columns;
        const srcRow = Math.floor(frameIndex / s.columns);
        const sx = srcCol * s.frameWidth;
        const sy = srcRow * s.frameHeight;

        // Dest rect on canvas
        const dx = col * ts;
        const dy = row * ts;

        ctx.drawImage(
          s.image,
          sx, sy, s.frameWidth, s.frameHeight,
          dx, dy, ts, ts,
        );
      }
    }

    ctx.imageSmoothingEnabled = prevSmoothing;
  }
}
