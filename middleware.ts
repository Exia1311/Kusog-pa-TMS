import {createServerClient} from '@supabase/ssr'
import {NextResponse,type NextRequest} from 'next/server'
export async function middleware(req:NextRequest){
  let res=NextResponse.next({request:req})
  const s=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>req.cookies.getAll(),
    setAll:l=>{l.forEach(({name,value})=>req.cookies.set(name,value));res=NextResponse.next({request:req});l.forEach(({name,value,options})=>res.cookies.set(name,value,options))}}})
  const {data:{user}}=await s.auth.getUser()
  const last=Number(req.cookies.get('last_activity')?.value||0)
  if(user&&last&&Date.now()-last>30*60*1000){await s.auth.signOut();const r=NextResponse.redirect(new URL('/login',req.url));res.cookies.getAll().forEach(c=>r.cookies.set(c));r.cookies.delete('last_activity');return r}
  if(user) res.cookies.set('last_activity',String(Date.now()),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/'})
  if(!user&&req.nextUrl.pathname!=='/login') return NextResponse.redirect(new URL('/login',req.url))
  return res
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']}
