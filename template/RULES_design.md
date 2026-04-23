# 디자인 규칙 (Design Rules)

이 문서는 교과서의 **시각적 스타일링 규칙**을 정의한다. "무엇이 어떻게 보여야 하는가"에 대한 규칙이다.

---

## 1. 인쇄 제약 (Print-First)

| 항목 | 규칙 |
|---|---|
| 용지 | A4 (210mm × 297mm), `@page { size: A4; margin: 0; }` |
| 여백 | 위 16mm, 좌우 20mm, 아래 14mm |
| 최소 글자 크기 | **13pt** (모든 곳). 예외: badge/hero-badge만 11pt 허용 |
| 배경색 제한 | 어두운/검은 배경 금지. 최대 Gray 100 (`#F3F4F6`)까지만 |
| 그라디언트/패턴 | 금지. 단색 배경만 사용 |
| 그림자 | 금지. 깊이는 테두리와 배경색 대비로만 표현 |

## 2. 색상 팔레트

### Primary — Mint Green
| 토큰 | 코드 | 용도 |
|---|---|---|
| Mint 600 | `#0D9373` | 절 번호 아이콘, h2 번호, 학습목표 불릿 |
| Mint 700 | `#086B54` | 학습목표 라벨 텍스트 |
| Mint Light | `#E6F7F2` | (미사용 — 키워드 하이라이트 폐지됨) |

### Semantic Accents — 콘텐츠 유형별 1:1 매핑

| 유형 | 600 (아이콘/보더) | 800 (라벨) | Light (배경) |
|---|---|---|---|
| 예시 (Amber) | `#D97706` | `#92400E` | `#FEF3C7` |
| 보충 정보 (Blue) | `#2563EB` | `#1E40AF` | `#EFF6FF` |
| 핵심 개념 (Purple) | `#7C3AED` | `#5B21B6` | `#F5F3FF` |
| 주의 (Coral) | `#DC2626` | `#991B1B` | `rgba(220,38,38,0.15)` |

### Neutrals
| 토큰 | 코드 | 용도 |
|---|---|---|
| White | `#FFFFFF` | 페이지 배경, 카드 배경 |
| Gray 50 | `#F9FAFB` | 표면 배경 |
| Gray 100 | `#F3F4F6` | 테이블 헤더 |
| Gray 200 | `#E5E7EB` | 기본 테두리 |
| Gray 300 | `#D1D5DB` | 강조 테두리, 구분선 |
| Gray 400 | `#9CA3AF` | 캡션, 쪽번호 |
| Black | `#000000` | 본문 텍스트, 제목 (인쇄용으로 순수 검정) |

## 2a. 줄바꿈 (한글 어절 단위)

`body`에 `word-break: keep-all; overflow-wrap: break-word;`를 적용한다. 이 조합은 한글을 **어절(띄어쓰기) 단위**로 줄바꿈하여, 한 단어가 두 줄로 쪼개지는 현상("고르시/오")을 방지한다. 매우 긴 영문/URL은 `overflow-wrap`으로 대응한다.

## 3. 타이포그래피

- **서체**: Pretendard Variable 단일 서체
- **위계**: 크기와 굵기로만 구분 (서체 변경 없음)

| 역할 | 크기 | 굵기 | 용도 |
|---|---|---|---|
| h1 (절 제목) | 24pt | 700 | 페이지 최상단, 절당 1개 |
| h2 (섹션 제목) | 18pt | 700 | 번호 아이콘 동반 |
| h3 / sub | 14pt | 600 | mint 세로 바(3px) 동반 |
| 본문 | 13pt | 400 | 기본 읽기 텍스트 |
| 본문 강조 | 13pt | 700 | 색 + 굵게 + 밑줄 |
| badge | 11pt | 600–700 | 네비게이터 라벨 |

## 4. 컴포넌트 스타일

### 단원 네비게이터 (chevron strip)
- 첫 페이지에만 표시
- 과목(`subject`) → 편(`part`) 순서로 화살표 형태 연결
- 과목: Mint 600 배경 흰 글씨 (좌측 둥근 모서리 5px)
- 편: 흰 배경 + Mint 600 테두리(1.5px) + Mint 700 글씨(700 굵기). 마지막 항목이므로 우측 둥근 모서리 5px, 뒤 화살표 없음
- 항목 간 화살표-텍스트 간격: 후속 칩의 `padding-left`를 10mm로 두어 화살표 끝과 텍스트 사이에 충분한 여백 확보

