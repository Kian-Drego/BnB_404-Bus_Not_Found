import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export type BadgeColor = 'lavender' | 'mint' | 'blue' | 'peach' | 'gray' | 'rose' | 'amber'

const colors: Record<BadgeColor, string> = {
  lavender:
    'bg-lavender-100 text-lavender-800 dark:bg-brand-500/15 dark:text-brand-200',
  mint: 'bg-mint-100 text-mint-800 dark:bg-emerald-500/15 dark:text-emerald-200',
  blue: 'bg-softblue-100 text-softblue-800 dark:bg-sky-500/15 dark:text-sky-200',
  peach: 'bg-peach-100 text-peach-800 dark:bg-orange-500/15 dark:text-orange-200',
  gray: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700/40 dark:text-zinc-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor
}

export function Badge({ color = 'gray', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'theme-fade inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        colors[color],
        className,
      )}
      {...props}
    />
  )
}
