import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ blocks: null })
  }

  try {
    const sql = getDb()
    const rows = await sql`SELECT blocks FROM pages WHERE page_key = ${key}`
    if (rows.length === 0) {
      return NextResponse.json({ blocks: null })
    }
    return NextResponse.json({ blocks: rows[0].blocks })
  } catch {
    return NextResponse.json({ blocks: null }, { status: 500 })
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
    await sql`
      INSERT INTO pages (page_key, blocks, updated_at)
      VALUES (${key}, ${JSON.stringify(blocks)}::jsonb, now())
      ON CONFLICT (page_key)
      DO UPDATE SET blocks = ${JSON.stringify(blocks)}::jsonb, updated_at = now()
    `
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
