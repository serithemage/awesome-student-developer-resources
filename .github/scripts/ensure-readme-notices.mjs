import { readFileSync, writeFileSync } from 'node:fs';

const start = '<!-- AUTO-UPDATE-NOTICE:START -->';
const end = '<!-- AUTO-UPDATE-NOTICE:END -->';
const notices = [
  ['README.md', 'Last updated', '> This repository is updated through weekly automated agent research (Mondays, 00:00 UTC). [How updates work](docs/UPDATING.md#english). Changes appear after the update pull request is merged.\n>\n> Agent research may contain errors or outdated information. Check the official program website for current benefits, eligibility, and deadlines before applying.'],
  ['README.ko.md', '최종 갱신', '> 이 저장소는 매주 월요일 오전 9시(한국 시간)에 에이전트가 자동으로 조사하여 업데이트 PR을 만듭니다. [업데이트 과정](docs/UPDATING.md#한국어)을 참고하세요. 변경 내용은 PR 병합 후 반영됩니다.\n>\n> 에이전트 조사에 기반하므로 오류나 오래된 정보가 포함될 수 있습니다. 신청 전 공식 프로그램 페이지에서 현재 혜택, 신청 자격과 기한을 확인하세요.'],
  ['README.ja.md', '最終更新', '> このリポジトリでは、毎週月曜日の午前9時（日本時間）にエージェントが自動調査し、更新PRを作成します。[更新の流れ](docs/UPDATING.md#日本語)をご覧ください。変更はPRのマージ後に反映されます。\n>\n> エージェントによる調査のため、誤りや古い情報が含まれる場合があります。申し込み前に、公式プログラムページで最新の特典、申請資格、期限を確認してください。'],
];

// Validate all documents before writing; damaged markers must not erase surrounding content.
const updates = notices.map(([file, label, notice]) => {
  const original = readFileSync(file, 'utf8');
  const starts = original.split(start).length - 1;
  const ends = original.split(end).length - 1;
  const block = `${start}\n${notice}\n${end}`;
  let updated;
  if (starts === 0 && ends === 0) {
    const date = new RegExp(`^_${label}: \\d{4}-\\d{2}-\\d{2}_$`, 'gm');
    if ([...original.matchAll(date)].length !== 1) throw new Error(`${file}: expected one update date marker`);
    updated = original.replace(date, match => `${match}\n\n${block}`);
  } else {
    const begin = original.indexOf(start);
    const finish = original.indexOf(end);
    if (starts !== 1 || ends !== 1 || begin >= finish) throw new Error(`${file}: malformed automatic update notice markers`);
    updated = original.slice(0, begin) + block + original.slice(finish + end.length);
  }
  return { file, original, updated };
});

for (const { file, original, updated } of updates) {
  if (original !== updated) writeFileSync(file, updated);
}
