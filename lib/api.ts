import type {
  Application, Contact, DashboardMetrics,
  ApplicationInput, ContactInput,
} from '@/types/crm'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const API_KEY  = process.env.NEXT_PUBLIC_BACKEND_API_KEY ?? ''

async function getUserId(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/session')
    const session = await res.json()
    return session?.user?.id ?? session?.user?.email ?? null
  } catch {
    return null
  }
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const userId  = await getUserId()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }
  if (userId) headers['X-User-Id'] = userId
  if (API_KEY)  headers['X-Api-Key'] = API_KEY

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? `Request failed: ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ── Serialisation helpers (camelCase ↔ snake_case) ────────────────────────────

function appToBody(input: ApplicationInput) {
  return {
    company_name:        input.companyName,
    role_title:          input.roleTitle,
    stage:               input.stage,
    status:              input.status,
    channel:             input.channel,
    last_contact_date:   input.lastContactDate,
    job_description_url: input.jobDescriptionUrl ?? null,
    notes:               input.notes ?? null,
  }
}

function contactToBody(input: ContactInput) {
  return {
    application_id: input.applicationId,
    contact_name:   input.contactName,
    designation:    input.designation ?? null,
    email_address:  input.emailAddress ?? null,
    linkedin_url:   input.linkedinUrl  ?? null,
    notes:          input.notes        ?? null,
  }
}

// ── Applications ──────────────────────────────────────────────────────────────

export async function fetchApplications(): Promise<Application[]> {
  return api<Application[]>('/applications')
}

export async function fetchApplication(id: string): Promise<Application> {
  return api<Application>(`/applications/${id}`)
}

export async function createApplication(input: ApplicationInput): Promise<Application> {
  return api<Application>('/applications', {
    method: 'POST',
    body: JSON.stringify(appToBody(input)),
  })
}

export async function updateApplication(id: string, input: ApplicationInput): Promise<Application> {
  return api<Application>(`/applications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(appToBody(input)),
  })
}

export async function deleteApplication(id: string): Promise<void> {
  return api<void>(`/applications/${id}`, { method: 'DELETE' })
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function fetchMetrics(): Promise<DashboardMetrics> {
  return api<DashboardMetrics>('/dashboard/metrics')
}

// ── Contacts ──────────────────────────────────────────────────────────────────

export async function createContact(input: ContactInput): Promise<Contact> {
  return api<Contact>('/contacts', {
    method: 'POST',
    body: JSON.stringify(contactToBody(input)),
  })
}

export async function updateContact(id: string, input: ContactInput): Promise<Contact> {
  return api<Contact>(`/contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(contactToBody(input)),
  })
}

export async function deleteContact(id: string): Promise<void> {
  return api<void>(`/contacts/${id}`, { method: 'DELETE' })
}
