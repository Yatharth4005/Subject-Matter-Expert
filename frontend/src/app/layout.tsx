import type { Metadata } from 'next';
import { Lora, Plus_Jakarta_Sans } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';

const lora = Lora({
  variable: '--font-serif',
  subsets: ['latin'],
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
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
      <body className={`${plusJakartaSans.variable} ${lora.variable}`}>
        {children}
      </body>
    </html>
  );
}
