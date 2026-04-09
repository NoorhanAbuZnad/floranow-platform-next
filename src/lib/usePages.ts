'use client'

import { useState, useCallback, useEffect } from 'react'

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

export function usePages() {
  const [pages, setPagesRaw] = useState<PageDef[]>(loadPages)

  useEffect(() => {
    savePages(pages)
  }, [pages])

  const setPages = useCallback((fn: PageDef[] | ((prev: PageDef[]) => PageDef[])) => {
    setPagesRaw(fn)
  }, [])

  const addPage = useCallback((title: string, emoji: string) => {
    setPagesRaw(prev => {
      const maxNum = Math.max(...prev.map(p => p.num), 0)
      const slug = `custom-${Date.now()}`
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
