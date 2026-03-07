/**
 * pIvotX React Native shape components.
 *
 * Each component registers draw commands via NativeDrawContext,
 * which PivotNativeCanvas batches and sends to the WebView.
 *
 * API mirrors the web React components with one key difference:
 * image-based components use `src: string` (URL) instead of HTMLImageElement,
 * because HTMLImageElement doesn't exist in React Native.
 */

import { useNativeDrawContext } from '../context/NativeDrawContext';
import type { IPoint, CSSColor } from '../../core/types';

// ── PivotCircle ────────────────────────────────────────────────────────────────

export interface PivotNativeCircleProps {
  center:       IPoint;
  radius:       number;
  fill?:        CSSColor;
  stroke?:      CSSColor;
  lineWidth?:   number;
}

export function PivotCircle({ center, radius, fill, stroke, lineWidth }: PivotNativeCircleProps) {
  const { registerCommand } = useNativeDrawContext();

  registerCommand({
    type: 'circle', center, radius,
    fill: fill ?? null, stroke: stroke ?? null,
    lineWidth: lineWidth ?? 1,
  });

  return null;
}

// ── PivotRectangle ─────────────────────────────────────────────────────────────

export interface PivotNativeRectangleProps {
  position:    IPoint;
  width:       number;
  height:      number;
  fill?:       CSSColor;
  stroke?:     CSSColor;
  lineWidth?:  number;
}

export function PivotRectangle({ position, width, height, fill, stroke, lineWidth }: PivotNativeRectangleProps) {
  const { registerCommand } = useNativeDrawContext();

  registerCommand({
    type: 'rectangle', position, width, height,
    fill: fill ?? null, stroke: stroke ?? null,
    lineWidth: lineWidth ?? 1,
  });

  return null;
}

// ── PivotLine ──────────────────────────────────────────────────────────────────

export interface PivotNativeLineProps {
  start:       IPoint;
  end:         IPoint;
  stroke?:     CSSColor;
  lineWidth?:  number;
}

export function PivotLine({ start, end, stroke = '#000', lineWidth }: PivotNativeLineProps) {
  const { registerCommand } = useNativeDrawContext();

  registerCommand({
    type: 'line', start, end,
    stroke, lineWidth: lineWidth ?? 1,
  });

  return null;
}

// ── PivotLabel ─────────────────────────────────────────────────────────────────

export interface PivotNativeLabelProps {
  text:          string;
  position:      IPoint;
  font?:         string;
  fill?:         CSSColor;
  textAlign?:    'left' | 'center' | 'right';
  textBaseline?: 'top'  | 'middle' | 'bottom';
}

export function PivotLabel({
  text, position, font, fill = '#000', textAlign, textBaseline,
}: PivotNativeLabelProps) {
  const { registerCommand } = useNativeDrawContext();

  registerCommand({
    type: 'label', text, position,
    font, fill, textAlign, textBaseline,
  });

  return null;
}

// ── PivotImage ─────────────────────────────────────────────────────────────────

export interface PivotNativeImageProps {
  /** Image URL string. Loaded and cached inside the WebView. */
  src:           string;
  position:      IPoint;
  width?:        number;
  height?:       number;
  opacity?:      number;
  rotation?:     number;
  pixelPerfect?: boolean;
}

export function PivotImage({ src, position, width, height, opacity, rotation, pixelPerfect }: PivotNativeImageProps) {
  const { registerCommand } = useNativeDrawContext();

  registerCommand({
    type: 'image', src, position,
    width: width ?? null, height: height ?? null,
    opacity, rotation, pixelPerfect,
  });

  return null;
}

// ── PivotSprite ────────────────────────────────────────────────────────────────

