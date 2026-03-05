import { IPoint, IDrawable } from '../types';

// ─── SpriteSheet ──────────────────────────────────────────────────────────────

/**
 * Describes a grid-based spritesheet image.
 *
 * Each cell in the grid is one "frame". Frames are numbered
 * left-to-right, top-to-bottom starting from 0.
 *
 * ```
 * ┌───┬───┬───┬───┐
 * │ 0 │ 1 │ 2 │ 3 │   row 0
 * ├───┼───┼───┼───┤
 * │ 4 │ 5 │ 6 │ 7 │   row 1
 * └───┴───┴───┴───┘
 * columns = 4, totalFrames = 8
 * ```
 */
export interface SpriteSheet {
  /** The loaded spritesheet image. */
  image:       HTMLImageElement;
  /** Width of a single frame in pixels. */
  frameWidth:  number;
  /** Height of a single frame in pixels. */
  frameHeight: number;
  /** Number of frames per row in the sheet. */
  columns:     number;
  /** Total number of usable frames. */
  totalFrames: number;
}

// ─── Sprite ───────────────────────────────────────────────────────────────────

/**
 * Draws a single frame from a SpriteSheet onto the canvas.
 *
 * Use `Sprite.createSheet()` to build a SpriteSheet from a loaded image,
 * then set `.frame` to pick which frame to display.
 *
 * @example
 * const img   = await AssetLoader.loadImage('/hero-sheet.png');
 * const sheet = Sprite.createSheet(img, 32, 32);
 * const hero  = new Sprite(Point(100, 200), sheet);
 * hero.frame  = 0;
 * hero.scale  = 2;
 * canvas.add(hero);
 */
export class Sprite implements IDrawable {
  readonly tag = 'sprite';

  /** Scale multiplier (1 = original size, 2 = double, etc.). */
  public scale:   number  = 1;
  /** Mirror horizontally (useful for facing left/right). */
  public flipX:   boolean = false;
  /** Mirror vertically. */
  public flipY:   boolean = false;
  /** Opacity from 0 (transparent) to 1 (opaque). */
  public opacity: number  = 1;
  /**
   * When `true`, disables image smoothing so scaled-up pixel art stays
   * crisp instead of blurry.  Defaults to `true`.
   */
  public pixelPerfect: boolean = true;

  private _frame: number = 0;

  constructor(
    /** Top-left draw position in world coordinates. */
    public position: IPoint,
    private _sheet:  SpriteSheet,
  ) {}

  /** Current frame index (wraps around if set beyond totalFrames). */
  get frame(): number { return this._frame; }
  set frame(f: number) {
    this._frame = ((f % this._sheet.totalFrames) + this._sheet.totalFrames) % this._sheet.totalFrames;
  }

  /** The SpriteSheet this sprite is using. */
  get sheet(): SpriteSheet { return this._sheet; }

  /** Rendered width (frameWidth × scale). */
  get drawWidth():  number { return this._sheet.frameWidth  * this.scale; }
  /** Rendered height (frameHeight × scale). */
  get drawHeight(): number { return this._sheet.frameHeight * this.scale; }

  /**
   * Build a SpriteSheet from a loaded HTMLImageElement.
   *
   * @param img          A fully loaded image (use AssetLoader.loadImage first).
   * @param frameWidth   Width of one frame in the sheet.
   * @param frameHeight  Height of one frame in the sheet.
   * @param totalFrames  Total usable frames. If omitted, calculated from image dimensions.
   *
   * @example
   * const sheet = Sprite.createSheet(heroImg, 32, 32);
   * const sheet = Sprite.createSheet(heroImg, 64, 64, 12); // only first 12 frames
   */
  static createSheet(
    img:         HTMLImageElement,
    frameWidth:  number,
    frameHeight: number,
    totalFrames?: number,
  ): SpriteSheet {
    const columns = Math.floor(img.naturalWidth / frameWidth);
    const rows    = Math.floor(img.naturalHeight / frameHeight);
    return {
      image:       img,
      frameWidth,
      frameHeight,
      columns,
      totalFrames: totalFrames ?? columns * rows,
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const s   = this._sheet;
    const col = this._frame % s.columns;
    const row = Math.floor(this._frame / s.columns);
    const sx  = col * s.frameWidth;
    const sy  = row * s.frameHeight;
    const dw  = s.frameWidth  * this.scale;
    const dh  = s.frameHeight * this.scale;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    if (this.pixelPerfect) {
      ctx.imageSmoothingEnabled = false;
    }

    // Translate to centre of the sprite for flip/scale transforms
    const cx = this.position.x + dw / 2;
    const cy = this.position.y + dh / 2;
    ctx.translate(cx, cy);
    ctx.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1);

    ctx.drawImage(
      s.image,
      sx, sy, s.frameWidth, s.frameHeight,   // source rect
      -dw / 2, -dh / 2, dw, dh,             // dest rect (centred)
    );

    ctx.restore();
  }
}
