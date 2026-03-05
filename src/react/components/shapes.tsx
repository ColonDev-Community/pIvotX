/**
 * pIvotX React shape components.
 *
 * Each component draws itself onto the nearest <PivotCanvas> using
 * useEffect + the shared CanvasRenderingContext2D from context.
 *
 * They re-draw whenever their props change, so you can drive animation
 * entirely through React state.
 */

import { useEffect } from 'react';
import { useCanvasContext } from '../PivotCanvas';
import { IPoint, CSSColor } from '../../core/types';
import { Circle    as CoreCircle     } from '../../core/shapes/Circle';
import { Rectangle as CoreRectangle  } from '../../core/shapes/Rectangle';
import { Line      as CoreLine       } from '../../core/shapes/Line';
import { Label     as CoreLabel      } from '../../core/shapes/Label';
import { GameImage as CoreGameImage  } from '../../core/shapes/GameImage';
import { Sprite    as CoreSprite     } from '../../core/shapes/Sprite';
import { Platform  as CorePlatform   } from '../../core/shapes/Platform';
import { Tilemap   as CoreTilemap    } from '../../core/tilemap/Tilemap';
import type { SpriteSheet }            from '../../core/shapes/Sprite';

// ── PivotCircle ────────────────────────────────────────────────────────────────

export interface PivotCircleProps {
  center:       IPoint;
  radius:       number;
  fill?:        CSSColor;
  stroke?:      CSSColor;
  lineWidth?:   number;
}

/**
 * Draws a circle on the parent <PivotCanvas>.
 *
 * @example
 * <PivotCircle center={{ x: 100, y: 100 }} radius={40} fill="tomato" stroke="#333" lineWidth={2} />
 */
export function PivotCircle({ center, radius, fill, stroke, lineWidth = 1 }: PivotCircleProps) {
  const ctx = useCanvasContext();

  useEffect(() => {
    if (!ctx) return;
    const shape       = new CoreCircle(center, radius);
    shape.fillColor   = fill   ?? null;
    shape.strokeColor = stroke ?? null;
    shape.lineWidth   = lineWidth;
    shape.draw(ctx);
  });

  return null;
}

// ── PivotRectangle ─────────────────────────────────────────────────────────────

export interface PivotRectangleProps {
  position:    IPoint;
  width:       number;
  height:      number;
  fill?:       CSSColor;
  stroke?:     CSSColor;
  lineWidth?:  number;
}

/**
 * Draws a rectangle on the parent <PivotCanvas>.
 *
 * @example
 * <PivotRectangle position={{ x: 50, y: 50 }} width={120} height={80} fill="skyblue" />
 */
export function PivotRectangle({ position, width, height, fill, stroke, lineWidth = 1 }: PivotRectangleProps) {
  const ctx = useCanvasContext();

  useEffect(() => {
    if (!ctx) return;
    const shape       = new CoreRectangle(position, width, height);
    shape.fillColor   = fill   ?? null;
    shape.strokeColor = stroke ?? null;
    shape.lineWidth   = lineWidth;
    shape.draw(ctx);
  });

  return null;
}

// ── PivotLine ──────────────────────────────────────────────────────────────────

export interface PivotLineProps {
  start:       IPoint;
  end:         IPoint;
  stroke?:     CSSColor;
  lineWidth?:  number;
}

/**
 * Draws a line on the parent <PivotCanvas>.
 *
 * @example
 * <PivotLine start={{ x: 0, y: 0 }} end={{ x: 200, y: 150 }} stroke="crimson" lineWidth={3} />
 */
export function PivotLine({ start, end, stroke = '#000', lineWidth = 1 }: PivotLineProps) {
  const ctx = useCanvasContext();

  useEffect(() => {
    if (!ctx) return;
    const shape       = new CoreLine(start, end);
    shape.strokeColor = stroke;
    shape.lineWidth   = lineWidth;
    shape.draw(ctx);
  });

  return null;
}

// ── PivotLabel ─────────────────────────────────────────────────────────────────

export interface PivotLabelProps {
  text:          string;
  position:      IPoint;
  font?:         string;
  fill?:         CSSColor;
  textAlign?:    'left' | 'center' | 'right';
  textBaseline?: 'top'  | 'middle' | 'bottom';
}

/**
 * Draws text on the parent <PivotCanvas>.
 *
 * @example
 * <PivotLabel text="Score: 0" position={{ x: 300, y: 20 }} font="bold 20px Arial" fill="white" />
 */
export function PivotLabel({
  text, position, font, fill = '#000',
  textAlign = 'center', textBaseline = 'middle',
}: PivotLabelProps) {
  const ctx = useCanvasContext();

  useEffect(() => {
    if (!ctx) return;
    const shape          = new CoreLabel(text, position, font);
    shape.fillColor      = fill;
    shape.textAlign      = textAlign;
    shape.textBaseline   = textBaseline;
    shape.draw(ctx);
  });

  return null;
}

