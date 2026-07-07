// ─── UIText ───────────────────────────────────────────────────────────────────

import { IPoint, CSSColor } from '../types';
import { UIElement } from './UIElement';

/**
 * A simple positioned text block for HUDs and menus.
 * Unlike Label, it participates in UIManager drawing/layout (panels, z-order).
 *
 * @example
 * const score = new UIText('Score: 0', Point(16, 16), { font: 'bold 20px Arial', color: '#fff' });
 * ui.add(score);
 * // later: score.text = `Score: ${points}`;
 */
export class UIText extends UIElement {
  readonly tag = 'ui-text';

  public text: string;
  public color: CSSColor;
  public font: string;
  public align: CanvasTextAlign;
  public baseline: CanvasTextBaseline;

  constructor(
    text: string,
    position: IPoint,
    options: {
      color?: CSSColor;
      font?: string;
      align?: CanvasTextAlign;
      baseline?: CanvasTextBaseline;
      /** Layout width used by panels (text itself is not wrapped). Default 0. */
      width?: number;
      /** Layout height used by panels. Default: font size guess of 20. */
      height?: number;
    } = {},
  ) {
    super(position, options.width ?? 0, options.height ?? 20);
    this.text = text;
    this.color = options.color ?? '#fff';
    this.font = options.font ?? '16px Arial';
    this.align = options.align ?? 'left';
    this.baseline = options.baseline ?? 'top';
    this.enabled = false; // text ignores pointer input by default
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.font = this.font;
    ctx.textAlign = this.align;
    ctx.textBaseline = this.baseline;
    ctx.fillText(this.text, this.position.x, this.position.y);
    ctx.restore();
  }
}
