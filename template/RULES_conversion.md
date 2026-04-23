# MD → HTML 변환 규칙 (Conversion Rules)

이 문서는 content.md 파일을 HTML로 변환할 때의 **매핑 규칙**을 정의한다.

---

## 0. 요소 이름 매핑 (Quick Reference)

| MD 표현 | HTML 클래스/요소 | 설명 |
|---|---|---|
| frontmatter `subject`, `part` | `.chev-nav` > `.chev-subject`, `.chev-part` | 단원 네비게이터 (과목 → 편) |
| frontmatter `chapter` | `.sec-badge` + `.chapter-title` | 장 번호 오각형 배지 + 장 제목 (h1) |
| `# 지난 시간 복습하기` | `.bx.bx-review` > `.quiz-list` | Blue 박스. 첫 페이지 학습목표 앞에 배치 |
| `# 학습목표` | `.bx.bx-obj` | 학습목표 박스 |
| 학습목표 항목 | `.obj-list` > `li` + `.obj-check` | Mint 600 원형 불릿 리스트 |
| `# 기출유형` | `.bx.bx-exam` | 기출유형 박스 (유형 리스트만) |
| 기출유형 항목 | `.exam-list` > `li` | 기출유형 유형 리스트 |
| `# 마무리 퀴즈` | `.bx.bx-quiz` > `.quiz-list` | Purple 박스. 번호 원형 배지로 문항 나열 |
| `# 대표 기출 문제` | `.bx.bx-prob` > `.rep-prob` | 이론 마지막 페이지 하단 밀착. `# 기출 문제로 응용하기` 직전 |
| `# 기출 문제로 응용하기` | `.apply-title` + `.apply-item` × N | 별도 페이지. 2단 그리드(문제/해설) |
| `[개념/시험/문제/선지…]` | `.expl-tag.t-{concept|exam|problem|options}` | 해설 항목 선두 라벨 → 이모지 + 굵은 텍스트 |
| `# 이론` | (출력 없음) | 이하 plain 처리 |
| `##` | `.sec-h2` > `.sec-num` + `<h2>` | 섹션 제목 + 번호 아이콘 |
| `###` | `.ol1 > li` | 개조식 1수준 항목으로 통합 |
| `- ` (1단계) | `.ol2 > li` | 개조식 2수준 |
| `    - ` (2단계) | `.ol3 > li` | 개조식 3수준 |
| `        - ` (3단계) | `.ol4 > li` | 개조식 4수준 |
| `**text**` | `<strong class="hl">` | 강조 (색+굵게+밑줄) |
| 예 / (예: ...) | `.ex` > `.ex-badge` + `<span>` | 예시 배지 |
| `<box: TITLE>` | `.bx.bx-ref` > `.bx-head` + `.bx-body` | 참고/비교 박스 |
| `<int_quiz: TITLE>` | `.bx.bx-ref` (현재 동일) | 퀴즈 박스 |
| box 내 부가 텍스트 | `.callout-note` | 박스 하단 참고 문구 |
| box/quiz 내 본문 | `.bx-text` | 박스 내부 텍스트 |
| 테이블 (독립) | `.tbl-wrap` > `<table>` | 데이터 테이블 |
| 테이블 (box 내) | `.bx-body` > `<table>` (wrap 없음) | 박스 내 비교 테이블 |
| `<그림: TITLE>` | `.fig-img` (파일 있음) 또는 `.fig-ph` (파일 없음) | 단독 그림 |
| `<그림: TITLE>caption</그림>` | `<figure class="fig">` + `<figcaption class="fig-cap">` | 캡션 동반 그림 |
| 쪽번호 | `.page-footer` > `.pn` | 페이지 하단 중앙 |
| 페이지 전체 | `.page` > `.page-content` + `.page-footer` | A4 페이지 단위 |

---

## 0a. 대원칙

1. **md에 없는 글자는 쓰지 않는다.** md의 표현을 그대로 사용하고, 의역하거나 문장을 추가하지 않는다.
2. **구조만 변환한다.** 내용은 1:1 대응이어야 한다.

---

## 1. Frontmatter → 페이지 메타 정보

md 파일 맨 위 `---` 사이에 메타데이터가 있다.

```yaml
---
subject: 화학
part: 1 원소와 주기성
chapter: 1 원소와 주기율표
start_page_num: 1
---
```

