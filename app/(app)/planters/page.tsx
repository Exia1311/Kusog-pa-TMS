import Link from 'next/link'
import {sb} from '@/lib/supabase/server'
import PlanterTable from '@/components/PlanterTable'

export const dynamic = 'force-dynamic'

export default async function Planters({searchParams}:{searchParams:{q?:string}}){
  const s=sb(); const {data:{user}}=await s.auth.getUser(); const {data:me}=await s.from('profiles').select('role').eq('id',user!.id).single()
  const {data:a}=await s.auth.mfa.getAuthenticatorAssuranceLevel(); const admin=me?.role==='admin',canEdit=admin&&a?.currentLevel==='aal2'
  const q=(searchParams.q||'').replace(/[%,()]/g,''); let qb=s.from('planters').select('*').order('planter_name').limit(200)
  if(q) qb=qb.or(`planter_name.ilike.%${q}%,planter_code.ilike.%${q}%`)
  const {data}=await qb
  return <div><h1 className="text-2xl font-semibold mb-3">Planters</h1>
    {admin&&!canEdit&&<p className="mb-3 text-sm bg-amber-50 border border-amber-300 rounded p-2">Editing planters needs MFA. <Link className="underline" href="/mfa">Verify now</Link></p>}
    <form className="mb-3 max-w-sm"><input name="q" defaultValue={q} placeholder="Search name or code"/></form>
    <PlanterTable rows={data||[]} canEdit={canEdit}/></div>
}
