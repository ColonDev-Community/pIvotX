// ─── Shared types ─────────────────────────────────────────────────────────────

export interface IPoint {
  x: number;
  y: number;
}

export type CSSColor = string;

export interface IDrawable {
  readonly tag: string;
  draw(ctx: CanvasRenderingContext2D): void;
}

export interface IShape extends IDrawable {
  fillColor:   CSSColor | null;
  strokeColor: CSSColor | null;
  lineWidth:   number;
}

export type LoopCallback = (dt: number) => void;

/** Axis-Aligned Bounding Box for collision detection. */
export interface AABB {
  left:   number;
  right:  number;
  top:    number;
  bottom: number;
}
