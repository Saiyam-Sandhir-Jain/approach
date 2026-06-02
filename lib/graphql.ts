import type {
  Application, Contact, DashboardMetrics,
  ApplicationInput, ContactInput,
} from '@/types/crm'

const GQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:8000/graphql'

// Get user ID from session cookie (passed as header to backend for data isolation)
async function getUserId(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/session')
    const session = await res.json()
    return session?.user?.id ?? session?.user?.email ?? null
  } catch {
    return null
  }
}

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const userId = await getUserId()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (userId) headers['X-User-Id'] = userId

  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data as T
}

// ─── Fragments ───────────────────────────────────────────────────────────────
const CONTACT_FRAGMENT = `
  id applicationId contactName designation emailAddress linkedinUrl notes
`
const APP_FRAGMENT = `
  id companyName roleTitle jobDescriptionUrl
  stage status channel
  lastContactDate nextFollowupDate
  resumeBucketPath notes createdAt
  contacts { ${CONTACT_FRAGMENT} }
`

// ─── Queries ─────────────────────────────────────────────────────────────────
export async function fetchApplications(): Promise<Application[]> {
  const data = await gql<{ applications: Application[] }>(`
    query { applications { ${APP_FRAGMENT} } }
  `)
  return data.applications
}

export async function fetchApplication(id: string): Promise<Application> {
  const data = await gql<{ application: Application }>(
    `query($id: ID!) { application(id: $id) { ${APP_FRAGMENT} } }`,
    { id }
  )
  return data.application
}

export async function fetchMetrics(): Promise<DashboardMetrics> {
  const data = await gql<{ dashboardMetrics: DashboardMetrics }>(`
    query {
      dashboardMetrics {
        total activeInterviewing ghosted offers
        dueTodayCount overdueCount responseRate
        stageBreakdown { stage count }
      }
    }
  `)
  return data.dashboardMetrics
}

// ─── Mutations ───────────────────────────────────────────────────────────────
export async function createApplication(input: ApplicationInput): Promise<Application> {
  const data = await gql<{ createApplication: Application }>(
    `mutation($input: ApplicationInput!) {
      createApplication(input: $input) { ${APP_FRAGMENT} }
    }`,
    { input }
  )
  return data.createApplication
}

export async function updateApplication(id: string, input: ApplicationInput): Promise<Application> {
  const data = await gql<{ updateApplication: Application }>(
    `mutation($id: ID!, $input: ApplicationInput!) {
      updateApplication(id: $id, input: $input) { ${APP_FRAGMENT} }
    }`,
    { id, input }
  )
  return data.updateApplication
}

export async function deleteApplication(id: string): Promise<boolean> {
  const data = await gql<{ deleteApplication: boolean }>(
    `mutation($id: ID!) { deleteApplication(id: $id) }`,
    { id }
  )
  return data.deleteApplication
}

export async function createContact(input: ContactInput): Promise<Contact> {
  const data = await gql<{ createContact: Contact }>(
    `mutation($input: ContactInput!) {
      createContact(input: $input) { ${CONTACT_FRAGMENT} }
    }`,
    { input }
  )
  return data.createContact
}

export async function updateContact(id: string, input: ContactInput): Promise<Contact> {
  const data = await gql<{ updateContact: Contact }>(
    `mutation($id: ID!, $input: ContactInput!) {
      updateContact(id: $id, input: $input) { ${CONTACT_FRAGMENT} }
    }`,
    { id, input }
  )
  return data.updateContact
}

export async function deleteContact(id: string): Promise<boolean> {
  const data = await gql<{ deleteContact: boolean }>(
    `mutation($id: ID!) { deleteContact(id: $id) }`,
    { id }
  )
  return data.deleteContact
}
