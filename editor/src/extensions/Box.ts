import { Node, mergeAttributes } from '@tiptap/core'

export const BoxHead = Node.create({
  name: 'boxHead',
  content: 'inline*',
  defining: true,
  selectable: false,

  parseHTML() {
    return [{ tag: 'div.bx-head' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ class: 'bx-head' }, HTMLAttributes), 0]
  },
})

export const BoxBody = Node.create({
  name: 'boxBody',
  content: 'block+',
  defining: true,

  parseHTML() {
    return [{ tag: 'div.bx-body' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ class: 'bx-body' }, HTMLAttributes), 0]
  },
})

export const Box = Node.create({
  name: 'box',
  group: 'block',
  content: 'boxHead boxBody',
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'default',
        parseHTML: (el) => el.getAttribute('data-variant') ?? 'default',
        renderHTML: (attrs) =>
          attrs.variant && attrs.variant !== 'default'
            ? { 'data-variant': attrs.variant }
            : {},
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div.bx' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ class: 'bx' }, HTMLAttributes), 0]
  },

  addCommands() {
    const titles: Record<string, string> = {
      obj: '학습 목표',
      review: '지난 시간 복습하기',
      exam: '기출 유형',
      ref: '부가설명',
      prob: '대표 기출 문제',
    }
    return {
      insertBox:
        (variant = 'default') =>
        ({ commands }) => {
          const title = titles[variant] ?? '박스 제목'
          return commands.insertContent({
            type: this.name,
            attrs: { variant },
            content: [
              {
                type: 'boxHead',
                content: [{ type: 'text', text: title }],
              },
              {
                type: 'boxBody',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: '박스 내용' }],
                  },
                ],
              },
            ],
          })
        },
    }
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    box: {
      insertBox: (variant?: string) => ReturnType
    }
  }
}
