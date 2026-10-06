import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button, EmptyState } from '../components/ui'
import { useT } from '../i18n'

export function NotFound() {
  const { t } = useT()
  return (
    <EmptyState
      icon={Compass}
      title={t('notfound.title')}
      description={t('notfound.desc')}
      action={
        <Link to="/">
          <Button>{t('notfound.action')}</Button>
        </Link>
      }
    />
  )
}
