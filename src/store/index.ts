import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { notes as seedNotes } from '../data'
import type { ApplicationStatus, Note, Role, TrackerEntry } from '../types'
import { uid } from '../lib/utils'

/* ------------------------------------------------------------------ */
/*  Theme (persisted in localStorage, applied to <html class="dark">)  */
/* ------------------------------------------------------------------ */

interface ThemeState {
  dark: boolean
  toggle: () => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      dark: false,
      toggle: () => set((s) => ({ dark: !s.dark })),
    }),
    { name: 'eduvault-theme' },
  ),
)

/** Side-effect hook helper: call once in the root layout. */
export function applyThemeClass(dark: boolean): void {
  document.documentElement.classList.toggle('dark', dark)
}

/* ------------------------------------------------------------------ */
/*  Current user role (student | contributor | moderator)              */
/* ------------------------------------------------------------------ */

interface RoleState {
  role: Role
  setRole: (role: Role) => void
}

export const useRole = create<RoleState>()(
  persist(
    (set) => ({
      role: 'student',
      setRole: (role) => set({ role }),
    }),
    { name: 'eduvault-role' },
  ),
)

/** Role capabilities — single source of truth for access control. */
export const ROLE_RANK: Record<Role, number> = { student: 0, contributor: 1, moderator: 2 }
export function canUpload(role: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK.contributor
}
export function canModerate(role: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK.moderator
}

/* ------------------------------------------------------------------ */
/*  Module A: custom paper / worksheet cart                            */
/* ------------------------------------------------------------------ */

interface WorksheetState {
  /** Ordered question ids in the worksheet. */
  ids: string[]
  add: (id: string) => void
  remove: (id: string) => void
  toggle: (id: string) => void
  clear: () => void
}

export const useWorksheet = create<WorksheetState>()(
  persist(
    (set) => ({
      ids: [],
      add: (id) => set((s) => (s.ids.includes(id) ? s : { ids: [...s.ids, id] })),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      toggle: (id) =>
        set((s) =>
          s.ids.includes(id) ? { ids: s.ids.filter((x) => x !== id) } : { ids: [...s.ids, id] },
        ),
      clear: () => set({ ids: [] }),
    }),
    { name: 'eduvault-worksheet' },
  ),
)

/* ------------------------------------------------------------------ */
/*  Module B: up/down votes on notes                                   */
/* ------------------------------------------------------------------ */

interface VotesState {
  /** noteId -> my current vote (1 | -1). Absent = no vote. */
  mine: Record<string, 1 | -1>
  vote: (noteId: string, dir: 1 | -1) => void
}

export const useVotes = create<VotesState>()(
  persist(
    (set) => ({
      mine: {},
      vote: (noteId, dir) =>
        set((s) => {
          const mine = { ...s.mine }
          if (mine[noteId] === dir) delete mine[noteId] // clicking again retracts the vote
          else mine[noteId] = dir
          return { mine }
        }),
    }),
    { name: 'eduvault-votes' },
  ),
)

/** Live score for a note = seed base + my vote. */
export function noteScore(note: Note, mine: Record<string, 1 | -1>): number {
  return note.baseVotes + (mine[note.id] ?? 0)
}

/* ------------------------------------------------------------------ */
/*  Module B: uploaded notes + moderation overlays                     */
/* ------------------------------------------------------------------ */

interface NotesState {
  uploaded: Note[]
  /** Seed-note moderation overlays, keyed by note id. */
  verifiedIds: string[]
  flaggedIds: string[]
  hiddenIds: string[]
  addNote: (
    n: Pick<Note, 'title' | 'type' | 'subjectId' | 'chapterId' | 'topicId' | 'author' | 'content'>,
  ) => Note
  verify: (id: string) => void
  toggleFlag: (id: string) => void
  hide: (id: string) => void
}

