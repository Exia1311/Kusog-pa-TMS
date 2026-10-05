export default function Cards({st}:{st:any}){
  const c=[['Issued today',st?.today??0],['Issued this month',st?.month??0],['All tickets',st?.total??0]]
  return <div className="mb-6 grid gap-4 sm:grid-cols-3">
    {c.map(([l,v])=><div key={l} className="card p-5">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{l}</div>
      <div className="mt-3 text-3xl font-bold text-slate-900">{v}</div>
    </div>)}
  </div>
}
