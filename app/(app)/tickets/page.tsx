import Link from 'next/link'
import {sb} from '@/lib/supabase/server'
import {voidTicket} from '@/app/actions'

export const dynamic = 'force-dynamic'

export default async function Tickets({searchParams}:{searchParams:{q?:string}}){
  const s=sb(); let qb=s.from('tickets').select('id,barcode_number,created_at,planter_name,driver_name,truck_plate_no').is('deleted_at',null).order('created_at',{ascending:false}).limit(25)
  const q=(searchParams.q||'').replace(/[%,()]/g,''); if(q) qb=qb.or(`barcode_number.ilike.%${q}%,planter_name.ilike.%${q}%,driver_name.ilike.%${q}%,truck_plate_no.ilike.%${q}%`)
  const {data}=await qb; const {data:{user}}=await s.auth.getUser(); const {data:me}=await s.from('profiles').select('role').eq('id',user!.id).single(); const admin=me?.role==='admin'
  return <div><h1 className="text-2xl font-semibold mb-3">Tickets</h1>
    <form className="mb-3 max-w-sm"><input name="q" defaultValue={q} placeholder="Search barcode, planter, driver, plate"/></form>
    <table className="w-full bg-white text-sm"><thead className="text-left bg-slate-100"><tr>{['Barcode','Date','Planter','Driver','Plate',''].map(h=><th key={h} className="p-2">{h}</th>)}</tr></thead>
    <tbody>{data?.map(t=><tr key={t.id} className="border-t"><td className="p-2 font-mono">{t.barcode_number}</td><td className="p-2">{new Date(t.created_at).toLocaleDateString('en-PH',{timeZone:'Asia/Manila'})}</td>
      <td className="p-2">{t.planter_name}</td><td className="p-2">{t.driver_name}</td><td className="p-2">{t.truck_plate_no}</td>
      <td className="p-2"><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
        <Link className="btn btn-secondary h-9 px-3 py-1.5 text-xs" href={`/tickets/${t.id}/print`}>Print</Link>
        {admin&&<form action={voidTicket.bind(null,t.id)} className="flex items-center gap-2"><input name="reason" required placeholder="Void reason" className="w-32 h-9 rounded-lg border-slate-300 bg-white text-xs"/><button type="submit" className="btn btn-danger h-9 px-3 py-1.5 text-xs">Void</button></form>}
      </div></td></tr>)}
    {!data?.length&&<tr><td colSpan={6} className="p-4 text-slate-500">No tickets yet. Issue the first one from Issue Ticket.</td></tr>}</tbody></table></div>
}
