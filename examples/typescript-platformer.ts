/**
 * TypeScript example — Showcasing all new v1.1 features.
 *
 * Demonstrates full type safety with:
 *   AssetLoader, GameImage, Sprite, SpriteSheet, SpriteAnimator,
 *   AnimationClip, Camera, TiledBackground, Platform, Tilemap,
 *   aabbOverlap, aabbOverlapDepth, createAABB, AABB
 *
 * To compile:
 *   npx tsc typescript-platformer.ts --target ES2017 --lib ES2017,DOM --moduleResolution bundler
 */

import {
  Canvas, Point, Label, Rectangle,
  AssetLoader, GameImage,
  Sprite, SpriteAnimator,
  Camera, TiledBackground,
  Platform, Tilemap,
  createAABB, aabbOverlap, aabbOverlapDepth,
} from '@colon-dev/pivotx';
import type { IPoint, SpriteSheet, AnimationClip, AABB } from '@colon-dev/pivotx';

// ── Game state types ───────────────────────────────────────────────────────────

interface PlayerState {
  pos:      IPoint;
  vel:      IPoint;
  width:    number;
  height:   number;
  speed:    number;
  jumpForce: number;
  grounded: boolean;
}

interface CoinEntity {
  pos: IPoint;
  collected: boolean;
}

interface GameState {
  player:  PlayerState;
  coins:   CoinEntity[];
  score:   number;
  gravity: number;
}

// ── Asset manifest — typed keys ────────────────────────────────────────────────

const ASSET_MANIFEST = {
  hero:    '/sprites/hero-sheet.png',
  tileset: '/tiles/tileset.png',
  coin:    '/sprites/coin-sheet.png',
  sky:     '/bg/sky-tile.png',
  hills:   '/bg/hills-tile.png',
} as const;

