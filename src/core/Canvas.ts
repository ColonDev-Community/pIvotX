import { IPoint, IDrawable, LoopCallback } from './types';
import { Point } from './Point';

export class Canvas {
  private _canvas!:     HTMLCanvasElement;
  private _ctx!:        CanvasRenderingContext2D;
  private _valid:       boolean        = false;
  private _loopId:      number | null  = null;
  private _loopRunning: boolean        = false;

  /** Direct access to the raw 2D context for advanced use. */
  get ctx(): CanvasRenderingContext2D { return this._ctx; }

  constructor(id: string) {
    const el = document.getElementById(id);
    if (!el || el.nodeName !== 'CANVAS') {
      console.error(`pIvotX: No <canvas> found with id "${id}"`);
      return;
    }
    this._canvas = el as HTMLCanvasElement;
    const ctx = this._canvas.getContext('2d');
    if (!ctx) {
      console.error(`pIvotX: Could not get 2D context for canvas "${id}"`);
      return;
    }
    this._ctx   = ctx;
    this._valid = true;
    // eslint-disable-next-line no-console
    console.log(`pIvotX: Canvas ready — #${id}`);
  }

  // ── Dimensions ─────────────────────────────────────────────────────────────

  getWidth():  number { return this._canvas.width;  }
  getHeight(): number { return this._canvas.height; }
  getCenter(): IPoint { return Point(this._canvas.width / 2, this._canvas.height / 2); }

  // ── Drawing ────────────────────────────────────────────────────────────────

  /** Erase every pixel. Call at the start of each game-loop frame. */
  clear(): void {
    if (!this._valid) return;
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }

  /**
   * Draw any IDrawable (Circle, Rectangle, Line, Label, or your own shape)
   * onto the canvas immediately.
   */
  add(element: IDrawable): void {
    if (!this._valid) return;
    try {
      element.draw(this._ctx);
    } catch (err) {
      console.error('pIvotX Canvas.add error:', err);
    }
  }

  // ── Game loop ──────────────────────────────────────────────────────────────

  /**
   * Start a requestAnimationFrame loop.
   * The callback receives `dt` — seconds elapsed since the previous frame.
   *
   * @example
   * canvas.startLoop((dt) => {
   *   canvas.clear();
   *   ball.x += 200 * dt;
   *   canvas.add(ballShape);
   * });
   */
  startLoop(callback: LoopCallback): void {
    if (!this._valid) return;
    if (this._loopRunning) this.stopLoop();

    this._loopRunning = true;
    let last: number | null = null;

    const tick = (timestamp: number) => {
      if (!this._loopRunning) return;
      const dt = last !== null ? (timestamp - last) / 1000 : 0;
      last = timestamp;
      callback(dt);
      this._loopId = requestAnimationFrame(tick);
    };

    this._loopId = requestAnimationFrame(tick);
  }

  stopLoop(): void {
    this._loopRunning = false;
    if (this._loopId !== null) {
      cancelAnimationFrame(this._loopId);
      this._loopId = null;
    }
  }
}
