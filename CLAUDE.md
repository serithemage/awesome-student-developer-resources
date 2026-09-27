# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

학생 개발자를 위한 할인·무료 프로그램을 모은 **awesome 리스트 저장소**입니다. AI·바이브 코딩 도구가 중심이며, 일반 개발 도구는 하단에 배치합니다. 빌드 시스템·테스트·린트가 없는 문서 전용 저장소이며, 콘텐츠는 3개 언어 파일로 제공됩니다:

- `README.md` — 영어(기본)
- `README.ko.md` — 한국어
- `README.ja.md` — 일본어

## Content Structure & Conventions

세 파일은 동일한 구조를 가집니다: 제목 → 언어 스위처 → `Last updated` 날짜 → 목차(TOC) → 범례 → 콘텐츠 섹션 8개(Vibe Coding & AI App Builders / AI Coding Tools / AI Assistants & Education Plans / Developer Tools / Cloud / Collaboration / Design / Productivity — AI 섹션이 항상 상단) → Contributing.

항목 추가·수정 시 규칙:

- 형식: `- 🎓 [프로그램명](URL) - 설명` — 학생·교육기관 인증이 필요하면 🎓, 누구나 무료면 🆓.
- 설명에는 혜택의 구체적 내용(무료/할인율, 크레딧 금액, 기간)과 자격·인증 방법을 포함합니다.
- 제품명·서비스명은 원문을 유지하고, 설명은 각 언어의 자연스러운 문체로 작성합니다(기계 번역 톤 배제).
- 새 항목은 성격에 맞는 기존 섹션에 넣고, 맞는 섹션이 없을 때만 새 섹션을 추가합니다.
- **세 언어 파일을 항상 함께 갱신**하고, 내용을 변경했으면 각 파일의 `Last updated` 날짜도 오늘 날짜로 업데이트합니다.

## Maintenance Notes

- 학생 혜택 프로그램은 조건(크레딧 금액, 무료 기간, 요금제)이 자주 바뀌므로, 항목을 갱신할 때는 공식 페이지 기준으로 최신 정보를 확인한 후 반영합니다. 프로모션 정보 일괄 갱신은 `update-promotions` 스킬을 사용하세요. 매주 월요일에는 `.github/workflows/weekly-update.yml`이 pi 에이전트(DeepSeek 모델 + Exa 검색)로 같은 작업을 수행해 PR을 엽니다. 에이전트 지시문은 `.github/prompts/weekly-update.md`입니다.
- 단축 URL `https://bit.ly/awesome-academy`가 이 저장소를 가리키므로 저장소 이름 변경에 주의하세요.
