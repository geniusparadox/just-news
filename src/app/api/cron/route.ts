import { NextRequest, NextResponse } from 'next/server';
import { fetchTopHeadlines, transformToArticle } from '@/lib/newsapi';
import { saveArticle, getUnprocessedArticles, updateArticleFacts, deleteArticlesByCategory } from '@/lib/supabase';
import { extractFacts } from '@/lib/claude';
import { CATEGORIES, COUNTRIES } from '@/types';

// This endpoint is designed to be called by a cron job (e.g., Vercel Cron)
// It fetches new articles and processes them for fact extraction

export async function GET(request: NextRequest) {
  // Verify cron secret for security (set CRON_SECRET in env)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = {
    fetched: 0,
    processed: 0,
    errors: [] as string[],
  };

  try {
    // Step 1: Fetch new articles for all categories and countries
    const countries = ['us', 'in', 'gb']; // Main countries to refresh

    for (const country of countries) {
      for (const category of CATEGORIES) {
        try {
          // Delete old articles first
          await deleteArticlesByCategory(category.slug, country);

          const articles = await fetchTopHeadlines({
            category: category.slug,
            country,
            pageSize: 10,
          });

          for (const article of articles) {
            const transformed = transformToArticle(article, category.slug, country);
            const saved = await saveArticle(transformed);
            if (saved) results.fetched++;
          }

          // Rate limit protection
          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (err) {
          results.errors.push(`Fetch error for ${category.slug}/${country}: ${err}`);
        }
      }
    }

    // Step 2: Process unprocessed articles (limit to avoid timeout)
    const unprocessed = await getUnprocessedArticles(5);

    for (const article of unprocessed) {
      try {
        const content = article.original_content || article.title;
        const facts = await extractFacts(content);
        const updated = await updateArticleFacts(article.id, facts);

        if (updated) results.processed++;
      } catch (err) {
        results.errors.push(`Process error for ${article.id}: ${err}`);
      }

      // Rate limit protection for Claude API
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
