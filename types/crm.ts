export type OutreachStage =
  | 'INITIAL_PITCH'
  | 'FOLLOW_UP_1'
  | 'FOLLOW_UP_2'
  | 'TECHNICAL_ASSESSMENT'
  | 'INTERVIEW_ROUND'
  | 'OFFER'
  | 'REJECTED'
  | 'GHOSTED'

export type ApplicationStatus =
  | 'PENDING'
  | 'AWAITING_ACTION'
  | 'ACTIVE_INTERVIEWING'
  | 'CLOSED'

export type ContactChannel =
  | 'LINKEDIN_DIRECT'
  | 'COLD_EMAIL'
  | 'TWITTER_X'
  | 'INBOUND'
  | 'REFERRAL'

export interface Contact {
  id: string
  applicationId: string
  contactName: string
  designation?: string
  emailAddress?: string
  linkedinUrl?: string
  notes?: string
}

export interface Application {
  id: string
  companyName: string
  roleTitle: string
  jobDescriptionUrl?: string
  stage: OutreachStage
  status: ApplicationStatus
  channel: ContactChannel
  lastContactDate: string
  nextFollowupDate?: string
  resumeBucketPath?: string
  notes?: string
  contacts: Contact[]
  createdAt: string
}

export interface ApplicationInput {
  companyName: string
  roleTitle: string
  jobDescriptionUrl?: string
  stage: OutreachStage
  status: ApplicationStatus
  channel: ContactChannel
  lastContactDate: string
  notes?: string
}

export interface ContactInput {
  applicationId: string
  contactName: string
  designation?: string
  emailAddress?: string
  linkedinUrl?: string
  notes?: string
}

export interface StageStat {
  stage: string
  count: number
}

export interface DashboardMetrics {
  total: number
  activeInterviewing: number
  ghosted: number
  offers: number
  dueTodayCount: number
  overdueCount: number
  responseRate: number
  stageBreakdown: StageStat[]
}

export const STAGE_LABELS: Record<OutreachStage, string> = {
  INITIAL_PITCH: 'Initial Pitch',
  FOLLOW_UP_1: 'Follow-up 1',
  FOLLOW_UP_2: 'Follow-up 2',
  TECHNICAL_ASSESSMENT: 'Technical',
  INTERVIEW_ROUND: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  GHOSTED: 'Ghosted',
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: 'Pending',
  AWAITING_ACTION: 'Awaiting',
  ACTIVE_INTERVIEWING: 'Interviewing',
  CLOSED: 'Closed',
}

export const CHANNEL_LABELS: Record<ContactChannel, string> = {
  LINKEDIN_DIRECT: 'LinkedIn',
  COLD_EMAIL: 'Cold Email',
  TWITTER_X: 'Twitter/X',
  INBOUND: 'Inbound',
  REFERRAL: 'Referral',
}
