import { useCallback, useEffect, useRef, useState } from 'react'
import type { Editor as TEditor, JSONContent } from '@tiptap/react'
import { ChapterFrame } from './components/ChapterFrame'
import { Editor } from './components/Editor'
import { Sidebar } from './components/Sidebar'
import { TableToolbar } from './components/TableToolbar'
import { TopMenu } from './components/TopMenu'
import { normalizeChapter, sampleChapter, type Chapter } from './types'
import {
  fsRef,
  loadFigureUrls,
  pickFolder,
  readChapterFile,
  writeChapterFile,
} from './fs'
import { exportChapterHtml } from './exportHtml'
import { FigureContext } from './FigureContext'
import './App.css'

function App() {
  const [chapter, setChapter] = useState<Chapter>(sampleChapter)
  const [folder, setFolder] = useState<FileSystemDirectoryHandle | null>(null)
  const [figureUrls, setFigureUrls] = useState<Record<string, string>>({})
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [editor, setEditor] = useState<TEditor | null>(null)
  const [zoom, setZoom] = useState(1)
  const [loadKey, setLoadKey] = useState(0)
  const setZoomClamped = (z: number) =>
    setZoom(Math.min(2, Math.max(0.5, Math.round(z * 100) / 100)))
  const chapterRef = useRef(chapter)
  const folderRef = useRef(folder)
  const dirtyRef = useRef(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    chapterRef.current = chapter
  }, [chapter])
  useEffect(() => {
    folderRef.current = folder
  }, [folder])

  useEffect(() => {
    fsRef.folder = folder
    fsRef.addFigureUrl = (name, url) =>
      setFigureUrls((prev) => ({ ...prev, [name]: url }))
    return () => {
      fsRef.folder = null
      fsRef.addFigureUrl = null
    }
  }, [folder])

  const updateDoc = (doc: JSONContent) => {
    setChapter((prev) => ({ ...prev, doc }))
  }

  const insertPageBreak = () => {
    if (!editor) return
    editor.chain().focus().insertPageBreak().run()
  }

  const openFolder = async () => {
    const handle = await pickFolder()
    if (!handle) return
    const urls = await loadFigureUrls(handle)
    const raw = await readChapterFile(handle)
    if (raw) setChapter(normalizeChapter(raw))
    setFigureUrls(urls)
    setFolder(handle)
    setLoadKey((k) => k + 1)
  }

  const reloadChapter = async () => {
    if (!folder) return
    const urls = await loadFigureUrls(folder)
    const raw = await readChapterFile(folder)
    if (raw) setChapter(normalizeChapter(raw))
    setFigureUrls(urls)
    setLoadKey((k) => k + 1)
  }

  const docHasContent = (doc: unknown) => {
    try {
      const json = JSON.stringify(doc)
      // skip if completely empty or only contains a single empty paragraph
      if (!json || json.length < 50) return false
      return true
    } catch {
      return true
    }
  }

  const flushSave = useCallback(async () => {
    const f = folderRef.current
    if (!f || !dirtyRef.current) return
    const data = chapterRef.current as { doc?: unknown }
    if (!docHasContent(data.doc)) {
      dirtyRef.current = false
      return
    }
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    dirtyRef.current = false
    setSaveState('saving')
    try {
      await writeChapterFile(f, chapterRef.current)
      setSavedAt(new Date())
      setSaveState('saved')
    } catch (err) {
      console.error(err)
      dirtyRef.current = true
      setSaveState('error')
    }
  }, [])

  useEffect(() => {
    if (!folder) return
    dirtyRef.current = true
    setSaveState('saving')
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      void flushSave()
    }, 1000)
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [chapter, folder, flushSave])

  useEffect(() => {
    const onBlur = () => void flushSave()
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [flushSave])

  return (
    <FigureContext.Provider value={{ urls: figureUrls }}>
      <div className="workspace">
        <ChapterFrame
          title={chapter.title}
          number={chapter.number}
          subject={chapter.subject}
          part={chapter.part}
          partNumber={chapter.partNumber}
          startPageNum={chapter.startPageNum}
          zoom={zoom}
        >
          <Editor
            key={`${folder?.name ?? '__init__'}-${loadKey}`}
            doc={chapter.doc}
            onChange={updateDoc}
            onReady={setEditor}
          />
        </ChapterFrame>
        {editor && <TableToolbar editor={editor} />}
        <aside className="rightpanel">
          <TopMenu
            editor={editor}
            onPageBreak={insertPageBreak}
            zoom={zoom}
            onZoomIn={() => setZoomClamped(zoom + 0.1)}
            onZoomOut={() => setZoomClamped(zoom - 0.1)}
            onZoomReset={() => setZoomClamped(1)}
          />
          <Sidebar
          title={chapter.title}
          number={chapter.number ?? ''}
          subject={chapter.subject ?? ''}
          part={chapter.part ?? ''}
          partNumber={chapter.partNumber ?? ''}
          startPageNum={chapter.startPageNum}
          folderName={folder?.name ?? null}
          saveState={saveState}
          savedAt={savedAt}
          onTitleChange={(v) => setChapter((p) => ({ ...p, title: v }))}
          onNumberChange={(v) => setChapter((p) => ({ ...p, number: v }))}
          onSubjectChange={(v) => setChapter((p) => ({ ...p, subject: v }))}
          onPartChange={(v) => setChapter((p) => ({ ...p, part: v }))}
          onPartNumberChange={(v) =>
            setChapter((p) => ({ ...p, partNumber: v }))
          }
          onStartPageNumChange={(v) =>
            setChapter((p) => ({ ...p, startPageNum: v }))
          }
          onInsertPageBreak={insertPageBreak}
          onOpenFolder={openFolder}
          onReload={reloadChapter}
          onExportHtml={() => exportChapterHtml(chapter.title)}
        />
        </aside>
      </div>
    </FigureContext.Provider>
  )
}

export default App
