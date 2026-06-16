import { Node, mergeAttributes } from '@tiptap/core'

export const Example = Node.create({
  name: 'example',
  group: 'inline',
  inline: true,
  content: 'text*',

  parseHTML() {
    return [
      {
        tag: 'span.ex',
        contentElement: 'span:not(.ex-badge)',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes({ class: 'ex' }, HTMLAttributes),
      ['span', { class: 'ex-badge', contenteditable: 'false' }, '예'],
      ['span', {}, 0],
    ]
  },
})
