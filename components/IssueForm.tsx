'use client'
import {useState,useRef} from 'react'
import {useRouter} from 'next/navigation'
import {sbBrowser} from '@/lib/supabase/client'
import {issueTicket} from '@/app/actions'
const blank={planter_code:'',planter_name:'',hda_code:'',hda_name:'',association:''}
export default function IssueForm(){
  const r=useRouter(),form=useRef<HTMLFormElement>(null)
  const [pl,setPl]=useState(blank),[manual,setManual]=useState(false),[q,setQ]=useState(''),[hits,setHits]=useState<any[]>([])
  const [err,setErr]=useState(''),[busy,setBusy]=useState(false)
  async function search(v:string){setQ(v);if(v.length<2)return setHits([])
    const t=v.replace(/[%,()]/g,'');const {data}=await sbBrowser().from('planters').select('*').or(`planter_name.ilike.%${t}%,planter_code.ilike.%${t}%`).limit(8);setHits(data||[])}
  async function submit(e:React.FormEvent){e.preventDefault();setErr('');setBusy(true)
    const f=new FormData(form.current!),g=(k:string)=>String(f.get(k)||'')
    const res=await issueTicket({barcode_number:g('barcode_number'),is_manual_planter:manual,...pl,cane_variety:g('cane_variety'),driver_name:g('driver_name'),truck_plate_no:g('truck_plate_no'),fc_bc:g('fc_bc'),bucket_board_no:g('bucket_board_no')})
    setBusy(false); if(res.error||!res.id) return setErr(res.error||'Could not issue ticket'); r.push(`/tickets/${res.id}/print`)}
  const F=(k:keyof typeof blank,l:string)=><label className="block text-sm font-medium text-slate-700">{l}<input value={pl[k]} readOnly={!manual} onChange={e=>setPl({...pl,[k]:e.target.value})} className={!manual?'bg-slate-100':''}/></label>
  return <form ref={form} onSubmit={submit} className="mx-auto max-w-4xl space-y-5">
    <div className="card p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Operations</p>
          <h1 className="section-title mt-2">Issue Ticket</h1>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">Ready to issue</span>
      </div>

      <div className="space-y-5">
        <label className="block text-sm font-medium text-slate-700">Barcode number (type or scan)
          <input name="barcode_number" required autoFocus autoComplete="off" className="mt-2 uppercase font-mono text-lg tracking-[0.2em]"
            onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();document.getElementById('planter-q')?.focus()}}}/></label>

        <fieldset className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
          <legend className="px-1 text-sm font-semibold text-slate-700">Planter details</legend>
          <div className="mt-3 space-y-4">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700"><input type="checkbox" className="h-4 w-4" checked={manual} onChange={e=>{setManual(e.target.checked);setPl(blank)}}/>Enter manually (unregistered planter)</label>
            {!manual&&<div className="relative"><input id="planter-q" value={q} onChange={e=>search(e.target.value)} placeholder="Search planter name or code" className="bg-white"/>
              {hits.length>0&&<ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">{hits.map(h=><li key={h.id}><button type="button" className="w-full px-3 py-2 text-left hover:bg-slate-50"
                onClick={()=>{setPl({planter_code:h.planter_code,planter_name:h.planter_name,hda_code:h.hda_code,hda_name:h.hda_name,association:h.association});setQ(h.planter_name);setHits([])}}>{h.planter_name} <span className="text-slate-500">{h.planter_code}</span></button></li>)}</ul>}</div>}
            <div className="grid gap-3 sm:grid-cols-2">{F('planter_code','Planter code')}{F('planter_name','Planter name')}{F('hda_code','HDA code')}{F('hda_name','HDA name')}{F('association','Association')}</div>
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          {[['cane_variety','Cane variety'],['driver_name','Driver name'],['truck_plate_no','Truck plate no'],['fc_bc','FC/BC'],['bucket_board_no','Bucket/Board no']].map(([n,l])=><label key={n} className="block text-sm font-medium text-slate-700">{l}<input name={n} className="mt-2"/></label>)}</div>

        {err&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}

        <button className="btn w-full sm:w-auto" disabled={busy}>{busy?'Issuing...':'Save & issue ticket'}</button>
      </div>
    </div>
  </form>
}
