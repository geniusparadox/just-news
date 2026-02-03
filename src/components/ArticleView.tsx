'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ExternalLink, Clock, User, Sparkles, FileText } from 'lucide-react';
import { Article } from '@/types';
import { formatDate } from '@/lib/utils';

interface ArticleViewProps {
  article: Article;
}

export default function ArticleView({ article: initialArticle }: ArticleViewProps) {
  const [article, setArticle] = useState(initialArticle);
  const [extractingContent, setExtractingContent] = useState(false);
  const [extractingFacts, setExtractingFacts] = useState(false);
  const [showFacts, setShowFacts] = useState(true);
  const [status, setStatus] = useState('');

  // Check if content is truncated
  const isTruncated = article.original_content?.includes('[+') &&
                      article.original_content?.includes('chars]');

  useEffect(() => {
    // Auto-extract full content if truncated, then extract facts
    const processArticle = async () => {
      let currentContent = article.original_content;

      // Step 1: Extract full content if truncated
      if (isTruncated) {
        setExtractingContent(true);
        setStatus('Fetching full article...');

        try {
          const res = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleId: article.id }),
          });

          const data = await res.json();

          if (data.success && data.content) {
            currentContent = data.content;
            setArticle((prev) => ({
              ...prev,
              original_content: data.content,
              facts_only: null,
              processed: false,
            }));
          }
        } catch (error) {
          console.error('Error extracting content:', error);
        } finally {
          setExtractingContent(false);
        }
      }

      // Step 2: Extract facts if not already done
      if (!article.facts_only && !article.processed) {
        setExtractingFacts(true);
        setStatus('Extracting facts with AI...');

        try {
          const res = await fetch('/api/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleId: article.id }),
          });

          const data = await res.json();

          if (data.success && data.facts) {
            setArticle((prev) => ({
              ...prev,
              facts_only: data.facts,
              processed: true,
            }));
          }
        } catch (error) {
          console.error('Error extracting facts:', error);
        } finally {
          setExtractingFacts(false);
          setStatus('');
        }
      }
    };

    processArticle();
  }, []);

  const extractFacts = async () => {
    setExtractingFacts(true);
    setStatus('Extracting facts with AI...');

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id }),
      });

      const data = await res.json();

      if (data.success && data.facts) {
        setArticle((prev) => ({
          ...prev,
          facts_only: data.facts,
          processed: true,
        }));
      }
    } catch (error) {
      console.error('Error extracting facts:', error);
    } finally {
      setExtractingFacts(false);
      setStatus('');
    }
  };

  const isProcessing = extractingContent || extractingFacts;
  const hasFactsExtracted = article.facts_only && article.facts_only.trim().length > 0;

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to news
      </Link>

      <header className="space-y-4">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {article.source_name}
          </span>

          {article.author && (
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {article.author}
            </span>
          )}

          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDate(article.published_at)}
          </span>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <ExternalLink className="h-4 w-4" />
            View original
          </a>
        </div>
      </header>

      {article.image_url && (
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Facts Toggle Section */}
      <div className="space-y-4">
        {hasFactsExtracted && !isProcessing && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowFacts(true)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                showFacts
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              Unbiased Summary
            </button>
            <button
              onClick={() => setShowFacts(false)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !showFacts
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              Original Content
            </button>
          </div>
        )}

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              {extractingContent ? (
                <FileText className="mb-4 h-8 w-8 animate-pulse text-blue-500" />
              ) : (
                <Sparkles className="mb-4 h-8 w-8 animate-pulse text-blue-500" />
              )}
              <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                {status}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                {extractingContent
                  ? 'Getting the complete article from the source...'
                  : 'Removing opinions and bias from this article'}
              </p>
            </div>
          ) : showFacts && hasFactsExtracted ? (
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <div className="mb-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                Unbiased summary — opinion and editorial removed
              </div>
              <div className="whitespace-pre-wrap">{article.facts_only}</div>
            </div>
          ) : (
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              {!hasFactsExtracted && !isProcessing && (
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
                    Showing original content
                  </span>
                  <button
                    onClick={extractFacts}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Unbiased Summary
                  </button>
                </div>
              )}
              <div className="whitespace-pre-wrap">
                {article.original_content || 'No content available'}
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          This content has been processed by AI to extract verifiable facts and
          remove opinions, bias, and editorializing. Always verify important
          information from multiple sources.
        </p>
      </footer>
    </article>
  );
}