### 변환 규칙

| frontmatter 필드 | HTML 용도 |
|---|---|
| `subject` | chevron 네비게이터 첫 번째 칩 (과목). 이름 그대로 표시 (예: "화학") |
| `part` | chevron 네비게이터 두 번째 칩 (편). 숫자+이름 그대로 표시 |
| `chapter` | 숫자 부분 → `sec-badge-body`에 장 번호, 이름 부분 → `chapter-title` 텍스트 |
| `start_page_num` | 첫 페이지의 쪽번호. 이후 페이지는 +1씩 증가 |

### 첫 페이지 전용 요소
- **chevron 네비게이터**: 첫 페이지에만 표시. 2페이지부터는 생략.
- **장 제목 (chapter-title)**: 첫 페이지에만 표시.

---

## 2. 최상위 섹션 (`#`) → 박스 또는 본문 전환

md의 `#` 레벨 헤딩은 콘텐츠의 **파트 구분자** 역할을 한다.

| md 표현 | HTML 변환 | 비고 |
|---|---|---|
| `# 지난 시간 복습하기` | `<div class="bx bx-review">` 박스 | Blue. `.quiz-list` 번호 리스트. 학습목표 바로 앞에 배치 |
| `# 학습목표` | `<div class="bx bx-obj">` 박스 | 헤더에 "학습 목표" 표시, 내부 항목은 체크박스 리스트 |
| `# 기출유형` | `<div class="bx bx-exam">` 박스 | 헤더에 "기출유형" 표시, 내부 항목은 `.exam-list` 불릿 리스트 |
| `# 이론` | 박스 없음. 이하 내용을 plain으로 처리 | `# 이론` 자체는 HTML에 출력하지 않음 |
| `# 마무리 퀴즈` | `<div class="bx bx-quiz">` 박스 | 이론 다음, 대표 기출 문제 앞. 번호 리스트(`.quiz-list`)로 문항 나열 |
| `# 대표 기출 문제` | `<div class="bx bx-prob">` 박스 | md 맨 끝. 대표 기출문제 1개를 구조화해 렌더. 필드 매핑은 별도 섹션 참조 |

### 지난 시간 복습하기 내부
```md
# 지난 시간 복습하기
1. 이번 학기 아름드리반 과학 강학의 이름은 (          )이다.
2. 이번 학기 수업은 ( 프린트 위주 / 교과서 위주 )로 진도를 나간다. 알맞은 것을 고르시오.
```

→

```html
<div class="bx bx-review">
    <div class="bx-head">지난 시간 복습하기</div>
    <div class="bx-body">
        <ol class="quiz-list">
            <li>이번 학기 아름드리반 과학 강학의 이름은 (          )이다.</li>
            <li>이번 학기 수업은 ( 프린트 위주 / 교과서 위주 )로 ...</li>
        </ol>
    </div>
</div>
```

- 번호 리스트를 `.quiz-list`로 변환 (마무리 퀴즈와 동일 구조, 색만 Blue).
- 첫 페이지의 **가장 위**, 학습목표 바로 앞에 배치한다.
- **공백 보존**: 문항의 연속 공백(빈칸용 `(          )` 등)은 반드시 그대로 유지한다. `.quiz-list > li`는 `white-space: pre-wrap`으로 공백을 보존한다. 공백을 임의로 축소·제거하지 않는다.

### 학습목표 내부
```md
# 학습목표
- 원소의 정의 및 특성, 원소 기호
- 원자의 정의 및 특성, 원자 모형
```

→

```html
<div class="bx bx-obj">
    <div class="bx-head">학습 목표</div>
    <div class="bx-body">
        <ul class="obj-list">
            <li><span class="obj-check"></span>원소의 정의 및 특성, 원소 기호</li>
            <li><span class="obj-check"></span>원자의 정의 및 특성, 원자 모형</li>
        </ul>
    </div>
</div>
```

- 각 `- ` 항목 앞에 빈 체크박스(`obj-check`) 추가
- md 텍스트를 그대로 사용

### 기출유형 내부
```md
# 기출유형
- 주요 원소의 특성 파악
- 주기율표 상의 위치에 따른 원소의 특성 파악
```

→