export interface PivotNativeSpriteProps {
  /** URL of the spritesheet image. */
  sheetSrc:      string;
  /** Width of one frame in the spritesheet. */
  frameWidth:    number;
  /** Height of one frame in the spritesheet. */
  frameHeight:   number;
  /** Top-left draw position. */
  position:      IPoint;
  /** Frame index to display. */
  frame:         number;
  /** Scale multiplier (default 1). */
  scale?:        number;
  /** Mirror horizontally. */
  flipX?:        boolean;
  /** Mirror vertically. */
  flipY?:        boolean;
  /** Opacity from 0 to 1. */
  opacity?:      number;
  /** Disable image smoothing for crisp pixel art (default true). */
  pixelPerfect?: boolean;
}

export function PivotSprite({
  sheetSrc, frameWidth, frameHeight, position, frame,
  scale, flipX, flipY, opacity, pixelPerfect,
}: PivotNativeSpriteProps) {
  const { registerCommand } = useNativeDrawContext();

  registerCommand({
    type: 'sprite', sheetSrc, frameWidth, frameHeight,
    position, frame,
    scale, flipX, flipY, opacity, pixelPerfect,
  });

  return null;
}

// ── PivotPlatform ──────────────────────────────────────────────────────────────

export interface PivotNativePlatformProps {
  position:   IPoint;
  width:      number;
  height:     number;
  fill?:      CSSColor | null;
  stroke?:    CSSColor | null;
  lineWidth?: number;
  oneWay?:    boolean;
}

export function PivotPlatform({ position, width, height, fill, stroke, lineWidth, oneWay }: PivotNativePlatformProps) {
  const { registerCommand } = useNativeDrawContext();

  registerCommand({
    type: 'platform', position, width, height,
    fill: fill ?? null, stroke: stroke ?? null,
    lineWidth, oneWay,
  });

  return null;
}

// ── PivotTilemap ───────────────────────────────────────────────────────────────

export interface PivotNativeTilemapProps {
  /** URL of the tileset spritesheet image. */
  sheetSrc:      string;
  /** Width of one tile frame in the spritesheet. */
  frameWidth:    number;
  /** Height of one tile frame in the spritesheet. */
  frameHeight:   number;
  /** 2D array of frame indices (-1 = empty). */
  mapData:       number[][];
  /** Rendered size of each tile in pixels. */
  tileSize:      number;
  /** Array of frame indices considered solid (JSON-serializable). */
  solidTiles?:   number[];
  /** Disable image smoothing for crisp pixel art (default true). */
  pixelPerfect?: boolean;
}

export function PivotTilemap({
  sheetSrc, frameWidth, frameHeight, mapData, tileSize,
  solidTiles, pixelPerfect,
}: PivotNativeTilemapProps) {
  const { registerCommand } = useNativeDrawContext();

  registerCommand({
    type: 'tilemap', sheetSrc, frameWidth, frameHeight,
    mapData, tileSize, solidTiles, pixelPerfect,
  });

  return null;
}

// ── PivotTiledBackground ───────────────────────────────────────────────────────

export interface PivotNativeTiledBackgroundProps {
  /** URL of the tile image. */
  src:             string;
  /** Viewport width. */
  canvasWidth:     number;
  /** Viewport height. */
  canvasHeight:    number;
  /** Horizontal scroll offset. */
  scrollX?:        number;
  /** Vertical scroll offset. */
  scrollY?:        number;
  /** Opacity from 0 to 1. */
  opacity?:        number;
  /** Parallax speed multiplier (1 = full, 0.5 = half, etc.). */
  parallaxFactor?: number;
}

export function PivotTiledBackground({
  src, canvasWidth, canvasHeight, scrollX, scrollY, opacity, parallaxFactor,
}: PivotNativeTiledBackgroundProps) {
  const { registerCommand } = useNativeDrawContext();

  registerCommand({
    type: 'tiledBackground', src, canvasWidth, canvasHeight,
    scrollX: (scrollX ?? 0) * (parallaxFactor ?? 1),
    scrollY: (scrollY ?? 0) * (parallaxFactor ?? 1),
    opacity,
  });

  return null;
}
