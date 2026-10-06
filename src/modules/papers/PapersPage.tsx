import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList, Search, SearchX, X } from 'lucide-react'
import { questions, subjects } from '../../data'
import { DIFFICULTIES, EXAM_TYPES } from '../../types'
import { useWorksheet } from '../../store'
import { useT } from '../../i18n'
import { DIFFICULTY_HI, enumLabel, EXAM_TYPE_HI } from '../../i18n/enums'
import {
  Button,
  Card,
  CardBody,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
} from '../../components/ui'
import { QuestionCard } from './QuestionCard'

export function PapersPage() {
  const { t, lang } = useT()
  const [subjectId, setSubjectId] = useState('')
  const [chapterId, setChapterId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [year, setYear] = useState('')
  const [examType, setExamType] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [search, setSearch] = useState('')

  const worksheetCount = useWorksheet((s) => s.ids.length)

  const selectedSubject = subjects.find((s) => s.id === subjectId)
  const chapterOptions = selectedSubject?.chapters ?? []
  const topicOptions = chapterOptions.find((c) => c.id === chapterId)?.topics ?? []
  const years = [...new Set(questions.map((q) => q.year))].sort((a, b) => b - a)

  const term = search.trim().toLowerCase()
  const filtered = questions.filter((q) => {
    if (subjectId && q.subjectId !== subjectId) return false
    if (chapterId && q.chapterId !== chapterId) return false
    if (topicId && q.topicId !== topicId) return false
    if (year && q.year !== Number(year)) return false
    if (examType && q.examType !== examType) return false
    if (difficulty && q.difficulty !== difficulty) return false
    if (term && !`${q.text} ${q.answer}`.toLowerCase().includes(term)) return false
    return true
  })

  const hasFilters = Boolean(
    subjectId || chapterId || topicId || year || examType || difficulty || term,
  )

  const clearFilters = () => {
    setSubjectId('')
    setChapterId('')
    setTopicId('')
    setYear('')
    setExamType('')
    setDifficulty('')
    setSearch('')
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('papers.title')} subtitle={t('papers.subtitle')} />

      {worksheetCount > 0 && (
        <Card className="border-lavender-200 bg-lavender-100/60 dark:border-brand-500/25 dark:bg-brand-500/10">
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-lavender-700 dark:bg-brand-500/15 dark:text-brand-300">
                <ClipboardList className="h-4.5 w-4.5" />
              </span>
              <p className="text-sm font-semibold text-lavender-800 dark:text-brand-200">
                {t(worksheetCount === 1 ? 'papers.worksheetCountOne' : 'papers.worksheetCountMany', {
                  n: worksheetCount,
                })}
              </p>
            </div>
            <Link
              to="/worksheet"
              className="theme-fade inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
            >
              {t('papers.openWorksheet')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {t('papers.filterTitle')}
            </h2>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
                {t('papers.clearAll')}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label={t('papers.filterSubject')}>
              <Select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value)
                  setChapterId('')
                  setTopicId('')
                }}
              >
                <option value="">{t('papers.allSubjects')}</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t('papers.filterChapter')}>
              <Select
                value={chapterId}
                disabled={!subjectId}
                onChange={(e) => {
                  setChapterId(e.target.value)
                  setTopicId('')
                }}
              >
                <option value="">{t('papers.allChapters')}</option>
                {chapterOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t('papers.filterTopic')}>
              <Select
                value={topicId}
                disabled={!chapterId}
                onChange={(e) => setTopicId(e.target.value)}
              >
                <option value="">{t('papers.allTopics')}</option>
                {topicOptions.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t('papers.filterYear')}>
              <Select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">{t('papers.allYears')}</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t('papers.filterExamType')}>
              <Select value={examType} onChange={(e) => setExamType(e.target.value)}>
                <option value="">{t('papers.allExamTypes')}</option>
                {EXAM_TYPES.map((et) => (
                  <option key={et} value={et}>
                    {enumLabel(EXAM_TYPE_HI, et, lang)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t('papers.filterDifficulty')}>
              <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="">{t('papers.allDifficulties')}</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {enumLabel(DIFFICULTY_HI, d, lang)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t('papers.filterSearch')} className="sm:col-span-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  className="pl-9"
                  placeholder={t('papers.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </Field>
          </div>
        </CardBody>
      </Card>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t('papers.showingCount', { shown: filtered.length, total: questions.length })}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={t('papers.emptyTitle')}
          description={t('papers.emptyDesc')}
          action={
            hasFilters ? (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
                {t('common.clearFilters')}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  )
}
