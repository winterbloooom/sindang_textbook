import { EditorContent, useEditor, type Editor as TEditor, type JSONContent } from '@tiptap/react'
import DragHandle from '@tiptap/extension-drag-handle-react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { TableKit } from '@tiptap/extension-table/kit'
import { Box, BoxBody, BoxHead } from '../extensions/Box'
import {
  defaultSlashItems,
  SlashCommand,
} from '../extensions/SlashCommand'
import { Image, ImageDrop } from '../extensions/ImageDrop'
import { MathBlock, MathInline } from '../extensions/Math'
import { PageBreak } from '../extensions/PageBreak'
import { TableCellStyled, TableHeaderStyled } from '../extensions/TableCellStyled'
import { SelectBlock } from '../extensions/SelectBlock'
import { StrongEm } from '../extensions/StrongEm'
import { Example } from '../extensions/Example'
import { Subscript, Superscript } from '../extensions/Script'
import { StartOrderedList } from '../extensions/StartOrderedList'
import { Pagination } from '../extensions/Pagination'
import {
  ApplyAns,
  ApplyBogi,
  ApplyHead,
  ApplyItem,
  ApplyLeft,
  ApplyRight,
  ApplySrc,
  ApplyTag,
  ApplyTitle,
} from '../extensions/Apply'
import './Editor.css'

type Props = {
  doc: JSONContent
  onChange: (doc: JSONContent) => void
  onReady?: (editor: TEditor) => void
}

export function Editor({ doc, onChange, onReady }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ orderedList: false }),
      StartOrderedList,
      Pagination,
      Box,
      BoxHead,
      BoxBody,
      MathInline,
      MathBlock,
      PageBreak,
      SlashCommand.configure({ items: defaultSlashItems }),
      Image,
      ImageDrop,
      TableKit.configure({
        table: { resizable: true, lastColumnResizable: false },
        tableCell: false,
        tableHeader: false,
      }),
      TableCellStyled,
      TableHeaderStyled,
      SelectBlock,
      StrongEm,
      Example,
      Subscript,
      Superscript,
      ApplyTitle,
      ApplyItem,
      ApplyLeft,
      ApplyRight,
      ApplySrc,
      ApplyHead,
      ApplyAns,
      ApplyBogi,
      ApplyTag,
    ],
    content: doc,
    onUpdate({ editor }) {
      onChange(editor.getJSON())
    },
  })

  useEffect(() => {
    if (editor && onReady) onReady(editor)
  }, [editor, onReady])


  return (
    <div className="editor-wrap">
      {editor && (
        <DragHandle editor={editor} className="drag-handle">
          <span aria-hidden="true">⋮⋮</span>
        </DragHandle>
      )}
      <EditorContent editor={editor} className="editor" />
    </div>
  )
}
