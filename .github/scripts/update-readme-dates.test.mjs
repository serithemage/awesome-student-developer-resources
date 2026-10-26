import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('./update-readme-dates.mjs', import.meta.url));
const labels = { 'README.md': 'Last updated', 'README.ko.md': '최종 갱신', 'README.ja.md': '最終更新' };

function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'readme-dates-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  for (const [file, label] of Object.entries(labels)) {
    writeFileSync(join(cwd, file), `# Resources\n\n_${label}: 2026-01-01_\n\n- A program\n`);
  }
  return cwd;
}

test('updates every language to the UTC date while preserving content', (t) => {
  const cwd = fixture(t);
  const before = new Date().toISOString().slice(0, 10);
  execFileSync(process.execPath, [script], { cwd });
  const after = new Date().toISOString().slice(0, 10);
  for (const [file, label] of Object.entries(labels)) {
    const content = readFileSync(join(cwd, file), 'utf8');
    const date = content.match(/: (\d{4}-\d{2}-\d{2})_/)[1];
    assert.ok([before, after].includes(date));
    assert.equal(content, `# Resources\n\n_${label}: ${date}_\n\n- A program\n`);
  }
});

test('running twice on the same day makes no further changes', (t) => {
  const cwd = fixture(t);
  execFileSync(process.execPath, [script], { cwd });
  const contents = Object.keys(labels).map((file) => readFileSync(join(cwd, file), 'utf8'));
  execFileSync(process.execPath, [script], { cwd });
  assert.deepEqual(Object.keys(labels).map((file) => readFileSync(join(cwd, file), 'utf8')), contents);
});

test('rejects a missing date marker before changing any file', (t) => {
  const cwd = fixture(t);
  writeFileSync(join(cwd, 'README.ja.md'), '# Missing date\n');
  const contents = Object.keys(labels).map((file) => readFileSync(join(cwd, file), 'utf8'));
  const result = spawnSync(process.execPath, [script], { cwd, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /README.ja.md/);
  assert.deepEqual(Object.keys(labels).map((file) => readFileSync(join(cwd, file), 'utf8')), contents);
});
