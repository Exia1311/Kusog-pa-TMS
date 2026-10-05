'use client'
import {useFormState} from 'react-dom'
import {login} from '../actions'

export default function Login(){
  const [st,act]=useFormState(login,null as any)
  return <main className="min-h-screen bg-slate-100 px-4 py-10">
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] lg:grid-cols-[1.15fr_0.85fr]">
      <div className="relative hidden bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.2),transparent_35%)]" />
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-teal-50">Operations Portal</div>
          <h1 className="text-4xl font-bold leading-tight">Hacienda Trip Ticket System</h1>
          <p className="mt-4 max-w-md text-sm text-teal-50/90">Track planter activity, issue transport tickets, and keep field operations streamlined from one reliable workspace.</p>
        </div>
        <div className="relative z-10 grid gap-3 text-sm text-teal-50/90">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-3 backdrop-blur-sm">Fast issuing workflow</div>
          <div className="rounded-2xl border border-white/20 bg-white/5 p-3 backdrop-blur-sm">Clear reporting and audit trail</div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <form action={act} className="w-full max-w-md space-y-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">Welcome back</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Sign in</h2>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Email address
              <input name="email" type="email" placeholder="name@company.com" required autoComplete="username" className="mt-2" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input name="password" type="password" placeholder="Enter your password" required autoComplete="current-password" className="mt-2" />
            </label>
          </div>

          {st?.error&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{st.error}</p>}

          <button className="btn w-full">Sign in</button>
        </form>
      </div>
    </div>
  </main>
}
