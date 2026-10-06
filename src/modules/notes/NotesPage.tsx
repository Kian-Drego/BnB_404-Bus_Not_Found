import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Flag, Info, NotebookPen, PenLine, ShieldCheck, X } from 'lucide-react'
import type { Note, NoteType } from '../../types'
import { subjects, taxonomyOf } from '../../data'
import { canModerate, canUpload, mergeNotes, noteScore, useNotes, useRole, useVotes } from '../../store'
import { formatDate } from '../../lib/utils'
import { Badge, Button, Card, CardBody, EmptyState, Input, PageHeader, Select } from '../../components/ui'
import { VoteButtons } from './VoteButtons'

type TypeFilter = 'all' | NoteType
type SortMode = 'top' | 'newest' | 'az'

/** A single note row: voting rail on the left, content summary on the right. */
function NoteCard({ note }: { note: Note }) {
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
              {note.type === 'note' ? 'Note' : 'Answer script'}
            </Badge>
            {note.verified && (
              <Badge color="mint">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </Badge>
            )}
            {note.flagged && (
              <Badge color="rose">
                <Flag className="h-3 w-3" />
                Flagged
              </Badge>
            )}
          </div>
          {taxonomy && <p className="text-xs text-zinc-500 dark:text-zinc-400">{taxonomy}</p>}
          <p className="line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {note.content}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            by <span className="font-medium text-zinc-500 dark:text-zinc-400">{note.author}</span>
            {' · '}
            {formatDate(note.createdAt)}
          </p>
        </div>
      </CardBody>
    </Card>
  )
}

export function NotesPage() {
  const role = useRole((s) => s.role)
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
        title="Notes & Content Repository"
        subtitle="Peer-reviewed notes and answer scripts, shared by students and verified by our Student Ambassador moderators."
        actions={
          <>
            {canModerate(role) && (
              <Link to="/notes/moderation">
                <Button variant="secondary">
                  <ShieldCheck className="h-4 w-4" />
                  Moderation
                </Button>
              </Link>
            )}
            <Link to="/notes/upload">
              <Button>
                <PenLine className="h-4 w-4" />
                Upload notes
              </Button>
            </Link>
          </>
        }
      />

      {!canUpload(role) && (
        <Card className="mb-6 border-softblue-200! bg-softblue-100! dark:border-sky-500/30! dark:bg-sky-500/10!">
          <CardBody className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-softblue-700 dark:text-sky-300" />
            <p className="text-sm leading-relaxed text-softblue-800 dark:text-sky-200">
              You're browsing as a Student. Switch to the Contributor role (top-right) to upload
              notes and answer scripts.
            </p>
          </CardBody>
        </Card>
      )}

      <Card className="mb-6">
        <CardBody className="space-y-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, content or authors…"
            aria-label="Search notes"
          />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              aria-label="Filter by type"
            >
              <option value="all">All types</option>
              <option value="note">Notes</option>
              <option value="answer-script">Answer scripts</option>
            </Select>
            <Select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value)
                setChapterId('')
                setTopicId('')
              }}
              aria-label="Filter by subject"
            >
              <option value="">All subjects</option>
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
              aria-label="Filter by chapter"
            >
              <option value="">All chapters</option>
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
              aria-label="Filter by topic"
            >
              <option value="">All topics</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              aria-label="Sort notes"
            >
              <option value="top">Top rated</option>
              <option value="newest">Newest</option>
              <option value="az">A–Z</option>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Showing {visibleNotes.length} of {allNotes.length}{' '}
              {allNotes.length === 1 ? 'note' : 'notes'}
            </p>
            {filtersActive && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {visibleNotes.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="No notes match your filters"
          description="Try widening your search or clearing the filters to see everything in the repository."
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
