// ─── UIJoystick ───────────────────────────────────────────────────────────────

import { IPoint, CSSColor } from '../types';
import { UIElement } from './UIElement';

/**
 * A virtual on-screen joystick for touch (and mouse) controls — the mobile
 * counterpart to Keyboard.getAxis / GamepadInput.getStick.
 *
 * Read `.value` each frame: `{ x: -1..1, y: -1..1 }` (0,0 when idle).
 *
 * @example
 * const stick = new UIJoystick(Point(90, canvas.getHeight() - 90), 60);
 * ui.add(stick);
 *
 * canvas.startLoop((dt) => {
 *   player.x += 220 * stick.value.x * dt;
 *   player.y += 220 * stick.value.y * dt;
 *   // ...draw world...
 *   ui.draw(canvas.ctx);
 * });
 */
export class UIJoystick extends UIElement {
  readonly tag = 'ui-joystick';

  /** Radius of the base circle in pixels. */
  public radius: number;
  /** Radius of the knob. Default: 40 % of base radius. */
  public knobRadius: number;

  public baseColor: CSSColor = 'rgba(255, 255, 255, 0.15)';
  public baseBorderColor: CSSColor = 'rgba(255, 255, 255, 0.4)';
  public knobColor: CSSColor = 'rgba(255, 255, 255, 0.55)';

  /** Normalized deflection: x and y in -1..1 (0,0 when released). */
  public value: IPoint = { x: 0, y: 0 };
  /** True while the user is touching the stick. */
  public active = false;

  private _center: IPoint;

  /**
   * @param center  Centre of the joystick base in screen pixels.
   * @param radius  Base circle radius. Default 60.
   */
  constructor(center: IPoint, radius: number = 60) {
    // Bounds double as the hit area (a square around the base circle)
    super({ x: center.x - radius, y: center.y - radius }, radius * 2, radius * 2);
    this._center = center;
    this.radius = radius;
    this.knobRadius = radius * 0.4;
  }

  /** Centre of the base circle. Assign to reposition the joystick. */
  get center(): IPoint { return this._center; }
  set center(c: IPoint) {
    this._center = c;
    this.position = { x: c.x - this.radius, y: c.y - this.radius };
  }

  contains(x: number, y: number): boolean {
    const dx = x - this._center.x;
    const dy = y - this._center.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  private _track(x: number, y: number): void {
    const dx = x - this._center.x;
    const dy = y - this._center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clamped = Math.min(dist, this.radius);
    if (dist === 0) {
      this.value = { x: 0, y: 0 };
      return;
    }
    this.value = {
      x: (dx / dist) * (clamped / this.radius),
      y: (dy / dist) * (clamped / this.radius),
    };
  }

  handlePointerDown(x: number, y: number): boolean {
    this.active = true;
    this.pressed = true;
    this._track(x, y);
    this.onPress?.();
    return true;
  }

  handlePointerMove(x: number, y: number): void {
    if (this.active) this._track(x, y);
  }

  handlePointerUp(_x: number, _y: number): void {
    this.active = false;
    this.pressed = false;
    this.value = { x: 0, y: 0 };
    this.onRelease?.();
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Base
    ctx.beginPath();
    ctx.arc(this._center.x, this._center.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.baseColor;
    ctx.fill();
    ctx.strokeStyle = this.baseBorderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Knob
    const kx = this._center.x + this.value.x * (this.radius - this.knobRadius);
    const ky = this._center.y + this.value.y * (this.radius - this.knobRadius);
    ctx.beginPath();
    ctx.arc(kx, ky, this.knobRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.knobColor;
    ctx.fill();

    ctx.restore();
  }
}
