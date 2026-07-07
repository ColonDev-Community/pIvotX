/**
 * pIvotX React UI wrapper components.
 *
 * <PivotUI> creates a UIManager bound to the parent <PivotCanvas> and draws
 * it every animation frame (on top of whatever the game loop drew). The
 * widget components inside declare UI in JSX; their props are synced to the
 * underlying widget objects on every render.
 *
 * @example
 * <PivotCanvas width={600} height={400} autoClear>
 *   ...game shapes...
 *   <PivotUI>
 *     <PivotButton x={230} y={180} width={140} text="Play" onClick={start} />
 *     <PivotProgressBar x={16} y={16} width={200} value={hp} label="HP" />
 *     <PivotJoystick x={80} y={330} radius={55} widgetRef={stickRef} />
 *   </PivotUI>
 * </PivotCanvas>
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  MutableRefObject,
} from 'react';
import { useCanvasContext } from '../PivotCanvas';
import { UIManager } from '../../core/ui/UIManager';
import { UIElement } from '../../core/ui/UIElement';
import { UIButton, UIButtonStyle } from '../../core/ui/UIButton';
import { UIText } from '../../core/ui/UIText';
import { UIProgressBar } from '../../core/ui/UIProgressBar';
import { UICheckbox } from '../../core/ui/UICheckbox';
import { UISlider } from '../../core/ui/UISlider';
import { UIJoystick } from '../../core/ui/UIJoystick';
import type { CSSColor } from '../../core/types';

// ── Context ────────────────────────────────────────────────────────────────────

const UIManagerContext = createContext<UIManager | null>(null);

function useUIContext(): UIManager {
  const ui = useContext(UIManagerContext);
  if (!ui) throw new Error('pIvotX: UI components must be inside <PivotUI>');
  return ui;
}

// ── PivotUI ────────────────────────────────────────────────────────────────────

export interface PivotUIProps {
  /**
   * When true, PivotUI does NOT draw automatically — call
   * `uiRef.current.draw(ctx)` yourself at the end of your game loop.
   * Use this when you need exact control over draw order.
   */
  manual?: boolean;
  /** Receives the UIManager instance for imperative access. */
  uiRef?: MutableRefObject<UIManager | null>;
  children?: ReactNode;
}

/**
 * Hosts pIvotX UI widgets inside a <PivotCanvas>.
 *
 * Place it as the LAST child so the UI draws on top: after every render it
 * repaints the UI once the sibling shape components have drawn (this is what
 * keeps it visible in games that re-render each frame with `autoClear`), and
 * a rAF loop repaints between renders so hover/press/drag feedback stays
 * live even in static scenes.
 */
