// ─── HTML Template Generator ───────────────────────────────────────────────────
//
// Generates the full HTML page that runs inside the WebView.
// The pIvotX UMD bundle is loaded from the jsDelivr CDN at runtime.
//

import { getBridgeRendererSource } from './renderer';
import { PIVOTX_VERSION } from './version';

// Version-pinned: the unversioned jsDelivr URL resolves through a long-lived
// cache and can serve a stale major (observed serving 1.0.1 after 2.0.1's
// release — silently disabling the UI/sound bridges). Pinning to the exact
// installed version keeps the WebView bundle immutable-cacheable and always
// consistent with the React Native side.
const CDN_URL = `https://cdn.jsdelivr.net/npm/@colon-dev/pivotx@${PIVOTX_VERSION}/dist/pivotx.umd.min.js`;

/**
 * Generate the full HTML string for the WebView.
 *
 * @param width       Canvas width in pixels.
 * @param height      Canvas height in pixels.
 * @param background  CSS background colour for the page and canvas.
 * @param script      Optional user game code to run after pIvotX loads.
 */
export function generateHTML(
  width:      number,
  height:     number,
  background: string,
  script?:    string,
): string {
  const bridgeJS = getBridgeRendererSource();

  // Harden interpolations: dimensions must be positive integers, the
  // background must be a plausible CSS colour (no markup breakout), and the
  // game script must not be able to terminate its own <script> element.
  const safeWidth = Math.max(1, Math.floor(Number(width) || 0)) || 400;
  const safeHeight = Math.max(1, Math.floor(Number(height) || 0)) || 300;
  const safeBackground = /^[#a-zA-Z0-9(),.%\s-]*$/.test(background) ? background : '#000';
  const safeScript = script ? script.replace(/<\/script/gi, '<\\/script') : undefined;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:100%;height:100%;overflow:hidden;background:${safeBackground};touch-action:none;}
canvas{display:block;}
</style>
</head>
<body>
<canvas id="game" width="${safeWidth}" height="${safeHeight}"></canvas>
<script src="${CDN_URL}"></script>
<script>${bridgeJS}</script>
${safeScript ? `<script>${safeScript}</script>` : ''}
</body>
</html>`;
}
