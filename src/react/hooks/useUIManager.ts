// ─── useUIManager ───────────────────────────────────────────────────────────────

import { useEffect, useRef, RefObject } from 'react';
import { UIManager } from '../../core/ui/UIManager';
import type { PivotCanvasHandle } from '../PivotCanvas';

/**
 * Create a UIManager bound to a <PivotCanvas> ref, with automatic
 * attach/detach on mount/unmount.
 *
 * Build your widgets once in the setup callback; draw them inside your
 * game loop with `ui.draw(ctx)`.
 *
 * @example
 * const canvasRef = useRef<PivotCanvasHandle>(null);
 * const ui = useUIManager(canvasRef, (ui) => {
 *   const btn = new UIButton('Play', Point(220, 180));
 *   btn.onClick = () => setStarted(true);
 *   ui.add(btn);
 * });
 *
 * useGameLoop((dt) => {
 *   const ctx = canvasRef.current?.ctx;
 *   if (!ctx || !ui.current) return;
 *   canvasRef.current.clear();
 *   // ...draw game world...
 *   ui.current.draw(ctx);
 * });
 *
 * return <PivotCanvas ref={canvasRef} width={600} height={400} />;
 */
export function useUIManager(
  canvasRef: RefObject<PivotCanvasHandle | null>,
  setup?: (ui: UIManager) => void,
): RefObject<UIManager | null> {
  const uiRef = useRef<UIManager | null>(null);
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useEffect(() => {
    const el = canvasRef.current?.element;
    if (!el) return;
    const ui = new UIManager(el);
    uiRef.current = ui;
    setupRef.current?.(ui);
    return () => {
      ui.detach();
      uiRef.current = null;
    };
  }, [canvasRef]);

  return uiRef;
}