export function PivotUI({ manual = false, uiRef, children }: PivotUIProps) {
  const ctx = useCanvasContext();
  const [manager, setManager] = useState<UIManager | null>(null);

  useEffect(() => {
    const ui = new UIManager(ctx.canvas);
    setManager(ui);
    if (uiRef) uiRef.current = ui;

    let rafId = 0;
    if (!manual) {
      const loop = () => {
        ui.draw(ctx);
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ui.detach();
      if (uiRef) uiRef.current = null;
      setManager(null);
    };

  }, [ctx, manual]);

  // Repaint after every render, once sibling shape effects have drawn —
  // without this, autoClear games erase the UI between rAF repaints.
  useEffect(() => {
    if (!manual && manager) manager.draw(ctx);
  });

  return manager ? (
    <UIManagerContext.Provider value={manager}>{children}</UIManagerContext.Provider>
  ) : null;
}

// ── Shared widget registration hook ────────────────────────────────────────────

/** Create the widget once, register/unregister it with the UIManager. */
function useWidget<T extends UIElement>(
  create: () => T,
  widgetRef?: MutableRefObject<T | null>,
): T {
  const ui = useUIContext();
  const ref = useRef<T | null>(null);
  if (ref.current === null) ref.current = create();
  const widget = ref.current;

  useEffect(() => {
    ui.add(widget);
    if (widgetRef) widgetRef.current = widget;
    return () => {
      ui.remove(widget);
      if (widgetRef) widgetRef.current = null;
    };
     
  }, [ui, widget]);

  return widget;
}

/** Common positional props for all UI wrapper components. */
export interface UIWidgetBaseProps {
  x: number;
  y: number;
  /** Hide without unmounting. */
  visible?: boolean;
  /** Disable pointer/keyboard interaction. */
  disabled?: boolean;
}

// ── PivotButton ────────────────────────────────────────────────────────────────

export interface PivotButtonProps extends UIWidgetBaseProps {
  text: string;
  width?: number;
  height?: number;
  style?: UIButtonStyle;
  onClick?: () => void;
  widgetRef?: MutableRefObject<UIButton | null>;
}

export function PivotButton({
  x, y, text, width = 140, height = 44, style, onClick, visible = true, disabled = false, widgetRef,
}: PivotButtonProps) {
  const btn = useWidget(
    () => new UIButton(text, { x, y }, width, height, style),
    widgetRef,
  );
  btn.text = text;
  btn.position.x = x;
  btn.position.y = y;
  btn.width = width;
  btn.height = height;
  if (style) btn.style = { ...btn.style, ...style };
  btn.onClick = onClick ?? null;
  btn.visible = visible;
  btn.enabled = !disabled;
  return null;
}

// ── PivotUIText ────────────────────────────────────────────────────────────────

export interface PivotUITextProps extends UIWidgetBaseProps {
  text: string;
  color?: CSSColor;
  font?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  widgetRef?: MutableRefObject<UIText | null>;
}

export function PivotUIText({
  x, y, text, color, font, align, baseline, visible = true, widgetRef,
}: PivotUITextProps) {
  const el = useWidget(
    () => new UIText(text, { x, y }, { color, font, align, baseline }),
    widgetRef,
  );
  el.text = text;
  el.position.x = x;
  el.position.y = y;
  if (color !== undefined) el.color = color;
  if (font !== undefined) el.font = font;
  if (align !== undefined) el.align = align;
  if (baseline !== undefined) el.baseline = baseline;
  el.visible = visible;
  return null;
}

// ── PivotProgressBar ───────────────────────────────────────────────────────────

export interface PivotProgressBarProps extends UIWidgetBaseProps {
  /** Fill amount 0–1. */
  value: number;
  width?: number;
  height?: number;
  fill?: CSSColor;
  background?: CSSColor;
  label?: string;
  widgetRef?: MutableRefObject<UIProgressBar | null>;
}

export function PivotProgressBar({
  x, y, value, width = 200, height = 20, fill, background, label, visible = true, widgetRef,
}: PivotProgressBarProps) {
  const bar = useWidget(
    () => new UIProgressBar({ x, y }, width, height, { fill, background, label, value }),
    widgetRef,
  );
  bar.position.x = x;
  bar.position.y = y;
  bar.width = width;
  bar.height = height;
  bar.value = value;
  if (fill !== undefined) bar.fill = fill;
  if (background !== undefined) bar.background = background;
  bar.label = label ?? null;
  bar.visible = visible;
  return null;
}

// ── PivotCheckbox ──────────────────────────────────────────────────────────────

export interface PivotCheckboxProps extends UIWidgetBaseProps {
  label: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  widgetRef?: MutableRefObject<UICheckbox | null>;
}

export function PivotCheckbox({
  x, y, label, checked, onChange, visible = true, disabled = false, widgetRef,
}: PivotCheckboxProps) {
  const box = useWidget(
    () => new UICheckbox(label, { x, y }, { checked }),
    widgetRef,
  );
  box.label = label;
  box.position.x = x;
  box.position.y = y;
  box.checked = checked;
  box.onChange = onChange ?? null;
  box.visible = visible;
  box.enabled = !disabled;
  return null;
}

// ── PivotSlider ────────────────────────────────────────────────────────────────

export interface PivotSliderProps extends UIWidgetBaseProps {
  value: number;
  width?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  widgetRef?: MutableRefObject<UISlider | null>;
}

export function PivotSlider({
  x, y, value, width = 180, min, max, step, onChange, visible = true, disabled = false, widgetRef,
}: PivotSliderProps) {
  const slider = useWidget(
    () => new UISlider({ x, y }, width, { value, min, max, step }),
    widgetRef,
  );
  slider.position.x = x;
  slider.position.y = y;
  slider.width = width;
  // Only push the prop value when the user isn't mid-drag, so controlled
  // updates don't fight the pointer.
  if (!slider.pressed) slider.value = value;
  if (min !== undefined) slider.min = min;
  if (max !== undefined) slider.max = max;
  if (step !== undefined) slider.step = step;
  slider.onChange = onChange ?? null;
  slider.visible = visible;
  slider.enabled = !disabled;
  return null;
}

// ── PivotJoystick ──────────────────────────────────────────────────────────────

export interface PivotJoystickProps {
  /** Centre X of the joystick base. */
  x: number;
  /** Centre Y of the joystick base. */
  y: number;
  radius?: number;
  visible?: boolean;
  /**
   * Access the widget to read `value {x, y}` inside your game loop:
   * `stickRef.current?.value.x`
   */
  widgetRef?: MutableRefObject<UIJoystick | null>;
}

export function PivotJoystick({ x, y, radius = 60, visible = true, widgetRef }: PivotJoystickProps) {
  const stick = useWidget(
    () => new UIJoystick({ x, y }, radius),
    widgetRef,
  );
  if (stick.center.x !== x || stick.center.y !== y) stick.center = { x, y };
  stick.radius = radius;
  stick.visible = visible;
  return null;
}
