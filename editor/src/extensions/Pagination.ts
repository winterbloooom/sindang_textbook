import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { EditorView } from '@tiptap/pm/view'

const PAGE_HEIGHT_MM = 297
const PAGE_GAP_MM = 8
const PAGE_TOP_PAD_MM = 16
const PAGE_BOTTOM_PAD_MM = 18

type Push = { from: number; to: number; height: number; tag: string }

const paginationKey = new PluginKey<DecorationSet>('pagination')

function readCurrentPush(view: EditorView, from: number): number {
  const set = paginationKey.getState(view.state)
  if (!set) return 0
  const decos = set.find(from, from + 1)
  for (const d of decos) {
    // Decoration.node stores attrs in d.type.attrs for newer PM
    const anyD = d as unknown as {
      type?: { attrs?: { style?: string } }
      from?: number
    }
    if (anyD.from !== from) continue
    const m = anyD.type?.attrs?.style?.match(/margin-top:\s*([\d.]+)px/)
    if (m) return parseFloat(m[1])
  }
  return 0
}

function buildPushes(view: EditorView): Push[] {
  const frame = view.dom.closest('.chapter-frame') as HTMLElement | null
  if (!frame) return []
  const sentinel = frame.querySelector(
    '.chapter-frame__sentinel',
  ) as HTMLElement | null
  if (!sentinel) return []
  const pageHeight = sentinel.getBoundingClientRect().height
  if (pageHeight <= 0) return []
  const gap = (PAGE_GAP_MM / PAGE_HEIGHT_MM) * pageHeight
  const topPad = (PAGE_TOP_PAD_MM / PAGE_HEIGHT_MM) * pageHeight
  const bottomPad = (PAGE_BOTTOM_PAD_MM / PAGE_HEIGHT_MM) * pageHeight
  const cycle = pageHeight + gap

  const frameTop = frame.getBoundingClientRect().top

  type Entry = {
    el: HTMLElement
    from: number
    to: number
    isPageBreak: boolean
    fromPage: number | null
  }
  const entries: Entry[] = []
  let runningPos = 0
  view.state.doc.forEach((node) => {
    const dom = view.nodeDOM(runningPos) as HTMLElement | null
    if (dom && dom.nodeType === 1) {
      const isPageBreak = node.type.name === 'pageBreak'
      const fromPage = isPageBreak
        ? typeof node.attrs.fromPage === 'number'
          ? node.attrs.fromPage
          : null
        : null
      entries.push({
        el: dom,
        from: runningPos,
        to: runningPos + node.nodeSize,
        isPageBreak,
        fromPage,
      })
    }
    runningPos += node.nodeSize
  })

  const pushes: Push[] = []
  let pendingForceFromPage: number | null = null
  // Cumulative delta (newPush - oldPush) from previous blocks in this pass,
  // which would shift this block's hostTop in the resulting layout.
  let cumulativeDelta = 0

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]
    const r = e.el.getBoundingClientRect()
    const measuredTop = r.top - frameTop
    const measuredBottom = r.bottom - frameTop
    const myCurrent = readCurrentPush(view, e.from)

    // hostTop: where this block would sit if its OWN push were 0, with the
    // up-to-date pushes of previous blocks already applied.
    const hostTop = measuredTop - myCurrent + cumulativeDelta
    const hostBottom = measuredBottom - myCurrent + cumulativeDelta

    if (e.isPageBreak) {
      pendingForceFromPage =
        e.fromPage ?? Math.floor(hostTop / cycle)
      cumulativeDelta += -myCurrent
      continue
    }

    let desiredTop = hostTop
    if (pendingForceFromPage != null) {
      desiredTop = (pendingForceFromPage + 1) * cycle + topPad
      pendingForceFromPage = null
    } else {
      const pageIdx = Math.max(0, Math.floor(hostTop / cycle))
      const pageStart = pageIdx * cycle
      const usableTop = pageIdx === 0 ? pageStart : pageStart + topPad
      const pageBottomLimit = pageStart + pageHeight - bottomPad
      if (hostTop < usableTop && pageIdx > 0) {
        desiredTop = usableTop
      } else if (hostBottom > pageBottomLimit) {
        desiredTop = (pageIdx + 1) * cycle + topPad
      }
    }

    const newPush = Math.max(0, desiredTop - hostTop)
    if (newPush > 0.5) {
      pushes.push({ from: e.from, to: e.to, height: newPush, tag: `p${i}` })
    }
    cumulativeDelta += newPush - myCurrent
  }
  return pushes
}

function makeDecorations(pushes: Push[]): Decoration[] {
  return pushes.map((p) =>
    Decoration.node(p.from, p.to, {
      class: 'pg-push',
      style: `margin-top: ${p.height}px`,
    }),
  )
}

function pushesHash(pushes: Push[]): string {
  return pushes
    .map((p) => `${p.from}-${p.to}:${Math.round(p.height)}`)
    .join('|')
}

export const Pagination = Extension.create({
  name: 'pagination',

  addProseMirrorPlugins() {
    return [
      new Plugin<DecorationSet>({
        key: paginationKey,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, old) {
            const meta = tr.getMeta(paginationKey)
            if (meta) return meta as DecorationSet
            return old.map(tr.mapping, tr.doc)
          },
        },
        props: {
          decorations(state) {
            return paginationKey.getState(state)
          },
        },
        view(view) {
          let raf = 0
          let prevHash = ''
          let iterations = 0
          const recalc = () => {
            raf = 0
            const pushes = buildPushes(view)
            const hash = pushesHash(pushes)
            if (hash === prevHash) {
              iterations = 0
              return
            }
            iterations += 1
            // safety: stop runaway loops
            if (iterations > 8) {
              iterations = 0
              prevHash = hash
              return
            }
            prevHash = hash
            const decorations = makeDecorations(pushes)
            const set = DecorationSet.create(view.state.doc, decorations)
            const tr = view.state.tr
              .setMeta(paginationKey, set)
              .setMeta('addToHistory', false)
            view.dispatch(tr)
          }
          const schedule = () => {
            if (raf) return
            raf = window.requestAnimationFrame(recalc)
          }
          schedule()
          const onResize = () => {
            prevHash = ''
            schedule()
          }
          window.addEventListener('resize', onResize)
          return {
            update: schedule,
            destroy() {
              if (raf) cancelAnimationFrame(raf)
              window.removeEventListener('resize', onResize)
            },
          }
        },
      }),
    ]
  },
})
