'use client'

type ModalVariant = 'success' | 'danger' | 'info'

type ActionModalProps = {
  open: boolean
  title: string
  message: string
  variant?: ModalVariant
  confirmText?: string
  cancelText?: string
  onClose: () => void
  onConfirm?: () => void | Promise<void>
}

export default function ActionModal({
  open,
  title,
  message,
  variant = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onClose,
  onConfirm,
}: ActionModalProps) {
  if (!open) return null

  const palette = {
    success: {
      wrapper: 'border-emerald-200 bg-emerald-50',
      icon: 'bg-emerald-500',
      title: 'text-emerald-900',
      action: 'bg-emerald-600 hover:bg-emerald-500',
    },
    danger: {
      wrapper: 'border-red-200 bg-red-50',
      icon: 'bg-red-500',
      title: 'text-red-900',
      action: 'bg-red-600 hover:bg-red-500',
    },
    info: {
      wrapper: 'border-slate-200 bg-white',
      icon: 'bg-slate-800',
      title: 'text-slate-900',
      action: 'bg-slate-900 hover:bg-slate-700',
    },
  }[variant]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
      <div className={`w-full max-w-md rounded-2xl border ${palette.wrapper} p-5 shadow-2xl`}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-full ${palette.icon} text-lg font-bold text-white`}>
            {variant === 'success' ? '✓' : variant === 'danger' ? '!' : 'i'}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${palette.title}`}>{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{message}</p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          {onConfirm ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => onConfirm?.()}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold text-white transition ${palette.action}`}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold text-white transition ${palette.action}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
