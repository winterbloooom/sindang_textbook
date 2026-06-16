import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { PageBreakView } from '../components/PageBreakView'

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      fromPage: {
        default: null,
        parseHTML: (el) => {
          const v = (el as HTMLElement).getAttribute('data-from-page')
          return v ? Number(v) : null
        },
        renderHTML: (attrs) =>
          attrs.fromPage != null
            ? { 'data-from-page': String(attrs.fromPage) }
            : {},
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-page-break]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { ...HTMLAttributes, 'data-page-break': '', class: 'page-break' },
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageBreakView)
  },

  addCommands() {
    return {
      insertPageBreak:
        () =>
        ({ chain, editor }) => {
          const view = editor.view
          const fromPos = editor.state.selection.from
          const coords = view.coordsAtPos(fromPos)
          const frame = view.dom.closest('.chapter-frame') as HTMLElement | null
          const sentinel = frame?.querySelector(
            '.chapter-frame__sentinel',
          ) as HTMLElement | null
          let fromPage: number | null = null
          if (frame && sentinel) {
            const pageHeight = sentinel.getBoundingClientRect().height
            if (pageHeight > 0) {
              const cycle = pageHeight + (8 / 297) * pageHeight
              const top = coords.top - frame.getBoundingClientRect().top
              fromPage = Math.max(0, Math.floor(top / cycle))
            }
          }
          return chain()
            .insertContent({ type: this.name, attrs: { fromPage } })
            .run()
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.commands.insertPageBreak(),
    }
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      insertPageBreak: () => ReturnType
    }
  }
}
