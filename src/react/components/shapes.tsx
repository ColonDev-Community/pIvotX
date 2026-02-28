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
import { Circle   as CoreCircle    } from '../../core/shapes/Circle';
import { Rectangle as CoreRectangle } from '../../core/shapes/Rectangle';
import { Line      as CoreLine      } from '../../core/shapes/Line';
import { Label     as CoreLabel     } from '../../core/shapes/Label';

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
