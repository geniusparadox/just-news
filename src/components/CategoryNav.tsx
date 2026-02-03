'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

export default function CategoryNav() {
  const pathname = usePathname();

  const isActive = (slug: string) => {
    if (slug === 'general') {
      return pathname === '/' || pathname === '/category/general';
    }
    return pathname === `/category/${slug}`;
  };

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={category.slug === 'general' ? '/' : `/category/${category.slug}`}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
                isActive(category.slug)
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
