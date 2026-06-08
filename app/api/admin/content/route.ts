import { NextResponse } from 'next/server'
import { requireAdminRequest } from '@/lib/admin-guard'

type AdminContentItem = {
  id: string
  type: 'product' | 'protocol' | 'recipe' | 'lesson' | 'lab-note' | 'tip' | 'announcement'
  title: string
  body: string
  plan: 'free' | 'professional'
  meta?: Record<string, unknown>
}

export async function GET(request: Request) {
  const guard = await requireAdminRequest(request)
  if (guard.response || !guard.admin) return guard.response
  const admin = guard.admin

  const [products, protocols, recipes, lessons, labNotes, tips, announcements] = await Promise.all([
    admin.from('products').select('id, name, purpose, colour_theme, accent, education').order('name'),
    admin.from('protocols').select('id, name, audience, growth_stage, expected_benefit, warnings').order('name'),
    admin.from('recipes').select('id, name, stage, guidance, warnings').order('name'),
    admin.from('university_lessons').select('id, title, body, pro_only, sort_order').order('sort_order'),
    admin.from('lab_notes').select('id, title, body, sort_order').order('sort_order'),
    admin.from('tips').select('id, product_id, title, body, pro_only').order('title'),
    admin.from('admin_announcements').select('id, title, body, published, created_at').order('created_at', { ascending: false }),
  ])

  const error = [products, protocols, recipes, lessons, labNotes, tips, announcements].find((result) => result.error)?.error
  if (error) return NextResponse.json({ ok: false, error: error.message, items: [] }, { status: 500 })

  const items: AdminContentItem[] = [
    ...(products.data ?? []).map((row) => ({
      id: String(row.id),
      type: 'product' as const,
      title: String(row.name ?? ''),
      body: String((row.education as { admin_body?: unknown } | null)?.admin_body ?? row.purpose ?? ''),
      plan: 'free' as const,
      meta: { purpose: row.purpose, colourTheme: row.colour_theme, accent: row.accent },
    })),
    ...(protocols.data ?? []).map((row) => ({
      id: String(row.id),
      type: 'protocol' as const,
      title: String(row.name ?? ''),
      body: [row.audience, row.growth_stage, row.expected_benefit, row.warnings].filter(Boolean).join('. '),
      plan: 'professional' as const,
      meta: { audience: row.audience, stage: row.growth_stage, warnings: row.warnings },
    })),
    ...(recipes.data ?? []).map((row) => ({
      id: String(row.id),
      type: 'recipe' as const,
      title: String(row.name ?? ''),
      body: [row.stage, row.guidance, row.warnings].filter(Boolean).join('. '),
      plan: 'professional' as const,
      meta: { stage: row.stage, warnings: row.warnings },
    })),
    ...(lessons.data ?? []).map((row) => ({
      id: String(row.id),
      type: 'lesson' as const,
      title: String(row.title ?? ''),
      body: String(row.body ?? ''),
      plan: row.pro_only ? 'professional' as const : 'free' as const,
      meta: { sortOrder: row.sort_order },
    })),
    ...(labNotes.data ?? []).map((row) => ({
      id: String(row.id),
      type: 'lab-note' as const,
      title: String(row.title ?? ''),
      body: String(row.body ?? ''),
      plan: 'free' as const,
      meta: { sortOrder: row.sort_order },
    })),
    ...(tips.data ?? []).map((row) => ({
      id: String(row.id),
      type: 'tip' as const,
      title: String(row.title ?? ''),
      body: String(row.body ?? ''),
      plan: row.pro_only ? 'professional' as const : 'free' as const,
      meta: { productId: row.product_id },
    })),
    ...(announcements.data ?? []).map((row) => ({
      id: String(row.id),
      type: 'announcement' as const,
      title: String(row.title ?? ''),
      body: String(row.body ?? ''),
      plan: row.published ? 'free' as const : 'professional' as const,
      meta: { published: row.published },
    })),
  ]

  return NextResponse.json({ ok: true, items })
}

export async function PATCH(request: Request) {
  const guard = await requireAdminRequest(request)
  if (guard.response || !guard.admin) return guard.response
  const admin = guard.admin

  let item: AdminContentItem
  try {
    const body = await request.json()
    item = body.item
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!item?.id || !item.title?.trim()) {
    return NextResponse.json({ ok: false, error: 'Missing item id or title' }, { status: 400 })
  }

  const title = item.title.trim()
  const body = item.body.trim()
  const proOnly = item.plan === 'professional'
  let result: { error: { message: string } | null }

  if (item.type === 'product') {
    result = await admin
      .from('products')
      .update({
        name: title,
        purpose: body || title,
        education: {
          ...(item.meta ?? {}),
          admin_body: body,
          updated_from_admin: true,
        },
      })
      .eq('id', item.id)
  } else if (item.type === 'protocol') {
    result = await admin
      .from('protocols')
      .update({ name: title, expected_benefit: body, warnings: String(item.meta?.warnings ?? '') })
      .eq('id', item.id)
  } else if (item.type === 'recipe') {
    result = await admin
      .from('recipes')
      .update({ name: title, guidance: body, warnings: String(item.meta?.warnings ?? '') })
      .eq('id', item.id)
  } else if (item.type === 'lesson') {
    result = await admin
      .from('university_lessons')
      .update({ title, body, pro_only: proOnly })
      .eq('id', item.id)
  } else if (item.type === 'lab-note') {
    result = await admin
      .from('lab_notes')
      .update({ title, body })
      .eq('id', item.id)
  } else if (item.type === 'tip') {
    result = await admin
      .from('tips')
      .update({ title, body, pro_only: proOnly })
      .eq('id', item.id)
  } else {
    result = await admin
      .from('admin_announcements')
      .update({ title, body, published: item.plan === 'free' })
      .eq('id', item.id)
  }

  if (result.error) return NextResponse.json({ ok: false, error: result.error.message }, { status: 500 })
  return NextResponse.json({ ok: true, item })
}

export const runtime = 'nodejs'
