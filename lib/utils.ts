import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

type FollowupStatus = 'overdue' | 'today' | 'upcoming' | 'none'

export function getFollowupStatus(dateStr?: string | null): FollowupStatus {
  if (!dateStr) return 'none'
  const target = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - today.getTime()
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  return 'upcoming'
}

export function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export function calcFollowupDate(stage: string, lastContactDate: string): string {
  const base = new Date(lastContactDate)
  const offsets: Record<string, number> = {
    INITIAL_PITCH: 3,
    FOLLOW_UP_1: 5,
    FOLLOW_UP_2: 7,
    TECHNICAL_ASSESSMENT: 4,
  }
  const offset = offsets[stage]
  if (offset == null) return ''
  base.setDate(base.getDate() + offset)
  return base.toISOString().split('T')[0]
}
