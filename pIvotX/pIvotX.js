/**
 * pIvotX.js - Simple 2D Game Development Library
 * Improved version: fixes getter recursion, draw order, fill colors,
 * adds Rectangle, Label, game loop, and Canvas utilities.
 */

// ─── Point ───────────────────────────────────────────────────────────────────

function Point(_x, _y) {
  return { x: _x, y: _y };
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

function Canvas(id) {
  try {
    this._canvas = document.getElementById(id);
    if (!this._canvas || this._canvas.nodeName !== 'CANVAS') {
      console.error("pIvotX: Invalid Canvas element id: " + id);
      this._valid = false;
    } else {
      this._2Dcontext = this._canvas.getContext("2d");
      this._valid = true;
      console.log("pIvotX: Canvas ready — " + id);
    }
  } catch (error) {
    console.error("pIvotX Canvas error:", error);
    this._valid = false;
  }
}

Canvas.prototype.getCenter = function () {
  return Point(this._canvas.width / 2, this._canvas.height / 2);
};

Canvas.prototype.getWidth = function () {
  return this._canvas.width;
};

Canvas.prototype.getHeight = function () {
  return this._canvas.height;
};

/**
 * Clear the entire canvas. Call at the start of each frame in a game loop.
 */
Canvas.prototype.clear = function () {
  this._2Dcontext.clearRect(0, 0, this._canvas.width, this._canvas.height);
};

/**
 * Add and immediately draw a shape onto the canvas.
 */
Canvas.prototype.add = function (element) {
  if (!this._valid) return;
  try {
    var ctx = this._2Dcontext;
    element._2Dcontext = ctx;

    if (element.tag === "line") {
      ctx.beginPath();
      ctx.strokeStyle = element._strokeColor || "#000";
      ctx.lineWidth   = element._lineWidth   || 1;
      ctx.moveTo(element._startPoint.x, element._startPoint.y);
      ctx.lineTo(element._endPoint.x,   element._endPoint.y);
      ctx.stroke();

    } else if (element.tag === "circle") {
      ctx.beginPath();
      ctx.arc(
        element._centerPoint.x,
        element._centerPoint.y,
        element._radius,
        0,
        2 * Math.PI
      );
      if (element._fillColor) {
        ctx.fillStyle = element._fillColor;
        ctx.fill();
      }
      if (element._strokeColor) {
        ctx.strokeStyle = element._strokeColor;
        ctx.lineWidth   = element._lineWidth || 1;
        ctx.stroke();
      }

    } else if (element.tag === "rect") {
      ctx.beginPath();
      ctx.rect(element._x, element._y, element._width, element._height);
      if (element._fillColor) {
        ctx.fillStyle = element._fillColor;
        ctx.fill();
      }
      if (element._strokeColor) {
        ctx.strokeStyle = element._strokeColor;
        ctx.lineWidth   = element._lineWidth || 1;
        ctx.stroke();
      }

    } else if (element.tag === "label") {
      ctx.font         = element._font        || "16px Arial";
      ctx.fillStyle    = element._fillColor   || "#000";
      ctx.textBaseline = element._textBaseline || "middle";
      ctx.textAlign    = element._textAlign    || "center";
      ctx.fillText(element._text, element._position.x, element._position.y);
    }

  } catch (error) {
    console.error("pIvotX Canvas.add error:", error);
  }
};

/**
 * Simple game loop using requestAnimationFrame.
 * @param {Function} updateFn  — called each frame with delta time in seconds
 *
 * Usage:
 *   canvas.startLoop(function(dt) {
 *     canvas.clear();
 *     // update & draw your scene
 *   });
 */
Canvas.prototype.startLoop = function (updateFn) {
  if (!this._valid) return;
  var self = this;
  var last = null;
  this._loopRunning = true;

  function tick(timestamp) {
    if (!self._loopRunning) return;
    var dt = last ? (timestamp - last) / 1000 : 0;
    last = timestamp;
    updateFn(dt);
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
};

Canvas.prototype.stopLoop = function () {
  this._loopRunning = false;
};

// ─── Line ────────────────────────────────────────────────────────────────────

function Line(point_start, point_end) {
  this.tag          = "line";
  this._startPoint  = point_start;
  this._endPoint    = point_end;
  this._strokeColor = "#000";
  this._lineWidth   = 1;
}

// FIX: getters now return the private _property, not themselves (infinite recursion bug)
Object.defineProperty(Line.prototype, "startPoint", {
  get: function () { return this._startPoint; },
  set: function (v) { this._startPoint = v; }
});
Object.defineProperty(Line.prototype, "endPoint", {
  get: function () { return this._endPoint; },
  set: function (v) { this._endPoint = v; }
});
Object.defineProperty(Line.prototype, "strokeColor", {
  get: function () { return this._strokeColor; },
  set: function (v) { this._strokeColor = v; }
});
Object.defineProperty(Line.prototype, "lineWidth", {
  get: function () { return this._lineWidth; },
  set: function (v) { this._lineWidth = v; }
});

// ─── Circle ──────────────────────────────────────────────────────────────────

function Circle(point_center, radius) {
  this.tag          = "circle";
  this._centerPoint = point_center;   // FIX: was _centerPint (typo)
  this._radius      = radius;
  this._fillColor   = null;
  this._strokeColor = null;
  this._lineWidth   = 1;
  this._2Dcontext   = null;
}

// FIX: getters return private fields, not themselves
Object.defineProperty(Circle.prototype, "centerPoint", {
  get: function () { return this._centerPoint; },
  set: function (v) { this._centerPoint = v; }
});
Object.defineProperty(Circle.prototype, "radius", {
  get: function () { return this._radius; },
  set: function (v) { this._radius = v; }
});
// FIX: fillColor getter returned centerPint — now returns _fillColor
Object.defineProperty(Circle.prototype, "fillColor", {
  get: function () { return this._fillColor; },
  set: function (v) {
    this._fillColor = v;
    // If already on canvas, apply immediately
    if (this._2Dcontext) {
      this._2Dcontext.fillStyle = v;
      this._2Dcontext.fill();
    }
  }
});
Object.defineProperty(Circle.prototype, "strokeColor", {
  get: function () { return this._strokeColor; },
  set: function (v) { this._strokeColor = v; }
});

// ─── Rectangle ───────────────────────────────────────────────────────────────
// FIX: was stubbed out as a comment — now fully implemented

function Rectangle(point_topLeft, width, height) {
  this.tag          = "rect";
  this._x           = point_topLeft.x;
  this._y           = point_topLeft.y;
  this._width       = width;
  this._height      = height;
  this._fillColor   = null;
  this._strokeColor = null;
  this._lineWidth   = 1;
}

Object.defineProperty(Rectangle.prototype, "position", {
  get: function () { return Point(this._x, this._y); },
  set: function (v) { this._x = v.x; this._y = v.y; }
});
Object.defineProperty(Rectangle.prototype, "fillColor", {
  get: function () { return this._fillColor; },
  set: function (v) { this._fillColor = v; }
});
Object.defineProperty(Rectangle.prototype, "strokeColor", {
  get: function () { return this._strokeColor; },
  set: function (v) { this._strokeColor = v; }
});
Object.defineProperty(Rectangle.prototype, "lineWidth", {
  get: function () { return this._lineWidth; },
  set: function (v) { this._lineWidth = v; }
});

// ─── Label ───────────────────────────────────────────────────────────────────
// FIX: constructor was ignoring text and position entirely

function Label(text, point_position, font) {
  this.tag          = "label";
  this._text        = text;
  this._position    = point_position;
  this._font        = font || "16px Arial";
  this._fillColor   = "#000";
  this._textBaseline = "middle";
  this._textAlign   = "center";
}

Object.defineProperty(Label.prototype, "text", {
  get: function () { return this._text; },
  set: function (v) { this._text = v; }
});
Object.defineProperty(Label.prototype, "position", {
  get: function () { return this._position; },
  set: function (v) { this._position = v; }
});
Object.defineProperty(Label.prototype, "font", {
  get: function () { return this._font; },
  set: function (v) { this._font = v; }
});
Object.defineProperty(Label.prototype, "fillColor", {
  get: function () { return this._fillColor; },
  set: function (v) { this._fillColor = v; }
});
Object.defineProperty(Label.prototype, "textAlign", {
  get: function () { return this._textAlign; },
  set: function (v) { this._textAlign = v; }
});
Object.defineProperty(Label.prototype, "textBaseline", {
  get: function () { return this._textBaseline; },
  set: function (v) { this._textBaseline = v; }
});