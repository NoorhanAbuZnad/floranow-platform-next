'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { usePages, type PageDef, type TabDef } from './usePages'

interface PagesContextValue {
  pages: PageDef[]
  dbLoaded: boolean
  addPage: (title: string, emoji: string) => void
  removePage: (id: string) => void
  updatePage: (id: string, patch: Partial<Pick<PageDef, 'title' | 'emoji'>>) => void
  addTab: (pageId: string, title: string, type: TabDef['type']) => void
  removeTab: (pageId: string, tabId: string) => void
  updateTab: (pageId: string, tabId: string, patch: Partial<Pick<TabDef, 'title'>>) => void
  resetPages: () => void
}

const Ctx = createContext<PagesContextValue | null>(null)

export function PagesProvider({ children }: { children: ReactNode }) {
  const value = usePages()
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePagesContext() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePagesContext must be used within PagesProvider')
  return ctx
}
