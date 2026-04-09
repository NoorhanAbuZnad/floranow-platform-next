'use client'

import { Plus, Trash2 } from 'lucide-react'
import EditableText from './EditableText'

interface Props {
  headers: string[]
  rows: string[][]
  onUpdate: (headers: string[], rows: string[][]) => void
}

export default function EditableTable({ headers, rows, onUpdate }: Props) {
  const updateHeader = (i: number, val: string) => {
    const h = [...headers]
    h[i] = val
    onUpdate(h, rows)
  }

  const updateCell = (row: number, col: number, val: string) => {
    const r = rows.map(r => [...r])
    r[row][col] = val
    onUpdate(headers, r)
  }

  const addRow = () => {
    onUpdate(headers, [...rows, headers.map(() => '')])
  }

  const addColumn = () => {
    onUpdate([...headers, `Column ${headers.length + 1}`], rows.map(r => [...r, '']))
  }

  const removeRow = (i: number) => {
    onUpdate(headers, rows.filter((_, idx) => idx !== i))
  }

  const removeColumn = (i: number) => {
    if (headers.length <= 1) return
    onUpdate(
      headers.filter((_, idx) => idx !== i),
      rows.map(r => r.filter((_, idx) => idx !== i))
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {headers.map((h, i) => (
              <th key={i} className="group relative text-left font-semibold text-gray-700 px-4 py-2.5">
                <EditableText value={h} onChange={val => updateHeader(i, val)} as="span" className="font-semibold" />
                {headers.length > 1 && (
                  <button
                    onClick={() => removeColumn(i)}
                    className="absolute top-0.5 right-0.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </th>
            ))}
            <th className="w-8 px-1">
              <button
                onClick={addColumn}
                className="text-gray-300 hover:text-fn-500 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-gray-100 group/row hover:bg-gray-50/50">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2 text-gray-600">
                  <EditableText value={cell} onChange={val => updateCell(ri, ci, val)} as="span" />
                </td>
              ))}
              <td className="px-1">
                {rows.length > 1 && (
                  <button
                    onClick={() => removeRow(ri)}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover/row:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addRow}
        className="w-full py-1.5 text-[11px] text-gray-300 hover:text-fn-500 hover:bg-fn-50/50 transition-colors font-medium"
      >
        + Add row
      </button>
    </div>
  )
}
