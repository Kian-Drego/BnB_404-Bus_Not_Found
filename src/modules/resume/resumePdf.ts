import { jsPDF } from 'jspdf'
import type { ResumeData } from '../../types'
import { bulletLines } from './ats'

/* ------------------------------------------------------------------ */
/*  ATS-safe PDF export                                                */
/*  Single column, helvetica only, black text, no tables/images —      */
/*  the layout legacy applicant-tracking systems parse most reliably.  */
/* ------------------------------------------------------------------ */

const PAGE_W = 595.28 // A4 portrait, pt
const PAGE_H = 841.89
const MARGIN = 56

export function exportResumePdf(r: ResumeData): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
  const contentWidth = PAGE_W - MARGIN * 2
  let y = MARGIN

  const ink = (): void => {
    doc.setTextColor(20, 20, 20)
  }
  ink()

  const bold = (size: number): void => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(size)
  }
  const normal = (size: number): void => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(size)
  }

  /** Page-break guard: start a fresh page when the next block would overflow. */
  const ensureSpace = (needed: number): void => {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage()
      y = MARGIN
      ink()
    }
  }

  /** Render wrapped text at the current y; advances the cursor. */
  const textBlock = (text: string, size: number, isBold = false): void => {
    if (isBold) bold(size)
    else normal(size)
    const lineH = size * 1.35
    const lines = doc.splitTextToSize(text, contentWidth) as string[]
    for (const line of lines) {
      ensureSpace(lineH)
      doc.text(line, MARGIN, y)
      y += lineH
    }
  }

  /** Bold title with right-aligned meta (dates) — wrapped to a second line when tight. */
  const headLine = (left: string, right: string, size = 10.5): void => {
    const lineH = size * 1.35
    bold(size)
    const leftW = doc.getTextWidth(left)
    if (right) {
      normal(size)
      const rightW = doc.getTextWidth(right)
      if (leftW + rightW + 16 <= contentWidth) {
        ensureSpace(lineH)
        bold(size)
        doc.text(left, MARGIN, y)
        normal(size)
        doc.text(right, MARGIN + contentWidth, y, { align: 'right' })
        y += lineH
        return
      }
      // Too tight — wrap the title, dates go right-aligned on their own line.
      textBlock(left, size, true)
      ensureSpace(lineH)
      doc.text(right, MARGIN + contentWidth, y, { align: 'right' })
      y += lineH
      return
    }
    textBlock(left, size, true)
  }

  /** Uppercase section heading with a thin rule underneath. */
  const section = (title: string): void => {
    const headH = 11 * 1.35
    ensureSpace(headH + 24)
    y += 8
    bold(11)
    doc.text(title.toUpperCase(), MARGIN, y)
    y += 5
    doc.setDrawColor(190, 190, 190)
    doc.setLineWidth(0.8)
    doc.line(MARGIN, y, MARGIN + contentWidth, y)
    y += 10
  }

  /* ---------------- Header ---------------- */

  const name = r.fullName.trim()
  if (name) {
    textBlock(name, 20, true)
    y += 2
  }
  const contact = [r.email, r.phone, r.location, r.links]
    .map((s) => s.trim())
    .filter(Boolean)
    .join('  |  ')
  if (contact) {
    textBlock(contact, 9.5)
  }

  /* ---------------- SUMMARY ---------------- */

  if (r.summary.trim()) {
    section('Summary')
    textBlock(r.summary.trim(), 10)
  }

  /* ---------------- EDUCATION ---------------- */

  const education = r.education.filter((e) =>
    [e.school, e.degree, e.field, e.startYear, e.endYear, e.gpa].some((v) => v.trim()),
  )
  if (education.length > 0) {
    section('Education')
    education.forEach((e, i) => {
      const title = [e.degree.trim(), e.field.trim()].filter(Boolean).join(', ')
      const years = [e.startYear.trim(), e.endYear.trim()].filter(Boolean).join(' – ')
      if (title) headLine(title, years)
      else if (years) headLine(years, '')
      if (e.school.trim()) textBlock(e.school.trim(), 10)
      if (e.gpa.trim()) textBlock(`GPA: ${e.gpa.trim()}`, 10)
      if (i < education.length - 1) y += 6
    })
  }

  /* ---------------- EXPERIENCE ---------------- */

  const experience = r.experience.filter((e) =>
    [e.company, e.role, e.startDate, e.endDate, e.bullets].some((v) => v.trim()),
  )
  if (experience.length > 0) {
    section('Experience')
    experience.forEach((e, i) => {
      const title = [e.role.trim(), e.company.trim()].filter(Boolean).join(' — ')
      const dates = [e.startDate.trim(), e.endDate.trim()].filter(Boolean).join(' – ')
      if (title) headLine(title, dates)
      else if (dates) headLine(dates, '')
      normal(10)
      const lineH = 10 * 1.35
      const marker = '- ' // hyphen, not •, so parsers keep the bullet structure
      const hang = doc.getTextWidth(marker)
      for (const b of bulletLines(e.bullets)) {
        const lines = doc.splitTextToSize(b, contentWidth - hang) as string[]
        lines.forEach((ln, j) => {
          ensureSpace(lineH)
          if (j === 0) doc.text(`${marker}${ln}`, MARGIN, y)
          else doc.text(ln, MARGIN + hang, y)
          y += lineH
        })
      }
      if (i < experience.length - 1) y += 6
    })
  }

  /* ---------------- PROJECTS ---------------- */

  const projects = r.projects.filter((p) => [p.name, p.tech, p.description].some((v) => v.trim()))
  if (projects.length > 0) {
    section('Projects')
    projects.forEach((p, i) => {
      const pname = p.name.trim()
      const tech = p.tech.trim()
      if (pname && tech) {
        bold(10.5)
        if (doc.getTextWidth(`${pname} (${tech})`) <= contentWidth) {
          const lineH = 10.5 * 1.35
          ensureSpace(lineH)
          const nameW = doc.getTextWidth(pname)
          doc.text(pname, MARGIN, y)
          normal(10.5)
          doc.text(` (${tech})`, MARGIN + nameW, y)
          y += lineH
        } else {
          textBlock(pname, 10.5, true)
          textBlock(`(${tech})`, 10)
        }
      } else if (pname) {
        textBlock(pname, 10.5, true)
      } else if (tech) {
        textBlock(`(${tech})`, 10)
      }
      if (p.description.trim()) textBlock(p.description.trim(), 10)
      if (i < projects.length - 1) y += 6
    })
  }

  /* ---------------- SKILLS ---------------- */

  if (r.skills.trim()) {
    section('Skills')
    textBlock(r.skills.trim(), 10)
  }

  /* ---------------- Save ---------------- */

  doc.save(pdfFilename(r.fullName))
}

/** "Alex Rivera" -> "alex-rivera-resume.pdf" (falls back to resume.pdf). */
function pdfFilename(fullName: string): string {
  const parts = fullName
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean)
  if (parts.length === 0) return 'resume.pdf'
  const first = parts[0]
  const last = parts.length > 1 ? parts[parts.length - 1] : ''
  return last ? `${first}-${last}-resume.pdf` : `${first}-resume.pdf`
}
