import { notFound } from 'next/navigation';
import NewsFeed from '@/components/NewsFeed';
import { CATEGORIES } from '@/types';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  return {
    title: `${category.name} News - Unbiased News`,
    description: `Latest ${category.name.toLowerCase()} news with AI-powered fact extraction`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <NewsFeed
      category={slug}
      title={category.name}
      subtitle={`Latest ${category.name.toLowerCase()} news — facts only`}
    />
  );
}
