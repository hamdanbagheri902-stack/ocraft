import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../style.css', import.meta.url), 'utf8');

test('home page has a 2009-style site header and game frame', () => {
  assert.match(html, /id="siteHeader"/);
  assert.match(html, /id="gameShell"/);
  assert.match(html, /class="classic-nav"/);
  assert.match(html, />Home</);
  assert.match(html, />Play</);
});

test('game frame contains the menu, hud, and game canvas', () => {
  const shell = html.match(/<main id="gameShell"[\s\S]*?<\/main>/)?.[0] ?? '';
  assert.match(shell, /id="menu"/);
  assert.match(shell, /id="hud"/);
  assert.match(shell, /id="game"/);
});

test('home menu offers play and multiplayer in the classic frame', () => {
  assert.match(html, /id="playBtn"/);
  assert.match(html, /id="multiplayerBtn"/);
});

test('game canvas is contained instead of fixed to the whole browser window', () => {
  assert.match(css, /#game\s*\{[\s\S]*position:\s*absolute/);
  assert.doesNotMatch(css, /#game\s*\{[\s\S]*?position:\s*fixed/);
});
