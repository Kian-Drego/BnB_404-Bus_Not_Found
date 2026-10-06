import { jsPDF } from 'jspdf'
import { getSubject, taxonomyOf } from '../../data'
import { formatDate } from '../../lib/utils'
import type { Question } from '../../types'

/* ------------------------------------------------------------------ */
/*  Page geometry (A4 portrait, points)                                */
/* ------------------------------------------------------------------ */

const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 56
const CONTENT_W = PAGE_W - MARGIN * 2
const FOOTER_Y = PAGE_H - 30

const BRAND: [number, number, number] = [109, 40, 217]
const INK: [number, number, number] = [24, 24, 27]
const BODY: [number, number, number] = [63, 63, 70]
const GRAY: [number, number, number] = [113, 113, 122]
const LIGHT: [number, number, number] = [161, 161, 170]
const BOX_FILL: [number, number, number] = [246, 244, 252]
const BOX_BORDER: [number, number, number] = [196, 181, 253]
const RULE: [number, number, number] = [228, 228, 231]

/* ------------------------------------------------------------------ */
/*  Text sanitising — jsPDF's built-in fonts use WinAnsi (cp1252),     */
/*  so map common math symbols to ASCII and drop anything else.        */
/* ------------------------------------------------------------------ */

const CHAR_MAP: Record<string, string> = {
  '\u2192': '->', // rightwards arrow
  '\u2190': '<-', // leftwards arrow
  '\u2194': '<->',
  '\u21D2': '=>',
  '\u2212': '-', // minus sign
  '\u2264': '<=',
  '\u2265': '>=',
  '\u2260': '!=',
  '\u2248': '~=',
  '\u221E': 'infinity',
  '\u221A': 'sqrt',
  '\u222B': 'integral',
  '\u22C5': '.', // dot operator
  '\u03B1': 'alpha',
  '\u03B2': 'beta',
  '\u03B3': 'gamma',
  '\u0394': 'Delta',
  '\u03B8': 'theta',
  '\u03BB': 'lambda',
  '\u03BC': 'u', // Greek mu (micro sign µ is already cp1252)
  '\u03C0': 'pi',
  '\u03A3': 'Sigma',
  '\u03C3': 'sigma',
  '\u03C6': 'phi',
  '\u03A9': 'ohm',
  '\u2070': '^0',
  '\u2074': '^4',
  '\u2075': '^5',
  '\u2076': '^6',
  '\u2077': '^7',
  '\u2078': '^8',
  '\u2079': '^9',
  '\u207A': '^+',
  '\u207B': '^-',
  '\u2080': '0',
  '\u2081': '1',
  '\u2082': '2',
  '\u2083': '3',
  '\u2084': '4',
}

/** Characters above Latin-1 that ARE representable in WinAnsi/cp1252. */
const CP1252_EXTRAS =
  '\u20AC\u201A\u0192\u201E\u2026\u2020\u2021\u02C6\u2030\u0160\u2039\u0152\u017D' +
  '\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u02DC\u2122\u0161\u203A\u0153\u017E\u0178'

const UNPRINTABLE = new RegExp(`[^\\x09\\x0A\\x0D\\x20-\\xFF${CP1252_EXTRAS}]`, 'g')

function sanitize(text: string): string {
  let out = text
  for (const [from, to] of Object.entries(CHAR_MAP)) {
    out = out.split(from).join(to)
  }
  return out.replace(UNPRINTABLE, '')
}

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

/** "2 min per mark" durations: 40 -> "40 min", 80 -> "1h 20m". */
function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function metaLine(q: Question): string {
  const t = taxonomyOf(q)
  return [
    getSubject(q.subjectId)?.code,
    t.chapter?.name,
    t.topic?.name,
    String(q.year),
    q.examType,
  ]
    .filter((part): part is string => Boolean(part))
    .join(' • ')
}

