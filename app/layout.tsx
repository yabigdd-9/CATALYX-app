import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PwaRegister from '../components/PwaRegister'
import { AuthProvider } from '../components/AuthProvider'
import RouteAwareAssistant from '../components/RouteAwareAssistant'

const metadataBase = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
  } catch {
    return new URL('http://localhost:3000')
  }
})()

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: 'Catalyx Labs | Premium Plant Nutrition and Grow Support',
    template: '%s | Catalyx Labs',
  },
  description: 'Premium plant nutrition, feed guidance, and grow support from Catalyx Labs. Explore the nutrient system, feed charts, product guides, and Grow OS tools.',
  keywords: 'hydroponic nutrients, plant nutrients, A-X PRO, B-X PRO, ROOT-X, Catalyx Labs',
  manifest: '/manifest.json',
  applicationName: 'Catalyx Labs',
  alternates: {
    canonical: '/',
  },
  appleWebApp: {
    capable: true,
    title: 'Catalyx Labs',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website',
    siteName: 'Catalyx Labs',
    title: 'Catalyx Labs | Premium Plant Nutrition and Grow Support',
    description: 'Premium plant nutrition, feed guidance, and grow support from Catalyx Labs.',
    url: '/',
    images: [
      {
        url: '/brand/catalyx/CATALYX_Social_Profile_Icon.png',
        width: 1200,
        height: 1200,
        alt: 'Catalyx Labs brand mark',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catalyx Labs | Premium Plant Nutrition and Grow Support',
    description: 'Premium plant nutrition, feed guidance, and grow support from Catalyx Labs.',
    images: ['/brand/catalyx/CATALYX_Social_Profile_Icon.png'],
  },
  icons: {
    icon: [
      { url: '/brand/catalyx/favicon_32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/catalyx/favicon_128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/brand/catalyx/favicon_512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/brand/catalyx/favicon_180x180.png',
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
      <body className="bg-[#050707] text-slate-50 antialiased">
        <AuthProvider>
          <PwaRegister />
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <RouteAwareAssistant />
        </AuthProvider>
      </body>
    </html>
  )
}
