function collectCss(): string {
  const parts: string[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        parts.push(rule.cssText)
      }
    } catch {
      // cross-origin sheets can't be read; skip
    }
  }
  return parts.join('\n')
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function inlineImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll('img'))
  for (const img of imgs) {
    const src = img.src
    if (!src || src.startsWith('data:')) continue
    try {
      const res = await fetch(src)
      const blob = await res.blob()
      img.src = await blobToDataUrl(blob)
    } catch (err) {
      console.warn('image inline failed:', src, err)
    }
  }
}

function stripEditorUi(root: HTMLElement) {
  root
    .querySelectorAll(
      '.drag-handle, .table-toolbar, .sidebar, .column-resize-handle, .tippy-box, .math__input, .chapter-frame__sentinel, .chapter-frame__shells, .figure__resize, .figure__size',
    )
    .forEach((el) => el.remove())
  root
    .querySelectorAll('[contenteditable]')
    .forEach((el) => el.removeAttribute('contenteditable'))
  // Pagination decorations push blocks via inline margin-top in screen px.
  // The export uses @page-based pagination, so clear those.
  root
    .querySelectorAll<HTMLElement>('.pg-push')
    .forEach((el) => {
      el.style.marginTop = ''
      el.classList.remove('pg-push')
    })
  // Page-break nodes are 0-height in screen mode now; keep them — print CSS
  // converts them into actual page breaks.
  root
    .querySelectorAll('.ProseMirror-focused, .selectedCell, .ProseMirror-selectednode')
    .forEach((el) => {
      el.classList.remove('ProseMirror-focused')
      el.classList.remove('selectedCell')
      el.classList.remove('ProseMirror-selectednode')
    })
}

export async function exportChapterHtml(title: string) {
  const frame = document.querySelector('.chapter-frame')
  if (!frame) {
    console.warn('exportChapterHtml: .chapter-frame not found')
    return
  }

  const clone = frame.cloneNode(true) as HTMLElement
  stripEditorUi(clone)
  await inlineImages(clone)

  const css = collectCss()
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${css}
@page { size: A4; margin: 16mm 20mm; }
body { margin: 0; background: #fff; }
.chapter-frame { width: auto; max-width: 170mm; margin: 0 auto; }
.chapter-frame__overlay { position: static !important; padding: 0 !important; }
.page-break { break-before: page; page-break-before: always; height: 0 !important; }
.page-break::before { display: none; }
.pg-push { margin-top: 0 !important; }
</style>
</head>
<body>${clone.outerHTML}</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitizeName(title)}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sanitizeName(s: string) {
  return s.replace(/[\\/:*?"<>|]/g, '_').slice(0, 60) || 'chapter'
}
