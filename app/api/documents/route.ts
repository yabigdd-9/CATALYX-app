import { NextResponse } from 'next/server'
import { requirePortalUser } from '@/lib/portal-server'
import { publicPortalDocuments } from '@/lib/portal'

export async function GET(request: Request) {
  const guard = await requirePortalUser(request)
  if (guard.response || !guard.admin || !guard.appUser) return guard.response

  const { data, error } = await guard.admin
    .from('customer_documents')
    .select('id, user_id, title, document_type, description, public_url, storage_bucket, storage_path, is_private, published, created_at')
    .or(`user_id.eq.${guard.appUser.id},user_id.is.null`)
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ ok: false, error: error.message, documents: [] }, { status: 500 })

  const documents = await Promise.all(
    (data ?? []).map(async (doc) => {
      if (doc.storage_bucket && doc.storage_path && doc.is_private) {
        const { data: signed } = await guard.admin.storage.from(doc.storage_bucket).createSignedUrl(doc.storage_path, 60 * 15)
        return { ...doc, signed_url: signed?.signedUrl ?? null }
      }
      return doc
    })
  )

  return NextResponse.json({ ok: true, documents: [...documents, ...publicPortalDocuments] })
}

export const runtime = 'nodejs'
