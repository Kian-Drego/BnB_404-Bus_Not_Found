import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { FileText, ImageOff, Paperclip, X } from 'lucide-react'
import type { AttachmentMeta } from '../types'
import {
  ATTACHMENT_ACCEPT,
  formatBytes,
  saveAttachmentFile,
  deleteAttachmentFile,
  useObjectUrl,
  validateAttachment,
} from '../lib/files'
import { uid } from '../lib/utils'
import { useT } from '../i18n'
import { Button } from './ui'

/* ------------------------------------------------------------------ */
/*  Display: image thumbnails + PDF chips                              */
/* ------------------------------------------------------------------ */

function ImageAttachment({ meta }: { meta: AttachmentMeta }) {
  const url = useObjectUrl(meta.id)
  const { t } = useT()
  if (!url) {
    return (
      <span className="theme-fade inline-flex h-20 w-28 flex-col items-center justify-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-500">
        <ImageOff className="h-5 w-5" />
        <span className="px-1 text-center text-[10px] leading-tight">{t('attach.unavailable')}</span>
      </span>
    )
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" title={meta.name} className="group block">
      <img
        src={url}
        alt={meta.name}
        className="h-20 w-28 rounded-xl border border-zinc-200 object-cover transition-opacity group-hover:opacity-80 dark:border-zinc-700"
        loading="lazy"
      />
    </a>
  )
}

function PdfAttachment({ meta }: { meta: AttachmentMeta }) {
  const url = useObjectUrl(meta.id)
  const { t } = useT()
  const inner = (
    <>
      <FileText className="h-4 w-4 shrink-0 text-rose-500" />
      <span className="min-w-0">
        <span className="block max-w-44 truncate">{meta.name}</span>
        <span className="block text-[10px] font-normal text-zinc-400 dark:text-zinc-500">
          PDF · {formatBytes(meta.size)}
        </span>
      </span>
    </>
  )
  const cls =
    'theme-fade inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200'
  if (!url) {
    return (
      <span className={cls} title={t('attach.unavailable')}>
        {inner}
      </span>
    )
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className={`${cls} hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-500/10`} title={t('attach.open')}>
      {inner}
    </a>
  )
}

/** Read-only rendering of a record's attachments (images + PDFs). */
export function AttachmentChips({
  attachments,
  className,
}: {
  attachments?: AttachmentMeta[]
  className?: string
}) {
  if (!attachments || attachments.length === 0) return null
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {attachments.map((a) =>
        a.mime === 'application/pdf' ? (
          <PdfAttachment key={a.id} meta={a} />
        ) : (
          <ImageAttachment key={a.id} meta={a} />
        ),
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Input: pick PDF/images, validate, persist blobs to IndexedDB       */
/* ------------------------------------------------------------------ */

interface AttachmentInputProps {
  attachments: AttachmentMeta[]
  onChange: (next: AttachmentMeta[]) => void
  maxFiles?: number
}

export function AttachmentInput({ attachments, onChange }: AttachmentInputProps) {
  const { t } = useT()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = '' // allow re-picking the same file
    if (files.length === 0) return

    setError(null)
    const next = [...attachments]
    for (const file of files) {
      const problem = validateAttachment(file, next.length)
      if (problem) {
        setError(t(`attach.${problem}`))
        continue
      }
      const meta: AttachmentMeta = { id: uid(), name: file.name, mime: file.type, size: file.size }
      try {
        await saveAttachmentFile(meta.id, file)
        next.push(meta)
      } catch {
        setError(t('attach.unavailable'))
      }
    }
    onChange(next)
  }

  function remove(id: string) {
    void deleteAttachmentFile(id)
    onChange(attachments.filter((a) => a.id !== id))
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ATTACHMENT_ACCEPT}
        className="hidden"
        onChange={(e) => void handleFiles(e)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
          <Paperclip className="h-4 w-4" />
          {t('attach.add')}
        </Button>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">{t('attach.hint')}</span>
      </div>

      {attachments.length > 0 && (
        <ul className="space-y-1.5">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="theme-fade flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-800/60"
            >
              <FileText className={`h-4 w-4 shrink-0 ${a.mime === 'application/pdf' ? 'text-rose-500' : 'text-sky-500'}`} />
              <span className="min-w-0 flex-1 truncate font-medium text-zinc-700 dark:text-zinc-200">
                {a.name}
              </span>
              <span className="shrink-0 text-zinc-400">{formatBytes(a.size)}</span>
              <button
                type="button"
                onClick={() => remove(a.id)}
                aria-label={t('attach.remove')}
                className="theme-fade flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  )
}
