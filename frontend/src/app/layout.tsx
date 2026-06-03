import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Serif_Display, Poppins, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/layout/Navigation'
import { Providers } from './providers'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-geist',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'RentLoop — Sri Lanka\'s Peer-to-Peer Rental Marketplace',
    template: '%s | RentLoop',
  },
  description: 'Discover, rent, and list everything from cameras to villas across Sri Lanka. Trusted, verified, beautiful.',
  keywords: ['rent', 'sri lanka', 'marketplace', 'rental', 'p2p', 'colombo'],
  openGraph: {
    type: 'website',
    locale: 'en_LK',
    siteName: 'RentLoop',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FFFFFF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${cormorant.variable} ${dmSerif.variable} ${poppins.variable} ${jetbrains.variable} font-sans`}>
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  )
}
