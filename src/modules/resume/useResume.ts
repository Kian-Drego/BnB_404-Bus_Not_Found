import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EducationEntry, ExperienceEntry, ProjectEntry, ResumeData } from '../../types'
import { emptyResume } from '../../types'
import { uid } from '../../lib/utils'

/** Fresh copy of the blank resume (no shared array references). */
const blank = (): ResumeData => ({
  ...emptyResume,
  education: [],
  experience: [],
  projects: [],
})

interface ResumeState {
  data: ResumeData
  /** Shallow-merge top-level fields (fullName, summary, skills, ...). */
  set: (patch: Partial<ResumeData>) => void
  /** Replace the whole resume (e.g. load sample data). */
  setAll: (data: ResumeData) => void
  /** Back to a completely blank resume. */
  reset: () => void
  addEducation: () => void
  updateEducation: (id: string, patch: Partial<EducationEntry>) => void
  removeEducation: (id: string) => void
  addExperience: () => void
  updateExperience: (id: string, patch: Partial<ExperienceEntry>) => void
  removeExperience: (id: string) => void
  addProject: () => void
  updateProject: (id: string, patch: Partial<ProjectEntry>) => void
  removeProject: (id: string) => void
}

export const useResume = create<ResumeState>()(
  persist(
    (set) => ({
      data: blank(),
      set: (patch) => set((s) => ({ data: { ...s.data, ...patch } })),
      setAll: (data) => set({ data }),
      reset: () => set({ data: blank() }),

      addEducation: () =>
        set((s) => ({
          data: {
            ...s.data,
            education: [
              ...s.data.education,
              { id: uid(), school: '', degree: '', field: '', startYear: '', endYear: '', gpa: '' },
            ],
          },
        })),
      updateEducation: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            education: s.data.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          },
        })),
      removeEducation: (id) =>
        set((s) => ({
          data: { ...s.data, education: s.data.education.filter((e) => e.id !== id) },
        })),

      addExperience: () =>
        set((s) => ({
          data: {
            ...s.data,
            experience: [
              ...s.data.experience,
              { id: uid(), company: '', role: '', startDate: '', endDate: '', bullets: '' },
            ],
          },
        })),
      updateExperience: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            experience: s.data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          },
        })),
      removeExperience: (id) =>
        set((s) => ({
          data: { ...s.data, experience: s.data.experience.filter((e) => e.id !== id) },
        })),

      addProject: () =>
        set((s) => ({
          data: {
            ...s.data,
            projects: [...s.data.projects, { id: uid(), name: '', tech: '', description: '' }],
          },
        })),
      updateProject: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            projects: s.data.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          },
        })),
      removeProject: (id) =>
        set((s) => ({
          data: { ...s.data, projects: s.data.projects.filter((p) => p.id !== id) },
        })),
    }),
    { name: 'eduvault-resume' },
  ),
)

/** Parse the comma-separated skills string into a clean list. */
export function skillList(skills: string): string[] {
  return skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}
