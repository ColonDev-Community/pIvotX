// ─── UICheckbox ───────────────────────────────────────────────────────────────

import { IPoint, CSSColor } from '../types';
import { UIElement } from './UIElement';
import { roundRectPath } from './utils';

/**
 * A checkbox with a label — settings toggles (sound on/off, etc.).
 *
 * @example
 * const soundToggle = new UICheckbox('Sound', Point(40, 200), { checked: true });
 * soundToggle.onChange = (on) => on ? SoundManager.unmute() : SoundManager.mute();
 * ui.add(soundToggle);
 */
export class UICheckbox extends UIElement {
  readonly tag = 'ui-checkbox';

  public label: string;
  public checked: boolean;
  /** Fired with the new state whenever the box is toggled. */
  public onChange: ((checked: boolean) => void) | null = null;

  public boxColor: CSSColor = '#1f2937';
  public borderColor: CSSColor = '#64748b';
  public checkColor: CSSColor = '#3b82f6';
  public labelColor: CSSColor = '#fff';
  public font: string = '15px Arial';
  /** Side length of the box in pixels. */
  public boxSize: number;

  constructor(
    label: string,
    position: IPoint,
    options: { checked?: boolean; boxSize?: number; width?: number } = {},
  ) {
    const boxSize = options.boxSize ?? 22;
    // Rough hit width: box + gap + ~8px per character
    super(position, options.width ?? boxSize + 10 + label.length * 8, boxSize);
    this.label = label;
    this.checked = options.checked ?? false;
    this.boxSize = boxSize;
    this.focusable = true;
    this.onClick = () => {
      this.checked = !this.checked;
      this.onChange?.(this.checked);
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { x, y } = this.position;
    const s = this.boxSize;

    ctx.save();
    ctx.globalAlpha = this.enabled ? 1 : 0.5;

    roundRectPath(ctx, x, y, s, s, 5);
    ctx.fillStyle = this.boxColor;
    ctx.fill();
    ctx.strokeStyle = this.hovered ? this.checkColor : this.borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (this.checked) {
      ctx.strokeStyle = this.checkColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x + s * 0.22, y + s * 0.52);
      ctx.lineTo(x + s * 0.42, y + s * 0.72);
      ctx.lineTo(x + s * 0.78, y + s * 0.28);
      ctx.stroke();
    }

    ctx.fillStyle = this.labelColor;
    ctx.font = this.font;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, x + s + 10, y + s / 2);
    ctx.restore();
  }
}
