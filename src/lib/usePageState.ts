'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Block } from './blocks'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const DEBOUNCE_MS = 800
const POLL_INTERVAL_MS = 10_000

async function fetchPage(pageKey: string): Promise<{ blocks: Block[] | null; snapshot: Block[] | null }> {
  try {
    const res = await fetch(`/api/pages/${encodeURIComponent(pageKey)}`, { cache: 'no-store' })
    if (!res.ok) return { blocks: null, snapshot: null }
    const data = await res.json()
    return { blocks: data.blocks ?? null, snapshot: data.snapshot ?? null }
  } catch {
    return { blocks: null, snapshot: null }
  }
}

async function persistBlocks(pageKey: string, blocks: Block[]): Promise<boolean> {
  try {
    const res = await fetch(`/api/pages/${encodeURIComponent(pageKey)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    })
    return res.ok
  } catch {
    return false
  }
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

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastEditTime = useRef(0)
  const blocksRef = useRef(blocks)
  blocksRef.current = blocks
  const snapshotRef = useRef<Block[] | null>(null)

  // On mount: fetch from DB, prefer DB data over localStorage
  useEffect(() => {
    let cancelled = false
    fetchPage(pageKey).then(({ blocks: dbBlocks, snapshot }) => {
      if (cancelled) return
      if (snapshot) snapshotRef.current = snapshot
      if (dbBlocks && dbBlocks.length > 0) {
        setBlocksRaw(dbBlocks)
        try { localStorage.setItem(storageKey, JSON.stringify(dbBlocks)) } catch {}
      }
    })
    return () => { cancelled = true }
  }, [pageKey, storageKey])

  // Poll for other users' changes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const msSinceLastEdit = Date.now() - lastEditTime.current
      if (msSinceLastEdit < 3000) return

      fetchPage(pageKey).then(({ blocks: dbBlocks, snapshot }) => {
        if (snapshot) snapshotRef.current = snapshot
        if (!dbBlocks || dbBlocks.length === 0) return
        const msSinceEdit = Date.now() - lastEditTime.current
        if (msSinceEdit < 3000) return

        const currentJson = JSON.stringify(blocksRef.current)
        const dbJson = JSON.stringify(dbBlocks)
        if (currentJson !== dbJson) {
          setBlocksRaw(dbBlocks)
          try { localStorage.setItem(storageKey, dbJson) } catch {}
        }
      })
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [pageKey, storageKey])

  // Save to DB with debounce when blocks change from user edits
  const saveToDb = useCallback((blocksToSave: Block[]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaveStatus('saving')
    debounceRef.current = setTimeout(async () => {
      const ok = await persistBlocks(pageKey, blocksToSave)
      setSaveStatus(ok ? 'saved' : 'error')
      if (ok) {
        setTimeout(() => setSaveStatus(prev => prev === 'saved' ? 'idle' : prev), 2000)
      }
    }, DEBOUNCE_MS)
  }, [pageKey])

  const editBlocks = useCallback((updater: (prev: Block[]) => Block[]) => {
    setBlocksRaw(prev => {
      const next = updater(prev)
      lastEditTime.current = Date.now()
      try { localStorage.setItem(`floranow:${pageKey}`, JSON.stringify(next)) } catch {}
      saveToDb(next)
      return next
    })
  }, [pageKey, saveToDb])

  const setBlocks = useCallback((fn: Block[] | ((prev: Block[]) => Block[])) => {
    if (typeof fn === 'function') {
      editBlocks(fn)
    } else {
      editBlocks(() => fn)
    }
  }, [editBlocks])

  const updateBlock = useCallback((id: string, patch: Partial<Block>) => {
    editBlocks(prev => prev.map(b => (b.id === id ? { ...b, ...patch } as Block : b)))
  }, [editBlocks])

  const addBlock = useCallback((block: Block, afterId?: string) => {
    editBlocks(prev => {
      if (!afterId) return [...prev, block]
      const idx = prev.findIndex(b => b.id === afterId)
      if (idx === -1) return [...prev, block]
      const next = [...prev]
      next.splice(idx + 1, 0, block)
      return next
    })
  }, [editBlocks])

  const removeBlock = useCallback((id: string) => {
    editBlocks(prev => prev.filter(b => b.id !== id))
  }, [editBlocks])

  const forceSave = useCallback(async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaveStatus('saving')
    const ok = await persistBlocks(pageKey, blocksRef.current)
    setSaveStatus(ok ? 'saved' : 'error')
    if (ok) {
      setTimeout(() => setSaveStatus(prev => prev === 'saved' ? 'idle' : prev), 2000)
    }
  }, [pageKey])

  // Reset: use 2-day snapshot if available, otherwise fall back to code defaults
  const resetToDefault = useCallback(() => {
    const resetTarget = snapshotRef.current && snapshotRef.current.length > 0
      ? snapshotRef.current
      : defaultBlocks
    lastEditTime.current = Date.now()
    setBlocksRaw(resetTarget)
    try { localStorage.setItem(storageKey, JSON.stringify(resetTarget)) } catch {}
    setSaveStatus('saving')
    persistBlocks(pageKey, resetTarget).then(ok => {
      setSaveStatus(ok ? 'saved' : 'error')
      if (ok) setTimeout(() => setSaveStatus(prev => prev === 'saved' ? 'idle' : prev), 2000)
    })
  }, [defaultBlocks, storageKey, pageKey])

  return { blocks, setBlocks, updateBlock, addBlock, removeBlock, resetToDefault, saveStatus, forceSave }
}
