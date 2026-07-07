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

  function runCommands(commands) {
    for (var i = 0; i < commands.length; i++) {
      var cmd = commands[i];
      var fn = dispatch[cmd.type];
      if (fn) fn(cmd);
    }
  }

  // When UI widgets exist, frames are stored and rendered by the UI rAF loop
  // (world + UI in one pass); otherwise commands execute immediately.
  var lastFrame = null;

  /**
   * Process an array of draw commands.
   * Called from RN via injectJavaScript.
   */
  window.__pivotDraw = function(commands) {
    if (uiActive()) {
      lastFrame = commands;
    } else {
      runCommands(commands);
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

  // ── Audio command handler ──────────────────────────────────────────────

  /**
   * Process audio commands sent from RN in JSX mode.
   * Uses PivotX.SoundManager from the UMD bundle loaded in the WebView.
   */
  window.__pivotAudio = function(commands) {
    var SM = window.PivotX && window.PivotX.SoundManager;
    if (!SM) return;
    for (var i = 0; i < commands.length; i++) {
      var cmd = commands[i];
      switch (cmd.type) {
        case 'loadSound':
          SM.loadSound(cmd.name, cmd.src);
          break;
        case 'playSound':
          SM.play(cmd.name, { loop: !!cmd.loop, volume: cmd.volume != null ? cmd.volume : 1 });
          break;
        case 'stopSound':
          SM.stop(cmd.name);
          break;
        case 'pauseSound':
          SM.pause(cmd.name);
          break;
        case 'resumeSound':
          SM.resume(cmd.name);
          break;
        case 'playOneShot':
          var osSnd = SM.getSound(cmd.name);
          if (osSnd && osSnd.playOneShot) osSnd.playOneShot(cmd.volume);
          break;
        case 'stopAllSounds':
          SM.stopAll();
          break;
        case 'pauseAllSounds':
          if (SM.pauseAll) SM.pauseAll();
          break;
        case 'resumeAllSounds':
          if (SM.resumeAll) SM.resumeAll();
          break;
        case 'setSoundVolume':
          var snd = SM.getSound(cmd.name);
          if (snd) snd.volume = cmd.volume;
          break;
        case 'setPlaybackRate':
          var rateSnd = SM.getSound(cmd.name);
          if (rateSnd) rateSnd.playbackRate = cmd.rate;
          break;
        case 'fadeSound':
          var fadeSnd = SM.getSound(cmd.name);
          if (fadeSnd && fadeSnd.fadeTo) fadeSnd.fadeTo(cmd.volume, cmd.seconds);
          break;
        case 'fadeOutSound':
          var foSnd = SM.getSound(cmd.name);
          if (foSnd && foSnd.fadeOut) foSnd.fadeOut(cmd.seconds);
          break;
        case 'setMasterVolume':
          SM.masterVolume = cmd.volume;
          break;
        case 'mute':
          SM.mute();
          break;
        case 'unmute':
          SM.unmute();
          break;
      }
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

  // ── UI widget bridge ───────────────────────────────────────────────────
  //
  // Reconciles UIWidgetDescriptors from RN into a UIManager built from the
  // UMD bundle's UI classes. Touches are routed to the UI first; unconsumed
  // ones forward to RN as before. Requires @colon-dev/pivotx >= 2.0.0 in the
  // WebView — older bundles simply never define the UI classes and the whole
  // feature no-ops.

  var uiManager = null;
  var uiWidgets = {};          // id -> widget instance
  var uiJoyActive = {};        // id -> was-active flag (for the release event)
  var uiRafId = 0;

  function uiActive() {
    return uiManager !== null;
  }

  function postUI(id, event, value) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'uiEvent', id: id, event: event, value: value
      }));
    }
  }

  function uiCreateWidget(desc) {
    var PX = window.PivotX;
    var p = desc.props;
    var pos = { x: p.x || 0, y: p.y || 0 };
    switch (desc.kind) {
      case 'button': {
        var style = {};
        if (p.background) style.background = p.background;
        if (p.color) style.color = p.color;
        var btn = new PX.UIButton(p.text || '', pos, p.width || 140, p.height || 44, style);
        btn.onClick = function() { postUI(desc.id, 'click'); };
        return btn;
      }
      case 'text':
        return new PX.UIText(p.text || '', pos, { color: p.color, font: p.font });
      case 'progress':
        return new PX.UIProgressBar(pos, p.width || 200, p.height || 20, {
          fill: p.fill, background: p.background, label: p.label,
          value: typeof p.value === 'number' ? p.value : 1
        });
      case 'checkbox': {
        var box = new PX.UICheckbox(p.label || '', pos, { checked: p.checked === true });
        box.onChange = function(checked) { postUI(desc.id, 'change', checked); };
        return box;
      }
      case 'slider': {
        var slider = new PX.UISlider(pos, p.width || 180, {
          value: p.value, min: p.min, max: p.max, step: p.step
        });
        slider.onChange = function(v) { postUI(desc.id, 'change', v); };
        return slider;
      }
      case 'joystick':
        return new PX.UIJoystick(pos, p.radius || 60);
    }
    return null;
  }

  function uiUpdateWidget(w, desc) {
    var p = desc.props;
    if (desc.kind === 'joystick') {
      if (w.center.x !== (p.x || 0) || w.center.y !== (p.y || 0)) {
        w.center = { x: p.x || 0, y: p.y || 0 };
      }
      if (p.radius) w.radius = p.radius;
    } else {
      w.position.x = p.x || 0;
      w.position.y = p.y || 0;
    }
    if (desc.kind === 'button') {
      w.text = p.text || '';
      if (p.width) w.width = p.width;
      if (p.height) w.height = p.height;
      if (p.background) w.style.background = p.background;
      if (p.color) w.style.color = p.color;
    } else if (desc.kind === 'text') {
      w.text = p.text || '';
      if (p.color) w.color = p.color;
      if (p.font) w.font = p.font;
    } else if (desc.kind === 'progress') {
      if (typeof p.value === 'number') w.value = p.value;
      if (p.width) w.width = p.width;
      if (p.fill) w.fill = p.fill;
      if (p.label != null) w.label = p.label;
    } else if (desc.kind === 'checkbox') {
      w.label = p.label || '';
      w.checked = p.checked === true;
    } else if (desc.kind === 'slider') {
      if (p.width) w.width = p.width;
      if (typeof p.min === 'number') w.min = p.min;
      if (typeof p.max === 'number') w.max = p.max;
      if (typeof p.step === 'number') w.step = p.step;
      if (!w.pressed && typeof p.value === 'number') w.value = p.value;
    }
    w.visible = p.visible !== false;
    if (desc.kind !== 'text' && desc.kind !== 'progress') {
      w.enabled = p.disabled !== true;
    }
  }

  function uiFrame() {
    if (!uiManager) return;
    if (lastFrame) runCommands(lastFrame);
    else execClear();
    uiManager.draw(ctx);

    // Joystick move events (throttled naturally to the frame rate)
    for (var id in uiWidgets) {
      var w = uiWidgets[id];
      if (w.tag === 'ui-joystick') {
        if (w.active) {
          postUI(id, 'move', { x: w.value.x, y: w.value.y });
          uiJoyActive[id] = true;
        } else if (uiJoyActive[id]) {
          postUI(id, 'move', { x: 0, y: 0 });
          uiJoyActive[id] = false;
        }
      }
    }
    uiRafId = requestAnimationFrame(uiFrame);
  }

  /**
   * Reconcile UI widget descriptors sent from RN.
   * No-ops when the loaded PivotX bundle predates the UI engine (< 2.0.0).
   */
  window.__pivotUI = function(descs) {
    var PX = window.PivotX;
    if (!PX || !PX.UIManager) return;

    if (!uiManager && descs.length > 0) {
      uiManager = new PX.UIManager();   // no canvas: touches routed manually below
      uiRafId = requestAnimationFrame(uiFrame);
    }
    if (!uiManager) return;

    var seen = {};
    for (var i = 0; i < descs.length; i++) {
      var desc = descs[i];
      seen[desc.id] = true;
      var w = uiWidgets[desc.id];
      if (!w) {
        w = uiCreateWidget(desc);
        if (!w) continue;
        uiWidgets[desc.id] = w;
        uiManager.add(w);
      }
      uiUpdateWidget(w, desc);
    }
    for (var wid in uiWidgets) {
      if (!seen[wid]) {
        uiManager.remove(uiWidgets[wid]);
        delete uiWidgets[wid];
        delete uiJoyActive[wid];
      }
    }

    // Everything unmounted: stop the UI loop and return to direct drawing
    if (descs.length === 0) {
      cancelAnimationFrame(uiRafId);
      uiManager = null;
      lastFrame = null;
    }
  };

  // ── Hardware input forwarding (keyboard + gamepad) ─────────────────────
  //
  // Bluetooth/USB keyboards and controllers deliver events to the WebView's
  // DOM, so they can be forwarded to RN without any native module. RN's
  // NativeInput mirrors this state for game code.

  window.addEventListener('keydown', function(e) {
    if (e.repeat) return;
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'keyEvent', action: 'down', code: e.code
      }));
    }
  });
  window.addEventListener('keyup', function(e) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'keyEvent', action: 'up', code: e.code
      }));
    }
  });

  var padPolling = false;
  var lastPadJson = '';

  function pollGamepad() {
    var pads = navigator.getGamepads ? navigator.getGamepads() : [];
    var pad = null;
    for (var i = 0; i < pads.length; i++) {
      if (pads[i] && pads[i].connected) { pad = pads[i]; break; }
    }

    var state = null;
    if (pad) {
      var buttons = [];
      for (var b = 0; b < pad.buttons.length; b++) {
        if (pad.buttons[b].pressed) buttons.push(b);
      }
      var axes = [];
      for (var a = 0; a < pad.axes.length && a < 4; a++) {
        axes.push(Math.round(pad.axes[a] * 100) / 100);
      }
      state = { connected: true, buttons: buttons, axes: axes };
    } else {
      state = { connected: false, buttons: [], axes: [] };
    }

    // Only post when something changed — idle controllers cost nothing
    var json = JSON.stringify(state);
    if (json !== lastPadJson) {
      lastPadJson = json;
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'gamepadState',
          connected: state.connected,
          buttons: state.buttons,
          axes: state.axes
        }));
      }
    }

    if (state.connected || padPolling) {
      requestAnimationFrame(pollGamepad);
    }
  }

  window.addEventListener('gamepadconnected', function() {
    if (!padPolling) {
      padPolling = true;
      pollGamepad();
    }
  });
  window.addEventListener('gamepaddisconnected', function() {
    padPolling = false;
  });

  // ── Touch event forwarding ─────────────────────────────────────────────

  var uiCapturedTouches = {};   // touch identifier -> captured by UI

  function touchPos(t) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (t.clientX - rect.left) * (canvas.width / rect.width),
      y: (t.clientY - rect.top) * (canvas.height / rect.height),
      id: t.identifier
    };
  }

  function sendTouch(action, touches) {
    if (window.ReactNativeWebView && touches.length > 0) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'touch',
        action: action,
        touches: touches
      }));
    }
  }

  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var forward = [];
    for (var i = 0; i < e.changedTouches.length; i++) {
      var p = touchPos(e.changedTouches[i]);
      if (uiManager && uiManager.pointerDown(p.id, p.x, p.y)) {
        uiCapturedTouches[p.id] = true;   // UI consumed it — don't forward
      } else {
        forward.push(p);
      }
    }
    sendTouch('start', forward);
  }, { passive: false });

  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    var forward = [];
    for (var i = 0; i < e.changedTouches.length; i++) {
      var p = touchPos(e.changedTouches[i]);
      if (uiCapturedTouches[p.id]) {
        if (uiManager) uiManager.pointerMove(p.id, p.x, p.y);
      } else {
        forward.push(p);
      }
    }
    sendTouch('move', forward);
  }, { passive: false });

  function onTouchEnd(e) {
    var forward = [];
    for (var i = 0; i < e.changedTouches.length; i++) {
      var p = touchPos(e.changedTouches[i]);
      if (uiCapturedTouches[p.id]) {
        if (uiManager) uiManager.pointerUp(p.id, p.x, p.y);
        delete uiCapturedTouches[p.id];
      } else {
        forward.push(p);
      }
    }
    sendTouch('end', forward);
  }
  canvas.addEventListener('touchend', onTouchEnd);
  canvas.addEventListener('touchcancel', onTouchEnd);

})();
`;
}
