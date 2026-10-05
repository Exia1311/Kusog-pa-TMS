'use client'
import Barcode from 'react-barcode'
export default function Copy({t,title,reprint}:{t:any,title:string,reprint:number}){
  const row=(l:string,v:any)=><div className="flex border-b py-1"><span className="w-40 text-slate-600">{l}</span><span className="font-medium">{v||''}</span></div>
  return <section className="copy border-2 border-black p-4 mb-6 bg-white relative">
    <div className="flex justify-between"><div><h2 className="text-lg font-bold">{t.form_title}</h2><div className="text-sm">{title}</div></div>
      <div className="text-xs text-right">Form No: {t.form_no}<br/>Effectivity: {t.effectivity_date}<br/>Revision: {t.revision_no}{reprint>0&&<div className="font-bold text-sm mt-1">REPRINT #{reprint}</div>}</div></div>
    <div className="mt-2 text-sm">{row('Date issued',new Date(t.created_at).toLocaleString('en-PH',{timeZone:'Asia/Manila'}))}{row('Planter',`${t.planter_name} (${t.planter_code})`)}{row('HDA',`${t.hda_name} (${t.hda_code})`)}
      {row('Association',t.association)}{row('Cane variety',t.cane_variety)}{row('Driver',t.driver_name)}{row('Truck plate no',t.truck_plate_no)}{row('FC/BC',t.fc_bc)}{row('Bucket/Board no',t.bucket_board_no)}</div>
    <div className="flex justify-center my-2"><Barcode value={t.barcode_number} format="CODE128" height={50} fontSize={14}/></div>
    <div className="flex justify-between mt-8 text-xs"><div className="w-5/12 border-t border-black pt-1 text-center">Planter's Signature</div><div className="w-5/12 border-t border-black pt-1 text-center">Driver's Signature</div></div>
    {t.deleted_at&&<div className="absolute inset-0 grid place-items-center text-7xl font-bold text-red-600/30 rotate-[-20deg]">VOID</div>}
  </section>
}
