'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import CountrySelector from './CountrySelector';

export default function Header() {
  const [country, setCountryState] = useState('us');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('news-country');
    if (saved) {
      setCountryState(saved);
    }
    setMounted(true);

    // Listen for country changes from other components
    const handleStorage = () => {
      const updated = localStorage.getItem('news-country');
      if (updated) setCountryState(updated);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setCountry = (newCountry: string) => {
    setCountryState(newCountry);
    localStorage.setItem('news-country', newCountry);
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('country-change'));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Just <span className="text-blue-600 dark:text-blue-400">News</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <p className="hidden text-sm text-zinc-500 dark:text-zinc-400 md:block">
            Facts only. No opinions.
          </p>
          {mounted && (
            <CountrySelector selectedCountry={country} onCountryChange={setCountry} />
          )}
        </div>
      </div>
    </header>
  );
}
