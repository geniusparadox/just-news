import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Just News - Facts Only, No Opinions',
  description:
    'Get the news without the bias. AI-powered fact extraction removes opinions and presents just the facts.',
  keywords: ['news', 'unbiased', 'facts', 'no opinion', 'objective news', 'just news'],
  openGraph: {
    title: 'Just News - Facts Only, No Opinions',
    description: 'AI-powered fact extraction removes opinions and presents just the facts.',
    siteName: 'Just News',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Just News - Facts Only, No Opinions',
    description: 'AI-powered fact extraction removes opinions and presents just the facts.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} min-h-screen bg-zinc-50 font-sans antialiased dark:bg-zinc-950`}
      >
        <Header />
        <CategoryNav />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
