'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { FollowupBadge } from '@/components/FollowupBadge'
import { StageBadge } from '@/components/StageBadge'
import { fetchApplications, fetchMetrics } from '@/lib/graphql'
import type { Application, DashboardMetrics, StageStat } from '@/types/crm'
import { formatDate, getFollowupStatus } from '@/lib/utils'

export default function DashboardPage() {
  const [apps, setApps]       = useState<Application[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [a, m] = await Promise.all([fetchApplications(), fetchMetrics()])
      setApps(a)
      setMetrics(m)
    } catch (e: any) {
      setError('Could not reach API. Is the backend running? Set NEXT_PUBLIC_GRAPHQL_URL in .env.local')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const dueToday = apps.filter(a => getFollowupStatus(a.nextFollowupDate) === 'today')
  const overdue  = apps.filter(a => getFollowupStatus(a.nextFollowupDate) === 'overdue')
  const recent   = apps.slice(0, 5)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Navbar />

      <main className="max-w-crm mx-auto px-4 pt-20 pb-24 sm:pb-8 space-y-3 animate-stagger">

        {/* Error banner */}
        {error && (
          <div className="bento-card p-4 text-sm" style={{ border: '1px solid rgba(234,179,8,0.3)', color: '#fbbf24' }}>
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <SkeletonGrid />
        ) : (
          <>
            {/* ── Row 1: Metric Cards ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard label="Total" value={metrics?.total ?? 0} accent />
              <MetricCard label="Interviewing" value={metrics?.activeInterviewing ?? 0} color="#4ade80" />
              <MetricCard label="Overdue" value={metrics?.overdueCount ?? 0} color="#f87171" />
              <MetricCard label="Offers" value={metrics?.offers ?? 0} color="#FF4500" />
            </div>

            {/* ── Row 2: Pipeline + Due Today ──────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
              {/* Pipeline chart */}
              <div className="lg:col-span-3 bento-card noise p-5">
                <div className="pointer-events-none absolute inset-0 rounded-xl"
                  style={{ background: 'radial-gradient(ellipse 50% 60% at 0% 100%, rgba(255,69,0,0.06), transparent)' }} />
                <h3 className="font-heading font-semibold text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
                  Pipeline
                </h3>
                <PipelineChart breakdown={metrics?.stageBreakdown ?? []} total={metrics?.total ?? 0} />
              </div>

              {/* Due today + stats */}
              <div className="lg:col-span-2 bento-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                    Action Needed
                  </h3>
                  <span className="stage-badge badge-today">{dueToday.length + overdue.length}</span>
                </div>

                {dueToday.length === 0 && overdue.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All clear! 🎉 No follow-ups needed.</p>
                ) : (
                  <div className="space-y-2">
                    {[...overdue, ...dueToday].slice(0, 6).map(a => (
                      <Link
                        key={a.id}
                        href={`/applications/${a.id}`}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg transition-colors hover:bg-white/5"
                        style={{ border: '1px solid var(--border-subtle)' }}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-heading font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{a.companyName}</p>
                          <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{a.roleTitle}</p>
                        </div>
                        <FollowupBadge dateStr={a.nextFollowupDate} />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <MiniStat label="Response rate" value={`${metrics?.responseRate ?? 0}%`} />
                  <MiniStat label="Due today" value={String(metrics?.dueTodayCount ?? 0)} />
                  <MiniStat label="Ghosted" value={String(metrics?.ghosted ?? 0)} />
                  <MiniStat label="Offers" value={String(metrics?.offers ?? 0)} />
                </div>
              </div>
            </div>

            {/* ── Row 3: Recent Applications ─────────────────────────── */}
            <div className="bento-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                  Recent Applications
                </h3>
                <Link href="/applications" className="text-xs font-heading font-semibold transition-colors hover:opacity-80" style={{ color: '#FF4500' }}>
                  View all →
                </Link>
              </div>

              {recent.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>No applications yet.</p>
                  <Link href="/applications/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-heading font-bold text-white transition-all"
                    style={{ backgroundColor: '#FF4500', boxShadow: '0 4px 14px rgba(255,69,0,0.3)' }}
                  >
                    + Add your first application
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-5 px-5">
                  <table className="w-full text-xs min-w-[520px]">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        {['Company', 'Role', 'Stage', 'Follow-up', 'Channel'].map(h => (
                          <th key={h} className="text-left pb-2 font-heading font-semibold tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ '--tw-divide-opacity': '1' } as any}>
                      {recent.map(a => (
                        <tr key={a.id} className="group hover:bg-white/3 transition-colors">
                          <td className="py-2.5 pr-3 font-heading font-semibold" style={{ color: 'var(--text-primary)' }}>
                            <Link href={`/applications/${a.id}`} className="hover:underline">{a.companyName}</Link>
                          </td>
                          <td className="py-2.5 pr-3" style={{ color: 'var(--text-secondary)' }}>{a.roleTitle}</td>
                          <td className="py-2.5 pr-3"><StageBadge stage={a.stage} /></td>
                          <td className="py-2.5 pr-3"><FollowupBadge dateStr={a.nextFollowupDate} /></td>
                          <td className="py-2.5 text-xs" style={{ color: 'var(--text-muted)' }}>{a.channel.replace('_', ' ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

// ─── Metric card ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, color, accent }: { label: string; value: number; color?: string; accent?: boolean }) {
  return (
    <div className="bento-card noise p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 rounded-xl"
        style={{ background: `radial-gradient(ellipse 80% 60% at 100% 100%, ${accent ? 'rgba(255,69,0,0.09)' : 'rgba(255,255,255,0.02)'}, transparent)` }} />
      <p className="text-xs font-heading font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="font-heading font-bold text-3xl" style={{ color: color ?? 'var(--text-primary)' }}>{value}</p>
    </div>
  )
}

// ─── Mini stat ────────────────────────────────────────────────────────────────
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      <p className="text-[9px] font-heading tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="font-heading font-bold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
    </div>
  )
}

// ─── Pipeline chart ──────────────────────────────────────────────────────────
const STAGE_ORDER = [
  'INITIAL_PITCH', 'FOLLOW_UP_1', 'FOLLOW_UP_2',
  'TECHNICAL_ASSESSMENT', 'INTERVIEW_ROUND', 'OFFER',
]
const STAGE_SHORT: Record<string, string> = {
  INITIAL_PITCH: 'Pitch', FOLLOW_UP_1: 'FU 1', FOLLOW_UP_2: 'FU 2',
  TECHNICAL_ASSESSMENT: 'Tech', INTERVIEW_ROUND: 'Interview', OFFER: 'Offer',
  REJECTED: 'Rejected', GHOSTED: 'Ghosted',
}
const BAR_COLORS = ['#3b82f6','#6366f1','#8b5cf6','#f59e0b','#FF4500','#22c55e','#ef4444','#71717a']

function PipelineChart({ breakdown, total }: { breakdown: StageStat[]; total: number }) {
  if (total === 0) {
    return <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Add applications to see your pipeline.</p>
  }

  // Sort by funnel order
  const ordered = [...STAGE_ORDER, 'REJECTED', 'GHOSTED']
    .map(s => breakdown.find(b => b.stage === s))
    .filter(Boolean) as StageStat[]

  const max = Math.max(...ordered.map(s => s.count), 1)

  return (
    <div className="space-y-2">
      {ordered.filter(s => s.count > 0).map((s, i) => (
        <div key={s.stage} className="flex items-center gap-2">
          <span className="text-[10px] font-heading w-16 shrink-0 text-right" style={{ color: 'var(--text-muted)' }}>
            {STAGE_SHORT[s.stage] ?? s.stage}
          </span>
          <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(s.count / max) * 100}%`,
                backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                opacity: 0.75,
              }}
            />
          </div>
          <span className="text-[10px] font-heading font-bold w-6 shrink-0" style={{ color: 'var(--text-primary)' }}>
            {s.count}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bento-card h-20" style={{ opacity: 0.4 }} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3 bento-card h-48" style={{ opacity: 0.4 }} />
        <div className="lg:col-span-2 bento-card h-48" style={{ opacity: 0.4 }} />
      </div>
      <div className="bento-card h-56" style={{ opacity: 0.4 }} />
    </div>
  )
}
