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
  PivotNativeCanvasProps,
  PivotNativeCanvasHandle,
} from './bridge/types';

// Web-only: direct canvas command executor (tree-shaken on native)
import { executeCommands } from './web/executeCommands';

// ─── Shared command collection logic ─────────────────────────────────────────

function useCommandCollection() {
  const commandsRef = useRef<DrawCommand[]>([]);
  const cameraRef = useRef({ x: 0, y: 0 });

  // Reset commands at the start of each render so children register fresh.
  commandsRef.current = [];

  const registerCommand = useCallback((cmd: DrawCommand) => {
    commandsRef.current.push(cmd);
  }, []);

  const setCameraPosition = useCallback((pos: { x: number; y: number }) => {
    cameraRef.current = pos;
  }, []);

  const contextValue = useMemo(
    () => ({ registerCommand, cameraPosition: cameraRef.current, setCameraPosition }),
    [registerCommand, setCameraPosition],
  );

  return { commandsRef, cameraRef, contextValue };
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
  const { commandsRef, cameraRef, contextValue } = useCommandCollection();

  // ── Init canvas context ────────────────────────────────────────────────

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    ctxRef.current = el.getContext('2d');
  }, []);

  // ── Imperative handle ──────────────────────────────────────────────────

  useImperativeHandle(ref, () => ({
    postMessage() { /* no-op on web */ },
    injectScript(js: string) {
      try { new Function(js)(); } catch { /* script mode not fully supported on web */ }
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
    style,
    children,
  },
  ref,
) {
  const webViewRef = useRef<WebView>(null);
  const { commandsRef, cameraRef, contextValue } = useCommandCollection();

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
    if (cmds.length === 0) return;

    const frame: DrawCommand[] = [{ type: 'clear' }, ...cmds];
    const json = JSON.stringify(frame);

    webViewRef.current?.injectJavaScript(
      `window.__pivotDraw(${json}); true;`,
    );
  });

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
        originWhitelist={['*']}
        javaScriptEnabled={true}
        onMessage={handleMessage}
        allowFileAccess={true}
        mixedContentMode="always"
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
