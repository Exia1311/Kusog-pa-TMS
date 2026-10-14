import {redirect} from 'next/navigation'
import {sb} from '@/lib/supabase/server'
import IdleTimer from '@/components/IdleTimer'
import AppSidebar from '@/components/AppSidebar'

export const dynamic = 'force-dynamic'

export default async function AppLayout({children}:{children:React.ReactNode}){
  const s=sb(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect('/login')
  const {data:p}=await s.from('profiles').select('full_name,role,is_active').eq('id',user.id).single()
  if(!p?.is_active){await s.auth.signOut();redirect('/login')}

  return <div className="flex min-h-screen bg-slate-100 text-slate-900">
    <IdleTimer/>
    <AppSidebar fullName={p.full_name} role={p.role} />
    <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
  </div>
}
