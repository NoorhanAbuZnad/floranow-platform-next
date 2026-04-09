'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ReactFlowProvider } from '@xyflow/react'
import { usePagesContext } from '../lib/PagesContext'
import type { PageDef } from '../lib/usePages'
import TabBar from './TabBar'
import BoardView from './BoardView'
import BlockEditor from './BlockEditor'
import { usePageState } from '../lib/usePageState'
import { uid, type Block } from '../lib/blocks'
import { initialNodes, initialEdges } from '../data/architectureNodes'
import { diagramNodes, diagramEdges } from '../data/diagramNodes'

function TabBlocksContent({ storageKey }: { storageKey: string }) {
  const defaultBlocks: Block[] = [
    { id: uid(), type: 'heading', level: 2, text: 'New section' },
    { id: uid(), type: 'text', text: 'Click to edit this text. Use the + buttons to add new blocks.' },
  ]
  const { blocks, updateBlock, addBlock, removeBlock, saveStatus, forceSave } = usePageState(storageKey, defaultBlocks)
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="pl-10">
        <BlockEditor blocks={blocks} updateBlock={updateBlock} addBlock={addBlock} removeBlock={removeBlock} saveStatus={saveStatus} onSave={forceSave} />
      </div>
    </div>
  )
}

interface Props {
  page: PageDef
  defaultContent?: ReactNode
}

export default function DynamicPage({ page, defaultContent }: Props) {
  const { addTab, removeTab, updateTab } = usePagesContext()
  const [activeTabId, setActiveTabId] = useState(page.tabs[0]?.id || 'content')
  const prevTabCount = useRef(page.tabs.length)

  useEffect(() => {
    if (page.tabs.length > prevTabCount.current) {
      const newest = page.tabs[page.tabs.length - 1]
      if (newest) setActiveTabId(newest.id)
    }
    prevTabCount.current = page.tabs.length
  }, [page.tabs])

  const activeTab = page.tabs.find(t => t.id === activeTabId) || page.tabs[0]

  const handleRemoveTab = (tabId: string) => {
    if (tabId === activeTabId) {
      const remaining = page.tabs.filter(t => t.id !== tabId)
      if (remaining.length > 0) setActiveTabId(remaining[0].id)
    }
    removeTab(page.id, tabId)
  }

  const handleAddTab = (title: string, type: 'blocks' | 'board' | 'diagram') => {
    addTab(page.id, title, type)
  }

  const getDefaultsForBoard = (tabId: string) => {
    if (page.id === 'architecture' && tabId === 'board') {
      return { nodes: initialNodes, edges: initialEdges }
    }
    if (page.id === 'architecture' && tabId === 'diagram') {
      return { nodes: diagramNodes, edges: diagramEdges }
    }
    return { nodes: [], edges: [] }
  }

  const renderTabContent = () => {
    if (!activeTab) return null

    if (activeTab.type === 'board' || activeTab.type === 'diagram') {
      const defaults = getDefaultsForBoard(activeTab.id)
      return (
        <ReactFlowProvider key={`${page.id}:${activeTab.id}`}>
          <BoardView
            storageKey={`floranow:board:${page.id}:${activeTab.id}`}
            defaultNodes={defaults.nodes}
            defaultEdges={defaults.edges}
          />
        </ReactFlowProvider>
      )
    }

    if (activeTab.type === 'blocks') {
      if (defaultContent && activeTab.id === 'content') {
        return defaultContent
      }
      return <TabBlocksContent storageKey={`floranow:tab:${page.id}:${activeTab.id}`} />
    }

    return null
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      {/* Page header */}
      <div className="px-5 py-3 border-b border-gray-200 bg-white flex items-center gap-3 shrink-0">
        <span className="w-8 h-8 rounded-lg bg-fn-500 text-white flex items-center justify-center text-xs font-bold">
          {page.num}
        </span>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">
            {page.emoji} {page.title}
          </h1>
        </div>
      </div>

      {/* Tab bar */}
      <TabBar
        tabs={page.tabs}
        activeTab={activeTabId}
        onTabChange={setActiveTabId}
        onAddTab={handleAddTab}
        onRemoveTab={handleRemoveTab}
        onRenameTab={(tabId, title) => updateTab(page.id, tabId, { title })}
      />

      {/* Tab content */}
      <div className={`flex-1 min-h-0 ${activeTab?.type === 'blocks' ? 'overflow-y-auto' : ''}`}>
        {renderTabContent()}
      </div>
    </motion.div>
  )
}