```html
<div class="bx bx-exam">
    <div class="bx-head">기출유형</div>
    <div class="bx-body">
        <ul class="exam-list">
            <li>주요 원소의 특성 파악</li>
            <li>주기율표 상의 위치에 따른 원소의 특성 파악</li>
        </ul>
    </div>
</div>
```

### 마무리 퀴즈 (`# 마무리 퀴즈`)

```md
# 마무리 퀴즈
1. "원자는 양전하를 띠는 ()와 음전하를 띠는 ()로 이루어져있다." 빈칸에 들어갈 알맞은 말은?
2. 최외각 전자의 수가 같은 원소들은 화학적 성질이 비슷하다. (O / X)
3. 주기율표에서 가로줄은 (주기/족)을, 세로줄은 (주기/족)을 나타낸다. 알맞은 말을 고르시오.
```

→

```html
<div class="bx bx-quiz">
    <div class="bx-head">마무리 퀴즈</div>
    <div class="bx-body">
        <ol class="quiz-list">
            <li>"원자는 양전하를 띠는 ()와 ..."</li>
            <li>최외각 전자의 수가 같은 원소들은 ... (O / X)</li>
            <li>주기율표에서 가로줄은 ...</li>
        </ol>
    </div>
</div>
```

- md의 번호 리스트(`1.` `2.` `3.`)를 그대로 `quiz-list` 항목으로 변환한다.
- 번호는 Purple 600 원형 배지 안에 흰색으로 자동 렌더링(카운터 사용).
- `# 이론`과 `# 대표 기출 문제` **사이**에 배치한다.

---

### 대표 기출 문제 (`# 대표 기출 문제`) — md 맨 아래 독립 박스

```md
# 대표 기출 문제

- source: 26학년도 1회 7번
- problem: 임의의 원소 A～D 중 전자가 채워진 전자껍질 수가 2개인 것은?
- bogi: null
- figure: "figures/기출문제_26-1-07.png"
- answer: 2
- explanation
    - 주기율표에서 전자가 채워진 전자껍질 수는 주기(가로줄)의 번호와 같다.
    - 선지 분석: A - 수소(H), B - 베릴륨(Be), ...
```

→

```html
<div class="bx bx-prob">
    <div class="bx-head">
        대표 기출 문제
        <span class="rep-prob-src" style="margin-left:auto;font-weight:500;">26학년도 1회 7번</span>
    </div>
    <div class="bx-body">
        <div class="rep-prob">
            <p class="rep-prob-q">임의의 원소 A～D 중 ...</p>
            <div class="rep-prob-fig" style="height:30mm;"><!-- figures/기출문제_26-1-07.png --></div>
            <div class="rep-prob-expl">
                <div class="rep-prob-ans"><span class="rep-prob-ans-label">답</span><span>2</span></div>
                <ul>
                    <li>주기율표에서 전자가 채워진 전자껍질 수는 ...</li>
                    <li>선지 분석: A - 수소(H), B - 베릴륨(Be), ...</li>
                </ul>
            </div>
        </div>
    </div>
</div>
```

### 필드 매핑

| md 필드 | HTML 위치 | 비고 |
|---|---|---|
| `source` | `.bx-head` 우측 (`.rep-prob-src`) | 출처 (예: "26학년도 1회 7번") |
| `problem` | `.rep-prob-q` | 문제 본문 |
| `bogi` | (별도 블록) | `null`이면 생략. 값이 있으면 문제 아래 선지로 렌더 |
| `figure` | `.rep-prob-fig` 빈 div | 경로는 주석으로 보존. 인쇄 후 부착용 고정 높이(30mm) |
| `answer` | `.rep-prob-expl` > `.rep-prob-ans` | 해설 박스 **상단**에 배치. Coral 600 원형 배지(6.5mm) 안에 "답" 글자 + 값. "해설" 라벨 텍스트는 쓰지 않는다 |
| `explanation` | `.rep-prob-expl` > `ul > li` | 정답 아래 불릿 리스트로 이어 표시. 각 항목 시작의 `[태그]`는 `.expl-tag` span으로 변환 (아래 규칙 참조) |

