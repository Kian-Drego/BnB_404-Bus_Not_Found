import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { commonDict } from './ui/common'
import { layoutDict } from './ui/layout'
import { homeDict } from './ui/home'
import { papersDict } from './ui/papers'
import { notesDict } from './ui/notes'
import { resumeDict } from './ui/resume'
import { scholarshipsDict } from './ui/scholarships'

/* ------------------------------------------------------------------ */
/*  Language state (persisted)                                         */
/* ------------------------------------------------------------------ */

export type Language = 'en' | 'hi'

export const LANGUAGES: Array<{ code: Language; nativeLabel: string }> = [
  { code: 'en', nativeLabel: 'English' },
  { code: 'hi', nativeLabel: 'हिंदी' },
]

interface LanguageState {
  lang: Language
  setLang: (lang: Language) => void
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'eduvault-language' },
  ),
)

/* ------------------------------------------------------------------ */
/*  Translation table (module dictionaries merged at startup)          */
/* ------------------------------------------------------------------ */

export interface Dict {
  en: Record<string, string>
  hi: Record<string, string>
}

const TABLE: Record<Language, Record<string, string>> = { en: {}, hi: {} }
for (const d of [commonDict, layoutDict, homeDict, papersDict, notesDict, resumeDict, scholarshipsDict]) {
  Object.assign(TABLE.en, d.en)
  Object.assign(TABLE.hi, d.hi)
}

/** Translate a key, falling back to English, then to the key itself.
 *  Supports {var} interpolation: translate('hi', 'x', { n: 3 }). */
export function translate(lang: Language, key: string, vars?: Record<string, string | number>): string {
  let s = TABLE[lang][key] ?? TABLE.en[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
  }
  return s
}

/** Hook: subscribe to the active language and get a bound translator. */
export function useT() {
  const lang = useLanguage((s) => s.lang)
  return {
    lang,
    t: (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
  }
}
