# Weekly student-promotion update

You are updating an awesome list of free and discounted programs for student developers.
Follow the repository conventions in `CLAUDE.md` (entry format, 🎓/🆓 markers, section order).

## Tools

- Use `web_search_exa` to find current information and `web_fetch_exa` to open official pages.
- Only official pages of the program (vendor site, pricing page, official docs or blog) count as evidence.
  Search snippets, third-party blogs and community posts are never sufficient on their own.

## Steps

1. Read `README.md` (English, the source of truth for structure) and list every existing entry by section.
2. Verify each existing entry: check its current benefit (free/discount rate, credit amount, duration)
   and eligibility on the official page. Classify each as `unchanged`, `changed`, `ended` or `unverifiable`.
   `unverifiable` means the official page could not be opened or does not state the terms.
3. Discover new programs with one broad search for free tools and discounts for student developers
   in the current year, with an emphasis on AI and vibe-coding tools. Exclude programs already listed.
   Keep a candidate only if its official page explicitly states the student (or free-for-everyone) benefit.
4. Edit the READMEs:
   - Apply `changed` entries and add verified new entries to all three files
     (`README.md`, `README.ko.md`, `README.ja.md`), writing natural prose in each language.
   - Quote numbers exactly as the official page states them.
   - Do not touch `unverifiable` entries.
   - **Never delete entries.** Leave `ended` entries in place; they are listed in the report for a human to decide.
   - If anything changed, set the `Last updated` / `최종 갱신` / `最終更新` date in all three files to today's date (UTC).
5. Write a report in Korean to the file path given at the end of this prompt, using this structure:
   - `## 변경` — table: 항목 / 변경 전 / 변경 후 / 근거 URL
   - `## 신규 추가` — table: 항목 / 섹션 / 혜택 요약 / 근거 URL
   - `## 제거 후보 (종료 확인)` — table: 항목 / 종료 근거 URL
   - `## 확인 불가` — list of entries with the reason
   Write "없음" under any empty heading.

Do not modify any file other than the three READMEs and the report file. Do not run git commands.
