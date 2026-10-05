'use client'
import {useEffect,useRef,useState} from 'react'
import {useRouter} from 'next/navigation'
import {sbBrowser} from '@/lib/supabase/client'
export default function Mfa(){
  const r=useRouter(),s=sbBrowser(),once=useRef(false)
  const [fid,setFid]=useState(''),[qr,setQr]=useState(''),[secret,setSecret]=useState(''),[code,setCode]=useState(''),[err,setErr]=useState('')
  useEffect(()=>{if(once.current)return;once.current=true;(async()=>{
    const {data}=await s.auth.mfa.listFactors(); const v=data?.totp?.[0]; if(v){setFid(v.id);return}
    for(const u of (data?.all||[]).filter(x=>x.factor_type==='totp'&&x.status==='unverified')) await s.auth.mfa.unenroll({factorId:u.id})
    const e=await s.auth.mfa.enroll({factorType:'totp'}); if(e.data){setFid(e.data.id);setQr(e.data.totp.qr_code);setSecret(e.data.totp.secret)}else setErr('Could not start MFA setup')})()},[])
  async function go(e:React.FormEvent){e.preventDefault();setErr('')
    const c=await s.auth.mfa.challenge({factorId:fid}); if(c.error) return setErr('Could not verify. Try again.')
    const v=await s.auth.mfa.verify({factorId:fid,challengeId:c.data.id,code:code.trim()}); if(v.error) return setErr('Invalid code')
    r.push('/dashboard'); r.refresh()}
  return <main className="min-h-screen grid place-items-center p-4"><form onSubmit={go} className="w-full max-w-sm bg-white p-6 rounded shadow space-y-3">
    <h1 className="text-xl font-semibold">{qr?'Set up two-step verification':'Enter your authenticator code'}</h1>
    {qr&&<><p className="text-sm">Scan this QR code with an authenticator app, then enter the 6-digit code.</p><img src={qr} alt="MFA QR code" className="mx-auto w-44"/><p className="text-xs break-all">Manual key: {secret}</p></>}
    <input inputMode="numeric" maxLength={6} value={code} onChange={e=>setCode(e.target.value)} placeholder="6-digit code" required autoFocus/>
    {err&&<p role="alert" className="text-red-700 text-sm">{err}</p>}<button className="btn w-full" disabled={!fid}>Verify</button></form></main>
}
