import {notFound} from 'next/navigation'
import {sb} from '@/lib/supabase/server'
import Copy from '@/components/Copy'
import PrintButton from '@/components/PrintButton'

export const dynamic = 'force-dynamic'

export default async function Print({params}:{params:{id:string}}){
  const s=sb(); const {data:t}=await s.from('tickets').select('*').eq('id',params.id).single(); if(!t) notFound()
  const {count}=await s.from('ticket_prints').select('*',{count:'exact',head:true}).eq('ticket_id',t.id)
  const n=count||0
  return <div className="max-w-3xl">{!t.deleted_at&&<PrintButton id={t.id}/>}
    <Copy t={t} title="PLANTER'S COPY" reprint={n}/><Copy t={t} title="MILL'S COPY" reprint={n}/></div>
}
