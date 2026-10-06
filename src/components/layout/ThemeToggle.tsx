import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../store'
import { useT } from '../../i18n'

export function ThemeToggle() {
  const { dark, toggle } = useTheme()
  const { t } = useT()
  const label = dark ? t('theme.toLight') : t('theme.toDark')
  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      className="theme-fade flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:text-brand-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-brand-300"
    >
      <span className="relative block h-4.5 w-4.5">
        <Sun
          className={`absolute inset-0 h-4.5 w-4.5 transition-all duration-300 ${
            dark ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
          }`}
        />
        <Moon
          className={`absolute inset-0 h-4.5 w-4.5 transition-all duration-300 ${
            dark ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-100'
          }`}
        />
      </span>
    </button>
  )
}
