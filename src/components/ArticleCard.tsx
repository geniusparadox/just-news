import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { formatDate, truncateText } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {article.image_url && (
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium">{article.source_name}</span>
          <span>•</span>
          <time>{formatDate(article.published_at)}</time>
          {article.processed && (
            <>
              <span>•</span>
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Facts extracted
              </span>
            </>
          )}
        </div>

        <Link href={`/article/${article.id}`}>
          <h2 className="mb-2 line-clamp-2 text-lg font-semibold text-zinc-900 transition-colors group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
            {article.title}
          </h2>
        </Link>

        {article.original_content && (
          <p className="mb-4 line-clamp-3 flex-1 text-sm text-zinc-600 dark:text-zinc-400">
            {truncateText(article.original_content, 150)}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link
            href={`/article/${article.id}`}
            className="text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-100"
          >
            Read facts
          </Link>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            Original
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
