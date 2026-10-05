'use server'
import {revalidatePath} from 'next/cache'
import {requireAdmin} from '@/lib/auth'
import {planterSchema} from '@/lib/planter'
export async function savePlanter(input:any):Promise<{error?:string}>{
  const {s}=await requireAdmin(); const p=planterSchema.safeParse(input); if(!p.success) return {error:p.error.issues[0].message}
  const {error}=await (input.id?s.from('planters').update(p.data).eq('id',input.id):s.from('planters').insert(p.data))
  if(error) return {error:error.code==='23505'?'Planter code already exists':'Could not save planter'}
  revalidatePath('/planters'); return {}}
export async function deletePlanter(id:string){const {s}=await requireAdmin();await s.from('planters').delete().eq('id',id);await s.rpc('log_audit',{p_action:'planter_deleted',p_entity:'planter',p_entity_id:id});revalidatePath('/planters')}
export async function importPlanters(rows:any[]):Promise<{error?:string,count?:number}>{
  const {s}=await requireAdmin(); const ok=rows.map(r=>planterSchema.safeParse(r)).flatMap(r=>r.success?[r.data]:[])
  if(!ok.length) return {error:'No valid rows'}
  const {error}=await s.from('planters').upsert(ok,{onConflict:'planter_code'}); if(error) return {error:'Import failed'}
  await s.rpc('log_audit',{p_action:'planters_imported',p_entity:'planter',p_entity_id:'bulk',p_detail:{count:ok.length}})
  revalidatePath('/planters'); return {count:ok.length}}
