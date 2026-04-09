'use client'

import { memo, useState, useRef, useEffect, useCallback } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react'
import { Trash2 } from 'lucide-react'

function EditableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  style,
  markerEnd,
}: EdgeProps) {
  const { setEdges, deleteElements } = useReactFlow()
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const label = (data?.label as string) || ''

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commitEdit = useCallback(() => {
    if (!inputRef.current) return
    const val = inputRef.current.value.trim()
    setEdges(eds =>
      eds.map(e =>
        e.id === id ? { ...e, data: { ...e.data, label: val } } : e
      )
    )
    setEditing(false)
  }, [id, setEdges])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElements({ edges: [{ id }] })
  }, [id, deleteElements])

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#22A652' : (style?.stroke as string) || '#22A652',
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: style?.strokeDasharray as string || undefined,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto absolute group"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          {editing ? (
            <input
              ref={inputRef}
              defaultValue={label}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  e.preventDefault()
                  commitEdit()
                }
              }}
              className="text-[11px] font-medium text-gray-700 bg-white border border-fn-300 rounded-md px-2 py-0.5 outline-none shadow-md w-32 text-center"
            />
          ) : (
            <div className="flex items-center gap-1">
              {label ? (
                <span
                  onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
                  className="text-[11px] font-medium text-gray-600 bg-white/95 border border-gray-200 rounded-md px-2 py-0.5 cursor-pointer hover:border-fn-300 transition-colors shadow-sm"
                >
                  {label}
                </span>
              ) : (
                <span
                  onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
                  className="text-[10px] text-gray-300 bg-white/80 border border-dashed border-gray-200 rounded-md px-2 py-0.5 cursor-pointer hover:border-fn-300 hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  + label
                </span>
              )}
              <button
                onClick={handleDelete}
                className="w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-300 hover:text-red-500 hover:border-red-300 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(EditableEdge)
