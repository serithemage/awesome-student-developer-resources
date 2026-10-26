import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

function check(condition, message) {
  if (!condition) throw new Error(message);
}
function groupNumber(value) {
  check(/^[012]$/.test(String(value)), 'group must be 0, 1, or 2');
  return Number(value);
}
function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
function prepare(group, directory) {
  const dir = resolve(directory);
  const inventory = [];
  let section = '';
  for (const line of readFileSync('README.md', 'utf8').split(/\r?\n/)) {
    const heading = line.match(/^#{1,6}\s+(.+?)\s*#*$/);
    if (heading) section = heading[1];
    const entry = line.match(/^- (🎓|🆓) \[(.+?)\]\((https?:\/\/[^\s]+)\)(?:\s*-\s*(.*))?$/u);
    if (entry) inventory.push({ name: entry[2], url: entry[3], section, marker: entry[1], description: entry[4] ?? '' });
  }
  check(inventory.length > 0, 'README contains no resource entries');
  const entries = inventory.filter((_, index) => index % 3 === group);
  const input = { group, entries, inventory };
  const template = readFileSync('.github/prompts/weekly-research.md', 'utf8');
  mkdirSync(dir, { recursive: true });
  writeJson(join(dir, 'input.json'), input);
  writeFileSync(join(dir, 'prompt.md'), `${template}\n\n## Assignment\nUTC today: ${new Date().toISOString().slice(0, 10)}\nGroup: ${group}\nReport path (absolute): ${join(dir, 'report.json')}\n${group === 0 ? 'Discover at most 3 new candidates.' : 'Do not discover new candidates. Return candidates: [].'}\n\n## Full inventory for duplicate rejection\n${JSON.stringify(inventory, null, 2)}\n\n## Assigned entries (report every URL exactly once)\n${JSON.stringify(entries, null, 2)}\n`);
}
function readJson(path) { return JSON.parse(readFileSync(path, 'utf8')); }
function object(value, label) {
  check(value && typeof value === 'object' && !Array.isArray(value), `${label} must be an object`);
}
function string(value, label, nonempty = true) {
  check(typeof value === 'string' && (!nonempty || value.trim().length > 0), `${label} must be a ${nonempty ? 'nonempty ' : ''}string`);
}
function httpUrl(value) {
  string(value, 'URL');
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error('URL must be http(s)'); }
  check(['http:', 'https:'].includes(parsed.protocol), 'URL must be http(s)');
}
function uniqueUrls(entries, label) {
  check(Array.isArray(entries), `${label} must be an array`);
  const urls = new Set();
  for (const entry of entries) {
    object(entry, label);
    httpUrl(entry.url);
    check(!urls.has(entry.url), `duplicate URL in ${label}: ${entry.url}`);
    urls.add(entry.url);
  }
  return urls;
}
function validateEntry(entry, candidate = false) {
  object(entry, 'entry');
  string(entry.name, 'name');
  httpUrl(entry.url);
  check(['unchanged', 'changed', 'ended', 'unverifiable'].includes(entry.status), 'invalid entry status');
  string(entry.benefit, 'benefit', entry.status !== 'unverifiable');
  string(entry.eligibility, 'eligibility', entry.status !== 'unverifiable');
  if (candidate) string(entry.section, 'section');
  check(Array.isArray(entry.evidence), 'evidence must be an array');
  check(entry.status === 'unverifiable' && !candidate || entry.evidence.length > 0, 'verified and new entries require evidence');
  check(!candidate || ['unchanged', 'changed'].includes(entry.status), 'candidate status must be unchanged or changed');
  const evidenceUrls = new Set();
  for (const evidence of entry.evidence) {
    object(evidence, 'evidence');
    httpUrl(evidence.url);
    string(evidence.facts, 'evidence facts');
    evidenceUrls.add(evidence.url);
  }
  for (const country of ['korea', 'japan']) {
    const assessment = entry[country];
    object(assessment, country);
    check(['available', 'unavailable', 'conditional', 'unverifiable'].includes(assessment.status), `invalid ${country} status`);
    string(assessment.conditions, `${country} conditions`, false);
    check(Array.isArray(assessment.evidenceUrls), `${country} evidenceUrls must be an array`);
    check(assessment.status === 'unverifiable' || assessment.evidenceUrls.length > 0, `${country} requires evidence`);
    for (const url of assessment.evidenceUrls) {
      httpUrl(url);
      check(evidenceUrls.has(url), `${country} evidence URL missing from entry evidence`);
    }
  }
}
function validate(group, dir) {
  const input = readJson(join(dir, 'input.json'));
  const report = readJson(join(dir, 'report.json'));
  object(input, 'input');
  object(report, 'report');
  check(input.group === group && report.group === group, 'group mismatch');
  const inventoryUrls = uniqueUrls(input.inventory, 'inventory');
  uniqueUrls(input.entries, 'assigned entries');
  for (const source of input.inventory) {
    string(source.name, 'inventory name');
    string(source.section, 'inventory section');
  }
  const expectedEntries = input.inventory.filter((_, index) => index % 3 === group);
  check(JSON.stringify(input.entries) === JSON.stringify(expectedEntries), 'assigned entries do not match round-robin inventory coverage');
  const expected = new Set(input.entries.map((entry) => entry.url));
  const actual = uniqueUrls(report.entries, 'report entries');
  check(actual.size === expected.size && [...actual].every((url) => expected.has(url)), 'report coverage mismatch or unexpected URLs');
  check(Array.isArray(report.candidates), 'candidates must be an array');
  check(group === 0 || report.candidates.length === 0, 'only group 0 may discover candidates');
  check(report.candidates.length <= 3, 'at most 3 candidates allowed');
  uniqueUrls(report.candidates, 'candidates');
  for (const entry of report.entries) validateEntry(entry);
  for (const candidate of report.candidates) {
    check(!inventoryUrls.has(candidate.url), 'candidate URL already in inventory');
    validateEntry(candidate, true);
  }
  return { input, report };
}

