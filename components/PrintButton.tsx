'use client'
import {recordPrint} from '@/app/actions'
export default function PrintButton({id}:{id:string}){
  return <button className="btn noprint mb-4" onClick={async()=>{await recordPrint(id);window.print()}}>Print both copies</button>}
