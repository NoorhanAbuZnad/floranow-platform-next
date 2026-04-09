'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

export interface TabDef {
  id: string
  title: string
  type: 'blocks' | 'board' | 'diagram'
}

export interface PageDef {
  id: string
  slug: string
  title: string
  emoji: string
  num: number
  isDefault: boolean
  tabs: TabDef[]
}

const STORAGE_KEY = 'floranow:pages'
const DB_KEY = '_pages_list'

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || `page-${Date.now()}`
}

function uniqueSlug(base: string, existing: Set<string>): string {
  if (!existing.has(base)) return base
  let i = 2
  while (existing.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}

export const DEFAULT_PAGES: PageDef[] = [
  { id: 'architecture', slug: 'architecture', title: 'Architecture', emoji: '🏗️', num: 1, isDefault: true, tabs: [
    { id: 'board', title: 'Board', type: 'board' },
    { id: 'diagram', title: 'Diagram', type: 'diagram' },
  ]},
  { id: 'migration', slug: 'migration', title: 'Old vs New', emoji: '🔄', num: 2, isDefault: true, tabs: [
    { id: 'content', title: 'Content', type: 'blocks' },
  ]},
  { id: 'ingestion', slug: 'ingestion', title: 'Ingestion', emoji: '📥', num: 3, isDefault: true, tabs: [
    { id: 'content', title: 'Content', type: 'blocks' },
  ]},
  { id: 'warehousing', slug: 'warehousing', title: 'Warehousing', emoji: '🗄️', num: 4, isDefault: true, tabs: [
    { id: 'content', title: 'Content', type: 'blocks' },
  ]},
  { id: 'dbt', slug: 'dbt', title: 'dbt', emoji: '🔧', num: 5, isDefault: true, tabs: [
    { id: 'content', title: 'Content', type: 'blocks' },
  ]},
  { id: 'bi', slug: 'bi', title: 'BI', emoji: '📊', num: 6, isDefault: true, tabs: [
    { id: 'content', title: 'Content', type: 'blocks' },
  ]},
  { id: 'ai', slug: 'ai', title: 'AI / Genie', emoji: '🤖', num: 7, isDefault: true, tabs: [
    { id: 'content', title: 'Content', type: 'blocks' },
  ]},
  { id: 'e2e', slug: 'e2e', title: 'E2E Flow', emoji: '🔀', num: 8, isDefault: true, tabs: [
    { id: 'content', title: 'Content', type: 'blocks' },
  ]},
  { id: 'roadmap', slug: 'roadmap', title: 'Roadmap', emoji: '📅', num: 9, isDefault: true, tabs: [
    { id: 'content', title: 'Content', type: 'blocks' },
  ]},
  { id: 'best-practices', slug: 'best-practices', title: 'Best Practices', emoji: '✅', num: 10, isDefault: true, tabs: [
    { id: 'content', title: 'Content', type: 'blocks' },
  ]},
]

function loadPages(): PageDef[] {
  if (typeof window === 'undefined') return DEFAULT_PAGES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as PageDef[]
      if (Array.isArray(saved) && saved.length > 0) {
        const defaultById = new Map(DEFAULT_PAGES.map(p => [p.id, p]))
        return saved.map(p => {
          const def = defaultById.get(p.id)
          if (def && p.isDefault) {
            const savedTabIds = new Set(p.tabs.map(t => t.id))
            const missingTabs = def.tabs.filter(t => !savedTabIds.has(t.id))
            return { ...p, tabs: [...(p.tabs.length ? p.tabs : def.tabs), ...missingTabs] }
          }
          return p
        })
      }
    }
  } catch {}
  return DEFAULT_PAGES
}

function savePages(pages: PageDef[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pages)) } catch {}
}

async function fetchPagesFromDb(): Promise<PageDef[] | null> {
  try {
    const res = await fetch(`/api/pages/${encodeURIComponent(DB_KEY)}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data.blocks ?? null
  } catch { return null }
}

async function savePagesToDb(pages: PageDef[]): Promise<void> {
  try {
    await fetch(`/api/pages/${encodeURIComponent(DB_KEY)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks: pages }),
    })
  } catch { /* fallback to localStorage */ }
}

export function usePages() {
  const [pages, setPagesRaw] = useState<PageDef[]>(loadPages)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load pages list from DB on mount
  useEffect(() => {
    let cancelled = false
    fetchPagesFromDb().then(dbPages => {
      if (cancelled || !dbPages || !Array.isArray(dbPages) || dbPages.length === 0) return
      setPagesRaw(dbPages)
      savePages(dbPages)
    })
    return () => { cancelled = true }
  }, [])

  // Save to localStorage immediately + DB with debounce on every change
  useEffect(() => {
    savePages(pages)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => savePagesToDb(pages), 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [pages])

  const setPages = useCallback((fn: PageDef[] | ((prev: PageDef[]) => PageDef[])) => {
    setPagesRaw(fn)
  }, [])

  const addPage = useCallback((title: string, emoji: string) => {
    setPagesRaw(prev => {
      const maxNum = Math.max(...prev.map(p => p.num), 0)
      const existingSlugs = new Set(prev.map(p => p.slug))
      const slug = uniqueSlug(titleToSlug(title), existingSlugs)
      const newPage: PageDef = {
        id: slug,
        slug,
        title,
        emoji,
        num: maxNum + 1,
        isDefault: false,
        tabs: [{ id: 'content', title: 'Content', type: 'blocks' }],
      }
      return [...prev, newPage]
    })
  }, [])

  const removePage = useCallback((id: string) => {
    setPagesRaw(prev => prev.filter(p => p.id !== id || p.isDefault))
  }, [])

  const updatePage = useCallback((id: string, patch: Partial<Pick<PageDef, 'title' | 'emoji'>>) => {
    setPagesRaw(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p))
  }, [])

  const addTab = useCallback((pageId: string, title: string, type: TabDef['type']) => {
    setPagesRaw(prev => prev.map(p => {
      if (p.id !== pageId) return p
      const tabId = `tab-${Date.now()}`
      return { ...p, tabs: [...p.tabs, { id: tabId, title, type }] }
    }))
  }, [])

  const removeTab = useCallback((pageId: string, tabId: string) => {
    setPagesRaw(prev => prev.map(p => {
      if (p.id !== pageId) return p
      if (p.tabs.length <= 1) return p
      return { ...p, tabs: p.tabs.filter(t => t.id !== tabId) }
    }))
  }, [])

  const updateTab = useCallback((pageId: string, tabId: string, patch: Partial<Pick<TabDef, 'title'>>) => {
    setPagesRaw(prev => prev.map(p => {
      if (p.id !== pageId) return p
      return { ...p, tabs: p.tabs.map(t => t.id === tabId ? { ...t, ...patch } : t) }
    }))
  }, [])

  const resetPages = useCallback(() => {
    setPagesRaw(DEFAULT_PAGES)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return { pages, setPages, addPage, removePage, updatePage, addTab, removeTab, updateTab, resetPages }
}
