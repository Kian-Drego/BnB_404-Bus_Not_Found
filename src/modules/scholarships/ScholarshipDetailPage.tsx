import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Banknote,
  BookmarkCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  MapPin,
  SearchX,
  Square,
  Trash2,
} from 'lucide-react'
import { scholarships } from '../../data'
import { APPLICATION_STATUSES } from '../../types'
import type { ApplicationStatus, ScholarshipCategory } from '../../types'
import { useTracker } from '../../store'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Field,
  Select,
  Textarea,
} from '../../components/ui'
import type { BadgeColor } from '../../components/ui'
import { cn, daysUntil, formatDate, formatMoney } from '../../lib/utils'

const CATEGORY_COLORS: Record<ScholarshipCategory, BadgeColor> = {
  Government: 'mint',
  Private: 'blue',
  'University Aid': 'lavender',
  'Reserved Quota': 'peach',
}

const STATUS_COLORS: Record<ApplicationStatus, BadgeColor> = {
  'Not Started': 'gray',
  'In Progress': 'blue',
  Submitted: 'amber',
  Awarded: 'mint',
  Rejected: 'rose',
}

/** Countdown chip for a deadline: closed / rose <30d / amber <90d / gray otherwise. */
function countdownChip(deadline: string): { label: string; color: BadgeColor } {
  const days = daysUntil(deadline)
  if (days < 0) return { label: 'Closed', color: 'gray' }
  if (days < 30) return { label: `${days}d left`, color: 'rose' }
  if (days < 90) return { label: `${days}d left`, color: 'amber' }
  return { label: `${days}d left`, color: 'gray' }
}

export function ScholarshipDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const entries = useTracker((s) => s.entries)
  const setStatus = useTracker((s) => s.setStatus)
  const toggleDocument = useTracker((s) => s.toggleDocument)
  const setNotes = useTracker((s) => s.setNotes)
  const removeEntry = useTracker((s) => s.removeEntry)

  const scholarship = scholarships.find((s) => s.id === id)

  if (!scholarship) {
    return (
      <EmptyState
        icon={SearchX}
        title="Scholarship not found"
        description="This scholarship does not exist or may have been removed from the directory."
        action={
          <Link to="/scholarships">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to scholarships
            </Button>
          </Link>
        }
      />
    )
  }

  const entry = entries[scholarship.id]
  const status: ApplicationStatus = entry?.status ?? 'Not Started'
  const chip = countdownChip(scholarship.deadline)
  const totalDocs = scholarship.documents.length
  const doneDocs = scholarship.documents.filter((d) => entry?.checklist[d]).length
  const pct = totalDocs === 0 ? 0 : Math.round((doneDocs / totalDocs) * 100)

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <Link to="/scholarships">
          <Button variant="ghost" size="sm" className="-ml-3">
            <ArrowLeft className="h-4 w-4" />
            All scholarships
          </Button>
        </Link>
      </div>

      {/* Header */}
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={CATEGORY_COLORS[scholarship.category]}>{scholarship.category}</Badge>
          {scholarship.tags.map((t) => (
            <Badge key={t} color="gray">
              {t}
            </Badge>
          ))}
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          {scholarship.name}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-4 w-4" />
            {scholarship.provider}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {scholarship.region}
          </span>
        </p>
      </header>

      {/* Key facts */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="px-4 py-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
            <Banknote className="h-3.5 w-3.5" />
            Award
          </p>
          <p className="mt-1.5 text-lg font-bold text-brand-600 dark:text-brand-300">
            {formatMoney(scholarship.amount, scholarship.currency)}
            <span className="ml-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">/yr</span>
          </p>
        </Card>
        <Card className="px-4 py-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
            <CalendarDays className="h-3.5 w-3.5" />
            Deadline
          </p>
          <p className="mt-1.5 text-sm font-bold text-zinc-900 dark:text-zinc-50">
            {formatDate(scholarship.deadline)}
          </p>
          <Badge color={chip.color} className="mt-1.5">
            {chip.label}
          </Badge>
        </Card>
        <Card className="px-4 py-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
            <MapPin className="h-3.5 w-3.5" />
            Region
          </p>
          <p className="mt-1.5 text-sm font-bold text-zinc-900 dark:text-zinc-50">
            {scholarship.region}
          </p>
        </Card>
        <Card className="px-4 py-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
            <BookmarkCheck className="h-3.5 w-3.5" />
            Status
          </p>
          <div className="mt-1.5">
            <Badge color={STATUS_COLORS[status]}>{status}</Badge>
          </div>
        </Card>
      </div>

      {/* Body */}
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Left column */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                About this scholarship
              </h2>
            </CardHeader>
            <CardBody>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {scholarship.description}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                Eligibility criteria
              </h2>
            </CardHeader>
            <CardBody>
              <ul className="space-y-2.5">
                {scholarship.eligibility.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-700 dark:text-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                Application checklist
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Field label="Status">
                <Select
                  value={status}
                  onChange={(e) =>
                    setStatus(scholarship.id, e.target.value as ApplicationStatus)
                  }
                >
                  {APPLICATION_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                  Required documents
                </p>
                {scholarship.documents.map((doc) => {
                  const checked = Boolean(entry?.checklist[doc])
                  return (
                    <button
                      key={doc}
                      type="button"
                      onClick={() => toggleDocument(scholarship.id, doc)}
                      className="theme-fade flex w-full items-center gap-2.5 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-left text-sm hover:border-mint-200 hover:bg-mint-100/40 dark:border-zinc-700 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/5"
                    >
                      {checked ? (
                        <CheckSquare className="h-4.5 w-4.5 shrink-0 text-mint-700 dark:text-emerald-300" />
                      ) : (
                        <Square className="h-4.5 w-4.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                      )}
                      <span
                        className={cn(
                          'flex-1 text-zinc-700 dark:text-zinc-200',
                          checked && 'text-zinc-400 line-through dark:text-zinc-500',
                        )}
                      >
                        {doc}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {doneDocs} of {totalDocs} documents ready
                  </span>
                  <span className="font-semibold">{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-mint-700 transition-all duration-300 dark:bg-emerald-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">My notes</h2>
            </CardHeader>
            <CardBody className="space-y-2">
              <Textarea
                value={entry?.notes ?? ''}
                onChange={(e) => setNotes(scholarship.id, e.target.value)}
                placeholder="Portal logins, essay ideas, things to follow up…"
              />
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Saved automatically in your browser.
              </p>
            </CardBody>
          </Card>

          {entry && (
            <div className="space-y-2">
              <Button
                variant="danger"
                className="w-full"
                onClick={() => {
                  removeEntry(scholarship.id)
                  navigate('/tracker')
                }}
              >
                <Trash2 className="h-4 w-4" />
                Remove from tracker
              </Button>
              <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
                Last updated {formatDate(entry.updatedAt)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
