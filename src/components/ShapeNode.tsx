'use client'

import { memo, useState, useRef, useEffect, useCallback, type CSSProperties } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import { Trash2 } from 'lucide-react'

export type ShapeType = 'rectangle' | 'rounded' | 'diamond' | 'circle' | 'cylinder' | 'hexagon' | 'parallelogram' | 'text'

const HANDLE_STYLE = (color: string): CSSProperties => ({
  background: color,
  width: 10,
  height: 10,
  border: '2px solid white',
  borderRadius: '50%',
})

function ShapeNode({ id, data, selected }: NodeProps) {
  const { setNodes, deleteElements } = useReactFlow()
  const [editing, setEditing] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  const label = (data.label as string) || ''
  const shape = (data.shape as ShapeType) || 'rounded'
  const bgColor = (data.bgColor as string) || '#F0FDF4'
  const borderColor = (data.borderColor as string) || '#22A652'
  const textColor = (data.textColor as string) || '#15803D'
  const width = (data.width as number) || undefined
  const height = (data.height as number) || undefined

  useEffect(() => {
    if (editing && textRef.current) {
      textRef.current.focus()
      const sel = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(textRef.current)
      range.collapse(false)
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [editing])

  const commitEdit = useCallback(() => {
    if (!textRef.current) return
    const newLabel = textRef.current.innerText.trim() || ''
    setNodes(nds =>
      nds.map(n => (n.id === id ? { ...n, data: { ...n.data, label: newLabel } } : n))
    )
    setEditing(false)
  }, [id, setNodes])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElements({ nodes: [{ id }] })
  }, [id, deleteElements])

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditing(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault()
      commitEdit()
    }
  }

  const textContent = (
    editing ? (
      <div
        ref={textRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={commitEdit}
        onKeyDown={handleKeyDown}
        className="outline-none text-center text-[13px] font-semibold leading-snug whitespace-pre-wrap min-w-[20px]"
        style={{ color: textColor }}
      >
        {label}
      </div>
    ) : (
      <div
        className="text-center text-[13px] font-semibold leading-snug whitespace-pre-wrap select-none"
        style={{ color: textColor }}
      >
        {label || <span className="text-gray-300 italic font-normal">double-click</span>}
      </div>
    )
  )

  const handles = (
    <>
      <Handle type="target" position={Position.Top} id="top" style={HANDLE_STYLE(borderColor)} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={HANDLE_STYLE(borderColor)} />
      <Handle type="target" position={Position.Left} id="left" style={HANDLE_STYLE(borderColor)} />
      <Handle type="source" position={Position.Right} id="right" style={HANDLE_STYLE(borderColor)} />
    </>
  )

  const deleteBtn = (
    <button
      onClick={handleDelete}
      className="absolute -top-3 -right-3 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-all opacity-0 group-hover:opacity-100"
    >
      <Trash2 className="w-3 h-3" />
    </button>
  )

  const selectionRing = selected ? `0 0 0 2px ${borderColor}50` : 'none'

  const baseWrapper = "group relative cursor-pointer"

  switch (shape) {
    case 'rectangle':
      return (
        <div className={baseWrapper} onDoubleClick={handleDoubleClick}>
          {handles}
          {deleteBtn}
          <div
            className="px-5 py-3 flex items-center justify-center"
            style={{
              background: bgColor,
              border: `2px solid ${borderColor}`,
              borderRadius: 4,
              boxShadow: selectionRing,
              minWidth: width || 140,
              minHeight: height || 50,
            }}
          >
            {textContent}
          </div>
        </div>
      )

    case 'rounded':
      return (
        <div className={baseWrapper} onDoubleClick={handleDoubleClick}>
          {handles}
          {deleteBtn}
          <div
            className="px-5 py-3 flex items-center justify-center"
            style={{
              background: bgColor,
              border: `2px solid ${borderColor}`,
              borderRadius: 12,
              boxShadow: selectionRing,
              minWidth: width || 140,
              minHeight: height || 50,
            }}
          >
            {textContent}
          </div>
        </div>
      )

    case 'circle':
      return (
        <div className={baseWrapper} onDoubleClick={handleDoubleClick}>
          {handles}
          {deleteBtn}
          <div
            className="flex items-center justify-center"
            style={{
              background: bgColor,
              border: `2px solid ${borderColor}`,
              borderRadius: '50%',
              boxShadow: selectionRing,
              width: width || 100,
              height: height || 100,
            }}
          >
            {textContent}
          </div>
        </div>
      )

    case 'diamond':
      return (
        <div className={baseWrapper} onDoubleClick={handleDoubleClick} style={{ padding: 10 }}>
          {handles}
          {deleteBtn}
          <div
            className="flex items-center justify-center"
            style={{
              background: bgColor,
              border: `2px solid ${borderColor}`,
              transform: 'rotate(45deg)',
              boxShadow: selectionRing,
              width: width || 90,
              height: height || 90,
              borderRadius: 6,
            }}
          >
            <div style={{ transform: 'rotate(-45deg)', padding: 8 }}>
              {textContent}
            </div>
          </div>
        </div>
      )

    case 'cylinder': {
      const w = width || 140
      const h = height || 80
      return (
        <div className={baseWrapper} onDoubleClick={handleDoubleClick}>
          {handles}
          {deleteBtn}
          <svg width={w} height={h + 24} viewBox={`0 0 ${w} ${h + 24}`} className="overflow-visible">
            <ellipse cx={w / 2} cy={12} rx={w / 2 - 1} ry={12} fill={bgColor} stroke={borderColor} strokeWidth={2} />
            <rect x={1} y={12} width={w - 2} height={h} fill={bgColor} stroke={borderColor} strokeWidth={2} />
            <line x1={1} y1={12} x2={1} y2={h + 12} stroke={borderColor} strokeWidth={2} />
            <line x1={w - 1} y1={12} x2={w - 1} y2={h + 12} stroke={borderColor} strokeWidth={2} />
            <ellipse cx={w / 2} cy={h + 12} rx={w / 2 - 1} ry={12} fill={bgColor} stroke={borderColor} strokeWidth={2} />
            <rect x={2} y={12} width={w - 4} height={h} fill={bgColor} stroke="none" />
            <ellipse cx={w / 2} cy={12} rx={w / 2 - 1} ry={12} fill={bgColor} stroke={borderColor} strokeWidth={2} />
          </svg>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ paddingTop: 12 }}
          >
            {textContent}
          </div>
        </div>
      )
    }

    case 'hexagon': {
      const w = width || 150
      const h = height || 70
      const inset = 20
      const points = `${inset},0 ${w - inset},0 ${w},${h / 2} ${w - inset},${h} ${inset},${h} 0,${h / 2}`
      return (
        <div className={baseWrapper} onDoubleClick={handleDoubleClick}>
          {handles}
          {deleteBtn}
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
            <polygon
              points={points}
              fill={bgColor}
              stroke={borderColor}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center px-6">
            {textContent}
          </div>
        </div>
      )
    }

    case 'parallelogram': {
      const w = width || 160
      const h = height || 60
      const skew = 20
      const points = `${skew},0 ${w},0 ${w - skew},${h} 0,${h}`
      return (
        <div className={baseWrapper} onDoubleClick={handleDoubleClick}>
          {handles}
          {deleteBtn}
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
            <polygon
              points={points}
              fill={bgColor}
              stroke={borderColor}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center px-6">
            {textContent}
          </div>
        </div>
      )
    }

    case 'text':
      return (
        <div className={baseWrapper} onDoubleClick={handleDoubleClick}>
          {handles}
          {deleteBtn}
          <div
            className="px-3 py-2 flex items-center justify-center"
            style={{
              boxShadow: selected ? `0 0 0 1px ${borderColor}` : 'none',
              borderRadius: 4,
              minWidth: 60,
            }}
          >
            {textContent}
          </div>
        </div>
      )

    default:
      return null
  }
}

export default memo(ShapeNode)
