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

/** 40 -> "40 min", 80 -> "1h 20m", 120 -> "2h". */
function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function WorksheetPage() {
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
        <PageHeader
          title="Custom Paper Workspace"
          subtitle="Compile questions from the repository into a printable practice paper with a matching answer key."
        />
        <EmptyState
          icon={FileText}
          title="Your worksheet is empty"
          description="Browse the past-paper repository and add questions to build a printable practice paper with a matching answer key."
          action={
            <Link to="/papers">
              <Button>
                <FileText className="h-4 w-4" />
                Browse questions
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  const stats = [
    { icon: ListChecks, label: 'Questions', value: String(ordered.length) },
    { icon: Star, label: 'Total marks', value: String(totalMarks) },
    { icon: Clock, label: 'Suggested time', value: formatMinutes(totalMarks * 2) },
    { icon: BookOpen, label: 'Subjects covered', value: String(subjectCount) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Custom Paper Workspace"
        subtitle="Reorder your picks, then export a printable practice paper and its answer key as PDFs."
      />

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
            <Card key={q.id} className="flex items-center gap-4 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                Q{i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  {q.text}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge color={subject?.color ?? 'gray'}>{subject?.code ?? 'N/A'}</Badge>
                  <Badge color="amber">{q.marks} marks</Badge>
                  <Badge color="gray">
                    {q.examType} {q.year}
                  </Badge>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2"
                  aria-label="Move question up"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2"
                  aria-label="Move question down"
                  disabled={i === ordered.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                  aria-label="Remove question"
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
      <div className="sticky bottom-4 z-10">
        <Card className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 shadow-lg shadow-zinc-900/5 dark:shadow-black/40">
          <Button variant="danger" onClick={clearAll}>
            <Trash2 className="h-4 w-4" />
            Clear all
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => void exportQuestionPaper(ordered)}>
              <FileDown className="h-4 w-4" />
              Download Question Paper PDF
            </Button>
            <Button variant="secondary" onClick={() => void exportAnswerKey(ordered)}>
              <FileCheck2 className="h-4 w-4" />
              Download Answer Key PDF
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
