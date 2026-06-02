'use client'

import { STAGE_LABELS, STATUS_LABELS, type OutreachStage, type ApplicationStatus } from '@/types/crm'

const STAGE_COLORS: Record<OutreachStage, string> = {
  INITIAL_PITCH:        'bg-blue-500/10 text-blue-400 border-blue-500/20',
  FOLLOW_UP_1:          'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  FOLLOW_UP_2:          'bg-violet-500/10 text-violet-400 border-violet-500/20',
  TECHNICAL_ASSESSMENT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  INTERVIEW_ROUND:      'bg-orange-500/10 text-orange-400 border-orange-500/20',
  OFFER:                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED:             'bg-red-500/10 text-red-400 border-red-500/20',
  GHOSTED:              'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  PENDING:             'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  AWAITING_ACTION:     'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  ACTIVE_INTERVIEWING: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CLOSED:              'bg-red-500/10 text-red-400 border-red-500/20',
}

export function StageBadge({ stage }: { stage: OutreachStage }) {
  return (
    <span className={`stage-badge ${STAGE_COLORS[stage]}`}>
      {STAGE_LABELS[stage]}
    </span>
  )
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`stage-badge ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
