import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import type { SlashCommandItem } from '../extensions/SlashCommand'
import './SlashMenu.css'

type Props = {
  items: SlashCommandItem[]
  command: (item: SlashCommandItem) => void
}

export type SlashMenuHandle = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

export const SlashMenu = forwardRef<SlashMenuHandle, Props>(
  ({ items, command }, ref) => {
    const [index, setIndex] = useState(0)

    useEffect(() => setIndex(0), [items])

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowDown') {
          setIndex((i) => (i + 1) % Math.max(items.length, 1))
          return true
        }
        if (event.key === 'ArrowUp') {
          setIndex((i) => (i - 1 + items.length) % Math.max(items.length, 1))
          return true
        }
        if (event.key === 'Enter') {
          const item = items[index]
          if (item) command(item)
          return true
        }
        return false
      },
    }))

    if (items.length === 0) {
      return <div className="slash-menu slash-menu--empty">결과 없음</div>
    }

    return (
      <div className="slash-menu">
        {items.map((item, i) => (
          <button
            key={item.title}
            type="button"
            className={
              'slash-menu__item' +
              (i === index ? ' slash-menu__item--active' : '')
            }
            onMouseEnter={() => setIndex(i)}
            onClick={() => command(item)}
          >
            <span className="slash-menu__title">{item.title}</span>
            {item.hint && (
              <span className="slash-menu__hint">{item.hint}</span>
            )}
          </button>
        ))}
      </div>
    )
  },
)
