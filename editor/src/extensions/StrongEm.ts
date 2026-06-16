import { Mark, mergeAttributes } from '@tiptap/core'

export const StrongEm = Mark.create({
  name: 'strongEm',

  parseHTML() {
    return [{ tag: 'span.strong-em' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes({ class: 'strong-em' }, HTMLAttributes),
      0,
    ]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-h': () => this.editor.commands.toggleMark(this.name),
    }
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    strongEm: {
      toggleStrongEm: () => ReturnType
    }
  }
}
