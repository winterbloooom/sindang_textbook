import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { MathNodeView } from '../components/MathNodeView'

type MathAttrs = { latex: string }

const common = {
  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-latex') ?? '',
        renderHTML: (attrs: MathAttrs) => ({ 'data-latex': attrs.latex }),
      },
    }
  },
}

export const MathInline = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  ...common,

  parseHTML() {
    return [{ tag: 'span[data-math="inline"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes({ 'data-math': 'inline', class: 'math-inline' }, HTMLAttributes),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView)
  },

  addCommands() {
    return {
      insertMathInline:
        (latex = '') =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { latex },
          }),
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('mathInlineInputRule'),
        props: {
          handleTextInput: (view, from, to, text) => {
            if (text !== '$') return false
            const $from = view.state.doc.resolve(from)
            const parent = $from.parent
            const textBefore = parent.textBetween(
              0,
              $from.parentOffset,
              undefined,
              '￼',
            )
            const match = /\$([^$\n]+)$/.exec(textBefore)
            if (!match) return false
            const latex = match[1]
            const start = from - latex.length - 1
            const tr = view.state.tr
              .delete(start, to)
              .insert(
                start,
                view.state.schema.nodes.mathInline.create({ latex }),
              )
            view.dispatch(tr)
            return true
          },
        },
      }),
    ]
  },
})

export const MathBlock = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,
  selectable: true,
  ...common,

  parseHTML() {
    return [{ tag: 'div[data-math="block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ 'data-math': 'block', class: 'math-block' }, HTMLAttributes),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView)
  },

  addCommands() {
    return {
      insertMathBlock:
        (latex = '') =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { latex },
          }),
    }
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    math: {
      insertMathInline: (latex?: string) => ReturnType
      insertMathBlock: (latex?: string) => ReturnType
    }
  }
}
