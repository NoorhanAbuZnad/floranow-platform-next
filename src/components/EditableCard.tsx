'use client'

import { useState, useRef, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import EditableText from './EditableText'

interface Props {
  emoji: string
  title: string
  description: string
  accent?: string
  borderTop?: string
  onUpdate: (patch: { emoji?: string; title?: string; description?: string }) => void
  onDelete?: () => void
}

const POPULAR_EMOJI = ['📦', '🚀', '⚡', '🔒', '📊', '🧪', '🛡️', '💡', '🎯', '✅', '⚙️', '📈', '🗄️', '🔄', '🌐', '📝', '🤖', '💾', '🔍', '🏗️']

export default function EditableCard({ emoji, title, description, accent, borderTop, onUpdate, onDelete }: Props) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showEmojiPicker) return
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmojiPicker(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showEmojiPicker])

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-fn-200 transition-all group/card relative"
      style={borderTop ? { borderTopWidth: 4, borderTopColor: borderTop } : undefined}
    >
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-opacity"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
      <div className="relative inline-block" ref={emojiRef}>
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3 hover:ring-2 hover:ring-fn-200 transition-all cursor-pointer"
          style={{ background: accent || '#DCFCE7' }}
        >
          {emoji}
        </button>
        {showEmojiPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50 grid grid-cols-5 gap-1 w-52">
            {POPULAR_EMOJI.map(e => (
              <button
                key={e}
                onClick={() => { onUpdate({ emoji: e }); setShowEmojiPicker(false) }}
                className="w-9 h-9 rounded-lg hover:bg-fn-50 flex items-center justify-center text-lg transition-colors"
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
      <EditableText
        value={title}
        onChange={val => onUpdate({ title: val })}
        as="h3"
        className="text-[15px] font-bold text-gray-900 mb-1.5"
        placeholder="Card title..."
      />
      <EditableText
        value={description}
        onChange={val => onUpdate({ description: val })}
        as="div"
        className="text-[13px] text-gray-500 leading-relaxed"
        placeholder="Card description..."
        multiline
      />
    </div>
  )
}
