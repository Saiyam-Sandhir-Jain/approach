'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

// "Add" button removed — use the "+ New" button on the Applications page instead
const NAV = [
  { href: '/',         label: 'Dashboard', icon: GridIcon },
  { href: '/approach', label: 'Approach',  icon: CompassIcon },
]

export function Navbar() {
  const path = usePathname()
  const { data: session } = useSession()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [userMenuOpen, setUserMenuOpen]     = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('crm-theme') as 'dark' | 'light' | null
    if (stored) setTheme(stored)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('crm-theme', next)
  }

  return (
    <>
      {/* ── Desktop nav ─────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 hidden sm:flex items-center justify-between px-6 h-14"
        style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)', backdropFilter: 'blur(12px)' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <ApproachLogo />
          <span className="font-heading font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Approach
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all duration-150',
                path === href
                  ? 'text-white bg-white/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={13} />
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon size={14} /> : <MoonIcon size={14} />}
          </button>

          {session?.user && (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-white/5"
                style={{ border: '1px solid var(--border)' }}
              >
                <UserAvatar user={session.user} size={24} />
                <span className="text-xs font-heading font-semibold max-w-[80px] truncate" style={{ color: 'var(--text-secondary)' }}>
                  {session.user.name?.split(' ')[0]}
                </span>
                <ChevronIcon size={10} />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 rounded-xl p-2 z-50"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 16px 40px rgba(0,0,0,0.3)' }}
                >
                  <div className="px-3 py-2 mb-1" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <p className="text-xs font-heading font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{session.user.name}</p>
                    <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{session.user.email}</p>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); setShowLogoutModal(true) }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-heading font-semibold transition-colors hover:bg-white/5"
                    style={{ color: '#f87171' }}
                  >
                    <LogoutIcon size={13} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ── Mobile bottom nav ────────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex sm:hidden items-center justify-around py-2 px-2"
        style={{
          background: 'var(--nav-bg)',
          borderTop: '1px solid var(--nav-border)',
          backdropFilter: 'blur(12px)',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        }}
      >
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all',
              path === href ? '' : 'text-zinc-500'
            )}
            style={path === href ? { color: '#FF4500' } : {}}
          >
            <Icon size={18} />
            <span className="text-[9px] font-heading font-semibold tracking-wide">{label}</span>
          </Link>
        ))}
        {session?.user && (
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-zinc-500"
          >
            <UserAvatar user={session.user} size={20} />
            <span className="text-[9px] font-heading font-semibold tracking-wide truncate max-w-[40px]">
              {session.user.name?.split(' ')[0] ?? 'Me'}
            </span>
          </button>
        )}
      </nav>

      {/* ── Logout confirmation modal ────────────────────────────────────── */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: 'var(--bg-overlay)' }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bento-card noise w-full max-w-xs p-6 space-y-5"
            style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Subtle orange glow */}
            <div
              className="pointer-events-none absolute inset-0 rounded-xl"
              style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,69,0,0.07), transparent)' }}
            />

            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
              style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}
            >
              <LogoutIcon size={18} color="#f87171" />
            </div>

            {/* Copy */}
            <div className="text-center space-y-1">
              <h2 className="font-heading font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                Sign out?
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                You'll need to sign back in with Google to access your pipeline.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 rounded-lg font-heading font-semibold text-xs transition-all hover:opacity-80"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex-1 py-2 rounded-lg font-heading font-bold text-xs text-white transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: '#f87171', boxShadow: '0 4px 14px rgba(248,113,113,0.3)' }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function UserAvatar({ user, size }: { user: { name?: string | null; image?: string | null }; size: number }) {
  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name ?? 'User'}
        width={size}
        height={size}
        className="rounded-full"
        referrerPolicy="no-referrer"
        style={{ width: size, height: size, objectFit: 'cover' }}
      />
    )
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-heading font-bold"
      style={{ width: size, height: size, background: '#FF4500', color: '#fff', fontSize: size * 0.45 }}
    >
      {user.name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

function ApproachLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect width="22" height="22" rx="6" fill="#FF4500" fillOpacity="0.15" />
      <path d="M6 16L11 6L16 16" stroke="#FF4500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13H14" stroke="#FF4500" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function GridIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}
function ListIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <circle cx="3" cy="6" r="1.5" fill="currentColor"/><circle cx="3" cy="12" r="1.5" fill="currentColor"/><circle cx="3" cy="18" r="1.5" fill="currentColor"/>
    </svg>
  )
}
function CompassIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill="currentColor" fillOpacity="0.3"/>
    </svg>
  )
}
function SunIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}
function MoonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}
function ChevronIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}
function LogoutIcon({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}
