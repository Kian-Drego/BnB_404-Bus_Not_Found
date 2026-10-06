import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import type { Note } from '../../types'
import { noteScore, useVotes } from '../../store'
import { cn } from '../../lib/utils'
import { useT } from '../../i18n'

interface VoteButtonsProps {
  note: Note
  layout?: 'row' | 'col'
}

/** Reddit-style up/down vote controls with the note's live score in between. */
export function VoteButtons({ note, layout = 'col' }: VoteButtonsProps) {
  const { t } = useT()
  const mine = useVotes((s) => s.mine)
  const vote = useVotes((s) => s.vote)
  const score = noteScore(note, mine)
  const myVote = mine[note.id]

  const btnBase =
    'theme-fade flex items-center justify-center rounded-lg p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 dark:focus-visible:ring-brand-500'
  const inactive =
    'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300'

  return (
    <div
      className={cn(
        'flex items-center',
        layout === 'col' ? 'flex-col gap-0.5' : 'flex-row gap-1',
      )}
    >
      <button
        type="button"
        aria-label={t('notes.upvote')}
        aria-pressed={myVote === 1}
        onClick={() => vote(note.id, 1)}
        className={cn(
          btnBase,
          myVote === 1
            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
            : inactive,
        )}
      >
        <ArrowBigUp className="h-5 w-5" fill={myVote === 1 ? 'currentColor' : 'none'} />
      </button>
      <span
        className={cn(
          'min-w-7 text-center text-sm font-semibold tabular-nums',
          score > 0
            ? 'text-mint-700 dark:text-emerald-300'
            : score < 0
              ? 'text-rose-600 dark:text-rose-300'
              : 'text-zinc-500 dark:text-zinc-400',
        )}
      >
        {score}
      </span>
      <button
        type="button"
        aria-label={t('notes.downvote')}
        aria-pressed={myVote === -1}
        onClick={() => vote(note.id, -1)}
        className={cn(
          btnBase,
          myVote === -1
            ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'
            : inactive,
        )}
      >
        <ArrowBigDown className="h-5 w-5" fill={myVote === -1 ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}
