import { Mark, Node, mergeAttributes } from '@tiptap/core'

export const ApplyTitle = Node.create({
  name: 'applyTitle',
  group: 'block',
  content: 'inline*',
  defining: true,

  parseHTML() {
    return [{ tag: 'div.apply-title' }, { tag: 'h1.apply-title' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ class: 'apply-title' }, HTMLAttributes), 0]
  },
})

export const ApplySrc = Node.create({
  name: 'applySrc',
  content: 'inline*',
  defining: true,

  parseHTML() {
    return [{ tag: 'p.apply-src' }, { tag: 'span.apply-src' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes({ class: 'apply-src' }, HTMLAttributes), 0]
  },
})

export const ApplyHead = Node.create({
  name: 'applyHead',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      num: {
        default: 1,
        parseHTML: (el) => {
          const n = el.querySelector('.apply-num')?.textContent ?? '1'
          return parseInt(n, 10) || 1
        },
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div.apply-head',
        contentElement: '.apply-q',
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const num = (node.attrs.num as number) ?? 1
    return [
      'div',
      mergeAttributes({ class: 'apply-head' }, HTMLAttributes),
      ['span', { class: 'apply-num', contenteditable: 'false' }, String(num)],
      ['p', { class: 'apply-q' }, 0],
    ]
  },
})

export const ApplyAns = Node.create({
  name: 'applyAns',
  content: 'inline*',
  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div.apply-ans',
        contentElement: '.apply-ans-text',
      },
      { tag: 'p.apply-ans' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ class: 'apply-ans' }, HTMLAttributes),
      ['span', { class: 'apply-ans-badge', contenteditable: 'false' }, '답'],
      ['span', { class: 'apply-ans-text' }, 0],
    ]
  },
})

export const ApplyBogi = Node.create({
  name: 'applyBogi',
  group: 'block',
  content: 'block+',
  defining: true,

  parseHTML() {
    return [{ tag: 'div.apply-bogi' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ class: 'apply-bogi' }, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      insertApplyBogi:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: 'applyBogi',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'ㄱ. ' }] },
              { type: 'paragraph', content: [{ type: 'text', text: 'ㄴ. ' }] },
              { type: 'paragraph', content: [{ type: 'text', text: 'ㄷ. ' }] },
            ],
          }),
    }
  },
})

export const ApplyLeft = Node.create({
  name: 'applyLeft',
  content: 'applySrc applyHead block*',
  defining: true,
  isolating: true,
  selectable: false,

  parseHTML() {
    return [{ tag: 'div.apply-left' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ class: 'apply-left' }, HTMLAttributes), 0]
  },
})

export const ApplyRight = Node.create({
  name: 'applyRight',
  content: 'applyAns block*',
  defining: true,
  isolating: true,
  selectable: false,

  parseHTML() {
    return [{ tag: 'div.apply-right' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ class: 'apply-right' }, HTMLAttributes), 0]
  },
})

export const ApplyItem = Node.create({
  name: 'applyItem',
  group: 'block',
  content: 'applyLeft applyRight',
  defining: true,

  parseHTML() {
    return [{ tag: 'div.apply-item' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ class: 'apply-item' }, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      insertApplyItem:
        (num = 1) =>
        ({ commands }) =>
          commands.insertContent(buildApplyItemJSON(num)),

      insertApplyPage:
        () =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: 'applyTitle',
              content: [{ type: 'text', text: '기출 문제로 응용하기' }],
            })
            .insertContent(buildApplyItemJSON(1))
            .run(),
    }
  },
})

const TAG_LABELS: Record<string, string> = {
  concept: '개념 다시보기',
  exam: '시험 대비하기',
  problem: '문제 살펴보기',
  options: '선지 살펴보기',
}

export const ApplyTag = Mark.create({
  name: 'applyTag',
  inclusive: false,
  excludes: '_',

  addAttributes() {
    return {
      kind: {
        default: 'concept',
        parseHTML: (el) => {
          const cls = el.getAttribute('class') ?? ''
          const m = cls.match(/t-(concept|exam|problem|options)/)
          return m ? m[1] : 'concept'
        },
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span.expl-tag' }]
  },

  renderHTML({ HTMLAttributes, mark }) {
    const kind = (mark.attrs.kind as string) || 'concept'
    return [
      'span',
      mergeAttributes(HTMLAttributes, { class: `expl-tag t-${kind}` }),
      0,
    ]
  },

  addCommands() {
    return {
      setApplyTag:
        (kind: string) =>
        ({ chain }) => {
          const label = TAG_LABELS[kind] ?? '태그'
          return chain()
            .insertContent({
              type: 'text',
              text: label,
              marks: [{ type: 'applyTag', attrs: { kind } }],
            })
            .run()
        },
    }
  },
})

function buildApplyItemJSON(num: number) {
  return {
    type: 'applyItem',
    content: [
      {
        type: 'applyLeft',
        content: [
          {
            type: 'applySrc',
            content: [{ type: 'text', text: 'YY학년도 R회 N번' }],
          },
          {
            type: 'applyHead',
            attrs: { num },
            content: [{ type: 'text', text: '문제 내용을 입력하세요.' }],
          },
          {
            type: 'orderedList',
            attrs: { start: 1 },
            content: [
              optLi('보기 1'),
              optLi('보기 2'),
              optLi('보기 3'),
              optLi('보기 4'),
            ],
          },
        ],
      },
      {
        type: 'applyRight',
        content: [
          {
            type: 'applyAns',
            content: [{ type: 'text', text: '② 정답을 입력하세요' }],
          },
          explPara('concept', '개념 설명을 입력하세요.'),
          explPara('problem', '문제 풀이를 입력하세요.'),
          explPara('exam', '시험 대비 팁을 입력하세요.'),
        ],
      },
    ],
  }
}

function optLi(text: string) {
  return {
    type: 'listItem',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  }
}

function explPara(kind: string, body: string) {
  return {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: TAG_LABELS[kind] ?? '태그',
        marks: [{ type: 'applyTag', attrs: { kind } }],
      },
      { type: 'text', text: ' ' + body },
    ],
  }
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    applyItem: {
      insertApplyItem: (num?: number) => ReturnType
      insertApplyPage: () => ReturnType
    }
    applyBogi: {
      insertApplyBogi: () => ReturnType
    }
    applyTag: {
      setApplyTag: (kind: string) => ReturnType
    }
  }
}
