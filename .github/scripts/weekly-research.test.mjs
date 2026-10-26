import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('./weekly-research.mjs', import.meta.url));
function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'weekly-research-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  mkdirSync(join(cwd, '.github/prompts'), { recursive: true });
  writeFileSync(join(cwd, '.github/prompts/weekly-research.md'), 'Research official sources.');
  writeFileSync(join(cwd, 'README.md'), '# Resources\n## Tools\n' + Array.from({ length: 7 }, (_, n) => `- ${n % 2 ? '🆓' : '🎓'} [Tool ${n}](https://tool${n}.example/) - Benefit ${n}\n`).join(''));
  return cwd;
}
function run(cwd, ...args) {
  return spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' });
}
function json(path) { return JSON.parse(readFileSync(path, 'utf8')); }
function prepare(cwd, group) {
  const dir = join(cwd, `research-${group}`);
  const result = run(cwd, 'prepare', String(group), dir);
  assert.equal(result.status, 0, result.stderr);
  return dir;
}

test('prepare partitions the entire inventory round-robin and supplies research context', (t) => {
  const cwd = fixture(t);
  const all = [];
  for (let group = 0; group < 3; group++) {
    const dir = prepare(cwd, group);
    const input = json(join(dir, 'input.json'));
    assert.equal(input.group, group);
    assert.equal(input.inventory.length, 7);
    assert.deepEqual(input.entries.map((e) => e.name), Array.from({ length: group === 0 ? 3 : 2 }, (_, n) => `Tool ${group + n * 3}`));
    assert.ok(input.entries.every((e) => e.section === 'Tools'));
    all.push(...input.entries.map((e) => e.url));
    const prompt = readFileSync(join(dir, 'prompt.md'), 'utf8');
    assert.ok(prompt.includes('Research official sources.'));
    assert.ok(prompt.includes(join(dir, 'report.json')));
    assert.ok(prompt.includes(new Date().toISOString().slice(0, 10)));
    assert.ok(prompt.includes('https://tool6.example/'));
    assert.match(prompt, group === 0 ? /Discover/ : /Do not discover/);
  }
  assert.equal(new Set(all).size, 7);
});

function entry(source, overrides = {}) {
  const country = { status: 'available', conditions: 'Eligible students', evidenceUrls: [source.url] };
  return { name: source.name, url: source.url, status: 'unchanged', benefit: 'Free access', eligibility: 'Students', korea: country, japan: country, evidence: [{ url: source.url, facts: 'Students qualify.' }], ...overrides };
}
function report(dir) {
  const input = json(join(dir, 'input.json'));
  return { group: input.group, entries: input.entries.map((e) => entry(e)), candidates: [] };
}
function validate(cwd, group, mutate = () => {}) {
  const dir = prepare(cwd, group);
  const value = report(dir);
  mutate(value);
  writeFileSync(join(dir, 'report.json'), JSON.stringify(value));
  return run(cwd, 'validate', String(group), dir);
}

test('validate accepts complete reports including unverifiable entries without evidence', (t) => {
  const result = validate(fixture(t), 0, (value) => {
    value.entries[0] = entry(value.entries[0], { status: 'unverifiable', benefit: '', eligibility: '', korea: { status: 'unverifiable', conditions: '', evidenceUrls: [] }, japan: { status: 'unverifiable', conditions: '', evidenceUrls: [] }, evidence: [] });
  });
  assert.equal(result.status, 0, result.stderr);
});

const invalidCases = [
  ['missing assigned entry', (r) => r.entries.pop(), /coverage/],
  ['duplicate assigned entry', (r) => r.entries.push(r.entries[0]), /duplicate|coverage/],
  ['unexpected entry', (r) => { r.entries[0].url = 'https://unexpected.example/'; }, /unexpected|coverage/],
  ['wrong report group', (r) => { r.group = 2; }, /group/],
  ['unavailable without country evidence', (r) => { r.entries[0].korea = { status: 'unavailable', conditions: 'Excluded', evidenceUrls: [] }; }, /evidence/],
  ['country evidence absent from main evidence', (r) => { r.entries[0].japan.evidenceUrls = ['https://other.example/']; }, /evidence/],
  ['missing country assessment', (r) => { delete r.entries[0].korea; }, /korea/],
  ['changed without evidence', (r) => { r.entries[0].status = 'changed'; r.entries[0].evidence = []; }, /evidence/],
  ['empty evidence facts', (r) => { r.entries[0].evidence[0].facts = ''; }, /facts/],
  ['non-http evidence URL', (r) => { r.entries[0].evidence[0].url = 'file:///tmp/private'; }, /http/],
  ['empty benefit for verified entry', (r) => { r.entries[0].benefit = ''; }, /benefit/],
  ['invalid status', (r) => { r.entries[0].status = 'active'; }, /status/],
  ['candidate already in inventory', (r) => r.candidates.push({ ...r.entries[0], section: 'Tools' }), /inventory/],
  ['duplicate candidates', (r) => { const candidate = entry({ name: 'New', url: 'https://new.example/' }, { section: 'Tools' }); r.candidates.push(candidate, candidate); }, /duplicate/],
  ['too many candidates', (r) => { r.candidates = Array.from({ length: 4 }, (_, n) => entry({ name: `New ${n}`, url: `https://new${n}.example/` }, { section: 'Tools' })); }, /3/],
  ['new candidate without evidence', (r) => r.candidates.push(entry({ name: 'New', url: 'https://new.example/' }, { section: 'Tools', status: 'unverifiable', evidence: [] })), /evidence/],
];
for (const [name, mutate, error] of invalidCases) {
  test(`validate rejects ${name}`, (t) => {
    const result = validate(fixture(t), 0, mutate);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, error);
  });
}

