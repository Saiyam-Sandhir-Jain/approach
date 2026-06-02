'use client'

import { useState, useMemo } from 'react'
import { Navbar } from '@/components/Navbar'

type Role = 'Recruiter' | 'HR Manager' | 'Talent Acquisition' | 'Engineering Manager' | 'Hiring Manager' | 'People Ops'
type Domain = 'Tech' | 'Product' | 'Design' | 'Data' | 'Finance' | 'Marketing' | 'All'
type Platform = 'LinkedIn' | 'Twitter/X' | 'Email'

interface Recruiter {
  id: string
  name: string
  role: Role
  company: string
  domain: Domain[]
  location: string
  platform: Platform[]
  linkedinUrl?: string
  twitterUrl?: string
  email?: string
  tips: string
  responseRate: 'High' | 'Medium' | 'Low'
  hiresFor: string[]
  avatar: string // initials
  color: string
}

const RECRUITERS: Recruiter[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'Talent Acquisition',
    company: 'Google',
    domain: ['Tech', 'Product'],
    location: 'Bangalore, India',
    platform: ['LinkedIn'],
    linkedinUrl: 'https://linkedin.com/search/results/people/?keywords=talent+acquisition+google+bangalore',
    tips: 'Search "Talent Acquisition Google Bangalore" on LinkedIn. Message with your resume link and mention specific Google products you use. Keep it under 150 words.',
    responseRate: 'Medium',
    hiresFor: ['SWE', 'APM', 'Data Analyst'],
    avatar: 'PS',
    color: '#4285F4',
  },
  {
    id: '2',
    name: 'Amit Verma',
    role: 'Engineering Manager',
    company: 'Flipkart',
    domain: ['Tech'],
    location: 'Bangalore, India',
    platform: ['LinkedIn', 'Twitter/X'],
    linkedinUrl: 'https://linkedin.com/search/results/people/?keywords=engineering+manager+flipkart',
    twitterUrl: 'https://twitter.com/search?q=hiring+flipkart+engineering&f=user',
    tips: 'EMs at Flipkart often hire directly. Reach out after engaging with their posts. Show portfolio/GitHub. Mention interest in e-commerce scale problems.',
    responseRate: 'High',
    hiresFor: ['Backend SWE', 'Full-Stack', 'SDE-1'],
    avatar: 'AV',
    color: '#F9A825',
  },
  {
    id: '3',
    name: 'Neha Gupta',
    role: 'HR Manager',
    company: 'Microsoft India',
    domain: ['Tech', 'Product', 'Design'],
    location: 'Hyderabad, India',
    platform: ['LinkedIn'],
    linkedinUrl: 'https://linkedin.com/search/results/people/?keywords=HR+manager+Microsoft+Hyderabad',
    tips: 'Use LinkedIn Premium InMail for better open rates. Reference Microsoft products you\'ve built on (Azure, Teams, etc.). Mention MAANG aspirations professionally.',
    responseRate: 'Medium',
    hiresFor: ['SWE', 'PM', 'UX Designer'],
    avatar: 'NG',
    color: '#00BCF2',
  },
  {
    id: '4',
    name: 'Rohit Mehta',
    role: 'Recruiter',
    company: 'Razorpay',
    domain: ['Tech', 'Finance'],
    location: 'Bangalore, India',
    platform: ['LinkedIn', 'Email'],
    linkedinUrl: 'https://linkedin.com/search/results/people/?keywords=recruiter+razorpay',
    tips: 'Razorpay recruiters respond well to candidates with fintech projects. Open their jobs page, apply, and follow up via LinkedIn the same day.',
    responseRate: 'High',
    hiresFor: ['Backend', 'DevOps', 'Product Analytics'],
    avatar: 'RM',
    color: '#2F80ED',
  },
  {
    id: '5',
    name: 'Sanya Kapoor',
    role: 'Talent Acquisition',
    company: 'Swiggy',
    domain: ['Tech', 'Product', 'Data'],
    location: 'Bangalore, India',
    platform: ['LinkedIn'],
    linkedinUrl: 'https://linkedin.com/search/results/people/?keywords=talent+acquisition+swiggy',
    tips: 'Swiggy TA team is very active on LinkedIn. React to their posts about company culture, then connect. Mention interest in food-tech and logistics challenges.',
    responseRate: 'High',
    hiresFor: ['SWE', 'Data Scientist', 'PM'],
    avatar: 'SK',
    color: '#FC8019',
  },
  {
    id: '6',
    name: 'Arjun Nair',
    role: 'Engineering Manager',
    company: 'Zomato',
    domain: ['Tech'],
    location: 'Gurugram, India',
    platform: ['LinkedIn', 'Twitter/X'],
    linkedinUrl: 'https://linkedin.com/search/results/people/?keywords=engineering+manager+zomato',
    twitterUrl: 'https://twitter.com/search?q=hiring+zomato+SWE&f=user',
    tips: 'Zomato EMs often share open roles on Twitter/X. Follow hashtag #ZomatoHiring. Show projects with real-time data, maps, or recommendation systems.',
    responseRate: 'Medium',
    hiresFor: ['SDE-1', 'SDE-2', 'ML Engineer'],
    avatar: 'AN',
    color: '#E23744',
  },
  {
    id: '7',
    name: 'Divya Krishnan',
    role: 'People Ops',
    company: 'CRED',
    domain: ['Tech', 'Design', 'Product'],
    location: 'Bangalore, India',
    platform: ['LinkedIn'],
    linkedinUrl: 'https://linkedin.com/search/results/people/?keywords=people+operations+CRED+fintech',
    tips: 'CRED is design-forward. Show strong product sense and design sensibility even in engineering roles. Their team engages on Dribbble and Behance too.',
    responseRate: 'Medium',
    hiresFor: ['SWE', 'Product Designer', 'PM'],
    avatar: 'DK',
    color: '#6C63FF',
  },
  {
    id: '8',
    name: 'Vikram Bose',
    role: 'Talent Acquisition',
    company: 'Meesho',
    domain: ['Tech', 'Data'],
    location: 'Bangalore, India',
    platform: ['LinkedIn'],
    linkedinUrl: 'https://linkedin.com/search/results/people/?keywords=talent+acquisition+meesho',
    tips: 'Meesho is scaling fast. Frame experience around impact metrics and scale. Their TA team appreciates candidates who show interest in social commerce problems.',
    responseRate: 'High',
    hiresFor: ['SWE', 'Data Engineer', 'SDE-1'],
    avatar: 'VB',
    color: '#9B59B6',
  },
  {
    id: '9',
    name: 'Ananya Singh',
    role: 'Recruiter',
    company: 'Amazon India',
    domain: ['Tech', 'Product', 'Data', 'Marketing'],
    location: 'Hyderabad / Bangalore, India',
    platform: ['LinkedIn', 'Email'],
    linkedinUrl: 'https://linkedin.com/search/results/people/?keywords=recruiter+amazon+india',
    tips: 'Amazon recruiters look for Leadership Principles fit. Frame every message around LPs (Customer Obsession, Ownership, etc.). Apply on jobs.amazon.com first.',
    responseRate: 'Low',
    hiresFor: ['SDE-1', 'SDE-2', 'APM', 'BI Engineer'],
    avatar: 'AS',
    color: '#FF9900',
  },
  {
    id: '10',
    name: 'Rajan Mathur',
    role: 'Hiring Manager',
    company: 'PhonePe',
    domain: ['Tech', 'Finance'],
    location: 'Bangalore, India',
    platform: ['LinkedIn'],
    linkedinUrl: 'https://linkedin.com/search/results/people/?keywords=hiring+manager+PhonePe',
    tips: 'PhonePe values payments domain knowledge. Show any project involving transactions, UPI, or financial systems. Their team is responsive to personalised outreach.',
    responseRate: 'High',
    hiresFor: ['Backend SWE', 'Platform Engineer', 'Data Analyst'],
    avatar: 'RM',
    color: '#5F259F',
  },
  {
    id: '11',
    name: 'Pooja Iyer',
    role: 'Talent Acquisition',
    company: 'Paytm',
    domain: ['Tech', 'Finance', 'Product'],
    location: 'Noida, India',
    platform: ['LinkedIn', 'Twitter/X'],
    linkedinUrl: 'https://linkedin.com/search/results/people/?keywords=talent+acquisition+Paytm',
    tips: 'Paytm TA team posts openings on LinkedIn Jobs every week. Set job alerts. Best to apply and then send a direct LinkedIn message referencing the job ID.',
    responseRate: 'Medium',
    hiresFor: ['SWE', 'Product Manager', 'Analyst'],
    avatar: 'PI',
    color: '#002970',
  },
  {
    id: '12',
    name: 'Karan Bajaj',
    role: 'Engineering Manager',
    company: 'Ola',
    domain: ['Tech', 'Data'],
    location: 'Bangalore, India',
    platform: ['LinkedIn', 'Twitter/X'],
    linkedinUrl: 'https://linkedin.com/search/results/people/?keywords=engineering+manager+ola+electric',
    tips: 'Ola EMs are active on LinkedIn. Strong interest in maps, routing algorithms, IoT, and EV tech. Show any projects related to mobility or real-time systems.',
    responseRate: 'Medium',
    hiresFor: ['SDE-1', 'ML Engineer', 'Platform'],
    avatar: 'KB',
    color: '#1C1C1E',
  },
]

