// ─── UIManager ────────────────────────────────────────────────────────────────
//
// Owns a set of UI elements: routes pointer input (mouse + multi-touch) to
// them and draws them all with one call. Multi-touch aware — a thumb on a
// UIJoystick and another on a UIButton work simultaneously.
//
//   const ui = new UIManager(canvasElement);   // or new Canvas(...).ctx.canvas
//   ui.add(button).add(healthBar).add(joystick);
//
//   canvas.startLoop((dt) => {
//     canvas.clear();
//     // ...draw game world...
//     ui.draw(canvas.ctx);   // UI always on top, in screen space
//   });
//
//   ui.detach();   // remove listeners when done
//

import { UIElement } from './UIElement';
import { UIPanel } from './UIPanel';
import { UISlider } from './UISlider';

export class UIManager {
  private _elements: UIElement[] = [];
  private _canvas: HTMLCanvasElement | null = null;
  /** Which element each active pointer is captured by. */
  private _captures = new Map<number, UIElement>();
  private _focused: UIElement | null = null;
  private _keyNavAttached = false;
  /** Colour of the keyboard-focus ring. */
  public focusRingColor = '#60a5fa';
  /**
   * Set to `canvas.pixelRatio` when using `new Canvas(id, { hiDPI: true })`
   * so pointer hit-testing and anchoring stay in logical coordinates.
   */
  public pixelRatio = 1;

