import Link from 'next/link'
import {requireAdmin} from '@/lib/auth'
import Cards from '@/components/Cards'
import PrintBtn from '@/components/PrintBtn'

export const dynamic = 'force-dynamic'

const T:Record<string,[string,string]>={daily:['Daily','Date'],weekly:['Weekly','Week starting (Mon)'],monthly:['Monthly','Month']}
export default async function Reports({searchParams}:{searchParams:{p?:string}}){
  const {s}=await requireAdmin(); const p=['weekly','monthly'].includes(searchParams.p||'')?searchParams.p!:'daily'
  const [a,b]=await Promise.all([s.rpc('dashboard_stats'),s.rpc('report_summary',{p})])
  const rows=(b.data||[]) as any[]; const sum=rows.reduce((n,r)=>n+Number(r.tickets),0)
  return <div><h1 className="text-2xl font-semibold mb-3">{T[p][0]} report</h1><Cards st={a.data?.[0]}/>
    {(a.error||b.error)&&<p role="alert" className="mb-3 bg-red-50 border border-red-300 text-red-700 rounded p-2 text-sm">Reports are not ready. Run supabase/patch_remove_weight.sql in the Supabase SQL editor.</p>}
    <div className="flex gap-4 items-center mb-3 noprint">{Object.keys(T).map(x=><Link key={x} href={`/reports?p=${x}`} className={x===p?'font-semibold underline':''}>{T[x][0]}</Link>)}
      <a className="btn ml-auto" href={`/reports/export?p=${p}`}>Export CSV</a><PrintBtn/></div>
    <table className="w-full bg-white text-sm"><thead className="text-left bg-slate-100"><tr><th className="p-2">{T[p][1]}</th><th className="p-2">Tickets issued</th></tr></thead>
      <tbody>{rows.map(r=><tr key={r.period} className="border-t"><td className="p-2">{r.period}</td><td className="p-2">{r.tickets}</td></tr>)}
      {!rows.length&&<tr><td colSpan={2} className="p-4 text-slate-500">No tickets issued yet.</td></tr>}</tbody>
      {rows.length>0&&<tfoot><tr className="border-t font-semibold"><td className="p-2">Total shown</td><td className="p-2">{sum}</td></tr></tfoot>}</table></div>
}
