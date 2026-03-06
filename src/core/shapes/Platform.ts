import { IPoint, IShape, CSSColor, AABB } from '../types';

// ─── Platform ─────────────────────────────────────────────────────────────────

/**
 * A rectangular platform shape for platformer games.
 *
 * Like Rectangle, but adds an AABB `bounds` getter for collision detection
 * and a `oneWay` flag for jump-through platforms.
 *
 * @example
 * const ground = new Platform(Point(0, 350), 600, 50);
 * ground.fillColor = '#4a7c59';
 * canvas.add(ground);
 *
 * const ledge = new Platform(Point(200, 260), 120, 16);
 * ledge.oneWay   = true;   // player can jump through from below
 * ledge.fillColor = '#8b5e3c';
 * canvas.add(ledge);
 *
 * // Collision check
 * if (aabbOverlap(playerBounds, ground.bounds)) { ... }
 */
export class Platform implements IShape {
  readonly tag = 'platform';

  fillColor:   CSSColor | null = '#555';
  strokeColor: CSSColor | null = null;
  lineWidth:   number          = 0;

  /**
   * If true, the player can pass through from below / sides and only
   * collides when landing from above. Your collision code should check this.
   */
  public oneWay: boolean = false;

  /**
   * @param position  Top-left corner of the platform.
   * @param width     Width in pixels.
   * @param height    Height in pixels.
   */
  constructor(
    public position: IPoint,
    public width:    number,
    public height:   number,
  ) {}

  /** AABB bounds for use with collision functions. */
  get bounds(): AABB {
    return {
      left:   this.position.x,
      right:  this.position.x + this.width,
      top:    this.position.y,
      bottom: this.position.y + this.height,
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.fillColor) {
      ctx.fillStyle = this.fillColor;
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
    if (this.strokeColor && this.lineWidth > 0) {
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth   = this.lineWidth;
      ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }
  }
}
