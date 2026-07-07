# Changelog

All notable changes to pIvotX are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.0.3] — 2026-07-07

### Fixed

- **No audio on Android devices** — the WebView's autoplay policy keeps Web Audio suspended unless resumed from inside a real user-gesture handler *in the WebView* (commands injected from RN don't qualify). The canvas now sets `mediaPlaybackRequiresUserGesture={false}`, and the bridge additionally resumes the AudioContext inside its own touchstart handler on the first touch — sound works after the first tap on any device.
- **WebView startup race dropped the UI and sound loads on devices.** The RN flush effect injects into the WebView immediately on mount — before the page and engine have loaded — so the first UI payload and the one-shot `loadSound` commands fell into the void, and the UI dirty-check then believed the widgets were already delivered (on-screen controllers never appeared unless the UI JSON later changed). The canvas now resyncs on the WebView's `onLoadEnd`: it replays the recorded sound loads and the last known UI state. Draw/audio injections are also guarded so pre-load injections no longer throw.

---

## [2.0.2] — 2026-07-07

### Security (React Native WebView bridge hardening)

- `generateHTML` interpolations hardened: `width`/`height` coerced to positive integers, `background` validated as a plausible CSS colour (markup breakout impossible), and script-mode code escaped against `</script>` element termination.
- JSON injected into the WebView (`__pivotDraw`/`__pivotUI`/`__pivotAudio`) now escapes U+2028/U+2029, which are valid in JSON strings but line terminators in JavaScript source on older engines.
- WebView policies are now configurable props with unchanged defaults: `allowFileAccess` (default `true`), `mixedContentMode` (default `'always'`), `originWhitelist` (default `['*']`) — tighten them for production builds.
- README security note documenting the trust model of `script` mode / `injectScript()` (same class as `react-native-webview`'s `injectJavaScript`: only run code you control).
- Removed the only dynamic-execution site in the library: `injectScript()`'s web fallback used `new Function` (flagged by supply-chain scanners, blocked by CSP without `unsafe-eval`, and documented as "not fully supported" anyway). It now warns and no-ops on web; the native WebView path is unchanged.

### Fixed

- `useNativeSound()` threw "Native shape components must be inside \<PivotNativeCanvas\>" when called from the component that *renders* the canvas (the natural place to call it). The hook is now context-optional: outside the canvas, commands go to a global queue that any mounted canvas drains on its next flush.
- The WebView loaded the pIvotX UMD from the **unversioned** jsDelivr URL, which serves from a long-lived cache — observed serving v1.0.1 after 2.0.1's release, silently disabling the UI, input, and sound bridges on devices (no joystick, no widgets, no audio). The URL is now pinned to the exact installed version via a generated `version.ts` kept in sync by the npm `version`/`prepublishOnly` lifecycle.

---

## [2.0.1] — 2026-07-07

### Fixed

- `<PivotUI>` widgets were invisible in games that re-render every frame with `<PivotCanvas autoClear>` — the rAF repaint raced with the render-phase clear, so the UI was erased before every paint. `PivotUI` now also repaints in a per-render effect (running after sibling shape effects when placed as the last child), keeping the UI on top in both static and per-frame-render games.

### Changed

- Rollup build banner now reads the version from `package.json` instead of a hardcoded string.

---

## [2.0.0] — 2026-07-07

### Added — Core

- **GameImage** — draw static images from `HTMLImageElement` or URL string (auto-loading). Supports opacity, rotation, and `pixelPerfect` mode.
- **Sprite & SpriteSheet** — spritesheet frame rendering with `Sprite.createSheet()`, scale, flip, opacity, and `pixelPerfect` (default `true`).
- **SpriteAnimator** — named animation clips (`addClip`, `play`, `stop`), fps-based frame stepping with `update(dt)`.
- **AssetLoader** — `loadImage(src)` and `loadAssets(manifest)` for batch preloading before the game loop.
- **Camera** — viewport transform with `follow()` (optionally frame-rate-independent via `dt`), `followWithDeadZone()` (classic platformer dead-zone camera), `clamp()`, `zoom`, animated `setZoom(z, duration)`, `shake(intensity, duration)` screen shake, `update(dt)`, `worldToScreen()`, `screenToWorld()`, and `begin(ctx)`/`end(ctx)`.
- **TiledBackground** — repeating tiled image with scroll offsets and opacity for parallax layers.
- **Platform** — AABB-based rectangular platform with `oneWay` flag and `bounds` getter compatible with collision helpers.
- **Tilemap** — grid-based tile map rendering from `SpriteSheet` + 2D `mapData`, with `solidTiles`, `isSolidAt()`, `getTileAt()`, `setTileAt()`, `getSolidTilesInRegion()`, and `pixelPerfect`.
- **Physics — collision** — `createAABB()`, `aabbOverlap()`, `aabbOverlapDepth()` pure functions, plus `circlesOverlap()`, `circleAABBOverlap()`, and `raycastAABB()` (slab-method raycast with hit point & normal).
- **Physics — body** — `stepBody()` sub-stepped integrator with gravity, frame-rate-independent friction, `maxFallSpeed` terminal velocity, `bounce` restitution, and one-way (jump-through) platform support via `StaticRect.oneWay`; `resolveCollisions()` discrete resolver. Returns `CollisionResult[]` with side info.
- **Physics — tilemap** — `stepBodyOnTilemap(body, tilemap, dt, opts)` steps a body directly against a Tilemap's solid tiles with broad-phase culling.
- **Physics — moving platforms** — `StaticRect` accepts `vx`/`vy`; `stepBody` advances moving platforms and carries bodies standing on them.
- **Physics — SpatialHash** — uniform-grid broad-phase (`insert`/`query`/`clear`) for many-object collision without O(n²) pair tests.
- **Physics — circle resolution** — `circleAABBResolve(circle, box)` pushes an overlapping circle out along the closest-point normal (centre-inside handled).
- **Physics — continuous casts** — `raycastCircle(origin, dir, center, radius)` and `sweepCircleAABB(circle, movement, box)` (Minkowski-sum sweep with rounded corners) — moving circles can't tunnel through walls at any speed.
- **Vec2** — 2D vector math helpers (`add`, `sub`, `scale`, `dot`, `length`, `normalize`, `distance`, `lerp`, `rotate`, `clampLength`, `fromAngle`, `angle`).
- **Timers** — game-loop-driven timers: `after(sec, fn)`, `every(sec, fn)` with cancellable handles; advance with `update(dt)`.
- **Tween engine** — `TweenManager.to(target, props, duration, easing, delay)` animates any numeric properties; 10 built-in easings (`Easing`), completion/update callbacks, `cancel()`/`finish()`.
- **ParticleEmitter** — pooled particle system: `burst(x, y, count)` and continuous `rate` emission; speed/angle/spread/life/size/color ranges, gravity, drag, fade, shrink.
- **Scene manager** — `Scene` base class (`enter`/`exit`/`update`/`draw`) and `SceneManager` with `switch()`, and `push()`/`pop()` overlay scenes (pause menus) where only the top scene updates but the whole stack draws.
- **Pointer** — unified mouse/touch state on the canvas: `x`, `y`, `isDown`, `justPressed`, `justReleased` (canvas-pixel coordinates, CSS scaling compensated).
- **InputMap** — action mapping across devices: `bind('jump', ['space', 'w', 'gamepad:a'])`, then `isDown/justPressed/justReleased('jump')`.
- **Sound** — Web Audio API wrapper for individual sounds: `play()`, `pause()`, `resume()`, `stop()`, `volume`, `loop`, `playbackRate`, `pan` (stereo panning for cheap positional audio), `currentTime`, `playOneShot()` (overlapping SFX), `playSegment(start, duration)` (audio sprites), `fadeTo()` / `fadeIn()` / `fadeOut()`, `dispose()`. Static `Sound.load(url)` for standalone use.
- **SoundManager** — global named-sound manager: `loadSound()`, `loadSounds()`, `play()`, `stop()`, `pause()`, `resume()`, `stopAll()`, `pauseAll()`, `resumeAll()`, `setVolume()`, `unload()`, `unloadAll()`, `masterVolume`, `mute()`, `unmute()`. Routes all sounds through a master GainNode. Sound groups (buses): load with `{ group: 'sfx' }` and control per-group volume via `setGroupVolume('sfx', v)` / `getGroupVolume()`.
- **Audio sprites** — `sound.defineSprites({ jump: [0, 0.4], coin: [0.4, 0.5] })` then `sound.playSprite('coin')` — many named SFX in one file.
- **Keyboard** — static keyboard input engine: `isDown()`, `justPressed()`, `justReleased()`, `anyDown`, `getAxis('horizontal'|'vertical')` (arrows + WASD). Friendly key aliases mapped to layout-independent codes; auto-attaches on first use; releases stuck keys on window blur. Per-frame edge states updated automatically by `Canvas.startLoop` / `useGameLoop` (or call `updateInputs()` in custom loops).
- **GamepadInput** — game-controller engine over the Gamepad API: `connected`, `isDown()` / `justPressed()` / `justReleased()` with standard-mapping button names (`'a'`, `'start'`, `'lb'`, …), `getStick('left'|'right')` with configurable `deadZone`, `getTrigger('lt'|'rt')`, and `vibrate()` rumble.
- **UI engine** — canvas-rendered widget system for building game UI fast:
  - `UIManager` — attaches pointer events (mouse + multi-touch) to the canvas, hit-tests topmost-first, draws everything with one `ui.draw(ctx)` call.
  - `UIButton` — rounded-rect button with hover/pressed/disabled styles and `onClick`.
  - `UIPanel` — container with background/border and optional `column`/`row` auto-layout.
  - `UIText` — positioned HUD/menu text block.
  - `UIProgressBar` — health/loading bar with fill, border, and centred label.
  - `UIJoystick` — virtual on-screen joystick for touch controls (normalized `value {x, y}`).
  - `UICheckbox` — labelled toggle with `onChange`.
  - `UISlider` — draggable horizontal slider with `min`/`max`/`step` and `onChange`.
  - `UIImageButton` — image-skinned button with press-scale/hover-opacity states and optional spritesheet `sourceRect`.
  - `UINineSlice` — nine-slice panel skinning from an image or atlas region (corners unscaled, edges/centre stretch).
  - `UIElement` — abstract base class for custom widgets.
  - **Anchoring** — `element.anchor = { h: 'right', v: 'top' }` + `anchorOffset` positions elements relative to canvas edges/centre, recomputed each frame (resize-proof).
  - **Keyboard navigation** — `ui.enableKeyboardNav()`: Tab/arrows move focus, Enter/Space activate, Left/Right adjust a focused slider; dashed focus ring drawn automatically.
- **Label** — multi-line text support (`\n`) with configurable `lineHeight`, `maxWidth` word-wrapping, and `strokeColor`/`strokeWidth` outline text.
- **Canvas hiDPI** — `new Canvas(id, { hiDPI: true })` renders at devicePixelRatio for crisp output on Retina screens; coordinates stay logical (`pixelRatio` getter; set it on `UIManager`/`Pointer` to keep input aligned).
- **Canvas auto-resize** — `canvas.enableAutoResize()` scales the canvas via CSS to fill its parent (aspect-ratio preserved, ResizeObserver-driven); internal resolution and coordinates unchanged. `disableAutoResize()` restores the natural size.
- **Tests & CI** — 37 unit tests (Node built-in test runner, zero new dependencies) covering physics (incl. moving platforms, SpatialHash, circle resolution, swept casts), Vec2, Timers, Tween, and SceneManager; CI now runs lint + build + tests.

### Added — React (`pivotx/react`)

- `<PivotCanvas autoClear>` — opt-in clearing before child shapes draw each render, so state-driven shapes no longer smear.
- **React UI components** — declare canvas UI in JSX: `<PivotUI>` hosts a UIManager inside `<PivotCanvas>` (auto-draws each frame; `manual` prop for explicit draw-order control) with `<PivotButton>`, `<PivotUIText>`, `<PivotProgressBar>`, `<PivotCheckbox>`, `<PivotSlider>`, and `<PivotJoystick>` — props sync to the widgets every render, `widgetRef` exposes the underlying widget for game-loop reads.
- **React hooks** — `useKeyPressed(key)` and `useGamepadConnected()` (reactive input state for menus/HUDs), `useUIManager(canvasRef, setup)` (UIManager bound to a PivotCanvas with automatic attach/detach).
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
- **useNativeSound** — platform-agnostic audio hook for JSX mode. Audio commands flow through the bridge (native) or execute directly via `SoundManager` (web). Includes `playOneShot`, `pauseAll`/`resumeAll`, `setPlaybackRate`, `fadeTo`, and `fadeOut`.
- **Audio command bridge** — 16 `AudioCommand` types (`loadSound`, `playSound`, `playOneShot`, `stopSound`, `pauseSound`, `resumeSound`, `stopAllSounds`, `pauseAllSounds`, `resumeAllSounds`, `setSoundVolume`, `setPlaybackRate`, `fadeSound`, `fadeOutSound`, `setMasterVolume`, `mute`, `unmute`) handled in both renderers.
- Re-exports of `Vec2`, `Timers`, `Tween`/`TweenManager`/`Easing`, and the circle/raycast physics helpers (all platform-agnostic).
- **UI bridge** — declare canvas UI in JSX on React Native: `PivotButton`, `PivotUIText`, `PivotProgressBar`, `PivotCheckbox`, `PivotSlider`, `PivotJoystick` inside `<PivotNativeCanvas>`. Widget descriptors are reconciled into a real `UIManager` — directly on Expo Web, or inside the WebView on iOS/Android (touches route to the UI first; unconsumed ones still reach `onTouch`; widget events post back over the bridge). Native path requires the published ≥ 2.0.0 UMD in the WebView; older bundles no-op gracefully.
- **NativeInput** — hardware keyboard & game-controller queries with one API on web AND native: `isKeyDown`, `keyAxis` (arrows + WASD), `gamepadConnected`, `isButtonDown`, `getStick` with dead-zone. On iOS/Android, key events and Gamepad-API state from the WebView's DOM are forwarded over the bridge — no native module needed.
- Re-exports of `Sound`, `SoundManager`, collision & physics utilities.

### Changed

- Package description updated to include React Native / Expo support.
- `Canvas` no longer logs to the console on construction.
- `Camera.follow()` accepts an optional `dt` for frame-rate-independent smoothing.
- `package.json` exports now include `./react-native` entry point with ESM, CJS, and types.
- Build produces 11 bundles (was 7 in v1.0.0): 4 core + 2 React + 2 React Native + 3 type declarations.

### Fixed

- `Label` constructor argument order in `expo-example.tsx` (text first, position second).
- `Sound.pause()`/`resume()` broken for looped sounds — the saved offset could exceed the buffer duration; it is now wrapped, and an explicit paused flag lets `resume()` work even when paused at position 0.
- `Canvas.startLoop` and `useGameLoop` now clamp `dt` to 0.1 s so returning from a background tab no longer teleports game objects.
- Physics friction is now frame-rate independent (identical behaviour at 60 fps, consistent at any other fps).
- `SoundManager.loadSound()` no longer leaks the previous audio nodes when reloading an existing name.
- `Sprite.frame` setter no longer produces `NaN` for sheets with zero frames.

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
