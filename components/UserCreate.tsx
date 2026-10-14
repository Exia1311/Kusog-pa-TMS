'use client'
import {useEffect, useState} from 'react'
import {useFormState} from 'react-dom'
import {createUser} from '@/app/user-actions'
import ActionModal from '@/components/ActionModal'

export default function UserCreate(){
  const [st,act]=useFormState(createUser,{} as {error?:string,ok?:boolean})
  const [modal, setModal] = useState({open:false, title:'', message:'', variant:'info' as 'success'|'danger'|'info', confirmText:'Close'})

  useEffect(() => {
    if (st.error) {
      setModal({open:true, title:'Create user failed', message:st.error, variant:'danger', confirmText:'Dismiss'})
    }
    if (st.ok) {
      setModal({open:true, title:'User created', message:'A new dispatcher account was created successfully.', variant:'success', confirmText:'Close'})
    }
  }, [st])

  return <>
    <form action={act} className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 md:grid-cols-4">
        <input name="full_name" placeholder="Full name" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100" />
        <input name="email" type="email" placeholder="Email" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100" />
        <input name="password" type="password" minLength={6} placeholder="Password (6+ chars)" required autoComplete="new-password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100" />
        <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-500 hover:to-teal-400 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-200">Create dispatcher</button>
      </div>
    </form>

    <ActionModal
      open={modal.open}
      title={modal.title}
      message={modal.message}
      variant={modal.variant}
      confirmText={modal.confirmText}
      onClose={() => setModal({open:false, title:'', message:'', variant:'info', confirmText:'Close'})}
      onConfirm={undefined}
    />
  </>
}
