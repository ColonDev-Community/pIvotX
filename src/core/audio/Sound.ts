// ─── Sound ──────────────────────────────────────────────────────────────────────
//
// Wraps the Web Audio API for playing individual sound effects and music.
// Each Sound owns a single playback slot — call play() to restart, pause()/resume()
// to suspend, and stop() to silence. Use playOneShot() for overlapping SFX.
//
// Use Sound.load(url) for standalone sounds, or SoundManager for named collections.
//

export class Sound {
  // ── Shared AudioContext ──────────────────────────────────────────────────

  private static _sharedCtx: AudioContext | null = null;

  /** Get or create the shared AudioContext (lazily initialised). */
  static getAudioContext(): AudioContext {
    if (!Sound._sharedCtx) {
      Sound._sharedCtx = new AudioContext();
    }
    return Sound._sharedCtx;
  }

  // ── Instance state ───────────────────────────────────────────────────────

  private _ctx: AudioContext;
  private _buffer: AudioBuffer | null = null;
  private _source: AudioBufferSourceNode | null = null;
  private _gainNode: GainNode;
  private _panNode: StereoPannerNode | null = null;
  private _playing = false;
  private _paused = false;
  private _loop = false;
  private _rate = 1;
  private _startTime = 0;
  private _pauseOffset = 0;
  private _fadeTimer: ReturnType<typeof setTimeout> | null = null;
  private _sprites = new Map<string, [number, number]>();

  // ── Getters / setters ────────────────────────────────────────────────────

  /** Whether a source is currently playing. */
  get playing(): boolean { return this._playing; }

  /** Whether playback is paused (resume() will continue from the saved position). */
  get paused(): boolean { return this._paused; }

  /** Whether playback should repeat. Can be changed while playing. */
  get loop(): boolean { return this._loop; }
  set loop(value: boolean) {
    this._loop = value;
    if (this._source) this._source.loop = value;
  }

  /** Gain from 0 (silent) to 1 (full). */
  get volume(): number { return this._gainNode.gain.value; }
  set volume(value: number) {
    this._cancelFade();
    this._gainNode.gain.cancelScheduledValues(this._ctx.currentTime);
    this._gainNode.gain.value = Math.max(0, Math.min(1, value));
  }

  /**
   * Playback speed / pitch multiplier (1 = normal, 2 = double speed,
   * 0.5 = half speed). Can be changed while playing.
   */
  get playbackRate(): number { return this._rate; }
  set playbackRate(value: number) {
    const rate = Math.max(0.01, value);
    if (this._playing && this._source) {
      // Re-anchor the start time so currentTime stays continuous across the change
      const pos = (this._ctx.currentTime - this._startTime) * this._rate;
      this._startTime = this._ctx.currentTime - pos / rate;
      this._source.playbackRate.value = rate;
    }
    this._rate = rate;
  }

  /**
   * Stereo pan from -1 (full left) to 1 (full right). 0 = centre.
   * Great for cheap positional audio: `sfx.pan = (x / canvasWidth) * 2 - 1`.
   */
  get pan(): number { return this._panNode ? this._panNode.pan.value : 0; }
  set pan(value: number) {
    if (!this._panNode) {
      // Lazily splice a StereoPannerNode between the gain node and its output
      if (typeof this._ctx.createStereoPanner !== 'function') return; // unsupported
      this._panNode = this._ctx.createStereoPanner();
      this._gainNode.disconnect();
      this._gainNode.connect(this._panNode);
      this._panNode.connect(this._destination);
    }
    this._panNode.pan.value = Math.max(-1, Math.min(1, value));
  }

  /** The decoded AudioBuffer, if loaded. */
  get buffer(): AudioBuffer | null { return this._buffer; }

  /** Duration in seconds (0 if not yet loaded). */
  get duration(): number { return this._buffer ? this._buffer.duration : 0; }

  /** Current playback position in seconds (wraps for looping sounds). */
  get currentTime(): number {
    if (!this._buffer) return 0;
    if (this._paused) return this._pauseOffset;
    if (!this._playing) return 0;
    const elapsed = (this._ctx.currentTime - this._startTime) * this._rate;
    return this._loop ? elapsed % this._buffer.duration : Math.min(elapsed, this._buffer.duration);
  }

