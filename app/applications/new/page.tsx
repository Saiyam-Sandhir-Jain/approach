import { Navbar } from '@/components/Navbar'
import { ApplicationForm } from '@/components/ApplicationForm'

export default function NewApplicationPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-20 pb-24 sm:pb-8">
        <div className="mb-4">
          <h1 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            New Application
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Track a new outreach or application</p>
        </div>
        <ApplicationForm />
      </main>
    </div>
  )
}
