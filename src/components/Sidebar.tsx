'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { Layers, Plus, Trash2, X } from 'lucide-react'
import { usePagesContext } from '../lib/PagesContext'

const EMOJI_PICKS = ['📄', '📊', '🔧', '🗄️', '📥', '🔀', '📅', '✅', '🚀', '💡', '🎯', '🏗️', '🔒', '📈', '🤖', '⚡', '🌐', '📝', '🛡️', '💰']

export default function Sidebar() {
  const { pages, addPage, removePage, updatePage } = usePagesContext()
  const router = useRouter()
  const pathname = usePathname()
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newEmoji, setNewEmoji] = useState('📄')
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

  const prevPageCount = useRef(pages.length)
  useEffect(() => {
    if (pages.length > prevPageCount.current) {
      const newest = pages[pages.length - 1]
      if (newest && !newest.isDefault) router.push(`/${newest.slug}`)
    }
    prevPageCount.current = pages.length
  }, [pages, router])

  const handleAdd = () => {
    const title = newTitle.trim()
    if (!title) return
    addPage(title, newEmoji)
    setNewTitle('')
    setNewEmoji('📄')
    setShowAdd(false)
  }

  const getAddPos = () => {
    if (!addBtnRef.current) return { top: 0, left: 0 }
    const rect = addBtnRef.current.getBoundingClientRect()
    return { top: rect.bottom + 4, left: rect.left }
  }

  const addPos = showAdd ? getAddPos() : { top: 0, left: 0 }

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-gray-200 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-fn-500 flex items-center justify-center">
          <Layers className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <div className="font-bold text-[15px] text-fn-600 leading-tight">Floranow</div>
          <div className="text-[10px] text-gray-400 font-medium">Data Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {pages.map(page => {
          const isActive = pathname === `/${page.slug}`
          return (
            <div key={page.id} className="group/item relative">
              {editingId === page.id ? (
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <span className="text-sm">{page.emoji}</span>
                  <input
                    ref={editRef}
                    defaultValue={page.title}
                    onBlur={e => {
                      const val = e.target.value.trim()
                      if (val) updatePage(page.id, { title: val })
                      setEditingId(null)
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim()
                        if (val) updatePage(page.id, { title: val })
                        setEditingId(null)
                      }
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="flex-1 text-[13px] font-medium bg-fn-50 border border-fn-200 rounded px-1.5 py-0.5 outline-none"
                  />
                </div>
              ) : (
                <Link
                  href={`/${page.slug}`}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-fn-50 text-fn-600 shadow-sm ring-1 ring-fn-200'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive ? 'bg-fn-100 text-fn-600' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {page.num}
                  </span>
                  <span className="text-sm shrink-0">{page.emoji}</span>
                  <span className="truncate flex-1">{page.title}</span>
                  <span
                    className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0"
                    onClick={e => e.preventDefault()}
                  >
                    <button
                      onClick={e => { e.preventDefault(); e.stopPropagation(); setEditingId(page.id) }}
                      className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-fn-500 hover:bg-fn-50 text-[10px]"
                      title="Rename"
                    >
                      ✏️
                    </button>
                    {!page.isDefault && (
                      <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); removePage(page.id) }}
                        className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50"
                        title="Delete page"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                </Link>
              )}
            </div>
          )
        })}

        {/* Add page button */}
        <div className="pt-1">
          <button
            ref={addBtnRef}
            onClick={() => setShowAdd(v => !v)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-gray-400 hover:bg-fn-50 hover:text-fn-500 transition-colors border border-dashed border-gray-200 hover:border-fn-300"
          >
            <span className="w-6 h-6 rounded-md flex items-center justify-center bg-gray-50 text-gray-400 shrink-0">
              <Plus className="w-3.5 h-3.5" />
            </span>
            <span>Add Page</span>
          </button>
        </div>
      </nav>

      {/* Add page popover — portalled to body */}
      {showAdd && mounted && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setShowAdd(false)} />
          <div
            className="fixed bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-[9999] w-60 space-y-3"
            style={{ top: addPos.top, left: addPos.left }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">New Page</span>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Emoji picker */}
            <div>
              <p className="text-[10px] font-medium text-gray-400 mb-1.5">Icon</p>
              <div className="flex flex-wrap gap-1">
                {EMOJI_PICKS.map(e => (
                  <button
                    key={e}
                    onClick={() => setNewEmoji(e)}
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-sm hover:bg-fn-50 transition-colors ${
                      newEmoji === e ? 'bg-fn-100 ring-1 ring-fn-300' : ''
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Title input */}
            <div>
              <p className="text-[10px] font-medium text-gray-400 mb-1">Title</p>
              <input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
                placeholder="e.g. Cost Analysis"
                className="w-full text-[13px] border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-fn-300 focus:ring-1 focus:ring-fn-200"
                autoFocus
              />
            </div>

            <button
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className="w-full py-1.5 bg-fn-500 text-white text-xs font-semibold rounded-lg hover:bg-fn-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add Page
            </button>
          </div>
        </>,
        document.body,
      )}

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 text-[10px] text-gray-400">
        Design Preview v2.0 · March 2026
      </div>
    </aside>
  )
}
