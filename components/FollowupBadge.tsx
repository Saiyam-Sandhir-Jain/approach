'use client'

import { getFollowupStatus, daysUntil, formatDate } from '@/lib/utils'

export function FollowupBadge({ dateStr }: { dateStr?: string | null }) {
  const status = getFollowupStatus(dateStr)
  const days   = daysUntil(dateStr)

  if (status === 'none') {
    return <span className="badge-none stage-badge">No date</span>
  }

  const classMap = {
    overdue:  'badge-overdue stage-badge',
    today:    'badge-today stage-badge',
    upcoming: 'badge-upcoming stage-badge',
    none:     'badge-none stage-badge',
  }

  const label =
    status === 'overdue'  ? `${Math.abs(days!)}d overdue` :
    status === 'today'    ? 'Today' :
    days === 1            ? 'Tomorrow' :
    `In ${days}d`

  return (
    <span className={classMap[status]} title={formatDate(dateStr!)}>
      {status === 'overdue' && '⚠ '}{label}
    </span>
  )
}
