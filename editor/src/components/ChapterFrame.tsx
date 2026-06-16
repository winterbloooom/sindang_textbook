import React, { useEffect, useRef, useState, type ReactNode } from 'react'
import './ChapterFrame.css'

const PAGE_GAP_MM = 8

type Props = {
  title: string
  number?: string
  subject?: string
  part?: string
  partNumber?: string
  startPageNum?: number
  zoom?: number
  children?: ReactNode
}

export function ChapterFrame({
  title,
  number,
  subject,
  part,
  partNumber,
  startPageNum = 1,
  zoom = 1,
  children,
}: Props) {
  const partLabel = part?.trim()
    ? partNumber?.trim()
      ? `${partNumber}편  ${part}`
      : part
    : null
  const showChev = !!(subject?.trim() || partLabel)
  const showNumber = !!number?.trim()

  const overlayRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [pageCount, setPageCount] = useState(1)

  useEffect(() => {
    const overlay = overlayRef.current
    const sentinel = sentinelRef.current
    if (!overlay || !sentinel) return

    const update = () => {
      const pageHeightPx = sentinel.getBoundingClientRect().height
      if (pageHeightPx <= 0) return
      const contentHeight = overlay.scrollHeight
      const count = Math.max(1, Math.ceil(contentHeight / pageHeightPx))
      setPageCount((prev) => (prev === count ? prev : count))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(overlay)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])



  const chapterStyle: React.CSSProperties = {}
  if (zoom !== 1) (chapterStyle as { zoom?: number }).zoom = zoom

  useEffect(() => {
    const id = 'chapter-frame-print-counter'
    let el = document.getElementById(id) as HTMLStyleElement | null
    if (!el) {
      el = document.createElement('style')
      el.id = id
      document.head.appendChild(el)
    }
    if (startPageNum > 1) {
      const n = startPageNum - 1
      el.textContent = `@media print {
        html { counter-reset: page ${n}; }
        body { counter-reset: page ${n}; }
        .chapter-frame { counter-reset: page ${n}; }
      }`
    } else {
      el.textContent = ''
    }
  }, [startPageNum])

  return (
    <div
      className="chapter-frame"
      style={Object.keys(chapterStyle).length ? chapterStyle : undefined}
    >
      <div
        ref={sentinelRef}
        className="chapter-frame__sentinel"
        aria-hidden="true"
      />
      <div className="chapter-frame__shells" aria-hidden="true">
        {Array.from({ length: pageCount }).map((_, i) => (
          <div
            key={i}
            className="page-shell"
            style={
              i > 0 ? { marginTop: `${PAGE_GAP_MM}mm` } : undefined
            }
          >
            <div className="page-shell__footer">
              <span className="page-shell__num">{startPageNum + i}</span>
            </div>
          </div>
        ))}
      </div>

      <div ref={overlayRef} className="chapter-frame__overlay">
        <div className="chapter-frame__header">
          {showChev && (
            <nav className="chev-nav" aria-label="breadcrumb">
              {subject?.trim() && (
                <span className="chev-item chev-subject">{subject}</span>
              )}
              {partLabel && (
                <span className="chev-item chev-part">{partLabel}</span>
              )}
            </nav>
          )}
          <div className="chapter-title">
            {showNumber && (
              <span className="sec-badge" aria-hidden="true">
                <span className="sec-badge-body">{number}</span>
                <span className="sec-badge-arrow" />
              </span>
            )}
            <span className="chapter-title__text">
              {title || '(제목 없음)'}
            </span>
          </div>
        </div>
        <div className="chapter-frame__body">{children}</div>
      </div>
    </div>
  )
}
