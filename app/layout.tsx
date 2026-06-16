import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PwaRegister from '../components/PwaRegister'
import { AuthProvider } from '../components/AuthProvider'
import AIGrowTipWidget from '../components/AIGrowTipWidget'

export const metadata: Metadata = {
  title: 'Catalyx Labs | Precision Cultivation OS',
  description: 'A premium cultivation operating system, intelligent feeding assistant, product education platform, grow optimisation engine, and smart grow journal.',
  keywords: 'hydroponic nutrients, plant nutrients, A-X PRO, B-X PRO, ROOT-X, Catalyx Labs',
  manifest: '/manifest.json',
  applicationName: 'Catalyx Labs',
  appleWebApp: {
    capable: true,
    title: 'Catalyx Labs',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/brand/official/logo-app-icon-official.png',
    apple: '/brand/official/logo-app-icon-official.png',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#c8f500',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <PwaRegister />
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <AIGrowTipWidget />
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  )
}
