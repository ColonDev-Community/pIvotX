import { IPoint, IShape, CSSColor } from '../types';

export class Circle implements IShape {
  readonly tag = 'circle';

  fillColor:   CSSColor | null = null;
  strokeColor: CSSColor | null = null;
  lineWidth:   number          = 1;

  constructor(
    public centerPoint: IPoint,
    public radius:      number,
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.centerPoint.x, this.centerPoint.y, this.radius, 0, 2 * Math.PI);

    if (this.fillColor) {
      ctx.fillStyle = this.fillColor;
      ctx.fill();
    }
    if (this.strokeColor) {
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth   = this.lineWidth;
      ctx.stroke();
    }
  }
}
