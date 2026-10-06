import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface FieldProps {
  label: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: ReactNode
}

/** Labelled form field wrapper with optional hint/error messaging. */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>
      ) : null}
    </div>
  )
}
