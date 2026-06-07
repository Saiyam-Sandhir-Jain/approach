'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { FollowupBadge } from '@/components/FollowupBadge'
import { StageBadge } from '@/components/StageBadge'
import { fetchApplications, fetchMetrics } from '@/lib/api'
import type { Application, DashboardMetrics } from '@/types/crm'
import { formatDate, getFollowupStatus } from '@/lib/utils'

export default function DashboardPage() {
  const [apps, setApps]           = useState<Application[]>([])
  const [metrics, setMetrics]     = useState<DashboardMetrics | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [slideOpen, setSlideOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [a, m] = await Promise.all([fetchApplications(), fetchMetrics()])
      setApps(a)
      setMetrics(m)
    } catch (e: any) {
      setError('Could not reach API. Is the backend running? Set NEXT_PUBLIC_API_URL in .env.local')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const dueToday = apps.filter(a => getFollowupStatus(a.nextFollowupDate) === 'today')
  const overdue  = apps.filter(a => getFollowupStatus(a.nextFollowupDate) === 'overdue')
  const recent   = apps.slice(0, 8)


  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Navbar />

      {/* ── Slide Panel ─────────────────────────────────────────────────── */}
      {/* Backdrop */}
      {slideOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
          onClick={() => setSlideOpen(false)}
        />
      )}

      {/* Panel */}
      <aside
        className="fixed left-0 top-14 bottom-0 z-50 flex flex-col overflow-y-auto"
        style={{
          width: 272,
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
          transform: slideOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: slideOpen ? '8px 0 32px rgba(0,0,0,0.18)' : 'none',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <span className="font-heading font-semibold text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
            Summary
          </span>
          <button
            onClick={() => setSlideOpen(false)}
            className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:bg-white/10"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl" style={{ background: 'var(--bg-elevated)', opacity: 0.5 }} />
            ))}
          </div>
        ) : (
          <div className="p-4 space-y-3 flex-1">
            {/* Metric cards */}
            <SlideMetricCard label="Total" value={metrics?.total ?? 0} />
            <SlideMetricCard label="Interviewing" value={metrics?.activeInterviewing ?? 0} color="#4ade80" />
            <SlideMetricCard label="Overdue" value={metrics?.overdueCount ?? 0} color="#f87171" />
            <SlideMetricCard label="Offers" value={metrics?.offers ?? 0} color="#FF4500" />

            {/* Mini stats */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <MiniStat label="Response rate" value={`${metrics?.responseRate ?? 0}%`} />
              <MiniStat label="Due today" value={String(metrics?.dueTodayCount ?? 0)} />
              <MiniStat label="Ghosted" value={String(metrics?.ghosted ?? 0)} />
            </div>

            {/* Action needed */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="font-heading font-semibold text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                  Action Needed
                </span>
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
                      onClick={() => setSlideOpen(false)}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-lg transition-colors hover:bg-white/5"
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
            </div>
          </div>
        )}
      </aside>

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
            {/* ── Header row with slide toggle ───────────────────────────── */}
            <div className="flex items-center justify-between animate-fade-up">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSlideOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-heading font-semibold text-xs transition-all hover:opacity-80"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                  aria-label="Open summary panel"
                >
                  <PanelIcon size={13} />
                  Summary
                </button>

                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{apps.length} total</span>
                  {(metrics?.overdueCount ?? 0) > 0 && (
                    <span style={{ color: '#f87171' }}>{metrics?.overdueCount} overdue</span>
                  )}
                </div>
              </div>

              <Link
                href="/applications/new"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-heading font-bold text-xs text-white transition-all hover:brightness-110"
                style={{ backgroundColor: '#FF4500', boxShadow: '0 4px 14px rgba(255,69,0,0.3)' }}
              >
                + New
              </Link>
            </div>

            {/* ── Applications Table ──────────────────────────────────────── */}
            <div className="bento-card p-5 animate-fade-up" style={{ animationDelay: '60ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                  Applications
                </h3>
              </div>

              {recent.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>No applications yet.</p>
                  <Link
                    href="/applications/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-heading font-bold text-white transition-all"
                    style={{ backgroundColor: '#FF4500', boxShadow: '0 4px 14px rgba(255,69,0,0.3)' }}
                  >
                    + Add your first application
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-5 px-5">
                  <table className="w-full text-xs min-w-[620px]">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        {['Company', 'Role', 'Stage', 'Follow-up', 'Channel'].map(h => (
                          <th key={h} className="text-left pb-2 font-heading font-semibold tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map(a => {
                        return (
                          <tr key={a.id} className="group hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td className="py-2.5 pr-3 font-heading font-semibold" style={{ color: 'var(--text-primary)' }}>
                              <Link href={`/applications/${a.id}`} className="hover:underline">{a.companyName}</Link>
                            </td>
                            <td className="py-2.5 pr-3" style={{ color: 'var(--text-secondary)' }}>{a.roleTitle}</td>
                            <td className="py-2.5 pr-3"><StageBadge stage={a.stage} /></td>
                            <td className="py-2.5 pr-3"><FollowupBadge dateStr={a.nextFollowupDate} /></td>
                            <td className="py-2.5 pr-3 text-xs" style={{ color: 'var(--text-muted)' }}>{a.channel.replace('_', ' ')}</td>

                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {apps.length > 8 && (
                <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <Link
                    href="/applications"
                    className="text-xs font-heading font-semibold transition-colors hover:opacity-80"
                    style={{ color: '#FF4500' }}
                  >
                    View all {apps.length} applications →
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

// ─── Slide panel metric card ──────────────────────────────────────────────────
function SlideMetricCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
    >
      <span className="text-xs font-heading font-semibold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span className="font-heading font-bold text-2xl" style={{ color: color ?? 'var(--text-primary)' }}>
        {value}
      </span>
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

// ─── Panel icon ───────────────────────────────────────────────────────────────
function PanelIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-9 w-32 rounded-lg" style={{ background: 'var(--bg-elevated)', opacity: 0.4 }} />
      <div className="bento-card h-64" style={{ opacity: 0.4 }} />
    </div>
  )
}
