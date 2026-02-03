'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FactsToggleProps {
  factsOnly: string | null;
  originalContent: string | null;
}

export default function FactsToggle({
  factsOnly,
  originalContent,
}: FactsToggleProps) {
  const [showFacts, setShowFacts] = useState(true);

  const hasFactsExtracted = factsOnly && factsOnly.trim().length > 0;

  return (
    <div className="space-y-4">
      {hasFactsExtracted && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowFacts(true)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              showFacts
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            )}
          >
            Facts Only
          </button>
          <button
            onClick={() => setShowFacts(false)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              !showFacts
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            )}
          >
            Original Content
          </button>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        {showFacts && hasFactsExtracted ? (
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <div className="mb-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              AI-extracted facts — opinion and bias removed
            </div>
            <div className="whitespace-pre-wrap">{factsOnly}</div>
          </div>
        ) : (
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            {!hasFactsExtracted && (
              <div className="mb-4 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
                Facts not yet extracted — showing original content
              </div>
            )}
            <div className="whitespace-pre-wrap">
              {originalContent || 'No content available'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
