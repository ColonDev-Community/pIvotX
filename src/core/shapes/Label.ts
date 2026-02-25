import { IPoint, IDrawable, CSSColor } from '../types';

export type TextAlign    = 'left' | 'center' | 'right';
export type TextBaseline = 'top'  | 'middle' | 'bottom';

export class Label implements IDrawable {
  readonly tag = 'label';

  fillColor:    CSSColor     = '#000';
  font:         string       = '16px Arial';
  textAlign:    TextAlign    = 'center';
  textBaseline: TextBaseline = 'middle';

  constructor(
    public text:     string,
    public position: IPoint,
    font?:           string,
  ) {
    if (font) this.font = font;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.font         = this.font;
    ctx.fillStyle    = this.fillColor;
    ctx.textAlign    = this.textAlign;
    ctx.textBaseline = this.textBaseline;
    ctx.fillText(this.text, this.position.x, this.position.y);
  }
}
