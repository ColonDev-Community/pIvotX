import { useCallback, useRef, useEffect } from 'react';

/**
 * Provides bidirectional messaging between React Native and the WebView game.
 *
 * Returns a `postToGame` function to send data to the WebView,
 * and accepts a `handler` map that routes incoming game events to callbacks.
 *
 * @example
 * ```tsx
 * const canvasRef = useRef<PivotNativeCanvasHandle>(null);
 *
 * const { postToGame } = useNativePostMessage(canvasRef, {
 *   score: (data) => console.log('Score:', data.value),
 *   gameOver: () => navigation.goBack(),
 * });
 *
 * // Send data to the game:
 * postToGame({ type: 'setDifficulty', level: 3 });
 * ```
 *
 * Inside the WebView script, receive and send:
 * ```js
 * window.__pivotOnMessage = function(data) {
 *   console.log('From RN:', data);
 * };
 * window.__pivotEmit('score', { value: 100 });
 * ```
 */
export function useNativePostMessage(
  canvasRef: React.RefObject<{ postMessage(data: unknown): void } | null>,
  handlers?: Record<string, (data?: unknown) => void>,
): {
  postToGame: (data: unknown) => void;
  handleGameEvent: (name: string, data?: unknown) => void;
} {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  const postToGame = useCallback(
    (data: unknown) => {
      canvasRef.current?.postMessage(data);
    },
    [canvasRef],
  );

  const handleGameEvent = useCallback((name: string, data?: unknown) => {
    const fn = handlersRef.current?.[name];
    if (fn) fn(data);
  }, []);

  return { postToGame, handleGameEvent };
}
