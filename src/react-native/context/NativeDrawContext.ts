// ─── Native Draw Context ───────────────────────────────────────────────────────
//
// Provides a way for child shape components to register draw commands.
// PivotNativeCanvas reads these commands each frame and sends them to the WebView.
//

import { createContext, useContext } from 'react';
import type { DrawCommand } from '../bridge/types';

export interface NativeDrawContextValue {
  /** Register a draw command for the current frame. */
  registerCommand(cmd: DrawCommand): void;
  /** Current camera position (updated by PivotNativeCamera). */
  cameraPosition: { x: number; y: number };
  /** Update the camera position (called by PivotNativeCamera). */
  setCameraPosition(pos: { x: number; y: number }): void;
}

export const NativeDrawContext = createContext<NativeDrawContextValue | null>(null);

/**
 * Access the draw command context. Must be called inside <PivotNativeCanvas>.
 * @throws Error if called outside of PivotNativeCanvas.
 */
export function useNativeDrawContext(): NativeDrawContextValue {
  const ctx = useContext(NativeDrawContext);
  if (!ctx) {
    throw new Error(
      'pIvotX: Native shape components must be inside <PivotNativeCanvas>',
    );
  }
  return ctx;
}
