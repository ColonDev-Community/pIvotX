// ─── Keyboard ─────────────────────────────────────────────────────────────────
//
// Static keyboard input engine. Auto-attaches window listeners on first use.
//
// Keys are matched by KeyboardEvent.code (layout-independent, ideal for games)
// but friendly aliases are accepted: 'a'–'z', '0'–'9', 'left', 'right', 'up',
// 'down', 'space', 'enter', 'escape', 'shift', 'ctrl', 'alt', 'tab'.
//
//   if (Keyboard.isDown('left'))      player.vx = -200;
//   if (Keyboard.justPressed('space')) player.jump();
//   player.vx = 200 * Keyboard.getAxis('horizontal'); // arrows + WASD
//
// justPressed/justReleased need a per-frame tick — Canvas.startLoop and
// useGameLoop handle it automatically; in a custom rAF loop call
// updateInputs() (or Keyboard.update()) at the end of each frame.
//

import { registerInputUpdater } from './update';

/** Friendly name → KeyboardEvent.code lookup. */
const ALIASES: Record<string, string> = {
  left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown',
  space: 'Space', enter: 'Enter', escape: 'Escape', esc: 'Escape',
  shift: 'ShiftLeft', ctrl: 'ControlLeft', alt: 'AltLeft', tab: 'Tab',
  backspace: 'Backspace', delete: 'Delete',
};

/** Normalise a friendly key name to a KeyboardEvent.code. */
function toCode(key: string): string {
  if (ALIASES[key]) return ALIASES[key];
  if (key.length === 1) {
    if (key >= 'a' && key <= 'z') return `Key${key.toUpperCase()}`;
    if (key >= 'A' && key <= 'Z') return `Key${key}`;
    if (key >= '0' && key <= '9') return `Digit${key}`;
  }
  return key; // assume it's already a code ('KeyW', 'ArrowLeft', 'F1', …)
}

export class Keyboard {
  private static _down = new Set<string>();
  private static _pressed = new Set<string>();
  private static _released = new Set<string>();
  private static _attached = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  /**
   * Attach window key listeners. Called automatically on first query —
   * you only need this to eagerly initialise (e.g. before a "press any
   * key" screen).
   */
  static init(): void {
    if (Keyboard._attached || typeof window === 'undefined') return;
    window.addEventListener('keydown', Keyboard._onKeyDown);
    window.addEventListener('keyup', Keyboard._onKeyUp);
    window.addEventListener('blur', Keyboard._onBlur);
    registerInputUpdater(Keyboard.update);
    Keyboard._attached = true;
  }

  /** Detach listeners and clear all state. */
  static destroy(): void {
    if (!Keyboard._attached) return;
    window.removeEventListener('keydown', Keyboard._onKeyDown);
    window.removeEventListener('keyup', Keyboard._onKeyUp);
    window.removeEventListener('blur', Keyboard._onBlur);
    Keyboard._attached = false;
    Keyboard._down.clear();
    Keyboard._pressed.clear();
    Keyboard._released.clear();
  }

  // ── Event handlers ───────────────────────────────────────────────────────

  private static _onKeyDown = (e: KeyboardEvent): void => {
    if (!e.repeat) {
      Keyboard._pressed.add(e.code);
      Keyboard._down.add(e.code);
    }
  };

  private static _onKeyUp = (e: KeyboardEvent): void => {
    Keyboard._down.delete(e.code);
    Keyboard._released.add(e.code);
  };

  private static _onBlur = (): void => {
    // Losing focus never fires keyup — release everything to avoid stuck keys
    Keyboard._down.forEach((code) => Keyboard._released.add(code));
    Keyboard._down.clear();
  };

  // ── Queries ──────────────────────────────────────────────────────────────

  /** True while the key is held down. */
  static isDown(key: string): boolean {
    Keyboard.init();
    return Keyboard._down.has(toCode(key));
  }

  /** True only on the frame the key went down. */
  static justPressed(key: string): boolean {
    Keyboard.init();
    return Keyboard._pressed.has(toCode(key));
  }

  /** True only on the frame the key was released. */
  static justReleased(key: string): boolean {
    Keyboard.init();
    return Keyboard._released.has(toCode(key));
  }

  /** True if any key at all is currently held down. */
  static get anyDown(): boolean {
    Keyboard.init();
    return Keyboard._down.size > 0;
  }

  /**
   * Combined -1..1 axis from arrow keys and WASD.
   *
   * - 'horizontal': left/A = -1, right/D = +1
   * - 'vertical':   up/W   = -1, down/S  = +1 (canvas Y grows downward)
   */
  static getAxis(axis: 'horizontal' | 'vertical'): number {
    Keyboard.init();
    let value = 0;
    if (axis === 'horizontal') {
      if (Keyboard._down.has('ArrowLeft') || Keyboard._down.has('KeyA')) value -= 1;
      if (Keyboard._down.has('ArrowRight') || Keyboard._down.has('KeyD')) value += 1;
    } else {
      if (Keyboard._down.has('ArrowUp') || Keyboard._down.has('KeyW')) value -= 1;
      if (Keyboard._down.has('ArrowDown') || Keyboard._down.has('KeyS')) value += 1;
    }
    return value;
  }

  // ── Per-frame update ─────────────────────────────────────────────────────

  /**
   * Roll over the just-pressed / just-released edge states.
   * Called automatically by Canvas.startLoop / useGameLoop via updateInputs().
   */
  static update(): void {
    Keyboard._pressed.clear();
    Keyboard._released.clear();
  }
}
