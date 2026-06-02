import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Approach',
  description: 'Your off-campus job hunt, organised.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Approach',
  },
}

export const viewport: Viewport = {
  themeColor: '#FF4500',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${syne.variable} ${dmSans.variable} font-body min-h-screen`}>
        <ThemeInit />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

function ThemeInit() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            const t = localStorage.getItem('crm-theme') || 'dark';
            document.documentElement.setAttribute('data-theme', t);
          } catch(e) {}
        `,
      }}
    />
  )
}
