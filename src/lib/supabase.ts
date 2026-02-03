import { createClient } from '@supabase/supabase-js';
import { Article } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getArticles(
  category?: string,
  limit: number = 20,
  country?: string
): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  if (country) {
    query = query.eq('country', country);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return data || [];
}

export async function deleteArticlesByCategory(
  category: string,
  country: string
): Promise<boolean> {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('category', category)
    .eq('country', country);

  if (error) {
    console.error('Error deleting articles:', error);
    return false;
  }

  return true;
}

export async function getArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return data;
}

export async function saveArticle(article: Omit<Article, 'id' | 'created_at'>): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .upsert(article, { onConflict: 'url' })
    .select()
    .single();

  if (error) {
    console.error('Error saving article:', error);
    return null;
  }

  return data;
}

export async function updateArticleFacts(id: string, factsOnly: string): Promise<boolean> {
  const { error } = await supabase
    .from('articles')
    .update({ facts_only: factsOnly, processed: true })
    .eq('id', id);

  if (error) {
    console.error('Error updating article facts:', error);
    return false;
  }

  return true;
}

export async function getUnprocessedArticles(limit: number = 10): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('processed', false)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching unprocessed articles:', error);
    return [];
  }

  return data || [];
}
