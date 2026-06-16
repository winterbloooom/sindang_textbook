import { Extension } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import Image from '@tiptap/extension-image'
import { fsRef, saveFigure } from '../fs'
import { ImageNodeView } from '../components/ImageNodeView'

export const ImageWithView = Image.extend({
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => {
          const w = (el as HTMLElement).style.width || el.getAttribute('width')
          return w || null
        },
        renderHTML: () => ({}),
      },
      height: {
        default: null,
        parseHTML: (el) => {
          const h = (el as HTMLElement).style.height || el.getAttribute('height')
          return h || null
        },
        renderHTML: () => ({}),
      },
      align: {
        default: 'none',
        parseHTML: (el) =>
          (el as HTMLElement).getAttribute('data-align') || 'none',
        renderHTML: (attrs) =>
          attrs.align && attrs.align !== 'none'
            ? { 'data-align': attrs.align }
            : {},
      },
    }
  },
  renderHTML({ HTMLAttributes, node }) {
    const styles: string[] = []
    if (node.attrs.width) styles.push(`width: ${node.attrs.width}`)
    if (node.attrs.height) styles.push(`height: ${node.attrs.height}`)
    if (styles.length) {
      const existing = HTMLAttributes.style ? `${HTMLAttributes.style}; ` : ''
      HTMLAttributes = { ...HTMLAttributes, style: existing + styles.join('; ') }
    }
    return ['img', HTMLAttributes]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },
})

export { ImageWithView as Image }

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function fileToSrc(file: File): Promise<string> {
  if (fsRef.folder) {
    try {
      const name = await saveFigure(fsRef.folder, file)
      const url = URL.createObjectURL(file)
      fsRef.addFigureUrl?.(name, url)
      return name
    } catch (err) {
      console.error('figure save failed, falling back to data url', err)
    }
  }
  return await fileToDataUrl(file)
}

export async function insertImageFiles(
  editor: { view: { state: any; dispatch: (tr: any) => void } },
  files: File[],
  pos?: number,
) {
  const view = editor.view
  for (const file of files) {
    const src = await fileToSrc(file)
    const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)
    const attrs: Record<string, unknown> = { src }
    if (isSvg) attrs.width = '60%'
    const node = view.state.schema.nodes.image.create(attrs)

    let tr = view.state.tr
    if (pos != null) {
      tr = tr.insert(pos, node)
    } else {
      // Replace the current selection (or the enclosing empty paragraph)
      // so we don't leave a blank line above the image.
      const { $from, from, to } = view.state.selection
      const parent = $from.parent
      if (
        from === to &&
        parent.type.name === 'paragraph' &&
        parent.content.size === 0
      ) {
        const start = $from.before($from.depth)
        const end = $from.after($from.depth)
        tr = tr.replaceWith(start, end, node)
      } else {
        tr = tr.replaceSelectionWith(node, false)
      }
    }
    view.dispatch(tr)
  }
}

export const ImageDrop = Extension.create({
  name: 'imageDrop',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageDrop'),
        props: {
          handleDOMEvents: {
            drop: (view, event) => {
              const files = event.dataTransfer?.files
              if (!files || files.length === 0) return false
              const images = Array.from(files).filter((f) =>
                f.type.startsWith('image/'),
              )
              if (images.length === 0) return false
              event.preventDefault()
              const coords = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              })
              const pos = coords?.pos ?? view.state.doc.content.size
              void insertImageFiles({ view }, images, pos)
              return true
            },
            paste: (view, event) => {
              const items = event.clipboardData?.items
              if (!items) return false
              const images: File[] = []
              for (const item of Array.from(items)) {
                if (item.kind === 'file' && item.type.startsWith('image/')) {
                  const f = item.getAsFile()
                  if (f) images.push(f)
                }
              }
              if (images.length === 0) return false
              event.preventDefault()
              void insertImageFiles({ view }, images)
              return true
            },
          },
        },
      }),
    ]
  },
})
