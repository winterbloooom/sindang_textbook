import { NodeViewWrapper } from '@tiptap/react'

export function PageBreakView() {
  return (
    <NodeViewWrapper
      as="div"
      className="page-break"
      data-page-break=""
    />
  )
}