test('validate rejects candidates outside group zero', (t) => {
  const result = validate(fixture(t), 1, (r) => r.candidates.push(entry({ name: 'New', url: 'https://new.example/' }, { section: 'Tools' })));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /group 0/);
});

function artifacts(cwd) {
  for (let group = 0; group < 3; group++) {
    const dir = prepare(cwd, group);
    writeFileSync(join(dir, 'report.json'), JSON.stringify(report(dir)));
  }
}

test('merge writes three validated groups in numeric order', (t) => {
  const cwd = fixture(t);
  artifacts(cwd);
  const output = join(cwd, 'combined.json');
  const result = run(cwd, 'merge', cwd, output);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(json(output).groups.map((r) => r.group), [0, 1, 2]);
  assert.equal(json(output).groups.flatMap((r) => r.entries).length, 7);
});

const mergeInvalidCases = [
  ['missing group', (cwd) => rmSync(join(cwd, 'research-1'), { recursive: true }), /group|research-1/],
  ['malformed report', (cwd) => writeFileSync(join(cwd, 'research-1/report.json'), '{'), /JSON|position|property/],
  ['incomplete report', (cwd) => { const path = join(cwd, 'research-2/report.json'); const value = json(path); value.entries.pop(); writeFileSync(path, JSON.stringify(value)); }, /coverage/],
  ['inconsistent inventories', (cwd) => { const dir = join(cwd, 'research-1'); const input = json(join(dir, 'input.json')); input.inventory[0].name = 'Tampered'; writeFileSync(join(dir, 'input.json'), JSON.stringify(input)); }, /inventory|inventories/],
  ['tampered partition', (cwd) => { const path = join(cwd, 'research-0/input.json'); const value = json(path); value.entries.pop(); writeFileSync(path, JSON.stringify(value)); }, /coverage/],
  ['duplicate group artifact', (cwd) => { const dir = join(cwd, 'nested/research-0'); mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, 'report.json'), JSON.stringify({ group: 0 })); }, /duplicate|exactly/],
  ['candidate duplicates existing entry across groups', (cwd) => { const path = join(cwd, 'research-0/report.json'); const value = json(path); value.candidates.push(entry({ name: 'Tool 1', url: 'https://tool1.example/' }, { section: 'Tools' })); writeFileSync(path, JSON.stringify(value)); }, /inventory|duplicate/],
];
for (const [name, mutate, error] of mergeInvalidCases) {
  test(`merge rejects ${name} before writing output`, (t) => {
    const cwd = fixture(t);
    artifacts(cwd);
    mutate(cwd);
    const output = join(cwd, 'combined.json');
    writeFileSync(output, 'previous output');
    const result = run(cwd, 'merge', cwd, output);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, error);
    assert.equal(readFileSync(output, 'utf8'), 'previous output');
  });
}

for (const status of ['unchanged', 'ended']) {
  test(`validate rejects ${status} without current evidence`, (t) => {
    const result = validate(fixture(t), 0, (r) => {
      r.entries[0] = entry(r.entries[0], { status, korea: { status: 'unverifiable', conditions: '', evidenceUrls: [] }, japan: { status: 'unverifiable', conditions: '', evidenceUrls: [] }, evidence: [] });
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /evidence/);
  });
}
for (const status of ['ended', 'unverifiable']) {
  test(`validate rejects ${status} candidates even with evidence`, (t) => {
    const result = validate(fixture(t), 0, (r) => {
      r.candidates.push(entry({ name: 'New', url: 'https://new.example/' }, { section: 'Tools', status }));
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /candidate.*status|status.*candidate/);
  });
}
