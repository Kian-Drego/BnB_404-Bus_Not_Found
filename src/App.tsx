import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { PapersPage } from './modules/papers/PapersPage'
import { WorksheetPage } from './modules/papers/WorksheetPage'
import { ContributePaperPage } from './modules/papers/ContributePaperPage'
import { NotesPage } from './modules/notes/NotesPage'
import { UploadNotePage } from './modules/notes/UploadNotePage'
import { ModerationPage } from './modules/notes/ModerationPage'
import { ResumePage } from './modules/resume/ResumePage'
import { ScholarshipsPage } from './modules/scholarships/ScholarshipsPage'
import { ScholarshipDetailPage } from './modules/scholarships/ScholarshipDetailPage'
import { TrackerPage } from './modules/scholarships/TrackerPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="papers" element={<PapersPage />} />
        <Route path="papers/contribute" element={<ContributePaperPage />} />
        <Route path="worksheet" element={<WorksheetPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="notes/upload" element={<UploadNotePage />} />
        <Route path="notes/moderation" element={<ModerationPage />} />
        <Route path="resume" element={<ResumePage />} />
        <Route path="scholarships" element={<ScholarshipsPage />} />
        <Route path="scholarships/:id" element={<ScholarshipDetailPage />} />
        <Route path="tracker" element={<TrackerPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
