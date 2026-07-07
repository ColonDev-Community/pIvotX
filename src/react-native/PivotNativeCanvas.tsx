// ─── PivotNativeCanvas ─────────────────────────────────────────────────────────
//
// Root component for rendering pIvotX games inside React Native / Expo.
//
// On native (iOS / Android): uses a WebView running the pIvotX UMD bundle.
// On web (Expo Web / react-native-web): renders an HTML <canvas> directly,
// bypassing react-native-webview (which doesn't support web).
//
// Two modes:
//   1. Script mode: pass a `script` prop with game code (runs at 60fps inside WV)
//   2. JSX mode: use <PivotCircle>, <PivotSprite>, etc. as children
//

import React, {
  useRef,
  useMemo,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

import { generateHTML } from './bridge/html-template';
import { NativeDrawContext } from './context/NativeDrawContext';
import type {
  DrawCommand,
  AudioCommand,
  UIWidgetDescriptor,
  UIWidgetHandlers,
  PivotNativeCanvasProps,
  PivotNativeCanvasHandle,
} from './bridge/types';

// Web-only: direct canvas command executor (tree-shaken on native)
import { executeCommands, executeAudioCommands } from './web/executeCommands';
import { UIManager } from '../core/ui/UIManager';
import { reconcileUI, createUIReconcilerState } from './web/uiReconciler';
import { nativeInputStore } from './input/nativeInputStore';
import { drainGlobalAudio } from './audio/globalAudioQueue';

// U+2028/U+2029 are valid inside JSON strings but are line terminators in
// JavaScript source on older engines — escape them so injected JSON can never
// break out of the injectJavaScript statement.
function toJsSource(json: string): string {
  return json.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

// ─── Shared command collection logic ─────────────────────────────────────────

function useCommandCollection() {
  const commandsRef = useRef<DrawCommand[]>([]);
  const audioCommandsRef = useRef<AudioCommand[]>([]);
  const uiWidgetsRef = useRef<UIWidgetDescriptor[]>([]);
  const uiHandlersRef = useRef(new Map<string, UIWidgetHandlers>());
  const cameraRef = useRef({ x: 0, y: 0 });

  // Reset draw commands and UI descriptors at the start of each render so
  // children register fresh.
  commandsRef.current = [];
  uiWidgetsRef.current = [];
  // Audio commands are NOT reset per frame — they accumulate and are flushed once.

  const registerCommand = useCallback((cmd: DrawCommand) => {
    commandsRef.current.push(cmd);
  }, []);

  const registerAudioCommand = useCallback((cmd: AudioCommand) => {
    audioCommandsRef.current.push(cmd);
  }, []);

  const registerUIWidget = useCallback(
    (desc: UIWidgetDescriptor, handlers?: UIWidgetHandlers) => {
      uiWidgetsRef.current.push(desc);
      if (handlers) uiHandlersRef.current.set(desc.id, handlers);
      else uiHandlersRef.current.delete(desc.id);
    },
    [],
  );

  const setCameraPosition = useCallback((pos: { x: number; y: number }) => {
    cameraRef.current = pos;
  }, []);

  const contextValue = useMemo(
    () => ({
      registerCommand,
      registerAudioCommand,
      registerUIWidget,
      cameraPosition: cameraRef.current,
      setCameraPosition,
    }),
    [registerCommand, registerAudioCommand, registerUIWidget, setCameraPosition],
  );

  return { commandsRef, audioCommandsRef, uiWidgetsRef, uiHandlersRef, cameraRef, contextValue };
}

// ─── Web implementation ──────────────────────────────────────────────────────

const WebCanvas = forwardRef<
  PivotNativeCanvasHandle,
  PivotNativeCanvasProps
>(function WebCanvas(
  { width = 400, height = 300, background = '#000', onTouch, worldSpaceTouch = false, style, children },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const { commandsRef, audioCommandsRef, uiWidgetsRef, uiHandlersRef, cameraRef, contextValue } =
    useCommandCollection();
  const uiManagerRef = useRef<UIManager | null>(null);
  const uiStateRef = useRef(createUIReconcilerState());

  // ── Init canvas context ────────────────────────────────────────────────

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    ctxRef.current = el.getContext('2d');
    return () => {
      uiManagerRef.current?.detach();
      uiManagerRef.current = null;
    };
  }, []);

  // ── Imperative handle ──────────────────────────────────────────────────

  useImperativeHandle(ref, () => ({
    postMessage() { /* no-op on web */ },
    injectScript() {
      // Deliberately unsupported on web: the native implementation delegates
      // to the WebView's injectJavaScript, but a web equivalent would need
      // dynamic code execution — a CSP blocker and a supply-chain red flag.
      // Use JSX mode (or platform checks) for web builds.
      console.warn(
        'pIvotX: injectScript targets the native WebView and is a no-op on web — use JSX mode instead.',
      );
    },
  }));

  // ── Flush commands directly to canvas after each render ────────────────

  useEffect(() => {
    const ctx = ctxRef.current;
    const el = canvasRef.current;
    if (!ctx || !el) return;

    const cmds = commandsRef.current;
    const frame: DrawCommand[] = [{ type: 'clear' }, ...cmds];
    executeCommands(frame, ctx, el);

    // Reconcile & draw UI widgets on top
    if (uiWidgetsRef.current.length > 0 || uiStateRef.current.widgets.size > 0) {
      if (!uiManagerRef.current) uiManagerRef.current = new UIManager(el);
      const ui = uiManagerRef.current;
      reconcileUI(ui, uiStateRef.current, uiWidgetsRef.current, (id) =>
        uiHandlersRef.current.get(id),
      );
      ui.draw(ctx);
    }

    // Flush audio commands (one-shot, then clear) — including any enqueued
    // by useNativeSound outside the canvas
    const audioCmds = [...audioCommandsRef.current, ...drainGlobalAudio()];
    if (audioCmds.length > 0) {
      executeAudioCommands(audioCmds);
      audioCommandsRef.current = [];
    }
  });

  // ── Touch event forwarding ─────────────────────────────────────────────

  useEffect(() => {
    const el = canvasRef.current;
    if (!el || !onTouch) return;

    const getRect = () => el.getBoundingClientRect();

    const mapTouch = (clientX: number, clientY: number, r: DOMRect) => {
      let x = clientX - r.left;
      let y = clientY - r.top;
      if (worldSpaceTouch) {
        x += cameraRef.current.x;
        y += cameraRef.current.y;
      }
      return { x, y };
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const r = getRect();
      onTouch('start', Array.from(e.changedTouches).map(t => ({
        ...mapTouch(t.clientX, t.clientY, r), id: t.identifier,
      })));
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const r = getRect();
      onTouch('move', Array.from(e.changedTouches).map(t => ({
        ...mapTouch(t.clientX, t.clientY, r), id: t.identifier,
      })));
    };
    const onTouchEnd = (e: TouchEvent) => {
      const r = getRect();
      onTouch('end', Array.from(e.changedTouches).map(t => ({
        ...mapTouch(t.clientX, t.clientY, r), id: t.identifier,
      })));
    };

    // Mouse fallback for desktop browsers
    let mouseDown = false;
    const onMouseDown = (e: MouseEvent) => {
      mouseDown = true;
      const r = getRect();
      onTouch('start', [{ ...mapTouch(e.clientX, e.clientY, r), id: 0 }]);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseDown) return;
      const r = getRect();
      onTouch('move', [{ ...mapTouch(e.clientX, e.clientY, r), id: 0 }]);
    };
    const onMouseUp = () => {
      if (!mouseDown) return;
      mouseDown = false;
      onTouch('end', []);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onTouch]);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <NativeDrawContext.Provider value={contextValue}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width, height,
          background,
          display: 'block',
          ...(style as Record<string, unknown> ?? {}),
        }}
      />
      {children}
    </NativeDrawContext.Provider>
  );
});