// ── PivotImage ─────────────────────────────────────────────────────────────────

export interface PivotImageProps {
  /** Image source: a URL string (auto-loads) or a pre-loaded HTMLImageElement. */
  src:        string | HTMLImageElement;
  /** Top-left draw position. */
  position:   IPoint;
  /** Display width. Omit to use natural width. */
  width?:     number;
  /** Display height. Omit to use natural height. */
  height?:    number;
  /** Opacity from 0 to 1. */
  opacity?:   number;
  /** Rotation in radians. */
  rotation?:  number;
}

/**
 * Draws an image on the parent <PivotCanvas>.
 *
 * @example
 * <PivotImage src="/hero.png" position={{ x: 100, y: 50 }} width={64} height={64} />
 */
export function PivotImage({ src, position, width, height, opacity, rotation }: PivotImageProps) {
  const ctx = useCanvasContext();

  useEffect(() => {
    if (!ctx) return;
    const shape = new CoreGameImage(position, src);
    if (width    != null) shape.width    = width;
    if (height   != null) shape.height   = height;
    if (opacity  != null) shape.opacity  = opacity;
    if (rotation != null) shape.rotation = rotation;
    shape.draw(ctx);
  });

  return null;
}

// ── PivotSprite ────────────────────────────────────────────────────────────────

export interface PivotSpriteProps {
  /** Top-left draw position. */
  position:  IPoint;
  /** The SpriteSheet to draw from. */
  sheet:     SpriteSheet;
  /** Frame index to display. */
  frame:     number;
  /** Scale multiplier (default 1). */
  scale?:    number;
  /** Mirror horizontally. */
  flipX?:    boolean;
  /** Mirror vertically. */
  flipY?:    boolean;
  /** Opacity from 0 to 1. */
  opacity?:  number;
}

/**
 * Draws a single sprite frame on the parent <PivotCanvas>.
 *
 * @example
 * <PivotSprite position={{ x: 100, y: 200 }} sheet={heroSheet} frame={frameRef.current} scale={2} />
 */
export function PivotSprite({ position, sheet, frame, scale, flipX, flipY, opacity }: PivotSpriteProps) {
  const ctx = useCanvasContext();

  useEffect(() => {
    if (!ctx) return;
    const sprite   = new CoreSprite(position, sheet);
    sprite.frame   = frame;
    if (scale   != null) sprite.scale   = scale;
    if (flipX   != null) sprite.flipX   = flipX;
    if (flipY   != null) sprite.flipY   = flipY;
    if (opacity != null) sprite.opacity = opacity;
    sprite.draw(ctx);
  });

  return null;
}

// ── PivotPlatform ──────────────────────────────────────────────────────────────

export interface PivotPlatformProps {
  /** Top-left corner position. */
  position:   IPoint;
  /** Width in pixels. */
  width:      number;
  /** Height in pixels. */
  height:     number;
  /** Fill colour. */
  fill?:      CSSColor | null;
  /** Stroke colour. */
  stroke?:    CSSColor | null;
  /** Stroke thickness. */
  lineWidth?: number;
  /** Allow jump-through from below. */
  oneWay?:    boolean;
}

/**
 * Draws a platform on the parent <PivotCanvas>.
 *
 * @example
 * <PivotPlatform position={{ x: 0, y: 350 }} width={600} height={50} fill="#4a7c59" />
 */
export function PivotPlatform({ position, width, height, fill, stroke, lineWidth, oneWay }: PivotPlatformProps) {
  const ctx = useCanvasContext();

  useEffect(() => {
    if (!ctx) return;
    const plat = new CorePlatform(position, width, height);
    if (fill      !== undefined) plat.fillColor   = fill ?? null;
    if (stroke    !== undefined) plat.strokeColor  = stroke ?? null;
    if (lineWidth != null)       plat.lineWidth    = lineWidth;
    if (oneWay    != null)       plat.oneWay       = oneWay;
    plat.draw(ctx);
  });

  return null;
}

// ── PivotTilemap ───────────────────────────────────────────────────────────────

export interface PivotTilemapProps {
  /** SpriteSheet containing tile graphics. */
  sheet:       SpriteSheet;
  /** 2D array of frame indices (-1 = empty). */
  mapData:     number[][];
  /** Rendered size of each tile in pixels. */
  tileSize:    number;
  /** Set of frame indices considered solid (optional, for collision queries). */
  solidTiles?: Set<number>;
}

/**
 * Draws a grid-based tile map on the parent <PivotCanvas>.
 *
 * @example
 * <PivotTilemap sheet={tileSheet} mapData={levelData} tileSize={32} />
 */
export function PivotTilemap({ sheet, mapData, tileSize, solidTiles }: PivotTilemapProps) {
  const ctx = useCanvasContext();

  useEffect(() => {
    if (!ctx) return;
    const tm = new CoreTilemap(sheet, mapData, tileSize);
    if (solidTiles) tm.solidTiles = solidTiles;
    tm.draw(ctx);
  });

  return null;
}
