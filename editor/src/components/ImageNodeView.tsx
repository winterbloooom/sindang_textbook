import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useFigures } from '../FigureContext'

function isEmbedded(src: string) {
  return src.startsWith('data:') || src.startsWith('http:') || src.startsWith('https:') || src.startsWith('blob:')
}

export function ImageNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const figures = useFigures()
  const src: string = node.attrs.src ?? ''
  const resolved = isEmbedded(src) ? src : (figures.urls[src] ?? '')
  const width: string | null = node.attrs.width ?? null
  const height: string | null = node.attrs.height ?? null
  const align: 'none' | 'left' | 'right' = node.attrs.align ?? 'none'
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const ratioRef = useRef<number | null>(null)

  const [lock, setLock] = useState(true)
  const [pxW, setPxW] = useState<number | null>(null)
  const [pxH, setPxH] = useState<number | null>(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    const sync = () => {
      const r = img.getBoundingClientRect()
      setPxW(Math.round(r.width))
      setPxH(Math.round(r.height))
      if (img.naturalWidth && img.naturalHeight) {
        ratioRef.current = img.naturalWidth / img.naturalHeight
      } else if (r.width && r.height) {
        ratioRef.current = r.width / r.height
      }
    }
    if (img.complete) sync()
    img.addEventListener('load', sync)
    const ro = new ResizeObserver(sync)
    ro.observe(img)
    return () => {
      img.removeEventListener('load', sync)
      ro.disconnect()
    }
  }, [resolved, width, height])

  const startResize = (e: ReactPointerEvent<HTMLSpanElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const wrap = wrapRef.current
    if (!wrap) return
    const containerWidth = wrap.getBoundingClientRect().width
    if (containerWidth <= 0) return
    const img = imgRef.current
    const startW = img ? img.getBoundingClientRect().width : containerWidth
    const startX = e.clientX

    const startPct = Math.min(100, Math.max(5, (startW / containerWidth) * 100))
    updateAttributes({ width: `${startPct.toFixed(1)}%`, height: null })

    let raf = 0
    let pendingPct = startPct
    const flush = () => {
      raf = 0
      updateAttributes({ width: `${pendingPct.toFixed(1)}%`, height: null })
    }
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const next = Math.max(40, startW + dx)
      pendingPct = Math.min(100, Math.max(5, (next / containerWidth) * 100))
      if (!raf) raf = requestAnimationFrame(flush)
    }
    const onUp = () => {
      if (raf) {
        cancelAnimationFrame(raf)
        flush()
      }
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const onWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10)
    if (!Number.isFinite(v) || v <= 0) return
    const attrs: Record<string, string | null> = { width: `${v}px` }
    if (lock && ratioRef.current) {
      attrs.height = `${Math.round(v / ratioRef.current)}px`
    }
    updateAttributes(attrs)
  }

  const onHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10)
    if (!Number.isFinite(v) || v <= 0) return
    const attrs: Record<string, string | null> = { height: `${v}px` }
    if (lock && ratioRef.current) {
      attrs.width = `${Math.round(v * ratioRef.current)}px`
    }
    updateAttributes(attrs)
  }

  const stopMouse = (e: ReactPointerEvent) => e.stopPropagation()

  return (
    <NodeViewWrapper
      as="div"
      className={`figure figure--align-${align}${selected ? ' figure--selected' : ''}`}
      data-align={align}
      ref={wrapRef}
    >
      {resolved ? (
        <span className="figure__inner">
          <img
            ref={imgRef}
            src={resolved}
            alt={node.attrs.alt ?? ''}
            style={{
              ...(width ? { width } : {}),
              ...(height ? { height } : {}),
            }}
            draggable={false}
          />
          <span
            className="figure__resize"
            onPointerDown={startResize}
            aria-hidden="true"
          />
          {selected && (
            <span
              className="figure__size"
              contentEditable={false}
              onPointerDown={stopMouse}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <label>
                W
                <input
                  type="number"
                  min={1}
                  value={pxW ?? ''}
                  onChange={onWidthChange}
                />
              </label>
              <label>
                H
                <input
                  type="number"
                  min={1}
                  value={pxH ?? ''}
                  onChange={onHeightChange}
                />
              </label>
              <button
                type="button"
                className={`figure__lock${lock ? ' is-on' : ''}`}
                onClick={() => setLock((v) => !v)}
                title={lock ? '비율 고정 켜짐' : '비율 고정 꺼짐'}
              >
                {lock ? '🔒' : '🔓'}
              </button>
              <span className="figure__align" contentEditable={false}>
                {(['left', 'none', 'right'] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={align === a ? 'is-active' : ''}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      updateAttributes({ align: a })
                    }}
                    title={
                      a === 'left'
                        ? '왼쪽 정렬 (글이 오른쪽으로 흐름)'
                        : a === 'right'
                          ? '오른쪽 정렬 (글이 왼쪽으로 흐름)'
                          : '본문 흐름 (정렬 해제)'
                    }
                  >
                    {a === 'left' ? '⇤' : a === 'right' ? '⇥' : '═'}
                  </button>
                ))}
              </span>
            </span>
          )}
        </span>
      ) : (
        <div className="figure__missing">이미지 없음: {src}</div>
      )}
    </NodeViewWrapper>
  )
}
