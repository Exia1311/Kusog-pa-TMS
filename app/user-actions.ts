'use server'
import {revalidatePath} from 'next/cache'
import {createClient} from '@supabase/supabase-js'
import {requireAdmin} from '@/lib/auth'
const adm=()=>createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}})
const log=(a:any,uid:string,action:string,id:string,detail?:any)=>a.from('audit_logs').insert({user_id:uid,action,entity:'user',entity_id:id,detail})
export async function createUser(_:any,f:FormData):Promise<{error?:string,ok?:boolean}>{
  const {user}=await requireAdmin(); const a=adm()
  const email=String(f.get('email')||'').trim(),pw=String(f.get('password')||''),name=String(f.get('full_name')||'').trim()
  if(!name||!email||pw.length<6) return {error:'Name, email and a password of at least 6 characters are required'}
  const {data,error}=await a.auth.admin.createUser({email,password:pw,email_confirm:true,user_metadata:{full_name:name}})
  if(error) return {error:error.message}
  await log(a,user.id,'user_created',data.user.id,{email}); revalidatePath('/users'); return {ok:true}}
export async function setRole(id:string,f:FormData){
  const {user}=await requireAdmin(); if(id===user.id) return
  const role=f.get('role')==='admin'?'admin':'dispatcher'; const a=adm()
  await a.from('profiles').update({role}).eq('id',id); await log(a,user.id,'role_changed',id,{role}); revalidatePath('/users')}
export async function setActive(id:string,active:boolean){
  const {user}=await requireAdmin(); if(id===user.id) return; const a=adm()
  await a.from('profiles').update({is_active:active}).eq('id',id)
  await a.auth.admin.updateUserById(id,{ban_duration:active?'none':'876000h'})
  await log(a,user.id,active?'user_reactivated':'user_deactivated',id); revalidatePath('/users')}
