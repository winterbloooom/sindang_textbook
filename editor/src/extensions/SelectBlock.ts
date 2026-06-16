import { Extension } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'

export const SelectBlock = Extension.create({
  name: 'selectBlock',

  addKeyboardShortcuts() {
    return {
      'Mod-a': ({ editor }) => {
        const { state, view } = editor
        const { $from } = state.selection

        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d)
          if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
            const start = $from.start(d)
            const end = start + node.content.size
            view.dispatch(
              state.tr.setSelection(TextSelection.create(state.doc, start, end)),
            )
            return true
          }
        }

        for (let d = $from.depth; d >= 0; d--) {
          const node = $from.node(d)
          if (node.isTextblock) {
            const start = $from.start(d)
            const end = start + node.content.size
            view.dispatch(
              state.tr.setSelection(TextSelection.create(state.doc, start, end)),
            )
            return true
          }
        }

        return false
      },
    }
  },
})