export const useNotes = create<NotesState>()(
  persist(
    (set) => ({
      uploaded: [],
      verifiedIds: [],
      flaggedIds: [],
      hiddenIds: [],
      addNote: (n) => {
        const note: Note = {
          ...n,
          id: uid(),
          createdAt: new Date().toISOString(),
          baseVotes: 0,
          verified: false,
          flagged: false,
        }
        set((s) => ({ uploaded: [note, ...s.uploaded] }))
        return note
      },
      verify: (id) =>
        set((s) => ({
          uploaded: s.uploaded.map((n) => (n.id === id ? { ...n, verified: true, flagged: false } : n)),
          verifiedIds: s.verifiedIds.includes(id) ? s.verifiedIds : [...s.verifiedIds, id],
          flaggedIds: s.flaggedIds.filter((x) => x !== id),
        })),
      toggleFlag: (id) =>
        set((s) => {
          const inUploaded = s.uploaded.some((n) => n.id === id)
          return {
            uploaded: inUploaded
              ? s.uploaded.map((n) => (n.id === id ? { ...n, flagged: !n.flagged } : n))
              : s.uploaded,
            flaggedIds: s.flaggedIds.includes(id)
              ? s.flaggedIds.filter((x) => x !== id)
              : [...s.flaggedIds, id],
          }
        }),
      hide: (id) =>
        set((s) => ({
          uploaded: s.uploaded.filter((n) => n.id !== id),
          hiddenIds: s.hiddenIds.includes(id) ? s.hiddenIds : [...s.hiddenIds, id],
        })),
    }),
    { name: 'eduvault-notes' },
  ),
)

/** Merge seed notes with uploads and apply moderator overlays. */
export function mergeNotes(
  state: Pick<NotesState, 'uploaded' | 'verifiedIds' | 'flaggedIds' | 'hiddenIds'>,
): Note[] {
  const seed = seedNotes
    .filter((n) => !state.hiddenIds.includes(n.id))
    .map((n) => ({
      ...n,
      verified: n.verified || state.verifiedIds.includes(n.id),
      flagged: n.flagged || state.flaggedIds.includes(n.id),
    }))
  return [...state.uploaded, ...seed]
}

/* ------------------------------------------------------------------ */
/*  Module D: scholarship application tracker                          */
/* ------------------------------------------------------------------ */

interface TrackerState {
  entries: Record<string, TrackerEntry>
  setStatus: (scholarshipId: string, status: ApplicationStatus) => void
  toggleDocument: (scholarshipId: string, doc: string) => void
  setNotes: (scholarshipId: string, notes: string) => void
  removeEntry: (scholarshipId: string) => void
}

const blankEntry = (): TrackerEntry => ({
  status: 'Not Started',
  checklist: {},
  notes: '',
  updatedAt: new Date().toISOString(),
})

export const useTracker = create<TrackerState>()(
  persist(
    (set) => ({
      entries: {},
      setStatus: (scholarshipId, status) =>
        set((s) => ({
          entries: {
            ...s.entries,
            [scholarshipId]: {
              ...(s.entries[scholarshipId] ?? blankEntry()),
              status,
              updatedAt: new Date().toISOString(),
            },
          },
        })),
      toggleDocument: (scholarshipId, doc) =>
        set((s) => {
          const entry = s.entries[scholarshipId] ?? blankEntry()
          return {
            entries: {
              ...s.entries,
              [scholarshipId]: {
                ...entry,
                checklist: { ...entry.checklist, [doc]: !entry.checklist[doc] },
                updatedAt: new Date().toISOString(),
              },
            },
          }
        }),
      setNotes: (scholarshipId, notes) =>
        set((s) => ({
          entries: {
            ...s.entries,
            [scholarshipId]: {
              ...(s.entries[scholarshipId] ?? blankEntry()),
              notes,
              updatedAt: new Date().toISOString(),
            },
          },
        })),
      removeEntry: (scholarshipId) =>
        set((s) => {
          const entries = { ...s.entries }
          delete entries[scholarshipId]
          return { entries }
        }),
    }),
    { name: 'eduvault-tracker' },
  ),
)
