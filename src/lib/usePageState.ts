'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Block } from './blocks'

const DEBOUNCE_MS = 500

async function fetchBlocks(pageKey: string): Promise<Block[] | null> {
  try {
    const res = await fetch(`/api/pages/${encodeURIComponent(pageKey)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.blocks ?? null
  } catch {
    return null
  }
}

async function saveBlocks(pageKey: string, blocks: Block[]): Promise<void> {
  try {
    await fetch(`/api/pages/${encodeURIComponent(pageKey)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    })
  } catch { /* network error — localStorage still has the data */ }
}

export function usePageState(pageKey: string, defaultBlocks: Block[]) {
  const storageKey = `floranow:${pageKey}`

  const [blocks, setBlocksRaw] = useState<Block[]>(() => {
    if (typeof window === 'undefined') return defaultBlocks
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) return JSON.parse(saved) as Block[]
    } catch { /* use defaults */ }
    return defaultBlocks
  })

  const [loaded, setLoaded] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  // On mount: fetch from API, prefer DB over localStorage over defaults
  useEffect(() => {
    let cancelled = false
    fetchBlocks(pageKey).then(dbBlocks => {
      if (cancelled) return
      if (dbBlocks && dbBlocks.length > 0) {
        setBlocksRaw(dbBlocks)
        try { localStorage.setItem(storageKey, JSON.stringify(dbBlocks)) } catch {}
      }
      setLoaded(true)
    })
    return () => { cancelled = true }
  }, [pageKey, storageKey])

  // On change: write to localStorage immediately + debounced save to API
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(blocks))
    } catch { /* quota exceeded */ }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      saveBlocks(pageKey, blocks)
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [blocks, pageKey, storageKey])

  const setBlocks = useCallback((fn: Block[] | ((prev: Block[]) => Block[])) => {
    setBlocksRaw(fn)
  }, [])

  const updateBlock = useCallback((id: string, patch: Partial<Block>) => {
    setBlocksRaw(prev =>
      prev.map(b => (b.id === id ? { ...b, ...patch } as Block : b))
    )
  }, [])

  const addBlock = useCallback((block: Block, afterId?: string) => {
    setBlocksRaw(prev => {
      if (!afterId) return [...prev, block]
      const idx = prev.findIndex(b => b.id === afterId)
      if (idx === -1) return [...prev, block]
      const next = [...prev]
      next.splice(idx + 1, 0, block)
      return next
    })
  }, [])

  const removeBlock = useCallback((id: string) => {
    setBlocksRaw(prev => prev.filter(b => b.id !== id))
  }, [])

  const resetToDefault = useCallback(() => {
    setBlocksRaw(defaultBlocks)
    try { localStorage.removeItem(storageKey) } catch {}
    saveBlocks(pageKey, defaultBlocks)
  }, [defaultBlocks, storageKey, pageKey])

  return { blocks, setBlocks, updateBlock, addBlock, removeBlock, resetToDefault, loaded }
}
