import { IPoint, IDrawable } from '../types';

// ─── GameImage ────────────────────────────────────────────────────────────────

/**
 * Draws a static image onto the canvas.
 *
 * Accepts either a pre-loaded HTMLImageElement or a URL string.
 * When a string is passed, the image loads automatically in the background;
 * `draw()` silently skips until the image is ready.
 *
 * For reliable loading, use `AssetLoader.loadImage()` or `AssetLoader.loadAssets()`
 * before creating the GameImage.
 *
 * @example
 * // With pre-loaded image (recommended)
 * const img = await AssetLoader.loadImage('/hero.png');
 * const hero = new GameImage(Point(100, 50), img);
 * hero.width = 64;
 * hero.height = 64;
 * canvas.add(hero);
 *
 * // With auto-loading (draws once loaded)
 * const bg = new GameImage(Point(0, 0), '/background.png');
 * canvas.add(bg); // skips until loaded
 */
export class GameImage implements IDrawable {
  readonly tag = 'image';

  /** Display width in pixels. `null` = use the image's natural width. */
  public width:    number | null = null;
  /** Display height in pixels. `null` = use the image's natural height. */
  public height:   number | null = null;
  /** Opacity from 0 (transparent) to 1 (opaque). */
  public opacity:  number = 1;
  /** Rotation in radians. Rotates around the image centre. */
  public rotation: number = 0;
  /**
   * When `true`, disables image smoothing so scaled-up pixel art stays
   * crisp instead of blurry.  Defaults to `false` (smooth scaling).
   */
  public pixelPerfect: boolean = false;

  private _img:    HTMLImageElement;
  private _loaded: boolean;

  /**
   * @param position  Top-left draw position.
   * @param source    A pre-loaded HTMLImageElement, or a URL string to auto-load.
   */
  constructor(
    public position: IPoint,
    source: HTMLImageElement | string,
  ) {
    if (typeof source === 'string') {
      this._img    = new Image();
      this._loaded = false;
      this._img.onload = () => { this._loaded = true; };
      this._img.src = source;
    } else {
      this._img    = source;
      this._loaded = source.complete && source.naturalWidth > 0;
    }
  }

  /** Returns true once the image is ready to draw. */
  get loaded(): boolean { return this._loaded; }

  /** The underlying HTMLImageElement. */
  get imageElement(): HTMLImageElement { return this._img; }

  /** Change the image source at runtime. Resets loaded state until new image loads. */
  setSrc(src: string): void {
    this._loaded = false;
    this._img = new Image();
    this._img.onload = () => { this._loaded = true; };
    this._img.src = src;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this._loaded) return;

    const w = this.width  ?? this._img.naturalWidth;
    const h = this.height ?? this._img.naturalHeight;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    if (this.pixelPerfect) {
      ctx.imageSmoothingEnabled = false;
    }

    if (this.rotation !== 0) {
      const cx = this.position.x + w / 2;
      const cy = this.position.y + h / 2;
      ctx.translate(cx, cy);
      ctx.rotate(this.rotation);
      ctx.drawImage(this._img, -w / 2, -h / 2, w, h);
    } else {
      ctx.drawImage(this._img, this.position.x, this.position.y, w, h);
    }

    ctx.restore();
  }
}
