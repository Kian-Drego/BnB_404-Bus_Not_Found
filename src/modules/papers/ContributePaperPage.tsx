import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PackagePlus,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { subjects } from '../../data'
import { EXAM_TYPES } from '../../types'
import type { ExamType } from '../../types'
import { useQuestions } from '../../store'
import { uid } from '../../lib/utils'
import { useT } from '../../i18n'
import { enumLabel, EXAM_TYPE_HI } from '../../i18n/enums'
import { AttachmentInput } from '../../components/Attachments'
import type { AttachmentMeta } from '../../types'
import {
  Button,
  Card,
  CardBody,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
} from '../../components/ui'

interface QuestionDraft {
  tempId: string
  text: string
  marks: string
  answer: string
}

interface BundleDraft {
  tempId: string
  title: string
  questions: QuestionDraft[]
}

const DEFAULT_YEAR = String(new Date().getFullYear())

const newQuestion = (): QuestionDraft => ({
  tempId: uid(),
  text: '',
  marks: '',
  answer: '',
})

const newBundle = (): BundleDraft => ({
  tempId: uid(),
  title: '',
  questions: [newQuestion()],
})

export function ContributePaperPage() {
  const { t, lang } = useT()
  const addQuestions = useQuestions((s) => s.addQuestions)
  const addUpload = useQuestions((s) => s.addUpload)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [chapterId, setChapterId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [year, setYear] = useState(DEFAULT_YEAR)
  const [examType, setExamType] = useState('')
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([])
  const [topicsInPdf, setTopicsInPdf] = useState('')
  const [bundles, setBundles] = useState<BundleDraft[]>([newBundle()])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const chapters = subjects.find((s) => s.id === subjectId)?.chapters ?? []
  const topics = chapters.find((c) => c.id === chapterId)?.topics ?? []
  const hasPdf = attachments.some((a) => a.mime === 'application/pdf')

  function clearError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  /* ---------- bundle builder mutations ---------- */

  function updateBundle(
    tempId: string,
    patch: Partial<BundleDraft>,
    alsoClear?: string,
  ) {
    setBundles((prev) =>
      prev.map((b) => (b.tempId === tempId ? { ...b, ...patch } : b)),
    )
    if (alsoClear) clearError(alsoClear)
  }

  function updateQuestion(
    bundleTempId: string,
    questionTempId: string,
    patch: Partial<QuestionDraft>,
    alsoClear?: string,
  ) {
    setBundles((prev) =>
      prev.map((b) =>
        b.tempId === bundleTempId
          ? {
              ...b,
              questions: b.questions.map((q) =>
                q.tempId === questionTempId ? { ...q, ...patch } : q,
              ),
            }
          : b,
      ),
    )
    if (alsoClear) clearError(alsoClear)
  }

  function addQuestionToBundle(bundleTempId: string) {
    setBundles((prev) =>
      prev.map((b) =>
        b.tempId === bundleTempId
          ? { ...b, questions: [...b.questions, newQuestion()] }
          : b,
      ),
    )
  }

  function removeQuestion(bundleTempId: string, questionTempId: string) {
    setBundles((prev) =>
      prev.map((b) =>
        b.tempId === bundleTempId && b.questions.length > 1
          ? {
              ...b,
              questions: b.questions.filter((q) => q.tempId !== questionTempId),
            }
          : b,
      ),
    )
  }

  function addBundle() {
    setBundles((prev) => [...prev, newBundle()])
  }

  function removeBundle(tempId: string) {
    setBundles((prev) =>
      prev.length > 1 ? prev.filter((b) => b.tempId !== tempId) : prev,
    )
  }

  /* ---------- submit ---------- */

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}

    if (!subjectId) next.subjectId = t('papers.error.subject')
    if (!chapterId) next.chapterId = t('papers.error.chapter')
    if (!topicId) next.topicId = t('papers.error.topic')

    const yearNum = Number(year)
    if (!Number.isInteger(yearNum) || yearNum < 2000 || yearNum > 2100) {
      next.year = t('papers.error.year')
    }
    if (!examType) next.examType = t('papers.error.examType')

    let parsedTopics: string[] = []
    if (hasPdf) {
      parsedTopics = [
        ...new Set(
          topicsInPdf
            .split(/[,\n]/)
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      ]
      if (parsedTopics.length === 0) {
        next.topicsInPdf = t('papers.topicsInPdf.required')
      }
    }

    bundles.forEach((b) => {
      if (!b.title.trim()) next[`bundle-${b.tempId}`] = t('papers.bundle.titleRequired')
      b.questions.forEach((q) => {
        if (!q.text.trim()) next[`question-${q.tempId}`] = t('papers.question.textRequired')
        if (!Number.isInteger(Number(q.marks)) || Number(q.marks) < 1) {
          next[`marks-${q.tempId}`] = t('papers.question.marksRequired')
        }
      })
    })

    setErrors(next)
    if (Object.keys(next).length > 0) return

    const author = name.trim() || 'Anonymous'
    const created = addQuestions(
      bundles.flatMap((b) =>
        b.questions.map((q) => ({
          subjectId,
          chapterId,
          topicId,
          year: yearNum,
          examType: examType as ExamType,
          marks: Number(q.marks),
          difficulty: 'Medium' as const,
          text: q.text.trim(),
          answer: q.answer.trim(),
          contributedBy: author,
          verified: false,
          attachments,
          bundleId: b.tempId,
          bundleTitle: b.title.trim(),
        })),
      ),
    )

    if (hasPdf) {
      const pdf = attachments.find((a) => a.mime === 'application/pdf')
      const offsets: number[] = []
      let running = 0
      for (const b of bundles) {
        offsets.push(running)
        running += b.questions.length
      }
      if (pdf) {
        addUpload({
          subjectId,
          chapterId,
          topicId,
          year: yearNum,
          examType: examType as ExamType,
          topicsInPdf: parsedTopics,
          bundles: bundles.map((b, i) => ({
            id: b.tempId,
            title: b.title.trim(),
            questionIds: created
              .slice(offsets[i], offsets[i] + b.questions.length)
              .map((q) => q.id),
          })),
          attachment: pdf,
          contributedBy: author,
        })
      }
    }

    navigate('/papers')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t('papers.contribute.title')} subtitle={t('papers.contribute.subtitle')} />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Identity */}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('papers.contribute.name')} hint={t('papers.contribute.nameHint')}>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Anonymous"
                />
              </Field>
              <Field label={t('papers.filterYear')}>
                <Input
                  type="number"
                  min={2000}
                  max={2100}
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value)
                    clearError('year')
                  }}
                />
              </Field>
            </div>

            {/* Taxonomy */}
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label={t('papers.filterSubject')} required error={errors.subjectId}>
                <Select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value)
                    setChapterId('')
                    setTopicId('')
                    if (e.target.value) {
                      clearError('subjectId')
                      clearError('chapterId')
                      clearError('topicId')
                    }
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
              <Field label={t('papers.filterChapter')} required error={errors.chapterId}>
                <Select
                  value={chapterId}
                  disabled={!subjectId}
                  onChange={(e) => {
                    setChapterId(e.target.value)
                    setTopicId('')
                    if (e.target.value) {
                      clearError('chapterId')
                      clearError('topicId')
                    }
                  }}
                >
                  <option value="">{t('papers.allChapters')}</option>
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t('papers.filterTopic')} required error={errors.topicId}>
                <Select
                  value={topicId}
                  disabled={!chapterId}
                  onChange={(e) => {
                    setTopicId(e.target.value)
                    if (e.target.value) clearError('topicId')
                  }}
                >
                  <option value="">{t('papers.allTopics')}</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label={t('papers.filterExamType')} required error={errors.examType}>
              <Select
                value={examType}
                onChange={(e) => {
                  setExamType(e.target.value)
                  clearError('examType')
                }}
              >
                <option value="">{t('papers.allExamTypes')}</option>
                {EXAM_TYPES.map((et) => (
                  <option key={et} value={et}>
                    {enumLabel(EXAM_TYPE_HI, et, lang)}
                  </option>
                ))}
              </Select>
            </Field>

            {/* Attachments */}
            <Field label={t('papers.fieldAttachments')} hint={t('papers.attachmentsHint')}>
              <AttachmentInput attachments={attachments} onChange={setAttachments} />
            </Field>

            {/* PDF rule: topics within the PDF */}
            {hasPdf && (
              <div className="theme-fade rounded-xl border border-softblue-200 bg-softblue-100/60 px-4 py-3 dark:border-sky-500/25 dark:bg-sky-500/10">
                <p className="text-sm font-medium text-softblue-800 dark:text-sky-200">
                  {t('papers.topicsInPdf.info')}
                </p>
              </div>
            )}
            {hasPdf && (
              <Field
                label={t('papers.topicsInPdf.label')}
                required
                error={errors.topicsInPdf}
                hint={t('papers.topicsInPdf.hint')}
              >
                <Input
                  value={topicsInPdf}
                  onChange={(e) => {
                    setTopicsInPdf(e.target.value)
                    if (e.target.value.trim()) clearError('topicsInPdf')
                  }}
                  placeholder="e.g. Limits, Derivatives, Integration"
                />
              </Field>
            )}

            {/* Question bundles */}
            <div>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  {t('papers.bundles.title')}
                </h3>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {t('papers.bundles.hint')}
                </span>
              </div>

              <div className="space-y-4">
                {bundles.map((b, bi) => (
                  <Card key={b.tempId} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-xs font-bold tracking-wide text-brand-600 uppercase dark:text-brand-300">
                        {t('papers.bundleN', { n: bi + 1 })}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                        onClick={() => removeBundle(b.tempId)}
                        disabled={bundles.length <= 1}
                        aria-label={t('papers.removeBundle')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <Field
                      label={t('papers.bundle.title')}
                      required
                      error={errors[`bundle-${b.tempId}`]}
                      className="mt-3"
                    >
                      <Input
                        value={b.title}
                        onChange={(e) =>
                          updateBundle(b.tempId, { title: e.target.value }, `bundle-${b.tempId}`)
                        }
                        placeholder={t('papers.bundle.titlePlaceholder')}
                      />
                    </Field>

                    <div className="mt-4 space-y-3">
                      {b.questions.map((q) => (
                        <div key={q.tempId} className="space-y-2">
                          <Field
                            label={t('papers.question.text')}
                            required
                            error={errors[`question-${q.tempId}`]}
                          >
                            <Textarea
                              rows={3}
                              value={q.text}
                              onChange={(e) =>
                                updateQuestion(
                                  b.tempId,
                                  q.tempId,
                                  { text: e.target.value },
                                  `question-${q.tempId}`,
                                )
                              }
                              placeholder={t('papers.question.text')}
                            />
                          </Field>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[8rem_1fr_auto]">
                            <Field
                              label={t('papers.question.marks')}
                              required
                              error={errors[`marks-${q.tempId}`]}
                            >
                              <Input
                                type="number"
                                min={1}
                                value={q.marks}
                                onChange={(e) =>
                                  updateQuestion(
                                    b.tempId,
                                    q.tempId,
                                    { marks: e.target.value },
                                    `marks-${q.tempId}`,
                                  )
                                }
                              />
                            </Field>
                            <Field
                              label={t('papers.question.answer')}
                              hint={t('papers.question.answerHint')}
                            >
                              <Textarea
                                rows={2}
                                value={q.answer}
                                onChange={(e) =>
                                  updateQuestion(b.tempId, q.tempId, {
                                    answer: e.target.value,
                                  })
                                }
                                placeholder={t('papers.question.answerHint')}
                              />
                            </Field>
                            <div className="flex items-end justify-start sm:justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                                onClick={() => removeQuestion(b.tempId, q.tempId)}
                                disabled={b.questions.length <= 1}
                                aria-label={t('papers.removeQuestion')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      onClick={() => addQuestionToBundle(b.tempId)}
                    >
                      <Plus className="h-4 w-4" />
                      {t('papers.addQuestion')}
                    </Button>
                  </Card>
                ))}
              </div>

              <Button
                type="button"
                variant="secondary"
                className="mt-4"
                onClick={addBundle}
              >
                <PackagePlus className="h-4 w-4" />
                {t('papers.addBundle')}
              </Button>
            </div>

            {/* Submit */}
            <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4" />
                {t('notes.publish')}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
