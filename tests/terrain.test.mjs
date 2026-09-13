import test from 'node:test';
import assert from 'node:assert/strict';
import { terrainHeight, columnBlocks } from '../terrain.js';

test('terrainHeight is deterministic and creates varied hills', () => {
  const a = terrainHeight(4, 7);
  const b = terrainHeight(4, 7);
  assert.equal(a, b);

  const heights = new Set();
  for (let x = -10; x <= 10; x += 2) {
    for (let z = -10; z <= 10; z += 2) {
      heights.add(terrainHeight(x, z));
    }
  }
  assert.ok(heights.size >= 4, `expected at least 4 terrain heights, got ${heights.size}`);
});

test('columnBlocks creates grass top, dirt middle, and stone below', () => {
  const blocks = columnBlocks(3);
  assert.equal(blocks.at(-1).type, 0);
  assert.ok(blocks.some(block => block.type === 1));
  assert.ok(blocks.some(block => block.type === 2));
});

test('columnBlocks creates sand near low ground', () => {
  const blocks = columnBlocks(-1);
  assert.equal(blocks.at(-1).type, 3);
});