// ─── Native implementation ───────────────────────────────────────────────────

const NativeWebViewCanvas = forwardRef<
  PivotNativeCanvasHandle,
  PivotNativeCanvasProps
>(function NativeWebViewCanvas(
  {
    width = 400,
    height = 300,
    background = '#000',
    script,
    onGameEvent,
    onTouch,
    worldSpaceTouch = false,
    allowFileAccess = true,
    mixedContentMode = 'always',
    originWhitelist = ['*'],
    style,
    children,
  },
  ref,
) {
  const webViewRef = useRef<WebView>(null);
  const { commandsRef, audioCommandsRef, uiWidgetsRef, uiHandlersRef, cameraRef, contextValue } =
    useCommandCollection();
  const lastUIJsonRef = useRef('');
  // loadSound commands are one-shot but must survive the page-load race —
  // recorded here and replayed once the WebView finishes loading.
  const soundLoadsRef = useRef(new Map<string, AudioCommand>());

  // ── Imperative handle ──────────────────────────────────────────────────

  useImperativeHandle(ref, () => ({
    postMessage(data: unknown) {
      webViewRef.current?.postMessage(JSON.stringify(data));
    },
    injectScript(js: string) {
      webViewRef.current?.injectJavaScript(js + '; true;');
    },
  }));

  // ── Flush commands to WebView after each render ────────────────────────

  useEffect(() => {
    const cmds = commandsRef.current;
    const hasUI = uiWidgetsRef.current.length > 0 || lastUIJsonRef.current !== '';
    const globalAudio = drainGlobalAudio();
    if (globalAudio.length > 0) audioCommandsRef.current.push(...globalAudio);
    if (cmds.length === 0 && audioCommandsRef.current.length === 0 && !hasUI) return;

    if (cmds.length > 0) {
      const frame: DrawCommand[] = [{ type: 'clear' }, ...cmds];
      const json = JSON.stringify(frame);
      webViewRef.current?.injectJavaScript(
        `if (window.__pivotDraw) window.__pivotDraw(${toJsSource(json)}); true;`,
      );
    }

    // Flush UI descriptors only when they actually changed (dirty check),
    // so a 60fps game loop doesn't spam identical UI over the bridge.
    if (hasUI) {
      const uiJson = JSON.stringify(uiWidgetsRef.current);
      if (uiJson !== lastUIJsonRef.current) {
        lastUIJsonRef.current = uiJson === '[]' ? '' : uiJson;
        webViewRef.current?.injectJavaScript(
          `if (window.__pivotUI) window.__pivotUI(${toJsSource(uiJson)}); true;`,
        );
      }
    }

    // Flush audio commands (one-shot, then clear)
    const audioCmds = audioCommandsRef.current;
    if (audioCmds.length > 0) {
      for (const cmd of audioCmds) {
        if (cmd.type === 'loadSound') soundLoadsRef.current.set(cmd.name, cmd);
      }
      const audioJson = JSON.stringify(audioCmds);
      webViewRef.current?.injectJavaScript(
        `if (window.__pivotAudio) window.__pivotAudio(${toJsSource(audioJson)}); true;`,
      );
      audioCommandsRef.current = [];
    }
  });

  // ── Post-load resync ───────────────────────────────────────────────────
  //
  // Anything injected while the WebView was still loading its HTML + engine
  // fell into the void — and the UI dirty-check would otherwise believe it
  // was delivered. Once the page is ready, replay the sound loads and the
  // last known UI state.
  const handleLoadEnd = useCallback(() => {
    const wv = webViewRef.current;
    if (!wv) return;
    if (soundLoadsRef.current.size > 0) {
      const loads = [...soundLoadsRef.current.values()];
      wv.injectJavaScript(
        `if (window.__pivotAudio) window.__pivotAudio(${toJsSource(JSON.stringify(loads))}); true;`,
      );
    }
    if (lastUIJsonRef.current !== '') {
      wv.injectJavaScript(
        `if (window.__pivotUI) window.__pivotUI(${toJsSource(lastUIJsonRef.current)}); true;`,
      );
    }
  }, []);

  // ── WebView message handler ────────────────────────────────────────────

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);

        if (msg.type === 'touch' && onTouch) {
          const touches = worldSpaceTouch
            ? msg.touches.map((t: { x: number; y: number; id: number }) => ({
                x: t.x + cameraRef.current.x,
                y: t.y + cameraRef.current.y,
                id: t.id,
              }))
            : msg.touches;
          onTouch(msg.action, touches);
        } else if (msg.type === 'gameEvent' && onGameEvent) {
          onGameEvent(msg.name, msg.data);
        } else if (msg.type === 'uiEvent') {
          const handlers = uiHandlersRef.current.get(msg.id);
          if (handlers) {
            if (msg.event === 'click') handlers.onClick?.();
            else if (msg.event === 'change') handlers.onChange?.(msg.value);
            else if (msg.event === 'move') handlers.onMove?.(msg.value);
          }
        } else if (msg.type === 'keyEvent') {
          nativeInputStore.applyKeyEvent(msg.action, msg.code);
        } else if (msg.type === 'gamepadState') {
          nativeInputStore.applyGamepadState(msg.connected, msg.buttons, msg.axes);
        }
      } catch {
        // Ignore unparseable messages
      }
    },
    [onTouch, onGameEvent, worldSpaceTouch],
  );

  // ── HTML source ────────────────────────────────────────────────────────

  const html = useMemo(
    () => generateHTML(width, height, background, script),
    [width, height, background, script],
  );

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <NativeDrawContext.Provider value={contextValue}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={[{ width, height }, style as Record<string, unknown>]}
        scrollEnabled={false}
        bounces={false}
        originWhitelist={originWhitelist}
        javaScriptEnabled={true}
        onMessage={handleMessage}
        onLoadEnd={handleLoadEnd}
        allowFileAccess={allowFileAccess}
        mixedContentMode={mixedContentMode}
      />
      {children}
    </NativeDrawContext.Provider>
  );
});

// ─── Platform-aware export ───────────────────────────────────────────────────

/**
 * Root canvas component for React Native / Expo.
 *
 * - On **web**: renders an HTML `<canvas>` element directly (no WebView needed).
 * - On **native**: renders a WebView with the full pIvotX engine.
 *
 * The same JSX component API works on all platforms:
 * ```tsx
 * <PivotNativeCanvas width={400} height={300}>
 *   <PivotCircle center={{ x: 200, y: 150 }} radius={30} fill="tomato" />
 * </PivotNativeCanvas>
 * ```
 */
export const PivotNativeCanvas = forwardRef<
  PivotNativeCanvasHandle,
  PivotNativeCanvasProps
>(function PivotNativeCanvas(props, ref) {
  if (Platform.OS === 'web') {
    return <WebCanvas ref={ref} {...props} />;
  }
  return <NativeWebViewCanvas ref={ref} {...props} />;
});
