# pIvotX — Engine Audit & Roadmap (v2.0.0)

Deep-audit of the library performed 2026-07-06. Items marked ✅ are done;
items marked ⬜ remain planned work.

---

## 1. Bugs found in existing code — ALL FIXED ✅

- ✅ **Sound: pause/resume broken for looped sounds** — pause offset could exceed
  the buffer duration; now wrapped with modulo, and an explicit `paused` flag
  lets `resume()` work even when paused at position 0.
- ✅ **Canvas.startLoop / useGameLoop: unclamped `dt`** — returning from a
  background tab teleported objects; `dt` is now clamped to 0.1 s.
- ✅ **Physics: `Platform.oneWay` ignored by the resolver** — `StaticRect.oneWay`
  now supported (only collides when landing from above while falling).
- ✅ **Physics: frame-rate-dependent friction** — now `friction^(dt·60)`.
- ✅ **Sprite: `frame` setter NaN on zero-frame sheets** — guarded.
- ✅ **SoundManager.loadSound leaked nodes when reloading a name** — old
  instance is disposed first.

## 2. Sound engine

- ✅ `playbackRate` (live speed/pitch), `currentTime`, `paused`.
- ✅ `fadeTo` / `fadeIn` / `fadeOut` (fadeOut stops at silence).
- ✅ `playOneShot(volume?)` — overlapping fire-and-forget SFX.
- ✅ `pan` — StereoPannerNode-based stereo panning (lazily spliced in), cheap
  positional audio.
- ✅ `playSegment(start, duration, volume?)` — audio sprites (many SFX in one file).
- ✅ `dispose()`; `SoundManager.unload/unloadAll/pauseAll/resumeAll/setVolume`.
- ✅ RN bridge parity: 6 new `AudioCommand` types (`playOneShot`,
  `pauseAllSounds`, `resumeAllSounds`, `setPlaybackRate`, `fadeSound`,
  `fadeOutSound`) wired through types, WebView renderer, web executor, and
  `useNativeSound`.
- ✅ Sound groups/buses — `loadSound(name, src, { group: 'sfx' })` +
  `setGroupVolume('sfx', v)` / `getGroupVolume()` (per-bus GainNodes routed
  through the master gain).
- ✅ Declarative audio-sprite maps — `sound.defineSprites({ jump: [0, 0.4] })`
  then `sound.playSprite('jump')`.

## 3. Physics engine

- ✅ One-way platform support (`StaticRect.oneWay`).
- ✅ `maxFallSpeed` (terminal velocity) and `bounce` (restitution 0–1 with
  rest-threshold so bodies settle) options in `StepOptions`.
- ✅ Frame-rate-independent friction.
- ✅ `stepBodyOnTilemap(body, tilemap, dt, opts)` — steps a body against a
  Tilemap's solid tiles with broad-phase culling.
- ✅ `circlesOverlap`, `circleAABBOverlap` (closest-point, corners correct).
- ✅ `raycastAABB(origin, dir, box, maxT?)` — slab method, returns t/point/normal.
- ✅ Moving platforms — `StaticRect.vx/vy`: stepBody advances them and carries
  bodies standing on them (tested).
- ✅ `SpatialHash` — uniform-grid broad-phase (insert/query/clear, deduped).
- ✅ `circleAABBResolve` — pushes an overlapping circle out along the
  closest-point normal (centre-inside handled).
- ✅ Swept (continuous) circle casts — `raycastCircle` + `sweepCircleAABB`
  (Minkowski-sum sweep with rounded corners; tunnel-proof at any speed, tested).

## 4. Input engine

- ✅ **`Keyboard`** — isDown/justPressed/justReleased, friendly aliases,
  `getAxis`, stuck-key release on blur, auto per-frame update.
- ✅ **`GamepadInput`** — standard-mapping button names, sticks with dead-zone,
  analogue triggers, rumble.
- ✅ **`Pointer`** — unified mouse/touch state on the canvas (x/y/isDown/
  justPressed/justReleased, CSS-scale compensated).
- ✅ **`InputMap`** — action mapping across devices:
  `InputMap.bind('jump', ['space', 'gamepad:a'])`.
- ✅ React hooks — `useKeyPressed(key)` and `useGamepadConnected()` (reactive,
  for menus/HUDs), plus `useUIManager(canvasRef, setup)`.
- ⬜ RN native hardware keyboard/controller events — requires native modules
  (e.g. a game-controller package) beyond this library's WebView bridge;
  out of scope for v2.0.0.

## 5. UI engine

- ✅ `UIManager` (multi-touch pointer routing, topmost-first hit-testing,
  one-call drawing), `UIElement` base.