const DOMAINS: Domain[] = ['All', 'Tech', 'Product', 'Design', 'Data', 'Finance', 'Marketing']
const ROLES: Role[] = ['Recruiter', 'HR Manager', 'Talent Acquisition', 'Engineering Manager', 'Hiring Manager', 'People Ops']
const RESPONSE_COLORS = {
  High: '#4ade80',
  Medium: '#fbbf24',
  Low: '#f87171',
}

export default function ApproachPage() {
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState<Domain>('All')
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')
  const [platformFilter, setPlatformFilter] = useState<Platform | ''>('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = [...RECRUITERS]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q) ||
        r.hiresFor.some(h => h.toLowerCase().includes(q))
      )
    }
    if (domainFilter !== 'All') list = list.filter(r => r.domain.includes(domainFilter))
    if (roleFilter) list = list.filter(r => r.role === roleFilter)
    if (platformFilter) list = list.filter(r => r.platform.includes(platformFilter))
    return list
  }, [search, domainFilter, roleFilter, platformFilter])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Navbar />

      <main className="max-w-crm mx-auto px-4 pt-20 pb-24 sm:pb-8 space-y-5 animate-stagger">

        {/* Header */}
        <div className="bento-card p-6 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 60% 80% at 0% 0%, rgba(255,69,0,0.08), transparent)' }} />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🧭</span>
              <h1 className="font-heading font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
                Approach
              </h1>
            </div>
            <p className="text-sm max-w-xl" style={{ color: 'var(--text-secondary)' }}>
              Curated list of recruiters, hiring managers, and talent leads at top Indian tech companies.
              Find the right person, pick the right platform, and send a personalised message that lands.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <Pill label={`${RECRUITERS.length} contacts`} color="#FF4500" />
              <Pill label="India-focused" color="#4ade80" />
              <Pill label="Updated May 2025" color="#a1a1aa" />
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bento-card p-4 space-y-3">
          <input
            type="text"
            placeholder="Search by name, company, or role (e.g. SWE, PM, Data)…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="crm-input"
          />
          <div className="flex flex-wrap gap-2">
            {/* Domain filter */}
            <div className="flex items-center gap-1 flex-wrap">
              {DOMAINS.map(d => (
                <button
                  key={d}
                  onClick={() => setDomainFilter(d)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-heading font-semibold transition-all"
                  style={domainFilter === d
                    ? { background: '#FF4500', color: '#fff' }
                    : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                  }
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as Role | '')}
              className="crm-input"
              style={{ width: 'auto', padding: '4px 10px', fontSize: '11px' }}
            >
              <option value="">All roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {/* Platform filter */}
            <select
              value={platformFilter}
              onChange={e => setPlatformFilter(e.target.value as Platform | '')}
              className="crm-input"
              style={{ width: 'auto', padding: '4px 10px', fontSize: '11px' }}
            >
              <option value="">All platforms</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Twitter/X">Twitter/X</option>
              <option value="Email">Email</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs font-heading" style={{ color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {RECRUITERS.length} contacts
        </p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(recruiter => (
            <RecruiterCard
              key={recruiter.id}
              recruiter={recruiter}
              expanded={expanded === recruiter.id}
              onToggle={() => setExpanded(expanded === recruiter.id ? null : recruiter.id)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bento-card p-10 text-center">
            <p className="text-2xl mb-2">🔍</p>
            <p className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>No results</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters.</p>
          </div>
        )}

        {/* Tips banner */}
        <div className="bento-card p-5" style={{ border: '1px solid rgba(255,69,0,0.2)' }}>
          <h3 className="font-heading font-semibold text-xs tracking-widest uppercase mb-3" style={{ color: '#FF4500' }}>
            📌 Cold outreach best practices
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: '✍️', title: 'Personalise every message', desc: 'Reference a specific product, blog post, or company achievement. Never copy-paste a template.' },
              { icon: '📏', title: 'Keep it under 150 words', desc: 'Introduce yourself, state the role you\'re interested in, share 1 relevant achievement, and ask for 10 mins.' },
              { icon: '⏰', title: 'Follow up once, max twice', desc: 'Wait 5-7 days before following up. After two attempts with no reply, move on gracefully.' },
            ].map(tip => (
              <div key={tip.title} className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                <p className="text-base mb-1">{tip.icon}</p>
                <p className="font-heading font-semibold text-xs mb-1" style={{ color: 'var(--text-primary)' }}>{tip.title}</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function RecruiterCard({
  recruiter,
  expanded,
  onToggle,
}: {
  recruiter: Recruiter
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div
      className="bento-card transition-all duration-200 cursor-pointer group"
      style={expanded ? { border: '1px solid rgba(255,69,0,0.35)', boxShadow: '0 0 0 1px rgba(255,69,0,0.15)' } : {}}
      onClick={onToggle}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-bold text-xs text-white shrink-0"
            style={{ background: recruiter.color, opacity: 0.9 }}
          >
            {recruiter.avatar}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {recruiter.name}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {recruiter.role} · {recruiter.company}
                </p>
              </div>
              {/* Response rate */}
              <span
                className="text-[9px] font-heading font-bold px-2 py-0.5 rounded-full shrink-0"
                style={{
                  background: `${RESPONSE_COLORS[recruiter.responseRate]}22`,
                  color: RESPONSE_COLORS[recruiter.responseRate],
                  border: `1px solid ${RESPONSE_COLORS[recruiter.responseRate]}44`,
                }}
              >
                {recruiter.responseRate}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {recruiter.platform.map(p => (
                <PlatformBadge key={p} platform={p} />
              ))}
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {recruiter.location}
              </span>
            </div>

            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {recruiter.hiresFor.slice(0, 3).map(h => (
                <span
                  key={h}
                  className="text-[9px] font-heading px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 space-y-3 border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}
            onClick={e => e.stopPropagation()}>

            <div className="p-3 rounded-lg text-[11px] leading-relaxed" style={{ background: 'rgba(255,69,0,0.06)', border: '1px solid rgba(255,69,0,0.15)', color: 'var(--text-secondary)' }}>
              <span className="font-heading font-semibold text-[10px] uppercase tracking-wider" style={{ color: '#FF4500' }}>
                💡 Tip
              </span>
              <br />
              {recruiter.tips}
            </div>

            <div className="flex gap-2 flex-wrap">
              {recruiter.linkedinUrl && (
                <a
                  href={recruiter.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all hover:opacity-80 active:scale-95"
                  style={{ background: '#0A66C2', color: '#fff' }}
                >
                  <LinkedInIcon size={12} />
                  Search on LinkedIn
                </a>
              )}
              {recruiter.twitterUrl && (
                <a
                  href={recruiter.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all hover:opacity-80 active:scale-95"
                  style={{ background: '#1a1a1a', color: '#fff' }}
                >
                  <XIcon size={12} />
                  Search on X
                </a>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end mt-2">
          <span className="text-[9px] font-heading" style={{ color: 'var(--text-muted)' }}>
            {expanded ? 'Hide details ↑' : 'View tips ↓'}
          </span>
        </div>
      </div>
    </div>
  )
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const colors: Record<Platform, { bg: string; text: string }> = {
    'LinkedIn': { bg: '#0A66C222', text: '#0A66C2' },
    'Twitter/X': { bg: '#1a1a1a33', text: '#a1a1aa' },
    'Email': { bg: '#4ade8022', text: '#4ade80' },
  }
  const c = colors[platform]
  return (
    <span
      className="text-[9px] font-heading font-bold px-1.5 py-0.5 rounded"
      style={{ background: c.bg, color: c.text }}
    >
      {platform}
    </span>
  )
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {label}
    </span>
  )
}

function LinkedInIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
    </svg>
  )
}

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}
