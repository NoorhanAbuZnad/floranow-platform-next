'use client'

import { useState } from 'react'
import {
  Square,
  RectangleHorizontal,
  Circle,
  Diamond,
  Database,
  Hexagon,
  Type,
  Minus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import type { ShapeType } from './ShapeNode'

interface ShapeOption {
  shape: ShapeType
  label: string
  icon: typeof Square
}

const BASIC_SHAPES: ShapeOption[] = [
  { shape: 'rectangle', label: 'Rectangle', icon: Square },
  { shape: 'rounded', label: 'Rounded Rect', icon: RectangleHorizontal },
  { shape: 'circle', label: 'Circle', icon: Circle },
  { shape: 'diamond', label: 'Diamond', icon: Diamond },
  { shape: 'cylinder', label: 'Cylinder / DB', icon: Database },
  { shape: 'hexagon', label: 'Hexagon', icon: Hexagon },
  { shape: 'parallelogram', label: 'Parallelogram', icon: Minus },
  { shape: 'text', label: 'Text Only', icon: Type },
]

const COLOR_PRESETS = [
  { label: 'Source (Indigo)', bg: '#EEF2FF', border: '#6366F1', text: '#4338CA' },
  { label: 'Ingestion (Green)', bg: '#F0FDF4', border: '#22A652', text: '#15803D' },
  { label: 'Bronze', bg: '#FDF4E8', border: '#CD7F32', text: '#92400E' },
  { label: 'Silver', bg: '#F1F5F9', border: '#8C9EAF', text: '#334155' },
  { label: 'Gold', bg: '#FFFBEB', border: '#D4A017', text: '#92400E' },
  { label: 'Warehouse (Purple)', bg: '#F5F3FF', border: '#8B5CF6', text: '#6D28D9' },
  { label: 'BI (Pink)', bg: '#FDF2F8', border: '#EC4899', text: '#BE185D' },
  { label: 'AI (Amber)', bg: '#FFFBEB', border: '#F59E0B', text: '#B45309' },
  { label: 'Governance (Cyan)', bg: '#F0F9FF', border: '#0EA5E9', text: '#0369A1' },
  { label: 'Red', bg: '#FEF2F2', border: '#EF4444', text: '#B91C1C' },
  { label: 'White', bg: '#FFFFFF', border: '#D1D5DB', text: '#374151' },
  { label: 'Dark', bg: '#1F2937', border: '#4B5563', text: '#F9FAFB' },
]

export interface DragData {
  shape: ShapeType
  bgColor: string
  borderColor: string
  textColor: string
}

interface Props {
  selectedColor: { bg: string; border: string; text: string }
  onColorChange: (c: { bg: string; border: string; text: string }) => void
}

export default function ShapeSidebar({ selectedColor, onColorChange }: Props) {
  const [shapesOpen, setShapesOpen] = useState(true)
  const [colorsOpen, setColorsOpen] = useState(true)

  const onDragStart = (e: React.DragEvent, shape: ShapeType) => {
    const dragData: DragData = {
      shape,
      bgColor: selectedColor.bg,
      borderColor: selectedColor.border,
      textColor: selectedColor.text,
    }
    e.dataTransfer.setData('application/reactflow', JSON.stringify(dragData))
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="w-[200px] border-r border-gray-200 bg-white flex flex-col shrink-0 overflow-y-auto">
      {/* Shapes section */}
      <div className="border-b border-gray-100">
        <button
          onClick={() => setShapesOpen(!shapesOpen)}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-50"
        >
          {shapesOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Shapes
        </button>
        {shapesOpen && (
          <div className="grid grid-cols-4 gap-1 px-2 pb-3">
            {BASIC_SHAPES.map(({ shape, label, icon: Icon }) => (
              <div
                key={shape}
                draggable
                onDragStart={e => onDragStart(e, shape)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-fn-50 hover:text-fn-600 text-gray-500 transition-colors group"
                title={`Drag to add: ${label}`}
              >
                <div
                  className="w-9 h-9 rounded-lg border-2 border-gray-200 group-hover:border-fn-300 flex items-center justify-center transition-colors"
                  style={{ background: selectedColor.bg, borderColor: selectedColor.border + '60' }}
                >
                  <Icon className="w-4 h-4" style={{ color: selectedColor.border }} />
                </div>
                <span className="text-[8px] font-medium leading-tight text-center">{label.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Colors section */}
      <div className="border-b border-gray-100">
        <button
          onClick={() => setColorsOpen(!colorsOpen)}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-50"
        >
          {colorsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Colors
        </button>
        {colorsOpen && (
          <div className="px-3 pb-3 space-y-1">
            {COLOR_PRESETS.map(c => {
              const isSelected = c.bg === selectedColor.bg && c.border === selectedColor.border
              return (
                <button
                  key={c.label}
                  onClick={() => onColorChange({ bg: c.bg, border: c.border, text: c.text })}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${
                    isSelected ? 'bg-fn-50 ring-1 ring-fn-300' : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-md shrink-0"
                    style={{ background: c.bg, border: `2px solid ${c.border}` }}
                  />
                  <span className="text-[10px] font-medium text-gray-600 truncate">{c.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-3 text-[10px] text-gray-400 leading-relaxed space-y-1">
        <p><strong className="text-gray-500">Drag</strong> a shape onto the canvas</p>
        <p><strong className="text-gray-500">Pick a color</strong> before dragging</p>
        <p><strong className="text-gray-500">Double-click</strong> any shape to edit text</p>
        <p><strong className="text-gray-500">Drag</strong> between handles to connect</p>
        <p><strong className="text-gray-500">Delete/Backspace</strong> to remove</p>
      </div>
    </div>
  )
}
