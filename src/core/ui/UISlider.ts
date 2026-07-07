// ─── UISlider ─────────────────────────────────────────────────────────────────

import { IPoint, CSSColor } from '../types';
import { UIElement } from './UIElement';
import { roundRectPath } from './utils';

/**
 * A horizontal slider — volume controls, difficulty settings, etc.
 * Drag anywhere on the track; the knob follows the pointer.
 *
 * @example
 * const volume = new UISlider(Point(40, 240), 180, { value: 0.8 });
 * volume.onChange = (v) => { SoundManager.masterVolume = v; };
 * ui.add(volume);
 */
export class UISlider extends UIElement {
  readonly tag = 'ui-slider';

  private _value: number;

  /** Fired continuously while dragging with the new value. */
  public onChange: ((value: number) => void) | null = null;

  public min: number;
  public max: number;
  /** Snap to steps of this size (0 = continuous). */
  public step: number;

  public trackColor: CSSColor = '#374151';
  public fillColor: CSSColor = '#3b82f6';
  public knobColor: CSSColor = '#f8fafc';
  public trackHeight: number = 6;
  public knobRadius: number = 10;

  constructor(
    position: IPoint,
    width: number = 180,
    options: { value?: number; min?: number; max?: number; step?: number } = {},
  ) {
    // Height covers the knob so hit-testing feels natural
    super(position, width, 24);
    this.min = options.min ?? 0;
    this.max = options.max ?? 1;
    this.step = options.step ?? 0;
    this._value = options.value ?? this.min;
    this._value = this._clamp(this._value);
    this.focusable = true;
  }

  /** Nudge the value by one step (or 5 % of the range). Used by keyboard nav. */
  nudge(direction: -1 | 1): void {
    const delta = this.step > 0 ? this.step : (this.max - this.min) * 0.05;
    const next = this._clamp(this._value + direction * delta);
    if (next !== this._value) {
      this._value = next;
      this.onChange?.(next);
    }
  }

  /** Current value between min and max. */
  get value(): number { return this._value; }
  set value(v: number) { this._value = this._clamp(v); }

  private _clamp(v: number): number {
    if (this.step > 0) {
      v = this.min + Math.round((v - this.min) / this.step) * this.step;
    }
    return Math.max(this.min, Math.min(this.max, v));
  }

  private _valueFromX(x: number): number {
    const t = (x - this.position.x) / this.width;
    return this._clamp(this.min + t * (this.max - this.min));
  }

  private _setFromPointer(x: number): void {
    const next = this._valueFromX(x);
    if (next !== this._value) {
      this._value = next;
      this.onChange?.(next);
    }
  }

  handlePointerDown(x: number, _y: number): boolean {
    this.pressed = true;
    this._setFromPointer(x);
    this.onPress?.();
    return true;
  }

  handlePointerMove(x: number, _y: number): void {
    if (this.pressed) this._setFromPointer(x);
  }

  handlePointerUp(x: number, y: number): void {
    const wasPressed = this.pressed;
    this.pressed = false;
    this.onRelease?.();
    if (wasPressed && this.contains(x, y)) this.onClick?.();
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { x } = this.position;
    const cy = this.position.y + this.height / 2;
    const t = (this._value - this.min) / (this.max - this.min || 1);
    const knobX = x + t * this.width;

    ctx.save();
    ctx.globalAlpha = this.enabled ? 1 : 0.5;

    // Track
    roundRectPath(ctx, x, cy - this.trackHeight / 2, this.width, this.trackHeight, this.trackHeight / 2);
    ctx.fillStyle = this.trackColor;
    ctx.fill();

    // Filled portion
    if (t > 0) {
      roundRectPath(ctx, x, cy - this.trackHeight / 2, t * this.width, this.trackHeight, this.trackHeight / 2);
      ctx.fillStyle = this.fillColor;
      ctx.fill();
    }

    // Knob
    ctx.beginPath();
    ctx.arc(knobX, cy, this.knobRadius * (this.pressed ? 1.15 : 1), 0, Math.PI * 2);
    ctx.fillStyle = this.knobColor;
    ctx.fill();

    ctx.restore();
  }
}
