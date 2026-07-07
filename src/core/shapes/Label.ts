import { IPoint, IDrawable, CSSColor } from '../types';

export type TextAlign    = 'left' | 'center' | 'right';
export type TextBaseline = 'top'  | 'middle' | 'bottom';

export class Label implements IDrawable {
  readonly tag = 'label';

  fillColor:    CSSColor     = '#000';
  font:         string       = '16px Arial';
  textAlign:    TextAlign    = 'center';
  textBaseline: TextBaseline = 'middle';
  /**
   * Line spacing in pixels for multi-line text (text containing '\n' or
   * wrapped by maxWidth). Defaults to 1.25 × the font size parsed from `font`.
   */
  lineHeight:   number | null = null;
  /**
   * Word-wrap the text to this width in pixels. `null` = no wrapping.
   * Combines with '\n' (explicit breaks are kept).
   */
  maxWidth:     number | null = null;
  /** Outline colour. `null` = no outline. */
  strokeColor:  CSSColor | null = null;
  /** Outline thickness in pixels. */
  strokeWidth:  number = 2;

  constructor(
    public text:     string,
    public position: IPoint,
    font?:           string,
  ) {
    if (font) this.font = font;
  }

  private _wrapLines(ctx: CanvasRenderingContext2D): string[] {
    const rawLines = this.text.split('\n');
    if (this.maxWidth === null) return rawLines;

    const wrapped: string[] = [];
    for (const raw of rawLines) {
      const words = raw.split(' ');
      let line = '';
      for (const word of words) {
        const candidate = line === '' ? word : `${line} ${word}`;
        if (line !== '' && ctx.measureText(candidate).width > this.maxWidth) {
          wrapped.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      wrapped.push(line);
    }
    return wrapped;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.font         = this.font;
    ctx.fillStyle    = this.fillColor;
    ctx.textAlign    = this.textAlign;
    ctx.textBaseline = this.textBaseline;

    const lines = this._wrapLines(ctx);
    const fontSize = parseFloat(this.font.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? '') || 16;
    const lineHeight = this.lineHeight ?? fontSize * 1.25;

    if (this.strokeColor) {
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth   = this.strokeWidth;
      ctx.lineJoin    = 'round';
    }

    for (let i = 0; i < lines.length; i++) {
      const y = this.position.y + i * lineHeight;
      if (this.strokeColor) ctx.strokeText(lines[i], this.position.x, y);
      ctx.fillText(lines[i], this.position.x, y);
    }
  }
}
