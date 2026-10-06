import { useMemo } from 'react'
import { BadgeCheck, Flag, PartyPopper, Trash2 } from 'lucide-react'
import { taxonomyOf } from '../../data'
import { mergeNotes, useNotes } from '../../store'
import { formatDate } from '../../lib/utils'
import { Badge, Button, Card, CardBody, EmptyState, PageHeader } from '../../components/ui'
import { useT } from '../../i18n'
import { enumLabel, NOTE_TYPE_HI } from '../../i18n/enums'
import { VoteButtons } from './VoteButtons'

const flagTint =
  'border-amber-300! bg-amber-50! text-amber-800! hover:bg-amber-100! hover:border-amber-300! dark:border-amber-500/30! dark:bg-amber-500/10! dark:text-amber-200! dark:hover:bg-amber-500/20!'

export function ModerationPage() {
  const { t, lang } = useT()
  const notesState = useNotes()

  const allNotes = useMemo(() => mergeNotes(notesState), [notesState])
  const pendingCount = allNotes.filter((n) => !n.verified).length
  const flaggedCount = allNotes.filter((n) => n.flagged).length

  const queue = useMemo(
    () =>
      allNotes
        .filter((n) => !n.verified || n.flagged)
        .sort(
          (a, b) => Number(b.flagged) - Number(a.flagged) || b.createdAt.localeCompare(a.createdAt),
        ),
    [allNotes],
  )

  return (
    <div>
      <PageHeader title={t('notes.modTitle')} subtitle={t('notes.modSubtitle')} />

      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
              {allNotes.length}
            </p>
            <p className="mt-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              {t('notes.statTotal')}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-300">
              {pendingCount}
            </p>
            <p className="mt-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              {t('notes.statPending')}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-300">
              {flaggedCount}
            </p>
            <p className="mt-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              {t('common.flagged')}
            </p>
          </CardBody>
        </Card>
      </div>

      {queue.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title={t('notes.queueClearTitle')}
          description={t('notes.queueClearDesc')}
        />
      ) : (
        <div className="space-y-3">
          {queue.map((note) => {
            const tax = taxonomyOf(note)
            const taxonomy = [tax.subject?.name, tax.chapter?.name, tax.topic?.name]
              .filter(Boolean)
              .join(' · ')
            return (
              <Card key={note.id}>
                <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="shrink-0 pt-0.5">
                    <VoteButtons note={note} layout="row" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {note.title}
                      </h3>
                      <Badge color={note.type === 'note' ? 'blue' : 'lavender'}>
                        <span className="capitalize">
                          {enumLabel(NOTE_TYPE_HI, note.type, lang)}
                        </span>
                      </Badge>
                      {note.verified && (
                        <Badge color="mint">
                          <BadgeCheck className="h-3 w-3" />
                          {t('common.verified')}
                        </Badge>
                      )}
                      {note.flagged && (
                        <Badge color="rose">
                          <Flag className="h-3 w-3" />
                          {t('common.flagged')}
                        </Badge>
                      )}
                    </div>
                    {taxonomy && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{taxonomy}</p>
                    )}
                    <p className="line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                      {note.content}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {t('notes.by')}{' '}
                      <span className="font-medium text-zinc-500 dark:text-zinc-400">
                        {note.author}
                      </span>
                      {' · '}
                      {formatDate(note.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                    <Button size="sm" onClick={() => notesState.verify(note.id)}>
                      <BadgeCheck className="h-4 w-4" />
                      {t('notes.verify')}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className={flagTint}
                      onClick={() => notesState.toggleFlag(note.id)}
                    >
                      <Flag className="h-4 w-4" fill={note.flagged ? 'currentColor' : 'none'} />
                      {note.flagged ? t('notes.unflag') : t('notes.flag')}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (window.confirm(t('notes.confirmRemove'))) notesState.hide(note.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('notes.remove')}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
