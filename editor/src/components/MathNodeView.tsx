import { useEffect, useRef, useState } from 'react'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import './MathNodeView.css'

export function MathNodeView({ node, updateAttributes, editor }: NodeViewProps) {
  const isBlock = node.type.name === 'mathBlock'
  const latex = (node.attrs.latex ?? '') as string
  const [editing, setEditing] = useState(latex.length === 0)
  const [draft, setDraft] = useState(latex)
  const renderRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    setDraft(latex)
  }, [latex])

  useEffect(() => {
    if (editing || !renderRef.current) return
    try {
      katex.render(latex, renderRef.current, {
        throwOnError: false,
        displayMode: isBlock,
        output: 'html',
      })
    } catch {
      renderRef.current.textContent = latex
    }
  }, [latex, editing, isBlock])

  const commit = () => {
    updateAttributes({ latex: draft })
    setEditing(false)
    setTimeout(() => editor.commands.focus(), 0)
  }

  const cancel = () => {
    setDraft(latex)
    setEditing(false)
  }

  return (
    <NodeViewWrapper
      as={isBlock ? 'div' : 'span'}
      className={isBlock ? 'math math--block' : 'math math--inline'}
    >
      {editing ? (
        <input
          className="math__input"
          autoFocus
          type="text"
          value={draft}
          placeholder="LaTeX 입력"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              commit()
            } else if (e.key === 'Escape') {
              e.preventDefault()
              cancel()
            }
          }}
        />
      ) : (
        <span
          ref={renderRef}
          className="math__render"
          onClick={() => setEditing(true)}
        />
      )}
    </NodeViewWrapper>
  )
}
