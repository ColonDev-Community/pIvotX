// ─── InputMap ─────────────────────────────────────────────────────────────────
//
// Action mapping: name your game's actions once, bind any mix of keyboard
// keys and gamepad buttons, then query by action. Rebinding controls becomes
// a one-liner and your game code never mentions physical inputs.
//
//   InputMap.bind('jump',  ['space', 'w', 'gamepad:a']);
//   InputMap.bind('shoot', ['gamepad:rt', 'f']);
//
//   canvas.startLoop((dt) => {
//     if (InputMap.justPressed('jump') && player.grounded) player.vy = -500;
//     if (InputMap.isDown('shoot')) fire();
//   });
//
// Binding format: plain strings are keyboard keys (same names Keyboard
// accepts); prefix with 'gamepad:' for controller buttons (same names
// GamepadInput accepts, e.g. 'gamepad:a', 'gamepad:rt', 'gamepad:start').
//

import { Keyboard } from './Keyboard';
import { GamepadInput } from './GamepadInput';

export class InputMap {
  private static _bindings = new Map<string, string[]>();

  /** Bind (replace) the inputs for an action. */
  static bind(action: string, inputs: string[]): void {
    InputMap._bindings.set(action, [...inputs]);
  }

  /** Add inputs to an action without removing existing ones. */
  static addBinding(action: string, ...inputs: string[]): void {
    const existing = InputMap._bindings.get(action) ?? [];
    InputMap._bindings.set(action, [...existing, ...inputs]);
  }

  /** Remove an action entirely. */
  static unbind(action: string): void {
    InputMap._bindings.delete(action);
  }

  /** The current bindings for an action (empty if unbound). */
  static getBindings(action: string): readonly string[] {
    return InputMap._bindings.get(action) ?? [];
  }

  /** True while any bound input for the action is held. */
  static isDown(action: string): boolean {
    return InputMap._query(action, (key) => Keyboard.isDown(key), (btn) => GamepadInput.isDown(btn));
  }

  /** True only on the frame any bound input went down. */
  static justPressed(action: string): boolean {
    return InputMap._query(action, (key) => Keyboard.justPressed(key), (btn) => GamepadInput.justPressed(btn));
  }

  /** True only on the frame any bound input was released. */
  static justReleased(action: string): boolean {
    return InputMap._query(action, (key) => Keyboard.justReleased(key), (btn) => GamepadInput.justReleased(btn));
  }

  private static _query(
    action: string,
    keyFn: (key: string) => boolean,
    padFn: (btn: string) => boolean,
  ): boolean {
    const inputs = InputMap._bindings.get(action);
    if (!inputs) return false;
    for (const input of inputs) {
      if (input.startsWith('gamepad:')) {
        if (padFn(input.slice(8))) return true;
      } else if (keyFn(input)) {
        return true;
      }
    }
    return false;
  }
}