### 장 제목 (chapter-title)
- 장 번호 오각형 배지(Mint 600) + 장 이름 한 줄
- 하단 구분선: 1.5px solid Gray 300

### 통합 박스 (bx)
모든 박스 공통: border-radius 6px, overflow hidden, 헤더 padding 1mm 4mm

헤더에는 아이콘을 두지 않는다 (`.bx-head::before`는 `display: none`). 구분은 테두리/배경 색으로만.

| 변형 | 테두리 | 헤더 배경 |
|---|---|---|
| 지난 시간 복습하기 (bx-review) | Blue 600 | rgba(37,99,235,0.15) (헤더 텍스트 Blue 900 `#1E3A8A`) |
| 학습목표 (bx-obj) | Mint 600 | rgba(8,107,84,0.15) |
| 기출유형 (bx-exam) | Coral 600 | rgba(220,38,38,0.12) |
| 대표 기출 문제 (bx-prob) | Coral 600 | rgba(220,38,38,0.12) |
| 참고/비교 (bx-ref) | Gray 400 | Gray 200 |
| 마무리 퀴즈 (bx-quiz) | Mint 600 | rgba(8,107,84,0.15) (내부 `.quiz-list` 번호 원형은 Mint 600) |

### h2 섹션 제목
- Mint 600 배경 정사각형(8mm) 안에 흰 숫자
- 제목 텍스트: 18pt, 700
- 하단 구분선: 1.5px solid Gray 300

### 개조식 목록 (ol1–ol4)
```
1.   (ol1) — 최상위: 정의, 주요 개념
  1)   (ol2) — 2단계: 속성, 세부사항
    (1)   (ol3) — 3단계: 부연설명
      ①   (ol4) — 4단계: 구체적 예시
```
- 각 수준별 독립 카운터 (l1, l2, l3, l4)
- 수준 간 들여쓰기: margin-left 3mm (ol2, ol3, ol4)
- `position: absolute` on `::before` (text-indent 방식 금지)

### 대표 기출 문제 (.bx-prob + .rep-prob)
장의 **마지막 페이지 하단에 밀착 정렬**되는 과거 기출문제 1개 박스. `bx-exam`과 동일한 Coral 톤이지만 별도 박스 변형.

- 배치 규칙: `.page-content`를 `display:flex; flex-direction:column`으로 설정하고, `.page-content > .bx-prob`에 `margin-top:auto`를 적용해 페이지 하단에 고정한다. 이 규칙은 장의 마지막 페이지에만 적용된다.
- 헤더(`.bx-head`): "대표 기출 문제" 제목 + 우측 정렬(`margin-left:auto`) 출처 텍스트(`.rep-prob-src`, Gray 400, 500 굵기)
- 문제(`.rep-prob-q`): 13pt, 600 굵기
- 그림(`.rep-prob-fig`): 고정 높이 30mm의 점선 테두리(Gray 300) + Gray 50 배경 빈 박스. 실제 이미지는 인쇄 후 부착
- 해설 박스(`.rep-prob-expl`): Gray 50 배경 + 좌측 Gray 300 세로 바(2.5px). **정답과 해설을 통합한 단일 박스**.
    - 상단: `.rep-prob-ans` — Mint 600 **원형 배지(5mm)** 안에 흰색 "답" 글자 + 답 값. 예시 배지(`.ex-badge`)와 동일 형태, 색만 Mint
    - 하단: 해설 불릿 리스트 (`-` 불릿). 별도의 "해설" 라벨 텍스트나 구분선은 쓰지 않는다
- `bogi`가 `null`이면 보기 블록 자체를 생략

### 그림 플레이스홀더 (.fig-ph)
md의 `<그림: TITLE>` 표현을 변환한 자리에 들어가는 시각적 플레이스홀더.

- 테두리: 1px dashed Gray 300
- 배경: Gray 50
- 텍스트: TITLE (Gray 400, 11pt, 500 굵기, 중앙 정렬) + 앞에 🖼 아이콘(opacity 0.6)
- 모서리: border-radius 4px
- 표 셀 안: 셀에 `height` + `padding:2mm`을 지정하고 플레이스홀더가 셀을 채움
- 표 밖 단독 사용: `height`를 인라인으로 지정(본문 내 그림 ≥ 30mm 권장)

