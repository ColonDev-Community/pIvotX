/**
 * PivotNativeCamera — Camera component for React Native.
 *
 * Wraps children with camera-begin / camera-end draw commands so that
 * shapes rendered inside are in camera (world) space.
 *
 * @example
 * <PivotNativeCanvas width={400} height={300}>
 *   <PivotNativeCamera position={cameraPos} zoom={1}>
 *     <PivotTilemap ... />
 *     <PivotSprite ... />
 *   </PivotNativeCamera>
 *   {/* HUD — drawn in screen space (outside camera) *\/}
 *   <PivotLabel text="Score: 100" position={{ x: 10, y: 10 }} fill="white" />
 * </PivotNativeCanvas>
 */

import React from 'react';
import type { ReactNode } from 'react';
import { useNativeDrawContext } from '../context/NativeDrawContext';
import type { IPoint } from '../../core/types';

export interface PivotNativeCameraProps {
  /** Top-left corner of the viewport in world coordinates. */
  position: IPoint;
  /** Zoom level. 1 = normal, 2 = 2× zoom in. */
  zoom?:    number;
  /** Children are rendered in camera (world) space. */
  children?: ReactNode;
}

export function PivotNativeCamera({ position, zoom = 1, children }: PivotNativeCameraProps) {
  const { registerCommand, setCameraPosition } = useNativeDrawContext();

  // Update the shared camera position so touch handling can use it
  setCameraPosition(position);

  // Register cameraBegin during render (before children render)
  registerCommand({ type: 'cameraBegin', position, zoom });

  return (
    <>
      {children}
      <CameraEnd />
    </>
  );
}

/** Internal component that registers the camera-end command after all children. */
function CameraEnd() {
  const { registerCommand } = useNativeDrawContext();

  registerCommand({ type: 'cameraEnd' });

  return null;
}
