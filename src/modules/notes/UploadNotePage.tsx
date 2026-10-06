import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import { NOTE_TYPES } from '../../types'
import type { AttachmentMeta, NoteType } from '../../types'
import { subjects } from '../../data'
import { useNotes } from '../../store'
import { AttachmentInput } from '../../components/Attachments'
import {
  Button,
  Card,
  CardBody,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
} from '../../components/ui'
import { useT } from '../../i18n'
import { enumLabel, NOTE_TYPE_HI } from '../../i18n/enums'

export function UploadNotePage() {
  const { t, lang } = useT()
  const addNote = useNotes((s) => s.addNote)
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [type, setType] = useState<NoteType>('note')
  const [subjectId, setSubjectId] = useState('')
  const [chapterId, setChapterId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([])
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
    if (!title.trim()) next.title = t('notes.errorTitle')
    if (!subjectId) next.subjectId = t('notes.errorSubject')
    if (!chapterId) next.chapterId = t('notes.errorChapter')
    if (!topicId) next.topicId = t('notes.errorTopic')
    if (content.trim().length < 40) next.content = t('notes.errorContent')
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
      attachments,
    })
    navigate('/notes')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t('notes.upload')} subtitle={t('notes.uploadSubtitle')} />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Field label={t('notes.fieldTitle')} required error={errors.title}>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (e.target.value.trim()) clearError('title')
                }}
                placeholder={t('notes.titlePlaceholder')}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('notes.fieldType')} required>
                <Select value={type} onChange={(e) => setType(e.target.value as NoteType)}>
                  {NOTE_TYPES.map((value) => (
                    <option key={value} value={value} className="capitalize">
                      {enumLabel(NOTE_TYPE_HI, value, lang)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t('notes.fieldAuthor')} hint={t('notes.authorHint')}>
                <Input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder={t('notes.authorPlaceholder')}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label={t('notes.fieldSubject')} required error={errors.subjectId}>
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
                  <option value="">{t('notes.chooseSubject')}</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t('notes.fieldChapter')} required error={errors.chapterId}>
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
                  <option value="">{t('notes.chooseChapter')}</option>
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t('notes.fieldTopic')} required error={errors.topicId}>
                <Select
                  value={topicId}
                  onChange={(e) => {
                    setTopicId(e.target.value)
                    if (e.target.value) clearError('topicId')
                  }}
                  disabled={!chapterId}
                >
                  <option value="">{t('notes.chooseTopic')}</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field
              label={t('notes.fieldContent')}
              required
              error={errors.content}
              hint={t('notes.contentHint')}
            >
              <Textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  if (e.target.value.trim().length >= 40) clearError('content')
                }}
                rows={8}
                placeholder={t('notes.contentPlaceholder')}
              />
            </Field>

            <Field label={t('notes.fieldAttachments')} hint={t('notes.attachmentsHint')}>
              <AttachmentInput attachments={attachments} onChange={setAttachments} />
            </Field>

            <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4" />
                {t('notes.publish')}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
