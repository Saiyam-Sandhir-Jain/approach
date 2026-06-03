'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { ApplicationForm } from '@/components/ApplicationForm'
import { FollowupBadge } from '@/components/FollowupBadge'
import { StageBadge } from '@/components/StageBadge'
import { fetchApplication } from '@/lib/api'
import type { Application } from '@/types/crm'
import { formatDate } from '@/lib/utils'

export default function EditApplicationPage() {
  const { id } = useParams<{ id: string }>()
  const [app, setApp]       = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    fetchApplication(id)
      .then(setApp)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-20 pb-24 sm:pb-8">

        {loading ? (
          <div className="animate-pulse space-y-3 mt-4">
            <div className="bento-card h-10 opacity-40" />
            <div className="bento-card h-64 opacity-40" />
          </div>
        ) : error ? (
          <div className="bento-card p-4 mt-4 text-sm" style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
            {error}
          </div>
        ) : app ? (
          <>
            {/* Header card */}
            <div className="bento-card noise p-4 mb-4 relative">
              <div className="pointer-events-none absolute inset-0 rounded-xl"
                style={{ background: 'radial-gradient(ellipse 50% 70% at 100% 0%, rgba(255,69,0,0.07), transparent)' }} />
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="font-heading font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {app.companyName}
                  </h1>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{app.roleTitle}</p>
                  <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    Added {formatDate(app.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StageBadge stage={app.stage} />
                  <FollowupBadge dateStr={app.nextFollowupDate} />
                </div>
              </div>
            </div>

            <ApplicationForm app={app} />
          </>
        ) : null}
      </main>
    </div>
  )
}
