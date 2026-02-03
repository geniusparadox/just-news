import { notFound } from 'next/navigation';
import { getArticleById } from '@/lib/supabase';
import ArticleView from '@/components/ArticleView';

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: `${article.title} - Unbiased News`,
    description: article.facts_only || article.original_content || article.title,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return <ArticleView article={article} />;
}
