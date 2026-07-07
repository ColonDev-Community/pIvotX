// ─── Input hooks ────────────────────────────────────────────────────────────────
//
// Reactive input state for React components (menus, HUDs). For game loops,
// poll Keyboard/GamepadInput inside useGameLoop instead — these hooks
// re-render the component and are meant for UI, not per-frame logic.
//

import { useEffect, useState } from 'react';
import { Keyboard } from '../../core/input/Keyboard';
import { GamepadInput } from '../../core/input/GamepadInput';

/**
 * True while a key is held down. Re-renders the component on change.
 * Accepts the same friendly names as Keyboard ('space', 'a', 'left', 'KeyW', …).
 *
 * @example
 * const paused = useKeyPressed('escape');
 * return paused ? <PauseMenu /> : null;
 */
export function useKeyPressed(key: string): boolean {
  const [down, setDown] = useState(false);

  useEffect(() => {
    let rafId: number;
    const poll = () => {
      const now = Keyboard.isDown(key);
      setDown((prev) => (prev === now ? prev : now));
      rafId = requestAnimationFrame(poll);
    };
    rafId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafId);
  }, [key]);

  return down;
}

/**
 * True while a game controller is connected. Re-renders on connect/disconnect.
 *
 * @example
 * const hasGamepad = useGamepadConnected();
 * return <span>{hasGamepad ? '🎮 connected' : 'no controller'}</span>;
 */
export function useGamepadConnected(): boolean {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const update = () => setConnected(GamepadInput.connected);
    update();
    window.addEventListener('gamepadconnected', update);
    window.addEventListener('gamepaddisconnected', update);
    return () => {
      window.removeEventListener('gamepadconnected', update);
      window.removeEventListener('gamepaddisconnected', update);
    };
  }, []);

  return connected;
}
