import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Flag, NotebookPen, PenLine, ShieldCheck, X } from 'lucide-react'
import type { Note, NoteType } from '../../types'
import { subjects, taxonomyOf } from '../../data'
import { mergeNotes, noteScore, useNotes, useVotes } from '../../store'
import { formatDate } from '../../lib/utils'
import { Badge, Button, Card, CardBody, EmptyState, Input, PageHeader, Select } from '../../components/ui'
import { useT } from '../../i18n'
import { enumLabel, NOTE_TYPE_HI } from '../../i18n/enums'
import { VoteButtons } from './VoteButtons'

type TypeFilter = 'all' | NoteType
type SortMode = 'top' | 'newest' | 'az'

/** A single note row: voting rail on the left, content summary on the right. */
function NoteCard({ note }: { note: Note }) {
  const { t, lang } = useT()
  const tax = taxonomyOf(note)
  const taxonomy = [tax.subject?.name, tax.chapter?.name, tax.topic?.name].filter(Boolean).join(' · ')

  return (
    <Card>
      <CardBody className="flex gap-4">
        <div className="shrink-0 pt-0.5">
          <VoteButtons note={note} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{note.title}</h3>
            <Badge color={note.type === 'note' ? 'blue' : 'lavender'}>
              <span className="capitalize">{enumLabel(NOTE_TYPE_HI, note.type, lang)}</span>
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
          {taxonomy && <p className="text-xs text-zinc-500 dark:text-zinc-400">{taxonomy}</p>}
          <p className="line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {note.content}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {t('notes.by')}{' '}
            <span className="font-medium text-zinc-500 dark:text-zinc-400">{note.author}</span>
            {' · '}
            {formatDate(note.createdAt)}
          </p>
        </div>
      </CardBody>
    </Card>
  )
}

export function NotesPage() {
  const { t, lang } = useT()
  const notesState = useNotes()
  const mine = useVotes((s) => s.mine)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [subjectId, setSubjectId] = useState('')
  const [chapterId, setChapterId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [sort, setSort] = useState<SortMode>('top')

  const allNotes = useMemo(() => mergeNotes(notesState), [notesState])

  const chapters = useMemo(
    () => subjects.find((s) => s.id === subjectId)?.chapters ?? [],
    [subjectId],
  )
  const topics = useMemo(
    () => chapters.find((c) => c.id === chapterId)?.topics ?? [],
    [chapters, chapterId],
  )

  const visibleNotes = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = allNotes.filter((n) => {
      if (typeFilter !== 'all' && n.type !== typeFilter) return false
      if (subjectId && n.subjectId !== subjectId) return false
      if (chapterId && n.chapterId !== chapterId) return false
      if (topicId && n.topicId !== topicId) return false
      if (q && !`${n.title} ${n.content} ${n.author}`.toLowerCase().includes(q)) return false
      return true
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'newest') return b.createdAt.localeCompare(a.createdAt)
      if (sort === 'az') return a.title.localeCompare(b.title)
      return noteScore(b, mine) - noteScore(a, mine)
    })
  }, [allNotes, search, typeFilter, subjectId, chapterId, topicId, sort, mine])

  const filtersActive =
    search.trim() !== '' ||
    typeFilter !== 'all' ||
    subjectId !== '' ||
    chapterId !== '' ||
    topicId !== '' ||
    sort !== 'top'

  function clearFilters() {
    setSearch('')
    setTypeFilter('all')
    setSubjectId('')
    setChapterId('')
    setTopicId('')
    setSort('top')
  }

  return (
    <div>
      <PageHeader
        title={t('notes.title')}
        subtitle={t('notes.subtitle')}
        actions={
          <>
            <Link to="/notes/moderation">
              <Button variant="secondary">
                <ShieldCheck className="h-4 w-4" />
                {t('notes.moderation')}
              </Button>
            </Link>
            <Link to="/notes/upload">
              <Button>
                <PenLine className="h-4 w-4" />
                {t('notes.upload')}
              </Button>
            </Link>
          </>
        }
      />

      <Card className="mb-6">
        <CardBody className="space-y-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('notes.searchPlaceholder')}
            aria-label={t('notes.searchAria')}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              aria-label={t('notes.filterTypeAria')}
            >
              <option value="all">{t('notes.allTypes')}</option>
              <option value="note" className="capitalize">
                {enumLabel(NOTE_TYPE_HI, 'note', lang)}
              </option>
              <option value="answer-script" className="capitalize">
                {enumLabel(NOTE_TYPE_HI, 'answer-script', lang)}
              </option>
            </Select>
            <Select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value)
                setChapterId('')
                setTopicId('')
              }}
              aria-label={t('notes.filterSubjectAria')}
            >
              <option value="">{t('notes.allSubjects')}</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <Select
              value={chapterId}
              onChange={(e) => {
                setChapterId(e.target.value)
                setTopicId('')
              }}
              disabled={!subjectId}
              aria-label={t('notes.filterChapterAria')}
            >
              <option value="">{t('notes.allChapters')}</option>
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              disabled={!chapterId}
              aria-label={t('notes.filterTopicAria')}
            >
              <option value="">{t('notes.allTopics')}</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </Select>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              aria-label={t('notes.sortAria')}
            >
              <option value="top">{t('notes.sortTop')}</option>
              <option value="newest">{t('notes.sortNewest')}</option>
              <option value="az">{t('notes.sortAZ')}</option>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {allNotes.length === 1
                ? t('notes.showingOne', { shown: visibleNotes.length, total: allNotes.length })
                : t('notes.showing', { shown: visibleNotes.length, total: allNotes.length })}
            </p>
            {filtersActive && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
                {t('common.clearFilters')}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {visibleNotes.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title={t('notes.emptyTitle')}
          description={t('notes.emptyDesc')}
        />
      ) : (
        <div className="space-y-3">
          {visibleNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}
