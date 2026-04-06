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
  PivotTiledBackground,
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
  PivotTiledBackgroundProps,
} from './components/shapes';

export { useGameLoop }   from './hooks/useGameLoop';
export { useSound }      from './hooks/useSound';
export type { UseSoundControls } from './hooks/useSound';

// Re-export core audio classes
export { Sound }         from '../core/audio/Sound';
export { SoundManager }  from '../core/audio/SoundManager';

// Re-export core types that React users commonly need
export type { IPoint, CSSColor, LoopCallback, AABB } from '../core/types';

// Re-export pure-math collision utilities (no canvas dependency)
export { aabbOverlap, aabbOverlapDepth, createAABB } from '../core/physics/collision';

// Re-export physics body helpers
export { stepBody, resolveCollisions } from '../core/physics/body';
export type { PhysicsBody, StaticRect, StepOptions, CollisionResult } from '../core/physics/body';
