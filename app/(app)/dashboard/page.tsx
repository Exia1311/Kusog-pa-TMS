import Link from 'next/link'
import {sb} from '@/lib/supabase/server'
import Cards from '@/components/Cards'
export default async function Dashboard(){
  const {data}=await sb().rpc('dashboard_stats')
  return <div><h1 className="text-2xl font-semibold mb-3">Dashboard</h1><Cards st={data?.[0]}/><Link className="btn inline-block" href="/tickets">View tickets</Link></div>
}
