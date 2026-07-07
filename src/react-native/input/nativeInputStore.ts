// ─── Native input store ───────────────────────────────────────────────────────
//
// Module-level mirror of hardware input state forwarded from the WebView
// (keyEvent / gamepadState bridge messages). PivotNativeCanvas writes to it;
// NativeInput reads from it. Web never uses this — it queries the DOM APIs
// directly through the core Keyboard/GamepadInput.
//

export interface NativeGamepadState {
  connected: boolean;
  /** Indices of currently pressed buttons (standard mapping). */
  buttons: Set<number>;
  /** First four axes: [lx, ly, rx, ry]. */
  axes: number[];
}

export const nativeInputStore = {
  keysDown: new Set<string>(),
  gamepad: {
    connected: false,
    buttons: new Set<number>(),
    axes: [0, 0, 0, 0],
  } as NativeGamepadState,

  applyKeyEvent(action: 'down' | 'up', code: string): void {
    if (action === 'down') nativeInputStore.keysDown.add(code);
    else nativeInputStore.keysDown.delete(code);
  },

  applyGamepadState(connected: boolean, buttons: number[], axes: number[]): void {
    const pad = nativeInputStore.gamepad;
    pad.connected = connected;
    pad.buttons = new Set(buttons);
    pad.axes = [axes[0] ?? 0, axes[1] ?? 0, axes[2] ?? 0, axes[3] ?? 0];
    if (!connected) {
      pad.buttons.clear();
      pad.axes = [0, 0, 0, 0];
    }
  },
};
