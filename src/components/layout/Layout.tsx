import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  Award,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Library,
  Menu,
  NotebookPen,
  X,
} from 'lucide-react'
import { applyThemeClass, useTheme, useWorksheet } from '../../store'
import { cn } from '../../lib/utils'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { to: '/papers', label: 'Past Papers', icon: FileText },
  { to: '/notes', label: 'Notes', icon: NotebookPen },
  { to: '/resume', label: 'Resume Builder', icon: Library },
  { to: '/scholarships', label: 'Scholarships', icon: Award },
  { to: '/tracker', label: 'Tracker', icon: LayoutDashboard },
]

export function Layout() {
  const { dark } = useTheme()
  const worksheetCount = useWorksheet((s) => s.ids.length)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    applyThemeClass(dark)
  }, [dark])

  return (
    <div className="theme-fade flex min-h-screen flex-col bg-stone-50 dark:bg-zinc-950">
      <header className="theme-fade sticky top-0 z-40 border-b border-zinc-200/70 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/25 dark:bg-brand-500 dark:text-brand-950">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Edu<span className="text-brand-600 dark:text-brand-400">Vault</span>
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'theme-fade rounded-lg px-3 py-2 text-sm font-medium',
                    isActive
                      ? 'bg-brand-100 text-brand-800 dark:bg-brand-500/15 dark:text-brand-200'
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/worksheet"
              className="theme-fade relative flex h-9 items-center gap-2 rounded-xl bg-brand-600 px-3.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 dark:bg-brand-500 dark:text-brand-950 dark:hover:bg-brand-400"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Worksheet</span>
              {worksheetCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/25 px-1 text-[11px] font-bold dark:bg-black/20">
                  {worksheetCount}
                </span>
              )}
            </Link>
            <ThemeToggle />
            <button
              className="theme-fade flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 lg:hidden dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="theme-fade border-t border-zinc-200 bg-white px-4 py-3 lg:hidden dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'theme-fade flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                      isActive
                        ? 'bg-brand-100 text-brand-800 dark:bg-brand-500/15 dark:text-brand-200'
                        : 'text-zinc-600 dark:text-zinc-400',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="theme-fade border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:px-6 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-brand-500" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">EduVault</span>
            <span>— free forever, by students for students.</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/papers" className="hover:text-brand-600 dark:hover:text-brand-300">Past Papers</Link>
            <Link to="/notes" className="hover:text-brand-600 dark:hover:text-brand-300">Notes</Link>
            <Link to="/resume" className="hover:text-brand-600 dark:hover:text-brand-300">Resume Builder</Link>
            <Link to="/scholarships" className="hover:text-brand-600 dark:hover:text-brand-300">Scholarships</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
