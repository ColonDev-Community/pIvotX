# Changelog

All notable changes to pIvotX are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2025

### Added
- `Canvas` class with `add()`, `clear()`, `startLoop()`, `stopLoop()`, `getCenter()`, `getWidth()`, `getHeight()`
- `Circle`, `Rectangle`, `Line`, `Label` shape classes
- `Point(x, y)` coordinate factory
- `IDrawable` interface for custom shapes
- React layer: `<PivotCanvas>`, `<PivotCircle>`, `<PivotRectangle>`, `<PivotLine>`, `<PivotLabel>`
- React hook: `useGameLoop(callback)`
- Full TypeScript types for all APIs
- UMD build for CDN/script-tag use (`window.PivotX`)
- Minified CDN build (`pivotx.umd.min.js`) for jsDelivr / unpkg

### Fixed (vs original pIvotX.js)
- Infinite getter recursion on `Line.startPoint`, `Line.endPoint`, `Circle.centerPoint`, `Circle.radius`
- `Circle.fillColor` getter returning `centerPoint` instead of the colour
- `Label` constructor ignoring `text` and `position` arguments
- `Circle._centerPint` typo → `_centerPoint`
- Missing `ctx.beginPath()` on `Line` causing path bleed
- Fill/stroke draw order: styles now applied during `canvas.add()`, not after
- `Rectangle` was a stub comment — now fully implemented