- `# 대표 기출 문제`는 `# 기출 문제로 응용하기` **바로 앞**에 위치하며(또는 응용이 없으면 md 맨 아래), 해당 장의 `# 이론` 마지막 페이지 하단에 밀착 정렬된다 (`.page-content`가 flex-column, `.bx-prob`에 `margin-top:auto`).
- 정답과 해설은 하나의 `.rep-prob-expl` 박스 안에 결합하며, 이 박스 외부에 별도의 정답 블록을 두지 않는다.
- `# 이론` 아래의 `##`만 `sec-h2`(자동 번호)로 처리한다. `# 기출 문제로 응용하기` 아래의 `##`는 sec-h2가 아닌 `.apply-num`(문제 번호)으로 렌더한다.

### 해설 태그 (`[라벨]`) → `.expl-tag`

`explanation` 항목(대표 기출 문제 / 기출 문제로 응용하기 공통) 시작 부분의 대괄호 라벨은 이모지 + 굵은 텍스트 태그로 변환한다. 태그 뒤에는 자동 줄바꿈(`display: block`) 후 본문이 이어진다.

| md 라벨 | HTML | 이모지 |
|---|---|---|
| `[개념 다시보기]` | `<span class="expl-tag t-concept">개념 다시보기</span>` | 📚 |
| `[시험 대비하기]` | `<span class="expl-tag t-exam">시험 대비하기</span>` | 🎯 |
| `[문제 살펴보기]` | `<span class="expl-tag t-problem">문제 살펴보기</span>` | 🔍 |
| `[선지 살펴보기]` | `<span class="expl-tag t-options">선지 살펴보기</span>` | ✅ |

이모지는 CSS `::before` content로 자동 삽입하므로 HTML 텍스트에 넣지 않는다. 라벨 다음에 중첩 불릿(`- `)이 오면 `<ul>`로 감싼다.

---

### 기출 문제로 응용하기 (`# 기출 문제로 응용하기`) — 별도 페이지

장의 **마지막 페이지**(대표 기출 문제 다음)에 독립 페이지로 렌더한다. 하나의 페이지에 여러 문제를 2단 그리드(왼쪽 문제 / 오른쪽 해설)로 배치한다.

```md
# 기출 문제로 응용하기

## 1
- source: 20학년도 1회 8번
- problem: 1족 원소끼리 옳게 짝지은 것은?
- bogi: null
- figure: null
- options
    - H, He
    - H, Li
    - He, C
    - Li, C
- answer: 2
- explanation
    - [개념 다시보기] 1족 원소란 ...
    - [선지 살펴보기]
        1. 수소(H)는 1족이나, ...
        2. [정답] 수소(H)와 리튬(Li) 모두 1족이다.
        ...
    - [시험 대비하기] 1~20번 원소는 ...

## 2
...
```

→ (구조)

```html
<div class="page">
    <div class="page-content">
        <div class="apply-title">기출 문제로 응용하기</div>
        <div class="apply-item">
            <div class="apply-left">
                <span class="apply-src">20학년도 1회 8번</span>
                <div class="apply-head">
                    <span class="apply-num">1</span>
                    <p class="apply-q">1족 원소끼리 옳게 짝지은 것은?</p>
                </div>
                <!-- figure가 있으면 여기 .apply-fig -->
                <ol class="apply-opts">
                    <li>H, He</li>
                    <li>H, Li</li>
                    <li>He, C</li>
                    <li>Li, C</li>
                </ol>
            </div>
            <div class="apply-right">
                <div class="apply-ans">
                    <span class="apply-ans-badge">답</span>
                    <span>② H, Li</span>
                </div>
                <ul class="apply-expl">
                    <li><span class="expl-tag t-concept">개념 다시보기</span>1족 원소란 ...</li>
                    <li><span class="expl-tag t-options">선지 살펴보기</span>
                        <ul>
                            <li>...</li>
                        </ul>
                    </li>
                    <li><span class="expl-tag t-exam">시험 대비하기</span>...</li>
                </ul>
            </div>
        </div>
        <!-- 문제 2, 3 ... -->
    </div>
    <div class="page-footer"><span class="pn">N</span></div>
</div>
```

### 필드 매핑

