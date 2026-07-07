// ─── HTML Template Generator ───────────────────────────────────────────────────
//
// Generates the full HTML page that runs inside the WebView.
// The pIvotX UMD bundle is loaded from the jsDelivr CDN at runtime.
//

import { getBridgeRendererSource } from './renderer';

const CDN_URL = 'https://cdn.jsdelivr.net/npm/@colon-dev/pivotx/dist/pivotx.umd.min.js';

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

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:100%;height:100%;overflow:hidden;background:${background};touch-action:none;}
canvas{display:block;}
</style>
</head>
<body>
<canvas id="game" width="${width}" height="${height}"></canvas>
<script src="${CDN_URL}"></script>
<script>${bridgeJS}</script>
${script ? `<script>${script}</script>` : ''}
</body>
</html>`;
}
