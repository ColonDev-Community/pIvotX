// Physics engine tests — run with: npm test (builds first, then node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  stepBody, resolveCollisions, createAABB, aabbOverlap, aabbOverlapDepth,
  circlesOverlap, circleAABBOverlap, raycastAABB,
} from '../dist/pivotx.esm.js';

const makeBody = (over = {}) => ({
  x: 0, y: 0, vx: 0, vy: 0, width: 32, height: 32, grounded: false, ...over,
});

test('falling body lands on a solid platform', () => {
  const body = makeBody({ x: 100, y: 250, vy: 300 });
  const platforms = [{ x: 0, y: 300, w: 800, h: 40 }];
  for (let i = 0; i < 30; i++) stepBody(body, platforms, 1 / 60, { gravity: 1400 });
  assert.equal(body.grounded, true);
  assert.equal(body.y, 300 - 32);
  assert.equal(body.vy, 0);
});

test('one-way platform: lands from above', () => {
  const body = makeBody({ x: 100, y: 250, vy: 300 });
  const platforms = [{ x: 0, y: 300, w: 800, h: 16, oneWay: true }];
  for (let i = 0; i < 30; i++) stepBody(body, platforms, 1 / 60, { gravity: 1400 });
  assert.equal(body.grounded, true);
  assert.equal(body.y, 300 - 32);
});

test('one-way platform: passes through from below', () => {
  const body = makeBody({ x: 100, y: 320, vy: -500 });
  const platforms = [{ x: 0, y: 300, w: 800, h: 16, oneWay: true }];
  let blocked = false;
  for (let i = 0; i < 10; i++) {
    if (stepBody(body, platforms, 1 / 60, {}).length > 0) blocked = true;
  }
  assert.equal(blocked, false);
  assert.ok(body.y < 300);
});

test('friction is frame-rate independent', () => {
  const a = makeBody({ vx: 600 });
  const b = makeBody({ vx: 600 });
  for (let i = 0; i < 60; i++) stepBody(a, [], 1 / 60, { friction: 0.9 });
  for (let i = 0; i < 30; i++) stepBody(b, [], 1 / 30, { friction: 0.9 });
  assert.ok(Math.abs(a.vx - b.vx) < 1e-6);
});

test('maxFallSpeed caps vy', () => {
  const body = makeBody();
  for (let i = 0; i < 120; i++) stepBody(body, [], 1 / 60, { gravity: 2000, maxFallSpeed: 400 });
  assert.equal(body.vy, 400);
});

test('bounce reverses vertical velocity with restitution', () => {
  const body = makeBody({ x: 100, y: 250, vy: 600 });
  const platforms = [{ x: 0, y: 300, w: 800, h: 40 }];
  let bounced = false;
  for (let i = 0; i < 20; i++) {
    stepBody(body, platforms, 1 / 60, { gravity: 0, bounce: 0.5 });
    if (body.vy < 0) { bounced = true; break; }
  }
  assert.equal(bounced, true);
  assert.ok(Math.abs(body.vy + 300) < 30); // ~ -600 * 0.5
});

test('bounce=0 (default) still grounds the body', () => {
  const body = makeBody({ x: 100, y: 250, vy: 300 });
  const platforms = [{ x: 0, y: 300, w: 800, h: 40 }];
  for (let i = 0; i < 30; i++) stepBody(body, platforms, 1 / 60, { gravity: 1400 });
  assert.equal(body.grounded, true);
});

test('sidewall collision reports left/right and stops vx', () => {
  const body = makeBody({ x: 100, y: 0, vx: 500 });
  const platforms = [{ x: 200, y: -50, w: 40, h: 200 }];
  const allHits = [];
  for (let i = 0; i < 30; i++) allHits.push(...stepBody(body, platforms, 1 / 60, {}));
  assert.ok(allHits.some((h) => h.side === 'left'));
  assert.equal(body.vx, 0);
  assert.equal(body.x, 200 - 32);
});

test('resolveCollisions is exported and works standalone', () => {
  const body = makeBody({ x: 10, y: 290, vy: 10 });
  const hits = resolveCollisions(body, [{ x: 0, y: 300, w: 100, h: 20 }]);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].side, 'top');
});

test('AABB helpers', () => {
  const a = createAABB(0, 0, 10, 10);
  const b = createAABB(5, 5, 10, 10);
  const c = createAABB(20, 20, 5, 5);
  assert.equal(aabbOverlap(a, b), true);
  assert.equal(aabbOverlap(a, c), false);
  const depth = aabbOverlapDepth(a, b);
  assert.deepEqual(depth, { x: 5, y: 5 });
  assert.equal(aabbOverlapDepth(a, c), null);
});

test('circle collision helpers', () => {
  assert.equal(circlesOverlap({ x: 0, y: 0, radius: 5 }, { x: 8, y: 0, radius: 5 }), true);
  assert.equal(circlesOverlap({ x: 0, y: 0, radius: 5 }, { x: 11, y: 0, radius: 5 }), false);

  const box = createAABB(10, 10, 20, 20);
  assert.equal(circleAABBOverlap({ x: 8, y: 20, radius: 5 }, box), true);   // side
  assert.equal(circleAABBOverlap({ x: 7, y: 7, radius: 3 }, box), false);   // corner miss
  assert.equal(circleAABBOverlap({ x: 8, y: 8, radius: 4 }, box), true);    // corner hit
});

test('raycastAABB hits and reports normal', () => {
  const box = createAABB(100, 0, 50, 50);
  const hit = raycastAABB({ x: 0, y: 25 }, { x: 1, y: 0 }, box);
  assert.ok(hit);
  assert.equal(hit.t, 100);
  assert.deepEqual(hit.normal, { x: -1, y: 0 });
  assert.deepEqual(hit.point, { x: 100, y: 25 });

  // Miss
  assert.equal(raycastAABB({ x: 0, y: 100 }, { x: 1, y: 0 }, box), null);
  // Out of range
  assert.equal(raycastAABB({ x: 0, y: 25 }, { x: 1, y: 0 }, box, 50), null);
});