| md 필드 | HTML 위치 | 비고 |
|---|---|---|
| `## N` | `.apply-num` | 문제 번호. Coral 600, 18pt, 800 굵기 |
| `source` | `.apply-src` | 문제 우상단(apply-left의 첫 자식으로 별도 줄), Gray 400, 오른쪽 정렬 |
| `problem` | `.apply-q` | 13pt, 600 |
| `bogi` | (선택 블록) | `null`이면 생략 |
| `figure` | `.apply-fig > img.fig-img` 또는 `.fig-ph` | 파일 존재 규칙은 §7 동일 |
| `options` | `ol.apply-opts > li` | ①②③④ 자동 부여 (`:nth-child` CSS). md 순서대로 최대 4개 |
| `answer` | `.apply-ans` | Coral 600 6.5mm 원형 "답" 배지 + `① …` 형식으로 번호와 해당 선지 텍스트 병기 |
| `explanation` | `ul.apply-expl > li` | 각 항목 선두 `[라벨]`은 `.expl-tag`로 변환. 중첩 리스트는 `<ul>`로 |

### 페이지/레이아웃 규칙

- `# 기출 문제로 응용하기`는 **자체 페이지**에서 시작. 이전 페이지에 이어 붙이지 않는다.
- 2단 그리드: `grid-template-columns: 1fr 1fr`, `gap: 11mm`. 오른쪽 컬럼 좌측에 점선 수직 구분선을 gap 중앙에 배치.
- 문제 간 구분: `.apply-item` 사이에 1.2px Gray 300 실선 (마지막 문제 제외).
- 한 페이지에 들어가지 않으면 다음 페이지로 `.apply-item` 단위 분할 (중간 자르기 금지).
- chevron 네비·chapter-title은 반복하지 않는다.

---

## 3. `##` 헤딩 → 섹션 제목 (sec-h2)

```md
## 원소
```

→

```html
<div class="sec-h2"><span class="sec-num">1</span><h2>원소</h2></div>
```

- `##`이 등장하는 순서대로 1, 2, 3... 자동 번호 부여
- 번호는 Mint 600 정사각형 아이콘 안에 흰색으로 표시

---

## 4. `###` 헤딩 + 하위 리스트 → 개조식 (ol1–ol4)

md에서 `###`는 독립 헤딩으로 렌더링하지 **않는다**. `ol1`의 항목으로 통합한다.

```md
### 정의 및 특징
- 물질을 이루는 **기본 성분**
- 더 이상 다른 물질로 분해되지 않는다

### 원소 기호
- 정의: 원소를 나타내는 간단한 기호
- 기호 표기법
    - 원소 이름의 알파벳 첫 글자를 대문자로 나타낸다.
```

→

```html
<ol class="ol1">
    <li>정의 및 특징
        <ol class="ol2">
            <li>물질을 이루는 <strong class="hl">기본 성분</strong></li>
            <li>더 이상 다른 물질로 분해되지 않는다.</li>
        </ol>
    </li>
    <li>원소 기호
        <ol class="ol2">
            <li>정의: 원소를 나타내는 간단한 기호</li>
            <li>기호 표기법
                <ol class="ol3">
                    <li>원소 이름의 알파벳 첫 글자를 대문자로 나타낸다.</li>
                </ol>
            </li>
        </ol>
    </li>
</ol>
```

### 들여쓰기 수준 매핑

| md 표현 | HTML 클래스 | 번호 형식 |
|---|---|---|
| `### 제목` (h3 자체) | `ol1 > li` | `1.` `2.` `3.` |
| `- 항목` (h3 아래 1단계) | `ol2 > li` | `1)` `2)` `3)` |
| `    - 항목` (2단계 들여쓰기) | `ol3 > li` | `(1)` `(2)` `(3)` |
| `        - 항목` (3단계 들여쓰기) | `ol4 > li` | `①` `②` `③` |

---

## 5. Bold (`**`) → 강조 (.hl)

```md
물질을 이루는 **기본 성분**
```

→

```html
물질을 이루는 <strong class="hl">기본 성분</strong>
```

- 색: Coral 600 (`#DC2626`)
- 굵기: 700
- 밑줄: underline

---

## 6. 예시 → 예시 배지 (.ex)

md에서 `예` 또는 `(예: ...)` 형태를 예시 배지로 변환한다.

### 패턴 A: 독립 예시 블록
```md
    - 예
        - 수소: 가장 가벼운 원소
        - 질소: 대기에서 가장 많은 원소
```

→

