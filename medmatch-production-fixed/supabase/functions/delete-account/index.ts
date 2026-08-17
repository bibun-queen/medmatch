import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const authHeader = req.headers.get('Authorization') || ''
  const url = Deno.env.get('SUPABASE_URL')!
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } })
  const { data: { user }, error } = await userClient.auth.getUser()
  if (error || !user) return new Response('Unauthorized', { status: 401 })
  const admin = createClient(url, service)
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'student') return new Response('Hospital/admin deletion requires operator handling', { status: 403 })
  const { error: delError } = await admin.auth.admin.deleteUser(user.id)
  if (delError) return new Response(delError.message, { status: 500 })
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } })
})
