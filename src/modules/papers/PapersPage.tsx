import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  ClipboardList,
  Package,
  Plus,
  Search,
  SearchX,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { subjects, taxonomyOf } from '../../data'
import { DIFFICULTIES, EXAM_TYPES } from '../../types'
import { mergeQuestions, useQuestions, useWorksheet } from '../../store'
import { formatDate } from '../../lib/utils'
import { useT } from '../../i18n'
import { DIFFICULTY_HI, enumLabel, EXAM_TYPE_HI } from '../../i18n/enums'
import { AttachmentChips } from '../../components/Attachments'
import {
  Badge,
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const worksheetCount = useWorksheet((s) => s.ids.length)
  const worksheetToggle = useWorksheet((s) => s.toggle)
  const worksheetIds = useWorksheet((s) => s.ids)
  const uploadedQs = useQuestions((s) => s.uploaded)
  const uploads = useQuestions((s) => s.uploads)
  const removeUpload = useQuestions((s) => s.removeUpload)

  const allQuestions = useMemo(() => mergeQuestions(uploadedQs), [uploadedQs])
  const questionById = useMemo(
    () => new Map(allQuestions.map((q) => [q.id, q])),
    [allQuestions],
  )

  const selectedSubject = subjects.find((s) => s.id === subjectId)
  const chapterOptions = selectedSubject?.chapters ?? []
  const topicOptions = chapterOptions.find((c) => c.id === chapterId)?.topics ?? []
  const years = [...new Set(allQuestions.map((q) => q.year))].sort((a, b) => b - a)

  const term = search.trim().toLowerCase()
  const filtered = allQuestions.filter((q) => {
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
      <PageHeader
        title={t('papers.title')}
        subtitle={t('papers.subtitle')}
        actions={
          <Link to="/papers/contribute">
            <Button>
              <Upload className="h-4 w-4" />
              {t('papers.contribute.button')}
            </Button>
          </Link>
        }
      />

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

      {uploads.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {t('papers.uploads.title')}
          </h2>
          {uploads.map((u) => {
            const tax = taxonomyOf(u)
            return (
              <Card key={u.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <AttachmentChips attachments={[u.attachment]} />
                    <h3 className="mt-2 text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      {tax.subject?.name ?? t('papers.unknownSubject')} ·{' '}
                      {tax.chapter?.name}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge color="gray">
                        {enumLabel(EXAM_TYPE_HI, u.examType, lang)} {u.year}
                      </Badge>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {t('papers.contributedBy', { name: u.contributedBy })} ·{' '}
                        {formatDate(u.createdAt)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                    aria-label={t('papers.uploads.confirmRemove').replace('?', '')}
                    onClick={() => {
                      if (window.confirm(t('papers.uploads.confirmRemove')))
                        removeUpload(u.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                    {t('papers.uploads.topicsInPdf')}:
                  </span>
                  {u.topicsInPdf.map((topic) => (
                    <Badge key={topic} color="lavender">
                      {topic}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  {u.bundles.map((b) => {
                    const bundleQuestions = b.questionIds
                      .map((id) => questionById.get(id))
                      .filter((q): q is NonNullable<typeof q> => Boolean(q))
                    const countKey =
                      bundleQuestions.length === 1
                        ? 'papers.uploads.questionCountOne'
                        : 'papers.uploads.questionCountMany'
                    const open = Boolean(expanded[`${u.id}:${b.id}`])
                    return (
                      <div
                        key={b.id}
                        className="theme-fade rounded-xl border border-zinc-200 dark:border-zinc-700"
                      >
                        <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                          <Package className="h-4 w-4 shrink-0 text-brand-500" />
                          <span className="min-w-0 flex-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                            {b.title}
                          </span>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            {t(countKey, { n: bundleQuestions.length })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-2"
                            onClick={() =>
                              setExpanded((prev) => ({
                                ...prev,
                                [`${u.id}:${b.id}`]: !open,
                              }))
                            }
                            aria-expanded={open}
                          >
                            {open ? t('papers.uploads.collapse') : t('papers.uploads.expand')}
                          </Button>
                        </div>
                        {open && (
                          <ul className="space-y-1.5 border-t border-zinc-100 px-3 py-2 dark:border-zinc-800">
                            {bundleQuestions.map((q, i) => (
                              <li
                                key={q.id}
                                className="flex items-center gap-3 text-sm"
                              >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-[11px] font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                                  {i + 1}
                                </span>
                                <span className="min-w-0 flex-1 truncate text-zinc-700 dark:text-zinc-200">
                                  {q.text}
                                </span>
                                <Badge color="amber">
                                  {t('papers.marks', { n: q.marks })}
                                </Badge>
                                <Button
                                  variant={
                                    worksheetIds.includes(q.id) ? 'secondary' : 'primary'
                                  }
                                  size="sm"
                                  className="px-2"
                                  onClick={() => worksheetToggle(q.id)}
                                  aria-pressed={worksheetIds.includes(q.id)}
                                >
                                  {worksheetIds.includes(q.id) ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Plus className="h-4 w-4" />
                                  )}
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </section>
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
        {t('papers.showingCount', {
          shown: filtered.length,
          total: allQuestions.length,
        })}
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
