import { useMemo } from 'react'
import {
  CheckCircle2,
  FileDown,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
} from '../../components/ui'
import { ATS_ROLES, sampleResume } from '../../data'
import { cn } from '../../lib/utils'
import { atsScore, bulletLines, keywordReport, runAtsChecks } from './ats'
import { skillList, useResume } from './useResume'
import type { ResumeData } from '../../types'

/* jsPDF is heavy — load the exporter on demand when the user clicks Export. */
const exportResume = async (data: ResumeData) => {
  const { exportResumePdf } = await import('./resumePdf')
  exportResumePdf(data)
}

const sectionHeading = 'text-base font-bold text-zinc-900 dark:text-zinc-50'
/** Paper preview section title — deliberately no dark: variants (paper stays light). */
const paperHeading = 'mt-5 border-b border-zinc-300 pb-1 text-xs font-bold uppercase tracking-wide text-zinc-700'

export function ResumePage() {
  const {
    data,
    set,
    setAll,
    reset,
    addEducation,
    updateEducation,
    removeEducation,
    addExperience,
    updateExperience,
    removeExperience,
    addProject,
    updateProject,
    removeProject,
  } = useResume()

  const checks = useMemo(() => runAtsChecks(data), [data])
  const score = useMemo(() => atsScore(checks), [checks])
  const report = useMemo(() => keywordReport(data), [data])

  /* Entries with at least one filled field, mirroring the PDF's section-skip rules. */
  const education = data.education.filter((e) =>
    [e.school, e.degree, e.field, e.startYear, e.endYear, e.gpa].some((v) => v.trim()),
  )
  const experience = data.experience.filter((e) =>
    [e.company, e.role, e.startDate, e.endDate, e.bullets].some((v) => v.trim()),
  )
  const projects = data.projects.filter((p) =>
    [p.name, p.tech, p.description].some((v) => v.trim()),
  )
  const hasAnything = Boolean(
    data.fullName.trim() ||
      data.email.trim() ||
      data.phone.trim() ||
      data.location.trim() ||
      data.links.trim() ||
      data.summary.trim() ||
      data.skills.trim() ||
      education.length ||
      experience.length ||
      projects.length,
  )

  const passedCount = checks.filter((c) => c.passed).length
  const scoreFill =
    score >= 80
      ? 'bg-mint-700 dark:bg-mint-200'
      : score >= 60
        ? 'bg-amber-400'
        : 'bg-rose-400'

  const contactLine = [data.email, data.phone, data.location, data.links]
    .map((s) => s.trim())
    .filter(Boolean)
    .join('  |  ')

  const suggestions = report.missing.slice(0, 6)

  const addSkill = (keyword: string): void => {
    const current = skillList(data.skills)
    if (current.some((s) => s.toLowerCase() === keyword.toLowerCase())) return
    set({ skills: [...current, keyword].join(', ') })
  }

  return (
    <div>
      <PageHeader
        title="ATS Resume Builder"
        subtitle="Build a parser-safe, single-column resume. Live ATS checks and role keywords update as you type — then export a clean PDF any tracking system can read."
        actions={
          <>
            <Button variant="secondary" onClick={() => setAll(structuredClone(sampleResume))}>
              <Sparkles className="h-4 w-4" />
              Load sample
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (window.confirm('Clear the entire resume? This cannot be undone.')) reset()
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button onClick={() => void exportResume(data)}>
              <FileDown className="h-4 w-4" />
              Export PDF
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* ------------------------------------------------ LEFT: form */}
        <div className="space-y-5">
          {/* Contact & target role */}
          <Card>
            <CardHeader>
              <h2 className={sectionHeading}>Contact & Target Role</h2>
            </CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <Input
                  value={data.fullName}
                  onChange={(e) => set({ fullName: e.target.value })}
                  placeholder="Alex Rivera"
                />
              </Field>
              <Field label="Email" required>
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => set({ email: e.target.value })}
                  placeholder="alex@university.edu"
                />
              </Field>
              <Field label="Phone" required>
                <Input
                  value={data.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                  placeholder="+1 (555) 014-2210"
                />
              </Field>
              <Field label="Location">
                <Input
                  value={data.location}
                  onChange={(e) => set({ location: e.target.value })}
                  placeholder="City, Country"
                />
              </Field>
              <Field label="Links">
                <Input
                  value={data.links}
                  onChange={(e) => set({ links: e.target.value })}
                  placeholder="linkedin.com/in/you github.com/you"
                />
              </Field>
              <Field label="Target role" hint="Used for keyword recommendations">
                <Select
                  value={data.targetRole}
                  onChange={(e) => set({ targetRole: e.target.value })}
                >
                  <option value="">Select a role…</option>
                  {ATS_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>
              </Field>
            </CardBody>
          </Card>

          {/* Professional summary */}
          <Card>
            <CardHeader className="flex items-center justify-between gap-3">
              <h2 className={sectionHeading}>Professional Summary</h2>
              <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                {data.summary.length} / 500
              </span>
            </CardHeader>
            <CardBody>
              <Textarea
                rows={5}
                value={data.summary}
                onChange={(e) => set({ summary: e.target.value })}
                placeholder="Third-year computer science undergraduate with internship experience building full-stack web apps…"
              />
              {data.summary.trim().length < 40 && (
                <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                  Add your degree, years of experience and 2–3 keywords (40+ characters).
                </p>
              )}
            </CardBody>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="flex items-center justify-between gap-3">
              <h2 className={sectionHeading}>Education</h2>
              <Button variant="secondary" size="sm" onClick={addEducation}>
                <Plus className="h-3.5 w-3.5" />
                Add education
              </Button>
            </CardHeader>
            <CardBody className="space-y-4">
              {data.education.length === 0 && (
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  No education added yet — parsers expect at least one entry.
                </p>
              )}
              {data.education.map((e) => (
                <Card key={e.id} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeEducation(e.id)}
                    aria-label="Remove education entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CardBody className="grid gap-3 pt-10 sm:grid-cols-2">
                    <Field label="School" className="sm:col-span-2">
                      <Input
                        value={e.school}
                        onChange={(ev) => updateEducation(e.id, { school: ev.target.value })}
                        placeholder="State University"
                      />
                    </Field>
                    <Field label="Degree">
                      <Input
                        value={e.degree}
                        onChange={(ev) => updateEducation(e.id, { degree: ev.target.value })}
                        placeholder="B.Sc."
                      />
                    </Field>
                    <Field label="Field of study">
                      <Input
                        value={e.field}
                        onChange={(ev) => updateEducation(e.id, { field: ev.target.value })}
                        placeholder="Computer Science"
                      />
                    </Field>
                    <Field label="Start year">
                      <Input
                        value={e.startYear}
                        onChange={(ev) => updateEducation(e.id, { startYear: ev.target.value })}
                        placeholder="2023"
                      />
                    </Field>
                    <Field label="End year">
                      <Input
                        value={e.endYear}
                        onChange={(ev) => updateEducation(e.id, { endYear: ev.target.value })}
                        placeholder="2027 (expected)"
                      />
                    </Field>
                    <Field label="GPA">
                      <Input
                        value={e.gpa}
                        onChange={(ev) => updateEducation(e.id, { gpa: ev.target.value })}
                        placeholder="3.6/4.0"
                      />
                    </Field>
                  </CardBody>
                </Card>
              ))}
            </CardBody>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader className="flex items-center justify-between gap-3">
              <h2 className={sectionHeading}>Experience</h2>
              <Button variant="secondary" size="sm" onClick={addExperience}>
                <Plus className="h-3.5 w-3.5" />
                Add experience
              </Button>
            </CardHeader>
            <CardBody className="space-y-4">
              {data.experience.length === 0 && (
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  Internships, part-time jobs and research assistantships all count.
                </p>
              )}
              {data.experience.map((e) => (
                <Card key={e.id} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeExperience(e.id)}
                    aria-label="Remove experience entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CardBody className="grid gap-3 pt-10 sm:grid-cols-2">
                    <Field label="Company">
                      <Input
                        value={e.company}
                        onChange={(ev) => updateExperience(e.id, { company: ev.target.value })}
                        placeholder="Campus Tech Labs"
                      />
                    </Field>
                    <Field label="Role">
                      <Input
                        value={e.role}
                        onChange={(ev) => updateExperience(e.id, { role: ev.target.value })}
                        placeholder="Software Engineering Intern"
                      />
                    </Field>
                    <Field label="Start date">
                      <Input
                        value={e.startDate}
                        onChange={(ev) => updateExperience(e.id, { startDate: ev.target.value })}
                        placeholder="Jun 2025"
                      />
                    </Field>
                    <Field label="End date">
                      <Input
                        value={e.endDate}
                        onChange={(ev) => updateExperience(e.id, { endDate: ev.target.value })}
                        placeholder="Aug 2025"
                      />
                    </Field>
                    <Field
                      label="Achievements"
                      hint="One achievement per line. Start with an action verb, quantify impact (e.g. 'Reduced load time by 35%')."
                      className="sm:col-span-2"
                    >
                      <Textarea
                        className="min-h-28"
                        value={e.bullets}
                        onChange={(ev) => updateExperience(e.id, { bullets: ev.target.value })}
                        placeholder={'Developed 12 REST API endpoints serving 2,000+ students\nOptimised SQL queries, reducing load time by 35%'}
                      />
                    </Field>
                  </CardBody>
                </Card>
              ))}
            </CardBody>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader className="flex items-center justify-between gap-3">
              <h2 className={sectionHeading}>Projects</h2>
              <Button variant="secondary" size="sm" onClick={addProject}>
                <Plus className="h-3.5 w-3.5" />
                Add project
              </Button>
            </CardHeader>
            <CardBody className="space-y-4">
              {data.projects.length === 0 && (
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  Coursework and personal projects show applied skills.
                </p>
              )}
              {data.projects.map((p) => (
                <Card key={p.id} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeProject(p.id)}
                    aria-label="Remove project entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CardBody className="grid gap-3 pt-10 sm:grid-cols-2">
                    <Field label="Project name">
                      <Input
                        value={p.name}
                        onChange={(ev) => updateProject(p.id, { name: ev.target.value })}
                        placeholder="Study Group Finder"
                      />
                    </Field>
                    <Field label="Tech stack">
                      <Input
                        value={p.tech}
                        onChange={(ev) => updateProject(p.id, { tech: ev.target.value })}
                        placeholder="React, Firebase, Tailwind CSS"
                      />
                    </Field>
                    <Field label="Description" className="sm:col-span-2">
                      <Textarea
                        value={p.description}
                        onChange={(ev) => updateProject(p.id, { description: ev.target.value })}
                        placeholder="Built a React web app that matches students into study groups…"
                      />
                    </Field>
                  </CardBody>
                </Card>
              ))}
            </CardBody>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <h2 className={sectionHeading}>Skills</h2>
            </CardHeader>
            <CardBody>
              <Field label="Skills" hint="Comma-separated — e.g. JavaScript, React, SQL. Aim for at least 5.">
                <Input
                  value={data.skills}
                  onChange={(e) => set({ skills: e.target.value })}
                  placeholder="JavaScript, TypeScript, React, Node.js, SQL"
                />
              </Field>
              {suggestions.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1.5 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                    Suggested for {report.role}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => addSkill(k)}
                        className="rounded-full focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:outline-none"
                        title={`Add "${k}" to skills`}
                      >
                        <Badge
                          color="gray"
                          className="cursor-pointer hover:ring-2 hover:ring-brand-300 dark:hover:ring-brand-500"
                        >
                          <Plus className="h-3 w-3" />
                          {k}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* ------------------------------------------------ RIGHT: ATS panel + preview */}
        <div className="space-y-5 self-start lg:sticky lg:top-24">
          {/* ATS compatibility panel */}
          <Card>
            <CardHeader className="flex items-center justify-between gap-3">
              <h2 className={sectionHeading}>ATS compatibility</h2>
              <Badge color="blue">ATS-safe layout</Badge>
            </CardHeader>
            <CardBody className="space-y-5">
              {/* Score */}
              <div>
                <div className="flex items-end justify-between gap-3">
                  <p>
                    <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                      {score}
                    </span>
                    <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                      {' '}
                      /100
                    </span>
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {passedCount} of {checks.length} checks passed
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', scoreFill)}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>

              {/* Checklist */}
              <ul className="space-y-2.5">
                {checks.map((c) => (
                  <li key={c.id} className="flex items-start gap-2.5">
                    {c.passed ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                        {c.label}
                      </p>
                      {!c.passed && (
                        <p className="text-xs text-rose-600 dark:text-rose-400">{c.hint}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Keyword coverage */}
              <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    Keywords for {report.role}
                  </h3>
                  <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                    {report.density}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-softblue-700 transition-all duration-500 dark:bg-softblue-200"
                    style={{ width: `${report.density}%` }}
                  />
                </div>

                {report.found.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                      Found
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.found.map((k) => (
                        <Badge key={k} color="mint">
                          {k}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {report.missing.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                      Missing
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.missing.map((k) => (
                        <Badge key={k} color="gray">
                          {k}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Live paper preview — forced light: important-suffix overrides beat the
              Card's own dark: utilities regardless of generated CSS order, so the
              paper always renders white ink-on-paper like a real printed resume. */}
          <Card className="bg-white! text-zinc-900! dark:bg-white! dark:text-zinc-900! dark:border-zinc-200!">
            <CardBody className="px-6 py-8 sm:px-10">
              {hasAnything ? (
                <>
                  {data.fullName.trim() && (
                    <h2 className="text-xl font-bold">{data.fullName.trim()}</h2>
                  )}
                  {contactLine && <p className="mt-1 text-xs text-zinc-500">{contactLine}</p>}

                  {data.summary.trim() && (
                    <section>
                      <h3 className={paperHeading}>Summary</h3>
                      <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">
                        {data.summary.trim()}
                      </p>
                    </section>
                  )}

                  {education.length > 0 && (
                    <section>
                      <h3 className={paperHeading}>Education</h3>
                      {education.map((e) => {
                        const title = [e.degree.trim(), e.field.trim()]
                          .filter(Boolean)
                          .join(', ')
                        const years = [e.startYear.trim(), e.endYear.trim()]
                          .filter(Boolean)
                          .join(' – ')
                        return (
                          <div key={e.id} className="mt-3">
                            <div className="flex items-baseline justify-between gap-3">
                              <p className="text-sm font-bold">{title || e.school.trim()}</p>
                              {years && (
                                <p className="shrink-0 text-xs text-zinc-500">{years}</p>
                              )}
                            </div>
                            {title && e.school.trim() && (
                              <p className="text-sm">{e.school.trim()}</p>
                            )}
                            {e.gpa.trim() && <p className="text-sm">GPA: {e.gpa.trim()}</p>}
                          </div>
                        )
                      })}
                    </section>
                  )}

                  {experience.length > 0 && (
                    <section>
                      <h3 className={paperHeading}>Experience</h3>
                      {experience.map((e) => {
                        const title = [e.role.trim(), e.company.trim()]
                          .filter(Boolean)
                          .join(' — ')
                        const dates = [e.startDate.trim(), e.endDate.trim()]
                          .filter(Boolean)
                          .join(' – ')
                        return (
                          <div key={e.id} className="mt-3">
                            <div className="flex items-baseline justify-between gap-3">
                              <p className="text-sm font-bold">{title}</p>
                              {dates && (
                                <p className="shrink-0 text-xs text-zinc-500">{dates}</p>
                              )}
                            </div>
                            {bulletLines(e.bullets).map((b, i) => (
                              <p key={`${e.id}-${i}`} className="mt-0.5 text-sm">
                                - {b}
                              </p>
                            ))}
                          </div>
                        )
                      })}
                    </section>
                  )}

                  {projects.length > 0 && (
                    <section>
                      <h3 className={paperHeading}>Projects</h3>
                      {projects.map((p) => (
                        <div key={p.id} className="mt-3">
                          <p className="text-sm">
                            {p.name.trim() && <span className="font-bold">{p.name.trim()}</span>}
                            {p.tech.trim() && (
                              <span className="text-zinc-600"> ({p.tech.trim()})</span>
                            )}
                          </p>
                          {p.description.trim() && (
                            <p className="mt-0.5 text-sm leading-relaxed whitespace-pre-line">
                              {p.description.trim()}
                            </p>
                          )}
                        </div>
                      ))}
                    </section>
                  )}

                  {data.skills.trim() && (
                    <section>
                      <h3 className={paperHeading}>Skills</h3>
                      <p className="mt-2 text-sm whitespace-pre-line">{data.skills.trim()}</p>
                    </section>
                  )}
                </>
              ) : (
                <p className="py-20 text-center text-sm text-zinc-400">
                  Start filling the form — your ATS-safe preview appears here.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
