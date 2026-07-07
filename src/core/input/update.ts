// ─── Input frame update hub ───────────────────────────────────────────────────
//
// Keyboard and GamepadInput need a once-per-frame tick to compute
// justPressed / justReleased edges. Canvas.startLoop and the React
// useGameLoop hook call updateInputs() automatically after each frame;
// call it yourself only if you run your own requestAnimationFrame loop.
//

type InputUpdater = () => void;

const updaters: InputUpdater[] = [];

/** @internal Register a per-frame input updater (called by Keyboard/GamepadInput). */
export function registerInputUpdater(fn: InputUpdater): void {
  if (!updaters.includes(fn)) updaters.push(fn);
}

/**
 * Advance all input engines by one frame (rolls "just pressed/released"
 * states over and polls connected gamepads).
 *
 * Called automatically by `Canvas.startLoop` and `useGameLoop` — only call
 * this manually at the END of your own custom rAF loop.
 */
export function updateInputs(): void {
  for (const fn of updaters) fn();
}
