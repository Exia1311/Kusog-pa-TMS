import {requireAdmin} from '@/lib/auth'
import {safe} from '@/lib/csv'
export async function GET(req:Request){
  const {s}=await requireAdmin(); const q=new URL(req.url).searchParams.get('p')||'daily'; const p=['weekly','monthly'].includes(q)?q:'daily'
  const {data}=await s.rpc('report_summary',{p})
  const csv=['period,tickets_issued',...(data||[]).map((r:any)=>[r.period,r.tickets].map(safe).join(','))].join('\r\n')
  return new Response(csv,{headers:{'Content-Type':'text/csv','Content-Disposition':`attachment; filename="report-${p}.csv"`}})
}
