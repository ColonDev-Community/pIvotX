import { useEffect, useRef } from 'react';
import type { LoopCallback } from '../../core/types';

/**
 * Runs a requestAnimationFrame game loop for the lifetime of the component.
 * Works identically to the web `useGameLoop` hook.
 *
 * The callback receives `dt` — seconds since the last frame.
 * Uses a ref-based pattern so state and props are never stale inside the callback.
 *
 * In JSX mode, use this to update component state each frame:
 * ```tsx
 * const [pos, setPos] = useState({ x: 50, y: 150 });
 *
 * useNativeGameLoop((dt) => {
 *   setPos(p => ({ x: (p.x + 100 * dt) % 400, y: p.y }));
 * });
 *
 * return (
 *   <PivotNativeCanvas width={400} height={300}>
 *     <PivotCircle center={pos} radius={20} fill="#e94560" />
 *   </PivotNativeCanvas>
 * );
 * ```
 *
 * @param callback  Called every frame with `dt` (seconds since last frame).
 */
export function useNativeGameLoop(callback: LoopCallback): void {
  const callbackRef = useRef<LoopCallback>(callback);

  // Keep ref in sync with the latest callback on every render
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    let lastTime: number | null = null;
    let rafId: number;

    const tick = (timestamp: number) => {
      const dt = lastTime !== null ? (timestamp - lastTime) / 1000 : 0;
      lastTime = timestamp;
      callbackRef.current(dt);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);
}
