import './Sidebar.css'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

type Props = {
  title: string
  number: string
  subject: string
  part: string
  partNumber: string
  startPageNum: number
  folderName: string | null
  saveState: SaveState
  savedAt?: Date | null
  onTitleChange: (v: string) => void
  onNumberChange: (v: string) => void
  onSubjectChange: (v: string) => void
  onPartChange: (v: string) => void
  onPartNumberChange: (v: string) => void
  onStartPageNumChange: (v: number) => void
  onInsertPageBreak: () => void
  onOpenFolder: () => void
  onReload?: () => void
  onExportHtml: () => void
}

function formatTime(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const SAVE_LABEL: Record<SaveState, string> = {
  idle: '',
  saving: '저장 중…',
  saved: '저장됨',
  error: '저장 오류',
}

export function Sidebar({
  title,
  number,
  subject,
  part,
  partNumber,
  startPageNum,
  folderName,
  saveState,
  savedAt,
  onTitleChange,
  onNumberChange,
  onSubjectChange,
  onPartChange,
  onPartNumberChange,
  onStartPageNumChange,
  onInsertPageBreak,
  onOpenFolder,
  onReload,
  onExportHtml,
}: Props) {
  return (
    <aside className="sidebar">
      <h3 className="sidebar__heading">장 속성</h3>

      <label className="sidebar__field">
        <span>과목</span>
        <input
          type="text"
          placeholder="예: 화학"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
        />
      </label>

      <div className="sidebar__row">
        <label className="sidebar__field sidebar__field--narrow">
          <span>편 번호</span>
          <input
            type="text"
            placeholder="예: 1"
            value={partNumber}
            onChange={(e) => onPartNumberChange(e.target.value)}
          />
        </label>
        <label className="sidebar__field">
          <span>편</span>
          <input
            type="text"
            placeholder="예: 원소와 주기성"
            value={part}
            onChange={(e) => onPartChange(e.target.value)}
          />
        </label>
      </div>

      <div className="sidebar__row">
        <label className="sidebar__field sidebar__field--narrow">
          <span>장 번호</span>
          <input
            type="text"
            placeholder="예: 1"
            value={number}
            onChange={(e) => onNumberChange(e.target.value)}
          />
        </label>
        <label className="sidebar__field">
          <span>장 제목</span>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </label>
      </div>

      <label className="sidebar__field">
        <span>시작 쪽번호</span>
        <input
          type="number"
          min={1}
          value={startPageNum}
          onChange={(e) => onStartPageNumChange(Number(e.target.value) || 1)}
        />
      </label>

      <button type="button" className="sidebar__btn" onClick={onInsertPageBreak}>
        + 페이지 나눔 삽입
      </button>

      <hr className="sidebar__sep" />

      <h3 className="sidebar__heading">저장</h3>

      <div className="sidebar__field">
        <span>작업 폴더</span>
        <div className="sidebar__readout">
          {folderName ?? '(선택되지 않음)'}
        </div>
      </div>

      <button
        type="button"
        className="sidebar__btn sidebar__btn--secondary"
        onClick={onOpenFolder}
      >
        {folderName ? '다른 폴더 열기' : '폴더 열기'}
      </button>

      {folderName && onReload && (
        <button
          type="button"
          className="sidebar__btn sidebar__btn--secondary"
          onClick={onReload}
          style={{ marginTop: 6 }}
          title="이 폴더의 chapter.json을 다시 읽기"
        >
          chapter.json 다시 불러오기
        </button>
      )}

      {folderName && (
        <div className={`sidebar__save sidebar__save--${saveState}`}>
          {saveState === 'saved' && savedAt
            ? `${formatTime(savedAt)} 저장됨`
            : SAVE_LABEL[saveState]}
        </div>
      )}

      <hr className="sidebar__sep" />

      <h3 className="sidebar__heading">내보내기</h3>
      <button
        type="button"
        className="sidebar__btn sidebar__btn--secondary"
        onClick={onExportHtml}
      >
        HTML 파일로 내보내기
      </button>
      <button
        type="button"
        className="sidebar__btn sidebar__btn--secondary"
        onClick={() => window.print()}
        style={{ marginTop: 6 }}
      >
        인쇄 / PDF (Cmd+P)
      </button>
    </aside>
  )
}
