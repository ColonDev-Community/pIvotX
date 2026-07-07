import { IPoint, IDrawable, LoopCallback } from './types';
import { Point } from './Point';
import { updateInputs } from './input/update';

export interface CanvasOptions {
  /**
   * Render at the display's devicePixelRatio for crisp output on high-DPI
   * (Retina) screens. The canvas keeps its logical size — your coordinates,
   * getWidth()/getHeight(), and pointer positions are unchanged; only the
   * backing store is scaled. Default false.
   */
  hiDPI?: boolean;
}

export class Canvas {
  private _canvas!:     HTMLCanvasElement;
  private _ctx!:        CanvasRenderingContext2D;
  private _valid:       boolean        = false;
  private _loopId:      number | null  = null;
  private _loopRunning: boolean        = false;
  private _dpr:         number         = 1;
  private _resizeObserver: ResizeObserver | null = null;

  /** Direct access to the raw 2D context for advanced use. */
  get ctx(): CanvasRenderingContext2D { return this._ctx; }

  /** The device-pixel ratio in use (1 unless hiDPI was enabled). */
  get pixelRatio(): number { return this._dpr; }

  constructor(id: string, options: CanvasOptions = {}) {
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

    if (options.hiDPI && typeof window !== 'undefined' && window.devicePixelRatio > 1) {
      this._dpr = window.devicePixelRatio;
      const logicalW = this._canvas.width;
      const logicalH = this._canvas.height;
      this._canvas.style.width = `${logicalW}px`;
      this._canvas.style.height = `${logicalH}px`;
      this._canvas.width = Math.round(logicalW * this._dpr);
      this._canvas.height = Math.round(logicalH * this._dpr);
      this._ctx.scale(this._dpr, this._dpr);
    }
  }

  // ── Dimensions ─────────────────────────────────────────────────────────────

  getWidth():  number { return this._canvas.width / this._dpr;  }
  getHeight(): number { return this._canvas.height / this._dpr; }
  getCenter(): IPoint { return Point(this.getWidth() / 2, this.getHeight() / 2); }

  // ── Auto-resize ────────────────────────────────────────────────────────────

  /**
   * Scale the canvas (via CSS) to fill its parent element while preserving
   * the aspect ratio — the internal resolution and all your coordinates stay
   * unchanged, so this is safe to enable on any existing game.
   *
   * Re-applies automatically when the parent resizes (ResizeObserver).
   * Call disableAutoResize() to stop and restore the natural size.
   *
   * @example
   * const canvas = new Canvas('game');
   * canvas.enableAutoResize();   // fills the parent, letterboxed
   */
  enableAutoResize(): void {
    if (!this._valid || this._resizeObserver) return;
    const parent = this._canvas.parentElement;
    if (!parent || typeof ResizeObserver === 'undefined') return;

    const logicalW = this.getWidth();
    const logicalH = this.getHeight();

    const fit = () => {
      const availW = parent.clientWidth;
      const availH = parent.clientHeight;
      if (availW === 0 || availH === 0) return;
      const scale = Math.min(availW / logicalW, availH / logicalH);
      this._canvas.style.width = `${Math.floor(logicalW * scale)}px`;
      this._canvas.style.height = `${Math.floor(logicalH * scale)}px`;
    };

    this._resizeObserver = new ResizeObserver(fit);
    this._resizeObserver.observe(parent);
    fit();
  }

  /** Stop auto-resizing and restore the canvas's natural CSS size. */
  disableAutoResize(): void {
    if (!this._resizeObserver) return;
    this._resizeObserver.disconnect();
    this._resizeObserver = null;
    this._canvas.style.width = '';
    this._canvas.style.height = '';
  }

  // ── Drawing ────────────────────────────────────────────────────────────────

  /** Erase every pixel. Call at the start of each game-loop frame. */
  clear(): void {
    if (!this._valid) return;
    this._ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
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
      // Clamp dt so returning from a background tab doesn't teleport objects
      const dt = last !== null ? Math.min((timestamp - last) / 1000, 0.1) : 0;
      last = timestamp;
      callback(dt);
      updateInputs();
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
