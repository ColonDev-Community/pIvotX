// ─── UIElement ────────────────────────────────────────────────────────────────
//
// Base class for all pIvotX UI widgets. Extend it to build custom widgets —
// implement draw() and optionally override the pointer handlers.
//
// UI elements are drawn in SCREEN space (after camera.end()), managed and
// hit-tested by UIManager.
//

import { IPoint, IDrawable } from '../types';

export abstract class UIElement implements IDrawable {
  readonly tag: string = 'ui-element';

  /** Top-left position in screen (canvas) pixels. */
  public position: IPoint;
  /** Hit-test / layout width in pixels. */
  public width: number;
  /** Hit-test / layout height in pixels. */
  public height: number;

  /** Hidden elements are neither drawn nor hit-tested. */
  public visible = true;
  /** Disabled elements are drawn (dimmed by widgets that support it) but ignore input. */
  public enabled = true;

  /**
   * Anchor the element to a canvas edge/centre instead of an absolute
   * position. When set, UIManager recomputes `position` every frame from the
   * canvas size, so UI survives canvas resizes. `anchorOffset` is the margin
   * from the anchor point.
   *
   * @example
   * pauseBtn.anchor = { h: 'right', v: 'top' };
   * pauseBtn.anchorOffset = { x: 16, y: 16 };   // 16px from the top-right corner
   */
  public anchor: { h: 'left' | 'center' | 'right'; v: 'top' | 'middle' | 'bottom' } | null = null;
  /** Offset from the anchor point (positive values move inward). */
  public anchorOffset: IPoint = { x: 0, y: 0 };

  /** Whether the element participates in keyboard focus traversal. */
  public focusable = false;
  /** True while the element has keyboard focus (set by UIManager). */
  public focused = false;

  /** True while the pointer is over the element (mouse only, needs hover events). */
  public hovered = false;
  /** True while a pointer is pressed on the element. */
  public pressed = false;

  /** Fired when a press that started on this element is released on it. */
  public onClick: (() => void) | null = null;
  /** Fired when a pointer goes down on the element. */
  public onPress: (() => void) | null = null;
  /** Fired when the pointer is released (even if it left the element). */
  public onRelease: (() => void) | null = null;

  constructor(position: IPoint, width: number, height: number) {
    this.position = position;
    this.width = width;
    this.height = height;
  }

  /** True if a screen-space point is inside the element's bounds. */
  contains(x: number, y: number): boolean {
    return (
      x >= this.position.x && x <= this.position.x + this.width &&
      y >= this.position.y && y <= this.position.y + this.height
    );
  }

  // ── Pointer plumbing (called by UIManager; override for custom widgets) ──

  /** @internal Pointer went down inside the element. Return true to capture it. */
  handlePointerDown(_x: number, _y: number): boolean {
    this.pressed = true;
    this.onPress?.();
    return true;
  }

  /** @internal Pointer moved while this element has capture. */
  handlePointerMove(_x: number, _y: number): void { /* default: nothing */ }

  /** @internal Pointer released while this element has capture. */
  handlePointerUp(x: number, y: number): void {
    const wasPressed = this.pressed;
    this.pressed = false;
    this.onRelease?.();
    if (wasPressed && this.contains(x, y)) this.onClick?.();
  }

  /**
   * Trigger the element's primary action (what a click does). Used by
   * keyboard navigation (Enter/Space). Widgets with different semantics
   * (checkbox toggle, etc.) get this via their onClick handler.
   */
  activate(): void {
    if (this.enabled) this.onClick?.();
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;
}
