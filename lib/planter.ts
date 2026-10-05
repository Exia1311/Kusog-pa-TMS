import {z} from 'zod'
const t=(m:string)=>z.string().trim().min(1,m).max(100)
const optionalText=(m?:string)=>z.string().trim().max(100).optional().transform(v => (v ?? '').trim()).refine(v => !m || v.length >= 0, {message: m ?? 'Invalid value'})
export const planterSchema=z.object({planter_code:t('planter_code required'),planter_name:t('planter_name required'),hda_code:z.string().trim().max(100).optional().transform(v => (v ?? '').trim()),hda_name:t('hda_name required'),association:t('association required')})
