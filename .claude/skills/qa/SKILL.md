---
name: qa
description: Run QA on a converted chapter — compare content.md against content.html and report violations of the Sindang template rules. Trigger when the user asks to "QA", "check", "validate", or "verify" a chapter, or asks whether a content.html matches its content.md. Supports category filters (content/figures/pages/boxes/structure).
---

# qa — Sindang textbook QA orchestrator

Runs the five sub-skills (`qa-text`, `qa-figures`, `qa-pages`, `qa-boxes`, `qa-structure`) against a chapter's `content.md` + `content.html` and consolidates the findings into one report.

## When to use

- "QA this chapter" / "check if the html matches the md" / "validate content.html"
- After running `md-to-html` to regenerate a chapter
- The user names a chapter directory and asks for verification

If the user does not specify a chapter, ask which directory to QA before proceeding.

## Inputs

- **Chapter dir**: `textbook/{subject}/{part}/{chapter}/`
- **Files read**: `content.md`, `content.html`, `figures/*` (for file-existence checks)
- **Reference**: `template/RULES_conversion.md`, `template/RULES_design.md`, `template/examples/sample.html` — re-read each run; rules evolve

## Optional args

- `<category>` — run only one sub-skill: `text`, `figures`, `pages`, `boxes`, or `structure`
- `<chapter-path>` — explicit chapter directory; else ask

## Procedure

