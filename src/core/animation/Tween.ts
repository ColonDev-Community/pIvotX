// ─── Tween ────────────────────────────────────────────────────────────────────
//
// Minimal tween engine for animating numeric properties of any object —
// positions, opacity, camera zoom, UI values — without hand-rolled lerps.
//
//   const tweens = new TweenManager();
//   tweens.to(player.position, { x: 400, y: 100 }, 0.6, 'easeOutQuad')
//         .then(() => console.log('arrived!'));
//
//   canvas.startLoop((dt) => {
//     tweens.update(dt);
//     ...
//   });
//

/** Easing function: takes t in 0..1, returns eased 0..1. */
export type EasingFunction = (t: number) => number;

export type EasingName =
  | 'linear'
  | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
  | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic'
  | 'easeOutBack' | 'easeOutElastic' | 'easeOutBounce';

/** Built-in easing functions. */
export const Easing: Record<EasingName, EasingFunction> = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => 1 + (--t) * t * t,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 + (t - 1) * (2 * t - 2) * (2 * t - 2)),
  easeOutBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeOutElastic: (t) => {
    if (t === 0 || t === 1) return t;
    const c4 = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeOutBounce: (t) => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

/** A single running tween. Returned by TweenManager.to(). */
export class Tween<T extends object> {
  /** @internal */ _elapsed = 0;
  /** @internal */ _done = false;

  private _from: Partial<Record<keyof T, number>> = {};
  private _onComplete: (() => void) | null = null;
  private _onUpdate: ((t: number) => void) | null = null;

  constructor(
    private _target: T,
    private _props: Partial<Record<keyof T, number>>,
    private _duration: number,
    private _ease: EasingFunction,
    private _delay: number = 0,
  ) {
    // Start values are captured lazily on the first update after the delay,
    // so chained/delayed tweens read fresh values.
  }

  /** True once the tween has finished (or was cancelled). */
  get done(): boolean { return this._done; }

  /** Register a completion callback. Chainable. */
  then(fn: () => void): this { this._onComplete = fn; return this; }

  /** Register a per-update callback receiving eased progress 0..1. Chainable. */
  onUpdate(fn: (t: number) => void): this { this._onUpdate = fn; return this; }

  /** Stop the tween where it is (no completion callback). */
  cancel(): void { this._done = true; }

  /** Jump straight to the end values and fire completion. */
  finish(): void {
    if (this._done) return;
    this._apply(1);
    this._done = true;
    this._onComplete?.();
  }

  private _captured = false;
  private _capture(): void {
    for (const key of Object.keys(this._props) as (keyof T)[]) {
      const value = this._target[key];
      if (typeof value === 'number') this._from[key] = value;
    }
    this._captured = true;
  }

  private _apply(t: number): void {
    const eased = this._ease(Math.max(0, Math.min(1, t)));
    for (const key of Object.keys(this._props) as (keyof T)[]) {
      const from = this._from[key];
      const to = this._props[key];
      if (from === undefined || to === undefined) continue;
      (this._target as Record<keyof T, unknown>)[key] = from + (to - from) * eased;
    }
    this._onUpdate?.(eased);
  }

  /** @internal Advance by dt seconds. */
  _update(dt: number): void {
    if (this._done) return;
    this._elapsed += dt;
    if (this._elapsed < this._delay) return;
    if (!this._captured) this._capture();

    const t = this._duration <= 0 ? 1 : (this._elapsed - this._delay) / this._duration;
    if (t >= 1) {
      this._apply(1);
      this._done = true;
      this._onComplete?.();
    } else {
      this._apply(t);
    }
  }
}

/**
 * Owns and updates a set of tweens. Create one per game (or per scene)
 * and call update(dt) every frame.
 */
export class TweenManager {
  private _tweens: Tween<object>[] = [];

  /**
   * Animate numeric properties of `target` to the given values.
   *
   * @param target    Any object (shape, position, camera, UI element, …).
   * @param props     Target numeric values, e.g. `{ x: 100, opacity: 0 }`.
   * @param duration  Seconds.
   * @param easing    Easing name or custom function. Default 'easeOutQuad'.
   * @param delay     Seconds to wait before starting. Default 0.
   */
  to<T extends object>(
    target: T,
    props: Partial<Record<keyof T, number>>,
    duration: number,
    easing: EasingName | EasingFunction = 'easeOutQuad',
    delay: number = 0,
  ): Tween<T> {
    const ease = typeof easing === 'function' ? easing : Easing[easing];
    const tween = new Tween(target, props, duration, ease, delay);
    this._tweens.push(tween as unknown as Tween<object>);
    return tween;
  }

  /** Cancel every running tween. */
  clear(): void {
    for (const t of this._tweens) t.cancel();
    this._tweens = [];
  }

  /** Number of active tweens. */
  get count(): number { return this._tweens.length; }

  /** Advance all tweens. Call once per frame. */
  update(dt: number): void {
    for (const t of this._tweens) t._update(dt);
    this._tweens = this._tweens.filter((t) => !t.done);
  }
}
