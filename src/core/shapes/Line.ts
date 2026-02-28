import { IPoint, IDrawable, CSSColor } from '../types';

export class Line implements IDrawable {
  readonly tag = 'line';

  strokeColor: CSSColor = '#000';
  lineWidth:   number   = 1;

  constructor(
    public startPoint: IPoint,
    public endPoint:   IPoint,
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth   = this.lineWidth;
    ctx.moveTo(this.startPoint.x, this.startPoint.y);
    ctx.lineTo(this.endPoint.x,   this.endPoint.y);
    ctx.stroke();
  }
}
