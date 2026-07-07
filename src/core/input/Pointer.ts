// ─── Pointer ──────────────────────────────────────────────────────────────────
//
// Unified mouse/touch state on a canvas. Complements UIManager (which routes
// pointer input to widgets) — Pointer is for the game world itself: aiming,
// dragging, tap-to-move.
//
//   Pointer.attach(canvasElement);
//
//   canvas.startLoop((dt) => {
//     if (Pointer.justPressed) shootAt(Pointer.x, Pointer.y);
//     if (Pointer.isDown)      aimAt(Pointer.x, Pointer.y);
//   });
//
// Coordinates are in canvas pixels (CSS scaling is compensated). For world
// coordinates run them through camera.screenToWorld({ x: Pointer.x, y: Pointer.y }).
//

import { registerInputUpdater } from './update';

export class Pointer {
  /** Current pointer X in canvas pixels. */
  static x = 0;
  /** Current pointer Y in canvas pixels. */
  static y = 0;
  /** True while a button/finger is down. */
  static isDown = false;
  /** True only on the frame the pointer went down. */
  static justPressed = false;
  /** True only on the frame the pointer was released. */
  static justReleased = false;
  /**
   * Set to `canvas.pixelRatio` when using `new Canvas(id, { hiDPI: true })`
   * so x/y stay in logical coordinates.
   */
  static pixelRatio = 1;

  private static _canvas: HTMLCanvasElement | null = null;
  private static _activeId: number | null = null;

  /** Start tracking pointer events on a canvas element. */
  static attach(canvas: HTMLCanvasElement): void {
    Pointer.detach();
    Pointer._canvas = canvas;
    canvas.addEventListener('pointerdown', Pointer._onDown);
    canvas.addEventListener('pointermove', Pointer._onMove);
    window.addEventListener('pointerup', Pointer._onUp);
    window.addEventListener('pointercancel', Pointer._onUp);
    registerInputUpdater(Pointer.update);
  }

  /** Stop tracking and reset state. */
  static detach(): void {
    const canvas = Pointer._canvas;
    if (!canvas) return;
    canvas.removeEventListener('pointerdown', Pointer._onDown);
    canvas.removeEventListener('pointermove', Pointer._onMove);
    window.removeEventListener('pointerup', Pointer._onUp);
    window.removeEventListener('pointercancel', Pointer._onUp);
    Pointer._canvas = null;
    Pointer.isDown = false;
    Pointer.justPressed = false;
    Pointer.justReleased = false;
    Pointer._activeId = null;
  }

  private static _setPos(e: PointerEvent): void {
    const canvas = Pointer._canvas!;
    const rect = canvas.getBoundingClientRect();
    Pointer.x = (e.clientX - rect.left) * (canvas.width / rect.width) / Pointer.pixelRatio;
    Pointer.y = (e.clientY - rect.top) * (canvas.height / rect.height) / Pointer.pixelRatio;
  }

  private static _onDown = (e: PointerEvent): void => {
    if (Pointer._activeId !== null) return; // track the first touch only
    Pointer._activeId = e.pointerId;
    Pointer._setPos(e);
    Pointer.isDown = true;
    Pointer.justPressed = true;
  };

  private static _onMove = (e: PointerEvent): void => {
    if (Pointer._activeId !== null && e.pointerId !== Pointer._activeId) return;
    Pointer._setPos(e);
  };

  private static _onUp = (e: PointerEvent): void => {
    if (e.pointerId !== Pointer._activeId) return;
    Pointer._activeId = null;
    Pointer.isDown = false;
    Pointer.justReleased = true;
  };

  /**
   * Roll edge states over one frame. Called automatically via updateInputs()
   * once attach() has been called.
   */
  static update(): void {
    Pointer.justPressed = false;
    Pointer.justReleased = false;
  }
}
