// ─── useNativeSound Hook ────────────────────────────────────────────────────────
//
// React Native hook for controlling audio from JSX mode.
// Must be called inside <PivotNativeCanvas>.
//
// On web (Expo Web): audio commands are executed directly via SoundManager.
// On native (WebView): audio commands are serialised and sent to the WebView
// where they're handled by __pivotAudio / UMD SoundManager.
//

import { useContext, useMemo } from 'react';
import { NativeDrawContext } from '../context/NativeDrawContext';
import { enqueueGlobalAudio } from '../audio/globalAudioQueue';

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
  /** Play an overlapping fire-and-forget copy of a sound (rapid SFX). */
  playOneShot(name: string, volume?: number): void;
  /** Stop all sounds. */
  stopAll(): void;
  /** Pause every playing sound (e.g. pause menu). */
  pauseAll(): void;
  /** Resume every paused sound. */
  resumeAll(): void;
  /** Set volume on a specific sound (0 – 1). */
  setVolume(name: string, volume: number): void;
  /** Set playback speed/pitch on a specific sound (1 = normal). */
  setPlaybackRate(name: string, rate: number): void;
  /** Smoothly ramp a sound's volume to a target over `seconds`. */
  fadeTo(name: string, volume: number, seconds: number): void;
  /** Fade a sound to silence over `seconds`, then stop it. */
  fadeOut(name: string, seconds: number): void;
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
  // Works inside OR outside <PivotNativeCanvas>: inside, commands go to the
  // canvas's own queue; outside, to a global queue that any mounted canvas
  // drains on its next flush.
  const ctx = useContext(NativeDrawContext);
  const registerAudioCommand = ctx?.registerAudioCommand ?? enqueueGlobalAudio;

  return useMemo<UseNativeSoundControls>(() => ({
    loadSound:      (name, src) => registerAudioCommand({ type: 'loadSound', name, src }),
    play:           (name, opts) => registerAudioCommand({ type: 'playSound', name, loop: opts?.loop, volume: opts?.volume }),
    stop:           (name) => registerAudioCommand({ type: 'stopSound', name }),
    pause:          (name) => registerAudioCommand({ type: 'pauseSound', name }),
    resume:         (name) => registerAudioCommand({ type: 'resumeSound', name }),
    playOneShot:    (name, volume) => registerAudioCommand({ type: 'playOneShot', name, volume }),
    stopAll:        () => registerAudioCommand({ type: 'stopAllSounds' }),
    pauseAll:       () => registerAudioCommand({ type: 'pauseAllSounds' }),
    resumeAll:      () => registerAudioCommand({ type: 'resumeAllSounds' }),
    setVolume:      (name, volume) => registerAudioCommand({ type: 'setSoundVolume', name, volume }),
    setPlaybackRate:(name, rate) => registerAudioCommand({ type: 'setPlaybackRate', name, rate }),
    fadeTo:         (name, volume, seconds) => registerAudioCommand({ type: 'fadeSound', name, volume, seconds }),
    fadeOut:        (name, seconds) => registerAudioCommand({ type: 'fadeOutSound', name, seconds }),
    setMasterVolume:(volume) => registerAudioCommand({ type: 'setMasterVolume', volume }),
    mute:           () => registerAudioCommand({ type: 'mute' }),
    unmute:         () => registerAudioCommand({ type: 'unmute' }),
  }), [registerAudioCommand]);
}
