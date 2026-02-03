import { NextRequest, NextResponse } from 'next/server';
import { fetchTopHeadlines, transformToArticle } from '@/lib/newsapi';
import { saveArticle, getArticles, deleteArticlesByCategory } from '@/lib/supabase';
import { CATEGORIES } from '@/types';

// Auto-refresh if articles are older than 2 hours
const STALE_THRESHOLD_MS = 2 * 60 * 60 * 1000;

function isStale(articles: { created_at?: string }[]): boolean {
  if (articles.length === 0) return true;

  const mostRecent = articles[0]?.created_at;
  if (!mostRecent) return true;

  const articleTime = new Date(mostRecent).getTime();
  const now = Date.now();

  return (now - articleTime) > STALE_THRESHOLD_MS;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || 'general';
  const country = searchParams.get('country') || 'us';
  const refresh = searchParams.get('refresh') === 'true';

  try {
    // If not forcing refresh, try to get from database first
    if (!refresh) {
      const cachedArticles = await getArticles(category, 20, country);

      // Return cached articles only if they exist and are not stale
      if (cachedArticles.length > 0 && !isStale(cachedArticles)) {
        return NextResponse.json({ articles: cachedArticles, cached: true });
      }

      // If stale, delete old articles before fetching new ones
      if (cachedArticles.length > 0) {
        await deleteArticlesByCategory(category, country);
      }
    }

    // If refreshing, delete old articles for this category/country first
    if (refresh) {
      await deleteArticlesByCategory(category, country);
    }

    // Fetch fresh articles from NewsAPI
    const newsApiArticles = await fetchTopHeadlines({ category, country });

    if (newsApiArticles.length === 0) {
      return NextResponse.json({ articles: [], cached: false });
    }

    // Transform and save articles
    const savedArticles = await Promise.all(
      newsApiArticles.map(async (article) => {
        const transformed = transformToArticle(article, category, country);
        return await saveArticle(transformed);
      })
    );

    const validArticles = savedArticles.filter((a) => a !== null);

    return NextResponse.json({ articles: validArticles, cached: false });
  } catch (error) {
    console.error('Error in news API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// Endpoint to refresh all categories for a country
export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country') || 'us';

  try {
    const results: Record<string, number> = {};

    for (const category of CATEGORIES) {
      const articles = await fetchTopHeadlines({ category: category.slug, country });

      const savedCount = await Promise.all(
        articles.map(async (article): Promise<number> => {
          const transformed = transformToArticle(article, category.slug, country);
          const saved = await saveArticle(transformed);
          return saved ? 1 : 0;
        })
      );

      results[category.slug] = savedCount.reduce((a, b) => a + b, 0);

      // Small delay between categories to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      success: true,
      country,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error refreshing news:', error);
    return NextResponse.json(
      { error: 'Failed to refresh news' },
      { status: 500 }
    );
  }
}
