import {redirect} from 'next/navigation'
import {sb} from '@/lib/supabase/server'
// Admin + active + MFA (aal2), checked server-side. Redirects otherwise.
export async function requireAdmin(){
  const s=sb(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect('/login')
  const {data:p}=await s.from('profiles').select('role,is_active').eq('id',user.id).single()
  if(!p?.is_active||p.role!=='admin') redirect('/tickets/new')
  const {data:a}=await s.auth.mfa.getAuthenticatorAssuranceLevel()
  if(a?.currentLevel!=='aal2') redirect('/mfa')
  return {s,user}
}
