// Vec2 / Timers / Tween / SceneManager / InputMap-free logic tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  Vec2, Timers, TweenManager, Easing, SceneManager, Scene,
} from '../dist/pivotx.esm.js';

// ── Vec2 ──────────────────────────────────────────────────────────────────────

test('Vec2 basic operations', () => {
  assert.deepEqual(Vec2.add({ x: 1, y: 2 }, { x: 3, y: 4 }), { x: 4, y: 6 });
  assert.deepEqual(Vec2.sub({ x: 5, y: 5 }, { x: 2, y: 3 }), { x: 3, y: 2 });
  assert.deepEqual(Vec2.scale({ x: 2, y: -3 }, 2), { x: 4, y: -6 });
  assert.equal(Vec2.dot({ x: 1, y: 2 }, { x: 3, y: 4 }), 11);
  assert.equal(Vec2.length({ x: 3, y: 4 }), 5);
  assert.equal(Vec2.distance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
});

test('Vec2 normalize handles zero vector', () => {
  assert.deepEqual(Vec2.normalize({ x: 0, y: 0 }), { x: 0, y: 0 });
  const n = Vec2.normalize({ x: 10, y: 0 });
  assert.deepEqual(n, { x: 1, y: 0 });
});

test('Vec2 clampLength and lerp', () => {
  const clamped = Vec2.clampLength({ x: 30, y: 40 }, 5);
  assert.ok(Math.abs(Vec2.length(clamped) - 5) < 1e-9);
  assert.deepEqual(Vec2.lerp({ x: 0, y: 0 }, { x: 10, y: 20 }, 0.5), { x: 5, y: 10 });
});

// ── Timers ────────────────────────────────────────────────────────────────────

test('Timers.after fires once at the right time', () => {
  const timers = new Timers();
  let fired = 0;
  timers.after(1, () => fired++);
  timers.update(0.5);
  assert.equal(fired, 0);
  timers.update(0.6);
  assert.equal(fired, 1);
  timers.update(2);
  assert.equal(fired, 1);
  assert.equal(timers.count, 0);
});

test('Timers.every repeats and can be cancelled', () => {
  const timers = new Timers();
  let ticks = 0;
  const handle = timers.every(0.1, () => ticks++);
  timers.update(0.35);   // catches up: 3 ticks
  assert.equal(ticks, 3);
  handle.cancel();
  timers.update(1);
  assert.equal(ticks, 3);
});

// ── Tween ─────────────────────────────────────────────────────────────────────

test('TweenManager animates numeric properties to targets', () => {
  const tweens = new TweenManager();
  const obj = { x: 0, y: 100 };
  tweens.to(obj, { x: 100, y: 0 }, 1, 'linear');
  tweens.update(0.5);
  assert.ok(Math.abs(obj.x - 50) < 1e-9);
  assert.ok(Math.abs(obj.y - 50) < 1e-9);
  tweens.update(0.6);
  assert.equal(obj.x, 100);
  assert.equal(obj.y, 0);
  assert.equal(tweens.count, 0);
});

test('Tween completion callback and delay', () => {
  const tweens = new TweenManager();
  const obj = { v: 0 };
  let completed = false;
  tweens.to(obj, { v: 10 }, 0.5, 'linear', 0.5).then(() => { completed = true; });
  tweens.update(0.4);           // still in delay
  assert.equal(obj.v, 0);
  tweens.update(0.35);          // 0.25s into the tween
  assert.ok(obj.v > 0 && obj.v < 10);
  tweens.update(1);
  assert.equal(obj.v, 10);
  assert.equal(completed, true);
});

test('Easing functions hit endpoints', () => {
  for (const name of Object.keys(Easing)) {
    assert.ok(Math.abs(Easing[name](0)) < 1e-9, `${name}(0) = 0`);
    assert.ok(Math.abs(Easing[name](1) - 1) < 1e-9, `${name}(1) = 1`);
  }
});

// ── SceneManager ──────────────────────────────────────────────────────────────

test('SceneManager switch/push/pop lifecycle', () => {
  const log = [];
  class TestScene extends Scene {
    constructor(name) { super(); this.name = name; }
    enter() { log.push(`enter:${this.name}`); }
    exit() { log.push(`exit:${this.name}`); }
    update() { log.push(`update:${this.name}`); }
    draw() { log.push(`draw:${this.name}`); }
  }

  const scenes = new SceneManager(new TestScene('menu'));
  assert.deepEqual(log, ['enter:menu']);

  scenes.update(0.016);
  scenes.draw(null);
  assert.deepEqual(log.slice(1), ['update:menu', 'draw:menu']);

  log.length = 0;
  scenes.push(new TestScene('pause'));
  scenes.update(0.016);   // only top updates
  scenes.draw(null);      // both draw, bottom-up
  assert.deepEqual(log, ['enter:pause', 'update:pause', 'draw:menu', 'draw:pause']);

  log.length = 0;
  scenes.pop();
  assert.deepEqual(log, ['exit:pause']);
  assert.equal(scenes.current.name, 'menu');

  log.length = 0;
  scenes.switch(new TestScene('game'));
  assert.deepEqual(log, ['exit:menu', 'enter:game']);
  assert.equal(scenes.depth, 1);
});
