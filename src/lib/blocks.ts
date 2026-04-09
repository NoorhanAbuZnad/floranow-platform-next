export type Block =
  | { id: string; type: 'heading'; level: 1 | 2 | 3; text: string }
  | { id: string; type: 'text'; text: string }
  | { id: string; type: 'callout'; variant: 'tip' | 'warn' | 'info'; text: string }
  | { id: string; type: 'card'; emoji: string; title: string; description: string; accent?: string; borderTop?: string }
  | { id: string; type: 'table'; headers: string[]; rows: string[][] }
  | { id: string; type: 'divider' }
  | {
      id: string
      type: 'card-grid'
      columns?: number
      cards: Array<{ emoji: string; title: string; description: string; accent?: string; borderTop?: string }>
    }
  | {
      id: string
      type: 'compare'
      leftTitle: string
      rightTitle: string
      items: Array<{ old: string; new: string }>
    }
  | {
      id: string
      type: 'flow'
      steps: Array<{ emoji: string; title: string; subtitle: string; color?: string }>
    }
  | { id: string; type: 'code'; code: string }

let counter = 0
export function uid(): string {
  return `b_${Date.now()}_${++counter}`
}

export function createBlock(type: Block['type']): Block {
  const id = uid()
  switch (type) {
    case 'heading':
      return { id, type: 'heading', level: 2, text: 'New Heading' }
    case 'text':
      return { id, type: 'text', text: 'Click to edit this text...' }
    case 'callout':
      return { id, type: 'callout', variant: 'tip', text: 'Add your tip here...' }
    case 'card':
      return { id, type: 'card', emoji: '📦', title: 'Card Title', description: 'Card description...' }
    case 'table':
      return { id, type: 'table', headers: ['Column 1', 'Column 2', 'Column 3'], rows: [['', '', '']] }
    case 'divider':
      return { id, type: 'divider' }
    case 'card-grid':
      return { id, type: 'card-grid', cards: [{ emoji: '📦', title: 'Card', description: 'Description...' }] }
    case 'compare':
      return { id, type: 'compare', leftTitle: 'Before', rightTitle: 'After', items: [{ old: 'Old item', new: 'New item' }] }
    case 'flow':
      return { id, type: 'flow', steps: [{ emoji: '▶️', title: 'Step', subtitle: 'Description' }] }
    case 'code':
      return { id, type: 'code', code: '// your code here' }
    default:
      return { id, type: 'text', text: '' }
  }
}
