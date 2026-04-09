'use client'

import { useCallback, useState, useEffect, useMemo, type DragEvent } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  BackgroundVariant,
  Panel,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { RotateCcw, Trash2 } from 'lucide-react'
import ShapeNode from './ShapeNode'
import EditableEdge from './EditableEdge'
import ShapeSidebar, { type DragData } from './ShapeSidebar'

interface Props {
  storageKey: string
  defaultNodes?: Node[]
  defaultEdges?: Edge[]
}

function loadFromStorage(storageKey: string): { nodes?: Node[]; edges?: Edge[] } | null {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export default function BoardView({ storageKey, defaultNodes = [], defaultEdges = [] }: Props) {
  const { screenToFlowPosition } = useReactFlow()

  const saved = typeof window !== 'undefined' ? loadFromStorage(storageKey) : null
  const [nodes, setNodes, onNodesChange] = useNodesState(saved?.nodes?.length ? saved.nodes : defaultNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(saved?.edges?.length ? saved.edges : defaultEdges)

  const [selectedColor, setSelectedColor] = useState({ bg: '#F0FDF4', border: '#22A652', text: '#15803D' })
  const nodeTypes = useMemo(() => ({ shape: ShapeNode }), [])
  const edgeTypes = useMemo(() => ({ editable: EditableEdge }), [])

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify({ nodes, edges })) } catch {}
  }, [nodes, edges, storageKey])

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges(eds => addEdge({ ...params, type: 'editable', animated: true, style: { stroke: '#22A652', strokeWidth: 2 }, data: { label: '' } }, eds)),
    [setEdges],
  )

  const onDragOver = useCallback((e: DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }, [])

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData('application/reactflow')
    if (!raw) return
    let d: DragData
    try { d = JSON.parse(raw) } catch { return }
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    setNodes(nds => [...nds, {
      id: `node-${Date.now()}`,
      type: 'shape',
      position,
      data: { label: '', shape: d.shape, bgColor: d.bgColor, borderColor: d.borderColor, textColor: d.textColor },
    }])
  }, [screenToFlowPosition, setNodes])

  const resetBoard = () => {
    setNodes(defaultNodes)
    setEdges(defaultEdges)
    try { localStorage.removeItem(storageKey) } catch {}
  }

  const deleteSelected = () => {
    setNodes(nds => nds.filter(n => !n.selected))
    setEdges(eds => eds.filter(e => !e.selected))
  }

  const hasSelection = nodes.some(n => n.selected) || edges.some(e => e.selected)

  return (
    <div className="h-full flex">
      <ShapeSidebar selectedColor={selectedColor} onColorChange={setSelectedColor} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-3 py-1.5 border-b border-gray-200 bg-white flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-gray-400 mr-auto">Drag shapes onto the canvas · Double-click to edit text · Drag between handles to connect</span>
          {hasSelection && (
            <button onClick={deleteSelected} className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-[11px] font-semibold rounded-md hover:bg-red-100 transition-colors">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          )}
          <button onClick={resetBoard} className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] font-semibold rounded-md hover:bg-gray-200 transition-colors">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        <div className="flex-1">
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect} onDrop={onDrop} onDragOver={onDragOver}
            nodeTypes={nodeTypes} edgeTypes={edgeTypes}
            defaultEdgeOptions={{ type: 'editable' }}
            fitView fitViewOptions={{ padding: 0.12 }}
            deleteKeyCode={['Backspace', 'Delete']}
            multiSelectionKeyCode="Shift"
            className="bg-white"
            proOptions={{ hideAttribution: true }}
            snapToGrid snapGrid={[10, 10]}
          >
            <Controls className="!bg-white !border-gray-200 !shadow-md !rounded-xl" position="bottom-right" />
            <MiniMap
              style={{ background: '#FAFAFA', borderRadius: 10, border: '1px solid #E5E7EB', width: 140, height: 90 }}
              maskColor="rgba(34,166,82,0.06)"
              nodeColor={n => (n.data?.borderColor as string) || '#D1D5DB'}
              position="bottom-right" pannable zoomable
            />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E5E7EB" />
            <Panel position="bottom-center">
              <div className="bg-white/90 backdrop-blur border border-gray-200 rounded-full px-4 py-1.5 text-[10px] text-gray-400 font-medium shadow-sm">
                Floranow Data Platform · Databricks on AWS
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}
