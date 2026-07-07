// ─── UINineSlice ──────────────────────────────────────────────────────────────

import { IPoint } from '../types';
import { UIElement } from './UIElement';

/** Per-edge border widths for nine-slice scaling. */
export interface NineSliceBorder {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * A panel skinned from an image using nine-slice scaling: the four corners
 * stay unscaled, the edges stretch along one axis, and the centre stretches
 * both ways — so one small art asset skins any panel size without distortion.
 *
 * Use it as a decorative background behind other UI elements (add it to the
 * UIManager first so it draws underneath).
 *
 * @example
 * const skin = await AssetLoader.loadImage('/ui/panel.png');
 * const frame = new UINineSlice(skin, Point(180, 100), 280, 200, 12);
 * ui.add(frame);          // draws under later-added widgets
 *
 * // Optional source region (e.g. one panel style from a UI atlas)
 * frame.sourceRect = { x: 0, y: 0, w: 48, h: 48 };
 */
export class UINineSlice extends UIElement {
  readonly tag = 'ui-nineslice';

  /** Border widths in source-image pixels. */
  public border: NineSliceBorder;
  /** Disable smoothing for pixel-art skins. */
  public pixelPerfect = false;
  /** Opacity 0–1. */
  public opacity = 1;
  /**
   * Optional source region within the image (for UI atlases).
   * Defaults to the full image.
   */
  public sourceRect: { x: number; y: number; w: number; h: number } | null = null;

  /**
   * @param image     Loaded skin image.
   * @param position  Top-left position.
   * @param width     Rendered width.
   * @param height    Rendered height.
   * @param border    Border width in source pixels — a single number for all
   *                  four edges, or per-edge values.
   */
  constructor(
    private _image: HTMLImageElement,
    position: IPoint,
    width: number,
    height: number,
    border: number | NineSliceBorder = 8,
  ) {
    super(position, width, height);
    this.border = typeof border === 'number'
      ? { top: border, right: border, bottom: border, left: border }
      : border;
    this.enabled = false; // decorative by default — doesn't capture pointer input
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const img = this._image;
    if (!img.complete || img.naturalWidth === 0) return;

    const src = this.sourceRect ?? { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
    const b = this.border;
    const { x, y } = this.position;
    const w = this.width;
    const h = this.height;

    // Destination border sizes: clamp so tiny panels don't overlap slices
    const dl = Math.min(b.left, w / 2);
    const dr = Math.min(b.right, w / 2);
    const dt = Math.min(b.top, h / 2);
    const db = Math.min(b.bottom, h / 2);

    const scx = src.x, scy = src.y, scw = src.w, sch = src.h;
    const midSW = scw - b.left - b.right;   // source middle width
    const midSH = sch - b.top - b.bottom;   // source middle height
    const midDW = w - dl - dr;              // dest middle width
    const midDH = h - dt - db;              // dest middle height

    ctx.save();
    ctx.globalAlpha = this.opacity;
    if (this.pixelPerfect) ctx.imageSmoothingEnabled = false;

    const slice = (
      sx: number, sy: number, sw: number, sh: number,
      dx: number, dy: number, dw: number, dh: number,
    ) => {
      if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) return;
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    };

    // Corners
    slice(scx, scy, b.left, b.top,                                x, y, dl, dt);
    slice(scx + scw - b.right, scy, b.right, b.top,               x + w - dr, y, dr, dt);
    slice(scx, scy + sch - b.bottom, b.left, b.bottom,            x, y + h - db, dl, db);
    slice(scx + scw - b.right, scy + sch - b.bottom, b.right, b.bottom, x + w - dr, y + h - db, dr, db);

    // Edges
    slice(scx + b.left, scy, midSW, b.top,                        x + dl, y, midDW, dt);
    slice(scx + b.left, scy + sch - b.bottom, midSW, b.bottom,    x + dl, y + h - db, midDW, db);
    slice(scx, scy + b.top, b.left, midSH,                        x, y + dt, dl, midDH);
    slice(scx + scw - b.right, scy + b.top, b.right, midSH,       x + w - dr, y + dt, dr, midDH);

    // Centre
    slice(scx + b.left, scy + b.top, midSW, midSH,                x + dl, y + dt, midDW, midDH);

    ctx.restore();
  }
}
