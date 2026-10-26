# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

학생 개발자를 위한 할인·무료 프로그램을 모은 **awesome 리스트 저장소**입니다. AI·바이브 코딩 도구가 중심이며, 일반 개발 도구는 하단에 배치합니다. 빌드 시스템·테스트·린트가 없는 문서 전용 저장소이며, 콘텐츠는 3개 언어 파일로 제공됩니다:

- `README.md` — 영어(기본)
- `README.ko.md` — 한국어
- `README.ja.md` — 일본어

주간 자동 갱신 도구는 `package.json`과 `package-lock.json`으로 고정합니다. 설치는 Node.js 24 LTS에서 `npm ci --ignore-scripts`를 사용합니다. pi 1.4.0이 고정한 `undici` 8.10.2의 보안 문제를 해결하기 위해 `overrides`로 8.12.3을 사용합니다.

README 갱신일은 `.github/scripts/update-readme-dates.mjs`가 UTC 날짜로 기록합니다. 주간 워크플로는 README 변경 후 PR 생성 전에 실행하며, `.github/workflows/readme-dates.yml`은 README 변경이 `main`에 반영되면 세 언어판의 날짜를 자동으로 맞춥니다. 날짜가 이미 같으면 추가 커밋을 만들지 않습니다. 검증은 `node --test .github/scripts/update-readme-dates.test.mjs`로 실행합니다.

주간 갱신의 기본 모델은 공식 최신 Flash 별칭 `deepseek/deepseek-flash`입니다. 기존 항목을 순서대로 세 그룹에 나눠 병렬 조사한 뒤, 편집 작업 하나가 검증된 조사 결과로 세 언어 README를 갱신합니다. 조사는 `low`, 편집은 `high` 추론 강도를 사용합니다. 각 그룹은 README의 공식 URL부터 확인하고, URL별 조회 결과를 재사용하며, 항목당 검색 2회·페이지 3개로 제한합니다. 새 후보는 그룹 0만 최대 3개 조사합니다. 근거가 부족하면 확인 불가로 남깁니다. 편집 단계에는 Exa 자격 증명을 제공하지 않으며, `--no-mcp`로 MCP 로드를 끄고 bash 도구도 제외하여 추가 검색을 제한합니다.

`weekly-research.mjs`는 그룹별 입력·프롬프트 생성, 전체 항목 누락 여부와 국가별 근거 URL 검증, 결과 병합을 담당합니다. pi JSON 이벤트에서 호출별 시간·토큰·재시도를 집계해 Actions 로그와 Job Summary에 기록합니다. 정제된 진행 이벤트, 집계 지표, 조사 입력·프롬프트·결과, 편집 보고서는 성공·실패와 관계없이 Actions Artifacts에 30일간 보관합니다. 실행 화면에서 `research-0`, `research-1`, `research-2`, `weekly-editor`를 내려받아 사후 분석할 수 있습니다. CLI에서는 `gh run download RUN_ID --dir /tmp/weekly-update-logs`로 전체 아티팩트를 받습니다. 원문 이벤트, 도구 인자·응답, 추론 본문, 비밀 값과 런타임 설정은 업로드하지 않습니다. 모델 응답 시간에는 네트워크 대기가 포함되며 비용은 Exa 비용을 제외한 SDK 추정치입니다. 전체 경과 시간은 Actions 작업 시간과 함께 확인합니다. 전체 자동화 테스트는 `node --test .github/scripts/*.test.mjs`로 실행합니다.

## Content Structure & Conventions

세 파일은 동일한 구조를 가집니다: 제목 → 언어 스위처 → `Last updated` 날짜 → 목차(TOC) → 범례 → 콘텐츠 섹션 8개(Vibe Coding & AI App Builders / AI Coding Tools / AI Assistants & Education Plans / Developer Tools / Cloud / Collaboration / Design / Productivity — AI 섹션이 항상 상단) → Contributing.

항목 추가·수정 시 규칙:

- 형식: `- 🎓 [프로그램명](URL) - 설명` — 학생·교육기관 인증이 필요하면 🎓, 누구나 무료면 🆓.
- 설명에는 혜택의 구체적 내용(무료/할인율, 크레딧 금액, 기간)과 자격·인증 방법을 포함합니다.
- 제품명·서비스명은 원문을 유지하고, 설명은 각 언어의 자연스러운 문체로 작성합니다(기계 번역 톤 배제).
- 교육 프로그램은 한국어판에 한국, 일본어판에 일본에서의 신청 가능 여부(가능·불가·조건부·확인 불가)와 공식 근거를 표시합니다. 국가 목록, 현지 약관, 인증 가능한 학교, 신청 기한을 각각 확인하며, 번역 페이지가 있다는 이유만으로 신청 가능하다고 판단하지 않습니다. 현지 가격·조건이 다르면 구분하고, 기관 계약이 필요한 프로그램은 개인 신청과 구별합니다.
- 새 항목은 성격에 맞는 기존 섹션에 넣고, 맞는 섹션이 없을 때만 새 섹션을 추가합니다.
- **세 언어 파일을 항상 함께 갱신**하고, 내용을 변경했으면 각 파일의 `Last updated` 날짜도 오늘 날짜로 업데이트합니다.

## Maintenance Notes

- 학생 혜택 프로그램은 조건(크레딧 금액, 무료 기간, 요금제)이 자주 바뀌므로, 항목을 갱신할 때는 공식 페이지 기준으로 최신 정보를 확인한 후 반영합니다. 프로모션 정보 일괄 갱신은 `update-promotions` 스킬을 사용하세요. 매주 월요일에는 `.github/workflows/weekly-update.yml`이 Node.js 최신 24 LTS와 pi 에이전트(DeepSeek 모델 + 공식 Exa MCP)로 같은 작업을 수행해 PR을 엽니다. MCP 설정은 `.pi/mcp.json`, 조사 지시문은 `.github/prompts/weekly-research.md`, 편집 지시문은 `.github/prompts/weekly-update.md`입니다. `DEEPSEEK_API_KEY`와 `EXA_API_KEY`는 GitHub 저장소 Secrets로 제공합니다. 모델은 저장소 Variables의 `PI_MODEL`, 조사 추론 강도는 `PI_RESEARCH_THINKING`, 편집 추론 강도는 `PI_THINKING`으로 변경할 수 있습니다.
- 단축 URL `https://bit.ly/awesome-academy`가 이 저장소를 가리키므로 저장소 이름 변경에 주의하세요.
