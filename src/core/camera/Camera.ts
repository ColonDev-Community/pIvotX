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

  // Screen-shake state
  private _shakeTime = 0;
  private _shakeDuration = 0;
  private _shakeIntensity = 0;
  private _shakeX = 0;
  private _shakeY = 0;

  // Smooth-zoom state
  private _zoomTarget: number | null = null;
  private _zoomSpeed = 0;

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
   * @param dt      Optional frame delta in seconds. When given, the smoothing
   *                becomes frame-rate independent (`lerp` means "per 1/60 s").
   */
  follow(target: IPoint, lerp: number = 1, dt?: number): void {
    const desiredX = target.x - this.viewportWidth  / (2 * this.zoom);
    const desiredY = target.y - this.viewportHeight / (2 * this.zoom);

    const factor = dt !== undefined
      ? 1 - Math.pow(1 - Math.min(lerp, 1), dt * 60)
      : lerp;

    this.position.x += (desiredX - this.position.x) * factor;
    this.position.y += (desiredY - this.position.y) * factor;
  }

  /**
   * Follow a target only when it leaves a central dead-zone box — the
   * classic platformer camera that ignores small movements.
   *
   * @param target      World position to keep inside the dead-zone.
   * @param zoneWidth   Dead-zone width in world pixels.
   * @param zoneHeight  Dead-zone height in world pixels.
   * @param lerp        Smoothing 0–1 (1 = hard push). Default 1.
   * @param dt          Optional frame delta for frame-rate-independent smoothing.
   */
  followWithDeadZone(
    target: IPoint,
    zoneWidth: number,
    zoneHeight: number,
    lerp: number = 1,
    dt?: number,
  ): void {
    const viewW = this.viewportWidth / this.zoom;
    const viewH = this.viewportHeight / this.zoom;
    const zoneLeft = this.position.x + (viewW - zoneWidth) / 2;
    const zoneRight = zoneLeft + zoneWidth;
    const zoneTop = this.position.y + (viewH - zoneHeight) / 2;
    const zoneBottom = zoneTop + zoneHeight;

    let dx = 0, dy = 0;
    if (target.x < zoneLeft) dx = target.x - zoneLeft;
    else if (target.x > zoneRight) dx = target.x - zoneRight;
    if (target.y < zoneTop) dy = target.y - zoneTop;
    else if (target.y > zoneBottom) dy = target.y - zoneBottom;

    const factor = dt !== undefined
      ? 1 - Math.pow(1 - Math.min(lerp, 1), dt * 60)
      : lerp;

    this.position.x += dx * factor;
    this.position.y += dy * factor;
  }

  /**
   * Shake the camera — explosions, hits, landings.
   * Requires `update(dt)` to be called once per frame.
   *
   * @param intensity  Maximum offset in pixels.
   * @param duration   Shake length in seconds. The shake eases out.
   */
  shake(intensity: number, duration: number = 0.3): void {
    this._shakeIntensity = intensity;
    this._shakeDuration = duration;
    this._shakeTime = duration;
  }

  /**
   * Animate the zoom level smoothly.
   * With no duration, zoom snaps immediately (no update() needed).
   * Requires `update(dt)` to be called once per frame when animated.
   *
   * @param zoom      Target zoom level.
   * @param duration  Seconds to reach it. Default 0 (instant).
   */
  setZoom(zoom: number, duration: number = 0): void {
    if (duration <= 0) {
      this.zoom = zoom;
      this._zoomTarget = null;
      return;
    }
    this._zoomTarget = zoom;
    this._zoomSpeed = (zoom - this.zoom) / duration;
  }

  /**
   * Advance shake decay and zoom animation.
   * Call once per frame (before begin()) if you use shake() or animated setZoom().
   */
  update(dt: number): void {
    // Shake
    if (this._shakeTime > 0) {
      this._shakeTime = Math.max(0, this._shakeTime - dt);
      const falloff = this._shakeDuration > 0 ? this._shakeTime / this._shakeDuration : 0;
      const amp = this._shakeIntensity * falloff;
      this._shakeX = (Math.random() * 2 - 1) * amp;
      this._shakeY = (Math.random() * 2 - 1) * amp;
    } else {
      this._shakeX = 0;
      this._shakeY = 0;
    }

    // Animated zoom
    if (this._zoomTarget !== null) {
      this.zoom += this._zoomSpeed * dt;
      const overshot = this._zoomSpeed > 0 ? this.zoom >= this._zoomTarget : this.zoom <= this._zoomTarget;
      if (overshot) {
        this.zoom = this._zoomTarget;
        this._zoomTarget = null;
      }
    }
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
    ctx.translate(-this.position.x + this._shakeX, -this.position.y + this._shakeY);
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
