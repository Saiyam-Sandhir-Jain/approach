'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/')
    }
  }, [status, router])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl: '/' })
  }

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#FF4500', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg-page)' }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 80%, rgba(255,69,0,0.08), transparent)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm mx-auto px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <ApproachIcon />
          </div>
          <h1 className="font-heading font-bold text-4xl tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
            Approach
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Your off-campus job hunt, organised.
          </p>
        </div>

        {/* Card */}
        <div
          className="bento-card p-8 space-y-6"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
        >
          <div className="text-center space-y-1">
            <h2 className="font-heading font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
              Welcome back
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Sign in to access your pipeline
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl font-heading font-semibold text-sm transition-all duration-150 active:scale-95 disabled:opacity-60"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }} />
            ) : (
              <GoogleIcon />
            )}
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>

          <p className="text-center text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Your data is private to your account.<br />
            No spam, no ads.
          </p>
        </div>

        <p className="text-center text-[10px] mt-6" style={{ color: 'var(--text-muted)' }}>
          Built for B.Tech students going off-campus.
        </p>
      </div>
    </div>
  )
}

function ApproachIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill="#FF4500" fillOpacity="0.15" />
      <path d="M10 24L18 10L26 24" stroke="#FF4500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 20H23" stroke="#FF4500" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}
