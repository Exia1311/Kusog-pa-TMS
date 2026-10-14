'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import ActionModal from '@/components/ActionModal'
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
  const [modal, setModal] = useState<{open:boolean; title:string; message:string; variant?: 'success'|'danger'|'info'; confirmText?: string; cancelText?: string; onConfirm?: () => void | Promise<void>}>({open:false, title:'', message:''})

  const closeModal = () => setModal({open:false, title:'', message:''})

  async function save(e:React.FormEvent){
    e.preventDefault(); setErr('')
    const x=await savePlanter(f)
    if(x.error){
      setModal({open:true, title:'Save failed', message:x.error, variant:'danger', confirmText:'Dismiss'})
      return
    }
    setF({})
    r.refresh()
    setModal({open:true, title:'Planter saved', message:`${f.planter_name || 'Planter'} was saved successfully.`, variant:'success', confirmText:'Close'})
  }

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

  async function imp(){
    const x=await importPlanters(prev!.filter(p=>!p.e).map(p=>p.row));
    if(x.error){
      setModal({open:true, title:'Import failed', message:x.error, variant:'danger', confirmText:'Dismiss'})
      return
    }
    setMsg(`Imported ${x.count} planters`)
    setPrev(null)
    r.refresh()
    setModal({open:true, title:'CSV imported', message:`${x.count} planter records were imported successfully.`, variant:'success', confirmText:'Close'})
  }

  const bad=prev?.filter(p=>p.e).length||0
  return <div className="space-y-5">
    {canEdit&&<>
      <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {K.map(k => (
            <label key={k} className="text-sm font-medium text-slate-700">
              <span className="mb-1.5 block">{L[k]}</span>
              <input
                value={f[k] || ''}
                onChange={e => setF({...f, [k]: e.target.value})}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </label>
          ))}
          <div className="flex items-end gap-2 md:col-span-1 xl:col-span-1">
            <button type="submit" className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-500 hover:to-teal-400 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-200">
              {f.id ? 'Save changes' : 'Add planter'}
            </button>
            {f.id && (
              <button type="button" onClick={() => setF({})} className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-200">
                Cancel
              </button>
            )}
          </div>
        </div>
        {err && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Bulk upload (CSV)</h3>
            <p className="mt-1 text-sm text-slate-600">Use a .csv file. The first row must contain: {K.join(', ')}. Existing planter codes are updated.</p>
          </div>
          <a className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100" download="planters-template.csv" href={`data:text/csv;charset=utf-8,${K.join(',')}%0A`}>
            Download CSV template
          </a>
        </div>

        <label className="group block cursor-pointer">
          <span className="sr-only">Upload CSV</span>
          <input
            type="file"
            accept=".csv"
            onChange={e => {const x=e.target.files?.[0]; if(x) pick(x); e.target.value=''}}
            className="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:shadow-sm file:transition hover:file:bg-emerald-500 file:cursor-pointer"
          />
        </label>

        {prev && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-700">{prev.length - bad} valid, {bad} with errors. Rows with errors are skipped.</p>
            <div className="max-h-52 overflow-auto rounded-xl border border-slate-200 bg-slate-50">
              <table className="w-full text-sm">
                <tbody>
                  {prev.filter(p => p.e).map(p => (
                    <tr key={p.n} className="border-t border-slate-200 text-red-700">
                      <td className="px-3 py-2 font-medium">Row {p.n}</td>
                      <td className="px-3 py-2">{p.e}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300" disabled={prev.length === bad} onClick={imp}>
              Import {prev.length - bad} valid rows
            </button>
          </div>
        )}

        {msg && <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{msg}</p>}
      </div>
    </>}

    {modal.open && (
      <ActionModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant || 'info'}
        confirmText={modal.confirmText || 'Close'}
        cancelText={modal.cancelText || 'Cancel'}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
      />
    )}

    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-left text-slate-700">
          <tr>
            {K.map(k => <th key={k} className="px-4 py-3 font-semibold">{L[k]}</th>)}
            {canEdit && <th className="px-4 py-3 font-semibold text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(p => (
            <tr key={p.id} className="border-t border-slate-200 transition hover:bg-slate-50">
              {K.map(k => <td key={k} className="px-4 py-3 text-slate-700">{p[k]}</td>)}
              {canEdit && (
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setF(p)} className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                      Edit
                    </button>
                    <button type="button" onClick={() => {
                      setModal({
                        open: true,
                        title: 'Delete planter?',
                        message: `Are you sure you want to delete ${p.planter_name}? This action cannot be undone.`,
                        variant: 'danger',
                        confirmText: 'Delete',
                        cancelText: 'Cancel',
                        onConfirm: async () => {
                          await deletePlanter(p.id)
                          r.refresh()
                          setModal({open: true, title:'Planter deleted', message:`${p.planter_name} was deleted successfully.`, variant:'success', confirmText:'Close'})
                        },
                      })
                    }} className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100 hover:text-red-700">
                      Delete
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No planters found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
}
