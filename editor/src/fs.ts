const CHAPTER_FILE = 'chapter.json'
const CHAPTER_BAK = 'chapter.json.bak'
const FIGURES_DIR = 'figures'

export const fsRef: {
  folder: FileSystemDirectoryHandle | null
  addFigureUrl: ((name: string, url: string) => void) | null
} = {
  folder: null,
  addFigureUrl: null,
}

export async function pickFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (!('showDirectoryPicker' in window)) {
    alert('이 브라우저는 File System Access API를 지원하지 않습니다. 크롬을 사용하세요.')
    return null
  }
  try {
    const handle = await (window as unknown as {
      showDirectoryPicker: (opts?: {
        mode?: 'read' | 'readwrite'
      }) => Promise<FileSystemDirectoryHandle>
    }).showDirectoryPicker({ mode: 'readwrite' })
    return handle
  } catch (err) {
    if ((err as DOMException).name !== 'AbortError') {
      console.error(err)
    }
    return null
  }
}

export async function readChapterFile(
  dir: FileSystemDirectoryHandle,
): Promise<unknown | null> {
  try {
    const fileHandle = await dir.getFileHandle(CHAPTER_FILE)
    const file = await fileHandle.getFile()
    const text = await file.text()
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function writeChapterFile(
  dir: FileSystemDirectoryHandle,
  data: unknown,
) {
  // Roll the current file into .bak before overwriting, so a bad save
  // (e.g. accidental empty content) can be recovered manually.
  try {
    const current = await dir.getFileHandle(CHAPTER_FILE)
    const file = await current.getFile()
    const text = await file.text()
    if (text && text.length > 50) {
      const bak = await dir.getFileHandle(CHAPTER_BAK, { create: true })
      const w = await bak.createWritable()
      await w.write(text)
      await w.close()
    }
  } catch {
    // no existing file yet
  }

  const fileHandle = await dir.getFileHandle(CHAPTER_FILE, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(JSON.stringify(data, null, 2))
  await writable.close()
}

export async function saveFigure(
  dir: FileSystemDirectoryHandle,
  file: File,
): Promise<string> {
  const figures = await dir.getDirectoryHandle(FIGURES_DIR, { create: true })
  const name = uniqueName(file.name)
  const fileHandle = await figures.getFileHandle(name, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(file)
  await writable.close()
  return name
}

export async function loadFigureUrls(
  dir: FileSystemDirectoryHandle,
): Promise<Record<string, string>> {
  const map: Record<string, string> = {}
  let figures: FileSystemDirectoryHandle
  try {
    figures = await dir.getDirectoryHandle(FIGURES_DIR)
  } catch (err) {
    console.warn('figures dir missing or inaccessible', err)
    return map
  }
  try {
    const iter = (
      figures as unknown as { values: () => AsyncIterableIterator<FileSystemHandle> }
    ).values()
    for await (const entry of iter) {
      if (entry.kind !== 'file') continue
      const fh = entry as FileSystemFileHandle
      try {
        const file = await fh.getFile()
        map[fh.name] = URL.createObjectURL(file)
      } catch (err) {
        console.warn('failed to read figure file', fh.name, err)
      }
    }
  } catch (err) {
    console.error('figures iteration failed', err)
  }
  return map
}

function uniqueName(original: string): string {
  const dot = original.lastIndexOf('.')
  const base = dot === -1 ? original : original.slice(0, dot)
  const ext = dot === -1 ? '' : original.slice(dot)
  const stamp = Date.now().toString(36)
  const safe = base.replace(/[^a-zA-Z0-9가-힣_-]/g, '_').slice(0, 40)
  return `${safe}_${stamp}${ext}`
}
