import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button, EmptyState } from '../components/ui'

export function NotFound() {
  return (
    <EmptyState
      icon={Compass}
      title="404 — Page not found"
      description="The page you're looking for doesn't exist or has been moved."
      action={
        <Link to="/">
          <Button>Back to home</Button>
        </Link>
      }
    />
  )
}
