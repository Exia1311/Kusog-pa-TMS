import Link from 'next/link'
import {redirect} from 'next/navigation'
import {sb} from '@/lib/supabase/server'
import IdleTimer from '@/components/IdleTimer'
import {logout, logoutAll} from '@/app/actions'

export const dynamic = 'force-dynamic'

export default async function AppLayout({children}:{children:React.ReactNode}){
  const s=sb(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect('/login')
  const {data:p}=await s.from('profiles').select('full_name,role,is_active').eq('id',user.id).single()
  if(!p?.is_active){await s.auth.signOut();redirect('/login')}

  const menuItems=[
    {href:'/dashboard',label:'Dashboard',icon:'dashboard'},
    {href:'/tickets/new',label:'Issue Ticket',icon:'issue'},
    {href:'/tickets',label:'Tickets',icon:'tickets'},
    {href:'/planters',label:'Planters',icon:'planters'},
  ]

  const adminItems=[
    {href:'/reports',label:'Reports',icon:'reports'},
    {href:'/users',label:'Users',icon:'users'},
  ]

  const renderIcon=(name:string)=>{
    const common='h-4 w-4 text-current'
    switch(name){
      case 'dashboard': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}><path d="M4 13.5h7V20H4zm9-11h7v8h-7zm0 10h7v7h-7zm-9-8h7v6H4z"/></svg>
      case 'issue': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
      case 'tickets': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}><path d="M7 4h10a2 2 0 0 1 2 2v12l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2z"/><path d="M9 9h6M9 12h6" strokeLinecap="round"/></svg>
      case 'planters': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}><path d="M5 18V7.5A1.5 1.5 0 0 1 6.5 6h11A1.5 1.5 0 0 1 19 7.5V18"/><path d="M8 6V4h8v2M9 11h6M9 14h6" strokeLinecap="round"/></svg>
      case 'reports': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}><path d="M6 18V8m6 10V5m6 13v-7" strokeLinecap="round"/></svg>
      case 'users': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}><path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm10 8v-1a4 4 0 0 0-3-3.87M18 3.13V3m0 0a3 3 0 1 1 0 6"/></svg>
      case 'alerts': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}><path d="M12 4a6 6 0 0 1 6 6v4l2 3H4l2-3V10a6 6 0 0 1 6-6zm0 16a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2z"/></svg>
      case 'overview': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}><path d="M6 18h12M8 15V9m4 6V5m4 10v-4" strokeLinecap="round"/></svg>
      default: return <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-zinc-700"/>
    }
  }

  return <div className="flex min-h-screen bg-slate-100 text-slate-900">
    <IdleTimer/>
    <aside className="noprint flex w-72 shrink-0 flex-col bg-zinc-900 px-4 py-4 text-zinc-200 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
      <header className="mb-5 flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-800/60 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white shadow-[0_0_18px_rgba(16,185,129,0.55)]">{p.full_name.split(' ').map((n:string)=>n[0]).slice(0,2).join('').toUpperCase()}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">{p.full_name}</div>
          <div className="truncate text-[10px] uppercase tracking-[0.18em] text-zinc-400">{p.role}</div>
        </div>
        <Link href="/tickets/new" className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-xl font-semibold text-white shadow-[0_0_18px_rgba(16,185,129,0.5)] transition hover:scale-[1.03]">+</Link>
      </header>

      <nav className="space-y-3">
        <div className="px-2">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Menu</div>
          <div className="space-y-1.5">
            {menuItems.map(({href,label,icon},idx)=><Link key={href} href={href} className={`sidebar-link ${idx===0 ? 'active' : ''}`}>
              <span className="flex h-6 w-6 items-center justify-center">{renderIcon(icon)}</span>
              <span className="flex-1 text-left">{label}</span>
            </Link>)}
          </div>
        </div>

        {p.role === 'admin' && <div className="px-2 pt-2">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Admin</div>
          <div className="space-y-1.5">{adminItems.map(({href,label,icon})=><Link key={href} href={href} className="sidebar-link">
            <span className="flex h-6 w-6 items-center justify-center">{renderIcon(icon)}</span>
            <span className="flex-1 text-left">{label}</span>
          </Link>)}</div>
        </div>}
      </nav>

      <div className="mt-auto space-y-3 pt-4">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-800/80 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white shadow-[0_0_16px_rgba(16,185,129,0.45)]">H</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">KUSUG-PA Trip Ticket Management System</div>
            <div className="text-[10px] tracking-[0.14em] text-zinc-400">v. 1.0</div>
          </div>
          <button type="button" className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-700/80 text-lg text-zinc-300 transition hover:bg-zinc-600">...</button>
        </div>

        <form action={logout} className="w-full">
          <button type="submit" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-700">Sign out</button>
        </form>
        <form action={logoutAll} className="w-full">
          <button type="submit" className="w-full rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20">Sign out all devices</button>
        </form>
      </div>
    </aside>
    <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
  </div>
}
