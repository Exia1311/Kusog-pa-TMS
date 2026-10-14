'use client'

import {useState} from 'react'
import ActionModal from '@/components/ActionModal'
import {deleteUser, setActive, setRole} from '@/app/user-actions'

type UserRow = {
  id: string
  full_name: string
  role: string
  is_active: boolean
}

type UserTableProps = {
  users: UserRow[]
  emails: Record<string, string | undefined>
  currentUserId: string
}

export default function UserTable({users, emails, currentUserId}: UserTableProps) {
  const [modal, setModal] = useState<{
    open: boolean
    title: string
    message: string
    variant?: 'success' | 'danger' | 'info'
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void | Promise<void>
  }>({open: false, title: '', message: ''})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftRole, setDraftRole] = useState('dispatcher')

  const closeModal = () => setModal({open: false, title: '', message: ''})

  const openSuccess = (title: string, message: string) => {
    setModal({open: true, title, message, variant: 'success', confirmText: 'Close'})
  }

  const openDanger = (title: string, message: string, onConfirm: () => void | Promise<void>) => {
    setModal({
      open: true,
      title,
      message,
      variant: 'danger',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm,
    })
  }

  const handleEdit = (user: UserRow) => {
    setEditingId(user.id)
    setDraftRole(user.role)
    setModal({
      open: true,
      title: 'Edit user role',
      message: `Update the role for ${user.full_name}.`,
      variant: 'info',
      confirmText: 'Save changes',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const fd = new FormData()
        fd.append('role', draftRole)
        await setRole(user.id, fd)
        openSuccess('User updated', `${user.full_name} is now a ${draftRole}.`)
        setEditingId(null)
      },
    })
  }

  const handleDelete = (user: UserRow) => {
    openDanger(
      'Delete user?',
      `This will remove ${user.full_name} from the system. This action cannot be undone.`,
      async () => {
        await deleteUser(user.id)
        openSuccess('User deleted', `${user.full_name} was removed successfully.`)
      },
    )
  }

  const handleActivateToggle = async (user: UserRow) => {
    const next = !user.is_active
    const title = next ? 'Reactivate user?' : 'Deactivate user?'
    const message = next
      ? `Are you sure you want to reactivate ${user.full_name}?`
      : `Are you sure you want to deactivate ${user.full_name}?`

    openDanger(title, message, async () => {
      await setActive(user.id, next)
      openSuccess(
        next ? 'User reactivated' : 'User deactivated',
        `${user.full_name} was ${next ? 'reactivated' : 'deactivated'} successfully.`,
      )
    })
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-700">
            <tr>
              {['Name', 'Email', 'Role', 'Active', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isCurrent = user.id === currentUserId
              return (
                <tr key={user.id} className="border-t border-slate-200 transition hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{user.full_name}</td>
                  <td className="px-4 py-3 text-slate-700">{emails[user.id] || '—'}</td>

                  <td className="px-4 py-3">
                    {isCurrent ? (
                      <span className="inline-flex rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">{user.role}</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select
                          value={editingId === user.id ? draftRole : user.role}
                          onChange={(e) => {
                            setDraftRole(e.target.value)
                            setEditingId(user.id)
                          }}
                          className="w-32 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        >
                          <option value="dispatcher">dispatcher</option>
                          <option value="admin">admin</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleEdit(user)}
                          className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          Set
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {user.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {!isCurrent && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(user)}
                          className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-200"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100 hover:text-red-700"
                        >
                          Delete
                        </button>

                        <button
                          type="button"
                          onClick={() => handleActivateToggle(user)}
                          className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${user.is_active ? 'border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100 hover:text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800'}`}
                        >
                          {user.is_active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ActionModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant || 'info'}
        confirmText={modal.confirmText || 'Close'}
        cancelText={modal.cancelText || 'Cancel'}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
      />
    </>
  )
}
