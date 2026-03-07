// ─── React Native Bridge Types ─────────────────────────────────────────────────

import type { IPoint, CSSColor } from '../../core/types';

// ── Draw Commands ──────────────────────────────────────────────────────────────

/** Sent from RN → WebView to draw shapes on the canvas. */
export type DrawCommand =
  | ClearCommand
  | CircleCommand
  | RectangleCommand
  | LineCommand
  | LabelCommand
  | ImageCommand
  | SpriteCommand
  | PlatformCommand
  | TilemapCommand
  | TiledBackgroundCommand
  | CameraBeginCommand
  | CameraEndCommand;

export interface ClearCommand {
  type: 'clear';
}

export interface CircleCommand {
  type:       'circle';
  center:     IPoint;
  radius:     number;
  fill?:      CSSColor | null;
  stroke?:    CSSColor | null;
  lineWidth?: number;
}

export interface RectangleCommand {
  type:       'rectangle';
  position:   IPoint;
  width:      number;
  height:     number;
  fill?:      CSSColor | null;
  stroke?:    CSSColor | null;
  lineWidth?: number;
}

export interface LineCommand {
  type:       'line';
  start:      IPoint;
  end:        IPoint;
  stroke?:    CSSColor | null;
  lineWidth?: number;
}

export interface LabelCommand {
  type:          'label';
  text:          string;
  position:      IPoint;
  font?:         string;
  fill?:         CSSColor | null;
  textAlign?:    'left' | 'center' | 'right';
  textBaseline?: 'top' | 'middle' | 'bottom';
}

export interface ImageCommand {
  type:          'image';
  src:           string;
  position:      IPoint;
  width?:        number | null;
  height?:       number | null;
  opacity?:      number;
  rotation?:     number;
  pixelPerfect?: boolean;
}

export interface SpriteCommand {
  type:          'sprite';
  sheetSrc:      string;
  frameWidth:    number;
  frameHeight:   number;
  position:      IPoint;
  frame:         number;
  scale?:        number;
  flipX?:        boolean;
  flipY?:        boolean;
  opacity?:      number;
  pixelPerfect?: boolean;
}

export interface PlatformCommand {
  type:       'platform';
  position:   IPoint;
  width:      number;
  height:     number;
  fill?:      CSSColor | null;
  stroke?:    CSSColor | null;
  lineWidth?: number;
  oneWay?:    boolean;
}

export interface TilemapCommand {
  type:          'tilemap';
  sheetSrc:      string;
  frameWidth:    number;
  frameHeight:   number;
  mapData:       number[][];
  tileSize:      number;
  solidTiles?:   number[];
  pixelPerfect?: boolean;
}

export interface TiledBackgroundCommand {
  type:            'tiledBackground';
  src:             string;
  canvasWidth:     number;
  canvasHeight:    number;
  scrollX?:        number;
  scrollY?:        number;
  opacity?:        number;
  parallaxFactor?: number;
}

export interface CameraBeginCommand {
  type:     'cameraBegin';
  position: IPoint;
  zoom:     number;
}

export interface CameraEndCommand {
  type: 'cameraEnd';
}

// ── Bridge Events ──────────────────────────────────────────────────────────────

/** Sent from WebView → RN to notify about game events. */
export type BridgeEvent =
  | TouchBridgeEvent
  | GameBridgeEvent;

export interface TouchBridgeEvent {
  type:    'touch';
  action:  'start' | 'move' | 'end';
  touches: Array<{ x: number; y: number; id: number }>;
}

export interface GameBridgeEvent {
  type:    'gameEvent';
  name:    string;
  data?:   unknown;
}

// ── Component Props ────────────────────────────────────────────────────────────

export interface PivotNativeCanvasProps {
  /** Canvas width in pixels. */
  width?:     number;
  /** Canvas height in pixels. */
  height?:    number;
  /** Background CSS colour. */
  background?: string;
  /** Optional game code string that runs inside the WebView with full PivotX API. */
  script?:    string;
  /** Called when the WebView game emits an event. */
  onGameEvent?: (name: string, data?: unknown) => void;
  /** Called on touch events from the canvas. */
  onTouch?: (action: 'start' | 'move' | 'end', touches: Array<{ x: number; y: number; id: number }>) => void;
  /**
   * When true, touch coordinates are transformed from screen-space to world-space
   * by adding the current camera offset. Useful when you need to know which world
   * position the user tapped. Default: false (screen-space).
   */
  worldSpaceTouch?: boolean;
  /** React Native ViewStyle. */
  style?:     Record<string, unknown>;
  /** Children — PivotNative* shape components. */
  children?:  React.ReactNode;
}

export interface PivotNativeCanvasHandle {
  /** Send a message to the WebView game code. */
  postMessage(data: unknown): void;
  /** Inject raw JavaScript into the WebView. */
  injectScript(js: string): void;
}
