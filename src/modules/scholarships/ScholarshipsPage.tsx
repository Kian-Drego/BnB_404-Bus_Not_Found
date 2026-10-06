import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookmarkCheck,
  BookmarkPlus,
  CalendarDays,
  MapPin,
  SearchX,
} from 'lucide-react'
import { scholarships } from '../../data'
import { SCHOLARSHIP_CATEGORIES } from '../../types'
import type { ScholarshipCategory } from '../../types'
import { useTracker } from '../../store'
import { useT } from '../../i18n'
import { CATEGORY_HI, REGION_HI, STATUS_HI, enumLabel } from '../../i18n/enums'
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
} from '../../components/ui'
import type { BadgeColor } from '../../components/ui'
import { daysUntil, formatDate, formatMoney } from '../../lib/utils'

const CATEGORY_COLORS: Record<ScholarshipCategory, BadgeColor> = {
  Government: 'mint',
  Private: 'blue',
  'University Aid': 'lavender',
  'Reserved Quota': 'peach',
}

type CategoryFilter = 'All' | ScholarshipCategory
type DeadlineFilter = 'any' | '30' | '60' | '90'
type MinAwardFilter = 'any' | '2500' | '5000' | '7500'

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

export function ScholarshipsPage() {
  const { t, lang } = useT()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('All')
  const [region, setRegion] = useState('All')
  const [deadline, setDeadline] = useState<DeadlineFilter>('any')
  const [minAward, setMinAward] = useState<MinAwardFilter>('any')

  const entries = useTracker((s) => s.entries)
  const setStatus = useTracker((s) => s.setStatus)

  const regions = useMemo(
    () => Array.from(new Set(scholarships.map((s) => s.region))).sort(),
    [],
  )

  const filtered = useMemo(
    () =>
      scholarships.filter((s) => {
        if (search.trim()) {
          const q = search.trim().toLowerCase()
          const haystack = [s.name, s.provider, s.description, ...s.tags]
            .join(' ')
            .toLowerCase()
          if (!haystack.includes(q)) return false
        }
        if (category !== 'All' && s.category !== category) return false
        if (region !== 'All' && s.region !== region) return false
        if (deadline !== 'any') {
          const days = daysUntil(s.deadline)
          if (days < 0 || days > Number(deadline)) return false
        }
        if (minAward !== 'any' && s.amount < Number(minAward)) return false
        return true
      }),
    [search, category, region, deadline, minAward],
  )

  const filtersActive =
    search.trim() !== '' ||
    category !== 'All' ||
    region !== 'All' ||
    deadline !== 'any' ||
    minAward !== 'any'

  const clearFilters = () => {
    setSearch('')
    setCategory('All')
    setRegion('All')
    setDeadline('any')
    setMinAward('any')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('sch.page.title')}
        subtitle={t('sch.page.subtitle')}
      />

      {/* Filters */}
      <Card>
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Field label={t('sch.filter.search')}>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('sch.filter.searchPlaceholder')}
              />
            </Field>
            <Field label={t('sch.filter.category')}>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryFilter)}
              >
                <option value="All">{t('sch.filter.allCategories')}</option>
                {SCHOLARSHIP_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {enumLabel(CATEGORY_HI, c, lang)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('sch.filter.region')}>
              <Select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="All">{t('sch.filter.allRegions')}</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {enumLabel(REGION_HI, r, lang)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('sch.filter.deadline')}>
              <Select
                value={deadline}
                onChange={(e) => setDeadline(e.target.value as DeadlineFilter)}
              >
                <option value="any">{t('sch.filter.deadlineAny')}</option>
                <option value="30">{t('sch.filter.deadline30')}</option>
                <option value="60">{t('sch.filter.deadline60')}</option>
                <option value="90">{t('sch.filter.deadline90')}</option>
              </Select>
            </Field>
            <Field label={t('sch.filter.minAward')}>
              <Select
                value={minAward}
                onChange={(e) => setMinAward(e.target.value as MinAwardFilter)}
              >
                <option value="any">{t('sch.filter.anyAmount')}</option>
                <option value="2500">≥ $2,500</option>
                <option value="5000">≥ $5,000</option>
                <option value="7500">≥ $7,500</option>
              </Select>
            </Field>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t('sch.results.showingA', { total: scholarships.length })}{' '}
              <span className="font-bold text-zinc-800 dark:text-zinc-100">
                {filtered.length}
              </span>{' '}
              {t('sch.results.showingB', { total: scholarships.length })}
            </p>
            {filtersActive && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                {t('common.clearFilters')}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={t('sch.empty.title')}
          description={t('sch.empty.desc')}
          action={
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              {t('common.clearFilters')}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => {
            const chip = countdownChip(s.deadline, t)
            const entry = entries[s.id]
            return (
              <Card key={s.id} className="flex h-full flex-col">
                <CardBody className="flex flex-1 flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {s.name}
                      </h2>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {s.provider}
                      </p>
                    </div>
                    <Badge color={CATEGORY_COLORS[s.category]} className="shrink-0">
                      {enumLabel(CATEGORY_HI, s.category, lang)}
                    </Badge>
                  </div>

                  <p className="text-lg font-bold text-brand-600 dark:text-brand-300">
                    {formatMoney(s.amount, s.currency)}
                    <span className="ml-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                      {t('sch.perYear')}
                    </span>
                  </p>

                  <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {enumLabel(REGION_HI, s.region, lang)}
                    </p>
                    <p className="flex flex-wrap items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      {formatDate(s.deadline)}
                      <Badge color={chip.color}>{chip.label}</Badge>
                    </p>
                  </div>

                  <p className="line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {s.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} color="gray">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <Link to={`/scholarships/${s.id}`}>
                      <Button variant="ghost" size="sm">
                        {t('sch.details')}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    {entry ? (
                      <Link
                        to="/tracker"
                        className="theme-fade inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-mint-200 bg-mint-100 px-3 text-xs font-semibold whitespace-nowrap text-mint-800 shadow-sm hover:bg-mint-200 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/25"
                      >
                        <BookmarkCheck className="h-3.5 w-3.5" />
                        {enumLabel(STATUS_HI, entry.status, lang)}
                      </Link>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setStatus(s.id, 'In Progress')}
                      >
                        <BookmarkPlus className="h-3.5 w-3.5" />
                        {t('sch.track')}
                      </Button>
                    )}
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
