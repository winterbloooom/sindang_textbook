# 신당 — 검정고시 과학 교재

성인 학습자를 위한 고졸 검정고시 과학 교재 제작 프로젝트.  
이론과 기출 문제를 한 장(章)에 묶어 A4 인쇄를 전제로 제작한다.

---

## 디렉터리 구조

```
sindang_book/
├── assets/
│   ├── curriculum/        # TOC 초안(.md/.csv) + questions.json (마스터 문제은행) + 참고 PDF
│   └── prob_ans/          # 기출 PDF (문제·정답, 18-1 ~ 26-1)
├── docs/                  # 개발 이력 및 계획 문서
│   ├── 260423-v1_md_to_html.md   # v1: MD → HTML 변환 방식 (운영 중, 개선 예정)
│   └── 260423-v2_editor_plan.md  # v2: 웹 WYSIWYG 에디터 계획
├── editor/                # v2 에디터 (Vite + React + TipTap)
├── src/
│   └── extract_questions.py      # PDF → questions.json 추출 스크립트
├── template/
│   ├── RULES_conversion.md       # MD → HTML 변환 규칙
│   ├── RULES_design.md           # 시각 스타일 규칙 (팔레트·타이포·컴포넌트)
│   └── examples/                 # sample.md + sample.html 레퍼런스 쌍
└── textbook/              # 과목 → 편 → 장 구조
    └── {N-과목}/{N-편}/{N-장}/
        ├── content.md     # 교재 원고 (마크다운)
        ├── content.html   # 변환된 스타일 페이지
        ├── content.pdf    # 인쇄용 PDF
        ├── figures/       # 본문 삽입 이미지
        └── probs/
            ├── questions.json     # 이 장에 분류된 기출 문제
            └── {YY-R-N}.jpg       # 문제별 그림 (있는 경우)
```

### 교재 과목 구성

| 디렉터리 | 과목 | 편 수 |
|---|---|---|
| `1-화학` | 화학 | 4편 (원소와 주기성, 화학 결합, 화학 변화, 신소재의 활용) |
| `2-생명과학` | 생명과학 | — |
| `3-지구과학` | 지구과학 | — |
| `4-물리` | 물리 | — |
| `부록` | 부록 | — |

---

## 제작 방식

### v1 — MD → HTML 변환 (현행)

작성자가 `content.md`에 교재 내용을 쓰면, Claude Code가 `template/RULES_conversion.md`와 `template/RULES_design.md`에 따라 `content.html`로 변환한다.

- **장점**: 작성은 마크다운으로 가볍게, HTML은 부산물로 얻어짐
- **한계**:
  1. 페이지 나눔·박스 경계 등 판단 영역이 남아 재변환 루프 발생
  2. 변환 1회당 토큰 비용이 큼 (규칙 문서·예시까지 매번 포함)
  3. 사소한 수정도 Claude Code 호출 필요

자세한 내용: [`docs/260423-v1_md_to_html.md`](docs/260423-v1_md_to_html.md)

---

### v2 — 웹 WYSIWYG 에디터 (계획 중)

변환 단계를 없애고 **작성=편집=최종 형태**가 되는 에디터. 노션처럼 쓰고, 결과가 곧 A4 인쇄 페이지다.

| 항목 | 결정 |
|---|---|
| 에디터 코어 | TipTap (ProseMirror 기반) |
| 프레임워크 | Vite + React |
| 저장 포맷 | 장별 JSON 블록 트리 |
| 저장 방식 | 실시간 자동 저장 (File System Access API) |
| 지원 브라우저 | 크롬 전용 |
| 수식 | KaTeX (`$...$` / `$$...$$`) |
| PDF export | 브라우저 print → PDF |

**로드맵**: Phase 0(프로토타입) → 그림·수식 → 표 → 배치·페이지 → 섹션 레이아웃 → Export

자세한 내용: [`docs/260423-v2_editor_plan.md`](docs/260423-v2_editor_plan.md)

#### 실행 방법

처음 1회 (의존성 설치):

```bash
cd editor
npm install
```

개발 서버 실행:

```bash
cd editor
npm run dev
```

브라우저에서 http://localhost:5173/ 열어 사용. 변경사항은 HMR로 즉시 반영됨.

**작업 폴더 연결**: 사이드바의 "폴더 열기"로 장 디렉터리(`textbook/{과목}/{편}/{장}/`)를 선택하면 `chapter.json`이 자동 저장되고, 드롭한 이미지는 `figures/`에 저장됨.

**필요 환경**: Node.js (Homebrew: `brew install node`), 크롬 브라우저 (File System Access API).

빌드 / 미리보기:

```bash
cd editor
npm run build      # dist/에 정적 빌드
npm run preview    # 빌드 결과 로컬 확인
```

---

## 핵심 원칙

- **성인 학습자 최우선**: 최소 13pt 서체, 인쇄 안전 색상, 명확한 레이아웃
- **인쇄 우선(A4)**: 어두운 배경·그라디언트·그림자 사용 불가
- **일관된 템플릿**: 편/장/절 구분은 한국어 표기만 사용

---

## 문제 은행

- 마스터: `assets/curriculum/questions.json` (425문항, `src/extract_questions.py`로 추출)
- 각 장별 분류본: `textbook/.../probs/questions.json`
- 미분류 문제: `textbook/{N-과목}/0-미분류/probs/`
