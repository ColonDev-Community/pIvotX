// ─── Asset Loading ────────────────────────────────────────────────────────────

/**
 * Utility for preloading image assets before starting the game loop.
 *
 * @example
 * // Single image
 * const heroImg = await AssetLoader.loadImage('/hero.png');
 *
 * // Batch loading
 * const assets = await AssetLoader.loadAssets({
 *   hero:       '/sprites/hero.png',
 *   background: '/bg/sky.png',
 *   tileset:    '/tiles/ground.png',
 * });
 * // assets.hero, assets.background, assets.tileset — all HTMLImageElement
 */
export class AssetLoader {
  /**
   * Load a single image from a URL.
   * Resolves with the HTMLImageElement once fully loaded.
   */
  static loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload  = () => resolve(img);
      img.onerror = () => reject(new Error(`pIvotX: Failed to load image "${src}"`));
      img.src = src;
    });
  }

  /**
   * Load multiple images in parallel.
   * Pass a manifest object mapping friendly names to URLs.
   * Returns a record with the same keys, each holding the loaded HTMLImageElement.
   *
   * @example
   * const assets = await AssetLoader.loadAssets({
   *   player: '/sprites/player.png',
   *   enemy:  '/sprites/enemy.png',
   * });
   * const sprite = new Sprite(Point(0, 0), Sprite.createSheet(assets.player, 32, 32));
   */
  static loadAssets<T extends Record<string, string>>(
    manifest: T,
  ): Promise<{ [K in keyof T]: HTMLImageElement }> {
    const keys = Object.keys(manifest) as (keyof T)[];
    const promises = keys.map((key) => AssetLoader.loadImage(manifest[key] as string));

    return Promise.all(promises).then((images) => {
      const result = {} as { [K in keyof T]: HTMLImageElement };
      keys.forEach((key, i) => {
        result[key] = images[i];
      });
      return result;
    });
  }
}
