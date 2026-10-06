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

export function runAtsChecks(r: ResumeData): AtsCheck[] {
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
      label: 'Contact details',
      passed: Boolean(r.fullName.trim()) && r.email.includes('@') && Boolean(r.phone.trim()),
      hint: 'Add your full name, a valid email and a phone number.',
    },
    {
      id: 'summary',
      label: 'Professional summary',
      passed: summary.length >= 40 && summary.length <= 500,
      hint: 'Write 40–500 characters covering your degree, experience and goals.',
    },
    {
      id: 'education',
      label: 'Education entry',
      passed: r.education.some((e) => e.school.trim() && e.degree.trim()),
      hint: 'Add at least one education entry with school and degree filled in.',
    },
    {
      id: 'action-verbs',
      label: 'Action verbs',
      passed: verbRatio >= 0.6,
      hint: 'Start at least 60% of bullets with a verb like "developed", "led" or "optimised".',
    },
    {
      id: 'quantified',
      label: 'Quantified impact',
      passed: bullets.some((b) => /[\d%]/.test(b)),
      hint: 'Add a number or percentage to a bullet, e.g. "Reduced load time by 35%".',
    },
    {
      id: 'skills',
      label: 'Skills list',
      passed: skillList(r.skills).length >= 5,
      hint: 'List at least 5 comma-separated skills relevant to your target role.',
    },
    {
      id: 'pronouns',
      label: 'No first-person pronouns',
      passed: !pronounRe.test(prose),
      hint: 'Remove "I", "me", "my", "we" and "our" — write in implied first person.',
    },
    {
      id: 'length',
      label: 'Resume length',
      passed: wordCount >= 100 && wordCount <= 900,
      hint:
        wordCount < 100
          ? 'Too thin — aim for 100–900 words so parsers have content to index.'
          : 'Too long — trim to under 900 words (about one page).',
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
