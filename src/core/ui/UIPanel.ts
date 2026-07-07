// ─── UIPanel ──────────────────────────────────────────────────────────────────

import { IPoint, CSSColor } from '../types';
import { UIElement } from './UIElement';
import { roundRectPath } from './utils';

/**
 * A container that draws a background and holds child UI elements.
 *
 * Children keep their own positions unless a `layout` is set, in which case
 * the panel stacks them automatically ('column' or 'row') with `gap` spacing
 * inside `padding`. Layout runs each frame, so adding/removing children or
 * resizing children just works.
 *
 * Hit-testing: the panel itself only captures clicks on empty areas if
 * `onClick` is set — children are hit-tested first by UIManager.
 *
 * @example
 * const menu = new UIPanel(Point(200, 120), 200, 0, { layout: 'column', gap: 12 });
 * menu.add(new UIButton('Play',    Point(0, 0)));
 * menu.add(new UIButton('Options', Point(0, 0)));
 * menu.add(new UIButton('Quit',    Point(0, 0)));
 * ui.add(menu);   // panel height auto-grows to fit
 */
export class UIPanel extends UIElement {
  readonly tag = 'ui-panel';

  public children: UIElement[] = [];

  public background: CSSColor | null;
  public borderColor: CSSColor | null;
  public borderWidth: number;
  public radius: number;
  /** Inner padding used by auto-layout. */
  public padding: number;
  /** 'none' = children position themselves; 'column'/'row' = auto-stack. */
  public layout: 'none' | 'column' | 'row';
  /** Space between auto-laid-out children. */
  public gap: number;

  constructor(
    position: IPoint,
    width: number = 200,
    height: number = 150,
    options: {
      background?: CSSColor | null;
      borderColor?: CSSColor;
      borderWidth?: number;
      radius?: number;
      padding?: number;
      layout?: 'none' | 'column' | 'row';
      gap?: number;
    } = {},
  ) {
    super(position, width, height);
    this.background = options.background === undefined ? 'rgba(17, 24, 39, 0.85)' : options.background;
    this.borderColor = options.borderColor ?? null;
    this.borderWidth = options.borderWidth ?? 2;
    this.radius = options.radius ?? 12;
    this.padding = options.padding ?? 16;
    this.layout = options.layout ?? 'none';
    this.gap = options.gap ?? 10;
  }

  /** Add a child element. Chainable. */
  add(child: UIElement): this {
    this.children.push(child);
    return this;
  }

  /** Remove a child element. */
  remove(child: UIElement): this {
    const i = this.children.indexOf(child);
    if (i !== -1) this.children.splice(i, 1);
    return this;
  }

  /** Stack children according to `layout`, growing the panel to fit. */
  private _applyLayout(): void {
    if (this.layout === 'none') return;

    let cursor = this.padding;
    for (const child of this.children) {
      if (!child.visible) continue;
      if (this.layout === 'column') {
        child.position.x = this.position.x + this.padding;
        child.position.y = this.position.y + cursor;
        cursor += child.height + this.gap;
      } else {
        child.position.x = this.position.x + cursor;
        child.position.y = this.position.y + this.padding;
        cursor += child.width + this.gap;
      }
    }
    const content = Math.max(0, cursor - this.gap) + this.padding;
    if (this.layout === 'column') this.height = Math.max(this.height, content);
    else this.width = Math.max(this.width, content);
  }

  /** @internal Children visible for hit-testing (topmost last). */
  get hitTestChildren(): UIElement[] {
    this._applyLayout();
    return this.children;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this._applyLayout();

    ctx.save();
    if (this.background) {
      roundRectPath(ctx, this.position.x, this.position.y, this.width, this.height, this.radius);
      ctx.fillStyle = this.background;
      ctx.fill();
    }
    if (this.borderColor) {
      roundRectPath(ctx, this.position.x, this.position.y, this.width, this.height, this.radius);
      ctx.strokeStyle = this.borderColor;
      ctx.lineWidth = this.borderWidth;
      ctx.stroke();
    }
    ctx.restore();

    for (const child of this.children) {
      if (child.visible) child.draw(ctx);
    }
  }
}
