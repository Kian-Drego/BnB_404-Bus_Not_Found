import { useState } from 'react'
import { Check, ChevronDown, ChevronUp, Plus, ShieldCheck } from 'lucide-react'
import type { Difficulty, Question } from '../../types'
import { taxonomyOf } from '../../data'
import { useWorksheet } from '../../store'
import { Badge, Button, Card } from '../../components/ui'
import type { BadgeColor } from '../../components/ui'

const difficultyColors: Record<Difficulty, BadgeColor> = {
  Easy: 'mint',
  Medium: 'amber',
  Hard: 'rose',
}

export function QuestionCard({ question }: { question: Question }) {
  const [showSolution, setShowSolution] = useState(false)
  const ids = useWorksheet((s) => s.ids)
  const toggleWorksheet = useWorksheet((s) => s.toggle)
  const added = ids.includes(question.id)
  const { subject, chapter, topic } = taxonomyOf(question)

  return (
    <Card className="p-5">
      <p className="text-sm leading-relaxed font-medium text-zinc-800 dark:text-zinc-100">
        {question.text}
      </p>

      {(chapter || topic) && (
        <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          {[chapter?.name, topic?.name].filter(Boolean).join(' • ')}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge color={subject?.color ?? 'gray'}>{subject?.name ?? 'Unknown subject'}</Badge>
        <Badge color="gray">
          {question.examType} {question.year}
        </Badge>
        <Badge color="amber">{question.marks} marks</Badge>
        <Badge color={difficultyColors[question.difficulty]}>{question.difficulty}</Badge>
        {question.verified && (
          <Badge color="mint">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </Badge>
        )}
      </div>

      {showSolution && (
        <div className="theme-fade mt-4 rounded-xl border border-mint-200 bg-mint-100/60 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <p className="mb-2 text-xs font-semibold tracking-wide text-mint-700 uppercase dark:text-emerald-300">
            Solution
          </p>
          <div className="space-y-1.5">
            {question.answer.split('\n').map((line, i) => (
              <p key={i} className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Button variant="ghost" size="sm" onClick={() => setShowSolution((v) => !v)}>
            {showSolution ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {showSolution ? 'Hide solution' : 'View solution'}
          </Button>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            Contributed by {question.contributedBy}
          </span>
        </div>
        <Button
          variant={added ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => toggleWorksheet(question.id)}
        >
          {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {added ? 'Added' : 'Add to worksheet'}
        </Button>
      </div>
    </Card>
  )
}
