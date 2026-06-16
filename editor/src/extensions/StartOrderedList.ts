import { OrderedList } from '@tiptap/extension-list'
import { mergeAttributes } from '@tiptap/core'

// OrderedList that renders inline `counter-reset` so the project's custom
// CSS counter (`ol1`) honors the `start` attribute.
export const StartOrderedList = OrderedList.extend({
  renderHTML({ HTMLAttributes }) {
    const start = Number(HTMLAttributes.start) || 1
    const extra: Record<string, string> = {}
    if (start !== 1) {
      extra.style =
        `counter-reset: ol1 ${start - 1}` +
        (HTMLAttributes.style ? `; ${HTMLAttributes.style}` : '')
    }
    return ['ol', mergeAttributes(HTMLAttributes, extra), 0]
  },
})
