export { Point }     from './Point';
export { Canvas }    from './Canvas';
export { Circle }    from './shapes/Circle';
export { Rectangle } from './shapes/Rectangle';
export { Line }      from './shapes/Line';
export { Label }     from './shapes/Label';

// ── New: Image & Sprite ──────────────────────────────────────────────────────
export { GameImage }       from './shapes/GameImage';
export { Sprite }          from './shapes/Sprite';
export type { SpriteSheet } from './shapes/Sprite';

// ── New: Animation ───────────────────────────────────────────────────────────
export { SpriteAnimator }  from './animation/SpriteAnimator';
export type { AnimationClip } from './animation/SpriteAnimator';

// ── New: Assets ──────────────────────────────────────────────────────────────
export { AssetLoader }     from './assets/AssetLoader';

// ── New: Camera ──────────────────────────────────────────────────────────────
export { Camera }          from './camera/Camera';

// ── New: Backgrounds & Platforms ─────────────────────────────────────────────
export { TiledBackground } from './shapes/TiledBackground';
export { Platform }        from './shapes/Platform';

// ── New: Tilemap ─────────────────────────────────────────────────────────────
export { Tilemap }         from './tilemap/Tilemap';

// ── New: Physics / Collision ─────────────────────────────────────────────────
export { aabbOverlap, aabbOverlapDepth, createAABB } from './physics/collision';
export { stepBody, resolveCollisions } from './physics/body';
export type { PhysicsBody, StaticRect, StepOptions, CollisionResult } from './physics/body';

// ── Types ────────────────────────────────────────────────────────────────────
export type {
  IPoint,
  IDrawable,
  IShape,
  CSSColor,
  LoopCallback,
  AABB,
} from './types';
