// ─── UIProgressBar ────────────────────────────────────────────────────────────

import { IPoint, CSSColor } from '../types';
import { UIElement } from './UIElement';
import { roundRectPath } from './utils';

/**
 * A horizontal progress / health / loading bar.
 *
 * @example
 * const hp = new UIProgressBar(Point(16, 16), 200, 20, {
 *   fill: '#22c55e', background: '#374151', label: 'HP',
 * });
 * hp.value = 0.75;   // 75 %
 * ui.add(hp);
 */
export class UIProgressBar extends UIElement {
  readonly tag = 'ui-progressbar';

  private _value = 1;

  /** Track colour. */
  public background: CSSColor;
  /** Filled portion colour. */
  public fill: CSSColor;
  /** Optional border colour. */
  public borderColor: CSSColor | null;
  public borderWidth: number;
  /** Corner radius. */
  public radius: number;
  /** Optional text drawn centred on the bar (e.g. 'HP' or '75%'). */
  public label: string | null;
  public labelColor: CSSColor;
  public labelFont: string;

  constructor(
    position: IPoint,
    width: number = 200,
    height: number = 20,
    options: {
      background?: CSSColor;
      fill?: CSSColor;
      borderColor?: CSSColor;
      borderWidth?: number;
      radius?: number;
      label?: string;
      labelColor?: CSSColor;
      labelFont?: string;
      /** Initial value 0–1. Default 1. */
      value?: number;
    } = {},
  ) {
    super(position, width, height);
    this.background = options.background ?? '#374151';
    this.fill = options.fill ?? '#22c55e';
    this.borderColor = options.borderColor ?? null;
    this.borderWidth = options.borderWidth ?? 2;
    this.radius = options.radius ?? height / 2;
    this.label = options.label ?? null;
    this.labelColor = options.labelColor ?? '#fff';
    this.labelFont = options.labelFont ?? `bold ${Math.round(height * 0.6)}px Arial`;
    if (options.value !== undefined) this.value = options.value;
    this.enabled = false; // bars ignore pointer input by default
  }

  /** Fill amount from 0 (empty) to 1 (full). */
  get value(): number { return this._value; }
  set value(v: number) { this._value = Math.max(0, Math.min(1, v)); }

  draw(ctx: CanvasRenderingContext2D): void {
    const { x, y } = this.position;

    ctx.save();

    // Track
    roundRectPath(ctx, x, y, this.width, this.height, this.radius);
    ctx.fillStyle = this.background;
    ctx.fill();

    // Fill — clip to the track shape so rounded ends stay clean
    if (this._value > 0) {
      ctx.save();
      roundRectPath(ctx, x, y, this.width, this.height, this.radius);
      ctx.clip();
      ctx.fillStyle = this.fill;
      ctx.fillRect(x, y, this.width * this._value, this.height);
      ctx.restore();
    }

    if (this.borderColor) {
      roundRectPath(ctx, x, y, this.width, this.height, this.radius);
      ctx.strokeStyle = this.borderColor;
      ctx.lineWidth = this.borderWidth;
      ctx.stroke();
    }

    if (this.label) {
      ctx.fillStyle = this.labelColor;
      ctx.font = this.labelFont;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.label, x + this.width / 2, y + this.height / 2);
    }

    ctx.restore();
  }
}