### 기출 문제로 응용하기 (apply page)

`# 기출 문제로 응용하기`는 별도 페이지에 2단 그리드로 문제를 배치한다.

- **타이틀** `.apply-title`: 20pt 700, Gray 900, 하단 1.5px Gray 300 구분선
- **문제 항목** `.apply-item`: `grid-template-columns: 1fr 1fr`, `gap: 11mm`, 상하 `padding: 12mm 0` (문제 간 총 24mm). 문제 사이는 1.2px Gray 300 실선 (마지막 제외)
- **세로 구분선**: `.apply-right`에 `border-left: 1px dashed Gray 300` + `padding-left: 5.5mm; margin-left: -5.5mm` → gap 정중앙에 점선
- **문제 번호** `.apply-num`: 18pt **800**, Coral 600
- **문제 본문** `.apply-q`: 13pt 600
- **출처** `.apply-src`: 10.5pt Gray 400, 문제 영역 상단에 오른쪽 정렬 (별도 줄)
- **선지** `.apply-opts`: list-style none + `:nth-child(N)::before`로 ①②③④ 자동 부여, 선지 간격 `gap: 1mm`
- **답 배지** `.apply-ans-badge`: Coral 600 원형 6.5mm, 흰 "답" 글자 12pt 700
- **해설 리스트** `.apply-expl`: 상위 `> li`에는 불릿 없음(`.expl-tag` 태그가 항목 구분자 역할), 항목 간 `margin-bottom: 4mm`. 중첩 `ul > li`에만 `–` 불릿
- **해설 태그** `.expl-tag`: `display: block`, 12pt 700 Gray 900, `::before`로 이모지 자동 삽입
    - `.t-concept::before { content: "📚" }` — 개념 다시보기
    - `.t-exam::before    { content: "🎯" }` — 시험 대비하기
    - `.t-problem::before { content: "🔍" }` — 문제 살펴보기
    - `.t-options::before { content: "✅" }` — 선지 살펴보기

### 예시 배지 (.ex)
- Amber 600 원형(5mm) 안에 흰색 '예'
- 인라인 `예)` 텍스트 금지, 항상 `.ex` + `.ex-badge` 사용

### 데이터 테이블
- 헤더: Gray 200 배경, 700 굵기, **전 셀 가운데 정렬** (첫 열 헤더도 포함)
- 상단/하단 규칙: 2px solid Gray 300
- 세로 구분: 1.5px solid Gray 300
- 첫 열 (본문): 600 굵기, 좌측 정렬
- **열 너비**: `table-layout: fixed`로 기본적으로 모든 열을 동일 너비로 분배한다. 첫 열이 구분/헤더 역할이면 해당 열에만 인라인 `width`로 예외 지정 (나머지 열은 자동으로 균등 분배)

### 개조식 목록 상위 항목 강조
`ol1`의 최상위 항목(`.ol1 > li`의 직접 텍스트 = "2. 원자 모형" 같은 레이블)은 **600 굵기**로 굵게 표시한다. 중첩된 `ol2`/`ol3`/`ol4` 내부는 400 굵기로 복구한다. 최상위 뭉텅이 간 시각적 구분을 위해 `.ol1 > li`에 `margin-bottom: 3mm`을 준다 (마지막 항목 제외).

### 그림 캡션 (.fig-cap)
본문과 동일한 **400 굵기**를 사용한다. 색은 Gray 600 (#4B5563), 크기 11pt, 가운데 정렬.

### 강조 표시 (.hl)
- 색: Coral 600 (`#DC2626`)
- 굵기: 700
- 밑줄: underline, offset 1.5px

### 쪽번호
- 페이지 하단 중앙, 숫자만 (책 제목이나 과목명 없음)
- Gray 400, 13pt, 600 굵기
- 상단 구분선: 1.5px solid Gray 300

## 5. 레이아웃

- 단일 열 레이아웃 (다단 금지)
- 컴포넌트 간 간격: 3~7mm
- 섹션 간 간격: 7mm (h2 margin-top)
- border-radius 기본값: 12px
