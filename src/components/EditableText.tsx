'use client'

import { useRef, useEffect, KeyboardEvent } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span' | 'div' | 'td'
  className?: string
  placeholder?: string
  multiline?: boolean
}

export default function EditableText({
  value,
  onChange,
  as: Tag = 'div',
  className = '',
  placeholder = 'Click to type...',
  multiline = false,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const lastValue = useRef(value)

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value
      lastValue.current = value
    }
  }, [value])

  const handleBlur = () => {
    const text = ref.current?.innerText ?? ''
    if (text !== lastValue.current) {
      lastValue.current = text
      onChange(text)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault()
      ref.current?.blur()
    }
  }

  return (
    <Tag
      ref={ref as never}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-none cursor-text rounded-sm transition-colors focus:bg-fn-50/50 focus:ring-1 focus:ring-fn-200 ${
        !value ? 'text-gray-300' : ''
      } ${className}`}
      data-placeholder={placeholder}
    />
  )
}
