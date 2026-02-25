import React, {
  useRef,
  useState,
  useEffect,
  createContext,
  useContext,
  forwardRef,
  useImperativeHandle,
  ReactNode,
} from 'react';
import type { PropsWithChildren } from 'react';

// ── Context ────────────────────────────────────────────────────────────────────

/** Shared 2D rendering context available to all child shape components. */
export const CanvasContext = createContext<CanvasRenderingContext2D | null>(null);

export function useCanvasContext(): CanvasRenderingContext2D {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error('pIvotX: Shape components must be inside <PivotCanvas>');
  return ctx;
}

// ── PivotCanvas ────────────────────────────────────────────────────────────────

export interface PivotCanvasHandle {
  /** The raw HTMLCanvasElement */
  element: HTMLCanvasElement | null;
  /** The raw CanvasRenderingContext2D */
  ctx:     CanvasRenderingContext2D | null;
  /** Clear the entire canvas */
  clear(): void;
}

export interface PivotCanvasProps {
  width?:       number;
  height?:      number;
  background?:  string;
  style?:       React.CSSProperties;
  className?:   string;
  children?:    ReactNode;
}

/**
 * The root canvas component. Wrap all pIvotX shape components inside it.
 * Exposes a ref handle for direct canvas access if needed.
 *
 * @example
 * <PivotCanvas width={600} height={400} background="#1a1a2e">
 *   <PivotCircle center={{ x: 300, y: 200 }} radius={50} fill="tomato" />
 * </PivotCanvas>
 */
export const PivotCanvas = forwardRef<PivotCanvasHandle, PropsWithChildren<PivotCanvasProps>>(
  ({ width = 600, height = 400, background, style, className, children }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef    = useRef<CanvasRenderingContext2D | null>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;
      ctxRef.current = context;
      setCtx(context);
    }, []);

    useImperativeHandle(ref, () => ({
      get element() { return canvasRef.current; },
      get ctx()     { return ctxRef.current;    },
      clear() {
        const c = canvasRef.current;
        const ctx = ctxRef.current;
        if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
      },
    }));

    return (
      <CanvasContext.Provider value={ctx}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ background: background ?? 'transparent', ...style }}
          className={className}
        >
          {ctx && children}
        </canvas>
      </CanvasContext.Provider>
    );
  }
);

PivotCanvas.displayName = 'PivotCanvas';
