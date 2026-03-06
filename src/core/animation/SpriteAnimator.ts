import { Sprite } from '../shapes/Sprite';

// ─── AnimationClip ────────────────────────────────────────────────────────────

/**
 * Defines a named sequence of sprite frames to play back.
 *
 * @example
 * const idle: AnimationClip = {
 *   frames: [0, 1, 2, 3],
 *   fps:    6,
 *   loop:   true,
 * };
 */
export interface AnimationClip {
  /** Ordered list of frame indices from the SpriteSheet. */
  frames: number[];
  /** Playback speed in frames per second. */
  fps:    number;
  /** Whether the animation loops or stops on the last frame. */
  loop:   boolean;
}

// ─── SpriteAnimator ───────────────────────────────────────────────────────────

/**
 * Controls which frame a Sprite displays over time.
 * Register named clips, then call `play()` to switch and `update(dt)` every frame.
 *
 * @example
 * const animator = new SpriteAnimator(heroSprite);
 * animator
 *   .addClip('idle', { frames: [0, 1, 2, 3],     fps: 6,  loop: true })
 *   .addClip('run',  { frames: [4, 5, 6, 7, 8],  fps: 10, loop: true })
 *   .addClip('jump', { frames: [9, 10],           fps: 4,  loop: false });
 *
 * animator.play('idle');
 *
 * canvas.startLoop((dt) => {
 *   canvas.clear();
 *   animator.update(dt);   // advances the frame
 *   canvas.add(heroSprite);
 * });
 */
export class SpriteAnimator {
  private _clips:    Map<string, AnimationClip> = new Map();
  private _current:  string  = '';
  private _elapsed:  number  = 0;
  private _index:    number  = 0;
  private _finished: boolean = false;
  private _playing:  boolean = false;

  constructor(private _sprite: Sprite) {}

  // ── Clip management ──────────────────────────────────────────────────────

  /**
   * Register a named animation clip. Chainable.
   *
   * @param name  Unique name for this animation (e.g. 'idle', 'run', 'attack').
   * @param clip  The clip definition.
   */
  addClip(name: string, clip: AnimationClip): this {
    this._clips.set(name, clip);
    return this;
  }

  /** Remove a previously registered clip by name. */
  removeClip(name: string): this {
    this._clips.delete(name);
    if (this._current === name) {
      this._playing  = false;
      this._finished = true;
    }
    return this;
  }

  /** Check if a clip with the given name exists. */
  hasClip(name: string): boolean {
    return this._clips.has(name);
  }

  // ── Playback control ─────────────────────────────────────────────────────

  /**
   * Switch to a named animation. Resets playback only if switching to a
   * different clip (or if the current clip has finished).
   */
  play(name: string): void {
    if (this._current === name && this._playing && !this._finished) return;

    const clip = this._clips.get(name);
    if (!clip) {
      console.warn(`pIvotX SpriteAnimator: No clip named "${name}"`);
      return;
    }

    this._current  = name;
    this._elapsed  = 0;
    this._index    = 0;
    this._finished = false;
    this._playing  = true;

    // Set the first frame immediately
    this._sprite.frame = clip.frames[0];
  }

  /** Stop playback. The sprite keeps showing the current frame. */
  stop(): void {
    this._playing = false;
  }

  // ── State getters ─────────────────────────────────────────────────────────

  /** Name of the currently active clip, or empty string if none. */
  get currentClip(): string  { return this._current;  }

  /** True if a non-looping clip has reached its last frame. */
  get isFinished():  boolean { return this._finished;  }

  /** True if the animator is actively playing. */
  get isPlaying():   boolean { return this._playing;   }

  /** The current frame index within the active clip's frames array. */
  get currentIndex(): number { return this._index;     }

  // ── Per-frame update ──────────────────────────────────────────────────────

  /**
   * Advance the animation timer. Call this once per frame inside your game loop.
   *
   * @param dt  Seconds since last frame (from startLoop or useGameLoop).
   */
  update(dt: number): void {
    if (!this._playing || this._finished) return;

    const clip = this._clips.get(this._current);
    if (!clip || clip.frames.length === 0) return;

    this._elapsed += dt;
    const frameDuration = 1 / clip.fps;

    while (this._elapsed >= frameDuration) {
      this._elapsed -= frameDuration;
      this._index++;

      if (this._index >= clip.frames.length) {
        if (clip.loop) {
          this._index = 0;
        } else {
          this._index    = clip.frames.length - 1;
          this._finished = true;
          break;
        }
      }
    }

    this._sprite.frame = clip.frames[this._index];
  }
}
