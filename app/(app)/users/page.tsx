import {createClient} from '@supabase/supabase-js'
import {requireAdmin} from '@/lib/auth'
import UserCreate from '@/components/UserCreate'
import {setRole,setActive} from '@/app/user-actions'

export const dynamic = 'force-dynamic'

export default async function Users(){
  const {user}=await requireAdmin()
  const a=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}})
  const [{data:ps},{data:au}]=await Promise.all([a.from('profiles').select('*').order('created_at'),a.auth.admin.listUsers({perPage:200})])
  const em=new Map(au?.users.map(u=>[u.id,u.email])||[])
  return <div><h1 className="text-2xl font-semibold mb-3">User management</h1><UserCreate/>
    <table className="w-full bg-white text-sm"><thead className="text-left bg-slate-100"><tr>{['Name','Email','Role','Active',''].map(h=><th key={h} className="p-2">{h}</th>)}</tr></thead>
    <tbody>{ps?.map(p=><tr key={p.id} className="border-t"><td className="p-2">{p.full_name}</td><td className="p-2">{em.get(p.id)}</td>
      <td className="p-2">{p.id===user.id?p.role:<form action={setRole.bind(null,p.id)} className="flex gap-1"><select name="role" defaultValue={p.role} className="w-32"><option value="dispatcher">dispatcher</option><option value="admin">admin</option></select><button className="underline">Set</button></form>}</td>
      <td className="p-2">{p.is_active?'Yes':'No'}</td>
      <td className="p-2">{p.id!==user.id&&<form action={setActive.bind(null,p.id,!p.is_active)}><button className="underline">{p.is_active?'Deactivate':'Reactivate'}</button></form>}</td></tr>)}</tbody></table></div>
}
