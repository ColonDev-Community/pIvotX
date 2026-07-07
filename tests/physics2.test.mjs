// Tests for moving platforms, SpatialHash, and circle resolution
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  stepBody, SpatialHash, circleAABBResolve, createAABB,
} from '../dist/pivotx.esm.js';

const makeBody = (over = {}) => ({
  x: 0, y: 0, vx: 0, vy: 0, width: 32, height: 32, grounded: false, ...over,
});

test('moving platform carries a standing body horizontally', () => {
  const body = makeBody({ x: 100, y: 268, vy: 1 });   // standing on the platform
  const platform = { x: 0, y: 300, w: 300, h: 20, vx: 60 };
  // Settle onto the platform first
  stepBody(body, [platform], 1 / 60, { gravity: 1000 });
  assert.equal(body.grounded, true);

  const startX = body.x;
  for (let i = 0; i < 60; i++) stepBody(body, [platform], 1 / 60, { gravity: 1000 });
  // After 1 s the platform moved ~60px and carried the body with it
  assert.ok(body.x - startX > 55, `body carried ${body.x - startX}px, expected ~60`);
  assert.ok(Math.abs(platform.x - 61) < 2, `platform at ${platform.x}, expected ~61`);
  assert.equal(body.grounded, true);
});

test('body not on the platform is not carried', () => {
  const body = makeBody({ x: 100, y: 0 });   // far above
  const platform = { x: 0, y: 300, w: 300, h: 20, vx: 60 };
  stepBody(body, [platform], 1 / 60, {});
  assert.equal(body.x, 100);
});

test('vertically moving platform keeps the body attached', () => {
  const body = makeBody({ x: 100, y: 268, vy: 1 });
  const platform = { x: 0, y: 300, w: 300, h: 20, vy: 40 };  // sinking
  for (let i = 0; i < 60; i++) stepBody(body, [platform], 1 / 60, { gravity: 1000 });
  // Body bottom should still rest on the platform top
  assert.ok(Math.abs((body.y + body.height) - platform.y) < 2);
  assert.equal(body.grounded, true);
});

test('SpatialHash query returns only nearby items', () => {
  const hash = new SpatialHash(50);
  const a = { name: 'a' }, b = { name: 'b' }, c = { name: 'c' };
  hash.insert(a, createAABB(0, 0, 10, 10));
  hash.insert(b, createAABB(45, 45, 10, 10));    // straddles cells
  hash.insert(c, createAABB(500, 500, 10, 10));  // far away

  const near = hash.query(createAABB(0, 0, 60, 60));
  assert.ok(near.includes(a));
  assert.ok(near.includes(b));
  assert.ok(!near.includes(c));

  hash.clear();
  assert.equal(hash.query(createAABB(0, 0, 600, 600)).length, 0);
});

test('SpatialHash deduplicates items spanning multiple cells', () => {
  const hash = new SpatialHash(10);
  const big = { name: 'big' };
  hash.insert(big, createAABB(0, 0, 100, 100));   // covers ~121 cells
  const found = hash.query(createAABB(0, 0, 100, 100));
  assert.equal(found.length, 1);
});

test('circleAABBResolve pushes a circle out along the closest-point normal', () => {
  const box = createAABB(100, 100, 100, 100);
  const ball = { x: 95, y: 150, radius: 10 };   // overlapping the left edge
  const move = circleAABBResolve(ball, box);
  assert.ok(move);
  assert.ok(move.x < 0 && move.y === 0);         // pushed left
  assert.ok(Math.abs(ball.x - 90) < 1e-9);       // now exactly touching
});

test('circleAABBResolve handles centre-inside-box', () => {
  const box = createAABB(100, 100, 100, 100);
  const ball = { x: 105, y: 150, radius: 10 };   // centre just inside the left edge
  const move = circleAABBResolve(ball, box);
  assert.ok(move);
  assert.ok(ball.x <= 100 - ball.radius + 1e-9); // fully pushed out to the left
});

test('circleAABBResolve returns null when not overlapping', () => {
  const box = createAABB(100, 100, 100, 100);
  const ball = { x: 50, y: 50, radius: 10 };
  assert.equal(circleAABBResolve(ball, box), null);
  assert.equal(ball.x, 50);
});
