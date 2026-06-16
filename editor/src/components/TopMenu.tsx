import type { Editor as TEditor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import './TopMenu.css'

type Props = {
  editor: TEditor | null
  onPageBreak: () => void
  zoom?: number
  onZoomIn?: () => void
  onZoomOut?: () => void
  onZoomReset?: () => void
}

function countApplyItems(editor: TEditor): number {
  let count = 0
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'applyItem') count++
  })
  return count
}

const BOX_VARIANTS: Array<{ value: string; label: string }> = [
  { value: 'obj', label: '학습 목표' },
  { value: 'review', label: '지난 시간 복습하기' },
  { value: 'exam', label: '기출 유형' },
  { value: 'ref', label: '부가설명' },
  { value: 'prob', label: '대표 기출 문제' },
]

export function TopMenu({
  editor,
  onPageBreak,
  zoom = 1,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: Props) {
  const [, force] = useState(0)
  const [boxOpen, setBoxOpen] = useState(false)
  const [boxPos, setBoxPos] = useState<{ left: number; top: number } | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const boxBtnRef = useRef<HTMLButtonElement>(null)
  const boxMenuRef = useRef<HTMLDivElement>(null)

  const openBoxMenu = () => {
    const r = boxBtnRef.current?.getBoundingClientRect()
    if (r) setBoxPos({ left: r.left, top: r.bottom + 4 })
    setBoxOpen(true)
  }

  useEffect(() => {
    if (!boxOpen) return
    const onDocDown = (ev: MouseEvent) => {
      const t = ev.target as Node
      if (boxRef.current?.contains(t)) return
      if (boxMenuRef.current?.contains(t)) return
      setBoxOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [boxOpen])

  useEffect(() => {
    if (!editor) return
    const handler = () => force((n) => n + 1)
    editor.on('selectionUpdate', handler)
    editor.on('transaction', handler)
    return () => {
      editor.off('selectionUpdate', handler)
      editor.off('transaction', handler)
    }
  }, [editor])

  const ready = !!editor
  const isActive = (name: string, attrs?: Record<string, unknown>) =>
    !!editor?.isActive(name, attrs)
  const olActive = isActive('orderedList')
  const olStart = Number(editor?.getAttributes('orderedList')?.start ?? 1)

  const run = (fn: (editor: TEditor) => void) => {
    if (!editor) return
    fn(editor)
  }

  return (
    <div className="top-menu">
      <div className="top-menu__group">
        <button
          type="button"
          className={isActive('bold') ? 'is-active' : ''}
          disabled={!ready}
          onClick={() => run((e) => e.chain().focus().toggleBold().run())}
          title="굵게"
        >
          <b>B</b>
        </button>
        <button
          type="button"
          className={isActive('italic') ? 'is-active' : ''}
          disabled={!ready}
          onClick={() => run((e) => e.chain().focus().toggleItalic().run())}
          title="기울임"
        >
          <i>I</i>
        </button>
        <button
          type="button"
          className={isActive('strike') ? 'is-active' : ''}
          disabled={!ready}
          onClick={() => run((e) => e.chain().focus().toggleStrike().run())}
          title="취소선"
        >
          <s>S</s>
        </button>
        <button
          type="button"
          className={
            'top-menu__strongem' + (isActive('strongEm') ? ' is-active' : '')
          }
          disabled={!ready}
          onClick={() =>
            run((e) => e.chain().focus().toggleMark('strongEm').run())
          }
          title="강조 (굵게+밑줄+빨강)"
        >
          <span>강조</span>
        </button>
        <button
          type="button"
          className="top-menu__example"
          disabled={!ready}
          onClick={() =>
            run((e) => {
              const { from, to, empty } = e.state.selection
              const text = empty
                ? ''
                : e.state.doc.textBetween(from, to, ' ')
              const node = text
                ? { type: 'example', content: [{ type: 'text', text }] }
                : { type: 'example', content: [{ type: 'text', text: ' ' }] }
              e.chain().focus().insertContent(node).run()
            })
          }
          title="예시 뱃지 (인라인)"
        >
          <span className="top-menu__ex-badge">예</span>
        </button>
        <button
          type="button"
          className={isActive('subscript') ? 'is-active' : ''}
          disabled={!ready}
          onClick={() =>
            run((e) => e.chain().focus().toggleSubscript().run())
          }
          title="아래 첨자 (Cmd+Shift+-)"
        >
          X<sub>2</sub>
        </button>
        <button
          type="button"
          className={isActive('superscript') ? 'is-active' : ''}
          disabled={!ready}
          onClick={() =>
            run((e) => e.chain().focus().toggleSuperscript().run())
          }
          title="위 첨자 (Cmd+Shift+=)"
        >
          X<sup>2</sup>
        </button>
      </div>

      <div className="top-menu__group">
        <button
          type="button"
          className={isActive('heading', { level: 2 }) ? 'is-active' : ''}
          disabled={!ready}
          onClick={() =>
            run((e) =>
              e.chain().focus().toggleHeading({ level: 2 }).run(),
            )
          }
          title="섹션 제목"
        >
          H2
        </button>
        <button
          type="button"
          className={isActive('heading', { level: 3 }) ? 'is-active' : ''}
          disabled={!ready}
          onClick={() =>
            run((e) =>
              e.chain().focus().toggleHeading({ level: 3 }).run(),
            )
          }
          title="소제목"
        >
          H3
        </button>
      </div>

      <div className="top-menu__group">
        <button
          type="button"
          className={isActive('orderedList') ? 'is-active' : ''}
          disabled={!ready}
          onClick={() =>
            run((e) => e.chain().focus().toggleOrderedList().run())
          }
          title="번호 목록"
        >
          1.
        </button>
        <button
          type="button"
          className={isActive('bulletList') ? 'is-active' : ''}
          disabled={!ready}
          onClick={() =>
            run((e) => e.chain().focus().toggleBulletList().run())
          }
          title="글머리 목록"
        >
          •
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => run((e) => e.chain().focus().sinkListItem('listItem').run())}
          title="목록 들여쓰기"
        >
          →
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => run((e) => e.chain().focus().liftListItem('listItem').run())}
          title="목록 내어쓰기"
        >
          ←
        </button>
        {olActive && (
          <label
            className="top-menu__ol-start"
            title="번호 목록 시작 번호"
          >
            시작
            <input
              type="number"
              min={1}
              value={olStart}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (!Number.isFinite(v) || v < 1) return
                run((ed) =>
                  ed
                    .chain()
                    .focus()
                    .updateAttributes('orderedList', { start: v })
                    .run(),
                )
              }}
            />
          </label>
        )}
      </div>

      <div className="top-menu__group">
        <div className="top-menu__dropdown" ref={boxRef}>
          <button
            ref={boxBtnRef}
            type="button"
            className="top-menu__select"
            disabled={!ready}
            onClick={() => (boxOpen ? setBoxOpen(false) : openBoxMenu())}
            aria-haspopup="menu"
            aria-expanded={boxOpen}
          >
            박스 삽입 ▾
          </button>
          {boxOpen && boxPos && (
            <div
              ref={boxMenuRef}
              className="top-menu__menu"
              role="menu"
              style={{ left: boxPos.left, top: boxPos.top }}
            >
              {BOX_VARIANTS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setBoxOpen(false)
                    run((ed) => ed.chain().focus().insertBox(v.value).run())
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          disabled={!ready}
          onClick={() =>
            run((e) =>
              e
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run(),
            )
          }
          title="표 삽입"
        >
          표
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => run((e) => e.chain().focus().insertMathInline('').run())}
          title="인라인 수식"
        >
          ∑
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => run((e) => e.chain().focus().insertMathBlock('').run())}
          title="블록 수식"
        >
          ∫
        </button>
      </div>

      <div className="top-menu__group">
        <button
          type="button"
          disabled={!ready}
          onClick={onPageBreak}
          title="페이지 나눔 삽입"
        >
          ⤓ 페이지 나눔
        </button>
      </div>

      <div className="top-menu__group" title="기출 문제로 응용하기">
        <button
          type="button"
          disabled={!ready}
          onClick={() =>
            run((e) => e.chain().focus().insertApplyPage().run())
          }
          title="응용 문제 페이지 생성 (제목 + 1번 문제)"
        >
          응용 페이지
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() =>
            run((e) => {
              const num = countApplyItems(e) + 1
              e.chain().focus().insertApplyItem(num).run()
            })
          }
          title="응용 문제 1개 추가"
        >
          + 응용 문제
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() =>
            run((e) => e.chain().focus().insertApplyBogi().run())
          }
          title="보기 박스 삽입"
        >
          [보기]
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => run((e) => e.chain().focus().setApplyTag('concept').run())}
          title="개념 다시보기 태그"
        >
          📚
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => run((e) => e.chain().focus().setApplyTag('exam').run())}
          title="시험 대비하기 태그"
        >
          🎯
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => run((e) => e.chain().focus().setApplyTag('problem').run())}
          title="문제 살펴보기 태그"
        >
          🔍
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => run((e) => e.chain().focus().setApplyTag('options').run())}
          title="선지 살펴보기 태그"
        >
          ✅
        </button>
      </div>

      <div className="top-menu__group" title="확대/축소">
        <button type="button" onClick={onZoomOut} title="축소">
          −
        </button>
        <button
          type="button"
          onClick={onZoomReset}
          title="100%로 되돌리기"
          className="top-menu__zoom-label"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button type="button" onClick={onZoomIn} title="확대">
          +
        </button>
      </div>
    </div>
  )
}
