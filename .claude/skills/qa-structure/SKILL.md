---
name: qa-structure
description: QA sub-skill — verifies structural conversion in a converted content.html. Checks `##` auto-numbering order, indent-to-ol-level mapping (0/4/8 spaces → ol2/ol3/ol4), that `###` is absorbed as `ol1 > li` rather than rendered as a heading, and that `<그림: T>caption</그림>` is wrapped in `<figure class="fig">`. Invoked by the `qa` orchestrator; can also be run directly.
---

# qa-structure — structural conversion checks

## Scope

Heading and list structure only. Does not verify text content (that's `qa-text`) or visual styling.

## Inputs

- Chapter's `content.md` and `content.html`
- `RULES_conversion.md` §§3–4, §7

## Checks

### C13 — `##` auto-numbering (Important)

- For every `##` heading in md (appearing under `# 이론`), there must be a corresponding `<div class="sec-h2"><span class="sec-num">N</span><h2>...</h2></div>` in html.
- N must equal the 1-based ordinal of that `##` in md order.
- Fail on skipped numbers, duplicated numbers, or out-of-order sec-num values.
- Verify the `<h2>` text matches the md heading text exactly.

### C14 — indent-to-ol-level mapping (Important)

Inside `# 이론` content, list indentation maps as:

| md indent (spaces before `-`) | Expected html list |
|---|---|
| 0 (directly under `###`) | `ol.ol2 > li` |
| 4 | `ol.ol3 > li` |
| 8 | `ol.ol4 > li` |

- Fail when a bullet at depth D lands in a list of the wrong `.olN` class.
- Warn if any bullet uses a non-4-multiple indent (e.g., 2 or 6 spaces) — likely an author typo.

### C15 — `###` absorbed into `ol1 > li` (Important)

- No `<h3>` element should exist in html body (except possibly inside `bx-ref` tables if semantically needed — usually there should be none at all under `# 이론`).
- For every `###` in md, there must be a corresponding `<li>` directly inside the nearest enclosing `<ol class="ol1">`, whose text starts with the `###` heading text.
- Fail on any `<h3>` under `# 이론` content, or missing `ol1 > li` mapping.

### C16 — captioned figure wrapping (Important)

Shared with `qa-figures` (C18), but checked here from the structural angle:

- For every `<그림: T>caption</그림>` in md, html must contain `<figure class="fig">` with exactly two children: the image/placeholder element and `<figcaption class="fig-cap">`.
- No bare `<img class="fig-img">` or `<div class="fig-ph">` for captioned sources at the top level of `.page-content` — they must sit inside the `<figure>`.
- Note: `qa-figures` covers the caption content. Here we only verify the wrapping shape.

### C22 — explanation tag `[label]` → `.expl-tag` class mapping (Important)

In every `explanation` item (under `# 대표 기출 문제` and `# 기출 문제로 응용하기`), a line starting with `[라벨]` must convert to `<span class="expl-tag t-{type}">라벨</span>` with the label text preserved and the correct modifier class applied.

| md label | expected class |
|---|---|
| `[개념 다시보기]` | `.expl-tag.t-concept` |
| `[시험 대비하기]` | `.expl-tag.t-exam` |
| `[문제 살펴보기]` | `.expl-tag.t-problem` |
| `[선지 살펴보기]` | `.expl-tag.t-options` |

- Fail: missing `.expl-tag` wrapping, wrong `t-*` class, or stale emoji hard-coded in the HTML text (emojis are CSS `::before` content — must not appear in the text node).
- `[정답]` inside a sub-bullet (option analysis) is **not** a tag — leave as plain text (don't wrap).
- Unknown `[...]` labels (e.g., author typos) → warn, not fail.

## Output

Standard finding schema. Include md line numbers for `##`/`###` findings so the author can locate them.

## Notes

- The `## ` under `# 이론` is the only h2 numbering source; top-level sections (학습목표 등) are boxes, not h2s.
- When `ol1` continues across pages, its `li` elements may appear split — use md as the source of truth for `###` count.
- If C16 and `qa-figures` C18 both fire on the same figure, report once in `qa-structure` and suppress the duplicate in `qa-figures`.
