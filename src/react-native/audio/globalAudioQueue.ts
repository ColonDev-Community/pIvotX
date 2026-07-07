// ─── Global audio command queue ───────────────────────────────────────────────
//
// Lets useNativeSound work OUTSIDE <PivotNativeCanvas> (e.g. in the component
// that renders the canvas): commands enqueue here and every mounted canvas
// drains the queue on its next flush. With multiple canvases, whichever
// flushes first plays the sound — fine for the typical one-canvas game.
//

import type { AudioCommand } from '../bridge/types';

let queue: AudioCommand[] = [];

export function enqueueGlobalAudio(cmd: AudioCommand): void {
  queue.push(cmd);
}

export function drainGlobalAudio(): AudioCommand[] {
  if (queue.length === 0) return queue;
  const drained = queue;
  queue = [];
  return drained;
}