1. **Re-read the rules.** `RULES_conversion.md`, `RULES_design.md`, and `examples/sample.html` (structure reference only).
2. **Read the target files.** `content.md` and `content.html` in full.
3. **Style parity pre-check (C0).** Extract the `<style>…</style>` block from both the target `content.html` and `template/examples/sample.html`. Compare byte-for-byte (after trimming leading/trailing whitespace on each line). If they differ, emit a **single Important finding** `C0 style-drift` with a brief diff summary (which selectors/rules differ). This single check covers *all* design-axis drift (palette, typography, new CSS rules like `ol1 > li { font-weight: 600 }`, table-layout, fig-cap weight, etc.). Do not enumerate each design rule separately.
4. **Run sub-skills in order** (or only the filtered one). Each sub-skill returns a list of findings with the schema below. Invoke them by loading their `SKILL.md` and following the procedure; do not spawn separate agents.
    - `qa-text` — C1, C2, C7, C8 (text integrity, whitespace, hl, ex)
    - `qa-figures` — C3, C18 (figure file resolution, caption syntax)
    - `qa-pages` — C4, C5, C10, C11, C19, C20 (page number, ol1 counter, first-page-only, bx-prob position, overflow, underfill)
    - `qa-boxes` — C6, C9, C12, C21 (rep-prob fields, section→variant mapping, tables in box, apply fields)
    - `qa-structure` — C13, C14, C15, C16, C22 (sec-h2 numbering, indent→ol level, ### absorption, figure caption wrap, expl-tag mapping)
5. **Consolidate** findings. Sort by severity (Critical → Important), then by check id.
6. **Emit the report** using the exact format in the "Report format" section below.
7. **If C0 fails**, suggest the author re-run `md-to-html` to refresh the `<style>` block from the current `sample.html`.

## Finding schema

Every sub-skill returns findings of this shape (conceptual, not JSON — LLM-readable):

```
id:        C1                          # check id
severity:  Critical | Important
category:  content | figures | pages | boxes | structure
title:     short name of the check      # e.g. "md↔html text roundtrip"
status:    ok | fail | warn
detail:    (only if not ok) 1-2 lines, include md line / html page refs when possible
```

## Report format

Print two tables (Critical first, then Important). One row per check. If a check has multiple findings, list them as sub-bullets in the Detail column.

```markdown
## QA Report — {chapter-path}

### 🔴 Critical

| ID | Category | Check | Status | Detail |
|---|---|---|---|---|
| C1 | content | md↔html text roundtrip | ✅ | — |
| C2 | content | whitespace preserved in blanks | ❌ | `content.md:42` 공백 10칸 → html 1칸 |
| C3 | figures | `<그림:>` 파일 해석 | ⚠️ | `figures/산화_환원.png` 누락 → `.fig-ph` fallback OK |
| ... | | | | |

### 🟡 Important

| ID | Category | Check | Status | Detail |
|---|---|---|---|---|
| ... | | | | |

### Summary
- Critical: X 통과 / Y 실패 / Z 경고
- Important: X 통과 / Y 실패 / Z 경고
- **Top 3 failures** (순서대로):
  1. …
  2. …
  3. …
```

Status icons: `✅` ok, `❌` fail, `⚠️` warn.

## Check catalog (authoritative list)

### 🔴 Critical (8)

| ID | Category | Check |
|---|---|---|
| C1 | content | md의 모든 플레인 텍스트가 html에 존재 (누락 없음, 임의 추가 없음) |
| C2 | content | 연속 공백(빈칸) 보존 — `(          )` 문자 수 일치 |
| C3 | figures | `<그림: TITLE>` → 파일 존재 시 `<img class="fig-img">`, 부재 시 `.fig-ph` + TITLE 표시 |
| C4 | pages | `.pn`이 `start_page_num`에서 시작, +1씩 연속 증가 |
| C23 | pages | `start_page_num`이 이전 챕터 마지막 `.pn` + 1과 일치 |
| C5 | pages | `ol1`이 페이지 넘어갈 때 `counter-reset: l1 N` 지정 |
| C6 | boxes | `# 대표 기출 문제` 필드 6개 (source/problem/bogi/figure/answer/explanation) 모두 매핑 |
| C7 | content | 인라인 `예)` 텍스트 없음 — 모두 `.ex` + `.ex-badge` |
| C8 | content | `**text**` → `<strong class="hl">` 누락 없음 |

### 🟡 Important (9)

| ID | Category | Check |
|---|---|---|
| C0 | style | `<style>` 블록이 `sample.html`과 byte-level 일치 (디자인 드리프트 감지) |
| C9 | boxes | `#` 섹션 → 박스 variant 매핑 (review/obj/exam/quiz/prob) |
| C10 | pages | 첫 페이지 전용 요소(chevron, chapter-title)가 2p+ 에 반복되지 않음 |
| C11 | pages | `.bx-prob`가 마지막 페이지 `.page-content`의 직접 자식 |
| C12 | boxes | `<box:>` 내부 테이블은 `.tbl-wrap` 래핑 없음 |
| C13 | structure | `##` 자동 번호(`.sec-num`)가 md 등장 순서와 일치 |
| C14 | structure | 들여쓰기(0/4/8 공백) → `ol2/ol3/ol4` 레벨 매핑 |
| C15 | structure | `###`이 독립 헤딩이 아니라 `ol1 > li`로 흡수됨 |
| C16 | structure | `<그림: T>caption</그림>` → `<figure class="fig">` + `<figcaption class="fig-cap">` |
| C19 | pages | 페이지 오버플로 — 콘텐츠 추정 높이 ≤ 267mm (A4 printable area) |
| C20 | pages | 페이지 언더필 — 하단 빈 공간 > 60mm인데 다음 페이지 첫 블록이 들어갈 수 있으면 경고 (마지막 페이지/박스 분할 예외) |
| C21 | boxes | `# 기출 문제로 응용하기` 필드 매핑 (`## N`→`.apply-num`, source/problem/bogi/figure/options/answer/explanation 모두 매핑, 별도 페이지) |
| C22 | structure | `[개념/시험/문제/선지 …]` 라벨 → `.expl-tag.t-{concept|exam|problem|options}` 클래스 매핑 |

## Cardinal rules

- **Report, don't fix.** QA only reports. Fixes belong to `md-to-html` or manual edits.
- **Don't re-derive the rules.** Read `RULES_*.md` and `sample.html` each run; if rules and sample disagree, sample wins.
- **Line/page references required.** Every failure must cite a md line number or html page number so the author can jump to it.
- **No false positives on intentional variation.** If a choice clearly follows `sample.html` precedent, mark `ok` even if it differs from a literal reading of RULES.
