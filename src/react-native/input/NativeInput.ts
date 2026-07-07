// ─── NativeInput ──────────────────────────────────────────────────────────────
//
// Unified hardware keyboard + game-controller queries for React Native /
// Expo games — one API on every platform:
//
// - **Expo Web**: reads the DOM directly via the core Keyboard/GamepadInput.
// - **iOS / Android**: reads state forwarded from the WebView, where
//   Bluetooth/USB keyboards and controllers deliver their DOM events
//   (no native module required). Requires <PivotNativeCanvas> to be mounted.
//
//   useNativeGameLoop((dt) => {
//     player.vx = 240 * NativeInput.keyAxis('horizontal');   // arrows + WASD
//     const stick = NativeInput.getStick('left');            // controller
//     if (NativeInput.isButtonDown('a')) jump();
//   });
//
// Note: this API is held-state only (isDown / axes). For edge queries
// (justPressed) track the previous frame's state in your game loop.
//

import { Platform } from 'react-native';
import { Keyboard } from '../../core/input/Keyboard';
import { GamepadInput } from '../../core/input/GamepadInput';
import { nativeInputStore } from './nativeInputStore';

const isWeb = Platform.OS === 'web';

/** Friendly key name → KeyboardEvent.code (same aliases as core Keyboard). */
const ALIASES: Record<string, string> = {
  left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown',
  space: 'Space', enter: 'Enter', escape: 'Escape', esc: 'Escape',
  shift: 'ShiftLeft', ctrl: 'ControlLeft', alt: 'AltLeft', tab: 'Tab',
};

function toCode(key: string): string {
  if (ALIASES[key]) return ALIASES[key];
  if (key.length === 1) {
    if (key >= 'a' && key <= 'z') return `Key${key.toUpperCase()}`;
    if (key >= 'A' && key <= 'Z') return `Key${key}`;
    if (key >= '0' && key <= '9') return `Digit${key}`;
  }
  return key;
}

/** Standard-mapping button name → index (same names as core GamepadInput). */
const BUTTONS: Record<string, number> = {
  a: 0, b: 1, x: 2, y: 3,
  lb: 4, rb: 5, lt: 6, rt: 7,
  back: 8, select: 8, start: 9,
  ls: 10, rs: 11,
  up: 12, down: 13, left: 14, right: 15,
  home: 16,
};

export const NativeInput = {
  /** Stick values smaller than this are treated as 0. */
  deadZone: 0.15,

  // ── Keyboard ─────────────────────────────────────────────────────────────

  /** True while a keyboard key is held ('left', 'a', 'space', 'KeyW', …). */
  isKeyDown(key: string): boolean {
    if (isWeb) return Keyboard.isDown(key);
    return nativeInputStore.keysDown.has(toCode(key));
  },

  /**
   * Combined -1..1 axis from arrow keys and WASD.
   * 'horizontal': left/A = -1, right/D = +1. 'vertical': up/W = -1, down/S = +1.
   */
  keyAxis(axis: 'horizontal' | 'vertical'): number {
    if (isWeb) return Keyboard.getAxis(axis);
    const down = nativeInputStore.keysDown;
    let value = 0;
    if (axis === 'horizontal') {
      if (down.has('ArrowLeft') || down.has('KeyA')) value -= 1;
      if (down.has('ArrowRight') || down.has('KeyD')) value += 1;
    } else {
      if (down.has('ArrowUp') || down.has('KeyW')) value -= 1;
      if (down.has('ArrowDown') || down.has('KeyS')) value += 1;
    }
    return value;
  },

  // ── Gamepad ──────────────────────────────────────────────────────────────

  /** True if a game controller is connected. */
  get gamepadConnected(): boolean {
    if (isWeb) return GamepadInput.connected;
    return nativeInputStore.gamepad.connected;
  },

  /** True while a controller button is held ('a', 'start', 'lb', … or an index). */
  isButtonDown(button: string | number): boolean {
    if (isWeb) return GamepadInput.isDown(button);
    const idx = typeof button === 'number' ? button : BUTTONS[button.toLowerCase()] ?? -1;
    return nativeInputStore.gamepad.buttons.has(idx);
  },

  /** Analogue stick with dead-zone: { x: -1..1, y: -1..1 }. */
  getStick(stick: 'left' | 'right'): { x: number; y: number } {
    if (isWeb) {
      const v = GamepadInput.getStick(stick);
      return { x: v.x, y: v.y };
    }
    const axes = nativeInputStore.gamepad.axes;
    const base = stick === 'left' ? 0 : 2;
    const dz = NativeInput.deadZone;
    const x = axes[base] ?? 0;
    const y = axes[base + 1] ?? 0;
    return {
      x: Math.abs(x) < dz ? 0 : x,
      y: Math.abs(y) < dz ? 0 : y,
    };
  },
};
