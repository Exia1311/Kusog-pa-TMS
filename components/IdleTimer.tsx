'use client'
import {useEffect,useState} from 'react'
import {logout} from '@/app/actions'
export default function IdleTimer(){
  const [warn,setWarn]=useState(false)
  useEffect(()=>{let w:any,o:any
    const reset=()=>{setWarn(false);clearTimeout(w);clearTimeout(o);w=setTimeout(()=>setWarn(true),28*60e3);o=setTimeout(()=>logout(),30*60e3)}
    reset();const ev=['click','keydown','mousemove','touchstart'];ev.forEach(e=>addEventListener(e,reset))
    return()=>{ev.forEach(e=>removeEventListener(e,reset));clearTimeout(w);clearTimeout(o)}},[])
  return warn?<div role="alert" className="noprint fixed bottom-4 right-4 bg-amber-100 border border-amber-400 p-3 rounded">You will be signed out in 2 minutes due to inactivity.</div>:null
}
