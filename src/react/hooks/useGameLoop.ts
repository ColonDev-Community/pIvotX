import { useEffect, useRef } from 'react';
import { LoopCallback } from '../../core/types';

/**
 * Runs a requestAnimationFrame game loop for the lifetime of the component.
 * The callback is called every frame with `dt` — seconds since last frame.
 *
 * The callback ref is updated every render so you can safely use
 * component state and props inside it without stale closures.
 *
 * @example
 * useGameLoop((dt) => {
 *   xRef.current += 200 * dt;
 *   redraw();
 * });
 */
export function useGameLoop(callback: LoopCallback): void {
  const callbackRef = useRef<LoopCallback>(callback);

  // Keep the ref in sync with the latest callback on every render
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    let lastTime: number | null = null;
    let rafId:    number;

    const tick = (timestamp: number) => {
      const dt = lastTime !== null ? (timestamp - lastTime) / 1000 : 0;
      lastTime = timestamp;
      callbackRef.current(dt);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []); // runs once — loop starts on mount, stops on unmount
}
