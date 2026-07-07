// ─── GamepadInput ─────────────────────────────────────────────────────────────
//
// Static game-controller engine over the browser Gamepad API.
//
// Buttons use standard-mapping names (Xbox layout shown; PS equivalents work
// the same positions): 'a' 'b' 'x' 'y' 'lb' 'rb' 'lt' 'rt' 'back' 'start'
// 'ls' 'rs' 'up' 'down' 'left' 'right' 'home' — or a raw button index.
//
//   if (GamepadInput.justPressed('a')) player.jump();
//   const stick = GamepadInput.getStick('left');   // { x: -1..1, y: -1..1 }
//   player.vx = 200 * stick.x;
//   GamepadInput.vibrate(200, 0.8);                // rumble
//
// The gamepad state is polled once per frame — Canvas.startLoop and
// useGameLoop do it automatically; in a custom rAF loop call updateInputs()
// (or GamepadInput.update()) at the end of each frame.
//

import { IPoint } from '../types';
import { registerInputUpdater } from './update';

/** Standard-mapping button name → index (https://w3c.github.io/gamepad/#remapping). */
const BUTTONS: Record<string, number> = {
  a: 0, b: 1, x: 2, y: 3,
  lb: 4, rb: 5, lt: 6, rt: 7,
  back: 8, select: 8, start: 9,
  ls: 10, rs: 11,
  up: 12, down: 13, left: 14, right: 15,
  home: 16,
};

function toButtonIndex(button: string | number): number {
  if (typeof button === 'number') return button;
  const idx = BUTTONS[button.toLowerCase()];
  return idx !== undefined ? idx : -1;
}

export class GamepadInput {
  /** Stick values smaller than this are treated as 0 (default 0.15). */
  static deadZone = 0.15;

  private static _attached = false;
  private static _pad: Gamepad | null = null;
  private static _down = new Set<number>();
  private static _prevDown = new Set<number>();

  // ── Lifecycle ────────────────────────────────────────────────────────────

  /** Start listening for controllers. Called automatically on first query. */
  static init(): void {
    if (GamepadInput._attached || typeof window === 'undefined') return;
    registerInputUpdater(GamepadInput.update);
    GamepadInput._attached = true;
    GamepadInput._poll();
  }

  // ── State ────────────────────────────────────────────────────────────────

  /** True if a gamepad is connected. */
  static get connected(): boolean {
    GamepadInput.init();
    GamepadInput._poll();
    return GamepadInput._pad !== null;
  }

  /** The raw Gamepad object of the active controller (first connected), or null. */
  static get raw(): Gamepad | null {
    GamepadInput.init();
    return GamepadInput._pad;
  }

  private static _poll(): void {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) {
      GamepadInput._pad = null;
      return;
    }
    const pads = navigator.getGamepads();
    GamepadInput._pad = null;
    for (const pad of pads) {
      if (pad && pad.connected) {
        GamepadInput._pad = pad;
        break;
      }
    }
  }

  // ── Buttons ──────────────────────────────────────────────────────────────

  /** True while a button is held. Accepts a name ('a', 'start', …) or index. */
  static isDown(button: string | number): boolean {
    GamepadInput.init();
    GamepadInput._refreshButtons();
    return GamepadInput._down.has(toButtonIndex(button));
  }

  /** True only on the frame the button went down. */
  static justPressed(button: string | number): boolean {
    GamepadInput.init();
    GamepadInput._refreshButtons();
    const idx = toButtonIndex(button);
    return GamepadInput._down.has(idx) && !GamepadInput._prevDown.has(idx);
  }

  /** True only on the frame the button was released. */
  static justReleased(button: string | number): boolean {
    GamepadInput.init();
    GamepadInput._refreshButtons();
    const idx = toButtonIndex(button);
    return !GamepadInput._down.has(idx) && GamepadInput._prevDown.has(idx);
  }

  private static _refreshButtons(): void {
    GamepadInput._poll();
    GamepadInput._down.clear();
    const pad = GamepadInput._pad;
    if (!pad) return;
    for (let i = 0; i < pad.buttons.length; i++) {
      if (pad.buttons[i].pressed) GamepadInput._down.add(i);
    }
  }

  // ── Sticks & triggers ────────────────────────────────────────────────────

  /**
   * Analogue stick value with dead-zone applied.
   * Returns `{ x: -1..1, y: -1..1 }` (y is negative when pushed up).
   */
  static getStick(stick: 'left' | 'right'): IPoint {
    GamepadInput.init();
    GamepadInput._poll();
    const pad = GamepadInput._pad;
    if (!pad) return { x: 0, y: 0 };
    const base = stick === 'left' ? 0 : 2;
    const dz = GamepadInput.deadZone;
    const x = pad.axes[base] ?? 0;
    const y = pad.axes[base + 1] ?? 0;
    return {
      x: Math.abs(x) < dz ? 0 : x,
      y: Math.abs(y) < dz ? 0 : y,
    };
  }

  /** Analogue trigger value 0–1 ('lt' or 'rt'). */
  static getTrigger(trigger: 'lt' | 'rt'): number {
    GamepadInput.init();
    GamepadInput._poll();
    const pad = GamepadInput._pad;
    if (!pad) return 0;
    return pad.buttons[BUTTONS[trigger]]?.value ?? 0;
  }

  // ── Vibration ────────────────────────────────────────────────────────────

  /**
   * Rumble the controller (where supported).
   *
   * @param durationMs  Effect length in milliseconds.
   * @param strong      Strong (low-frequency) motor intensity 0–1. Default 1.
   * @param weak        Weak (high-frequency) motor intensity 0–1. Defaults to `strong`.
   */
  static vibrate(durationMs: number, strong: number = 1, weak?: number): void {
    GamepadInput.init();
    GamepadInput._poll();
    const actuator = (GamepadInput._pad as unknown as {
      vibrationActuator?: {
        playEffect(type: string, params: Record<string, number>): Promise<unknown>;
      };
    } | null)?.vibrationActuator;
    actuator?.playEffect('dual-rumble', {
      duration: durationMs,
      strongMagnitude: Math.max(0, Math.min(1, strong)),
      weakMagnitude: Math.max(0, Math.min(1, weak ?? strong)),
    }).catch(() => { /* unsupported — ignore */ });
  }

  // ── Per-frame update ─────────────────────────────────────────────────────

  /**
   * Roll the current button state into the previous-frame snapshot so
   * justPressed/justReleased work. Called automatically via updateInputs().
   */
  static update(): void {
    GamepadInput._refreshButtons();
    GamepadInput._prevDown = new Set(GamepadInput._down);
  }
}
