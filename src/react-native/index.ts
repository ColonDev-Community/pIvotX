// ─── pIvotX React Native Entry Point ───────────────────────────────────────────
//
// Import from '@colon-dev/pivotx/react-native'
//

// Root component
export { PivotNativeCanvas } from './PivotNativeCanvas';
export type {
  PivotNativeCanvasProps,
  PivotNativeCanvasHandle,
} from './bridge/types';

// Shape components
export {
  PivotCircle,
  PivotRectangle,
  PivotLine,
  PivotLabel,
  PivotImage,
  PivotSprite,
  PivotPlatform,
  PivotTilemap,
  PivotTiledBackground,
} from './components/shapes';
export type {
  PivotNativeCircleProps,
  PivotNativeRectangleProps,
  PivotNativeLineProps,
  PivotNativeLabelProps,
  PivotNativeImageProps,
  PivotNativeSpriteProps,
  PivotNativePlatformProps,
  PivotNativeTilemapProps,
  PivotNativeTiledBackgroundProps,
} from './components/shapes';

// Camera
export { PivotNativeCamera } from './components/NativeCamera';
export type { PivotNativeCameraProps } from './components/NativeCamera';

// Hooks
export { useNativeGameLoop }    from './hooks/useNativeGameLoop';
export { useNativePostMessage } from './hooks/useNativePostMessage';

// Re-export core types that RN users commonly need
export type { IPoint, CSSColor, LoopCallback, AABB } from '../core/types';

// Re-export pure-math collision utilities (no canvas dependency)
export { aabbOverlap, aabbOverlapDepth, createAABB } from '../core/physics/collision';

// Re-export physics body helpers
export { stepBody, resolveCollisions } from '../core/physics/body';
export type { PhysicsBody, StaticRect, StepOptions, CollisionResult } from '../core/physics/body';
