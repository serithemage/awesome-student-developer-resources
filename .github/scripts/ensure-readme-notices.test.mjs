import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('./ensure-readme-notices.mjs', import.meta.url));
const start = '<!-- AUTO-UPDATE-NOTICE:START -->';
const end = '<!-- AUTO-UPDATE-NOTICE:END -->';
const labels = { 'README.md': 'Last updated', 'README.ko.md': '최종 갱신', 'README.ja.md': '最終更新' };
function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'readme-notices-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  for (const [file, label] of Object.entries(labels)) {
    writeFileSync(join(cwd, file), `# Resources\n\n_${label}: 2026-10-26_\n\n## Programs\n\n- Original program\n`);
  }
  return cwd;
}
function run(cwd) { execFileSync(process.execPath, [script], { cwd }); }

test('inserts a localized notice after the date without changing the program list', (t) => {
  const cwd = fixture(t);
  run(cwd);
  for (const [file, label] of Object.entries(labels)) {
    const text = readFileSync(join(cwd, file), 'utf8');
    assert.ok(text.includes(`_${label}: 2026-10-26_\n\n${start}\n`));
    assert.match(text, /docs\/UPDATING\.md#/);
    assert.ok(text.endsWith('## Programs\n\n- Original program\n'));
    assert.equal(text.split(start).length, 2);
  }
  assert.match(readFileSync(join(cwd, 'README.md'), 'utf8'), /may contain errors/);
  assert.match(readFileSync(join(cwd, 'README.ko.md'), 'utf8'), /오류/);
  assert.match(readFileSync(join(cwd, 'README.ja.md'), 'utf8'), /誤り/);
});

test('restores edited or deleted notices and is idempotent', (t) => {
  const cwd = fixture(t);
  run(cwd);
  const original = Object.fromEntries(Object.keys(labels).map(file => [file, readFileSync(join(cwd, file), 'utf8')]));
  writeFileSync(join(cwd, 'README.md'), original['README.md'].replace(/<!-- AUTO-UPDATE-NOTICE:START -->[\s\S]*?<!-- AUTO-UPDATE-NOTICE:END -->/, `${start}\nRemoved warning\n${end}`));
  writeFileSync(join(cwd, 'README.ko.md'), original['README.ko.md'].replace(/<!-- AUTO-UPDATE-NOTICE:START -->[\s\S]*?<!-- AUTO-UPDATE-NOTICE:END -->\n\n/, ''));
  run(cwd);
  run(cwd);
  for (const file of Object.keys(labels)) assert.equal(readFileSync(join(cwd, file), 'utf8'), original[file]);
});

for (const invalid of [start, `${end}\n${start}`, `${start}\n${start}\n${end}`]) {
  test(`rejects malformed notice markers before writing any file: ${invalid}`, (t) => {
    const cwd = fixture(t);
    writeFileSync(join(cwd, 'README.ja.md'), `${invalid}\n`);
    const before = Object.keys(labels).map(file => readFileSync(join(cwd, file), 'utf8'));
    const result = spawnSync(process.execPath, [script], { cwd, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /README.ja.md/);
    assert.deepEqual(Object.keys(labels).map(file => readFileSync(join(cwd, file), 'utf8')), before);
  });
}
