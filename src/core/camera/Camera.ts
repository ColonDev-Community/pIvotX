import { IPoint } from '../types';

// ─── Camera ───────────────────────────────────────────────────────────────────

/**
 * A 2D camera / viewport that translates and scales the canvas context.
 *
 * Use `begin(ctx)` before drawing world objects, and `end(ctx)` after.
 * Anything drawn after `end()` (e.g. HUD, score) is in screen space.
 *
 * @example
 * const camera = new Camera(600, 400);
 *
 * canvas.startLoop((dt) => {
 *   canvas.clear();
 *
 *   camera.follow(player.position, 0.08);
 *   camera.begin(canvas.ctx);
 *
 *   // Draw world objects — they scroll with the camera
 *   canvas.add(tilemap);
 *   canvas.add(playerSprite);
 *
 *   camera.end(canvas.ctx);
 *
 *   // Draw HUD — stays fixed on screen
 *   canvas.add(scoreLabel);
 * });
 */
export class Camera {
  /** Top-left corner of the viewport in world coordinates. */
  public position: IPoint = { x: 0, y: 0 };

  /** Zoom level. 1 = normal, 2 = 2× zoom in, 0.5 = zoomed out. */
  public zoom: number = 1;

  /**
   * @param viewportWidth   Width of the canvas / viewport in pixels.
   * @param viewportHeight  Height of the canvas / viewport in pixels.
   */
  constructor(
    public viewportWidth:  number,
    public viewportHeight: number,
  ) {}

  /**
   * Smoothly move the camera to centre on a target position.
   *
   * @param target  The world position to follow (e.g. player position).
   * @param lerp    Smoothing factor. 1 = instant snap, 0.05–0.15 = smooth follow.
   *                Defaults to 1 (instant).
   */
  follow(target: IPoint, lerp: number = 1): void {
    const desiredX = target.x - this.viewportWidth  / (2 * this.zoom);
    const desiredY = target.y - this.viewportHeight / (2 * this.zoom);

    this.position.x += (desiredX - this.position.x) * lerp;
    this.position.y += (desiredY - this.position.y) * lerp;
  }

  /**
   * Clamp the camera so it doesn't scroll past world boundaries.
   *
   * @param worldWidth   Total world width in pixels.
   * @param worldHeight  Total world height in pixels.
   */
  clamp(worldWidth: number, worldHeight: number): void {
    const maxX = worldWidth  - this.viewportWidth  / this.zoom;
    const maxY = worldHeight - this.viewportHeight / this.zoom;

    this.position.x = Math.max(0, Math.min(this.position.x, maxX));
    this.position.y = Math.max(0, Math.min(this.position.y, maxY));
  }

  /**
   * Apply the camera transform to the context.
   * Call this **before** drawing world objects.
   */
  begin(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.position.x, -this.position.y);
  }

  /**
   * Restore the context to screen space.
   * Call this **after** drawing world objects, before drawing HUD.
   */
  end(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }

  /**
   * Convert a world position to screen (canvas) coordinates.
   * Useful for hit-testing or drawing indicators at world positions.
   */
  worldToScreen(p: IPoint): IPoint {
    return {
      x: (p.x - this.position.x) * this.zoom,
      y: (p.y - this.position.y) * this.zoom,
    };
  }

  /**
   * Convert a screen (canvas) position to world coordinates.
   * Useful for converting mouse click positions to world positions.
   */
  screenToWorld(p: IPoint): IPoint {
    return {
      x: p.x / this.zoom + this.position.x,
      y: p.y / this.zoom + this.position.y,
    };
  }
}