function merge(downloadDir, outputPath) {
  const directories = [];
  function visit(dir) {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      if (item.isDirectory()) visit(join(dir, item.name));
      else if (item.isFile() && item.name === 'report.json') directories.push(dir);
    }
  }
  visit(downloadDir);
  check(directories.length === 3, 'merge requires exactly 3 group reports; missing or duplicate group artifacts');
  const groups = new Map();
  let inventory;
  const candidateUrls = new Set();
  for (const dir of directories) {
    const report = readJson(join(dir, 'report.json'));
    object(report, 'report');
    const group = groupNumber(report.group);
    check(report.group === group, 'report group must be numeric');
    check(!groups.has(group), `duplicate group ${group}`);
    const validated = validate(group, dir);
    const serialized = JSON.stringify(validated.input.inventory);
    if (inventory === undefined) inventory = serialized;
    else check(inventory === serialized, 'group inventories must be identical');
    for (const candidate of report.candidates) {
      check(!candidateUrls.has(candidate.url), 'duplicate candidate across groups');
      candidateUrls.add(candidate.url);
    }
    groups.set(group, validated.report);
  }
  check([0, 1, 2].every((group) => groups.has(group)), 'missing group');
  writeJson(outputPath, { groups: [0, 1, 2].map((group) => groups.get(group)) });
}

try {
  const [command, first, second, ...extra] = process.argv.slice(2);
  check(first && second && extra.length === 0, 'usage: weekly-research.mjs prepare|validate <group> <dir> or merge <download-dir> <output-path>');
  if (command === 'prepare') prepare(groupNumber(first), second);
  else if (command === 'validate') validate(groupNumber(first), resolve(second));
  else if (command === 'merge') merge(resolve(first), resolve(second));
  else throw new Error(`unknown command: ${command}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
