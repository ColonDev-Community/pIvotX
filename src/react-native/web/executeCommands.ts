/**
 * Direct command executor for web platform.
 *
 * Mirrors the WebView bridge renderer (renderer.ts) but runs natively
 * in the browser — no WebView needed.
 */

import type { DrawCommand } from '../bridge/types';

// ── Image cache ──────────────────────────────────────────────────────────────

const imageCache = new Map<string, HTMLImageElement>();

function getImage(src: string): HTMLImageElement {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  imageCache.set(src, img);
  return img;
}

function isLoaded(img: HTMLImageElement): boolean {
  return img.complete && img.naturalWidth > 0;
}

// ── SpriteSheet cache ────────────────────────────────────────────────────────

interface SheetEntry {
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  totalFrames: number;
  ready: boolean;
}

const sheetCache = new Map<string, SheetEntry>();

function getSheet(src: string, fw: number, fh: number): SheetEntry {
  const key = `${src}:${fw}:${fh}`;
  const cached = sheetCache.get(key);
  if (cached) return cached;

  const img = getImage(src);
  const entry: SheetEntry = {
    image: img,
    frameWidth: fw,
    frameHeight: fh,
    columns: 0,
    totalFrames: 0,
    ready: false,
  };

  const tryInit = () => {
    if (isLoaded(img)) {
      entry.columns = Math.floor(img.naturalWidth / fw);
      const rows = Math.floor(img.naturalHeight / fh);
      entry.totalFrames = entry.columns * rows;
      entry.ready = true;
    }
  };

  img.addEventListener('load', tryInit);
  tryInit();

  sheetCache.set(key, entry);
  return entry;
}

// ── Command executors ────────────────────────────────────────────────────────

