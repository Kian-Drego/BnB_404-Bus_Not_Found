import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  FileText,
  FileCheck2,
  NotebookPen,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { Badge, Card } from '../components/ui'
import { notes, questions, scholarships } from '../data'

const modules = [
  {
    to: '/papers',
    icon: FileText,
    title: 'Past Papers Repository',
    description:
      'Search past exam questions by subject, chapter, topic, year and term — then compile your own custom worksheet.',
    badge: 'Question bank',
    badgeColor: 'lavender' as const,
    accent: 'bg-lavender-100 text-lavender-700 dark:bg-brand-500/15 dark:text-brand-300',
  },
  {
    to: '/notes',
    icon: NotebookPen,
    title: 'Notes & Answer Scripts',
    description:
      'Peer-uploaded study notes and solved answer scripts with community voting and ambassador verification.',
    badge: 'Peer reviewed',
    badgeColor: 'mint' as const,
    accent: 'bg-mint-100 text-mint-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  {
    to: '/resume',
    icon: FileCheck2,
    title: 'ATS Resume Builder',
    description:
      'Single-column, parser-safe resume templates with live ATS checks, keyword density insights and clean PDF export.',
    badge: 'Career ready',
    badgeColor: 'blue' as const,
    accent: 'bg-softblue-100 text-softblue-700 dark:bg-sky-500/15 dark:text-sky-300',
  },
  {
    to: '/scholarships',
    icon: Award,
    title: 'Scholarship Directory',
    description:
      'Government grants, private awards, university aid and reserved quotas — with document checklists and a personal application tracker.',
    badge: 'Fund your degree',
    badgeColor: 'peach' as const,
    accent: 'bg-peach-100 text-peach-700 dark:bg-orange-500/15 dark:text-orange-300',
  },
]

export function Home() {
  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="theme-fade relative overflow-hidden rounded-3xl border border-brand-200/60 bg-gradient-to-br from-brand-100 via-softblue-100 to-mint-100 px-6 py-14 sm:px-12 sm:py-18 dark:border-brand-500/20 dark:from-brand-950 dark:via-zinc-900 dark:to-emerald-950/40">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-300/40 blur-3xl dark:bg-brand-500/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-mint-200/60 blur-3xl dark:bg-emerald-500/10" />
        <div className="relative max-w-2xl">
          <Badge color="lavender" className="mb-4">
            <Sparkles className="h-3 w-3" />
            100% free — no paid tiers, ever
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl sm:leading-[1.1] dark:text-zinc-50">
            Your degree,{' '}
            <span className="bg-gradient-to-r from-brand-600 to-sky-500 bg-clip-text text-transparent dark:from-brand-300 dark:to-sky-300">
              organised.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
            EduVault is a student-led portal bringing together past papers, peer notes, an
            ATS-friendly resume builder and a scholarship tracker — everything an undergraduate
            needs, in one calm workspace.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/papers"
              className="theme-fade inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 dark:bg-brand-500 dark:text-brand-950 dark:hover:bg-brand-400"
            >
              <Search className="h-4 w-4" />
              Browse past papers
            </Link>
            <Link
              to="/scholarships"
              className="theme-fade inline-flex h-11 items-center gap-2 rounded-xl border border-zinc-300 bg-white/70 px-5 text-sm font-semibold text-zinc-700 backdrop-blur hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Wallet className="h-4 w-4" />
              Find scholarships
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Curated questions', value: String(questions.length) },
          { label: 'Peer notes & scripts', value: String(notes.length) },
          { label: 'Active scholarships', value: String(scholarships.length) },
          { label: 'Cost to students', value: '$0' },
        ].map((s) => (
          <Card key={s.label} className="px-5 py-4 text-center">
            <div className="text-2xl font-extrabold text-brand-600 dark:text-brand-300">
              {s.value}
            </div>
            <div className="mt-1 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              {s.label}
            </div>
          </Card>
        ))}
      </section>

      {/* Module cards */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Four tools, one login-free workspace</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Everything is stored locally in your browser — private by default.
            </p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {modules.map((m) => (
            <Link key={m.to} to={m.to} className="group">
              <Card className="flex h-full flex-col p-6 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-brand-300 group-hover:shadow-lg group-hover:shadow-brand-500/10 dark:group-hover:border-brand-500/40">
                <div className="mb-4 flex items-center justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${m.accent}`}>
                    <m.icon className="h-5.5 w-5.5" />
                  </span>
                  <Badge color={m.badgeColor}>{m.badge}</Badge>
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">{m.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {m.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300">
                  Open module
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="theme-fade flex flex-col items-start gap-4 rounded-3xl border border-mint-200 bg-mint-100/60 px-6 py-6 sm:flex-row sm:items-center dark:border-emerald-500/20 dark:bg-emerald-500/5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint-200 text-mint-800 dark:bg-emerald-500/15 dark:text-emerald-300">
          <ShieldCheck className="h-5.5 w-5.5" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Quality you can trust
          </h3>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-300">
            Every upload passes community voting and Student Ambassador verification before it is
            marked as trusted. Flagged content is reviewed and removed when it misses the bar.
          </p>
        </div>
      </section>
    </div>
  )
}
