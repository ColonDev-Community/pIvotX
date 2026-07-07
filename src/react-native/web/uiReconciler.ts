// ─── Web UI reconciler ────────────────────────────────────────────────────────
//
// Reconciles UIWidgetDescriptors (from the RN UI components) into a real
// UIManager on the Expo Web canvas. The native (WebView) equivalent lives in
// bridge/renderer.ts as injected JavaScript.
//

import { UIManager } from '../../core/ui/UIManager';
import { UIElement } from '../../core/ui/UIElement';
import { UIButton } from '../../core/ui/UIButton';
import { UIText } from '../../core/ui/UIText';
import { UIProgressBar } from '../../core/ui/UIProgressBar';
import { UICheckbox } from '../../core/ui/UICheckbox';
import { UISlider } from '../../core/ui/UISlider';
import { UIJoystick } from '../../core/ui/UIJoystick';
import type { UIWidgetDescriptor, UIWidgetHandlers } from '../bridge/types';

export interface UIReconcilerState {
  widgets: Map<string, UIElement>;
  /** Joystick activity from the previous flush, to emit a final {0,0}. */
  joystickWasActive: Map<string, boolean>;
}

export function createUIReconcilerState(): UIReconcilerState {
  return { widgets: new Map(), joystickWasActive: new Map() };
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' ? v : fallback;
}
function str(v: unknown, fallback: string): string {
  return typeof v === 'string' ? v : fallback;
}

function createWidget(desc: UIWidgetDescriptor): UIElement | null {
  const p = desc.props;
  const pos = { x: num(p.x, 0), y: num(p.y, 0) };
  switch (desc.kind) {
    case 'button': {
      const style: Record<string, unknown> = {};
      if (p.background) style.background = p.background;
      if (p.color) style.color = p.color;
      return new UIButton(str(p.text, ''), pos, num(p.width, 140), num(p.height, 44), style);
    }
    case 'text':
      return new UIText(str(p.text, ''), pos, {
        color: p.color as string | undefined,
        font: p.font as string | undefined,
      });
    case 'progress':
      return new UIProgressBar(pos, num(p.width, 200), num(p.height, 20), {
        fill: p.fill as string | undefined,
        background: p.background as string | undefined,
        label: p.label as string | undefined,
        value: num(p.value, 1),
      });
    case 'checkbox':
      return new UICheckbox(str(p.label, ''), pos, { checked: p.checked === true });
    case 'slider':
      return new UISlider(pos, num(p.width, 180), {
        value: num(p.value, 0),
        min: p.min as number | undefined,
        max: p.max as number | undefined,
        step: p.step as number | undefined,
      });
    case 'joystick':
      return new UIJoystick(pos, num(p.radius, 60));
    default:
      return null;
  }
}

function updateWidget(widget: UIElement, desc: UIWidgetDescriptor): void {
  const p = desc.props;
  if (widget instanceof UIJoystick) {
    const cx = num(p.x, widget.center.x);
    const cy = num(p.y, widget.center.y);
    if (widget.center.x !== cx || widget.center.y !== cy) widget.center = { x: cx, y: cy };
    widget.radius = num(p.radius, widget.radius);
  } else {
    widget.position.x = num(p.x, widget.position.x);
    widget.position.y = num(p.y, widget.position.y);
  }

  if (widget instanceof UIButton) {
    widget.text = str(p.text, widget.text);
    widget.width = num(p.width, widget.width);
    widget.height = num(p.height, widget.height);
    if (typeof p.background === 'string') widget.style.background = p.background;
    if (typeof p.color === 'string') widget.style.color = p.color;
  } else if (widget instanceof UIText) {
    widget.text = str(p.text, widget.text);
    if (typeof p.color === 'string') widget.color = p.color;
    if (typeof p.font === 'string') widget.font = p.font;
  } else if (widget instanceof UIProgressBar) {
    widget.width = num(p.width, widget.width);
    widget.value = num(p.value, widget.value);
    if (typeof p.fill === 'string') widget.fill = p.fill;
    if (typeof p.label === 'string') widget.label = p.label;
  } else if (widget instanceof UICheckbox) {
    widget.label = str(p.label, widget.label);
    widget.checked = p.checked === true;
  } else if (widget instanceof UISlider) {
    widget.width = num(p.width, widget.width);
    if (typeof p.min === 'number') widget.min = p.min;
    if (typeof p.max === 'number') widget.max = p.max;
    if (typeof p.step === 'number') widget.step = p.step;
    if (!widget.pressed) widget.value = num(p.value, widget.value); // don't fight a drag
  }

  widget.visible = p.visible !== false;
  if (desc.kind !== 'text' && desc.kind !== 'progress') {
    widget.enabled = p.disabled !== true;
  }
}

/**
 * Reconcile this frame's descriptors into the UIManager: create new widgets,
 * update existing ones, remove those no longer registered, and (re)bind
 * handlers. Also emits joystick move events.
 */
export function reconcileUI(
  ui: UIManager,
  state: UIReconcilerState,
  descs: UIWidgetDescriptor[],
  handlerFor: (id: string) => UIWidgetHandlers | undefined,
): void {
  const seen = new Set<string>();

  for (const desc of descs) {
    seen.add(desc.id);
    let widget = state.widgets.get(desc.id);
    const handlers = handlerFor(desc.id);

    if (!widget) {
      widget = createWidget(desc) ?? undefined;
      if (!widget) continue;
      state.widgets.set(desc.id, widget);
      ui.add(widget);
    }
    updateWidget(widget, desc);

    // (Re)bind callbacks — closures look handlers up by id so they stay
    // current even though handler identities change every render
    if (widget instanceof UIButton && handlers) {
      widget.onClick = () => handlerFor(desc.id)?.onClick?.();
    } else if (widget instanceof UICheckbox) {
      widget.onChange = (checked) => handlerFor(desc.id)?.onChange?.(checked);
    } else if (widget instanceof UISlider) {
      widget.onChange = (value) => handlerFor(desc.id)?.onChange?.(value);
    }

    // Joystick: emit move events while active, and one {0,0} on release
    if (widget instanceof UIJoystick) {
      const wasActive = state.joystickWasActive.get(desc.id) === true;
      if (widget.active) {
        handlerFor(desc.id)?.onMove?.({ x: widget.value.x, y: widget.value.y });
      } else if (wasActive) {
        handlerFor(desc.id)?.onMove?.({ x: 0, y: 0 });
      }
      state.joystickWasActive.set(desc.id, widget.active);
    }
  }

  // Remove widgets whose components unmounted
  for (const [id, widget] of state.widgets) {
    if (!seen.has(id)) {
      ui.remove(widget);
      state.widgets.delete(id);
      state.joystickWasActive.delete(id);
    }
  }
}
