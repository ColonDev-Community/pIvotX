// ─── Timers ───────────────────────────────────────────────────────────────────
//
// Game-loop-driven timers. Unlike setTimeout, these advance with your game's
// dt — they pause when the game pauses and stay deterministic.
//
//   const timers = new Timers();
//   timers.after(2, () => spawnBoss());
//   timers.every(0.5, () => spawnEnemy());
//
//   canvas.startLoop((dt) => {
//     timers.update(dt);
//     ...
//   });
//

interface TimerEntry {
  remaining: number;
  interval: number;   // 0 = one-shot
  fn: () => void;
  cancelled: boolean;
}

/** Handle returned by after()/every() — call cancel() to stop the timer. */
export interface TimerHandle {
  cancel(): void;
  /** True once a one-shot has fired or the timer was cancelled. */
  readonly done: boolean;
}

export class Timers {
  private _entries: TimerEntry[] = [];

  /** Run `fn` once after `seconds` of game time. */
  after(seconds: number, fn: () => void): TimerHandle {
    return this._addEntry(seconds, 0, fn);
  }

  /** Run `fn` repeatedly every `seconds` of game time. */
  every(seconds: number, fn: () => void): TimerHandle {
    return this._addEntry(seconds, Math.max(0.0001, seconds), fn);
  }

  private _addEntry(delay: number, interval: number, fn: () => void): TimerHandle {
    const entry: TimerEntry = { remaining: Math.max(0, delay), interval, fn, cancelled: false };
    this._entries.push(entry);
    return {
      cancel() { entry.cancelled = true; },
      get done() { return entry.cancelled; },
    };
  }

  /** Cancel every pending timer. */
  clear(): void {
    for (const e of this._entries) e.cancelled = true;
    this._entries = [];
  }

  /** Number of active timers. */
  get count(): number { return this._entries.length; }

  /** Advance all timers. Call once per frame with the loop's dt (seconds). */
  update(dt: number): void {
    // Iterate over a snapshot so callbacks can safely add new timers
    const entries = this._entries;
    for (const e of entries) {
      if (e.cancelled) continue;
      e.remaining -= dt;
      while (e.remaining <= 0 && !e.cancelled) {
        e.fn();
        if (e.interval > 0) {
          e.remaining += e.interval;
        } else {
          e.cancelled = true;
        }
      }
    }
    this._entries = this._entries.filter((e) => !e.cancelled);
  }
}
