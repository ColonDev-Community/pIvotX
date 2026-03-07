// ─── WebView Bridge Renderer ───────────────────────────────────────────────────
//
// This string is injected into the WebView as inline JavaScript.
// It runs alongside the inlined pIvotX UMD bundle and processes
// draw commands sent from the React Native side.
//

/**
 * Returns the bridge renderer JavaScript as a string.
 * This code runs inside the WebView context where `PivotX` (UMD global)
 * and the standard Canvas 2D API are available.
 */
export function getBridgeRendererSource(): string {
  return `
(function() {
  'use strict';

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');

  // ── Image cache ────────────────────────────────────────────────────────
  var imageCache = {};

  function getImage(src) {
    if (imageCache[src]) return imageCache[src];
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    imageCache[src] = img;
    return img;
  }

  function isLoaded(img) {
    return img.complete && img.naturalWidth > 0;
  }

  // ── SpriteSheet cache ──────────────────────────────────────────────────
  var sheetCache = {};

  function getSheet(src, fw, fh) {
    var key = src + ':' + fw + ':' + fh;
    if (sheetCache[key]) return sheetCache[key];
    var img = getImage(src);
    // Can't compute columns until loaded — return stub
    sheetCache[key] = {
      image: img,
      frameWidth: fw,
      frameHeight: fh,
      columns: 0,
      totalFrames: 0,
      _ready: false
    };
    img.onload = function() {
      var s = sheetCache[key];
      s.columns = Math.floor(img.naturalWidth / fw);
      var rows = Math.floor(img.naturalHeight / fh);
      s.totalFrames = s.columns * rows;
      s._ready = true;
    };
    // If already loaded
    if (isLoaded(img)) {
      var s = sheetCache[key];
      s.columns = Math.floor(img.naturalWidth / fw);
      var rows = Math.floor(img.naturalHeight / fh);
      s.totalFrames = s.columns * rows;
      s._ready = true;
    }
    return sheetCache[key];
  }

  // ── Command executors ──────────────────────────────────────────────────

  function execClear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function execCircle(cmd) {
    ctx.beginPath();
    ctx.arc(cmd.center.x, cmd.center.y, cmd.radius, 0, Math.PI * 2);
    if (cmd.fill) {
      ctx.fillStyle = cmd.fill;
      ctx.fill();
    }
    if (cmd.stroke) {
      ctx.strokeStyle = cmd.stroke;
      ctx.lineWidth = cmd.lineWidth || 1;
      ctx.stroke();
    }
  }

  function execRectangle(cmd) {
    ctx.beginPath();
    ctx.rect(cmd.position.x, cmd.position.y, cmd.width, cmd.height);
    if (cmd.fill) {
      ctx.fillStyle = cmd.fill;
      ctx.fill();
    }
    if (cmd.stroke) {
      ctx.strokeStyle = cmd.stroke;
      ctx.lineWidth = cmd.lineWidth || 1;
      ctx.stroke();
    }
  }

  function execLine(cmd) {
    ctx.beginPath();
    ctx.strokeStyle = cmd.stroke || '#000';
    ctx.lineWidth = cmd.lineWidth || 1;
    ctx.moveTo(cmd.start.x, cmd.start.y);
    ctx.lineTo(cmd.end.x, cmd.end.y);
    ctx.stroke();
  }

  function execLabel(cmd) {
    ctx.font = cmd.font || '16px sans-serif';
    ctx.fillStyle = cmd.fill || '#000';
    ctx.textAlign = cmd.textAlign || 'center';
    ctx.textBaseline = cmd.textBaseline || 'middle';
    ctx.fillText(cmd.text, cmd.position.x, cmd.position.y);
  }

  function execImage(cmd) {
    var img = getImage(cmd.src);
    if (!isLoaded(img)) return;

    var w = cmd.width != null ? cmd.width : img.naturalWidth;
    var h = cmd.height != null ? cmd.height : img.naturalHeight;

    ctx.save();
    ctx.globalAlpha = cmd.opacity != null ? cmd.opacity : 1;
    if (cmd.pixelPerfect) ctx.imageSmoothingEnabled = false;

    if (cmd.rotation) {
      var cx = cmd.position.x + w / 2;
      var cy = cmd.position.y + h / 2;
      ctx.translate(cx, cy);
      ctx.rotate(cmd.rotation);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    } else {
      ctx.drawImage(img, cmd.position.x, cmd.position.y, w, h);
    }
    ctx.restore();
  }

  function execSprite(cmd) {
    var sheet = getSheet(cmd.sheetSrc, cmd.frameWidth, cmd.frameHeight);
    if (!sheet._ready) return;

    var frame = ((cmd.frame % sheet.totalFrames) + sheet.totalFrames) % sheet.totalFrames;
    var col = frame % sheet.columns;
    var row = Math.floor(frame / sheet.columns);
    var sx = col * sheet.frameWidth;
    var sy = row * sheet.frameHeight;
    var scale = cmd.scale || 1;
    var dw = sheet.frameWidth * scale;
    var dh = sheet.frameHeight * scale;

    ctx.save();
    ctx.globalAlpha = cmd.opacity != null ? cmd.opacity : 1;
    if (cmd.pixelPerfect !== false) ctx.imageSmoothingEnabled = false;

    var cx = cmd.position.x + dw / 2;
    var cy = cmd.position.y + dh / 2;
    ctx.translate(cx, cy);
    ctx.scale(cmd.flipX ? -1 : 1, cmd.flipY ? -1 : 1);

    ctx.drawImage(
      sheet.image,
      sx, sy, sheet.frameWidth, sheet.frameHeight,
      -dw / 2, -dh / 2, dw, dh
    );
    ctx.restore();
  }

  function execPlatform(cmd) {
    if (cmd.fill) {
      ctx.fillStyle = cmd.fill;
      ctx.fillRect(cmd.position.x, cmd.position.y, cmd.width, cmd.height);
    }
    if (cmd.stroke) {
      ctx.strokeStyle = cmd.stroke;
      ctx.lineWidth = cmd.lineWidth || 1;
      ctx.strokeRect(cmd.position.x, cmd.position.y, cmd.width, cmd.height);
    }
  }

  function execTilemap(cmd) {
    var sheet = getSheet(cmd.sheetSrc, cmd.frameWidth, cmd.frameHeight);
    if (!sheet._ready) return;

    var ts = cmd.tileSize;
    var prevSmoothing = ctx.imageSmoothingEnabled;
    if (cmd.pixelPerfect !== false) ctx.imageSmoothingEnabled = false;

    for (var r = 0; r < cmd.mapData.length; r++) {
      var rowData = cmd.mapData[r];
      for (var c = 0; c < rowData.length; c++) {
        var fi = rowData[c];
        if (fi < 0) continue;
        var srcCol = fi % sheet.columns;
        var srcRow = Math.floor(fi / sheet.columns);
        var sx = srcCol * sheet.frameWidth;
        var sy = srcRow * sheet.frameHeight;
        ctx.drawImage(
          sheet.image,
          sx, sy, sheet.frameWidth, sheet.frameHeight,
          c * ts, r * ts, ts, ts
        );
      }
    }
    ctx.imageSmoothingEnabled = prevSmoothing;
  }

  function execTiledBackground(cmd) {
    var img = getImage(cmd.src);
    if (!isLoaded(img)) return;

    var iw = img.naturalWidth;
    var ih = img.naturalHeight;
    if (iw === 0 || ih === 0) return;

    ctx.save();
    ctx.globalAlpha = cmd.opacity != null ? cmd.opacity : 1;

    var scrollX = cmd.scrollX || 0;
    var scrollY = cmd.scrollY || 0;
    var offsetX = -(((scrollX % iw) + iw) % iw);
    var offsetY = -(((scrollY % ih) + ih) % ih);

    for (var x = offsetX; x < cmd.canvasWidth; x += iw) {
      for (var y = offsetY; y < cmd.canvasHeight; y += ih) {
        ctx.drawImage(img, x, y);
      }
    }
    ctx.restore();
  }

  function execCameraBegin(cmd) {
    ctx.save();
    ctx.scale(cmd.zoom, cmd.zoom);
    ctx.translate(-cmd.position.x, -cmd.position.y);
  }

  function execCameraEnd() {
    ctx.restore();
  }

  // ── Command dispatcher ─────────────────────────────────────────────────

  var dispatch = {
    clear:            execClear,
    circle:           execCircle,
    rectangle:        execRectangle,
    line:             execLine,
    label:            execLabel,
    image:            execImage,
    sprite:           execSprite,
    platform:         execPlatform,
    tilemap:          execTilemap,
    tiledBackground:  execTiledBackground,
    cameraBegin:      execCameraBegin,
    cameraEnd:        execCameraEnd
  };

  /**
   * Process an array of draw commands.
   * Called from RN via injectJavaScript.
   */
  window.__pivotDraw = function(commands) {
    for (var i = 0; i < commands.length; i++) {
      var cmd = commands[i];
      var fn = dispatch[cmd.type];
      if (fn) fn(cmd);
    }
  };

  /**
   * Emit a game event back to React Native.
   * Available in script mode: window.__pivotEmit('score', { value: 10 });
   */
  window.__pivotEmit = function(name, data) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'gameEvent',
        name: name,
        data: data
      }));
    }
  };

  /**
   * Receive a message from React Native.
   * Available in script mode: window.__pivotOnMessage = function(data) { ... };
   */
  window.__pivotOnMessage = null;

  document.addEventListener('message', function(e) {
    if (window.__pivotOnMessage && e.data) {
      try {
        window.__pivotOnMessage(JSON.parse(e.data));
      } catch (_) {
        window.__pivotOnMessage(e.data);
      }
    }
  });
  window.addEventListener('message', function(e) {
    if (window.__pivotOnMessage && e.data) {
      try {
        window.__pivotOnMessage(JSON.parse(e.data));
      } catch (_) {
        window.__pivotOnMessage(e.data);
      }
    }
  });

  // ── Touch event forwarding ─────────────────────────────────────────────

  function touchList(e) {
    var rect = canvas.getBoundingClientRect();
    var result = [];
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      result.push({ x: t.clientX - rect.left, y: t.clientY - rect.top, id: t.identifier });
    }
    return result;
  }

  function sendTouch(action, e) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'touch',
        action: action,
        touches: touchList(e)
      }));
    }
  }

  canvas.addEventListener('touchstart', function(e) { e.preventDefault(); sendTouch('start', e); }, { passive: false });
  canvas.addEventListener('touchmove',  function(e) { e.preventDefault(); sendTouch('move', e);  }, { passive: false });
  canvas.addEventListener('touchend',   function(e) { sendTouch('end', e); });

})();
`;
}
