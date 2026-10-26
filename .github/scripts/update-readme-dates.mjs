import { readFileSync, writeFileSync } from 'node:fs';

const date = new Date().toISOString().slice(0, 10);
const markers = [
  ['README.md', /^_Last updated: \d{4}-\d{2}-\d{2}_$/gm, 'Last updated'],
  ['README.ko.md', /^_최종 갱신: \d{4}-\d{2}-\d{2}_$/gm, '최종 갱신'],
  ['README.ja.md', /^_最終更新: \d{4}-\d{2}-\d{2}_$/gm, '最終更新'],
];

// Validate every file before writing, so a malformed marker leaves all files intact.
const updates = markers.map(([file, marker, label]) => {
  const original = readFileSync(file, 'utf8');
  if ([...original.matchAll(marker)].length !== 1) {
    throw new Error(`${file}: expected exactly one update date marker`);
  }
  return { file, original, updated: original.replace(marker, `_${label}: ${date}_`) };
});

for (const { file, original, updated } of updates) {
  if (original !== updated) writeFileSync(file, updated);
}
