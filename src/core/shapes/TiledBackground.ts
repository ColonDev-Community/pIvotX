import { IDrawable } from '../types';

// ─── TiledBackground ──────────────────────────────────────────────────────────

/**
 * Draws a repeating / scrollable tiled background image.
 *
 * Supports parallax scrolling — set `parallaxFactor` to values less than 1
 * for distant layers that scroll slower (e.g. 0.3 for a far mountain layer,
 * 0.6 for mid-ground trees, 1.0 for foreground).
 *
 * Stack multiple TiledBackground instances for multi-layer parallax.
 *
 * @example
 * const skyImg = await AssetLoader.loadImage('/bg/sky.png');
 * const sky    = new TiledBackground(skyImg, 600, 400);
 * sky.parallaxFactor = 0.3;
 *
 * const treesImg = await AssetLoader.loadImage('/bg/trees.png');
 * const trees    = new TiledBackground(treesImg, 600, 400);
 * trees.parallaxFactor = 0.6;
 *
 * canvas.startLoop((dt) => {
 *   canvas.clear();
 *   const scrollSpeed = 100 * dt;
 *   sky.scroll(scrollSpeed);
 *   trees.scroll(scrollSpeed);
 *   canvas.add(sky);
 *   canvas.add(trees);
 *   // ...draw player, etc.
 * });
 */
export class TiledBackground implements IDrawable {
  readonly tag = 'tiled-bg';

  /** Horizontal scroll offset in pixels. */
  public scrollX: number = 0;
  /** Vertical scroll offset in pixels. */
  public scrollY: number = 0;
  /** Opacity from 0 to 1. */
  public opacity: number = 1;
  /**
   * Parallax speed multiplier.
   * - 1.0 = scrolls at full speed (foreground).
   * - 0.5 = half speed (mid-ground).
   * - 0.2 = slow (distant background).
   */
  public parallaxFactor: number = 1;

  /**
   * @param image         A fully loaded tile image (use AssetLoader.loadImage).
   * @param canvasWidth   Width of the canvas / viewport.
   * @param canvasHeight  Height of the canvas / viewport.
   */
  constructor(
    private _image:        HTMLImageElement,
    private _canvasWidth:  number,
    private _canvasHeight: number,
  ) {}

  /** Update the canvas dimensions (e.g. on resize). */
  setViewport(width: number, height: number): void {
    this._canvasWidth  = width;
    this._canvasHeight = height;
  }

  /**
   * Advance the scroll offset. Call once per frame.
   * The `parallaxFactor` is applied automatically.
   *
   * @param dx  Horizontal scroll delta in pixels (before parallax).
   * @param dy  Vertical scroll delta in pixels (before parallax). Defaults to 0.
   */
  scroll(dx: number, dy: number = 0): void {
    this.scrollX += dx * this.parallaxFactor;
    this.scrollY += dy * this.parallaxFactor;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const iw = this._image.naturalWidth;
    const ih = this._image.naturalHeight;
    if (iw === 0 || ih === 0) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Wrap the offset so it stays within one tile's range
    const offsetX = -(((this.scrollX % iw) + iw) % iw);
    const offsetY = -(((this.scrollY % ih) + ih) % ih);

    // Tile across the full canvas
    for (let x = offsetX; x < this._canvasWidth; x += iw) {
      for (let y = offsetY; y < this._canvasHeight; y += ih) {
        ctx.drawImage(this._image, x, y);
      }
    }

    ctx.restore();
  }
}
