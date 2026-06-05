import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FAKE SHIELD — AI-Driven Social Network Intelligence System',
  description: 'Advanced AI platform for fake news detection, cyber threat analysis, bot detection, and real-time security alerts. Powered by Gemini AI.',
  keywords: ['fake news', 'AI security', 'phishing detection', 'bot detection', 'cyber threat', 'intelligence'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
