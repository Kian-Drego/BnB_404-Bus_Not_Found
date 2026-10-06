import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList, Search, SearchX, X } from 'lucide-react'
import { questions, subjects } from '../../data'
import { DIFFICULTIES, EXAM_TYPES } from '../../types'
import { useWorksheet } from '../../store'
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
      <PageHeader
        title="Past Papers & Question Repository"
        subtitle="Search and filter real exam questions by subject, chapter, topic, year and exam term — then add the best ones to your worksheet to build a custom practice paper."
      />

      {worksheetCount > 0 && (
        <Card className="border-lavender-200 bg-lavender-100/60 dark:border-brand-500/25 dark:bg-brand-500/10">
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-lavender-700 dark:bg-brand-500/15 dark:text-brand-300">
                <ClipboardList className="h-4.5 w-4.5" />
              </span>
              <p className="text-sm font-semibold text-lavender-800 dark:text-brand-200">
                {worksheetCount} question{worksheetCount === 1 ? '' : 's'} in your worksheet
              </p>
            </div>
            <Link
              to="/worksheet"
              className="theme-fade inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
            >
              Open worksheet
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              Filter the question bank
            </h2>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Clear all
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Subject">
              <Select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value)
                  setChapterId('')
                  setTopicId('')
                }}
              >
                <option value="">All subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Chapter">
              <Select
                value={chapterId}
                disabled={!subjectId}
                onChange={(e) => {
                  setChapterId(e.target.value)
                  setTopicId('')
                }}
              >
                <option value="">All chapters</option>
                {chapterOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Topic">
              <Select
                value={topicId}
                disabled={!chapterId}
                onChange={(e) => setTopicId(e.target.value)}
              >
                <option value="">All topics</option>
                {topicOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Year">
              <Select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">All years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Exam Type">
              <Select value={examType} onChange={(e) => setExamType(e.target.value)}>
                <option value="">All exam types</option>
                {EXAM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Difficulty">
              <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="">All difficulties</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Search" className="sm:col-span-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  className="pl-9"
                  placeholder="Search question text or solutions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </Field>
          </div>
        </CardBody>
      </Card>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Showing{' '}
        <span className="font-semibold text-zinc-800 dark:text-zinc-100">{filtered.length}</span> of{' '}
        {questions.length} questions
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No questions match your filters"
          description="Try broadening the search term or clearing one or more filters."
          action={
            hasFilters ? (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Clear all filters
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