function execClear(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function execCircle(ctx: CanvasRenderingContext2D, cmd: DrawCommand & { type: 'circle' }) {
  ctx.beginPath();
  ctx.arc(cmd.center.x, cmd.center.y, cmd.radius, 0, Math.PI * 2);
  if (cmd.fill) { ctx.fillStyle = cmd.fill; ctx.fill(); }
  if (cmd.stroke) { ctx.strokeStyle = cmd.stroke; ctx.lineWidth = cmd.lineWidth ?? 1; ctx.stroke(); }
}

function execRectangle(ctx: CanvasRenderingContext2D, cmd: DrawCommand & { type: 'rectangle' }) {
  ctx.beginPath();
  ctx.rect(cmd.position.x, cmd.position.y, cmd.width, cmd.height);
  if (cmd.fill) { ctx.fillStyle = cmd.fill; ctx.fill(); }
  if (cmd.stroke) { ctx.strokeStyle = cmd.stroke; ctx.lineWidth = cmd.lineWidth ?? 1; ctx.stroke(); }
}

function execLine(ctx: CanvasRenderingContext2D, cmd: DrawCommand & { type: 'line' }) {
  ctx.beginPath();
  ctx.strokeStyle = cmd.stroke ?? '#000';
  ctx.lineWidth = cmd.lineWidth ?? 1;
  ctx.moveTo(cmd.start.x, cmd.start.y);
  ctx.lineTo(cmd.end.x, cmd.end.y);
  ctx.stroke();
}

function execLabel(ctx: CanvasRenderingContext2D, cmd: DrawCommand & { type: 'label' }) {
  ctx.font = cmd.font ?? '16px sans-serif';
  ctx.fillStyle = cmd.fill ?? '#000';
  ctx.textAlign = (cmd.textAlign ?? 'center') as CanvasTextAlign;
  ctx.textBaseline = (cmd.textBaseline ?? 'middle') as CanvasTextBaseline;
  ctx.fillText(cmd.text, cmd.position.x, cmd.position.y);
}

function execImage(ctx: CanvasRenderingContext2D, cmd: DrawCommand & { type: 'image' }) {
  const img = getImage(cmd.src);
  if (!isLoaded(img)) return;

  const w = cmd.width ?? img.naturalWidth;
  const h = cmd.height ?? img.naturalHeight;

  ctx.save();
  ctx.globalAlpha = cmd.opacity ?? 1;
  if (cmd.pixelPerfect) ctx.imageSmoothingEnabled = false;

  if (cmd.rotation) {
    const cx = cmd.position.x + w / 2;
    const cy = cmd.position.y + h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(cmd.rotation);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
  } else {
    ctx.drawImage(img, cmd.position.x, cmd.position.y, w, h);
  }
  ctx.restore();
}

function execSprite(ctx: CanvasRenderingContext2D, cmd: DrawCommand & { type: 'sprite' }) {
  const sheet = getSheet(cmd.sheetSrc, cmd.frameWidth, cmd.frameHeight);
  if (!sheet.ready) return;

  const frame = ((cmd.frame % sheet.totalFrames) + sheet.totalFrames) % sheet.totalFrames;
  const col = frame % sheet.columns;
  const row = Math.floor(frame / sheet.columns);
  const sx = col * sheet.frameWidth;
  const sy = row * sheet.frameHeight;
  const scale = cmd.scale ?? 1;
  const dw = sheet.frameWidth * scale;
  const dh = sheet.frameHeight * scale;

  ctx.save();
  ctx.globalAlpha = cmd.opacity ?? 1;
  if (cmd.pixelPerfect !== false) ctx.imageSmoothingEnabled = false;

  const cx = cmd.position.x + dw / 2;
  const cy = cmd.position.y + dh / 2;
  ctx.translate(cx, cy);
  ctx.scale(cmd.flipX ? -1 : 1, cmd.flipY ? -1 : 1);
  ctx.drawImage(sheet.image, sx, sy, sheet.frameWidth, sheet.frameHeight, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

function execPlatform(ctx: CanvasRenderingContext2D, cmd: DrawCommand & { type: 'platform' }) {
  if (cmd.fill) { ctx.fillStyle = cmd.fill; ctx.fillRect(cmd.position.x, cmd.position.y, cmd.width, cmd.height); }
  if (cmd.stroke) { ctx.strokeStyle = cmd.stroke; ctx.lineWidth = cmd.lineWidth ?? 1; ctx.strokeRect(cmd.position.x, cmd.position.y, cmd.width, cmd.height); }
}

function execTilemap(ctx: CanvasRenderingContext2D, cmd: DrawCommand & { type: 'tilemap' }) {
  const sheet = getSheet(cmd.sheetSrc, cmd.frameWidth, cmd.frameHeight);
  if (!sheet.ready) return;

  const ts = cmd.tileSize;
  const prev = ctx.imageSmoothingEnabled;
  if (cmd.pixelPerfect !== false) ctx.imageSmoothingEnabled = false;

  for (let r = 0; r < cmd.mapData.length; r++) {
    const rowData = cmd.mapData[r];
    for (let c = 0; c < rowData.length; c++) {
      const fi = rowData[c];
      if (fi < 0) continue;
      const srcCol = fi % sheet.columns;
      const srcRow = Math.floor(fi / sheet.columns);
      const sx = srcCol * sheet.frameWidth;
      const sy = srcRow * sheet.frameHeight;
      ctx.drawImage(sheet.image, sx, sy, sheet.frameWidth, sheet.frameHeight, c * ts, r * ts, ts, ts);
    }
  }
  ctx.imageSmoothingEnabled = prev;
}

function execTiledBackground(ctx: CanvasRenderingContext2D, cmd: DrawCommand & { type: 'tiledBackground' }) {
  const img = getImage(cmd.src);
  if (!isLoaded(img)) return;

  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (iw === 0 || ih === 0) return;

  ctx.save();
  ctx.globalAlpha = cmd.opacity ?? 1;

  const scrollX = cmd.scrollX ?? 0;
  const scrollY = cmd.scrollY ?? 0;
  const offsetX = -(((scrollX % iw) + iw) % iw);
  const offsetY = -(((scrollY % ih) + ih) % ih);

  for (let x = offsetX; x < cmd.canvasWidth; x += iw) {
    for (let y = offsetY; y < cmd.canvasHeight; y += ih) {
      ctx.drawImage(img, x, y);
    }
  }
  ctx.restore();
}

function execCameraBegin(ctx: CanvasRenderingContext2D, cmd: DrawCommand & { type: 'cameraBegin' }) {
  ctx.save();
  ctx.scale(cmd.zoom, cmd.zoom);
  ctx.translate(-cmd.position.x, -cmd.position.y);
}

function execCameraEnd(ctx: CanvasRenderingContext2D) {
  ctx.restore();
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Execute an array of draw commands directly on a CanvasRenderingContext2D.
 * This is the web-platform equivalent of the WebView bridge renderer.
 */
export function executeCommands(
  commands: DrawCommand[],
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
): void {
  for (const cmd of commands) {
    switch (cmd.type) {
      case 'clear':           execClear(ctx, canvas); break;
      case 'circle':          execCircle(ctx, cmd); break;
      case 'rectangle':       execRectangle(ctx, cmd); break;
      case 'line':            execLine(ctx, cmd); break;
      case 'label':           execLabel(ctx, cmd); break;
      case 'image':           execImage(ctx, cmd); break;
      case 'sprite':          execSprite(ctx, cmd); break;
      case 'platform':        execPlatform(ctx, cmd); break;
      case 'tilemap':         execTilemap(ctx, cmd); break;
      case 'tiledBackground': execTiledBackground(ctx, cmd); break;
      case 'cameraBegin':     execCameraBegin(ctx, cmd); break;
      case 'cameraEnd':       execCameraEnd(ctx); break;
    }
  }
}
