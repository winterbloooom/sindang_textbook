import type { JSONContent } from '@tiptap/react'

export type Chapter = {
  title: string
  number?: string
  subject?: string
  part?: string
  partNumber?: string
  startPageNum: number
  doc: JSONContent
}

export const emptyDoc: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

export function normalizeChapter(raw: unknown): Chapter {
  const r = raw as Record<string, unknown>
  const title = typeof r.title === 'string' ? r.title : '새 장'
  const number = typeof r.number === 'string' ? r.number : ''
  const subject = typeof r.subject === 'string' ? r.subject : ''
  const part = typeof r.part === 'string' ? r.part : ''
  const partNumber = typeof r.partNumber === 'string' ? r.partNumber : ''
  const startPageNum =
    typeof r.startPageNum === 'number' ? r.startPageNum : 1

  let doc: JSONContent
  if (
    r.doc &&
    typeof r.doc === 'object' &&
    'type' in (r.doc as object)
  ) {
    doc = r.doc as JSONContent
  } else if (Array.isArray(r.pages)) {
    // Migrate from per-page format: concat content with page-break nodes
    const content: JSONContent[] = []
    for (let i = 0; i < r.pages.length; i++) {
      const p = (r.pages as unknown[])[i] as
        | { doc?: JSONContent; content?: JSONContent[] }
        | JSONContent
      const pageContent =
        (p as { doc?: JSONContent }).doc?.content ??
        (p as { content?: JSONContent[] }).content ??
        []
      if (i > 0) content.push({ type: 'pageBreak' })
      content.push(...pageContent)
    }
    doc =
      content.length === 0
        ? emptyDoc
        : { type: 'doc', content }
  } else {
    doc = emptyDoc
  }

  return { title, number, subject, part, partNumber, startPageNum, doc }
}

export const sampleChapter: Chapter = {
  title: '원소와 주기율표',
  number: '1',
  subject: '화학',
  part: '원소와 주기성',
  partNumber: '1',
  startPageNum: 1,
  doc: {
    type: 'doc',
    content: [{ type: 'paragraph' }],
  },
}
