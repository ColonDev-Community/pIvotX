// ─── Sound ──────────────────────────────────────────────────────────────────────
//
// Wraps the Web Audio API for playing individual sound effects and music.
// Each Sound owns a single playback slot — call play() to restart, pause()/resume()
// to suspend, and stop() to silence.
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
  private _playing = false;
  private _loop = false;
  private _startTime = 0;
  private _pauseOffset = 0;

  // ── Getters / setters ────────────────────────────────────────────────────

  /** Whether a source is currently playing. */
  get playing(): boolean { return this._playing; }

  /** Whether playback should repeat. Can be changed while playing. */
  get loop(): boolean { return this._loop; }
  set loop(value: boolean) {
    this._loop = value;
    if (this._source) this._source.loop = value;
  }

  /** Gain from 0 (silent) to 1 (full). */
  get volume(): number { return this._gainNode.gain.value; }
  set volume(value: number) {
    this._gainNode.gain.value = Math.max(0, Math.min(1, value));
  }

  /** The decoded AudioBuffer, if loaded. */
  get buffer(): AudioBuffer | null { return this._buffer; }

  /** Duration in seconds (0 if not yet loaded). */
  get duration(): number { return this._buffer ? this._buffer.duration : 0; }

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
  constructor(
    buffer?: AudioBuffer,
    ctx?: AudioContext,
    destination?: AudioNode,
  ) {
    this._ctx = ctx ?? Sound.getAudioContext();
    this._gainNode = this._ctx.createGain();
    this._gainNode.connect(destination ?? this._ctx.destination);
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
    const ctx = Sound.getAudioContext();
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    return new Sound(audioBuffer);
  }

  // ── Playback ─────────────────────────────────────────────────────────────

  /** Start (or restart) playback from the beginning. */
  play(): void {
    if (!this._buffer) return;

    // Resume suspended context (mobile autoplay policy)
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }

    this.stop();

    const source = this._ctx.createBufferSource();
    source.buffer = this._buffer;
    source.loop = this._loop;
    source.connect(this._gainNode);

    source.onended = () => {
      if (this._source === source) {
        this._playing = false;
        this._source = null;
      }
    };

    source.start(0, this._pauseOffset);
    this._startTime = this._ctx.currentTime - this._pauseOffset;
    this._pauseOffset = 0;
    this._source = source;
    this._playing = true;
  }

  /** Pause playback, keeping the current position for resume(). */
  pause(): void {
    if (!this._playing || !this._source) return;
    this._pauseOffset = this._ctx.currentTime - this._startTime;
    this._source.onended = null;
    try { this._source.stop(); } catch { /* already stopped */ }
    this._source = null;
    this._playing = false;
  }

  /** Resume from the position saved by pause(). */
  resume(): void {
    if (this._playing || this._pauseOffset === 0) return;
    this.play(); // play() uses _pauseOffset internally
  }

  /** Stop playback and reset position to the beginning. */
  stop(): void {
    if (this._source) {
      this._source.onended = null;
      try { this._source.stop(); } catch { /* already stopped */ }
      this._source = null;
    }
    this._playing = false;
    this._pauseOffset = 0;
  }
}
