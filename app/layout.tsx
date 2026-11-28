import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://chatbot-saas-tau-sandy.vercel.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "ChatBot AI - Add Intelligent Chatbot to Your Website",
  description:
    "Build and deploy AI-powered chatbots trained on your own website content. No coding required.",
  openGraph: {
    title: "ChatBot AI - Add Intelligent Chatbot to Your Website",
    description:
      "Turn your website into an AI chatbot that answers customer questions 24/7.",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/twitter-card.png"] },
  icons: { icon: "/logo-icon.svg", apple: "/apple-touch-icon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Paddle.js is initialised on demand by PaddleButton (token/env come from env vars) */}
        {process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && (
          <Script
            src="https://cdn.paddle.com/paddle/v2/paddle.js"
            strategy="afterInteractive"
          />
        )}
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
