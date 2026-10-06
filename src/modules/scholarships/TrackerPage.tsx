import { Link } from 'react-router-dom'
import { ArrowRight, LayoutDashboard, Trash2, TriangleAlert } from 'lucide-react'
import { scholarships } from '../../data'
import { APPLICATION_STATUSES } from '../../types'
import type { ApplicationStatus, Scholarship, TrackerEntry } from '../../types'
import { useTracker } from '../../store'
import { useT } from '../../i18n'
import { STATUS_HI, enumLabel } from '../../i18n/enums'
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  PageHeader,
  Select,
} from '../../components/ui'
import type { BadgeColor } from '../../components/ui'
import { daysUntil, formatDate, formatMoney } from '../../lib/utils'

const STATUS_COLORS: Record<ApplicationStatus, BadgeColor> = {
  'Not Started': 'gray',
  'In Progress': 'blue',
  Submitted: 'amber',
  Awarded: 'mint',
  Rejected: 'rose',
}

/** Countdown chip for a deadline: closed / rose <30d / amber <90d / gray otherwise. */
function countdownChip(
  deadline: string,
  t: (key: string, vars?: Record<string, string | number>) => string,
): { label: string; color: BadgeColor } {
  const days = daysUntil(deadline)
  if (days < 0) return { label: t('sch.closed'), color: 'gray' }
  if (days < 30) return { label: t('sch.daysLeft', { d: days }), color: 'rose' }
  if (days < 90) return { label: t('sch.daysLeft', { d: days }), color: 'amber' }
  return { label: t('sch.daysLeft', { d: days }), color: 'gray' }
}

interface TrackedItem {
  scholarship: Scholarship
  entry: TrackerEntry
}

export function TrackerPage() {
  const { t, lang } = useT()
  const entries = useTracker((s) => s.entries)
  const setStatus = useTracker((s) => s.setStatus)
  const removeEntry = useTracker((s) => s.removeEntry)

  // Join tracker entries with directory data (ignoring stale ids).
  const tracked: TrackedItem[] = scholarships.flatMap((s) => {
    const entry = entries[s.id]
    return entry ? [{ scholarship: s, entry }] : []
  })

  const closingSoon = tracked.filter(({ scholarship, entry }) => {
    const days = daysUntil(scholarship.deadline)
    const incomplete = scholarship.documents.some((d) => !entry.checklist[d])
    return incomplete && days >= 0 && days < 30
  }).length

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('sch.tracker.title')}
        subtitle={t('sch.tracker.subtitle')}
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {APPLICATION_STATUSES.map((st) => {
          const count = tracked.filter((item) => item.entry.status === st).length
          return (
            <Card key={st} className="px-4 py-3.5">
              <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">{count}</p>
              <Badge color={STATUS_COLORS[st]} className="mt-1.5">
                {enumLabel(STATUS_HI, st, lang)}
              </Badge>
            </Card>
          )
        })}
      </div>

      {tracked.length === 0 ? (
        <EmptyState
          icon={LayoutDashboard}
          title={t('sch.tracker.empty.title')}
          description={t('sch.tracker.empty.desc')}
          action={
            <Link to="/scholarships">
              <Button variant="primary" size="sm">
                {t('sch.tracker.empty.action')}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {closingSoon > 0 && (
            <div className="theme-fade flex items-start gap-3 rounded-2xl border border-mint-200 bg-mint-100/60 px-5 py-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-mint-700 dark:text-emerald-300" />
              <p className="text-sm font-medium text-mint-800 dark:text-emerald-200">
                {t('sch.tracker.closingSoon', { n: closingSoon })}
              </p>
            </div>
          )}

          {APPLICATION_STATUSES.map((status) => {
            const items = tracked.filter((item) => item.entry.status === status)
            if (items.length === 0) return null
            return (
              <section key={status} className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <Badge color={STATUS_COLORS[status]}>
                    {enumLabel(STATUS_HI, status, lang)}
                  </Badge>
                  <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                    {items.length}{' '}
                    {items.length === 1
                      ? t('sch.tracker.application')
                      : t('sch.tracker.applications')}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map(({ scholarship, entry }) => {
                    const chip = countdownChip(scholarship.deadline, t)
                    const total = scholarship.documents.length
                    const done = scholarship.documents.filter((d) => entry.checklist[d]).length
                    const pct = total === 0 ? 0 : Math.round((done / total) * 100)
                    return (
                      <Card key={scholarship.id} className="h-full">
                        <CardBody className="flex h-full flex-col gap-3">
                          <div>
                            <Link
                              to={`/scholarships/${scholarship.id}`}
                              className="theme-fade text-sm font-semibold text-zinc-900 hover:text-brand-600 dark:text-zinc-50 dark:hover:text-brand-300"
                            >
                              {scholarship.name}
                            </Link>
                            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                              {scholarship.provider}
                            </p>
                          </div>

                          <p className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                            <span className="font-semibold text-brand-600 dark:text-brand-300">
                              {formatMoney(scholarship.amount, scholarship.currency)}
                              {t('sch.perYear')}
                            </span>
                            <span aria-hidden="true">·</span>
                            {formatDate(scholarship.deadline)}
                            <Badge color={chip.color}>{chip.label}</Badge>
                          </p>

                          <div>
                            <div className="mb-1 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                              <span>
                                {t('sch.tracker.docsProgress', { x: done, y: total })}
                              </span>
                              <span>{pct}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                              <div
                                className="h-full rounded-full bg-mint-700 transition-all duration-300 dark:bg-emerald-400"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>

                          {entry.notes.trim() !== '' && (
                            <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500 italic dark:text-zinc-400">
                              “{entry.notes}”
                            </p>
                          )}

                          <div className="mt-auto flex items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                            <div className="min-w-0 flex-1">
                              <Select
                                value={entry.status}
                                onChange={(e) =>
                                  setStatus(
                                    scholarship.id,
                                    e.target.value as ApplicationStatus,
                                  )
                                }
                                aria-label={t('sch.tracker.statusFor', {
                                  name: scholarship.name,
                                })}
                              >
                                {APPLICATION_STATUSES.map((st) => (
                                  <option key={st} value={st}>
                                    {enumLabel(STATUS_HI, st, lang)}
                                  </option>
                                ))}
                              </Select>
                            </div>
                            <Link to={`/scholarships/${scholarship.id}`}>
                              <Button variant="ghost" size="sm">
                                {t('sch.tracker.open')}
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="danger"
                              size="sm"
                              aria-label={t('sch.tracker.removeEntry', {
                                name: scholarship.name,
                              })}
                              onClick={() => removeEntry(scholarship.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
