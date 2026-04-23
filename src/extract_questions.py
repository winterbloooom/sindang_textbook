#!/usr/bin/env python3
"""
과학 기출문제 PDF → JSON 추출 스크립트

출력: questions.json (indent=4)
스키마: year, round, number, text, bogi, options, has_figure, answer, subject, concept
"""

import json
import pdfplumber
import re
from pathlib import Path

BASE_DIR = Path('/Users/eungi/src/sindang_exams')
PDF_DIR = BASE_DIR / 'assets' / 'prob_ans'

# ── 헤더/푸터 제거 패턴 ─────────────────────────────────────────────────────
JUNK_PATTERNS = [
    r'^고졸[^\S\n]*[\(（]?[^\S\n]*과[^\S\n]*학[^\S\n]*[\)）]?[^\S\n]*[\d\-－]*[^\S\n]*$',
    r'^학[^\S\n]*[\)）][^\S\n]*[\d\-－]+[^\S\n]*$',
    r'^학[^\S\n]*$',
    r'^고졸[^\S\n]*$',
    r'^제[^\S\n]*5[^\S\n]*교[^\S\n]*시[^\S\n]*$',
    r'^\d{4}년도?[^\S\n]*제[^\S\n]*\d+회[^\S\n]*고등학교[^\S\n]*졸업학력[^\S\n]*검정고시[^\S\n]*$',
    r'^과[^\S\n]*학[^\S\n]*$',
    # "학교 졸업학력 검정고시" 등 부분 푸터 (줄 어디에나)
    r'학교\s*졸업학력\s*검정고시[^\n]*',
    r'고졸학력\s*검정고시[^\n]*',
]

# ── PDF 컬럼 추출 ──────────────────────────────────────────────────────────
def extract_columns(pdf_path: Path) -> str:
    parts = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page in pdf.pages:
            mid = page.width / 2
            left  = page.crop((0,   70, mid,         page.height - 50))
            right = page.crop((mid, 70, page.width,  page.height - 50))
            parts.append(left.extract_text()  or '')
            parts.append(right.extract_text() or '')
    return '\n'.join(parts)


def clean_junk(text: str) -> str:
    for pat in JUNK_PATTERNS:
        text = re.sub(pat, '', text, flags=re.MULTILINE | re.IGNORECASE)
    return text


# ── 텍스트 정제 ────────────────────────────────────────────────────────────
def remove_figure_sentences(text: str) -> tuple[str, bool]:
    """
    '그림은/표는 ... 나타낸 것이다.' 형태 문장 제거.
    제거 여부를 bool로 반환.
    """
    # 그림/표 설명 문장: 줄 처음에 그림/표로 시작해서 마침표로 끝나는 절
    pattern = r'(그림|표)[은는이가][^。.?？]*나타낸\s*것이다\.?\s*'
    has_fig = bool(re.search(pattern, text))
    text = re.sub(pattern, '', text)
    # "그림의 A~D는 ... 나타낸 것이다." 형태
    pattern2 = r'(그림|표)의?\s+[^\s]*[은는이가][^。.?？]*나타낸\s*것이다\.?\s*'
    has_fig = has_fig or bool(re.search(pattern2, text))
    text = re.sub(pattern2, '', text)
    return text.strip(), has_fig


def remove_broken_chemical_formulas(text: str) -> str:
    """
    PDF 추출 시 아래첨자가 유실된 화학식 괄호 표기 제거.
    예: '이산화탄소(CO )' → '이산화탄소'
        '수소(H )' → '수소'
    패턴: 괄호 안이 알파벳+공백+숫자만으로 구성된 경우
    """
    return re.sub(r'\(\s*[A-Za-z][A-Za-z0-9\s]*\s*\)', '', text)


def remove_special_chars(text: str) -> str:
    """pdfplumber 아티팩트 문자(사용자 정의 영역 문자 등) 제거"""
    # U+E000~U+F8FF 사용자 정의 문자
    text = re.sub(r'[\uE000-\uF8FF]', '', text)
    return text


def clean_text(text: str) -> str:
    text = remove_special_chars(text)
    text = re.sub(r'[ \t]{2,}', ' ', text)
    text = re.sub(r'\n{3,}', '\n', text)
    return text.strip()


# ── 보기 추출 ──────────────────────────────────────────────────────────────
def extract_bogi(body: str) -> tuple:
    """
    <보기> 섹션 헤더(단독 줄)에서 ㄱ/ㄴ/ㄷ 항목 추출.
    인라인 '<보기>에서 ...' 참조는 건드리지 않음.
    본문에서 보기 블록 제거 후 (나머지 본문, 보기 리스트) 반환.
    """
    # <보기>가 줄 전체를 차지하는 경우만 블록으로 인식
    bogi_block = re.search(
        r'(?:^|\n)[^\S\n]*<보기>[^\S\n]*\n(.*?)(?=\n[^\S\n]*[①②③④]|\Z)',
        body, re.DOTALL
    )
    if not bogi_block:
        return body, None

    bogi_text = bogi_block.group(1)
    items = re.findall(r'[ㄱㄴㄷ]\.\s*([^\nㄱㄴㄷ①②③④]+)', bogi_text)
    bogi_list = [item.strip().rstrip('.') for item in items if item.strip()]

    # 본문에서 <보기> 블록 전체 제거 (헤더 포함)
    # bogi_block.start() = <보기> 헤더 직전 \n 위치
    block_start = bogi_block.start()
    body_cleaned = body[:block_start].strip() + '\n' + body[bogi_block.end():].strip()
    return body_cleaned.strip(), (bogi_list if bogi_list else None)


