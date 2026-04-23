# Sindang — GED Science Textbook for Adult Learners

## Project Overview

A **high school equivalency exam (GED) science textbook** for adult learners who lack formal secondary education (including elderly adults and people with disabilities). Print-first (A4), theory paired with past-exam practice problems, unified template and design system for a coherent experience.

### Core Principles
- Design for adult learners with diverse backgrounds and paces
- Accessibility and clarity first (min 13pt font, print-safe colors)
- Minimize confusion through consistent templates

## Directory Structure

```
sindang_book/
├── assets/
│   ├── curriculum/        # TOC sources (.md/.csv) + questions.json (master bank) + reference PDF
│   └── prob_ans/          # Past exam PDFs (problems + answers, 18-1 ~ 26-1)
├── src/
│   └── extract_questions.py  # PDF → questions.json extraction
├── template/
│   ├── RULES_conversion.md   # MD → HTML mapping rules
│   ├── RULES_design.md       # Visual styling rules (palette, typography, components — authoritative)
│   └── examples/          # sample.md + sample.html reference pair
├── textbook/              # Authored content + problem bank, organized by 과목/편/장
│   └── {N-과목}/{N-편}/{N-장}/
│       ├── content.md     # lesson source (authored markdown)
│       ├── content.html   # styled textbook page (converted from content.md)
│       ├── content.pdf    # print-ready export of content.html
│       ├── figures/        # images embedded in content.{md,html,pdf}
│       └── probs/
│           ├── questions.json           # past-exam questions for this chapter
│           └── {YY-R-N}.jpg             # figure for question YY-R-N (optional)
├── CLAUDE.md
└── memo.txt               # Personal notes — reference only, do not modify
```

## Key Work Areas

1. **template/** — Template rules and reference examples
   - `RULES_design.md`: visual styling rules — print constraints, palette, typography, components (authoritative)
   - `RULES_conversion.md`: how `content.md` frontmatter + markdown maps to HTML classes
   - `examples/sample.{md,html}`: canonical before/after pair — match these when generating new pages

2. **textbook/** — One directory per chapter (장), containing both lesson and problem bank
   - Path: `{N-과목}/{N-편}/{N-장}/` (e.g. `1-화학/1-원소와_주기성/1-원소와_주기율표/`)
   - Directory names use `N-제목` format; spaces in titles replaced with `_`
   - Files per chapter:
     - `content.md` — authored lesson source
     - `content.html` — styled page converted via `template/RULES_conversion.md`
     - `content.pdf` — print export of `content.html`
     - `figures/` — images embedded in `content.{md,html,pdf}` (lesson figures, not exam figures)
     - `probs/questions.json` — past-exam questions classified into this chapter (subset of `assets/curriculum/questions.json`)
     - `probs/{YY-R-N}.jpg` — figure image for questions with `has_figure: true` (e.g. `18-1-3.jpg`)
   - Unclassified questions live under `{N-과목}/0-미분류/probs/` (no chapter subdir)

3. **assets/** — Source material
   - `curriculum/`: TOC drafts (dated `YYMMDD_N_...`)
   - `prob_ans/`: past exam PDFs, named `{회차}-{1=prob|2=ans}.pdf` (actually `{YY}-{N}_{prob|ans}.pdf`)
   - `curriculum/questions.json`: master question bank (425 items) with `subject`/`part`/`chapter` classification, produced by `src/extract_questions.py`. Per-chapter subsets live in `textbook/.../probs/questions.json`.

## Conventions

- **Korean labels only** in navigation (편/장/절) — no "PART"/"CHAPTER".
- **Print-first**: A4, min 13pt, no dark backgrounds, no gradients/shadows. See `template/RULES_design.md` §1.
- **Dated files**: `YYMMDD_N_...` (e.g. `260412_1_curriculum_toc.md`) — newer files supersede older.
- `memo.txt` is personal scratch — read only if needed, never edit.
