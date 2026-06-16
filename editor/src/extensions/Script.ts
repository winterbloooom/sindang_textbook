import { Mark, mergeAttributes } from '@tiptap/core'

export const Subscript = Mark.create({
  name: 'subscript',
  group: 'script',
  excludes: 'script',

  parseHTML() {
    return [{ tag: 'sub' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['sub', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleSubscript:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
    }
  },

  addKeyboardShortcuts() {
    // Cmd+Shift+- (= Cmd+_) → 아랫첨자
    return {
      'Mod-_': () => this.editor.commands.toggleMark(this.name),
    }
  },
})

export const Superscript = Mark.create({
  name: 'superscript',
  group: 'script',
  excludes: 'script',

  parseHTML() {
    return [{ tag: 'sup' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['sup', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleSuperscript:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
    }
  },

  addKeyboardShortcuts() {
    // Cmd+Shift+= (= Cmd++) → 윗첨자
    return {
      'Mod-+': () => this.editor.commands.toggleMark(this.name),
    }
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    subscript: { toggleSubscript: () => ReturnType }
    superscript: { toggleSuperscript: () => ReturnType }
  }
}
