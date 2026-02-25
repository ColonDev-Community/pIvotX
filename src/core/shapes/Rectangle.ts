import { IPoint, IShape, CSSColor } from '../types';

export class Rectangle implements IShape {
  readonly tag = 'rect';

  fillColor:   CSSColor | null = null;
  strokeColor: CSSColor | null = null;
  lineWidth:   number          = 1;

  constructor(
    public position: IPoint,
    public width:    number,
    public height:   number,
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.rect(this.position.x, this.position.y, this.width, this.height);

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
