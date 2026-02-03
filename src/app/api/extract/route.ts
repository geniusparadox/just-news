import { NextRequest, NextResponse } from 'next/server';
import { extract } from '@extractus/article-extractor';
import { getArticleById, supabase } from '@/lib/supabase';

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

    // Check if content is truncated (contains the NewsAPI truncation pattern)
    const isTruncated = article.original_content?.includes('[+') &&
                        article.original_content?.includes('chars]');

    if (!isTruncated && article.original_content && article.original_content.length > 500) {
      // Already have full content
      return NextResponse.json({
        success: true,
        content: article.original_content,
        cached: true,
      });
    }

    // Extract full article from the original URL
    const extracted = await extract(article.url);

    if (!extracted || !extracted.content) {
      return NextResponse.json({
        success: false,
        error: 'Could not extract article content',
        content: article.original_content,
      });
    }

    // Clean up the extracted content (remove HTML tags)
    const cleanContent = extracted.content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Update the article in database with full content
    const { error } = await supabase
      .from('articles')
      .update({
        original_content: cleanContent,
        processed: false, // Reset so facts can be re-extracted with full content
        facts_only: null,
      })
      .eq('id', articleId);

    if (error) {
      console.error('Error updating article:', error);
    }

    return NextResponse.json({
      success: true,
      content: cleanContent,
      cached: false,
    });
  } catch (error) {
    console.error('Error extracting article:', error);
    return NextResponse.json(
      { error: 'Failed to extract article content' },
      { status: 500 }
    );
  }
}
