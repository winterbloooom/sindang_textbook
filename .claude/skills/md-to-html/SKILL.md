---
name: md-to-html
description: Convert a textbook chapter's content.md into content.html using the Sindang template system (RULES_conversion.md + RULES_design.md + examples/sample.{md,html}). Trigger when the user asks to convert/render/build a chapter, or mentions a content.md / content.html pair under textbook/{subject}/{part}/{chapter}/.
---

# md-to-html — Sindang textbook converter

Convert `textbook/{subject}/{part}/{chapter}/content.md` into a print-ready `content.html` for the Sindang GED science textbook.

## When to use

Invoke this skill when the user asks to:
- "Convert content.md to html" / "render this chapter" / "build the page"
- Produce/refresh `content.html` for a chapter directory under `textbook/`
- Apply the Sindang template to a markdown source

If the user does not specify a chapter path, ask which chapter directory to convert before proceeding.

## Inputs

- **Source**: `textbook/{subject}/{part}/{chapter}/content.md` (authored markdown with frontmatter)
- **Template sources** (all authoritative — read them first every run, they change):
  - `template/RULES_conversion.md` — md → html mapping rules (structure, classes, field mappings)
  - `template/RULES_design.md` — visual styling rules (palette, typography, components, print constraints)
  - `template/examples/sample.md` and `template/examples/sample.html` — canonical before/after pair. The generated HTML must match `sample.html`'s structure, classes, and inline CSS token for token, substituting only the content.

## Output

- **Destination**: `textbook/{subject}/{part}/{chapter}/content.html` (overwrite if present)
- A single self-contained HTML file (inline `<style>`, Pretendard via CDN link). No external JS.
- One `.page` block per A4 page, with `.page-footer > .pn` showing the page number starting at `start_page_num` from frontmatter and incrementing by 1.

## Procedure

Follow these steps in order. Do not skip the template re-read — the template evolves.

1. **Re-read the template.** Read `RULES_conversion.md`, `RULES_design.md`, `examples/sample.md`, and `examples/sample.html` in full. Treat `sample.html` as the structural ground truth; if RULES and sample disagree, sample wins (it is the most recently tuned artifact). Note any new components since you last ran.

2. **Read the source.** Read the target `content.md` in full. Parse:
   - Frontmatter (`subject`, `part`, `chapter`, `start_page_num`)
   - Top-level `#` sections in authored order: `# 지난 시간 복습하기`, `# 학습목표`, `# 기출유형`, `# 이론`, `# 마무리 퀴즈`, `# 대표 기출 문제`
   - `## ...` sections inside `# 이론` (each becomes an auto-numbered `sec-h2`)
   - Nested bullet indentation (converts to `ol1`/`ol2`/`ol3`/`ol4`)
   - Special inline markers: `**bold**` → `<strong class="hl">`, `(예: ...)` and `예` blocks → `.ex` + `.ex-badge`, `<그림: TITLE>` → `.fig-ph`, `<box: TITLE>...</box>` → `.bx.bx-ref`

3. **Plan page breaks before emitting.** A4 content area ≈ 267mm tall (297 − 16 top − 14 bottom). Estimate block heights from `sample.html` precedents and split into `.page` blocks so nothing overflows. Keep:
   - First page: chevron nav + chapter-title + `bx-review` (if present) + `bx-obj` + `bx-exam`, then as much theory as fits
   - Last page: `bx-quiz` (if present) and `bx-prob` (if present). The `bx-prob` is pinned to the page bottom via `.page-content > .bx-prob { margin-top: auto; }` — already in the shared CSS. Do not add extra spacers.
   - Do not repeat chevron nav or chapter-title on pages 2+
   - When `ol1` continues across pages, use `<ol class="ol1" style="counter-reset: l1 N;">` where N is the last completed item number on the previous page

4. **Emit HTML.** Copy the `<head>` + `<style>` block verbatim from `sample.html` (do not re-derive the CSS). Then generate `.page` blocks in document order, substituting content. Preserve Korean whitespace exactly — blanks like `(          )` must round-trip unchanged (the `.quiz-list > li { white-space: pre-wrap }` rule handles display).

5. **Sanity check before writing.** Verify:
   - Every `<그림: ...>` in md became either `<img class="fig-img">` (file found in `figures/`) or `.fig-ph` with the title visible (file missing). Report the missing-file list in step 7.
   - Every `**text**` is `<strong class="hl">text</strong>`
   - No inline `예)` text — all `.ex` + `.ex-badge`
   - Frontmatter fields are consumed (`subject` → `.chev-subject`, `part` → `.chev-part`, `chapter` → `.sec-badge` + `.chapter-title`, `start_page_num` → first `.pn`)
   - Page numbers are contiguous and increase by 1
   - No content from md was dropped or paraphrased

6. **Write the output** to `{chapter}/content.html` using Write (not Edit — this is a full regeneration).

7. **Report briefly**: path written, page count, any md expressions you were unsure how to map.

## Cardinal rules

- **Do not invent text.** The rule "md에 없는 글자는 쓰지 않는다" is non-negotiable. Every character on the rendered page must originate from the md or the template's fixed labels ("학습 목표", "기출유형", "대표 기출 문제", "마무리 퀴즈", "지난 시간 복습하기", "답", "편", etc.).
- **Do not redesign.** If a component is missing from RULES/sample, ask the user rather than improvising new CSS. Small layout tweaks (width %, column widths inside tables) are fine when they follow patterns already present in `sample.html`.
- **Figures: resolve file first, fall back to placeholder.** For every `<그림: TITLE>`, look in the chapter's `figures/` directory for `{TITLE}.{png,jpg,jpeg,svg,webp}` (exact match, in that extension order; TITLE used verbatim — spaces, parens, underscores, Korean included). If a file exists, emit `<img class="fig-img" src="figures/{filename}" alt="{TITLE}">`. If not, emit the `.fig-ph` placeholder with TITLE as visible text. Same rule for the `figure` field of `# 대표 기출 문제`: the md already gives the path, so check it directly; existing → `<img class="fig-img">`, missing → `.fig-ph`. Never draw diagrams with CSS.
- **Figure captions.** Two syntaxes are supported:
    - `<그림: TITLE>` — bare; emit `.fig-img` or `.fig-ph` directly.
    - `<그림: TITLE>caption text</그림>` — wrap in `<figure class="fig">` with `<figcaption class="fig-cap">caption text</figcaption>` underneath. The caption may contain inline markdown (e.g. `**bold**` → `<strong class="hl">`).
- **Preserve whitespace in quiz/review items.** Authored blanks like `(          )` are intentional answer spaces.
- **Template re-read is mandatory each run** — the rules evolve continuously.

## Common pitfalls

- Forgetting `counter-reset: l1 N` when `ol1` continues on a new page → numbering restarts at 1
- Putting `bx-prob` anywhere other than as a direct child of the last page's `.page-content` — the `margin-top: auto` bottom-pin rule only fires under that selector
- Tables inside `<box: ...>` are **not** wrapped in `.tbl-wrap`; they sit directly under `.bx-body`