```html
<span class="ex">
    <span class="ex-badge">예</span>
    <span>수소: 가장 가벼운 원소 / 질소: 대기에서 가장 많은 원소</span>
</span>
```

### 패턴 B: 인라인 괄호 예시
```md
원소 이름의 알파벳 첫 글자를 대문자로 나타낸다. (예: 수소 H, 탄소 C, 산소 O)
```

→

```html
원소 이름의 알파벳 첫 글자를 대문자로 나타낸다.
<span class="ex"><span class="ex-badge">예</span><span>수소 H, 탄소 C, 산소 O</span></span>
```

- `(예: ...)` 의 괄호와 "예:" 텍스트는 제거하고, 내용만 추출
- Amber 600 원형 배지 안에 흰색 '예' 글자
- **절대로** `예)` 를 plain text로 쓰지 않는다

---

## 7. `<그림: TITLE>` → 그림 (캡션 옵션)

### 두 가지 표현
- **자체 종결**: `<그림: TITLE>` — 캡션 없이 그림만.
- **캡션 동반**: `<그림: TITLE>캡션 텍스트</그림>` — 그림 아래에 캡션을 달고 싶을 때. 캡션은 한 줄 이상 가능, 인라인 마크다운(예: `**강조**`) 동일하게 처리.

### HTML 매핑

캡션이 **없으면** 단독 `.fig-img` 또는 `.fig-ph`를 그대로 출력.

캡션이 **있으면** `<figure class="fig">`로 감싸고 `<figcaption class="fig-cap">`을 붙인다.

```md
<그림: 최외각_전자>탄소의 원자 모형으로, 최외각 전자를 보라색으로 나타냈다.</그림>
```

→

```html
<figure class="fig">
    <img class="fig-img" src="figures/최외각_전자.png" alt="최외각_전자">
    <figcaption class="fig-cap">탄소의 원자 모형으로, 최외각 전자를 보라색으로 나타냈다.</figcaption>
</figure>
```

파일이 없을 때:

```html
<figure class="fig">
    <div class="fig-ph">최외각_전자</div>
    <figcaption class="fig-cap">탄소의 원자 모형으로, 최외각 전자를 보라색으로 나타냈다.</figcaption>
</figure>
```

캡션 스타일: 11pt · `#4B5563` (Gray 600) · 600 굵기 · 중앙 정렬 (`.fig-cap`).

### 플레이스홀더 / 이미지 본 규칙

```md
|원자 모형|<그림: 수소 원자 모형>|<그림: 헬륨 원자 모형>|
```

→

```html
<td style="height:28mm;padding:2mm;"><div class="fig-ph">수소 원자 모형</div></td>
<td style="height:28mm;padding:2mm;"><div class="fig-ph">헬륨 원자 모형</div></td>
```

- CSS로 그림을 그리지 않는다.
- **파일 해석 규칙**: `<그림: TITLE>`을 만나면 현재 chapter 디렉토리의 `figures/` 하위에서 실제 이미지 파일을 찾는다.
    - 탐색 순서: `figures/{TITLE}.png` → `.jpg` → `.jpeg` → `.svg` → `.webp`. TITLE은 md에 적힌 그대로(공백·괄호·한글 포함) 사용한다.
    - **파일이 존재하면** `<img class="fig-img" src="figures/{파일명}" alt="{TITLE}">`로 삽입. 표 셀 안에서는 셀 높이 내에 자동으로 맞춰진다.
    - **파일이 없으면** 기존대로 `.fig-ph` 플레이스홀더를 출력해 인쇄 후 부착용 공간으로 둔다. TITLE을 중앙에 표시해 어느 그림이 들어갈 자리인지 식별한다.
- 표 셀 안에 들어갈 때는 셀에 `height` + `padding:2mm`을 지정한다. `.fig-ph`는 셀 전체를 채우고, `.fig-img`는 `max-height: 26mm`로 축소되어 들어간다.
- 표 밖에 단독으로 나올 때는 적절한 `height`(예: 30mm)을 인라인 스타일로 지정.
- **대표 기출 문제의 `figure` 필드**는 md에 경로가 명시돼 있으므로 그 경로(`figures/...`)를 직접 탐색한다.
    - 파일 존재 → `<img class="fig-img" src="{figure 값}" alt="{source 필드}" style="max-height:30mm;">`
    - 파일 부재 → `.fig-ph`에 파일명을 표기해 부착 위치를 안내

