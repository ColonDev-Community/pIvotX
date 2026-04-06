// ─── useNativeSound Hook ────────────────────────────────────────────────────────
//
// React Native hook for controlling audio from JSX mode.
// Must be called inside <PivotNativeCanvas>.
//
// On web (Expo Web): audio commands are executed directly via SoundManager.
// On native (WebView): audio commands are serialised and sent to the WebView
// where they're handled by __pivotAudio / UMD SoundManager.
//

import { useMemo } from 'react';
import { useNativeDrawContext } from '../context/NativeDrawContext';

export interface UseNativeSoundControls {
  /** Queue a sound to be loaded inside the canvas. Call early (e.g. first render). */
  loadSound(name: string, src: string): void;
  /** Play a previously loaded sound by name. */
  play(name: string, options?: { loop?: boolean; volume?: number }): void;
  /** Stop a named sound. */
  stop(name: string): void;
  /** Pause a named sound. */
  pause(name: string): void;
  /** Resume a paused sound. */
  resume(name: string): void;
  /** Stop all sounds. */
  stopAll(): void;
  /** Set volume on a specific sound (0 – 1). */
  setVolume(name: string, volume: number): void;
  /** Set master volume (0 – 1). */
  setMasterVolume(volume: number): void;
  /** Mute all sounds. */
  mute(): void;
  /** Unmute all sounds. */
  unmute(): void;
}

/**
 * React Native hook for triggering audio commands inside <PivotNativeCanvas>.
 * Platform-agnostic: the canvas root decides whether to run commands directly
 * (web) or forward them to the WebView (native).
 *
 * @example
 * function GameScreen() {
 *   const sound = useNativeSound();
 *
 *   // Load sounds on first render
 *   sound.loadSound('jump', '/sfx/jump.mp3');
 *   sound.loadSound('bgm', '/music/theme.mp3');
 *
 *   return (
 *     <PivotNativeCanvas width={400} height={300}>
 *       ...shape components...
 *     </PivotNativeCanvas>
 *   );
 * }
 */
export function useNativeSound(): UseNativeSoundControls {
  const { registerAudioCommand } = useNativeDrawContext();

  return useMemo<UseNativeSoundControls>(() => ({
    loadSound:      (name, src) => registerAudioCommand({ type: 'loadSound', name, src }),
    play:           (name, opts) => registerAudioCommand({ type: 'playSound', name, loop: opts?.loop, volume: opts?.volume }),
    stop:           (name) => registerAudioCommand({ type: 'stopSound', name }),
    pause:          (name) => registerAudioCommand({ type: 'pauseSound', name }),
    resume:         (name) => registerAudioCommand({ type: 'resumeSound', name }),
    stopAll:        () => registerAudioCommand({ type: 'stopAllSounds' }),
    setVolume:      (name, volume) => registerAudioCommand({ type: 'setSoundVolume', name, volume }),
    setMasterVolume:(volume) => registerAudioCommand({ type: 'setMasterVolume', volume }),
    mute:           () => registerAudioCommand({ type: 'mute' }),
    unmute:         () => registerAudioCommand({ type: 'unmute' }),
  }), [registerAudioCommand]);
}
