import type { ResumeData } from '../../types'
import { ATS_ACTION_VERBS, ATS_KEYWORDS_BY_ROLE, ATS_ROLES } from '../../data'
import { skillList } from './useResume'

export interface AtsCheck {
  id: string
  label: string
  passed: boolean
  hint: string
}

export interface KeywordReport {
  role: string
  found: string[]
  missing: string[]
  density: number
}

/* Check thresholds — one source of truth so pass logic and hint text never drift. */
const SUMMARY_MIN = 40
const SUMMARY_MAX = 500
const VERB_RATIO_MIN = 0.6
const SKILLS_MIN = 5
const WORDS_MIN = 100
const WORDS_MAX = 900

/** Split a bullet textarea into individual non-empty lines. */
export function bulletLines(bullets: string): string[] {
  return bullets
    .split('\n')
    .map((b) => b.trim())
    .filter(Boolean)
}

/** Every scrap of resume text, lowercased — the corpus ATS parsers scan. */
export function resumePlainText(r: ResumeData): string {
  const parts: string[] = [
    r.fullName,
    r.email,
    r.phone,
    r.location,
    r.links,
    r.summary,
    r.skills,
    r.targetRole,
  ]
  for (const e of r.education) {
    parts.push(e.school, e.degree, e.field, e.startYear, e.endYear, e.gpa)
  }
  for (const e of r.experience) {
    parts.push(e.company, e.role, e.startDate, e.endDate, e.bullets)
  }
  for (const p of r.projects) {
    parts.push(p.name, p.tech, p.description)
  }
  return parts.filter(Boolean).join(' ').toLowerCase()
}

/** All non-empty experience bullets across every entry. */
function allBullets(r: ResumeData): string[] {
  return r.experience.flatMap((e) => bulletLines(e.bullets))
}

/** First word of a bullet, letters only, lowercased. */
function firstWord(line: string): string {
  const word = line.split(/\s+/)[0] ?? ''
  return word.toLowerCase().replace(/[^a-z]/g, '')
}

export function runAtsChecks(
  r: ResumeData,
  t: (key: string, vars?: Record<string, string | number>) => string,
): AtsCheck[] {
  const bullets = allBullets(r)
  const verbHits = bullets.filter((b) => ATS_ACTION_VERBS.includes(firstWord(b))).length
  const verbRatio = bullets.length === 0 ? 1 : verbHits / bullets.length
  const summary = r.summary.trim()
  const prose = `${r.summary}\n${r.experience.map((e) => e.bullets).join('\n')}`
  const pronounRe = /\b(i|me|my|we|our)\b/i
  const wordCount = resumePlainText(r).split(/\s+/).filter(Boolean).length

  return [
    {
      id: 'contact',
      label: t('resume.check.contact.label'),
      passed: Boolean(r.fullName.trim()) && r.email.includes('@') && Boolean(r.phone.trim()),
      hint: t('resume.check.contact.hint'),
    },
    {
      id: 'summary',
      label: t('resume.check.summary.label'),
      passed: summary.length >= SUMMARY_MIN && summary.length <= SUMMARY_MAX,
      hint: t('resume.check.summary.hint', { min: SUMMARY_MIN, max: SUMMARY_MAX }),
    },
    {
      id: 'education',
      label: t('resume.check.education.label'),
      passed: r.education.some((e) => e.school.trim() && e.degree.trim()),
      hint: t('resume.check.education.hint'),
    },
    {
      id: 'action-verbs',
      label: t('resume.check.actionVerbs.label'),
      passed: verbRatio >= VERB_RATIO_MIN,
      hint: t('resume.check.actionVerbs.hint', { pct: Math.round(VERB_RATIO_MIN * 100) }),
    },
    {
      id: 'quantified',
      label: t('resume.check.quantified.label'),
      passed: bullets.some((b) => /[\d%]/.test(b)),
      hint: t('resume.check.quantified.hint'),
    },
    {
      id: 'skills',
      label: t('resume.check.skills.label'),
      passed: skillList(r.skills).length >= SKILLS_MIN,
      hint: t('resume.check.skills.hint', { n: SKILLS_MIN }),
    },
    {
      id: 'pronouns',
      label: t('resume.check.pronouns.label'),
      passed: !pronounRe.test(prose),
      hint: t('resume.check.pronouns.hint'),
    },
    {
      id: 'length',
      label: t('resume.check.length.label'),
      passed: wordCount >= WORDS_MIN && wordCount <= WORDS_MAX,
      hint:
        wordCount < WORDS_MIN
          ? t('resume.check.length.hintShort', { min: WORDS_MIN, max: WORDS_MAX })
          : t('resume.check.length.hintLong', { max: WORDS_MAX }),
    },
  ]
}

/** Percentage of checks passed, rounded to a whole number. */
export function atsScore(checks: AtsCheck[]): number {
  if (checks.length === 0) return 0
  return Math.round((checks.filter((c) => c.passed).length / checks.length) * 100)
}

/** Match the resume against the keyword bank of its target role. */
export function keywordReport(r: ResumeData): KeywordReport {
  const role = r.targetRole in ATS_KEYWORDS_BY_ROLE ? r.targetRole : ATS_ROLES[0]
  const keywords = ATS_KEYWORDS_BY_ROLE[role] ?? []
  const text = resumePlainText(r)
  const found = keywords.filter((k) => text.includes(k.toLowerCase()))
  const missing = keywords.filter((k) => !text.includes(k.toLowerCase()))
  const density = keywords.length === 0 ? 0 : Math.round((found.length / keywords.length) * 100)
  return { role, found, missing, density }
}
