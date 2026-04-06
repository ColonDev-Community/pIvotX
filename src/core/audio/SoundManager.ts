// ─── Sound Manager ──────────────────────────────────────────────────────────────
//
// Global audio manager for loading, caching, and controlling named sounds.
// All managed sounds route through a master GainNode so master-volume and
// mute/unmute affect everything at once.
//
// Follows the same static-method pattern as AssetLoader.
//

import { Sound } from './Sound';

export class SoundManager {
  // ── Internal state ───────────────────────────────────────────────────────

  private static _sounds = new Map<string, Sound>();
  private static _masterGain: GainNode | null = null;
  private static _muted = false;
  private static _preMuteVolume = 1;

  /** Lazily create the master GainNode connected to the AudioContext destination. */
  private static _getMasterGain(): GainNode {
    if (!SoundManager._masterGain) {
      const ctx = Sound.getAudioContext();
      SoundManager._masterGain = ctx.createGain();
      SoundManager._masterGain.connect(ctx.destination);
    }
    return SoundManager._masterGain;
  }

  // ── Loading ──────────────────────────────────────────────────────────────

  /**
   * Load a single sound from a URL, store it under `name`.
   *
   * @example
   * await SoundManager.loadSound('jump', '/sfx/jump.mp3');
   */
  static async loadSound(name: string, src: string): Promise<Sound> {
    const ctx = Sound.getAudioContext();
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const sound = new Sound(audioBuffer, ctx, SoundManager._getMasterGain());
    SoundManager._sounds.set(name, sound);
    return sound;
  }

  /**
   * Load multiple sounds in parallel.
   *
   * @example
   * const sounds = await SoundManager.loadSounds({
   *   jump:  '/sfx/jump.mp3',
   *   coin:  '/sfx/coin.wav',
   *   theme: '/music/theme.ogg',
   * });
   * // sounds.jump, sounds.coin, sounds.theme — all Sound instances
   */
  static async loadSounds<T extends Record<string, string>>(
    manifest: T,
  ): Promise<{ [K in keyof T]: Sound }> {
    const keys = Object.keys(manifest) as (keyof T)[];
    const promises = keys.map((key) =>
      SoundManager.loadSound(key as string, manifest[key] as string),
    );
    const loaded = await Promise.all(promises);
    const result = {} as { [K in keyof T]: Sound };
    keys.forEach((key, i) => {
      result[key] = loaded[i];
    });
    return result;
  }

  // ── Retrieval ────────────────────────────────────────────────────────────

  /** Get a previously loaded Sound by name, or undefined. */
  static getSound(name: string): Sound | undefined {
    return SoundManager._sounds.get(name);
  }

  // ── Playback ─────────────────────────────────────────────────────────────

  /**
   * Play a previously loaded sound by name.
   * Returns the Sound instance, or undefined if not found.
   *
   * @example
   * SoundManager.play('jump');
   * SoundManager.play('theme', { loop: true, volume: 0.6 });
   */
  static play(
    name: string,
    options?: { loop?: boolean; volume?: number },
  ): Sound | undefined {
    const sound = SoundManager._sounds.get(name);
    if (!sound) {
      console.warn(`pIvotX: Sound "${name}" not loaded`);
      return undefined;
    }
    if (options?.loop !== undefined) sound.loop = options.loop;
    if (options?.volume !== undefined) sound.volume = options.volume;
    sound.play();
    return sound;
  }

  /** Stop a named sound. */
  static stop(name: string): void {
    SoundManager._sounds.get(name)?.stop();
  }

  /** Pause a named sound. */
  static pause(name: string): void {
    SoundManager._sounds.get(name)?.pause();
  }

  /** Resume a named sound. */
  static resume(name: string): void {
    SoundManager._sounds.get(name)?.resume();
  }

  /** Stop all sounds. */
  static stopAll(): void {
    SoundManager._sounds.forEach((s) => s.stop());
  }

  // ── Master volume ────────────────────────────────────────────────────────

  /** Current master volume (0 – 1). */
  static get masterVolume(): number {
    return SoundManager._getMasterGain().gain.value;
  }

  /** Set master volume (0 – 1). Affects all managed sounds immediately. */
  static set masterVolume(value: number) {
    SoundManager._getMasterGain().gain.value = Math.max(0, Math.min(1, value));
  }

  /** Mute all managed sounds (preserves previous master volume for unmute). */
  static mute(): void {
    if (SoundManager._muted) return;
    SoundManager._preMuteVolume = SoundManager.masterVolume;
    SoundManager.masterVolume = 0;
    SoundManager._muted = true;
  }

  /** Restore master volume to the level before mute(). */
  static unmute(): void {
    if (!SoundManager._muted) return;
    SoundManager.masterVolume = SoundManager._preMuteVolume;
    SoundManager._muted = false;
  }

  /** Whether master volume is currently muted. */
  static get muted(): boolean {
    return SoundManager._muted;
  }
}