# ── 선지 추출 ──────────────────────────────────────────────────────────────
def extract_options(body: str) -> tuple[str, list[str]]:
    """
    ①②③④ 선지를 리스트로 추출하고 본문에서 제거.
    """
    # 먼저 선지가 같은 줄에 붙어있는 경우 줄바꿈으로 분리
    for ch in ['②', '③', '④']:
        body = re.sub(r'[ \t]+(' + re.escape(ch) + r')', r'\n\1', body)

    parts = re.split(r'\n?[①②③④]', body)
    if len(parts) < 2:
        return body, []

    remaining_text = parts[0].strip()
    # 선지 텍스트: 한글 포함 줄(잡음)만 제거, 화학식 등 유효한 계속은 유지
    option_texts = []
    for p in parts[1:]:
        opt = re.sub(r'\n[^\n]*[가-힣][^\n]*', '', p)  # 한글 있는 줄 제거
        opt = opt.replace('\n', ' ').strip()             # 나머지 개행은 공백으로
        if opt:
            option_texts.append(opt)
    return remaining_text, option_texts


# ── 문제 파싱 ──────────────────────────────────────────────────────────────
def parse_questions(raw_text: str) -> list[dict]:
    cleaned = clean_junk(raw_text)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)

    chunks = re.split(r'\n(?=\d{1,2}\.\s)', cleaned.strip())

    questions = {}
    for chunk in chunks:
        m = re.match(r'^(\d{1,2})\.\s+(.*)', chunk, re.DOTALL)
        if not m:
            continue
        num = int(m.group(1))
        if not (1 <= num <= 25) or num in questions:
            continue

        body = m.group(2).strip()
        body = clean_text(body)

        # 그림/표 설명 문장 제거
        body, has_fig = remove_figure_sentences(body)
        # 그림/표 참조 키워드 감지 (제거 안 됐어도 참조하는 경우)
        if not has_fig:
            has_fig = bool(re.search(r'^(그림|표)[은는이가의]', body, re.MULTILINE))

        # 화학식 괄호 제거
        body = remove_broken_chemical_formulas(body)
        body = clean_text(body)

        # 보기 추출
        body, bogi = extract_bogi(body)

        # 선지 추출
        body, options = extract_options(body)
        body = clean_text(body)

        # 선지가 비어있으면 선지 자체가 그림 → has_figure 확정
        if not options:
            has_fig = True

        # \n 제거: 줄바꿈을 공백으로 치환
        body = re.sub(r'\n+', ' ', body).strip()
        if bogi:
            bogi = [re.sub(r'\n+', ' ', b).strip() for b in bogi]
        options = [re.sub(r'\n+', ' ', o).strip() for o in options]

        questions[num] = {
            'number': num,
            'text': body,
            'bogi': bogi,
            'options': options,
            'has_figure': has_fig,
        }

    return [questions[n] for n in sorted(questions)]


# ── 정답 추출 ──────────────────────────────────────────────────────────────
CIRCLE_TO_INT = {'①': 1, '②': 2, '③': 3, '④': 4}

def extract_science_answers(ans_pdf_path: Path) -> dict[int, int]:
    """
    전 과목 정답 PDF에서 과학(5교시) 정답만 추출.
    반환: {문항번호: 정답(1~4)}
    """
    full_text = ''
    with pdfplumber.open(str(ans_pdf_path)) as pdf:
        for page in pdf.pages:
            full_text += (page.extract_text() or '') + '\n'

    # "5교시" + "과학 정답표" 블록 추출
    m = re.search(
        r'5교시\s*\n\s*과\s*학\s*정답표\s*\n(.*?)(?=\d교시|\Z)',
        full_text, re.DOTALL
    )
    if not m:
        raise ValueError(f'과학 정답표를 찾을 수 없음: {ans_pdf_path.name}')

    block = m.group(1)

    # "숫자 ①②③④" 패턴으로 정답 추출
    answers = {}
    for num_str, circle in re.findall(r'(\d{1,2})\s+([①②③④])', block):
        num = int(num_str)
        if 1 <= num <= 25:
            answers[num] = CIRCLE_TO_INT[circle]

    if len(answers) != 25:
        raise ValueError(f'정답 {len(answers)}개 추출됨 (25개 기대): {ans_pdf_path.name}')

    return answers


# ── 메인 ───────────────────────────────────────────────────────────────────
def main():
    prob_files = sorted(PDF_DIR.glob('*_prob.pdf'))
    records = []

    for pdf_path in prob_files:
        exam_key = pdf_path.stem.replace('_prob', '')
        year, round_ = exam_key.split('-')
        print(f'처리 중: {pdf_path.name}', end=' ... ')

        try:
            raw = extract_columns(pdf_path)
            questions = parse_questions(raw)

            ans_path = PDF_DIR / f'{exam_key}_ans.pdf'
            answers = extract_science_answers(ans_path)

            print(f'{len(questions)}문제, 정답 {len(answers)}개')

            if len(questions) != 25:
                print(f'  ⚠ 경고: 25문제가 아님')

            for q in questions:
                records.append({
                    'year': year,
                    'round': round_,
                    **q,
                    'answer': answers.get(q['number']),
                    'subject': None,
                    'concept': None,
                })

        except Exception as e:
            print(f'오류: {e}')
            raise

    output_path = BASE_DIR / 'questions.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=4)
        f.write('\n')

    print(f'\n✓ {len(records)}개 문제 저장 완료: {output_path}')


if __name__ == '__main__':
    main()
