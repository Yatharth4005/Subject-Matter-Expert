import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Geist_Mono } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SME Agent Platform — Subject Matter Expert AI',
  description:
    'Multimodal AI agent platform with voice, video, and web navigation. Powered by Gemini Live API & Google ADK.',
  keywords: ['AI', 'Agent', 'Gemini', 'Multimodal', 'Tutor', 'Education'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
