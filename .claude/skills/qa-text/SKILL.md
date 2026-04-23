---
name: qa-text
description: QA sub-skill — verifies text-level integrity between a converted content.html and its source content.md. Checks md↔html text roundtrip, whitespace preservation in blanks, **bold**→.hl mapping, and forbids inline 예). Invoked by the `qa` orchestrator; can also be run directly.
---

# qa-text — text integrity checks

## Scope

Text/content axis only. Does **not** check figures, pages, boxes, or structural classes.

## Inputs

- Chapter's `content.md` and `content.html`
- `template/RULES_conversion.md` for authoritative inline-marker mappings

## Checks

### C1 — md↔html text roundtrip (Critical)

For every plain-text fragment in md (excluding frontmatter, `<그림: …>`, `<box: …>`, `<int_quiz: …>`, and markdown control chars `*`, `-`, `#`, `|`), confirm the exact substring appears in rendered html body text. Then verify the reverse direction.

- Allowed html-only text: fixed template labels ("학습 목표", "기출유형", "대표 기출 문제", "마무리 퀴즈", "지난 시간 복습하기", "답", "편"), and auto-generated counters (`.sec-num`, `.quiz-list` numbers, `ol1–4` markers).
- `(예: X)` in md renders as `X` only (the prefix is stripped) — this is not a violation.
- Report missing / invented text with md line number or html page number.

### C2 — whitespace preserved in blanks (Critical)

Find every run of ≥3 consecutive spaces in md (usually inside parentheses: `(   +)`). Confirm the same run exists in html with identical character count.

- Most common location: `# 지난 시간 복습하기` and `# 마무리 퀴즈`.
- Collapse example: md `(          )` (10 spaces) → html `( )` (1 space) — fail.

### C7 — inline `예)` forbidden (Critical)

Scan html body text for the literal `예)` or `예 )` outside `.ex-badge`. Any occurrence is a failure.

- Additionally: count of `.ex-badge` in html ≥ count of `예` blocks + `(예:` phrases in md.

### C8 — `**bold**` → `<strong class="hl">` (Critical)

- Count `**…**` pairs in md and `<strong class="hl">…</strong>` elements in html. Must match.
- For each pair, verify the wrapped text is identical (whitespace included).
- Flag any `<strong>` without the `hl` class.

## Output

Return findings in the shared schema (see `qa/SKILL.md → Finding schema`). Each check emits exactly one finding (status: ok / fail / warn). If multiple sub-issues found under one check, aggregate them into `detail` as bullets.

## Notes

- Comments `<!-- ... -->` are not visible text.
- `chapter` frontmatter value *does* appear visibly in `.chapter-title` + `.sec-badge-body`; count that as valid.
- When comparing, normalize HTML entities (`&amp;` → `&`, `&lt;` → `<`, etc.) and strip tags before substring match — but **do not** normalize whitespace for C2.
