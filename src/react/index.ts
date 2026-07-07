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

// UI wrapper components (declare canvas UI in JSX)
export {
  PivotUI,
  PivotButton,
  PivotUIText,
  PivotProgressBar,
  PivotCheckbox,
  PivotSlider,
  PivotJoystick,
} from './components/ui';
export type {
  PivotUIProps,
  UIWidgetBaseProps,
  PivotButtonProps,
  PivotUITextProps,
  PivotProgressBarProps,
  PivotCheckboxProps,
  PivotSliderProps,
  PivotJoystickProps,
} from './components/ui';

export { useGameLoop }   from './hooks/useGameLoop';
export { useSound }      from './hooks/useSound';
export type { UseSoundControls } from './hooks/useSound';
export { useKeyPressed, useGamepadConnected } from './hooks/useInput';
export { useUIManager }  from './hooks/useUIManager';

// Re-export core audio classes
export { Sound }         from '../core/audio/Sound';
export { SoundManager }  from '../core/audio/SoundManager';

// Re-export input engines (updated automatically by useGameLoop)
export { Keyboard }      from '../core/input/Keyboard';
export { GamepadInput }  from '../core/input/GamepadInput';
export { Pointer }       from '../core/input/Pointer';
export { InputMap }      from '../core/input/InputMap';
export { updateInputs }  from '../core/input/update';

// Re-export math / time / tween / particles / scenes
export { Vec2 }   from '../core/math/Vec2';
export { Timers } from '../core/time/Timers';
export type { TimerHandle } from '../core/time/Timers';
export { Tween, TweenManager, Easing } from '../core/animation/Tween';
export type { EasingName, EasingFunction } from '../core/animation/Tween';
export { ParticleEmitter } from '../core/particles/ParticleEmitter';
export type { ParticleOptions } from '../core/particles/ParticleEmitter';
export { Scene, SceneManager } from '../core/scene/SceneManager';

// Re-export physics extras
export { circlesOverlap, circleAABBOverlap, circleAABBResolve, raycastAABB, raycastCircle, sweepCircleAABB } from '../core/physics/shapes';
export type { CollisionCircle, RaycastHit } from '../core/physics/shapes';
export { stepBodyOnTilemap } from '../core/physics/tilemapBody';
export { SpatialHash } from '../core/physics/SpatialHash';

// Re-export UI engine (attach UIManager to the canvas via the PivotCanvas ref)
export { UIManager }     from '../core/ui/UIManager';
export { UIElement }     from '../core/ui/UIElement';
export { UIButton }      from '../core/ui/UIButton';
export type { UIButtonStyle } from '../core/ui/UIButton';
export { UIText }        from '../core/ui/UIText';
export { UIPanel }       from '../core/ui/UIPanel';
export { UIProgressBar } from '../core/ui/UIProgressBar';
export { UIJoystick }    from '../core/ui/UIJoystick';
export { UICheckbox }    from '../core/ui/UICheckbox';
export { UISlider }      from '../core/ui/UISlider';
export { UIImageButton } from '../core/ui/UIImageButton';
export { UINineSlice }   from '../core/ui/UINineSlice';
export type { NineSliceBorder } from '../core/ui/UINineSlice';

// Re-export core types that React users commonly need
export type { IPoint, CSSColor, LoopCallback, AABB } from '../core/types';

// Re-export pure-math collision utilities (no canvas dependency)
export { aabbOverlap, aabbOverlapDepth, createAABB } from '../core/physics/collision';

// Re-export physics body helpers
export { stepBody, resolveCollisions } from '../core/physics/body';
export type { PhysicsBody, StaticRect, StepOptions, CollisionResult } from '../core/physics/body';