function drawBrandBand(doc: jsPDF, tagline: string): void {
  doc.setFillColor(...BRAND)
  doc.rect(0, 0, PAGE_W, 110, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.text('EduVault', MARGIN, 52)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  doc.text(tagline, MARGIN, 72)
}

function addFooters(doc: jsPDF): void {
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setDrawColor(...RULE)
    doc.setLineWidth(0.5)
    doc.line(MARGIN, FOOTER_Y - 12, PAGE_W - MARGIN, FOOTER_Y - 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...LIGHT)
    doc.text('EduVault — student-led academic portal', MARGIN, FOOTER_Y)
    doc.text(`Page ${i} of ${total}`, PAGE_W - MARGIN, FOOTER_Y, { align: 'right' })
  }
}

interface LineOpts {
  size?: number
  style?: 'normal' | 'bold' | 'italic'
  color?: [number, number, number]
  x?: number
  maxWidth?: number
  lineHeight?: number
  gapAfter?: number
}

/** Cursor-based flow writer with automatic page breaks. */
function createWriter(doc: jsPDF) {
  let y = MARGIN

  function ensure(needed: number): void {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage()
      y = MARGIN
    }
  }

  function advance(amount: number): void {
    y += amount
  }

  function lines(text: string, opts: LineOpts = {}): void {
    const size = opts.size ?? 11
    const x = opts.x ?? MARGIN
    const maxWidth = opts.maxWidth ?? CONTENT_W
    const lineHeight = opts.lineHeight ?? size * 1.45
    doc.setFont('helvetica', opts.style ?? 'normal')
    doc.setFontSize(size)
    doc.setTextColor(...(opts.color ?? INK))
    const wrapped = doc.splitTextToSize(sanitize(text), maxWidth) as string[]
    for (const line of wrapped) {
      ensure(lineHeight)
      doc.text(line, x, y)
      y += lineHeight
    }
    y += opts.gapAfter ?? 0
  }

  return {
    ensure,
    advance,
    lines,
    getY: () => y,
    setY: (v: number) => {
      y = v
    },
  }
}

type Writer = ReturnType<typeof createWriter>

function writeQuestionHeader(
  doc: jsPDF,
  w: Writer,
  index: number,
  q: Question,
  marksLabel: string,
): void {
  w.ensure(70)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11.5)
  doc.setTextColor(...INK)
  doc.text(`Q${index + 1}.`, MARGIN, w.getY())
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...GRAY)
  doc.text(marksLabel, PAGE_W - MARGIN, w.getY(), { align: 'right' })
  w.advance(16)
  w.lines(metaLine(q), { size: 9, color: GRAY, gapAfter: 5 })
}

/* ------------------------------------------------------------------ */
/*  Question paper                                                     */
/* ------------------------------------------------------------------ */

const INSTRUCTIONS = [
  'Answer all questions. You may attempt them in any order, but your numbering must match this paper.',
  'Marks for each question are shown in brackets on the right — allocate roughly two minutes per mark.',
  'Show all working clearly. Method marks are awarded for correct steps even when the final answer is incorrect.',
  'Attempt every question on your own before consulting the companion answer key.',
  'Non-programmable calculators and formula sheets may be used only where your course regulations permit.',
]

