import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bento AI Chat Demo - Add AI-Powered Chat to Any App",
  description: "Experience Bento's powerful AI chat capabilities. Features 100+ LLM models, document RAG, real-time streaming, and seamless integration. Try the live demo now!",
  keywords: "AI chat, chatbot, LLM, RAG, document chat, AI integration, OpenRouter, GPT, Claude, Bento",
  authors: [{ name: "Bento Team" }],
  openGraph: {
    title: "Bento AI Chat Demo - Powerful AI Integration Made Simple",
    description: "Add AI-powered chat to your app in minutes. Features 100+ models, document RAG, and real-time streaming.",
    url: "https://nextjs-demo-fawn-three.vercel.app",
    siteName: "Bento Demo",
    type: "website",
    images: [
      {
        url: "https://nextjs-demo-fawn-three.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bento AI Chat Demo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bento AI Chat Demo",
    description: "Add AI-powered chat to any app in minutes. Try the live demo!",
    images: ["https://nextjs-demo-fawn-three.vercel.app/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://nextjs-demo-fawn-three.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
