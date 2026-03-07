export { PivotCanvas }   from './PivotCanvas';
export type { PivotCanvasProps, PivotCanvasHandle } from './PivotCanvas';

export {
  PivotCircle,
  PivotRectangle,
  PivotLine,
  PivotLabel,
  PivotImage,
  PivotSprite,
  PivotPlatform,
  PivotTilemap,
} from './components/shapes';
export type {
  PivotCircleProps,
  PivotRectangleProps,
  PivotLineProps,
  PivotLabelProps,
  PivotImageProps,
  PivotSpriteProps,
  PivotPlatformProps,
  PivotTilemapProps,
} from './components/shapes';

export { useGameLoop }   from './hooks/useGameLoop';

// Re-export core types that React users commonly need
export type { IPoint, CSSColor, LoopCallback, AABB } from '../core/types';

// Re-export pure-math collision utilities (no canvas dependency)
export { aabbOverlap, aabbOverlapDepth, createAABB } from '../core/physics/collision';

// Re-export physics body helpers
export { stepBody, resolveCollisions } from '../core/physics/body';
export type { PhysicsBody, StaticRect, StepOptions, CollisionResult } from '../core/physics/body';
