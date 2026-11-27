import './globals.css'
import { Inter } from 'next/font/google'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ChatBot AI - Add Intelligent Chatbot to Your Website',
  description: 'Build and deploy AI-powered chatbots with custom knowledge base. No coding required.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://cdn.paddle.com/paddle/v2/paddle.js"
          strategy="afterInteractive"
        />
        <Script id="paddle-init" strategy="afterInteractive">
          {`
            if (typeof Paddle !== 'undefined') {
              Paddle.Initialize({
                token: 'live_ce1e56ad5ff88ee1e6e1d49fb',
                checkout: {
                  settings: {
                    displayMode: "overlay",
                    theme: "light"
                  }
                }
              });
            }
          `}
        </Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
