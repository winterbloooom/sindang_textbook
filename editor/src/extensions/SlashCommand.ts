import { Extension, type Editor, type Range } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import { SlashMenu, type SlashMenuHandle } from '../components/SlashMenu'
import { insertImageFiles } from './ImageDrop'

function pickImageFiles(): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = () => {
      const files = input.files ? Array.from(input.files) : []
      resolve(files)
    }
    input.oncancel = () => resolve([])
    input.click()
  })
}

export type SlashCommandItem = {
  title: string
  hint?: string
  run: (props: { editor: Editor; range: Range }) => void
}

export const defaultSlashItems: SlashCommandItem[] = [
  {
    title: '학습 목표',
    hint: '민트 톤 박스',
    run: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertBox('obj').run()
    },
  },
  {
    title: '지난 시간 복습하기',
    hint: '파랑 톤 박스',
    run: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertBox('review').run()
    },
  },
  {
    title: '기출 유형',
    hint: '코랄 톤 박스',
    run: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertBox('exam').run()
    },
  },
  {
    title: '부가설명',
    hint: '회색 톤 박스',
    run: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertBox('ref').run()
    },
  },
  {
    title: '대표 기출 문제',
    hint: '페이지 하단 고정 박스 (코랄)',
    run: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertBox('prob').run()
    },
  },
  {
    title: '제목',
    hint: 'H2 제목',
    run: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run()
    },
  },
  {
    title: '번호 목록',
    run: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    title: '글머리 목록',
    run: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: '수식 (블록)',
    hint: 'LaTeX 블록 수식',
    run: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertMathBlock('').run()
    },
  },
  {
    title: '수식 (인라인)',
    hint: '$...$ 도 가능',
    run: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertMathInline('').run()
    },
  },
  {
    title: '그림',
    hint: '파일에서 이미지 삽입',
    run: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run()
      void (async () => {
        const files = await pickImageFiles()
        if (files.length === 0) return
        await insertImageFiles(editor, files)
      })()
    },
  },
  {
    title: '표',
    hint: '3×3 기본',
    run: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run()
    },
  },
  {
    title: '페이지 나눔',
    hint: '여기서 다음 페이지로 끊기',
    run: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertPageBreak().run()
    },
  },
]

type Opts = { items: SlashCommandItem[] }

export const SlashCommand = Extension.create<Opts>({
  name: 'slashCommand',

  addOptions() {
    return { items: defaultSlashItems }
  },

  addProseMirrorPlugins() {
    const options = this.options
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        startOfLine: false,
        command: ({ editor, range, props }) => {
          ;(props as SlashCommandItem).run({ editor, range })
        },
        items: ({ query }) =>
          options.items.filter((i) =>
            i.title.toLowerCase().includes(query.toLowerCase()),
          ),
        render: () => {
          let component: ReactRenderer<SlashMenuHandle> | null = null
          let popup: TippyInstance | null = null

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashMenu, {
                props,
                editor: props.editor,
              })
              if (!props.clientRect) return
              popup = tippy(document.body, {
                getReferenceClientRect: () =>
                  props.clientRect?.() ?? new DOMRect(),
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              })
            },
            onUpdate(props) {
              component?.updateProps(props)
              if (!props.clientRect) return
              popup?.setProps({
                getReferenceClientRect: () =>
                  props.clientRect?.() ?? new DOMRect(),
              })
            },
            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup?.hide()
                return true
              }
              return component?.ref?.onKeyDown(props) ?? false
            },
            onExit() {
              popup?.destroy()
              component?.destroy()
              popup = null
              component = null
            },
          }
        },
      }),
    ]
  },
})
