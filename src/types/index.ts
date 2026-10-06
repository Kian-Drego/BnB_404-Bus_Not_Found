/* ------------------------------------------------------------------ */
/*  EduVault — shared domain models                                    */
/* ------------------------------------------------------------------ */

export type PastelColor = 'lavender' | 'mint' | 'blue' | 'peach'

/** Metadata for a user-uploaded file. The blob itself lives in IndexedDB
 *  (see src/lib/files.ts), keyed by AttachmentMeta.id. */
export interface AttachmentMeta {
  id: string
  name: string
  /** e.g. 'application/pdf' | 'image/png' */
  mime: string
  /** File size in bytes. */
  size: number
}

/* ---------------- Module A/B: taxonomy & content ------------------ */

export interface Topic {
  id: string
  name: string
}

export interface Chapter {
  id: string
  name: string
  topics: Topic[]
}

export interface Subject {
  id: string
  name: string
  code: string
  color: PastelColor
  chapters: Chapter[]
}

export const EXAM_TYPES = ['Midterm', 'Final', 'Quiz', 'Supplementary'] as const
export type ExamType = (typeof EXAM_TYPES)[number]

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

/** A past-paper question bundled with its answer script. */
export interface Question {
  id: string
  subjectId: string
  chapterId: string
  topicId: string
  year: number
  examType: ExamType
  marks: number
  difficulty: Difficulty
  /** Question body text. */
  text: string
  /** Step-by-step solution / answer script. May be empty for fresh uploads. */
  answer: string
  contributedBy: string
  verified: boolean
  /** Attached images / PDF (metadata only; blobs in IndexedDB). */
  attachments?: AttachmentMeta[]
  /** Set when the question came from a PDF paper upload. */
  uploadId?: string
  bundleId?: string
  bundleTitle?: string
}

/** A named group of questions carved out of an uploaded PDF paper. */
export interface QuestionBundle {
  id: string
  title: string
  questionIds: string[]
}

/** Metadata for a PDF paper upload that was split into question bundles. */
export interface PaperUpload {
  id: string
  subjectId: string
  chapterId: string
  topicId: string
  year: number
  examType: ExamType
  /** Every topic covered inside the PDF — required whenever a PDF is attached. */
  topicsInPdf: string[]
  bundles: QuestionBundle[]
  attachment: AttachmentMeta
  contributedBy: string
  createdAt: string
}

export const NOTE_TYPES = ['note', 'answer-script'] as const
export type NoteType = (typeof NOTE_TYPES)[number]

/** A peer-uploaded note or answer script. */
export interface Note {
  id: string
  title: string
  type: NoteType
  subjectId: string
  chapterId: string
  topicId: string
  author: string
  content: string
  /** ISO timestamp. */
  createdAt: string
  /** Seed vote count; live score = baseVotes + vote delta from the votes store. */
  baseVotes: number
  verified: boolean
  flagged: boolean
  /** Attached images / PDF (metadata only; blobs in IndexedDB). */
  attachments?: AttachmentMeta[]
}

/* ---------------- Module D: scholarships -------------------------- */

export const SCHOLARSHIP_CATEGORIES = [
  'Government',
  'Private',
  'University Aid',
  'Reserved Quota',
] as const
export type ScholarshipCategory = (typeof SCHOLARSHIP_CATEGORIES)[number]

export const APPLICATION_STATUSES = [
  'Not Started',
  'In Progress',
  'Submitted',
  'Awarded',
  'Rejected',
] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export interface Scholarship {
  id: string
  name: string
  provider: string
  category: ScholarshipCategory
  /** Annual award amount. */
  amount: number
  currency: string
  /** ISO date of the application deadline. */
  deadline: string
  /** Country / region of eligibility. */
  region: string
  description: string
  eligibility: string[]
  /** Required application documents (interactive checklist items). */
  documents: string[]
  tags: string[]
}

/** Per-scholarship personal tracking record (persisted locally). */
export interface TrackerEntry {
  status: ApplicationStatus
  /** document name -> checked */
  checklist: Record<string, boolean>
  notes: string
  updatedAt: string
}

/* ---------------- Module C: ATS resume ----------------------------- */

export interface EducationEntry {
  id: string
  school: string
  degree: string
  field: string
  startYear: string
  endYear: string
  gpa: string
}

export interface ExperienceEntry {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string
  /** One bullet per line. */
  bullets: string
}

export interface ProjectEntry {
  id: string
  name: string
  tech: string
  description: string
}

export interface ResumeData {
  fullName: string
  email: string
  phone: string
  location: string
  /** LinkedIn / GitHub / portfolio, space or comma separated. */
  links: string
  summary: string
  education: EducationEntry[]
  experience: ExperienceEntry[]
  projects: ProjectEntry[]
  /** Comma-separated skill list. */
  skills: string
  /** Target role used for keyword recommendations, e.g. "Software Engineer". */
  targetRole: string
}

export const emptyResume: ResumeData = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  links: '',
  summary: '',
  education: [],
  experience: [],
  projects: [],
  skills: '',
  targetRole: '',
}
