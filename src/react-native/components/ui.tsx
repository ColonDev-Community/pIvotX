/**
 * pIvotX React Native UI components.
 *
 * Declare canvas UI in JSX inside <PivotNativeCanvas>. Widgets are described
 * per render and reconciled by the platform renderer:
 * - Expo Web: into a real UIManager on the <canvas> element.
 * - Native (WebView): serialized to the WebView, where the UMD bundle's
 *   UIManager handles touch routing and drawing; events post back over the
 *   bridge. Requires the published @colon-dev/pivotx ≥ 2.0.0 UMD in the
 *   WebView (older CDN bundles ignore UI commands gracefully).
 *
 * @example
 * <PivotNativeCanvas width={400} height={300}>
 *   ...shapes...
 *   <PivotButton x={130} y={120} text="Play" onClick={start} />
 *   <PivotJoystick x={70} y={230} radius={50} onMove={(v) => (stick.current = v)} />
 * </PivotNativeCanvas>
 */

import { useId } from 'react';
import { useNativeDrawContext } from '../context/NativeDrawContext';
import type { UIWidgetKind, UIWidgetHandlers } from '../bridge/types';

function useRegisterWidget(
  kind: UIWidgetKind,
  props: Record<string, unknown>,
  handlers?: UIWidgetHandlers,
): null {
  const id = useId();
  const { registerUIWidget } = useNativeDrawContext();
  registerUIWidget({ id, kind, props }, handlers);
  return null;
}

// ── PivotButton ────────────────────────────────────────────────────────────────

export interface PivotNativeButtonProps {
  x: number;
  y: number;
  text: string;
  width?: number;
  height?: number;
  /** Background colour. */
  background?: string;
  /** Label colour. */
  color?: string;
  visible?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

/** A push button rendered on the game canvas. */
export function PivotButton({ onClick, ...props }: PivotNativeButtonProps) {
  return useRegisterWidget('button', props, { onClick });
}

// ── PivotUIText ────────────────────────────────────────────────────────────────

export interface PivotNativeUITextProps {
  x: number;
  y: number;
  text: string;
  color?: string;
  font?: string;
  visible?: boolean;
}

/** A HUD/menu text block managed by the UI layer (drawn above shapes). */
export function PivotUIText(props: PivotNativeUITextProps) {
  return useRegisterWidget('text', { ...props });
}

// ── PivotProgressBar ───────────────────────────────────────────────────────────

export interface PivotNativeProgressBarProps {
  x: number;
  y: number;
  /** Fill amount 0–1. */
  value: number;
  width?: number;
  height?: number;
  fill?: string;
  background?: string;
  label?: string;
  visible?: boolean;
}

/** A health/loading bar rendered on the game canvas. */
export function PivotProgressBar(props: PivotNativeProgressBarProps) {
  return useRegisterWidget('progress', { ...props });
}

// ── PivotCheckbox ──────────────────────────────────────────────────────────────

export interface PivotNativeCheckboxProps {
  x: number;
  y: number;
  label: string;
  checked: boolean;
  visible?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

/** A labelled toggle rendered on the game canvas. */
export function PivotCheckbox({ onChange, ...props }: PivotNativeCheckboxProps) {
  return useRegisterWidget('checkbox', props, {
    onChange: onChange as UIWidgetHandlers['onChange'],
  });
}

// ── PivotSlider ────────────────────────────────────────────────────────────────

export interface PivotNativeSliderProps {
  x: number;
  y: number;
  value: number;
  width?: number;
  min?: number;
  max?: number;
  step?: number;
  visible?: boolean;
  disabled?: boolean;
  onChange?: (value: number) => void;
}

/** A draggable horizontal slider rendered on the game canvas. */
export function PivotSlider({ onChange, ...props }: PivotNativeSliderProps) {
  return useRegisterWidget('slider', props, {
    onChange: onChange as UIWidgetHandlers['onChange'],
  });
}

// ── PivotJoystick ──────────────────────────────────────────────────────────────

export interface PivotNativeJoystickProps {
  /** Centre X of the joystick base. */
  x: number;
  /** Centre Y of the joystick base. */
  y: number;
  radius?: number;
  visible?: boolean;
  /**
   * Normalized deflection { x: -1..1, y: -1..1 } while the stick is held;
   * fires { x: 0, y: 0 } once on release. Store it in a ref and read it in
   * your game loop.
   */
  onMove?: (value: { x: number; y: number }) => void;
}

/** A virtual on-screen joystick — the touch counterpart to a gamepad stick. */
export function PivotJoystick({ onMove, ...props }: PivotNativeJoystickProps) {
  return useRegisterWidget('joystick', props, { onMove });
}
