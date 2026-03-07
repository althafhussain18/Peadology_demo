import type { Metadata } from 'next'
import { Nunito, Fredoka } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthSessionProvider } from '@/components/session-provider'
import './globals.css'

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: '--font-nunito'
});

const fredoka = Fredoka({ 
  subsets: ["latin"],
  variable: '--font-fredoka'
});

export const metadata: Metadata = {
  title: 'LearnQuest - Fun Learning for Kids',
  description: 'An engaging educational platform for students with interactive lessons, video tutorials, and exciting courses.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${fredoka.variable} font-sans antialiased`}>
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
