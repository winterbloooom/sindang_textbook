---
name: qa-pages
description: QA sub-skill — verifies page-level correctness of a converted content.html. Checks `.pn` continuity from start_page_num, ol1 counter-reset across page breaks, first-page-only elements (chevron + chapter-title) not repeating, and `.bx-prob` pinned as direct child of the last `.page-content`. Invoked by the `qa` orchestrator; can also be run directly.
---

# qa-pages — page structure and continuity checks

## Scope

Page-level axis: pagination, counters, first-page elements, last-page pinning. Does not look at content of individual elements.

## Inputs

- Chapter's `content.md` (frontmatter `start_page_num`) and `content.html`
- `RULES_conversion.md` §11 (page split rules)
- `examples/sample.html` for structure reference

## Checks

### C4 — page number continuity (Critical)

- First `.pn` in html must equal `start_page_num` from frontmatter.
- Each subsequent `.pn` must equal previous + 1.
- Number of `.page` blocks must equal number of `.pn` elements.
- Report any gap, duplicate, or non-monotonic sequence with the page indices.

### C5 — `ol1` counter-reset across page breaks (Critical)

When an `ol1` list spans multiple `.page` blocks:

- Every `ol1` after the first page containing that list must carry `style="counter-reset: l1 N;"` where N = last-completed item number on the previous page.
- A continued `ol1` without `counter-reset` restarts numbering at 1 — fail.
- If only one `ol1` exists across all pages (no split), this check is `ok` (trivially).

### C10 — first-page-only elements not repeated (Important)

- `.chev-nav` must appear exactly once, on page 1.
- `.chapter-title` (and its `.sec-badge`) must appear exactly once, on page 1.
- Report any duplicate occurrences on page 2+.
- Also expected on page 1 if present in md: `.bx-review`, `.bx-obj`, `.bx-exam` — warn (not fail) if they fall on page 2+, since that may be an author-chosen page-break adjustment.

### C19 — page overflow (Important)

Each `.page-content` must fit within A4 printable area (**267mm** = 297 − 16 top − 14 bottom).

Estimate block heights using `sample.html` precedents:

| Block | Approx. height |
|---|---|
| `.chev-nav` | 8mm |
| `.chapter-title` | 14mm |
| `.bx-review` / `.bx-obj` / `.bx-exam` / `.bx-quiz` | 3mm header + 6mm per list item + 4mm padding |
| `.bx-ref` | 3mm header + (table rows × 8mm) + 4mm padding |
| `.sec-h2` | 12mm |
| `ol1 > li` (direct text only) | 6mm + 6mm per nested item |
| `<figure>` with `.fig-img` | image height + 5mm (caption) |
| `.fig-ph` | as specified in inline style `height` |
| `.tbl-wrap` table | 10mm header + 8mm per body row |
| `.bx-prob` | 40–60mm (header + problem + fig + expl) |

Sum the blocks per page; if a page estimate > 267mm by more than 5mm tolerance, flag it as **fail** with the over-by amount. If within tolerance (≤5mm over), mark **warn**.

### C20 — page underfill (Important)

If a page ends with **> 60mm of empty space** and the next page has content that could have fit (next-page first block's estimated height < remaining space), flag it as **warn**.

Exceptions (not a violation — mark `ok`):
- The last page of the chapter (bottom space reserved for `.bx-prob` pinning).
- A page ending just before `# 대표 기출 문제` — the split is often intentional.
- A page ending just before a `<box: ...>` or `.bx-ref` that would otherwise be split across pages.

Report the page index and the approximate empty height; the author can either move a block up or accept it.

### C11 — `.bx-prob` position (Important)

- `.bx-prob` must exist exactly once in the entire html (unless md has no `# 대표 기출 문제`).
- It must be a **direct child** of the last page's `.page-content` — not nested inside another box/div.
- The last page's `.page-content` must have `display: flex; flex-direction: column;` in the shared CSS (verify the style rule exists in `<style>`); if missing, the `margin-top: auto` bottom-pin won't work.

## Output

Standard finding schema. One finding per check id. In `detail`, cite page indices (e.g., "page 3", "pages 2→3 전환 지점") so the author can jump directly.

### C23 — start_page_num continuity across chapters (Critical)

Check that the current chapter's `start_page_num` is exactly one more than the last page number of the previous chapter.

**Algorithm:**

1. Read `start_page_num` from the current chapter's `content.md` frontmatter.
2. Determine the previous chapter:
   - The chapter directory is named `{N}-{title}` inside `{M}-{part}` inside `{K}-{subject}`.
   - Sort all `{N}-*` chapter directories in the same part by their numeric prefix; sort all `{M}-*` part directories similarly.
   - The previous chapter is the one with the highest sequence number that still comes before the current chapter — first look within the same part (N−1), then in the previous part (M−1, last chapter), then in the previous subject (K−1, last part, last chapter).
   - If there is no previous chapter (this is the very first chapter of the entire textbook), mark this check **ok** (no constraint to verify).
3. Read the previous chapter's `content.html` and find the value of the last `.pn` element (the highest printed page number in that file).
4. **Pass** if `start_page_num == last_pn + 1`.
5. **Fail** if they differ — report: `"이전 챕터 마지막 쪽 {last_pn} + 1 = {expected}, 현재 start_page_num = {actual}"`.
6. **Warn** if the previous chapter's `content.html` does not exist (cannot verify — emit a warning instead of failing so the author knows the check was skipped).

## Notes

- "Page index" here means the 1-based ordinal of the `.page` block in html (not the printed `.pn` value). Both are useful in the report — prefer `.pn` when unambiguous.
- Some chapters may intentionally omit the review/obj/exam boxes; absence is not a failure.