- ✅ `UIButton`, `UIText`, `UIPanel` (column/row auto-layout), `UIProgressBar`,
  `UIJoystick` (virtual stick for mobile).
- ✅ `UICheckbox` (labelled toggle, onChange).
- ✅ `UISlider` (drag anywhere on track, min/max/step, onChange).
- ✅ `UIImageButton` (image/spritesheet skin, press-scale + hover-opacity).
- ✅ `UINineSlice` — nine-slice skinning from an image or atlas `sourceRect`.
- ✅ Anchoring — `el.anchor = { h, v }` + `anchorOffset`, recomputed each frame
  by UIManager from the canvas size (resize-proof).
- ✅ Focus/keyboard nav — `ui.enableKeyboardNav()`: Tab/arrows traverse,
  Enter/Space activate, Left/Right nudge sliders, dashed focus ring drawn.
- ✅ React wrapper components — `<PivotUI>` (hosts a UIManager in PivotCanvas,
  auto-draws each frame or `manual`) with `<PivotButton>`, `<PivotUIText>`,
  `<PivotProgressBar>`, `<PivotCheckbox>`, `<PivotSlider>`, `<PivotJoystick>`;
  props sync per render, `widgetRef` exposes the widget for game-loop reads.
- ⬜ RN bridge UI commands so JSX mode gets UI on native (WebView) too —
  needs widget serialization + WebView-side pointer routing; do together with
  the RN-native input work.

## 6. Game utilities

- ✅ **`Vec2`** — add/sub/scale/dot/length/normalize/distance/lerp/rotate/
  clampLength/angle/fromAngle (pure, non-mutating).
- ✅ **`Timers`** — `after(sec, fn)` / `every(sec, fn)` driven by loop dt,
  cancellable handles.
- ✅ **`TweenManager` / `Tween` / `Easing`** — animate any numeric properties,
  10 easings, delay, completion/update callbacks.
- ✅ **`ParticleEmitter`** — pooled particles, `burst()` + continuous `rate`,
  gravity/drag/fade/shrink, implements IDrawable.
- ✅ **`Scene` / `SceneManager`** — switch + push/pop overlay scenes.
- ✅ **`Label`** — multi-line text (`\n`) with `lineHeight`.
- ✅ **`Camera`** — `shake(intensity, duration)`, animated `setZoom(z, duration)`
  (CHANGELOG claim now true), dt-aware `follow` for frame-rate independence,
  `update(dt)`.
- ✅ Removed `console.log` on Canvas construction.
- ✅ **Unit tests** — 37 tests via Node's built-in test runner (zero new deps):
  physics (one-way, friction, bounce, maxFallSpeed, raycast, circles, moving
  platforms, SpatialHash, circle resolution, swept casts), Vec2, Timers,
  Tween/Easing, SceneManager. `npm test`.
- ✅ **CI** — lint + type-check + build + tests on push/PR (including 2.0.0 branch).
- ✅ Canvas hiDPI — `new Canvas(id, { hiDPI: true })` renders at
  devicePixelRatio with logical coordinates; `pixelRatio` knob on
  UIManager/Pointer keeps input aligned.
- ✅ Canvas auto-resize — `enableAutoResize()` CSS-scales the canvas to fill
  its parent (aspect preserved, ResizeObserver-driven, coordinates unchanged);
  `disableAutoResize()` restores.
- ✅ React `<PivotCanvas autoClear>` — clears in the parent's render phase,
  which runs before child draw effects (opt-in, default off).
- ✅ Label: `maxWidth` word-wrapping and `strokeColor`/`strokeWidth` outline.
- ✅ `Camera.followWithDeadZone(target, w, h, lerp?, dt?)`.

## 7. Ecosystem sync (per CLAUDE.md)

- ✅ GUIDE.md — "What's New in v2.0.0" quick-reference chapter covering Input,
  UI, Sound, Physics, Game Utilities, Camera, hiDPI, and React extras.
- ✅ `pivotx-docs` — added a **v2.0.0 (Latest)** docs version
  (`src/data/docs-v2.ts`): What's New, Input Engine, UI Engine, Sound Engine,
  Physics Engine, Game Utilities, Camera & Canvas. Production build verified.
- ✅ `pIvotX-expo` — verified: consumes `file:../pIvotX`, type-checks clean
  against v2.0.0 (all changes additive, nothing to migrate). Its CLAUDE.md now
  lists the new RN-available APIs the sample could showcase next.
- ⬜ `pIvotX-expo` — actually showcase new APIs in a demo game (one-shot SFX,
  fades, moving platforms; UI widgets once the RN UI bridge lands) —
  gameplay-affecting, best done hands-on with the app running.
