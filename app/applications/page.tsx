'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { FollowupBadge } from '@/components/FollowupBadge'
import { StageBadge, StatusBadge } from '@/components/StageBadge'
import { fetchApplications } from '@/lib/graphql'
import type { Application, OutreachStage, ApplicationStatus, ContactChannel } from '@/types/crm'
import { formatDate, getFollowupStatus } from '@/lib/utils'
import { STAGE_LABELS, STATUS_LABELS, CHANNEL_LABELS } from '@/types/crm'

type SortKey = 'company' | 'followup' | 'created' | 'stage'
type SortDir = 'asc' | 'desc'

export default function ApplicationsPage() {
  const [apps, setApps]         = useState<Application[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [search, setSearch]     = useState('')
  const [filterStage, setFilterStage]   = useState<OutreachStage | ''>('')
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | ''>('')
  const [filterChannel, setFilterChannel] = useState<ContactChannel | ''>('')
  const [sortKey, setSortKey]   = useState<SortKey>('created')
  const [sortDir, setSortDir]   = useState<SortDir>('desc')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchApplications()
      .then(setApps)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = [...apps]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.companyName.toLowerCase().includes(q) ||
        a.roleTitle.toLowerCase().includes(q) ||
        a.notes?.toLowerCase().includes(q)
      )
    }
    if (filterStage)   list = list.filter(a => a.stage === filterStage)
    if (filterStatus)  list = list.filter(a => a.status === filterStatus)
    if (filterChannel) list = list.filter(a => a.channel === filterChannel)

    list.sort((a, b) => {
      let va: string, vb: string
      if (sortKey === 'company')  { va = a.companyName; vb = b.companyName }
      else if (sortKey === 'followup') { va = a.nextFollowupDate ?? '9999'; vb = b.nextFollowupDate ?? '9999' }
      else if (sortKey === 'stage')    { va = a.stage; vb = b.stage }
      else                             { va = a.createdAt; vb = b.createdAt }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })
    return list
  }, [apps, search, filterStage, filterStatus, filterChannel, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const overdueCount = apps.filter(a => getFollowupStatus(a.nextFollowupDate) === 'overdue').length

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Navbar />

      <main className="max-w-crm mx-auto px-4 pt-20 pb-24 sm:pb-8 space-y-3">

        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <div>
            <h1 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              Applications
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {apps.length} total
              {overdueCount > 0 && <> · <span style={{ color: '#f87171' }}>{overdueCount} overdue</span></>}
            </p>
          </div>
          <Link
            href="/applications/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-heading font-bold text-xs text-white transition-all hover:brightness-110"
            style={{ backgroundColor: '#FF4500', boxShadow: '0 4px 14px rgba(255,69,0,0.3)' }}
          >
            + New
          </Link>
        </div>

        {/* Search + filter bar */}
        <div className="bento-card p-3 space-y-2 animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="flex gap-2">
            <input
              className="crm-input flex-1"
              placeholder="Search company, role, notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              onClick={() => setShowFilters(f => !f)}
              className="px-3 py-2 rounded-lg text-xs font-heading font-semibold transition-all shrink-0"
              style={{
                background: showFilters ? 'rgba(255,69,0,0.15)' : 'var(--bg-elevated)',
                border: `1px solid ${showFilters ? 'rgba(255,69,0,0.4)' : 'var(--border)'}`,
                color: showFilters ? '#FF4500' : 'var(--text-muted)',
              }}
            >
              ⚙ Filters {(filterStage || filterStatus || filterChannel) ? '●' : ''}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <select className="crm-input text-xs" value={filterStage} onChange={e => setFilterStage(e.target.value as any)}>
                <option value="">All Stages</option>
                {Object.entries(STAGE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select className="crm-input text-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
                <option value="">All Statuses</option>
                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select className="crm-input text-xs" value={filterChannel} onChange={e => setFilterChannel(e.target.value as any)}>
                <option value="">All Channels</option>
                {Object.entries(CHANNEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <button
                onClick={() => { setFilterStage(''); setFilterStatus(''); setFilterChannel(''); setSearch('') }}
                className="text-xs font-heading col-span-2 sm:col-span-1 py-1.5 rounded-lg transition-all"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bento-card animate-fade-up" style={{ animationDelay: '120ms' }}>
          {loading ? (
            <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</div>
          ) : error ? (
            <div className="p-6 text-sm" style={{ color: '#fbbf24' }}>⚠ {error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {apps.length === 0 ? 'No applications yet.' : 'No results match your filters.'}
              </p>
              {apps.length === 0 && (
                <Link href="/applications/new"
                  className="inline-flex px-4 py-2 rounded-lg text-xs font-heading font-bold text-white"
                  style={{ backgroundColor: '#FF4500' }}>
                  + Add first application
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[680px]">
                <thead style={{ borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    {[
                      { key: 'company',  label: 'Company' },
                      { key: null,       label: 'Role' },
                      { key: 'stage',    label: 'Stage' },
                      { key: null,       label: 'Status' },
                      { key: 'followup', label: 'Follow-up' },
                      { key: null,       label: 'Channel' },
                      { key: null,       label: '' },
                    ].map(({ key, label }, i) => (
                      <th
                        key={i}
                        className={`text-left p-3 font-heading font-semibold tracking-wide ${key ? 'cursor-pointer select-none hover:opacity-80' : ''}`}
                        style={{ color: 'var(--text-muted)' }}
                        onClick={() => key && toggleSort(key as SortKey)}
                      >
                        {label}
                        {key && sortKey === key && (
                          <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr
                      key={a.id}
                      className="group transition-colors hover:bg-white/3"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td className="p-3 font-heading font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {a.companyName}
                        {a.jobDescriptionUrl && (
                          <a href={a.jobDescriptionUrl} target="_blank" rel="noopener noreferrer"
                            className="ml-1.5 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: '#60a5fa' }}>
                            ↗
                          </a>
                        )}
                      </td>
                      <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{a.roleTitle}</td>
                      <td className="p-3"><StageBadge stage={a.stage} /></td>
                      <td className="p-3"><StatusBadge status={a.status} /></td>
                      <td className="p-3"><FollowupBadge dateStr={a.nextFollowupDate} /></td>
                      <td className="p-3" style={{ color: 'var(--text-muted)' }}>
                        {CHANNEL_LABELS[a.channel]}
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/applications/${a.id}`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-heading font-semibold px-2 py-1 rounded"
                          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