  // ── Constructor ──────────────────────────────────────────────────────────

  /**
   * Create a Sound instance.
   *
   * @param buffer   Optional pre-decoded AudioBuffer.
   * @param ctx      AudioContext to use (defaults to the shared context).
   * @param destination  Output AudioNode (defaults to ctx.destination).
   *                     SoundManager passes its master GainNode here so
   *                     master-volume control works automatically.
   */
  private _destination: AudioNode;

  constructor(
    buffer?: AudioBuffer,
    ctx?: AudioContext,
    destination?: AudioNode,
  ) {
    this._ctx = ctx ?? Sound.getAudioContext();
    this._destination = destination ?? this._ctx.destination;
    this._gainNode = this._ctx.createGain();
    this._gainNode.connect(this._destination);
    if (buffer) this._buffer = buffer;
  }

  // ── Static loader ────────────────────────────────────────────────────────

  /**
   * Load a sound from a URL and return a ready-to-play Sound instance.
   *
   * @example
   * const jumpSfx = await Sound.load('/sfx/jump.mp3');
   * jumpSfx.play();
   */
  static async load(src: string): Promise<Sound> {
    const audioBuffer = await Sound.loadBuffer(src);
    return new Sound(audioBuffer);
  }

  /** Fetch and decode an AudioBuffer (shared by Sound.load and SoundManager). */
  static async loadBuffer(src: string): Promise<AudioBuffer> {
    const ctx = Sound.getAudioContext();
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`pIvotX: Failed to load sound "${src}" (HTTP ${response.status})`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return ctx.decodeAudioData(arrayBuffer);
  }

  // ── Playback ─────────────────────────────────────────────────────────────

  /** Start (or restart) playback from the beginning. */
  play(): void {
    if (!this._buffer) return;

    // Resume suspended context (mobile autoplay policy)
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }

    const offset = this._paused ? this._pauseOffset : 0;
    this.stop();

    const source = this._ctx.createBufferSource();
    source.buffer = this._buffer;
    source.loop = this._loop;
    source.playbackRate.value = this._rate;
    source.connect(this._gainNode);

    source.onended = () => {
      if (this._source === source) {
        this._playing = false;
        this._source = null;
      }
    };

