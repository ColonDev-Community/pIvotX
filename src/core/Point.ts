import { IPoint } from './types';

/**
 * Creates a plain {x, y} point object.
 * Used as a coordinate everywhere in pIvotX.
 *
 * @example
 * const p = Point(100, 200);
 * console.log(p.x, p.y); // 100 200
 */
export function Point(x: number, y: number): IPoint {
  return { x, y };
}