export function generateQuestionPaper(qs: Question[]): void {
  if (qs.length === 0) return
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
  const w = createWriter(doc)

  /* ---------- Cover page ---------- */
  drawBrandBand(doc, 'Past Papers & Question Repository')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(...INK)
  doc.text('Custom Practice Paper', PAGE_W / 2, 196, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...GRAY)
  doc.text(`Generated on ${formatDate(new Date().toISOString())}`, PAGE_W / 2, 216, {
    align: 'center',
  })

  /* Summary box */
  const totalMarks = qs.reduce((sum, q) => sum + q.marks, 0)
  const subjectCodes = [
    ...new Set(qs.map((q) => getSubject(q.subjectId)?.code).filter((c): c is string => Boolean(c))),
  ]
  const terms = [...new Set(qs.map((q) => `${q.examType} ${q.year}`))]
  const chapterNames = [
    ...new Set(qs.map((q) => taxonomyOf(q).chapter?.name).filter((c): c is string => Boolean(c))),
  ]

  const rows: Array<[string, string]> = [
    ['Total questions', String(qs.length)],
    ['Total marks', String(totalMarks)],
    ['Suggested time', `${formatMinutes(totalMarks * 2)} (2 minutes per mark)`],
    ['Subjects covered', subjectCodes.join(', ')],
    ['Exam terms covered', terms.join(', ')],
    ['Chapters covered', chapterNames.join(', ')],
  ]

  const boxX = MARGIN
  const boxY = 244
  const pad = 16
  const labelW = 140
  const valueW = CONTENT_W - pad * 2 - labelW - 16
  const rowLineH = 14

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const prepared = rows.map(([label, value]) => {
    const valueLines = doc.splitTextToSize(sanitize(value), valueW) as string[]
    return { label, valueLines, height: Math.max(valueLines.length, 1) * rowLineH + 4 }
  })
  const boxH = prepared.reduce((sum, r) => sum + r.height, 0) + pad * 2

  doc.setFillColor(...BOX_FILL)
  doc.setDrawColor(...BOX_BORDER)
  doc.setLineWidth(1)
  doc.roundedRect(boxX, boxY, CONTENT_W, boxH, 10, 10, 'FD')

  let rowY = boxY + pad + 8
  for (const row of prepared) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...BRAND)
    doc.text(row.label, boxX + pad, rowY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...INK)
    row.valueLines.forEach((line, i) => {
      doc.text(line, boxX + pad + labelW + 16, rowY + i * rowLineH)
    })
    rowY += row.height
  }

  /* Instructions */
  w.setY(boxY + boxH + 34)
  w.lines('Instructions to Candidates', { size: 13, style: 'bold', gapAfter: 8 })
  INSTRUCTIONS.forEach((ins, i) => {
    w.ensure(16)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...BRAND)
    doc.text(`${i + 1}.`, MARGIN, w.getY())
    w.lines(ins, { size: 10, color: BODY, x: MARGIN + 18, maxWidth: CONTENT_W - 18, gapAfter: 5 })
  })

  /* ---------- Questions (from page 2) ---------- */
  doc.addPage()
  w.setY(MARGIN)
  w.lines('Questions', { size: 14, style: 'bold', gapAfter: 2 })
  w.lines('Answer ALL questions. The source of each question is listed beneath its number.', {
    size: 9,
    color: GRAY,
    gapAfter: 14,
  })

  qs.forEach((q, i) => {
    writeQuestionHeader(doc, w, i, q, `[${q.marks} mark${q.marks === 1 ? '' : 's'}]`)
    w.lines(q.text, { size: 11, color: INK, gapAfter: 18 })
  })

  addFooters(doc)
  doc.save('eduvault-question-paper.pdf')
}

/* ------------------------------------------------------------------ */
/*  Answer key                                                         */
/* ------------------------------------------------------------------ */

export function generateAnswerKey(qs: Question[]): void {
  if (qs.length === 0) return
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
  const w = createWriter(doc)

  drawBrandBand(doc, 'Past Papers & Question Repository')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...INK)
  doc.text('Answer Key & Marking Scheme', PAGE_W / 2, 170, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...GRAY)
  doc.text(
    'Companion to your generated Custom Practice Paper — question numbers match one-to-one.',
    PAGE_W / 2,
    190,
    { align: 'center' },
  )

  const totalMarks = qs.reduce((sum, q) => sum + q.marks, 0)
  doc.text(`${qs.length} questions • ${totalMarks} marks total`, PAGE_W / 2, 208, {
    align: 'center',
  })

  w.setY(252)

  qs.forEach((q, i) => {
    w.ensure(70)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11.5)
    doc.setTextColor(...INK)
    doc.text(`Q${i + 1} — ${q.marks} mark${q.marks === 1 ? '' : 's'}`, MARGIN, w.getY())
    w.advance(16)
    w.lines(metaLine(q), { size: 9, color: GRAY, gapAfter: 6 })
    for (const step of q.answer.split('\n')) {
      w.lines(step, {
        size: 10.5,
        color: BODY,
        x: MARGIN + 16,
        maxWidth: CONTENT_W - 16,
        gapAfter: 3,
      })
    }
    w.advance(14)
  })

  addFooters(doc)
  doc.save('eduvault-answer-key.pdf')
}
