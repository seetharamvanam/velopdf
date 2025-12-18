import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import Toast from './Toast'
import './Toast.css'

type ToastItem = { id: string; message: string }

const ToastContext = createContext<{
  addToast: (msg: string) => void
  announce: (msg: string) => void
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [announcement, setAnnouncement] = useState<string | null>(null)

  const addToast = useCallback((message: string) => {
    const id = String(Math.random()).slice(2, 9)
    setToasts((s) => [...s, { id, message }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((s) => s.filter((t) => t.id !== id))
  }, [])

  const announce = useCallback((msg: string) => {
    setAnnouncement(msg)
    setTimeout(() => setAnnouncement(null), 3000)
  }, [])

  const value = useMemo(() => ({ addToast, announce }), [addToast, announce])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <Toast key={t.id} id={t.id} message={t.message} onClose={() => removeToast(t.id)} />
        ))}
      </div>
      <div className="sr-only" aria-live="polite">{announcement || ''}</div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return { addToast: ctx.addToast }
}

export function useAnnounce() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useAnnounce must be used within ToastProvider')
  return { announce: ctx.announce }
}
