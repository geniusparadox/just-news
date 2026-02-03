'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface NewsContextType {
  country: string;
  setCountry: (country: string) => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState('us');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('news-country');
    if (saved) {
      setCountryState(saved);
    }
    setMounted(true);
  }, []);

  const setCountry = (newCountry: string) => {
    setCountryState(newCountry);
    localStorage.setItem('news-country', newCountry);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NewsContext.Provider value={{ country, setCountry }}>
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within NewsProvider');
  }
  return context;
}
