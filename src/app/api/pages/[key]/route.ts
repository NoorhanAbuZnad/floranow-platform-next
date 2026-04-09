import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ blocks: null, snapshot: null })
  }

  try {
    const sql = getDb()
    const rows = await sql`SELECT blocks, snapshot FROM pages WHERE page_key = ${key}`
    if (rows.length === 0) {
      return NextResponse.json({ blocks: null, snapshot: null })
    }
    return NextResponse.json({
      blocks: rows[0].blocks,
      snapshot: rows[0].snapshot,
    })
  } catch {
    return NextResponse.json({ blocks: null, snapshot: null }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: 'No DATABASE_URL' }, { status: 503 })
  }

  try {
    const { blocks } = await req.json()
    const sql = getDb()
    const blocksJson = JSON.stringify(blocks)

    // Check if existing row's updated_at is >2 days old → snapshot before overwriting
    const existing = await sql`SELECT updated_at, blocks FROM pages WHERE page_key = ${key}`
    if (existing.length > 0 && existing[0].updated_at) {
      const updatedAt = new Date(existing[0].updated_at).getTime()
      const age = Date.now() - updatedAt
      if (age > TWO_DAYS_MS) {
        // Content was stable for 2+ days — snapshot it before overwriting
        const oldBlocksJson = JSON.stringify(existing[0].blocks)
        await sql`
          UPDATE pages
          SET snapshot = ${oldBlocksJson}::jsonb, snapshot_at = ${existing[0].updated_at}
          WHERE page_key = ${key}
        `
      }
    }

    await sql`
      INSERT INTO pages (page_key, blocks, updated_at)
      VALUES (${key}, ${blocksJson}::jsonb, now())
      ON CONFLICT (page_key)
      DO UPDATE SET blocks = ${blocksJson}::jsonb, updated_at = now()
    `
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
