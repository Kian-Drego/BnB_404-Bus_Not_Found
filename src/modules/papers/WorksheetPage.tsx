import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Clock,
  FileCheck2,
  FileDown,
  FileText,
  ListChecks,
  Star,
  Trash2,
} from 'lucide-react'
import { getSubject, questions } from '../../data'
import type { Question } from '../../types'
import { useWorksheet } from '../../store'
import { useT } from '../../i18n'
import { enumLabel, EXAM_TYPE_HI } from '../../i18n/enums'
import { Badge, Button, Card, EmptyState, PageHeader } from '../../components/ui'

/* jsPDF is heavy — the generator module is loaded on demand at export time. */
const exportQuestionPaper = async (qs: Question[]) => {
  const { generateQuestionPaper } = await import('./pdf')
  generateQuestionPaper(qs)
}
const exportAnswerKey = async (qs: Question[]) => {
  const { generateAnswerKey } = await import('./pdf')
  generateAnswerKey(qs)
}

/** 40 -> "40 min" / "40 मिनट", 80 -> "1h 20m" / "1 घं 20 मि", 120 -> "2h" / "2 घं". */
function formatMinutes(
  minutes: number,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  if (minutes < 60) return t('papers.time.minutes', { n: minutes })
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? t('papers.time.hours', { n: h }) : t('papers.time.hoursMinutes', { h, m })
}

export function WorksheetPage() {
  const { t, lang } = useT()
  const ids = useWorksheet((s) => s.ids)
  const remove = useWorksheet((s) => s.remove)
  const clear = useWorksheet((s) => s.clear)

  /* Local display/export order — the store only tracks membership. A null
     manualOrder means "follow store order"; reordering sets an explicit list. */
  const [manualOrder, setManualOrder] = useState<string[] | null>(null)

  const order = useMemo(() => {
    const base = manualOrder ?? ids
    const kept = base.filter((id) => ids.includes(id))
    const added = ids.filter((id) => !kept.includes(id))
    return [...kept, ...added]
  }, [manualOrder, ids])

  const byId = new Map(questions.map((q) => [q.id, q]))
  const ordered = order.map((id) => byId.get(id)).filter((q): q is Question => q !== undefined)

  const totalMarks = ordered.reduce((sum, q) => sum + q.marks, 0)
  const subjectCount = new Set(ordered.map((q) => q.subjectId)).size

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= order.length) return
    const next = [...order]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    setManualOrder(next)
  }

  const clearAll = () => {
    clear()
    setManualOrder(null)
  }

  if (ordered.length === 0) {
    return (
      <div>
        <PageHeader title={t('papers.workspace.title')} subtitle={t('papers.workspace.emptySubtitle')} />
        <EmptyState
          icon={FileText}
          title={t('papers.workspace.emptyTitle')}
          description={t('papers.workspace.emptyDesc')}
          action={
            <Link to="/papers">
              <Button>
                <FileText className="h-4 w-4" />
                {t('papers.browseQuestions')}
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  const stats = [
    { icon: ListChecks, label: t('papers.stats.questions'), value: String(ordered.length) },
    { icon: Star, label: t('papers.stats.totalMarks'), value: String(totalMarks) },
    { icon: Clock, label: t('papers.stats.suggestedTime'), value: formatMinutes(totalMarks * 2, t) },
    { icon: BookOpen, label: t('papers.stats.subjectsCovered'), value: String(subjectCount) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title={t('papers.workspace.title')} subtitle={t('papers.workspace.subtitle')} />

      {/* Summary strip */}
      <Card className="grid grid-cols-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3 px-5 py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <s.icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <div className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
                {s.value}
              </div>
              <div className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Ordered question list */}
      <div className="space-y-3">
        {ordered.map((q, i) => {
          const subject = getSubject(q.subjectId)
          return (
            <Card key={q.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                {t('papers.questionNumber', { n: i + 1 })}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  {q.text}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge color={subject?.color ?? 'gray'}>{subject?.code ?? 'N/A'}</Badge>
                  <Badge color="amber">{t('papers.marks', { n: q.marks })}</Badge>
                  <Badge color="gray">
                    {enumLabel(EXAM_TYPE_HI, q.examType, lang)} {q.year}
                  </Badge>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2"
                  aria-label={t('papers.moveUp')}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2"
                  aria-label={t('papers.moveDown')}
                  disabled={i === ordered.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                  aria-label={t('papers.removeQuestion')}
                  onClick={() => remove(q.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-[max(1rem,env(safe-area-inset-bottom))] z-10">
        <Card className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 shadow-lg shadow-zinc-900/5 max-sm:flex-col max-sm:items-stretch dark:shadow-black/40">
          <Button variant="danger" onClick={clearAll} className="max-sm:w-full">
            <Trash2 className="h-4 w-4" />
            {t('papers.clearAll')}
          </Button>
          <div className="flex flex-wrap gap-2 max-sm:w-full max-sm:flex-col">
            <Button variant="primary" className="max-sm:w-full" onClick={() => void exportQuestionPaper(ordered)}>
              <FileDown className="h-4 w-4" />
              {t('papers.downloadPaperPdf')}
            </Button>
            <Button variant="secondary" className="max-sm:w-full" onClick={() => void exportAnswerKey(ordered)}>
              <FileCheck2 className="h-4 w-4" />
              {t('papers.downloadKeyPdf')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
