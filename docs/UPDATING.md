# Weekly update process / 주간 업데이트 과정 / 毎週の更新手順

[English](#english) | [한국어](#한국어) | [日本語](#日本語)

## English

This repository uses automated agent research to propose weekly updates. The
[GitHub Actions workflow](../.github/workflows/weekly-update.yml) is scheduled for
Mondays at 00:00 UTC (09:00 in Korea and Japan) and can also be started manually.
Scheduled runs may be delayed or fail. Changes appear in the public list after the
update pull request is reviewed and merged; the workflow does not merge it automatically.

1. Existing programs are divided into three research groups that run in parallel.
   The current stack is pi, DeepSeek Flash and the official Exa MCP server.
2. Researchers open the linked official program pages first and reuse fetched facts.
   Each entry has a budget of two targeted searches and three pages. Group 0 alone
   can discover up to three new programs. Only official pages opened during that run
   may support new claims. Missing evidence is reported as unverified.
3. Student programs are checked separately for applications from South Korea and
   Japan, including country restrictions, participating schools, verification and
   deadlines. Eligibility is described as available, unavailable, conditional or
   unverified. Institutional access is distinguished from individual applications.
4. Reports are checked for complete entry coverage and consistent evidence URLs.
   One editor then updates all three READMEs from these reports, without further web
   research. These checks do not independently prove that an agent interpreted a
   source correctly. Unverified benefit descriptions are preserved. Ended programs
   are reported for human review and are not automatically deleted.
5. Automation restores the permanent README notices, stamps the update dates in UTC,
   and creates or updates the `bot/weekly-update` pull request with a Korean report.

**Accuracy:** Agent research can contain errors, omissions, translation mistakes or
outdated information. Official pages may also be inaccessible or ambiguous. A country
marked unverified is not necessarily ineligible. Before applying, check the official
program website for current benefits, eligibility, prices and deadlines. Report issues
through a repository issue or pull request, with an official source link.

**Logs:** Open the [Actions page](https://github.com/serithemage/awesome-student-developer-resources/actions/workflows/weekly-update.yml)
to see job logs, durations and summaries. Artifacts `research-0`, `research-1`,
`research-2` and `weekly-editor` retain research inputs, prompts, evidence reports,
timing/token metrics and filtered events for 30 days. Available diagnostics are saved
even when a job fails. Raw reasoning, tool arguments/responses and secret values are
not included in these diagnostic event files. Model response time includes API/network
waits; SDK cost estimates exclude Exa. Download all available artifacts with:

```sh
gh run download RUN_ID --dir /tmp/weekly-update-logs
```

**Notice preservation:** The `AUTO-UPDATE-NOTICE` blocks in the READMEs are maintained by
[`ensure-readme-notices.mjs`](../.github/scripts/ensure-readme-notices.mjs). Weekly updates
restore them before opening a PR. The [README maintenance workflow](../.github/workflows/readme-dates.yml)
also restores them after README changes reach `main`. Update the canonical text in that
script when intentionally changing the notices; do not remove their markers.

## 한국어

이 저장소는 에이전트의 자동 조사를 바탕으로 매주 업데이트를 제안합니다.
[GitHub Actions 워크플로](../.github/workflows/weekly-update.yml)는 매주 월요일
00:00 UTC, 한국·일본 시간 오전 9시에 실행되도록 예약되어 있으며 수동 실행도 가능합니다.
예약 실행은 지연되거나 실패할 수 있습니다. 실제 목록에는 업데이트 PR을 검토하고
병합한 뒤 변경 내용이 반영됩니다. 워크플로가 PR을 자동 병합하지는 않습니다.

1. 기존 프로그램을 세 그룹으로 나눠 동시에 조사합니다. 현재 pi, DeepSeek Flash,
   공식 Exa MCP 서버를 사용합니다.
2. README에 연결된 공식 페이지를 먼저 열고, 확인한 정보를 재사용합니다. 항목마다
   추가 검색 2회·페이지 3개로 조사를 제한합니다. 그룹 0만 신규 프로그램을 최대
   3개 발굴합니다. 해당 실행에서 직접 연 공식 페이지로 확인한 사실만 새로운
   주장의 근거로 사용하며, 근거가 부족하면 확인 불가로 보고합니다.
3. 교육 프로그램은 한국과 일본에서의 신청 가능 여부를 각각 확인합니다. 국가 제한,
   지원 학교, 인증 방법, 신청 기한을 조사해 가능·불가·조건부·확인 불가로 표시합니다.
   기관이 도입해야 하는 프로그램과 학생 개인이 신청하는 프로그램을 구분합니다.
4. 조사 결과의 항목 누락과 근거 URL 일관성을 검사합니다. 이후 편집 에이전트 하나가
   추가 웹 조사 없이 보고서를 바탕으로 세 언어 README를 함께 갱신합니다. 이 검사는
   에이전트가 공식 내용을 정확히 해석했는지까지 독립적으로 보증하지 않습니다.
   확인하지 못한 기존 혜택 설명은 유지하고, 종료된 프로그램은 자동 삭제하지 않고
   사람이 검토할 제거 후보로 보고합니다.
5. 자동화가 README의 고정 안내문을 복원하고 갱신일을 UTC 날짜로 기록한 뒤,
   한국어 조사 보고서와 함께 `bot/weekly-update` PR을 생성하거나 갱신합니다.

**정보의 정확성:** 에이전트 조사에는 오류, 누락, 번역 실수나 오래된 정보가 포함될 수
있습니다. 공식 페이지에 접근할 수 없거나 조건이 모호한 경우도 있습니다. 확인 불가는
신청 불가를 뜻하지 않습니다. 신청 전 공식 프로그램 페이지에서 현재 혜택, 자격,
가격과 기한을 확인하세요. 오류를 발견하면 공식 근거 링크와 함께 이슈나 PR로 알려주세요.

**실행 로그:** [Actions 실행 화면](https://github.com/serithemage/awesome-student-developer-resources/actions/workflows/weekly-update.yml)에서
작업 로그, 소요 시간과 요약을 확인할 수 있습니다. `research-0`, `research-1`,
`research-2`, `weekly-editor` 아티팩트에는 조사 입력·프롬프트·근거 보고서,
시간·토큰 집계와 정제된 이벤트 기록이 30일간 보관됩니다. 작업이 실패해도 생성된
진단 자료는 저장합니다. 진단 이벤트에는 원문 추론, 도구 인자·응답과 비밀 값을
포함하지 않습니다. 모델 응답 시간에는 API·네트워크 대기가 포함되며 SDK 비용 추정에는
Exa 비용이 포함되지 않습니다. 전체 자료는 `gh run download RUN_ID --dir /tmp/weekly-update-logs`로 받을 수 있습니다.

**안내문 유지:** README의 `AUTO-UPDATE-NOTICE` 블록은
[`ensure-readme-notices.mjs`](../.github/scripts/ensure-readme-notices.mjs)가 관리합니다.
주간 갱신에서는 PR 생성 전에 복원하며,
[README 유지보수 워크플로](../.github/workflows/readme-dates.yml)는 README 변경이
`main`에 반영된 후에도 복원합니다. 안내문 자체를 변경하려면 해당 스크립트의 원본을
수정하고, README의 시작·종료 표식은 유지하세요.

## 日本語

このリポジトリは、エージェントによる自動調査に基づいて毎週更新を提案します。
[GitHub Actionsワークフロー](../.github/workflows/weekly-update.yml)は、毎週月曜日
00:00 UTC（日本・韓国時間の午前9時）に実行する設定です。手動実行もできます。
予約実行が遅れたり失敗したりする場合があります。公開リストへの反映は、更新PRの
レビューとマージ後です。ワークフローがPRを自動マージすることはありません。

1. 既存プログラムを3グループに分け、並列で調査します。現在の構成はpi、
   DeepSeek Flash、公式Exa MCPサーバーです。
2. READMEの公式リンクを先に開き、取得した情報を再利用します。各項目の調査は
   追加検索2回・3ページまでです。グループ0のみ、新規プログラムを最大3件探します。
   その実行中に開いた公式ページで確認できた事実だけを新しい記述の根拠とし、
   根拠が足りない場合は確認不可として報告します。
3. 教育プログラムについて、日本と韓国からの申請可否を個別に確認します。
   対象国、参加校、認証方法、申請期限を調べ、申請可能・申請不可・条件付き・
   確認不可で示します。教育機関による導入と学生個人による申請を区別します。
4. 報告の項目漏れと根拠URLの整合性を検査します。その後、1つの編集エージェントが
   追加のウェブ調査をせず、報告に基づいて3言語のREADMEを更新します。この検査は、
   エージェントが公式情報を正しく解釈したことまで独立に保証するものではありません。
   確認できない既存の特典説明は維持し、終了したプログラムは自動削除せず、
   人による確認が必要な削除候補として報告します。
5. 自動処理でREADMEの固定案内文を復元し、UTCの更新日を記録したうえで、
   韓国語の調査報告を添えて`bot/weekly-update`のPRを作成または更新します。

**情報の正確性:** エージェントの調査には、誤り、情報の欠落、翻訳ミス、古い情報が
含まれる場合があります。公式ページを取得できない場合や条件が曖昧な場合もあります。
確認不可は申請不可を意味しません。申し込み前に、公式プログラムページで最新の特典、
資格、料金、期限を確認してください。誤りは公式の根拠リンクとともにIssueやPRで報告できます。

**実行ログ:** [Actionsの実行画面](https://github.com/serithemage/awesome-student-developer-resources/actions/workflows/weekly-update.yml)で、
ジョブログ、所要時間、サマリーを確認できます。`research-0`、`research-1`、
`research-2`、`weekly-editor`のアーティファクトには、調査入力、プロンプト、
根拠報告、時間・トークン集計、内容を限定したイベント記録を30日間保存します。
失敗したジョブでも、作成済みの診断資料は保存します。診断イベントに推論の原文、
ツールの引数・応答、秘密情報は含めません。モデル応答時間にはAPI・ネットワークの
待機時間を含み、SDKの料金推定にはExaの料金を含みません。資料は
`gh run download RUN_ID --dir /tmp/weekly-update-logs`でまとめて取得できます。

**案内文の維持:** READMEの`AUTO-UPDATE-NOTICE`ブロックは
[`ensure-readme-notices.mjs`](../.github/scripts/ensure-readme-notices.mjs)で管理します。
毎週の更新ではPR作成前に復元し、[README保守ワークフロー](../.github/workflows/readme-dates.yml)は、
READMEの変更が`main`に反映された後にも復元します。案内文を変更するときは
スクリプト内の原文を更新し、READMEの開始・終了マーカーは残してください。
