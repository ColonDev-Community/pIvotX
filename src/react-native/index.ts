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

// UI components (canvas-rendered widgets; WebView bridge on native, direct on web)
export {
  PivotButton,
  PivotUIText,
  PivotProgressBar,
  PivotCheckbox,
  PivotSlider,
  PivotJoystick,
} from './components/ui';
export type {
  PivotNativeButtonProps,
  PivotNativeUITextProps,
  PivotNativeProgressBarProps,
  PivotNativeCheckboxProps,
  PivotNativeSliderProps,
  PivotNativeJoystickProps,
} from './components/ui';
export type { UIWidgetKind, UIWidgetDescriptor, UIWidgetHandlers } from './bridge/types';

// Hooks
export { useNativeGameLoop }    from './hooks/useNativeGameLoop';
export { useNativePostMessage } from './hooks/useNativePostMessage';
export { useNativeSound }       from './hooks/useNativeSound';
export type { UseNativeSoundControls } from './hooks/useNativeSound';

// Re-export core audio classes
export { Sound }         from '../core/audio/Sound';
export { SoundManager }  from '../core/audio/SoundManager';

// Re-export core types that RN users commonly need
export type { IPoint, CSSColor, LoopCallback, AABB } from '../core/types';

// Re-export pure-math collision utilities (no canvas dependency)
export { aabbOverlap, aabbOverlapDepth, createAABB } from '../core/physics/collision';

// Re-export physics body helpers
export { stepBody, resolveCollisions } from '../core/physics/body';
export type { PhysicsBody, StaticRect, StepOptions, CollisionResult } from '../core/physics/body';

// Re-export pure-math physics extras (no canvas dependency)
export { circlesOverlap, circleAABBOverlap, circleAABBResolve, raycastAABB, raycastCircle, sweepCircleAABB } from '../core/physics/shapes';
export type { CollisionCircle, RaycastHit } from '../core/physics/shapes';
export { SpatialHash } from '../core/physics/SpatialHash';

// Hardware input (keyboard + controller) — unified across native & web
export { NativeInput } from './input/NativeInput';

// Re-export platform-agnostic game utilities
export { Vec2 }   from '../core/math/Vec2';
export { Timers } from '../core/time/Timers';
export type { TimerHandle } from '../core/time/Timers';
export { Tween, TweenManager, Easing } from '../core/animation/Tween';
export type { EasingName, EasingFunction } from '../core/animation/Tween';