---

## 8. `<box: TITLE>...</box>` → 참고/비교 박스 (bx-ref)

```md
<box: 원소와 원자의 차이>

|구분|원소(element)|원자(atom)|
|---|---|---|
|성격|실제 입자가 아니라...|물리적으로 존재하는...|

참고하기: 우리가 공부하는 내용의 대부분은...

</box>
```

→

```html
<div class="bx bx-ref">
    <div class="bx-head">원소와 원자의 차이</div>
    <div class="bx-body">
        <table>...</table>
        <div class="callout-note">참고하기: 우리가 공부하는 내용의 대부분은...</div>
    </div>
</div>
```

- TITLE → `bx-head` 텍스트
- 내부 테이블 → 비교 테이블 스타일 적용
- 테이블 아래 텍스트 → `callout-note`

---

## 9. `<int_quiz: TITLE>...</int_quiz>` → 참고 박스 (bx-ref)

현재는 `bx-ref`와 동일한 스타일로 변환한다. (향후 bx-quiz로 분리 가능)

```md
<int_quiz: 원자 모형 해석해보기>
<그림: 탄소 원자의 전자 모형>
- 원자핵의 전하량: +6
- 양성자 수: 6개
</int_quiz>
```

→ `bx-ref` 박스로 변환. 내부 리스트는 테이블 형태로 정리.

---

## 10. 테이블 → 데이터 테이블 (tbl-wrap)

```md
|구분|수소|헬륨|산소|
|---|---|---|---|
|원자핵의 전하량|+1|+2|+8|
```

→

```html
<div class="tbl-wrap">
    <table>
        <thead>
            <tr><th>구분</th><th>수소</th><th>헬륨</th><th>산소</th></tr>
        </thead>
        <tbody>
            <tr><td>원자핵의 전하량</td><td>+1</td><td>+2</td><td>+8</td></tr>
        </tbody>
    </table>
</div>
```

- 첫 행 → `<thead>`, 나머지 → `<tbody>`
- `<box>` 안의 테이블은 `tbl-wrap` 없이 박스 내부에 직접 배치
- `<그림: ...>`이 셀에 있으면 빈 셀(`height:28mm`)로 대체

---

## 11. 페이지 분할

### 페이지 구조
```html
<div class="page">
    <div class="page-content">
        <!-- 콘텐츠 -->
    </div>
    <div class="page-footer"><span class="pn">{쪽번호}</span></div>
</div>
```

### 규칙
- `start_page_num`이 첫 페이지 번호. 이후 +1씩 증가.
- **첫 페이지에만**: chevron 네비게이터 + 절 제목 + 학습목표 + 기출유형
- **2페이지 이후**: 이론 내용 이어서. 네비게이터/절 제목 반복하지 않음.
- 페이지가 넘어갈 때 `## 섹션 제목`을 반복하지 않음.
- 개조식 번호 이어가기: `<ol class="ol1" style="counter-reset: l1 {마지막번호};">` 사용

---

## 12. 변환하지 않는 것

| md 표현 | 처리 |
|---|---|
| `# TODO` 섹션 | HTML에 포함하지 않음 |
| frontmatter의 `core concept` | HTML에 포함하지 않음 (내부 참고용) |
| `memo.txt` | 무시 |

---

## 부록: 전체 변환 흐름 요약

```
1. frontmatter 파싱 → part, chapter, section, start_page_num 추출
2. 첫 페이지 생성
   a. chevron nav (part, chapter)
   b. chapter-title (section 번호 + 이름)
   c. # 학습목표 → bx-obj 박스
   d. # 기출유형 → bx-exam 박스
3. # 이론 이하 처리
   a. ## → sec-h2 (자동 번호)
   b. ### + 하위 목록 → ol1/ol2/ol3/ol4
   c. **text** → <strong class="hl">text</strong>
   d. 예 / (예: ...) → .ex + .ex-badge
   e. <그림: ...> → 빈 공간 (height:28mm)
   f. <box: TITLE>...</box> → bx-ref
   g. <int_quiz: TITLE>...</int_quiz> → bx-ref
   h. 테이블 → tbl-wrap (또는 박스 내 테이블)
4. 페이지 분할 + 쪽번호 부여
```
