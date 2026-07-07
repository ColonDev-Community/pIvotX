export { Point }     from './Point';
export { Canvas }    from './Canvas';
export type { CanvasOptions } from './Canvas';
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
// ── New: Audio ──────────────────────────────────────────────────────────────────
export { Sound }           from './audio/Sound';
export { SoundManager }    from './audio/SoundManager';
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

// ── New: Physics extras (circles, raycast, tilemap stepping, broad-phase) ───
export { circlesOverlap, circleAABBOverlap, circleAABBResolve, raycastAABB, raycastCircle, sweepCircleAABB } from './physics/shapes';
export type { CollisionCircle, RaycastHit } from './physics/shapes';
export { stepBodyOnTilemap } from './physics/tilemapBody';
export { SpatialHash } from './physics/SpatialHash';

// ── New: Input (Keyboard, Gamepad, Pointer, action mapping) ─────────────────
export { Keyboard }     from './input/Keyboard';
export { GamepadInput } from './input/GamepadInput';
export { Pointer }      from './input/Pointer';
export { InputMap }     from './input/InputMap';
export { updateInputs } from './input/update';

// ── New: Math / Time / Tween / Particles / Scenes ───────────────────────────
export { Vec2 }   from './math/Vec2';
export { Timers } from './time/Timers';
export type { TimerHandle } from './time/Timers';
export { Tween, TweenManager, Easing } from './animation/Tween';
export type { EasingName, EasingFunction } from './animation/Tween';
export { ParticleEmitter } from './particles/ParticleEmitter';
export type { ParticleOptions } from './particles/ParticleEmitter';
export { Scene, SceneManager } from './scene/SceneManager';

// ── New: UI ──────────────────────────────────────────────────────────────────
export { UIManager }     from './ui/UIManager';
export { UIElement }     from './ui/UIElement';
export { UIButton }      from './ui/UIButton';
export type { UIButtonStyle } from './ui/UIButton';
export { UIText }        from './ui/UIText';
export { UIPanel }       from './ui/UIPanel';
export { UIProgressBar } from './ui/UIProgressBar';
export { UIJoystick }    from './ui/UIJoystick';
export { UICheckbox }    from './ui/UICheckbox';
export { UISlider }      from './ui/UISlider';
export { UIImageButton } from './ui/UIImageButton';
export { UINineSlice }   from './ui/UINineSlice';
export type { NineSliceBorder } from './ui/UINineSlice';

// ── Types ────────────────────────────────────────────────────────────────────
export type {
  IPoint,
  IDrawable,
  IShape,
  CSSColor,
  LoopCallback,
  AABB,
} from './types';
