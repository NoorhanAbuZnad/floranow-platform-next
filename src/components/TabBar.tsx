'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, X } from 'lucide-react'
import type { TabDef } from '../lib/usePages'

const TAB_TYPES: { type: TabDef['type']; label: string; emoji: string }[] = [
  { type: 'blocks', label: 'Content', emoji: '📝' },
  { type: 'board', label: 'Board', emoji: '🎨' },
  { type: 'diagram', label: 'Diagram', emoji: '📐' },
]

interface Props {
  tabs: TabDef[]
  activeTab: string
  onTabChange: (tabId: string) => void
  onAddTab: (title: string, type: TabDef['type']) => void
  onRemoveTab: (tabId: string) => void
  onRenameTab: (tabId: string, title: string) => void
}

export default function TabBar({ tabs, activeTab, onTabChange, onAddTab, onRemoveTab, onRenameTab }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const editRef = useRef<HTMLInputElement>(null)
  const addBtnRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus()
      editRef.current.select()
    }
  }, [editingId])

  const getAddPos = () => {
    if (!addBtnRef.current) return { top: 0, left: 0 }
    const rect = addBtnRef.current.getBoundingClientRect()
    return { top: rect.bottom + 4, left: rect.left }
  }

  const addPos = showAdd ? getAddPos() : { top: 0, left: 0 }

  return (
    <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-gray-200 bg-gray-50/80 shrink-0 overflow-x-auto">
      {tabs.map(tab => (
        <div key={tab.id} className="flex items-center group/tab">
          {editingId === tab.id ? (
            <input
              ref={editRef}
              defaultValue={tab.title}
              onBlur={e => {
                const val = e.target.value.trim()
                if (val) onRenameTab(tab.id, val)
                setEditingId(null)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim()
                  if (val) onRenameTab(tab.id, val)
                  setEditingId(null)
                }
                if (e.key === 'Escape') setEditingId(null)
              }}
              className="text-[12px] font-medium bg-white border border-fn-300 rounded px-2 py-1 outline-none w-24"
            />
          ) : (
            <button
              onClick={() => onTabChange(tab.id)}
              onDoubleClick={() => setEditingId(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-fn-600 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/60 border border-transparent'
              }`}
            >
              <span>{tab.title}</span>
              {tabs.length > 1 && (
                <span
                  onClick={e => { e.stopPropagation(); onRemoveTab(tab.id) }}
                  className="opacity-0 group-hover/tab:opacity-100 text-gray-400 hover:text-red-500 transition-all ml-0.5"
                >
                  <X className="w-3 h-3" />
                </span>
              )}
            </button>
          )}
        </div>
      ))}

      {/* Add tab */}
      <button
        ref={addBtnRef}
        onClick={() => setShowAdd(v => !v)}
        className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-fn-500 hover:bg-fn-50 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {showAdd && mounted && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setShowAdd(false)} />
          <div
            className="fixed bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 z-[9999] w-44"
            style={{ top: addPos.top, left: addPos.left }}
          >
            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Add sub-page</p>
            {TAB_TYPES.map(({ type, label, emoji }) => (
              <button
                key={type}
                onClick={() => { onAddTab(label, type); setShowAdd(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-gray-600 hover:bg-fn-50 hover:text-fn-600 rounded-lg transition-colors"
              >
                <span>{emoji}</span> {label}
              </button>
            ))}
          </div>
        </>,
        document.body,
      )}
    </div>
  )
}
