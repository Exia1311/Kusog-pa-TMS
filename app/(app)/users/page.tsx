import {createClient} from '@supabase/supabase-js'
import {requireAdmin} from '@/lib/auth'
import UserCreate from '@/components/UserCreate'
import UserTable from '@/components/UserTable'

export const dynamic = 'force-dynamic'

export default async function Users(){
  const {user}=await requireAdmin()
  const a=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}})
  const [{data:ps},{data:au}]=await Promise.all([a.from('profiles').select('*').order('created_at'),a.auth.admin.listUsers({perPage:200})])
  const emails = Object.fromEntries((au?.users || []).map(u => [u.id, u.email]))

  return <div className="space-y-5">
    <h1 className="text-3xl font-bold tracking-tight text-slate-900">User management</h1>
    <UserCreate />
    <UserTable users={ps || []} emails={emails} currentUserId={user.id} />
  </div>
}
