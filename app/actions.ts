'use server'
import {redirect} from 'next/navigation'
import {revalidatePath} from 'next/cache'
import {requireAdmin} from '@/lib/auth'
import {sb} from '@/lib/supabase/server'
import {ticketSchema} from '@/lib/barcode'

export async function login(_:any,f:FormData){
  const {error}=await sb().auth.signInWithPassword({email:String(f.get('email')),password:String(f.get('password'))})
  if(error) return {error:'Invalid email or password'}
  redirect('/tickets/new')
}
export async function logout(){await sb().auth.signOut();redirect('/login')}

export async function issueTicket(input:unknown):Promise<{id?:string,error?:string}>{
  const p=ticketSchema.safeParse(input)
  if(!p.success) return {error:p.error.issues[0].message}
  const s=sb(); const {data:{user}}=await s.auth.getUser(); if(!user) return {error:'Not signed in'}
  const {data,error}=await s.from('tickets').insert({...p.data,issued_by:user.id}).select('id').single()
  if(error) return {error:error.code==='23505'?'Error: Barcode already issued.':'Could not issue ticket'}
  await s.rpc('log_audit',{p_action:'ticket_issued',p_entity:'ticket',p_entity_id:data.id,p_detail:{barcode:p.data.barcode_number}})
  return {id:data.id as string}
}
export async function recordPrint(id:string){
  const s=sb(); const {data:{user}}=await s.auth.getUser(); if(!user) return
  await s.from('ticket_prints').insert({ticket_id:id,printed_by:user.id})
  await s.rpc('log_audit',{p_action:'ticket_printed',p_entity:'ticket',p_entity_id:id})
}
export async function logoutAll(){await sb().auth.signOut({scope:'global'});redirect('/login')}
export async function voidTicket(id:string,f:FormData){
  const {s}=await requireAdmin(); const r=String(f.get('reason')||'').trim(); if(!r) return
  await s.from('tickets').update({deleted_at:new Date().toISOString(),deleted_reason:r}).eq('id',id)
  await s.rpc('log_audit',{p_action:'ticket_voided',p_entity:'ticket',p_entity_id:id,p_detail:{reason:r}}); revalidatePath('/tickets')
}
