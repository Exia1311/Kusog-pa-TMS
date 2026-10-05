'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {planterSchema} from '@/lib/planter'
import {savePlanter,deletePlanter,importPlanters} from '@/app/planter-actions'
const K=['planter_code','planter_name','hda_code','hda_name','association'] as const
const L:Record<string,string>={planter_code:'Planter code',planter_name:'Planter name',hda_code:'HDA code',hda_name:'HDA name',association:'Association'}

function parseCsvLine(line:string){
  const cells:string[]=[]; let cur='',q=false
  for(let i=0;i<line.length;i++){const ch=line[i]
    if(ch==='"'){if(q&&line[i+1]==='"'){cur+='"';i++}else q=!q}else if(ch===','&&!q){cells.push(cur);cur=''}else cur+=ch}
  cells.push(cur); return cells.map(c=>c.trim())
}
function parseCsv(text:string){
  const rows=text.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').split('\n').filter(r=>r.trim()!=='')
  if(!rows.length) return []
  const h=parseCsvLine(rows[0]).map(x=>x.toLowerCase())
  return rows.slice(1).map(r=>{const v=parseCsvLine(r),o:any={};h.forEach((k,i)=>{o[k]=v[i]??''});return o})
}

export default function PlanterTable({rows,canEdit}:{rows:any[],canEdit:boolean}){
  const r=useRouter(); const [f,setF]=useState<any>({}),[err,setErr]=useState(''),[prev,setPrev]=useState<any[]|null>(null),[msg,setMsg]=useState('')
  async function save(e:React.FormEvent){e.preventDefault();setErr('');const x=await savePlanter(f);if(x.error)return setErr(x.error);setF({});r.refresh()}
  async function pick(file:File){
    setMsg('');setPrev(null); const name=file.name.toLowerCase()
    if(file.size>5*1024*1024) return setMsg('File is too large (max 5 MB).')
    try{
      if(!name.endsWith('.csv')) return setMsg('Unsupported file. Upload a .csv file.')
      const data=parseCsv(await file.text())
      const seen=new Set<string>()
      setPrev(data.map((row,i)=>{const p=planterSchema.safeParse(row);let e=p.success?'':p.error.issues[0].message
        if(p.success){if(seen.has(p.data.planter_code))e='Duplicate planter_code in file';seen.add(p.data.planter_code)}return {n:i+2,row,e}}))
    }catch{setMsg('Could not read this file. Check that it is a valid .csv file.')}
  }
  async function imp(){const x=await importPlanters(prev!.filter(p=>!p.e).map(p=>p.row));if(x.error)return setMsg(x.error);setMsg(`Imported ${x.count} planters`);setPrev(null);r.refresh()}
  const bad=prev?.filter(p=>p.e).length||0
  return <div className="space-y-4">
    {canEdit&&<>
      <form onSubmit={save} className="bg-white border rounded p-4 grid sm:grid-cols-3 gap-3">
        {K.map(k=><label key={k} className="text-sm">{L[k]}<input value={f[k]||''} onChange={e=>setF({...f,[k]:e.target.value})}/></label>)}
        <div className="flex items-end gap-2"><button className="btn">{f.id?'Save changes':'Add planter'}</button>{f.id&&<button type="button" className="underline" onClick={()=>setF({})}>Cancel</button>}</div>
        {err&&<p role="alert" className="text-red-700 text-sm sm:col-span-3">{err}</p>}</form>
      <div className="bg-white border rounded p-4 text-sm"><div className="font-medium mb-1">Bulk upload (CSV)</div>
        <p className="text-slate-600 mb-1">Use a .csv file. The first row must contain these headers: {K.join(', ')}. Existing planter codes are updated.</p>
        <a className="underline block mb-2" download="planters-template.csv" href={`data:text/csv;charset=utf-8,${K.join(',')}%0A`}>Download CSV template</a>
        <input type="file" accept=".csv" onChange={e=>{const x=e.target.files?.[0];if(x)pick(x);e.target.value=''}}/>
        {prev&&<div className="mt-3"><p>{prev.length-bad} valid, {bad} with errors. Rows with errors are skipped.</p>
          <div className="max-h-56 overflow-auto"><table className="w-full"><tbody>{prev.filter(p=>p.e).map(p=><tr key={p.n} className="text-red-700"><td className="pr-3">Row {p.n}</td><td>{p.e}</td></tr>)}</tbody></table></div>
          <button className="btn mt-2" disabled={prev.length===bad} onClick={imp}>Import {prev.length-bad} valid rows</button></div>}
        {msg&&<p className="mt-2">{msg}</p>}</div></>}
    <table className="w-full bg-white text-sm"><thead className="text-left bg-slate-100"><tr>{K.map(k=><th key={k} className="p-2">{L[k]}</th>)}{canEdit&&<th/>}</tr></thead>
      <tbody>{rows.map(p=><tr key={p.id} className="border-t">{K.map(k=><td key={k} className="p-2">{p[k]}</td>)}
        {canEdit&&<td className="p-2 whitespace-nowrap"><button className="underline mr-3" onClick={()=>setF(p)}>Edit</button>
          <button className="underline text-red-700" onClick={async()=>{if(confirm(`Delete ${p.planter_name}?`)){await deletePlanter(p.id);r.refresh()}}}>Delete</button></td>}</tr>)}
        {!rows.length&&<tr><td colSpan={6} className="p-4 text-slate-500">No planters found.</td></tr>}</tbody></table></div>
}
