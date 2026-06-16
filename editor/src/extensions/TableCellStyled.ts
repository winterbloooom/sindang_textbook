import { TableCell } from '@tiptap/extension-table/cell'
import { TableHeader } from '@tiptap/extension-table/header'

type Align = 'left' | 'center' | 'right'
type VAlign = 'top' | 'middle' | 'bottom'
type HiddenBorders = Array<'top' | 'right' | 'bottom' | 'left'>

function parseHidden(val: string | null | undefined): HiddenBorders {
  if (!val) return []
  return val
    .split(',')
    .map((s) => s.trim())
    .filter((s) =>
      (['top', 'right', 'bottom', 'left'] as const).includes(s as never),
    ) as HiddenBorders
}

function styledAttributes(parent?: () => Record<string, unknown>) {
  return {
    ...parent?.(),
    align: {
      default: 'center' as Align,
      parseHTML: (el: HTMLElement) =>
        (el.getAttribute('data-align') as Align | null) ?? 'center',
      renderHTML: (attrs: { align?: Align }) => {
        const align = attrs.align ?? 'center'
        return {
          'data-align': align,
          style: `text-align: ${align}`,
        }
      },
    },
    valign: {
      default: 'middle' as VAlign,
      parseHTML: (el: HTMLElement) =>
        (el.getAttribute('data-valign') as VAlign | null) ?? 'middle',
      renderHTML: (attrs: { valign?: VAlign }) => {
        const valign = attrs.valign ?? 'middle'
        return {
          'data-valign': valign,
          style: `vertical-align: ${valign}`,
        }
      },
    },
    hideBorders: {
      default: [] as HiddenBorders,
      parseHTML: (el: HTMLElement) =>
        parseHidden(el.getAttribute('data-hide-borders')),
      renderHTML: (attrs: { hideBorders?: HiddenBorders }) => {
        const hidden = attrs.hideBorders ?? []
        if (hidden.length === 0) return {}
        return { 'data-hide-borders': hidden.join(',') }
      },
    },
    bgColor: {
      default: null as string | null,
      parseHTML: (el: HTMLElement) => el.getAttribute('data-bg-color'),
      renderHTML: (attrs: { bgColor?: string | null }) => {
        const color = attrs.bgColor
        if (!color) return {}
        return {
          'data-bg-color': color,
          style: `background-color: ${color}`,
        }
      },
    },
  }
}

export const TableCellStyled = TableCell.extend({
  addAttributes() {
    return styledAttributes(this.parent as () => Record<string, unknown>)
  },
})

export const TableHeaderStyled = TableHeader.extend({
  addAttributes() {
    return styledAttributes(this.parent as () => Record<string, unknown>)
  },
})
