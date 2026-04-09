'use client'

import { Trash2, GripVertical, Save, Check, Loader2, AlertCircle } from 'lucide-react'
import type { Block } from '../lib/blocks'
import type { SaveStatus } from '../lib/usePageState'
import EditableText from './EditableText'
import AddBlockMenu from './AddBlockMenu'
import EditableTable from './EditableTable'
import EditableCard from './EditableCard'

interface Props {
  blocks: Block[]
  updateBlock: (id: string, patch: Partial<Block>) => void
  addBlock: (block: Block, afterId?: string) => void
  removeBlock: (id: string) => void
  saveStatus?: SaveStatus
  onSave?: () => void
}

const HEADING_CLASSES: Record<number, string> = {
  1: 'text-2xl font-bold text-gray-900 tracking-tight',
  2: 'text-lg font-bold text-gray-900',
  3: 'text-[15px] font-semibold text-gray-800',
}

const CALLOUT_STYLES: Record<string, string> = {
  tip: 'bg-fn-50 border-fn-200 border-l-fn-500 text-fn-800',
  warn: 'bg-amber-50 border-amber-200 border-l-amber-500 text-amber-900',
  info: 'bg-blue-50 border-blue-200 border-l-blue-500 text-blue-900',
}

function renderBlock(
  block: Block,
  updateBlock: Props['updateBlock'],
  removeBlock: Props['removeBlock'],
  addBlock: Props['addBlock'],
) {
  switch (block.type) {
    case 'heading':
      return (
        <EditableText
          value={block.text}
          onChange={text => updateBlock(block.id, { text })}
          as={`h${block.level}` as 'h1' | 'h2' | 'h3'}
          className={HEADING_CLASSES[block.level] || HEADING_CLASSES[2]}
          placeholder="Heading..."
        />
      )

    case 'text':
      return (
        <EditableText
          value={block.text}
          onChange={text => updateBlock(block.id, { text })}
          as="p"
          className="text-[13.5px] text-gray-600 leading-relaxed"
          placeholder="Type something..."
          multiline
        />
      )

    case 'callout':
      return (
        <div className="flex flex-col gap-1">
          <div className="flex gap-1.5 mb-1">
            {(['tip', 'warn', 'info'] as const).map(v => (
              <button
                key={v}
                onClick={() => updateBlock(block.id, { variant: v })}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                  block.variant === v
                    ? 'bg-fn-500 text-white'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className={`border border-l-4 rounded-lg px-4 py-3 text-[13px] leading-relaxed ${CALLOUT_STYLES[block.variant]}`}>
            <EditableText
              value={block.text}
              onChange={text => updateBlock(block.id, { text })}
              as="span"
              className="inline"
              placeholder="Callout text..."
              multiline
            />
          </div>
        </div>
      )

    case 'card':
      return (
        <EditableCard
          emoji={block.emoji}
          title={block.title}
          description={block.description}
          accent={block.accent}
          borderTop={block.borderTop}
          onUpdate={patch => updateBlock(block.id, patch)}
        />
      )

    case 'table':
      return (
        <EditableTable
          headers={block.headers}
          rows={block.rows}
          onUpdate={(headers, rows) => updateBlock(block.id, { headers, rows })}
        />
      )

    case 'divider':
      return <hr className="border-gray-200 my-2" />

    case 'card-grid':
      return (
        <div className={`grid gap-4 ${block.columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {block.cards.map((card, i) => (
            <EditableCard
              key={i}
              emoji={card.emoji}
              title={card.title}
              description={card.description}
              accent={card.accent}
              borderTop={card.borderTop}
              onUpdate={patch => {
                const cards = [...block.cards]
                cards[i] = { ...cards[i], ...patch }
                updateBlock(block.id, { cards })
              }}
              onDelete={block.cards.length > 1 ? () => {
                const cards = block.cards.filter((_, idx) => idx !== i)
                updateBlock(block.id, { cards })
              } : undefined}
            />
          ))}
          <button
            onClick={() => {
              const cards = [...block.cards, { emoji: '📦', title: 'New Card', description: 'Description...' }]
              updateBlock(block.id, { cards })
            }}
            className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center min-h-[120px] text-gray-300 hover:text-fn-400 hover:border-fn-200 transition-colors text-sm font-medium"
          >
            + Add Card
          </button>
        </div>
      )

    case 'compare':
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <EditableText
              value={block.leftTitle}
              onChange={leftTitle => updateBlock(block.id, { leftTitle })}
              as="h3"
              className="text-sm font-bold text-red-600 mb-2 text-center"
            />
            {block.items.map((item, i) => (
              <div key={i} className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-2 flex items-center gap-2">
                <EditableText
                  value={item.old}
                  onChange={val => {
                    const items = [...block.items]
                    items[i] = { ...items[i], old: val }
                    updateBlock(block.id, { items })
                  }}
                  as="span"
                  className="text-[13px] text-red-700 flex-1"
                />
                {block.items.length > 1 && (
                  <button
                    onClick={() => {
                      const items = block.items.filter((_, idx) => idx !== i)
                      updateBlock(block.id, { items })
                    }}
                    className="text-red-300 hover:text-red-500 shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div>
            <EditableText
              value={block.rightTitle}
              onChange={rightTitle => updateBlock(block.id, { rightTitle })}
              as="h3"
              className="text-sm font-bold text-fn-600 mb-2 text-center"
            />
            {block.items.map((item, i) => (
              <div key={i} className="bg-fn-50 border border-fn-200 rounded-lg px-3 py-2 mb-2">
                <EditableText
                  value={item.new}
                  onChange={val => {
                    const items = [...block.items]
                    items[i] = { ...items[i], new: val }
                    updateBlock(block.id, { items })
                  }}
                  as="span"
                  className="text-[13px] text-fn-700 flex-1"
                />
              </div>
            ))}
          </div>
          <div className="col-span-2 flex justify-center">
            <button
              onClick={() => {
                const items = [...block.items, { old: 'Old item', new: 'New item' }]
                updateBlock(block.id, { items })
              }}
              className="text-[11px] text-gray-400 hover:text-fn-500 transition-colors"
            >
              + Add row
            </button>
          </div>
        </div>
      )

    case 'flow':
      return (
        <div className="flex flex-wrap items-center gap-2">
          {block.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 hover:shadow-md transition-shadow group relative"
                style={step.color ? { borderTopWidth: 3, borderTopColor: step.color } : undefined}
              >
                <div className="text-lg mb-1">{step.emoji}</div>
                <EditableText
                  value={step.title}
                  onChange={val => {
                    const steps = [...block.steps]
                    steps[i] = { ...steps[i], title: val }
                    updateBlock(block.id, { steps })
                  }}
                  as="div"
                  className="text-[13px] font-semibold text-gray-900"
                />
                <EditableText
                  value={step.subtitle}
                  onChange={val => {
                    const steps = [...block.steps]
                    steps[i] = { ...steps[i], subtitle: val }
                    updateBlock(block.id, { steps })
                  }}
                  as="div"
                  className="text-[11px] text-gray-500"
                />
                {block.steps.length > 1 && (
                  <button
                    onClick={() => {
                      const steps = block.steps.filter((_, idx) => idx !== i)
                      updateBlock(block.id, { steps })
                    }}
                    className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-0.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              {i < block.steps.length - 1 && <span className="text-gray-300 text-lg">→</span>}
            </div>
          ))}
          <button
            onClick={() => {
              const steps = [...block.steps, { emoji: '▶️', title: 'Step', subtitle: 'Description' }]
              updateBlock(block.id, { steps })
            }}
            className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 text-gray-300 hover:text-fn-400 hover:border-fn-200 transition-colors text-[11px] font-medium min-h-[70px] flex items-center"
          >
            + Step
          </button>
        </div>
      )

    case 'code':
      return (
        <div className="bg-gray-900 rounded-xl p-4 font-mono text-[12px] text-gray-100 overflow-x-auto">
          <EditableText
            value={block.code}
            onChange={code => updateBlock(block.id, { code })}
            as="div"
            className="whitespace-pre text-gray-100 focus:bg-gray-800/50 focus:ring-gray-700"
            multiline
          />
        </div>
      )

    default:
      return null
  }
}

function SaveBar({ status, onSave }: { status: SaveStatus; onSave?: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2 mb-3 px-1">
      <div className="flex items-center gap-1.5 text-xs">
        {status === 'saving' && (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
            <span className="text-blue-600">Saving...</span>
          </>
        )}
        {status === 'saved' && (
          <>
            <Check className="w-3.5 h-3.5 text-green-500" />
            <span className="text-green-600">Saved</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <span className="text-red-600">Save failed</span>
          </>
        )}
        {status === 'idle' && (
          <span className="text-gray-400">Auto-save on</span>
        )}
      </div>
      {onSave && (
        <button
          onClick={onSave}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-fn-500 text-white hover:bg-fn-600 transition-colors"
        >
          <Save className="w-3 h-3" />
          Save
        </button>
      )}
    </div>
  )
}

export default function BlockEditor({ blocks, updateBlock, addBlock, removeBlock, saveStatus, onSave }: Props) {
  return (
    <div className="space-y-1">
      {saveStatus !== undefined && <SaveBar status={saveStatus} onSave={onSave} />}
      <AddBlockMenu onAdd={block => addBlock(block, undefined)} />
      {blocks.map(block => (
        <div key={block.id}>
          <div className="group relative">
            <div className="absolute -left-10 top-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-gray-300 hover:text-gray-500 cursor-grab">
                <GripVertical className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeBlock(block.id)}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="py-1">
              {renderBlock(block, updateBlock, removeBlock, addBlock)}
            </div>
          </div>
          <AddBlockMenu onAdd={newBlock => addBlock(newBlock, block.id)} />
        </div>
      ))}
    </div>
  )
}
