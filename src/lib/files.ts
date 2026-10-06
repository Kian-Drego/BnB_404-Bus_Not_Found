import { useEffect, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Attachment blob storage — IndexedDB (localStorage is too small     */
/*  for PDFs/images; IDB offers ~50MB+ and survives sessions).         */
/* ------------------------------------------------------------------ */

const DB_NAME = 'eduvault-files'
const STORE = 'files'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error as Error)
    })
  }
  return dbPromise
}

export async function saveAttachmentFile(id: string, blob: Blob): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(blob, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error as Error)
  })
}

export async function getAttachmentFile(id: string): Promise<Blob | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(id)
    req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null)
    req.onerror = () => reject(req.error as Error)
  })
}

export async function deleteAttachmentFile(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error as Error)
  })
}

/* ------------------------------------------------------------------ */
/*  Validation & formatting                                            */
/* ------------------------------------------------------------------ */

export const MAX_ATTACHMENT_SIZE = 8 * 1024 * 1024 // 8 MB
export const MAX_ATTACHMENTS = 5
export const ACCEPTED_ATTACHMENT_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]
/** value for <input accept> */
export const ATTACHMENT_ACCEPT = 'application/pdf,image/png,image/jpeg,image/webp,image/gif'

export type AttachmentError = 'tooLarge' | 'unsupported' | 'tooMany'

export function validateAttachment(file: File, currentCount: number): AttachmentError | null {
  if (currentCount >= MAX_ATTACHMENTS) return 'tooMany'
  if (!ACCEPTED_ATTACHMENT_TYPES.includes(file.type)) return 'unsupported'
  if (file.size > MAX_ATTACHMENT_SIZE) return 'tooLarge'
  return null
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

/* ------------------------------------------------------------------ */
/*  React hook: attachment id -> object URL (auto-revoked)             */
/* ------------------------------------------------------------------ */

export function useObjectUrl(id: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    // Syncing with an external system (IndexedDB) — clearing stale URLs is required.
    if (!id) {
      setUrl(null)
      return
    }
    let active = true
    let objectUrl: string | null = null
    getAttachmentFile(id)
      .then((blob) => {
        if (blob && active) {
          objectUrl = URL.createObjectURL(blob)
          setUrl(objectUrl)
        } else if (active) {
          setUrl(null)
        }
      })
      .catch(() => {
        if (active) setUrl(null)
      })
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [id])

  return url
}
