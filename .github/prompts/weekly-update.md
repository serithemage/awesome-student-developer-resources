# Weekly student-promotion update

You are updating an awesome list of free and discounted programs for student developers.
Follow the repository conventions in `CLAUDE.md` (entry format, 🎓/🆓 markers, section order).

## Tools

- Use the official Exa MCP tools `mcp__exa__web_search_exa` to find current information
  and `mcp__exa__web_fetch_exa` to open official pages.
- Only official pages of the program (vendor site, pricing page, official docs or blog) count as evidence.
  Search snippets, third-party blogs and community posts are never sufficient on their own.
- Every number or condition you write must come from an official page you actually opened with `web_fetch_exa`
  in this run. If the fetch fails or the page does not state it, classify the entry as `unverifiable`.
  Do not fill gaps with prior knowledge or search summaries.
- Check regional eligibility (e.g. "US only", "excluding US"), age limits, plan names and deadlines exactly.

## Steps

1. Read `README.md` (English, the source of truth for structure) and list every existing entry by section.
2. Verify each existing entry: check its current benefit (free/discount rate, credit amount, duration)
   and eligibility on the official page. For every student/education program, also verify separately
   whether students or institutions in South Korea and Japan can currently apply, following the
   regional eligibility rules below. Classify each as `unchanged`, `changed`, `ended` or `unverifiable`.
   `unverifiable` means the official page could not be opened or does not state the terms.
3. Discover new programs with one broad search for free tools and discounts for student developers
   in the current year, with an emphasis on AI and vibe-coding tools. Exclude programs already listed.
   Keep a candidate only if its official page explicitly states the student (or free-for-everyone) benefit.
   Reject any product that has closed new sign-ups, announced end of support, or been replaced by a successor
   (search for "<product> end of support" before adding). Also reject products that were previously removed
   from the list — check `git log -p -S "<product>" -- README.md` first.
4. Edit the READMEs:
   - Apply `changed` entries and add verified new entries to all three files
     (`README.md`, `README.ko.md`, `README.ja.md`), writing natural prose in each language.
   - Add or update the country-specific eligibility notes in Korean and Japanese for every
     student/education program, including entries whose general benefits are unchanged.
   - Quote numbers exactly as the official page states them.
   - Keep product names in their original form in all three languages (do not translate names in `[...]`).
   - Do not use `~` in text (it breaks Markdown rendering); write ranges with `-`.
   - Preserve unverifiable benefit claims. You may append a regional eligibility note marked
     `확인 불가` / `確認不可` without changing the existing benefit description.
   - **Never delete entries.** Leave `ended` entries in place; they are listed in the report for a human to decide.
   - If anything changed, set the `Last updated` / `최종 갱신` / `最終更新` date in all three files to today's date (UTC).
5. Write a report in Korean to the file path given at the end of this prompt, using this structure:
   - `## 변경` — table: 항목 / 변경 전 / 변경 후 / 근거 URL
   - `## 신규 추가` — table: 항목 / 섹션 / 혜택 요약 / 근거 URL
   - `## 제거 후보 (종료 확인)` — table: 항목 / 종료 근거 URL
   - `## 확인 불가` — list of entries with the reason
   - `## 국가별 신청 가능 여부` — table: 항목 / 한국 (가능·불가·조건부·확인 불가) /
     일본 (가능·불가·조건부·확인 불가) / 국가별 조건·기한 / 근거 URL
     Include every student/education program, even when its benefit did not change.
   Write "없음" under any empty heading.

## Regional eligibility rules

- Investigate South Korea for `README.ko.md` and Japan for `README.ja.md` independently.
  Search official country lists, regional education pages, offer terms, enrollment deadlines,
  supported institutions and student-verification requirements. Open the supporting official pages
  with `mcp__exa__web_fetch_exa` during this run. A translated website, accessible service,
  generic `.edu` requirement, or lack of a stated exclusion does not prove local eligibility.
- `가능` / `申請可能`: an official source explicitly includes the country, offers the program
  locally, or states worldwide eligibility. State student-verification requirements too.
- `불가` / `申請不可`: an official source explicitly excludes the country, limits eligibility
  to an exhaustive list without it, or confirms new applications have closed. State the reason.
- `조건부` / `条件付き`: eligibility depends on a participating institution, a local plan,
  institutional purchase, or another restriction. State exactly what must be checked; do not
  infer acceptance of a particular school or email address. Institutional programs must say
  whether an institution, rather than an individual student, must apply.
- `확인 불가` / `確認不可`: official evidence is unavailable or does not establish country
  eligibility. Say what could not be verified. Do not imply the program is unavailable.
- Append a short, linked note to each education-program entry in the Korean and Japanese files:
  `한국 신청: <상태> — <조건과 공식 근거 링크>` /
  `日本からの申請: <状態> — <条件と公式根拠リンク>`.
  Use natural local prose. Do not invent an evidence link when none could be opened.
- Verify local prices, currency, benefits and deadlines separately. Do not present a US-only
  price or offer as a Korean/Japanese benefit. If only the global/US terms are verifiable,
  explicitly label their scope and say local terms are unconfirmed.
- Keep the same program names and section order across all three READMEs. The English file
  keeps the global description; Korean and Japanese eligibility notes may differ by country.
- New education programs require this same regional check before they are added.

Do not modify any file other than the three READMEs and the report file.
Read-only git commands (`git log`, `git show`, `git diff`) are allowed; do not run any git command that changes state.