  /**
   * @param canvas  The canvas element to listen on. Omit if you only want
   *                drawing/layout and will route input yourself via
   *                pointerDown/pointerMove/pointerUp.
   */
  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) this.attach(canvas);
  }

  // ── Element management ───────────────────────────────────────────────────

  /** Add an element (drawn in add order; later = on top). Chainable. */
  add(element: UIElement): this {
    this._elements.push(element);
    return this;
  }

  /** Remove an element. Chainable. */
  remove(element: UIElement): this {
    const i = this._elements.indexOf(element);
    if (i !== -1) this._elements.splice(i, 1);
    if (this._focused === element) this.setFocus(null);
    return this;
  }

  /** Remove every element. */
  clear(): this {
    this._elements = [];
    this._captures.clear();
    this.setFocus(null);
    return this;
  }

  /** All managed elements (draw order). */
  get elements(): readonly UIElement[] { return this._elements; }

  // ── DOM attachment ───────────────────────────────────────────────────────

  /** Start listening for pointer events on a canvas element. */
  attach(canvas: HTMLCanvasElement): void {
    this.detach();
    this._canvas = canvas;
    canvas.addEventListener('pointerdown', this._onPointerDown);
    canvas.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('pointercancel', this._onPointerUp);
    // Prevent touch scrolling/zooming while interacting with the game UI
    canvas.style.touchAction = 'none';
  }

  /** Remove all event listeners. */
  detach(): void {
    this.disableKeyboardNav();
    const canvas = this._canvas;
    if (!canvas) return;
    canvas.removeEventListener('pointerdown', this._onPointerDown);
    canvas.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('pointercancel', this._onPointerUp);
    this._canvas = null;
    this._captures.clear();
  }

  // ── Keyboard focus navigation ────────────────────────────────────────────

  /** All focusable, visible, enabled elements in traversal order. */
  private _focusables(): UIElement[] {
    const result: UIElement[] = [];
    const walk = (els: readonly UIElement[]): void => {
      for (const el of els) {
        if (!el.visible) continue;
        if (el.focusable && el.enabled) result.push(el);
        if (el instanceof UIPanel) walk(el.children);
      }
    };
    walk(this._elements);
    return result;
  }

  /** The element that currently has keyboard focus, or null. */
  get focused(): UIElement | null { return this._focused; }

  /** Give keyboard focus to a specific element (or null to clear). */
  setFocus(element: UIElement | null): void {
    if (this._focused) this._focused.focused = false;
    this._focused = element;
    if (element) element.focused = true;
  }

  /** Move focus to the next focusable element (wraps around). */
  focusNext(): void { this._moveFocus(1); }

  /** Move focus to the previous focusable element (wraps around). */
  focusPrev(): void { this._moveFocus(-1); }

  private _moveFocus(dir: 1 | -1): void {
    const focusables = this._focusables();
    if (focusables.length === 0) { this.setFocus(null); return; }
    const idx = this._focused ? focusables.indexOf(this._focused) : -1;
    const next = focusables[(idx + dir + focusables.length) % focusables.length];
    this.setFocus(next);
  }

  /** Trigger the focused element's action (what Enter/Space do). */
  activateFocused(): void {
    this._focused?.activate();
  }

  /**
   * Attach window key handling: Tab / Shift+Tab and arrow keys move focus,
   * Enter / Space activate, Left/Right adjust a focused slider.
   * Call disableKeyboardNav() (or detach()) to remove.
   */
  enableKeyboardNav(): void {
    if (this._keyNavAttached || typeof window === 'undefined') return;
    window.addEventListener('keydown', this._onKeyNav);
    this._keyNavAttached = true;
  }

  /** Remove the keyboard-navigation listener. */
  disableKeyboardNav(): void {
    if (!this._keyNavAttached) return;
    window.removeEventListener('keydown', this._onKeyNav);
    this._keyNavAttached = false;
  }

  private _onKeyNav = (e: KeyboardEvent): void => {
    switch (e.code) {
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) this.focusPrev(); else this.focusNext();
        break;
      case 'ArrowDown':
        this.focusNext();
        break;
      case 'ArrowUp':
        this.focusPrev();
        break;
      case 'ArrowLeft':
        if (this._focused instanceof UISlider) this._focused.nudge(-1);
        break;
      case 'ArrowRight':
        if (this._focused instanceof UISlider) this._focused.nudge(1);
        break;
      case 'Enter':
      case 'Space':
        if (this._focused) {
          e.preventDefault();
          this.activateFocused();
        }
        break;
    }
  };

  /** Map a client (event) coordinate to logical canvas coordinates. */
  private _toCanvas(clientX: number, clientY: number): { x: number; y: number } {
    const canvas = this._canvas!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width) / this.pixelRatio,
      y: (clientY - rect.top) * (canvas.height / rect.height) / this.pixelRatio,
    };
  }

  private _onPointerDown = (e: PointerEvent): void => {
    const { x, y } = this._toCanvas(e.clientX, e.clientY);
    if (this.pointerDown(e.pointerId, x, y)) {
      e.preventDefault();
    }
  };

  private _onPointerMove = (e: PointerEvent): void => {
    const { x, y } = this._toCanvas(e.clientX, e.clientY);
    this.pointerMove(e.pointerId, x, y);
  };

  private _onPointerUp = (e: PointerEvent): void => {
    if (!this._captures.has(e.pointerId)) return;
    const { x, y } = this._toCanvas(e.clientX, e.clientY);
    this.pointerUp(e.pointerId, x, y);
  };

  // ── Manual input routing (used by the DOM handlers; call directly if you
  //    route your own events, e.g. React Native onTouch) ────────────────────

  /** Route a pointer-down. Returns true if a UI element consumed it. */
  pointerDown(pointerId: number, x: number, y: number): boolean {
    const target = this._hitTest(x, y);
    if (!target) return false;
    if (target.handlePointerDown(x, y)) {
      this._captures.set(pointerId, target);
    }
    return true;
  }

  /** Route a pointer-move. */
  pointerMove(pointerId: number, x: number, y: number): void {
    const captured = this._captures.get(pointerId);
    if (captured) {
      captured.handlePointerMove(x, y);
      return;
    }
    // No capture: update hover states (mouse)
    const target = this._hitTest(x, y);
    this._forEachInteractive((el) => { el.hovered = el === target; });
  }

  /** Route a pointer-up / cancel. */
  pointerUp(pointerId: number, x: number, y: number): void {
    const captured = this._captures.get(pointerId);
    if (captured) {
      captured.handlePointerUp(x, y);
      this._captures.delete(pointerId);
    }
  }

  // ── Hit testing ──────────────────────────────────────────────────────────

  /** Topmost interactive element at a canvas coordinate, or null. */
  private _hitTest(x: number, y: number): UIElement | null {
    for (let i = this._elements.length - 1; i >= 0; i--) {
      const el = this._elements[i];
      const hit = this._hitTestElement(el, x, y);
      if (hit) return hit;
    }
    return null;
  }

  private _hitTestElement(el: UIElement, x: number, y: number): UIElement | null {
    if (!el.visible) return null;

    // Panels: children get first chance (topmost child last in array)
    if (el instanceof UIPanel) {
      const children = el.hitTestChildren;
      for (let i = children.length - 1; i >= 0; i--) {
        const hit = this._hitTestElement(children[i], x, y);
        if (hit) return hit;
      }
    }

    if (el.enabled && el.contains(x, y)) return el;
    return null;
  }

  private _forEachInteractive(fn: (el: UIElement) => void): void {
    const walk = (els: readonly UIElement[]): void => {
      for (const el of els) {
        if (!el.visible) continue;
        fn(el);
        if (el instanceof UIPanel) walk(el.children);
      }
    };
    walk(this._elements);
  }

  // ── Drawing ──────────────────────────────────────────────────────────────

  /** Recompute an anchored element's position from the canvas size. */
  private _applyAnchor(el: UIElement, canvasW: number, canvasH: number): void {
    const a = el.anchor;
    if (!a) return;
    const off = el.anchorOffset;
    el.position.x =
      a.h === 'left' ? off.x :
      a.h === 'right' ? canvasW - el.width - off.x :
      (canvasW - el.width) / 2 + off.x;
    el.position.y =
      a.v === 'top' ? off.y :
      a.v === 'bottom' ? canvasH - el.height - off.y :
      (canvasH - el.height) / 2 + off.y;
  }

  private _drawFocusRing(ctx: CanvasRenderingContext2D, el: UIElement): void {
    ctx.save();
    ctx.strokeStyle = this.focusRingColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(el.position.x - 4, el.position.y - 4, el.width + 8, el.height + 8);
    ctx.restore();
  }

  /**
   * Draw every visible element in add order.
   * Call at the END of your frame (after world rendering, after camera.end())
   * so the UI sits on top in screen space.
   */
  draw(ctx: CanvasRenderingContext2D): void {
    const cw = ctx.canvas.width / this.pixelRatio;
    const ch = ctx.canvas.height / this.pixelRatio;
    for (const el of this._elements) {
      if (!el.visible) continue;
      this._applyAnchor(el, cw, ch);
      el.draw(ctx);
    }
    if (this._focused && this._focused.visible) {
      this._drawFocusRing(ctx, this._focused);
    }
  }
}
