// ─── useSound Hook ──────────────────────────────────────────────────────────────
//
// React convenience hook wrapping SoundManager for declarative sound control.
//

import { useMemo } from 'react';
import { SoundManager } from '../../core/audio/SoundManager';
import type { Sound } from '../../core/audio/Sound';

export interface UseSoundControls {
  /** Play a previously loaded sound by name. */
  play(name: string, options?: { loop?: boolean; volume?: number }): Sound | undefined;
  /** Stop a named sound. */
  stop(name: string): void;
  /** Pause a named sound. */
  pause(name: string): void;
  /** Resume a paused sound. */
  resume(name: string): void;
  /** Stop all sounds. */
  stopAll(): void;
  /** Set master volume (0 – 1). */
  setMasterVolume(volume: number): void;
  /** Mute all sounds. */
  mute(): void;
  /** Unmute all sounds. */
  unmute(): void;
  /** Get a loaded Sound instance by name. */
  getSound(name: string): Sound | undefined;
}

/**
 * React hook providing convenient access to SoundManager.
 *
 * Load sounds outside the hook (e.g. in an effect or before rendering),
 * then use the returned controls inside event handlers or game-loop callbacks.
 *
 * @example
 * const sound = useSound();
 *
 * useEffect(() => {
 *   SoundManager.loadSounds({ jump: '/sfx/jump.mp3', bgm: '/music/theme.mp3' });
 * }, []);
 *
 * useGameLoop((dt) => {
 *   if (jumped) sound.play('jump');
 * });
 */
export function useSound(): UseSoundControls {
  return useMemo<UseSoundControls>(() => ({
    play:             (name, opts) => SoundManager.play(name, opts),
    stop:             (name) => SoundManager.stop(name),
    pause:            (name) => SoundManager.pause(name),
    resume:           (name) => SoundManager.resume(name),
    stopAll:          () => SoundManager.stopAll(),
    setMasterVolume:  (v) => { SoundManager.masterVolume = v; },
    mute:             () => SoundManager.mute(),
    unmute:           () => SoundManager.unmute(),
    getSound:         (name) => SoundManager.getSound(name),
  }), []);
}
