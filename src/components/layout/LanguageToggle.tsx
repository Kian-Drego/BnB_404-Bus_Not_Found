import { Languages } from 'lucide-react'
import { LANGUAGES, useLanguage, useT } from '../../i18n'
import { cn } from '../../lib/utils'

/** Side-by-side English | हिंदी switcher — both options always visible. */
export function LanguageToggle() {
  const lang = useLanguage((s) => s.lang)
  const setLang = useLanguage((s) => s.setLang)
  const { t } = useT()

  return (
    <div
      role="group"
      aria-label={t('lang.label')}
      title={t('lang.label')}
      className="theme-fade flex h-9 items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
    >
      <Languages className="ml-1 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={cn(
            'theme-fade h-6.5 rounded-lg px-2 text-xs font-bold',
            lang === l.code
              ? 'bg-brand-600 text-white dark:bg-brand-500 dark:text-brand-950'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
          )}
        >
          {l.nativeLabel}
        </button>
      ))}
    </div>
  )
}
