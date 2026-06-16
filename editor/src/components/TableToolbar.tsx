import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { CellSelection, TableMap } from '@tiptap/pm/tables'
import './TableToolbar.css'

type Props = { editor: Editor }

type Align = 'left' | 'center' | 'right'
type VAlign = 'top' | 'middle' | 'bottom'
type Side = 'top' | 'right' | 'bottom' | 'left'

const COLORS: Array<{ label: string; value: string | null }> = [
  { label: '없음', value: null },
  { label: '회색', value: '#eceff1' },
  { label: '노랑', value: '#fff9c4' },
  { label: '초록', value: '#e8f5e9' },
  { label: '파랑', value: '#e3f2fd' },
  { label: '빨강', value: '#ffebee' },
]

function HAlignIcon({ align }: { align: Align }) {
  const lines: Array<{ x1: number; x2: number }> = [
    { x1: 2, x2: 14 },
    align === 'left'
      ? { x1: 2, x2: 10 }
      : align === 'right'
        ? { x1: 6, x2: 14 }
        : { x1: 4, x2: 12 },
    { x1: 2, x2: 14 },
    align === 'left'
      ? { x1: 2, x2: 8 }
      : align === 'right'
        ? { x1: 8, x2: 14 }
        : { x1: 5, x2: 11 },
  ]
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          x2={l.x2}
          y1={3 + i * 3}
          y2={3 + i * 3}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

function VAlignIcon({ valign }: { valign: VAlign }) {
  const barY = valign === 'top' ? 3 : valign === 'bottom' ? 13 : 8
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <line
        x1="4.5"
        x2="11.5"
        y1={barY}
        y2={barY}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function BorderIcon({ side, hidden }: { side: Side; hidden: boolean }) {
  const active = 'currentColor'
  const dim = '#d7d7dc'
  const edge = hidden ? dim : active
  const rest = hidden ? active : dim
  const top = side === 'top' ? edge : rest
  const right = side === 'right' ? edge : rest
  const bottom = side === 'bottom' ? edge : rest
  const left = side === 'left' ? edge : rest
  const strong = 2
  const weak = 1
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
      <line
        x1="2"
        y1="2"
        x2="14"
        y2="2"
        stroke={top}
        strokeWidth={side === 'top' ? strong : weak}
        strokeDasharray={side === 'top' && hidden ? '2 2' : undefined}
      />
      <line
        x1="14"
        y1="2"
        x2="14"
        y2="14"
        stroke={right}
        strokeWidth={side === 'right' ? strong : weak}
        strokeDasharray={side === 'right' && hidden ? '2 2' : undefined}
      />
      <line
        x1="2"
        y1="14"
        x2="14"
        y2="14"
        stroke={bottom}
        strokeWidth={side === 'bottom' ? strong : weak}
        strokeDasharray={side === 'bottom' && hidden ? '2 2' : undefined}
      />
      <line
        x1="2"
        y1="2"
        x2="2"
        y2="14"
        stroke={left}
        strokeWidth={side === 'left' ? strong : weak}
        strokeDasharray={side === 'left' && hidden ? '2 2' : undefined}
      />
    </svg>
  )
}

export function TableToolbar({ editor }: Props) {
  const [, force] = useState(0)

  useEffect(() => {
    const handler = () => force((n) => n + 1)
    editor.on('selectionUpdate', handler)
    editor.on('transaction', handler)
    return () => {
      editor.off('selectionUpdate', handler)
      editor.off('transaction', handler)
    }
  }, [editor])

  if (!editor.isActive('table')) return null

  const cellAttrs = editor.getAttributes('tableCell')
  const headerAttrs = editor.getAttributes('tableHeader')
  const currentAlign = (cellAttrs.align ?? headerAttrs.align ?? 'center') as Align
  const currentVAlign = (cellAttrs.valign ?? headerAttrs.valign ?? 'middle') as VAlign
  const hidden = (cellAttrs.hideBorders ?? headerAttrs.hideBorders ?? []) as Side[]
  const currentColor = (cellAttrs.bgColor ?? headerAttrs.bgColor ?? null) as string | null

  const setAlign = (align: Align) => {
    editor
      .chain()
      .focus()
      .updateAttributes('tableCell', { align })
      .updateAttributes('tableHeader', { align })
      .run()
  }

  const setVAlign = (valign: VAlign) => {
    editor
      .chain()
      .focus()
      .updateAttributes('tableCell', { valign })
      .updateAttributes('tableHeader', { valign })
      .run()
  }

  const toggleBorder = (side: Side) => {
    const next = hidden.includes(side)
      ? hidden.filter((s) => s !== side)
      : [...hidden, side]
    editor
      .chain()
      .focus()
      .updateAttributes('tableCell', { hideBorders: next })
      .updateAttributes('tableHeader', { hideBorders: next })
      .run()
  }

  const equalizeSelectedCols = () => {
    const sel = editor.state.selection
    if (!(sel instanceof CellSelection)) return
    const tablePos = sel.$anchorCell.before(-1)
    const tableNode = sel.$anchorCell.node(-1)
    const map = TableMap.get(tableNode)
    const tableStart = tablePos + 1

    const aRect = map.findCell(sel.$anchorCell.pos - tableStart)
    const hRect = map.findCell(sel.$headCell.pos - tableStart)
    const startCol = Math.min(aRect.left, hRect.left)
    const endCol = Math.max(aRect.right, hRect.right) // exclusive

    // Measure current width per column from DOM (use first row's cells).
    const tableDom = editor.view.nodeDOM(tablePos) as HTMLElement | null
    const tableEl = tableDom?.querySelector('table') as HTMLTableElement | null
    if (!tableEl) return
    const firstRow = tableEl.rows[0]
    if (!firstRow) return
    const colWidths: number[] = []
    let cellOffset = 0
    for (let c = 0; c < firstRow.cells.length; c++) {
      const cell = firstRow.cells[c]
      const span = cell.colSpan || 1
      const w = cell.getBoundingClientRect().width / span
      for (let k = 0; k < span; k++) colWidths[cellOffset + k] = w
      cellOffset += span
    }

    let total = 0
    for (let c = startCol; c < endCol; c++) total += colWidths[c] ?? 0
    const colCount = endCol - startCol
    if (colCount <= 0 || total <= 0) return
    const avg = Math.round(total / colCount)

    const tr = editor.state.tr
    const seen = new Set<number>()
    for (let row = 0; row < map.height; row++) {
      for (let col = startCol; col < endCol; col++) {
        const cellPos = map.map[row * map.width + col]
        if (seen.has(cellPos)) continue
        seen.add(cellPos)
        const docPos = tableStart + cellPos
        const cell = tableNode.nodeAt(cellPos)
        if (!cell) continue
        const cellRect = map.findCell(cellPos)
        const localStart = Math.max(0, startCol - cellRect.left)
        const localEnd = Math.min(cell.attrs.colspan ?? 1, endCol - cellRect.left)
        const cw = cell.attrs.colwidth
          ? [...cell.attrs.colwidth]
          : new Array(cell.attrs.colspan ?? 1).fill(null)
        for (let k = localStart; k < localEnd; k++) cw[k] = avg
        tr.setNodeMarkup(docPos, undefined, { ...cell.attrs, colwidth: cw })
      }
    }
    editor.view.dispatch(tr)
  }

  const setColor = (value: string | null) => {
    editor
      .chain()
      .focus()
      .updateAttributes('tableCell', { bgColor: value })
      .updateAttributes('tableHeader', { bgColor: value })
      .run()
  }

  return (
    <div className="table-toolbar">
      <div className="table-toolbar__group">
        <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()}>행↑</button>
        <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>행↓</button>
        <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()}>열←</button>
        <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>열→</button>
        <button type="button" onClick={() => editor.chain().focus().deleteRow().run()}>행 삭제</button>
        <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()}>열 삭제</button>
      </div>
      <div className="table-toolbar__group">
        <button type="button" onClick={() => editor.chain().focus().mergeCells().run()}>병합</button>
        <button type="button" onClick={() => editor.chain().focus().splitCell().run()}>분할</button>
        <button
          type="button"
          onClick={equalizeSelectedCols}
          title="선택한 열의 너비를 동일하게"
        >
          열 균등
        </button>
      </div>
      <div className="table-toolbar__group" title="가로 정렬">
        {(['left', 'center', 'right'] as Align[]).map((a) => (
          <button
            key={a}
            type="button"
            className={
              'table-toolbar__icon' + (currentAlign === a ? ' is-active' : '')
            }
            onClick={() => setAlign(a)}
            title={a === 'left' ? '왼쪽' : a === 'right' ? '오른쪽' : '가운데'}
          >
            <HAlignIcon align={a} />
          </button>
        ))}
      </div>
      <div className="table-toolbar__group" title="세로 정렬">
        {(['top', 'middle', 'bottom'] as VAlign[]).map((v) => (
          <button
            key={v}
            type="button"
            className={
              'table-toolbar__icon' + (currentVAlign === v ? ' is-active' : '')
            }
            onClick={() => setVAlign(v)}
            title={v === 'top' ? '위' : v === 'bottom' ? '아래' : '중간'}
          >
            <VAlignIcon valign={v} />
          </button>
        ))}
      </div>
      <div className="table-toolbar__group" title="테두리 (점선이 숨김 상태)">
        {(['top', 'right', 'bottom', 'left'] as Side[]).map((side) => (
          <button
            key={side}
            type="button"
            className={
              'table-toolbar__icon' +
              (hidden.includes(side) ? ' is-off' : '')
            }
            onClick={() => toggleBorder(side)}
            title={`${sideLabel(side)} 테두리`}
          >
            <BorderIcon side={side} hidden={hidden.includes(side)} />
          </button>
        ))}
      </div>
      <div className="table-toolbar__group" title="셀 배경색">
        {COLORS.map((c) => (
          <button
            key={c.label}
            type="button"
            className={
              'table-toolbar__swatch' +
              (currentColor === c.value ? ' is-active' : '')
            }
            style={{
              background: c.value ?? 'transparent',
            }}
            onClick={() => setColor(c.value)}
            title={c.label}
          >
            {c.value === null ? '∅' : ''}
          </button>
        ))}
      </div>
      <div className="table-toolbar__group">
        <button
          type="button"
          className="table-toolbar__danger"
          onClick={() => editor.chain().focus().deleteTable().run()}
        >
          표 삭제
        </button>
      </div>
    </div>
  )
}

function sideLabel(side: Side) {
  return side === 'top'
    ? '위'
    : side === 'right'
      ? '오른쪽'
      : side === 'bottom'
        ? '아래'
        : '왼쪽'
}
