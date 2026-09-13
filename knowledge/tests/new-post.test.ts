import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const script = resolve('scripts/new-post.mjs');
test('new post command writes a safe draft, expands columns and refuses overwrites', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'epower-post-'));
  try {
    const args = ['probability-note', '概率 "笔记"', '数学/概率论'];
    assert.equal(spawnSync(process.execPath, [script, ...args], { cwd }).status, 0);
    const file = join(cwd, 'content/posts/notes/probability-note.md');
    const content = readFileSync(file, 'utf8');
    assert.ok(content.includes('draft = true'));
    assert.ok(content.includes('columns = ["数学","数学/概率论"]'));
    assert.ok(content.includes('title = "概率 \\"笔记\\""'));
    assert.equal(spawnSync(process.execPath, [script, ...args], { cwd }).status, 1);
    assert.equal(readFileSync(file, 'utf8'), content);
    assert.equal(spawnSync(process.execPath, [script, '../escape'], { cwd }).status, 1);
    assert.ok(!existsSync(join(cwd, 'content/posts/escape.md')));
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});
