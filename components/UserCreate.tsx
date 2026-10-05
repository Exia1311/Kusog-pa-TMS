'use client'
import {useFormState} from 'react-dom'
import {createUser} from '@/app/user-actions'
export default function UserCreate(){
  const [st,act]=useFormState(createUser,{} as {error?:string,ok?:boolean})
  return <form action={act} className="bg-white border rounded p-4 grid sm:grid-cols-4 gap-3 mb-4">
    <input name="full_name" placeholder="Full name" required/><input name="email" type="email" placeholder="Email" required/>
    <input name="password" type="password" minLength={6} placeholder="Password (6+ chars)" required autoComplete="new-password"/><button className="btn">Create dispatcher</button>
    {st.error&&<p role="alert" className="text-red-700 text-sm sm:col-span-4">{st.error}</p>}{st.ok&&<p className="text-green-800 text-sm sm:col-span-4">User created. Promote to admin below if needed.</p>}</form>
}
