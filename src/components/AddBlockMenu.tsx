'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Type, Heading2, Table2, LayoutGrid, AlertCircle, Minus, ArrowRightLeft, Workflow, Code } from 'lucide-react'
import type { Block } from '../lib/blocks'
import { createBlock } from '../lib/blocks'

const BLOCK_OPTIONS: { type: Block['type']; label: string; icon: typeof Type }[] = [
  { type: 'heading', label: 'Heading', icon: Heading2 },
  { type: 'text', label: 'Text', icon: Type },
  { type: 'callout', label: 'Callout', icon: AlertCircle },
  { type: 'table', label: 'Table', icon: Table2 },
  { type: 'card-grid', label: 'Card Grid', icon: LayoutGrid },
  { type: 'compare', label: 'Compare (Old vs New)', icon: ArrowRightLeft },
  { type: 'flow', label: 'Flow Steps', icon: Workflow },
  { type: 'code', label: 'Code Block', icon: Code },
  { type: 'divider', label: 'Divider', icon: Minus },
]

interface Props {
  onAdd: (block: Block) => void
}

export default function AddBlockMenu({ onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const getPos = () => {
    if (!btnRef.current) return { top: 0, left: 0 }
    const rect = btnRef.current.getBoundingClientRect()
    return { top: rect.bottom + 4, left: rect.left + rect.width / 2 - 104 }
  }

  const handleSelect = (type: Block['type']) => {
    const block = createBlock(type)
    onAdd(block)
    setOpen(false)
  }

  const pos = open ? getPos() : { top: 0, left: 0 }

  return (
    <div className="relative flex justify-center">
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        className="group flex items-center gap-1 px-2 py-1 rounded-md text-gray-300 hover:text-fn-500 hover:bg-fn-50 transition-colors text-xs"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">Add block</span>
      </button>

      {open && mounted && createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 z-[9999] w-52"
            style={{ top: pos.top, left: pos.left }}
          >
            {BLOCK_OPTIONS.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => handleSelect(type)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-fn-50 hover:text-fn-600 rounded-lg transition-colors"
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        </>,
        document.body,
      )}
    </div>
  )
}
