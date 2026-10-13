// MedMatch: student self-service account deletion.
// Deploy this Edge Function before publishing the client-side deletion UI.
// This function must require a valid signed-in user's JWT and must never accept a target user ID.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WEB_ORIGIN = 'https://bibun-queen.github.io'
const BUCKET = 'verification-documents'
// Server-only service role key must never appear in static frontend files.
const CONFIRM_TEXT = 'DELETE_MY_STUDENT_ACCOUNT'

function response(req: Request, status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': WEB_ORIGIN,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin',
      'Cache-Control': 'no-store',
    },
  })
}

function failure(req: Request, status: number, message: string) {
  return response(req, status, { ok: false, message })
}

type StorageEntry = {
  name: string
  id?: string | null
  metadata?: unknown
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return response(req, 200, { ok: true })
  if (req.method !== 'POST') return failure(req, 405, 'POST以外は利用できません。')
  // Browser-origin restriction is defense in depth; authorization is checked independently.
  const origin = req.headers.get('Origin')
  if (origin && origin !== WEB_ORIGIN) return failure(req, 403, '許可されていない送信元です。')
  const authHeader = req.headers.get('Authorization') || ''
  if (!authHeader.startsWith('Bearer ')) return failure(req, 401, 'ログインが必要です。')

  let body: { confirmation?: string; password?: string; preview?: boolean }
  try { body = await req.json() } catch { return failure(req, 400, '入力内容が正しくありません。') }
  if (!body || body.confirmation !== CONFIRM_TEXT) return failure(req, 400, '退会の確認が必要です。')

  const url = Deno.env.get('SUPABASE_URL')
  // Support both legacy JWT API keys and the newer named API key environment.
  const envNamedKey = (name: string, key: string): string | undefined => {
    try {
      const obj = JSON.parse(Deno.env.get(name) || '{}') as Record<string, unknown>
      return typeof obj[key] === 'string' ? obj[key] as string : undefined
    } catch { return undefined }
  }
  const publishableOrAnon = Deno.env.get('SUPABASE_ANON_KEY') ||
    envNamedKey('SUPABASE_PUBLISHABLE_KEYS', 'default') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
    envNamedKey('SUPABASE_SECRET_KEYS', 'default') || Deno.env.get('SUPABASE_SECRET_KEY')
  if (!url || !publishableOrAnon || !serviceKey) {
    console.error('delete-account: Supabase server environment is incomplete')
    return failure(req, 503, 'サーバー設定に問題があります。運営者へ連絡してください。')
  }

  const userClient = createClient(url, publishableOrAnon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: userData, error: authError } = await userClient.auth.getUser(authHeader.slice(7))
  if (authError || !userData.user) return failure(req, 401, 'ログイン情報を確認できませんでした。')

  const uid = userData.user.id  // Take identity ONLY from the verified JWT.
  // The server must reauthenticate deletion, rather than trusting a client-side check.
  // Preflight does not delete anything, so a fresh password is needed only for deletion.
  if (body.preview !== true) {
    if (!userData.user.email || typeof body.password !== 'string' ||
        body.password.length < 8 || body.password.length > 256) {
      return failure(req, 400, '現在のパスワードを入力してください。')
    }
    const { data: reauth, error: reauthError } = await userClient.auth.signInWithPassword({
      email: userData.user.email,
      password: body.password,
    })
    if (reauthError || reauth.user?.id !== uid) {
      return failure(req, 401, '現在のパスワードが正しくありません。')
    }
  }
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: profile, error: profileError } = await admin.from('profiles')
    .select('role').eq('id', uid).maybeSingle()
  if (profileError) return failure(req, 503, 'アカウント情報を確認できませんでした。')
  if (profile?.role !== 'student') return failure(req, 403, '学生以外の退会は運営者へお問い合わせください。')

  // Include both referenced verification files and any unreferenced files in the user's own folder.
  const { data: docs, error: docsError } = await admin.from('verification_documents')
    .select('storage_path').eq('user_id', uid)
  if (docsError) return failure(req, 503, '本人確認書類を確認できませんでした。')

  const prefix = `${uid}/`
  const paths = new Set<string>()
  for (const doc of docs || []) {
    const path = doc.storage_path
    const suffix = typeof path === 'string' && path.startsWith(prefix) ? path.slice(prefix.length) : ''
    if (!suffix || suffix.split('/').some((s) => !s || s === '.' || s === '..')) {
      console.error('delete-account: unexpected storage path in verification_documents')
      return failure(req, 409, '旧形式の書類があります。運営者による退会処理が必要です。')
    }
    paths.add(path)
  }

  // Find orphan files recursively. Offset based pagination and a safety cap avoid an unbounded scan.
  let scanned = 0
  const scanFolder = async (folder: string, depth: number): Promise<void> => {
    if (depth > 6) throw new Error('storage nesting exceeds safety limit')
    for (let offset = 0; ; offset += 100) {
      if (++scanned > 200) throw new Error('storage scan safety limit reached')
      const { data, error } = await admin.storage.from(BUCKET).list(folder, {
        limit: 100, offset, sortBy: { column: 'name', order: 'asc' },
      })
      if (error) throw error
      const entries = (data || []) as StorageEntry[]
      for (const entry of entries) {
        if (!entry.name || entry.name === '.' || entry.name === '..' || entry.name.includes('/')) {
          throw new Error('unexpected storage item name')
        }
        const fullPath = `${folder}/${entry.name}`
        if (!fullPath.startsWith(prefix)) throw new Error('unsafe storage path')
        // Folder records from list() have a null id and null metadata.
        if (entry.id == null && entry.metadata == null) await scanFolder(fullPath, depth + 1)
        else paths.add(fullPath)
      }
      if (entries.length < 100) break
    }
  }
  try { await scanFolder(uid, 0) }
  catch (err) {
    console.error('delete-account: failed to enumerate verification files', err)
    return failure(req, 503, '保存書類の確認に失敗しました。退会処理は開始していません。')
  }

  // A non-destructive server preflight can be used before enabling the real deletion action.
  if (body.preview === true) {
    return response(req, 200, { ok: true, preview: true, verificationFiles: paths.size })
  }

  // Object ownership blocks Auth deletion. Remove the student's files before deleting Auth.
  // Retrying after a partial failure is safe: files removed on the previous attempt are simply absent.
  try {
    const files = [...paths].sort()
    for (let i = 0; i < files.length; i += 100) {
      const { error } = await admin.storage.from(BUCKET).remove(files.slice(i, i + 100))
      if (error) throw error
    }
  } catch (err) {
    console.error('delete-account: failed to remove verification files', err)
    return failure(req, 503, '学生証ファイルを削除できませんでした。退会処理を中断しました。')
  }

  // Check that the student's storage folder is empty before deleting auth account.
  // If another upload happened concurrently or a file could not be removed, abort.
  try {
    const remaining = new Set<string>()
    paths.clear()
    scanned = 0
    await scanFolder(uid, 0)
    for (const file of paths) remaining.add(file)
    if (remaining.size) {
      console.error('delete-account: files remain after Storage removal', remaining.size)
      return failure(req, 503, '学生証ファイルが残っています。退会処理を中断しました。')
    }
  } catch (err) {
    console.error('delete-account: failed to check Storage removal', err)
    return failure(req, 503, '学生証ファイルの削除確認に失敗しました。退会処理を中断しました。')
  }

  // Postgres FK cascades remove rows referencing profiles. Their correctness must be verified
  // with the read-only constraint preflight before enabling this endpoint.
  const { error: deleteError } = await admin.auth.admin.deleteUser(uid)
  if (deleteError) {
    console.error('delete-account: user deletion failed', deleteError)
    return failure(req, 503, 'アカウント削除に失敗しました。運営者へお問い合わせください。')
  }
  return response(req, 200, { ok: true, deleted: true })
})
