---
name: qa-figures
description: QA sub-skill — verifies figure handling in a converted content.html. Checks that every `<그림: TITLE>` in content.md either resolved to an `<img class="fig-img">` (file exists) or fell back to `.fig-ph` with TITLE visible, and that caption syntax `<그림: T>caption</그림>` produced `<figure class="fig">` + `<figcaption class="fig-cap">`. Invoked by the `qa` orchestrator; can also be run directly.
---

# qa-figures — figure resolution and caption checks

## Scope

Figure/image axis only. Does not check surrounding text or page layout.

## Inputs

- Chapter's `content.md`, `content.html`, and `figures/` directory listing
- `RULES_conversion.md` §7 for the file-resolution rules and caption syntax
- For `# 대표 기출 문제`, the md's `figure:` field path (already explicit)

## Checks

### C3 — `<그림: TITLE>` file resolution (Critical)

For every `<그림: TITLE>` (bare or with caption) in md:

1. Look up `figures/{TITLE}.{png,jpg,jpeg,svg,webp}` in that order. TITLE used verbatim (spaces, parens, Korean included).
2. Expected html rendering:
    - **File exists** → `<img class="fig-img" src="figures/{filename}" alt="{TITLE}">`
    - **File missing** → `<div class="fig-ph">...{TITLE}...</div>` with TITLE visible as text
3. Also check `# 대표 기출 문제`'s `figure:` field — file exists → `<img>`, missing → `.fig-ph` with the filename shown.

Report:
- **fail**: file exists but html shows `.fig-ph` (or vice versa), or TITLE missing from fallback text, or file extension ≠ the one picked up.
- **warn**: file missing (legit `.fig-ph` fallback) — list the missing filenames so the author can add them.

### C18 — caption syntax wrapping (Important)

For every `<그림: TITLE>caption text</그림>` in md (captioned form):

- Html must wrap in `<figure class="fig">` containing the image/placeholder **and** `<figcaption class="fig-cap">caption text</figcaption>` below it.
- Inline markdown in caption (`**bold**`) must still convert to `<strong class="hl">`.
- Bare `<그림: TITLE>` (no caption) must **not** be wrapped in `<figure>` unless part of a table cell pattern.

Report:
- **fail**: captioned md without `<figure>` / `<figcaption>` wrapping, or caption text mismatch, or `<figure>` wrapping around a bare form.

## Output

Standard finding schema. One finding per check id. In `detail`, for C3 list missing files as bullets so the author can batch-create them.

## Notes

- Inside table cells, `<그림: T>` uses the same resolution rule. `.fig-img` is bounded by the cell height (CSS `max-height: 26mm`); `.fig-ph` fills the cell.
- If the html uses `<img class="cell-img">` (table-cell image variant present in some chapters), treat as valid equivalent of `.fig-img` inside a `<td>`.
