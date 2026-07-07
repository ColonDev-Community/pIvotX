// Tests for raycastCircle and sweepCircleAABB (continuous circle casts)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { raycastCircle, sweepCircleAABB, createAABB } from '../dist/pivotx.esm.js';

test('raycastCircle hits head-on and reports normal', () => {
  const hit = raycastCircle({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 100, y: 0 }, 10);
  assert.ok(hit);
  assert.equal(hit.t, 90);                        // entry at x = 90
  assert.deepEqual(hit.point, { x: 90, y: 0 });
  assert.deepEqual(hit.normal, { x: -1, y: 0 });  // facing the ray
});

test('raycastCircle misses a tangent-passing ray', () => {
  // Ray along y=11 passes above a circle of radius 10 centred at y=0
  assert.equal(raycastCircle({ x: 0, y: 11 }, { x: 1, y: 0 }, { x: 100, y: 0 }, 10), null);
});

test('raycastCircle respects maxT and behind-origin circles', () => {
  assert.equal(raycastCircle({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 100, y: 0 }, 10, 50), null);
  assert.equal(raycastCircle({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -100, y: 0 }, 10), null);
});

test('sweepCircleAABB: face hit stops at contact distance', () => {
  const box = createAABB(100, -50, 100, 100);      // left face at x=100
  const ball = { x: 0, y: 0, radius: 10 };
  const hit = sweepCircleAABB(ball, { x: 200, y: 0 }, box);   // moving right 200px
  assert.ok(hit);
  // Circle centre touches the face when x = 100 - 10 = 90 → t = 90/200
  assert.ok(Math.abs(hit.t - 0.45) < 1e-9);
  assert.deepEqual(hit.normal, { x: -1, y: 0 });
});

test('sweepCircleAABB: corner hit uses the rounded corner', () => {
  const box = createAABB(100, 100, 100, 100);
  const ball = { x: 100, y: 80, radius: 10 };      // above the top-left corner, offset left
  // Move straight down past the corner: centre x=100 equals corner x → contact
  // when centre is radius above the corner (y = 90)
  const hit = sweepCircleAABB(ball, { x: 0, y: 100 }, box);
  assert.ok(hit);
  assert.ok(Math.abs(hit.t - 0.1) < 1e-9);         // 10px of 100px movement
  assert.deepEqual(hit.normal, { x: 0, y: -1 });
});

test('sweepCircleAABB: diagonal corner approach hits the corner circle', () => {
  const box = createAABB(100, 100, 100, 100);
  const ball = { x: 80, y: 80, radius: 10 };       // diagonal from the top-left corner
  const hit = sweepCircleAABB(ball, { x: 40, y: 40 }, box);
  assert.ok(hit);
  // Contact when centre is 10px from corner along the diagonal:
  // distance from (80,80) to corner (100,100) is √800 ≈ 28.28; contact at 18.28
  const contactDist = Math.sqrt(800) - 10;
  const expectedT = contactDist / Math.sqrt(40 * 40 + 40 * 40);
  assert.ok(Math.abs(hit.t - expectedT) < 1e-9);
  // Normal points back along the diagonal
  assert.ok(Math.abs(hit.normal.x + Math.SQRT1_2) < 1e-9);
  assert.ok(Math.abs(hit.normal.y + Math.SQRT1_2) < 1e-9);
});

test('sweepCircleAABB: no hit when movement stops short', () => {
  const box = createAABB(100, -50, 100, 100);
  const ball = { x: 0, y: 0, radius: 10 };
  assert.equal(sweepCircleAABB(ball, { x: 50, y: 0 }, box), null);   // stops at x=50
});

test('sweepCircleAABB: fast movement cannot tunnel', () => {
  const box = createAABB(100, -5, 10, 10);         // thin 10px wall
  const ball = { x: 0, y: 0, radius: 2 };
  const hit = sweepCircleAABB(ball, { x: 100000, y: 0 }, box);       // absurd speed
  assert.ok(hit);                                   // still detected
  assert.ok(hit.t < 0.01);
});