    source.start(0, offset);
    this._startTime = this._ctx.currentTime - offset / this._rate;
    this._source = source;
    this._playing = true;
    this._paused = false;
  }

  /**
   * Play an overlapping, fire-and-forget copy of this sound.
   * Unlike play(), it does not stop the current playback — ideal for rapid
   * SFX (coins, shots) that would otherwise cut each other off.
   *
   * @param volume  Optional volume for this shot only (defaults to the
   *                sound's current volume).
   */
  playOneShot(volume?: number): void {
    if (!this._buffer) return;
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }

    const source = this._ctx.createBufferSource();
    source.buffer = this._buffer;
    source.playbackRate.value = this._rate;

    if (volume !== undefined) {
      const gain = this._ctx.createGain();
      gain.gain.value = Math.max(0, Math.min(1, volume));
      source.connect(gain);
      // Route through the sound's gain node so master volume still applies
      gain.connect(this._gainNode);
      source.onended = () => gain.disconnect();
    } else {
      source.connect(this._gainNode);
    }
    source.start(0);
  }

  /**
   * Play a named segment of the buffer — audio sprites: pack many short SFX
   * into one file and play slices by offset.
   *
   * Fire-and-forget like playOneShot (overlapping, does not affect the main
   * playback slot).
   *
   * @param startSec     Offset into the buffer in seconds.
   * @param durationSec  Length of the segment in seconds.
   * @param volume       Optional volume for this segment only.
   *
   * @example
   * // sfx.mp3 layout: 0.0–0.4 jump, 0.4–0.9 coin, 0.9–1.5 hit
   * sfx.playSegment(0.4, 0.5);   // plays the coin sound
   */
  playSegment(startSec: number, durationSec: number, volume?: number): void {
    if (!this._buffer) return;
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }

    const source = this._ctx.createBufferSource();
    source.buffer = this._buffer;
    source.playbackRate.value = this._rate;

    if (volume !== undefined) {
      const gain = this._ctx.createGain();
      gain.gain.value = Math.max(0, Math.min(1, volume));
      source.connect(gain);
      gain.connect(this._gainNode);
      source.onended = () => gain.disconnect();
    } else {
      source.connect(this._gainNode);
    }
    source.start(0, Math.max(0, startSec), Math.max(0, durationSec));
  }

  /**
   * Define named audio sprites — slices of the buffer addressed by name.
   * Chainable. Play them with playSprite().
   *
   * @param map  Sprite name → [startSec, durationSec].
   *
   * @example
   * const sfx = await Sound.load('/sfx/all.mp3');
   * sfx.defineSprites({
   *   jump: [0.0, 0.4],
   *   coin: [0.4, 0.5],
   *   hit:  [0.9, 0.6],
   * });
   * sfx.playSprite('coin');
   */
  defineSprites(map: Record<string, [number, number]>): this {
    for (const [name, slice] of Object.entries(map)) {
      this._sprites.set(name, slice);
    }
    return this;
  }

  /** Play a sprite defined with defineSprites(). Overlapping, fire-and-forget. */
  playSprite(name: string, volume?: number): void {
    const slice = this._sprites.get(name);
    if (!slice) {
      console.warn(`pIvotX: No audio sprite named "${name}"`);
      return;
    }
    this.playSegment(slice[0], slice[1], volume);
  }

  /** Pause playback, keeping the current position for resume(). */
  pause(): void {
    if (!this._playing || !this._source) return;
    let offset = (this._ctx.currentTime - this._startTime) * this._rate;
    // A looped sound may have played past the buffer end — wrap the offset
    if (this._buffer && offset > this._buffer.duration) {
      offset = this._loop ? offset % this._buffer.duration : this._buffer.duration;
    }
    this._pauseOffset = offset;
    this._source.onended = null;
    try { this._source.stop(); } catch { /* already stopped */ }
    this._source = null;
    this._playing = false;
    this._paused = true;
  }

  /** Resume from the position saved by pause(). */
  resume(): void {
    if (this._playing || !this._paused) return;
    this.play(); // play() picks up _pauseOffset while _paused is set
  }

  /** Stop playback and reset position to the beginning. */
  stop(): void {
    this._cancelFade();
    if (this._source) {
      this._source.onended = null;
      try { this._source.stop(); } catch { /* already stopped */ }
      this._source = null;
    }
    this._playing = false;
    this._paused = false;
    this._pauseOffset = 0;
  }

  // ── Fading ───────────────────────────────────────────────────────────────

  /**
   * Smoothly ramp the volume to a target level.
   *
   * @param volume   Target volume (0 – 1).
   * @param seconds  Ramp duration in seconds.
   */
  fadeTo(volume: number, seconds: number): void {
    this._cancelFade();
    const target = Math.max(0, Math.min(1, volume));
    const gain = this._gainNode.gain;
    const now = this._ctx.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(target, now + Math.max(0.001, seconds));
  }

  /** Start playing from silence and fade in to `target` (default 1). */
  fadeIn(seconds: number, target: number = 1): void {
    this._gainNode.gain.value = 0;
    this.play();
    this.fadeTo(target, seconds);
  }

  /** Fade to silence over `seconds`, then stop playback. */
  fadeOut(seconds: number): void {
    if (!this._playing) return;
    this.fadeTo(0, seconds);
    this._fadeTimer = setTimeout(() => {
      this._fadeTimer = null;
      this.stop();
    }, seconds * 1000);
  }

  private _cancelFade(): void {
    if (this._fadeTimer !== null) {
      clearTimeout(this._fadeTimer);
      this._fadeTimer = null;
    }
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────

  /** Stop playback and release the buffer and audio nodes. */
  dispose(): void {
    this.stop();
    this._gainNode.disconnect();
    this._panNode?.disconnect();
    this._buffer = null;
  }
}
