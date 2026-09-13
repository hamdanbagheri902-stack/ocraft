import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('hotbar has nine old-school slots', () => {
  const slots = html.match(/class="slot/g) ?? [];
  assert.equal(slots.length, 9);
});

test('hotbar exposes number keys 1 through 9', () => {
  for (let i = 1; i <= 9; i++) {
    assert.match(html, new RegExp(`>${i}<`));
  }
});
