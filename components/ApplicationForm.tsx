'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn, calcFollowupDate } from '@/lib/utils'
import {
  createApplication, updateApplication, deleteApplication,
  createContact, deleteContact,
} from '@/lib/graphql'
import type {
  Application, ApplicationInput, ContactInput,
  OutreachStage, ApplicationStatus, ContactChannel,
} from '@/types/crm'

interface Props {
  app?: Application
}

const today = new Date().toISOString().split('T')[0]

export function ApplicationForm({ app }: Props) {
  const router = useRouter()
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // Form fields
  const [companyName, setCompanyName]       = useState(app?.companyName ?? '')
  const [roleTitle, setRoleTitle]           = useState(app?.roleTitle ?? '')
  const [jdUrl, setJdUrl]                   = useState(app?.jobDescriptionUrl ?? '')
  const [stage, setStage]                   = useState<OutreachStage>(app?.stage ?? 'INITIAL_PITCH')
  const [status, setStatus]                 = useState<ApplicationStatus>(app?.status ?? 'PENDING')
  const [channel, setChannel]               = useState<ContactChannel>(app?.channel ?? 'LINKEDIN_DIRECT')
  const [lastContact, setLastContact]       = useState(app?.lastContactDate ?? today)
  const [notes, setNotes]                   = useState(app?.notes ?? '')

  // Contacts
  const [contacts, setContacts] = useState(app?.contacts ?? [])
  const [newContact, setNewContact] = useState<Partial<ContactInput>>({})
  const [addingContact, setAddingContact] = useState(false)

  const followupPreview = calcFollowupDate(stage, lastContact)

  async function handleSave() {
    if (!companyName.trim() || !roleTitle.trim()) {
      setError('Company name and role title are required.')
      return
    }
    setSaving(true); setError(null)
    try {
      const input: ApplicationInput = {
        companyName: companyName.trim(),
        roleTitle: roleTitle.trim(),
        jobDescriptionUrl: jdUrl.trim() || undefined,
        stage, status, channel,
        lastContactDate: lastContact,
        notes: notes.trim() || undefined,
      }
      if (app) {
        await updateApplication(app.id, input)
      } else {
        await createApplication(input)
      }
      router.push('/applications')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!app || !confirm(`Delete "${app.companyName} – ${app.roleTitle}"? This can't be undone.`)) return
    setDeleting(true)
    try {
      await deleteApplication(app.id)
      router.push('/applications')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
      setDeleting(false)
    }
  }

  async function handleAddContact() {
    if (!app || !newContact.contactName?.trim()) return
    setAddingContact(true)
    try {
      const c = await createContact({ ...newContact as ContactInput, applicationId: app.id })
      setContacts(prev => [...prev, c])
      setNewContact({})
    } catch (e: any) {
      setError(e.message)
    } finally {
      setAddingContact(false)
    }
  }

  async function handleDeleteContact(id: string) {
    await deleteContact(id)
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-4 animate-fade-up">
      {error && (
        <div className="bento-card p-3 text-sm" style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* Main fields */}
      <div className="bento-card noise p-5 space-y-4">
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 90% 0%, rgba(255,69,0,0.07), transparent)' }}
        />

        <h2 className="font-heading font-bold text-base" style={{ color: 'var(--text-primary)' }}>
          {app ? 'Edit Application' : 'New Application'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Company Name *">
            <input className="crm-input" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Razorpay" />
          </Field>
          <Field label="Role Title *">
            <input className="crm-input" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} placeholder="e.g. SDE Intern" />
          </Field>
        </div>

        <Field label="Job Description URL">
          <input className="crm-input" value={jdUrl} onChange={e => setJdUrl(e.target.value)} placeholder="https://..." type="url" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Stage">
            <select className="crm-input" value={stage} onChange={e => setStage(e.target.value as OutreachStage)}>
              {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className="crm-input" value={status} onChange={e => setStatus(e.target.value as ApplicationStatus)}>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Channel">
            <select className="crm-input" value={channel} onChange={e => setChannel(e.target.value as ContactChannel)}>
              {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Last Contact Date">
            <input className="crm-input" type="date" value={lastContact} onChange={e => setLastContact(e.target.value)} />
          </Field>
          <Field label="Auto Follow-up (preview)">
            <div className="crm-input opacity-70 cursor-default select-none" style={{ color: followupPreview ? 'var(--text-muted)' : 'var(--text-muted)' }}>
              {followupPreview || '—  (no auto date for this stage)'}
            </div>
          </Field>
        </div>

        <Field label="Notes">
          <textarea
            className="crm-input resize-none"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Anything worth remembering..."
          />
        </Field>
      </div>

      {/* Contacts section — only shown when editing an existing app */}
      {app && (
        <div className="bento-card p-5 space-y-3">
          <h3 className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Contacts ({contacts.length})
          </h3>

          {contacts.length > 0 && (
            <div className="space-y-2">
              {contacts.map(c => (
                <div key={c.id} className="flex items-start justify-between gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div className="min-w-0">
                    <p className="font-heading font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>{c.contactName}</p>
                    {c.designation && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.designation}</p>}
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {c.emailAddress && <a href={`mailto:${c.emailAddress}`} className="text-xs" style={{ color: '#FF4500' }}>{c.emailAddress}</a>}
                      {c.linkedinUrl && <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: '#60a5fa' }}>LinkedIn ↗</a>}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteContact(c.id)} className="text-xs mt-1 shrink-0" style={{ color: 'var(--text-muted)' }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Add contact inline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <input className="crm-input text-xs" placeholder="Contact name" value={newContact.contactName ?? ''} onChange={e => setNewContact(p => ({ ...p, contactName: e.target.value }))} />
            <input className="crm-input text-xs" placeholder="Designation (e.g. EM)" value={newContact.designation ?? ''} onChange={e => setNewContact(p => ({ ...p, designation: e.target.value }))} />
            <input className="crm-input text-xs" placeholder="Email" type="email" value={newContact.emailAddress ?? ''} onChange={e => setNewContact(p => ({ ...p, emailAddress: e.target.value }))} />
            <input className="crm-input text-xs" placeholder="LinkedIn URL" type="url" value={newContact.linkedinUrl ?? ''} onChange={e => setNewContact(p => ({ ...p, linkedinUrl: e.target.value }))} />
          </div>
          <button
            onClick={handleAddContact}
            disabled={addingContact || !newContact.contactName?.trim()}
            className={cn('text-xs font-heading font-semibold px-3 py-1.5 rounded-lg transition-all',
              'disabled:opacity-40 disabled:cursor-not-allowed')}
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            {addingContact ? 'Adding…' : '+ Add Contact'}
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-3 pb-20 sm:pb-4">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg font-heading font-bold text-xs text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: '#FF4500', boxShadow: '0 4px 14px rgba(255,69,0,0.3)' }}
          >
            {saving ? 'Saving…' : app ? 'Save Changes' : 'Create Application'}
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg font-heading font-semibold text-xs transition-all"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            Cancel
          </button>
        </div>

        {app && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 rounded-lg font-heading font-semibold text-xs transition-all disabled:opacity-50"
            style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-heading font-semibold tracking-wide" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

// ─── Options ─────────────────────────────────────────────────────────────────
const STAGES = [
  { value: 'INITIAL_PITCH',        label: 'Initial Pitch' },
  { value: 'FOLLOW_UP_1',          label: 'Follow-up 1' },
  { value: 'FOLLOW_UP_2',          label: 'Follow-up 2' },
  { value: 'TECHNICAL_ASSESSMENT', label: 'Technical Assessment' },
  { value: 'INTERVIEW_ROUND',      label: 'Interview Round' },
  { value: 'OFFER',                label: 'Offer 🎉' },
  { value: 'REJECTED',             label: 'Rejected' },
  { value: 'GHOSTED',              label: 'Ghosted' },
]

const STATUSES = [
  { value: 'PENDING',             label: 'Pending' },
  { value: 'AWAITING_ACTION',     label: 'Awaiting Action' },
  { value: 'ACTIVE_INTERVIEWING', label: 'Active Interviewing' },
  { value: 'CLOSED',              label: 'Closed' },
]

const CHANNELS = [
  { value: 'LINKEDIN_DIRECT', label: 'LinkedIn Direct' },
  { value: 'COLD_EMAIL',      label: 'Cold Email' },
  { value: 'TWITTER_X',       label: 'Twitter/X' },
  { value: 'INBOUND',         label: 'Inbound' },
  { value: 'REFERRAL',        label: 'Referral' },
]