// ── Main ───────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // AssetLoader.loadAssets — fully typed: assets.hero is HTMLImageElement
  const assets = await AssetLoader.loadAssets(ASSET_MANIFEST);

  const canvas = new Canvas('game');
  const W: number = canvas.getWidth();
  const H: number = canvas.getHeight();

  // ── Camera ────────────────────────────────────────────────────────────────
  const camera = new Camera(W, H);

  // ── Parallax backgrounds ─────────────────────────────────────────────────
  const sky = new TiledBackground(assets.sky, W, H);
  sky.parallaxFactor = 0.2;

  const hills = new TiledBackground(assets.hills, W, H);
  hills.parallaxFactor = 0.5;

  // ── Tilemap ──────────────────────────────────────────────────────────────
  const TILE_SIZE: number = 32;
  const tileSheet: SpriteSheet = Sprite.createSheet(assets.tileset, 16, 16, 8);

  const mapData: number[][] = [
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 7, 7,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 0, 1, 2,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1, 7, 7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1, 0, 1, 2,-1,-1,-1,-1,-1,-1,-1,-1, 0, 1, 1, 2,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [ 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [ 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
  ];

  const tilemap = new Tilemap(tileSheet, mapData, TILE_SIZE);
  tilemap.solidTiles = new Set([0, 1, 2, 3, 4, 5, 6, 7]);

  const WORLD_W: number = tilemap.widthInPixels;
  const WORLD_H: number = tilemap.heightInPixels;

  // ── Platforms (standalone, with oneWay) ───────────────────────────────────
  const platforms: Platform[] = [
    (() => {
      const p = new Platform(Point(3 * TILE_SIZE, 6 * TILE_SIZE), 3 * TILE_SIZE, 8);
      p.fillColor = '#8b5e3c';
      p.oneWay = true;   // can jump through from below
      return p;
    })(),
  ];

  // ── Sprite + Animator ────────────────────────────────────────────────────
  const heroSheet: SpriteSheet = Sprite.createSheet(assets.hero, 16, 16, 10);
  const heroSprite = new Sprite(Point(0, 0), heroSheet);
  heroSprite.scale = 2;

  // AnimationClip — typed
  const idleClip: AnimationClip = { frames: [0, 1, 2, 3], fps: 5, loop: true };
  const runClip:  AnimationClip = { frames: [4, 5, 6, 7], fps: 8, loop: true };
  const jumpClip: AnimationClip = { frames: [8, 9],       fps: 4, loop: false };

  const animator = new SpriteAnimator(heroSprite);
  animator.addClip('idle', idleClip).addClip('run', runClip).addClip('jump', jumpClip);
  animator.play('idle');

  // ── Coin sprites ─────────────────────────────────────────────────────────
  const coinSheet: SpriteSheet = Sprite.createSheet(assets.coin, 16, 16, 6);

  // ── Game state — fully typed ─────────────────────────────────────────────
  const state: GameState = {
    player: {
      pos:       Point(2 * TILE_SIZE, 7 * TILE_SIZE),
      vel:       Point(0, 0),
      width:     24,
      height:    30,
      speed:     200,
      jumpForce: -420,
      grounded:  false,
    },
    coins: [
      { pos: Point( 5 * TILE_SIZE, 6 * TILE_SIZE), collected: false },
      { pos: Point( 9 * TILE_SIZE, 4 * TILE_SIZE), collected: false },
      { pos: Point(13 * TILE_SIZE, 3 * TILE_SIZE), collected: false },
      { pos: Point(16 * TILE_SIZE, 6 * TILE_SIZE), collected: false },
      { pos: Point(18 * TILE_SIZE, 1 * TILE_SIZE), collected: false },
    ],
    score:   0,
    gravity: 800,
  };

  // ── Input ────────────────────────────────────────────────────────────────
  const keys: Record<string, boolean> = {};
  document.addEventListener('keydown', (e: KeyboardEvent) => { keys[e.key] = true;  });
  document.addEventListener('keyup',   (e: KeyboardEvent) => { keys[e.key] = false; });

  let coinTimer: number = 0;
  let coinFrame: number = 0;

  // ── Game loop — note dt is typed as number ───────────────────────────────
  canvas.startLoop((dt: number) => {
    canvas.clear();
    const p = state.player;

    // Input
    p.vel.x = 0;
    if (keys['ArrowRight'] || keys['d']) { p.vel.x =  p.speed; heroSprite.flipX = false; }
    if (keys['ArrowLeft']  || keys['a']) { p.vel.x = -p.speed; heroSprite.flipX = true;  }
    if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && p.grounded) {
      p.vel.y = p.jumpForce;
      p.grounded = false;
    }

    // Physics
    p.vel.y += state.gravity * dt;
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;

    // Tilemap collision — horizontal pass
    p.grounded = false;
    let pBox: AABB = createAABB(p.pos.x, p.pos.y, p.width, p.height);

    for (const tileBox of tilemap.getSolidTilesInRegion(pBox)) {
      const depth = aabbOverlapDepth(createAABB(p.pos.x, p.pos.y, p.width, p.height), tileBox);
      if (depth && depth.x < depth.y) {
        p.pos.x += p.vel.x > 0 ? -depth.x : depth.x;
        p.vel.x = 0;
      }
    }

    // Tilemap collision — vertical pass
    pBox = createAABB(p.pos.x, p.pos.y, p.width, p.height);
    for (const tileBox of tilemap.getSolidTilesInRegion(pBox)) {
      const depth = aabbOverlapDepth(createAABB(p.pos.x, p.pos.y, p.width, p.height), tileBox);
      if (depth && depth.y <= depth.x) {
        if (p.vel.y > 0) { p.pos.y -= depth.y; p.vel.y = 0; p.grounded = true; }
        else              { p.pos.y += depth.y; p.vel.y = 0; }
      }
    }

    // Platform collision (oneWay)
    pBox = createAABB(p.pos.x, p.pos.y, p.width, p.height);
    for (const plat of platforms) {
      if (plat.oneWay && p.vel.y <= 0) continue;
      const depth = aabbOverlapDepth(pBox, plat.bounds);
      if (depth && depth.y < depth.x && p.vel.y > 0) {
        p.pos.y -= depth.y;
        p.vel.y = 0;
        p.grounded = true;
      }
    }

    // Coin collection
    pBox = createAABB(p.pos.x, p.pos.y, p.width, p.height);
    for (const coin of state.coins) {
      if (coin.collected) continue;
      const coinBox: AABB = createAABB(coin.pos.x - 12, coin.pos.y - 12, 24, 24);
      if (aabbOverlap(pBox, coinBox)) {
        coin.collected = true;
        state.score += 100;
      }
    }

    // Coin animation
    coinTimer += dt;
    if (coinTimer > 0.12) { coinTimer = 0; coinFrame = (coinFrame + 1) % coinSheet.totalFrames; }

    // Player animation
    if (!p.grounded)    animator.play('jump');
    else if (p.vel.x !== 0) animator.play('run');
    else                animator.play('idle');
    animator.update(dt);

    heroSprite.position = Point(p.pos.x - 4, p.pos.y - 2);

    // Parallax
    sky.scroll(p.vel.x * dt);
    hills.scroll(p.vel.x * dt);

    // Camera
    camera.follow({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, 0.08);
    camera.clamp(WORLD_W, WORLD_H);

    // ── Draw ──
    // Backgrounds (screen space)
    canvas.add(sky);
    canvas.add(hills);

    // World (camera space)
    camera.begin(canvas.ctx);
    canvas.add(tilemap);

    for (const plat of platforms) canvas.add(plat);

    for (const coin of state.coins) {
      if (coin.collected) continue;
      const cs = new Sprite(Point(coin.pos.x - 16, coin.pos.y - 16), coinSheet);
      cs.frame = coinFrame;
      cs.scale = 2;
      canvas.add(cs);
    }

    canvas.add(heroSprite);
    camera.end(canvas.ctx);

    // HUD (screen space)
    const scoreLbl = new Label(`Score: ${state.score}`, Point(14, 18), 'bold 16px Arial');
    scoreLbl.fillColor = '#FFD700';
    scoreLbl.textAlign = 'left';
    canvas.add(scoreLbl);

    // Mouse → world coordinate demo (Camera.screenToWorld)
    // const worldPos: IPoint = camera.screenToWorld(Point(mouseX, mouseY));
  });
}

main();
