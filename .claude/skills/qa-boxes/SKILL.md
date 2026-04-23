---
name: qa-boxes
description: QA sub-skill — verifies box-variant correctness in a converted content.html. Checks that top-level md sections map to the correct `.bx-*` variants, that `# 대표 기출 문제` fields (source/problem/bogi/figure/answer/explanation) are all mapped, and that tables inside `<box:>` are not wrapped in `.tbl-wrap`. Invoked by the `qa` orchestrator; can also be run directly.
---

# qa-boxes — box variant and field-mapping checks

## Scope

Box variants (`bx-review`, `bx-obj`, `bx-exam`, `bx-quiz`, `bx-prob`, `bx-ref`) and the `# 대표 기출 문제` field mapping. Does not verify page placement — that's `qa-pages`.

## Inputs

- Chapter's `content.md` and `content.html`
- `RULES_conversion.md` §2 (section→box mapping) and rep-prob field table
- `examples/sample.html` structure reference

## Checks

### C6 — `# 대표 기출 문제` field mapping (Critical)

For the single `# 대표 기출 문제` block in md, verify every field is consumed:

| md field | HTML target | Notes |
|---|---|---|
| `source` | `.rep-prob-src` inside `.bx-head` | right-aligned, grey, 500 weight |
| `problem` | `.rep-prob-q` | 13pt 600 weight |
| `bogi` | separate block under `.rep-prob-q` | if `null`/missing → block omitted (ok) |
| `figure` | `.rep-prob-fig` or `<img class="fig-img">` | file-resolved path |
| `answer` | `.rep-prob-ans` inside `.rep-prob-expl` | Mint circle + "답" + value |
| `explanation` | `.rep-prob-expl > ul > li` | bullet list |

- Fail on any missing mapping, stray literal "해설" label, or answer placed outside the combined `.rep-prob-expl` box.
- Fail if `bogi` has a value in md but the rendered block is absent.

### C9 — top-level section → box variant (Important)

Expected mapping:

| md `# 제목` | HTML class |
|---|---|
| 지난 시간 복습하기 | `.bx.bx-review` |
| 학습목표 | `.bx.bx-obj` |
| 기출유형 | `.bx.bx-exam` |
| 마무리 퀴즈 | `.bx.bx-quiz` |
| 대표 기출 문제 | `.bx.bx-prob` |
| 이론 | no box (plain sec-h2 flow; `# 이론` itself not rendered) |

- Inner list class expectations: `bx-review` → `ol.quiz-list`; `bx-obj` → `ul.obj-list` with `.obj-check`; `bx-exam` → `ul.exam-list`; `bx-quiz` → `ol.quiz-list`.
- Fail on wrong variant, missing inner list class, or `# 이론` rendered as a visible heading.

### C21 — `# 기출 문제로 응용하기` field mapping (Important)

For the `# 기출 문제로 응용하기` section (if present in md), verify:

- Renders on its **own `.page`** block, starting with `.apply-title` containing the literal text "기출 문제로 응용하기".
- Each `## N` becomes one `.apply-item` in md order. The `N` text appears inside `.apply-num`.
- Per-item field mapping:

| md field | HTML target | Notes |
|---|---|---|
| `source` | `.apply-src` | top of `.apply-left`, right-aligned |
| `problem` | `.apply-q` | inside `.apply-head` |
| `bogi` | optional block | `null`/missing → omitted |
| `figure` | `.apply-fig > img.fig-img` or `.fig-ph` | file resolution per §7 |
| `options` | `ol.apply-opts > li` (in order) | up to 4 items; circled numbers rendered via CSS `:nth-child` |
| `answer` | `.apply-ans-badge` (Coral circle "답") + text showing ①/②/③/④ + selected option | |
| `explanation` | `ul.apply-expl > li` | each `[label]` mapped per C22 |

- Fail on any field missing, wrong column side (left=problem, right=explanation), or if the section is not on its own page.
- Warn if `options` count ≠ 4 (format allows 2–4, but 4 is canonical).

### C12 — tables inside `<box:>` not wrapped in `.tbl-wrap` (Important)

- For every `<box: TITLE>` block in md containing a table, its html counterpart must have the `<table>` as a direct child of `.bx-body` (or immediately inside, without `.tbl-wrap`).
- Standalone md tables (outside any box) must be wrapped in `.tbl-wrap`.
- Fail on either direction mismatch.

## Output

Standard finding schema. For C6, list missing/misplaced fields as bullets in `detail`.

## Notes

- `<int_quiz: TITLE>` currently renders as `.bx-ref` — treat it as valid under C9 (it's not in the top-level section list; only appears inside `# 이론`).
- `bx-ref`'s `.callout-note` (text after a table inside the box) is optional and not checked here.
