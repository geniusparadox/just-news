'use client';

import { useState, useEffect, useCallback } from 'react';
import ArticleList from './ArticleList';
import LoadingSpinner from './LoadingSpinner';
import { Article } from '@/types';
import { RefreshCw } from 'lucide-react';

interface NewsFeedProps {
  category?: string;
  title: string;
  subtitle: string;
}

export default function NewsFeed({ category = 'general', title, subtitle }: NewsFeedProps) {
  const [country, setCountry] = useState('us');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = useCallback(async (countryCode: string, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams({
        category,
        country: countryCode,
        ...(refresh && { refresh: 'true' }),
      });

      const res = await fetch(`/api/news?${params}`);
      const data = await res.json();

      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => {
    // Get initial country from localStorage
    const saved = localStorage.getItem('news-country') || 'us';
    setCountry(saved);
    fetchNews(saved);

    // Listen for country changes
    const handleCountryChange = () => {
      const updated = localStorage.getItem('news-country') || 'us';
      setCountry(updated);
      fetchNews(updated);
    };

    window.addEventListener('country-change', handleCountryChange);
    return () => window.removeEventListener('country-change', handleCountryChange);
  }, [fetchNews]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {title}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        </div>
        <button
          onClick={() => fetchNews(country, true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <ArticleList articles={articles} />
    </div>
  );
}
