# Changelog

All notable changes to pIvotX are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.0.0] — 2025

### Added — Core

- **GameImage** — draw static images from `HTMLImageElement` or URL string (auto-loading). Supports opacity, rotation, and `pixelPerfect` mode.
- **Sprite & SpriteSheet** — spritesheet frame rendering with `Sprite.createSheet()`, scale, flip, opacity, and `pixelPerfect` (default `true`).
- **SpriteAnimator** — named animation clips (`addClip`, `play`, `stop`), fps-based frame stepping with `update(dt)`.
- **AssetLoader** — `loadImage(src)` and `loadAssets(manifest)` for batch preloading before the game loop.
- **Camera** — viewport transform with `follow()`, `clamp()`, `zoom`, `setZoom(z, duration)`, `worldToScreen()`, `screenToWorld()`, and `begin(ctx)`/`end(ctx)`.
- **TiledBackground** — repeating tiled image with scroll offsets and opacity for parallax layers.
- **Platform** — AABB-based rectangular platform with `oneWay` flag and `bounds` getter compatible with collision helpers.
- **Tilemap** — grid-based tile map rendering from `SpriteSheet` + 2D `mapData`, with `solidTiles`, `isSolidAt()`, `getTileAt()`, `setTileAt()`, `getSolidTilesInRegion()`, and `pixelPerfect`.
- **Physics — collision** — `createAABB()`, `aabbOverlap()`, `aabbOverlapDepth()` pure functions.
- **Physics — body** — `stepBody()` sub-stepped integrator with gravity, friction, max-velocity; `resolveCollisions()` discrete resolver. Returns `CollisionHit[]` with side info.
- **Sound** — Web Audio API wrapper for individual sounds: `play()`, `pause()`, `resume()`, `stop()`, `volume`, `loop`. Static `Sound.load(url)` for standalone use.
- **SoundManager** — global named-sound manager: `loadSound()`, `loadSounds()`, `play()`, `stop()`, `pause()`, `resume()`, `stopAll()`, `masterVolume`, `mute()`, `unmute()`. Routes all sounds through a master GainNode.

### Added — React (`pivotx/react`)

- `<PivotImage>` — draws `GameImage` on the canvas.
- `<PivotSprite>` — draws a sprite frame.
- `<PivotPlatform>` — draws a platform.
- `<PivotTilemap>` — draws a grid-based tile map.
- `<PivotTiledBackground>` — draws a repeating tiled background with parallax support.
- `useSound()` — React hook wrapping `SoundManager` for convenient audio control.
- Re-exports of `Sound`, `SoundManager`, collision & physics utilities for convenience.

### Added — React Native / Expo (`pivotx/react-native`)

- **PivotNativeCanvas** — root component with dual-renderer architecture: `WebView` on native (iOS/Android), direct `<canvas>` on Expo Web (`Platform.OS === 'web'`).
- **9 shape components**: `PivotCircle`, `PivotRectangle`, `PivotLine`, `PivotLabel`, `PivotImage`, `PivotSprite`, `PivotPlatform`, `PivotTilemap`, `PivotTiledBackground`.
- **PivotNativeCamera** — camera transform wrapper (begin/end commands around children).
- **useNativeGameLoop** — rAF loop hook (same pattern as web `useGameLoop`).
- **useNativePostMessage** — bidirectional React Native ↔ WebView messaging helper.
- **Script mode** — pass a game code string to `PivotNativeCanvas` `script` prop for imperative games.
- **Touch/input** — supports both touch and mouse events across all platforms.
- **Bridge renderer** — draws commands serialized as JSON inside WebView via UMD bundle.
- **Web executor** — `executeCommands()` for Expo Web canvas path.
- **useNativeSound** — platform-agnostic audio hook for JSX mode. Audio commands flow through the bridge (native) or execute directly via `SoundManager` (web).
- **Audio command bridge** — 10 `AudioCommand` types (`loadSound`, `playSound`, `stopSound`, `pauseSound`, `resumeSound`, `stopAllSounds`, `setSoundVolume`, `setMasterVolume`, `mute`, `unmute`) handled in both renderers.
- Re-exports of `Sound`, `SoundManager`, collision & physics utilities.

### Changed

- Package description updated to include React Native / Expo support.
- `package.json` exports now include `./react-native` entry point with ESM, CJS, and types.
- Build produces 11 bundles (was 7 in v1.0.0): 4 core + 2 React + 2 React Native + 3 type declarations.

### Fixed

- `Label` constructor argument order in `expo-example.tsx` (text first, position second).

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
