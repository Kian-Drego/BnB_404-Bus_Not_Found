import { GraduationCap, PenLine, ShieldCheck } from 'lucide-react'
import { useRole } from '../../store'
import type { Role } from '../../types'

const roleMeta: Array<{ value: Role; label: string; icon: typeof GraduationCap }> = [
  { value: 'student', label: 'Student', icon: GraduationCap },
  { value: 'contributor', label: 'Contributor', icon: PenLine },
  { value: 'moderator', label: 'Ambassador', icon: ShieldCheck },
]

/** Demo role switcher — drives the free-tier access control model. */
export function RoleSwitcher() {
  const { role, setRole } = useRole()
  const active = roleMeta.find((r) => r.value === role)!
  const Icon = active.icon

  return (
    <label
      className="theme-fade flex h-9 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2.5 text-xs font-semibold text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
      title="Switch user role (demo access control)"
    >
      <Icon className="h-4 w-4 text-brand-500" />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        className="cursor-pointer bg-transparent outline-none"
        aria-label="User role"
      >
        {roleMeta.map((r) => (
          <option key={r.value} value={r.value} className="text-zinc-800">
            {r.label}
          </option>
        ))}
      </select>
    </label>
  )
}
