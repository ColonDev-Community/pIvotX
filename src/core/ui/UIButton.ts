// ─── UIButton ─────────────────────────────────────────────────────────────────

import { IPoint, CSSColor } from '../types';
import { UIElement } from './UIElement';
import { roundRectPath } from './utils';

export interface UIButtonStyle {
  /** Background colour. Default '#3b82f6'. */
  background?: CSSColor;
  /** Background while hovered. Default: background. */
  hoverBackground?: CSSColor;
  /** Background while pressed. Default: background. */
  pressedBackground?: CSSColor;
  /** Background while disabled. Default '#6b7280'. */
  disabledBackground?: CSSColor;
  /** Label colour. Default '#fff'. */
  color?: CSSColor;
  /** Label font. Default 'bold 16px Arial'. */
  font?: string;
  /** Corner radius in pixels. Default 8. */
  radius?: number;
  /** Border colour (none by default). */
  borderColor?: CSSColor;
  /** Border width. Default 2 (only drawn when borderColor is set). */
  borderWidth?: number;
}

/**
 * A rounded-rectangle push button with hover / pressed / disabled states.
 *
 * @example
 * const startBtn = new UIButton('START', Point(220, 300), 160, 48);
 * startBtn.onClick = () => startGame();
 * ui.add(startBtn);
 */
export class UIButton extends UIElement {
  readonly tag = 'ui-button';

  public text: string;
  public style: Required<Pick<UIButtonStyle, 'background' | 'disabledBackground' | 'color' | 'font' | 'radius' | 'borderWidth'>> & UIButtonStyle;

  constructor(
    text: string,
    position: IPoint,
    width: number = 140,
    height: number = 44,
    style: UIButtonStyle = {},
  ) {
    super(position, width, height);
    this.focusable = true;
    this.text = text;
    this.style = {
      background: '#3b82f6',
      disabledBackground: '#6b7280',
      color: '#fff',
      font: 'bold 16px Arial',
      radius: 8,
      borderWidth: 2,
      ...style,
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const s = this.style;
    let bg = s.background;
    if (!this.enabled) bg = s.disabledBackground;
    else if (this.pressed) bg = s.pressedBackground ?? s.background;
    else if (this.hovered) bg = s.hoverBackground ?? s.background;

    ctx.save();
    roundRectPath(ctx, this.position.x, this.position.y, this.width, this.height, s.radius);
    ctx.fillStyle = bg;
    ctx.fill();
    if (s.borderColor) {
      ctx.strokeStyle = s.borderColor;
      ctx.lineWidth = s.borderWidth;
      ctx.stroke();
    }

    ctx.fillStyle = s.color;
    ctx.font = s.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = this.enabled ? 1 : 0.7;
    ctx.fillText(this.text, this.position.x + this.width / 2, this.position.y + this.height / 2);
    ctx.restore();
  }
}
