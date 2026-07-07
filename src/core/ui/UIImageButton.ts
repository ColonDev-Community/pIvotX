// ─── UIImageButton ────────────────────────────────────────────────────────────

import { IPoint } from '../types';
import { UIElement } from './UIElement';

/**
 * A button skinned with an image (or one frame of a spritesheet-style image).
 * Hover/pressed states are shown with scale + opacity, so a single image is
 * enough — no separate hover art needed.
 *
 * @example
 * const img = await AssetLoader.loadImage('/ui/play.png');
 * const play = new UIImageButton(img, Point(280, 200), 64, 64);
 * play.onClick = () => startGame();
 * ui.add(play);
 */
export class UIImageButton extends UIElement {
  readonly tag = 'ui-image-button';

  /** Scale applied while pressed. Default 0.92. */
  public pressedScale = 0.92;
  /** Opacity while hovered. Default 0.85. */
  public hoverOpacity = 0.85;
  /** Disable image smoothing for pixel-art buttons. */
  public pixelPerfect = false;

  /**
   * Optional source rectangle for spritesheet-based skins:
   * `{ x, y, w, h }` in image pixels. Omit to draw the whole image.
   */
  public sourceRect: { x: number; y: number; w: number; h: number } | null = null;

  constructor(
    private _image: HTMLImageElement,
    position: IPoint,
    width?: number,
    height?: number,
  ) {
    super(position, width ?? _image.naturalWidth, height ?? _image.naturalHeight);
  }

  /** Swap the button's image at runtime. */
  setImage(image: HTMLImageElement): void { this._image = image; }

  draw(ctx: CanvasRenderingContext2D): void {
    const img = this._image;
    if (!img.complete || img.naturalWidth === 0) return;

    const scale = this.pressed ? this.pressedScale : 1;
    const w = this.width * scale;
    const h = this.height * scale;
    const x = this.position.x + (this.width - w) / 2;
    const y = this.position.y + (this.height - h) / 2;

    ctx.save();
    ctx.globalAlpha = !this.enabled ? 0.4 : this.hovered && !this.pressed ? this.hoverOpacity : 1;
    if (this.pixelPerfect) ctx.imageSmoothingEnabled = false;

    if (this.sourceRect) {
      const s = this.sourceRect;
      ctx.drawImage(img, s.x, s.y, s.w, s.h, x, y, w, h);
    } else {
      ctx.drawImage(img, x, y, w, h);
    }
    ctx.restore();
  }
}
