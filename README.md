# pIvotX

A lightweight, beginner-friendly 2D game development library built on top of the HTML5 Canvas API.  
No dependencies. No build step. Just drop in a `<script>` tag and start drawing.

---

## Features

- Simple shape API — `Circle`, `Rectangle`, `Line`, `Label`
- Built-in game loop with delta time (`startLoop` / `stopLoop`)
- Canvas utilities — `clear()`, `getCenter()`, `getWidth()`, `getHeight()`
- Friendly error messages when you pass a wrong element ID
- Works in every modern browser

---

## Quick Start

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="pIvotX.js"></script>
  </head>
  <body>
    <canvas id="myCanvas" width="400" height="400"></canvas>
    <script>
      var canvas = new Canvas("myCanvas");

      var circle = new Circle(canvas.getCenter(), 80);
      circle.fillColor   = "steelblue";
      circle.strokeColor = "#333";
      canvas.add(circle);
    </script>
  </body>
</html>
```

---

## API at a Glance

### Canvas

| Method / Property | Description |
|---|---|
| `new Canvas(id)` | Attach to a `<canvas>` element by its DOM id |
| `.add(shape)` | Draw a shape onto the canvas |
| `.clear()` | Erase everything — call at the start of each frame |
| `.getCenter()` | Returns `Point` at the centre of the canvas |
| `.getWidth()` | Canvas width in pixels |
| `.getHeight()` | Canvas height in pixels |
| `.startLoop(fn)` | Start a `requestAnimationFrame` loop; `fn(dt)` receives delta time in seconds |
| `.stopLoop()` | Stop the running loop |

### Shapes

| Constructor | Parameters |
|---|---|
| `Point(x, y)` | Plain `{x, y}` object used everywhere positions are needed |
| `Circle(centerPoint, radius)` | Circle drawn from centre outward |
| `Rectangle(topLeftPoint, width, height)` | Axis-aligned rectangle |
| `Line(startPoint, endPoint)` | Straight line segment |
| `Label(text, position, font?)` | Text drawn at a position |

### Common Shape Properties

| Property | Applies To | Description |
|---|---|---|
| `fillColor` | Circle, Rectangle, Label | CSS colour string for fill |
| `strokeColor` | Circle, Rectangle, Line | CSS colour string for outline |
| `lineWidth` | Circle, Rectangle, Line | Stroke thickness in pixels |
| `centerPoint` | Circle | `Point` for the circle's centre |
| `radius` | Circle | Radius in pixels |
| `position` | Rectangle, Label | `Point` for top-left / text anchor |
| `startPoint` / `endPoint` | Line | Start and end `Point` |
| `text` | Label | The string to display |
| `font` | Label | CSS font string e.g. `"20px Arial"` |
| `textAlign` | Label | `"left"`, `"center"`, `"right"` |
| `textBaseline` | Label | `"top"`, `"middle"`, `"bottom"` |

---

## File Structure

```
project/
├── pIvotX.js       ← the library
├── index.html      ← your game / demo
└── README.md
```

---

## Browser Support

Any browser that supports the HTML5 `<canvas>` element and `requestAnimationFrame` — Chrome, Firefox, Safari, Edge.

---

## License

MIT — free to use, modify, and distribute.