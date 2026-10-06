import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Send } from 'lucide-react'
import { NOTE_TYPES } from '../../types'
import type { NoteType } from '../../types'
import { subjects } from '../../data'
import { canUpload, useNotes, useRole } from '../../store'
import {
  Button,
  Card,
  CardBody,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
} from '../../components/ui'

const TYPE_LABELS: Record<NoteType, string> = {
  note: 'Note',
  'answer-script': 'Answer script',
}

export function UploadNotePage() {
  const role = useRole((s) => s.role)
  const addNote = useNotes((s) => s.addNote)
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [type, setType] = useState<NoteType>('note')
  const [subjectId, setSubjectId] = useState('')
  const [chapterId, setChapterId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const chapters = subjects.find((s) => s.id === subjectId)?.chapters ?? []
  const topics = chapters.find((c) => c.id === chapterId)?.topics ?? []

  function clearError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!title.trim()) next.title = 'Please enter a title'
    if (!subjectId) next.subjectId = 'Please choose a subject'
    if (!chapterId) next.chapterId = 'Please choose a chapter'
    if (!topicId) next.topicId = 'Please choose a topic'
    if (content.trim().length < 40)
      next.content = 'Please write at least 40 characters so the note is useful'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    addNote({
      title: title.trim(),
      type,
      subjectId,
      chapterId,
      topicId,
      author: author.trim() || 'Anonymous',
      content: content.trim(),
    })
    navigate('/notes')
  }

  if (!canUpload(role)) {
    return (
      <div>
        <PageHeader
          title="Upload notes"
          subtitle="Share your notes and answer scripts with the community."
        />
        <EmptyState
          icon={Lock}
          title="Contributor access required"
          description="Uploads are open to Contributors and Student Ambassador moderators. Switch your role using the switcher in the top-right of the navbar to publish notes and answer scripts."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Upload notes"
        subtitle="Share your notes and answer scripts with the community. A Student Ambassador moderator will verify your upload before it is marked as trusted."
      />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Field label="Title" required error={errors.title}>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (e.target.value.trim()) clearError('title')
                }}
                placeholder="e.g. Big-O Cheat Sheet with Growth Graphs"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Type" required>
                <Select value={type} onChange={(e) => setType(e.target.value as NoteType)}>
                  {NOTE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Author" hint="Leave blank to publish as Anonymous.">
                <Input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Anonymous"
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Subject" required error={errors.subjectId}>
                <Select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value)
                    setChapterId('')
                    setTopicId('')
                    if (e.target.value) {
                      clearError('subjectId')
                      clearError('chapterId')
                      clearError('topicId')
                    }
                  }}
                >
                  <option value="">Choose a subject…</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Chapter" required error={errors.chapterId}>
                <Select
                  value={chapterId}
                  onChange={(e) => {
                    setChapterId(e.target.value)
                    setTopicId('')
                    if (e.target.value) {
                      clearError('chapterId')
                      clearError('topicId')
                    }
                  }}
                  disabled={!subjectId}
                >
                  <option value="">Choose a chapter…</option>
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Topic" required error={errors.topicId}>
                <Select
                  value={topicId}
                  onChange={(e) => {
                    setTopicId(e.target.value)
                    if (e.target.value) clearError('topicId')
                  }}
                  disabled={!chapterId}
                >
                  <option value="">Choose a topic…</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field
              label="Content"
              required
              error={errors.content}
              hint="Plain text only — markdown formatting is not rendered. Write clearly and aim for at least 40 characters."
            >
              <Textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  if (e.target.value.trim().length >= 40) clearError('content')
                }}
                rows={8}
                placeholder="Write your note or worked answer script here…"
              />
            </Field>

            <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4" />
                Publish to repository
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
