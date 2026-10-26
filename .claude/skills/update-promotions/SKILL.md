---
name: update-promotions
description: Use when asked to update, refresh, or expand student promotion/discount information in this repository's README.md — e.g. "프로모션 업데이트", "학생 혜택 최신화", "리드미 갱신", "새 학생 프로그램 조사", "student discount update".
---

# 학생 프로모션 취합 및 README 업데이트

## Overview

Exa MCP 도구로 학생 대상 무료·할인 프로그램 정보를 조사하여 README를 최신화한다. README는 3개 언어 파일(`README.md` 영어 기본, `README.ko.md` 한국어, `README.ja.md` 일본어)로 구성되며 **항상 함께 갱신**한다. 핵심 원칙: **공식 페이지에서 확인된 정보만 반영**하고, 조사·검증 작업은 서브에이전트에 위임해 메인 컨텍스트를 아낀다.

## Workflow

1. **현황 파악**: `README.md`(영어 기본)를 읽고 섹션과 기존 항목 목록을 정리한다.
2. **기존 항목 검증** — `general-purpose` 서브에이전트를 병렬 dispatch (항목이 1~2개뿐인 섹션은 하나로 병합, 총 3~5개 권장):
   - 각 서브에이전트는 Exa MCP의 `web_search_exa`로 항목별 현재 조건(무료/할인율, 크레딧 금액, 기간, 자격 요건)을 확인한다.
   - 변경·종료가 의심되면 Exa MCP의 `web_fetch_exa`로 해당 항목의 공식 페이지를 직접 열어 확정한다. 검색 답변만으로 "변경됨"을 확정하지 않는다.
   - 반환 형식: 항목마다 `항목명 / 유지·변경·종료·확인불가 / 변경 내용 / 근거 URL` 한 줄. 검색 결과 전문은 반환하지 않는다. `확인불가` = 공식 페이지 접근 실패 또는 조건이 명시적으로 확인되지 않는 경우.
   - 각 교육 프로그램의 한국·일본 신청 가능 여부도 별도로 조사한다. `.github/prompts/weekly-update.md`의 Regional eligibility rules를 따라 공식 국가 목록·현지 약관·지원 학교·인증 방법·신청 기한을 확인한다. 한국어판에는 `한국 신청: 가능·불가·조건부·확인 불가`, 일본어판에는 `日本からの申請: 申請可能・申請不可・条件付き・確認不可`와 공식 근거 링크를 넣는다. 기관 계약과 개인 신청, 미국 조건과 현지 조건을 구분한다. 확인할 수 없는 경우 불가로 추정하지 않는다.
3. **신규 프로그램 발굴** — 서브에이전트 1개, 1회만:
   - Exa MCP의 `web_search_exa`로 포괄 검색을 1회 실행한다. 프롬프트에 README 기존 항목 목록을 넣어 중복을 배제시킨다.
   - 후보마다 같은 서브에이전트가 Exa MCP의 `web_fetch_exa`로 공식 페이지에 학생(또는 무료) 혜택이 명시되어 있는지 검증하고, 통과한 것만 근거 URL과 함께 반환한다. 블로그·커뮤니티 글만 근거인 후보는 탈락시킨다.
4. **README 갱신·추가**: 이 저장소 루트의 `CLAUDE.md` 형식을 따른다 — `- 🎓 [프로그램명](URL) - 설명`(학생 인증 필요 🎓 / 누구나 무료 🆓), 혜택의 구체적 수치(할인율·크레딧·기간)와 자격·인증 방법 포함. 같은 변경을 세 언어 파일(`README.md`, `README.ko.md`, `README.ja.md`)에 각 언어의 자연스러운 문체로 모두 반영하고, 각 파일의 `Last updated`/`최종 갱신`/`最終更新` 날짜를 오늘 날짜로 바꾼다. 신규 항목은 성격에 맞는 기존 섹션에 배치한다. `확인불가` 항목은 수정하지 않고 유지한다.
5. **보고 및 제거 승인**: 갱신/추가/제거 후보/확인불가 항목을 표로 보고한다. 이 단계에서는 **제거하지 않는다** — 종료가 공식 확인된 항목은 제거 후보로만 표시하고, `AskUserQuestion`으로 승인을 받은 뒤에 README에서 삭제한다.

## Query Patterns

`<연도>`는 실행 시점의 현재 연도로 치환한다. 항목이 학생 전용인지 일반 무료 플랜인지는 README 설명 문구(학생 인증 요구 여부)로 판단한다.

- 학생 전용 프로그램 검증: `"<프로그램명> student plan <연도> current benefits eligibility"`
- 일반 무료 플랜 항목: `"<프로그램명> free plan <연도> current limits pricing"`
- 종료 여부: `"<프로그램명> student discount discontinued OR ended"`
- 신규 발굴: `"free tools and discounts for student developers <연도> (cloud credits, AI tools, IDE licenses)"` + 기존 항목 제외 목록

## Common Mistakes

| 실수 | 올바른 방법 |
|------|------------|
| 검색 답변만 믿고 변경·추가 확정 | 공식 페이지를 `web_fetch_exa`로 직접 확인한 것만 반영 |
| 보고 전에 기존 항목 삭제 | 제거는 보고 → AskUserQuestion 승인 후에만 |
| 포괄 검색을 항목마다 반복 | 포괄 검색 1회 후 항목별 검색·공식 페이지 확인 |
| 검색 결과 전문을 메인 컨텍스트로 반환 | 항목당 한 줄 요약 + 근거 URL만 반환 |
| 영어 설명을 번역기 톤으로 삽입 | 기존 항목과 같은 한국어 문체로 재작성 |
| 크레딧 금액·기간을 기억에 의존해 기재 | 근거 URL의 수치를 그대로 인용 |
| 확인불가 항목을 임의 수정 | 그대로 두고 보고서에 표기 |
| 한 언어 파일만 갱신 | 세 파일(en/ko/ja) + `Last updated` 날짜를 항상 함께 갱신 |
