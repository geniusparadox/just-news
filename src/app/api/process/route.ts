import { NextRequest, NextResponse } from 'next/server';
import { extractFacts } from '@/lib/claude';
import { getUnprocessedArticles, updateArticleFacts, getArticleById } from '@/lib/supabase';

// Process a single article
export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json();

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    const article = await getArticleById(articleId);

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    if (article.processed && article.facts_only) {
      return NextResponse.json({
        success: true,
        facts: article.facts_only,
        cached: true,
      });
    }

    const content = article.original_content || article.title;
    const facts = await extractFacts(content);

    const updated = await updateArticleFacts(article.id, facts);

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to save extracted facts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      facts,
      cached: false,
    });
  } catch (error) {
    console.error('Error processing article:', error);
    return NextResponse.json(
      { error: 'Failed to process article' },
      { status: 500 }
    );
  }
}

// Batch process unprocessed articles
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const articles = await getUnprocessedArticles(limit);

    if (articles.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No unprocessed articles found',
      });
    }

    let processedCount = 0;
    const errors: string[] = [];

    for (const article of articles) {
      try {
        const content = article.original_content || article.title;
        const facts = await extractFacts(content);
        const updated = await updateArticleFacts(article.id, facts);

        if (updated) {
          processedCount++;
        } else {
          errors.push(`Failed to save: ${article.id}`);
        }

        // Delay between articles to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        errors.push(`Error processing ${article.id}: ${err}`);
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      total: articles.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error batch processing:', error);
    return NextResponse.json(
      { error: 'Failed to batch process articles' },
      { status: 500 }
    );
  }
}
