import { NewsAPIArticle } from '@/types';

const CURRENTS_API_KEY = process.env.CURRENTS_API_KEY!;
const CURRENTS_API_BASE_URL = 'https://api.currentsapi.services/v1';

// Map our categories to CurrentsAPI categories
const CATEGORY_MAP: Record<string, string> = {
  general: 'general',
  business: 'business',
  technology: 'technology',
  science: 'science',
  health: 'health',
  sports: 'sports',
  entertainment: 'entertainment',
};

// Map our country codes to CurrentsAPI region codes
const COUNTRY_MAP: Record<string, string> = {
  in: 'IN',
  gb: 'GB',
  au: 'AU',
  ca: 'CA',
  de: 'DE',
  fr: 'FR',
  jp: 'JP',
  br: 'BR',
  cn: 'CN',
};

interface CurrentsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string;
  image: string;
  language: string;
  category: string[];
  published: string;
}

interface CurrentsAPIResponse {
  status: string;
  news: CurrentsArticle[];
}

export async function fetchCurrentsNews(
  country: string,
  category: string = 'general',
  pageSize: number = 20
): Promise<NewsAPIArticle[]> {
  const regionCode = COUNTRY_MAP[country] || country.toUpperCase();
  const categoryParam = CATEGORY_MAP[category] || 'general';

  const params = new URLSearchParams({
    apiKey: CURRENTS_API_KEY,
    country: regionCode,
    category: categoryParam,
    language: 'en',
  });

  try {
    const response = await fetch(`${CURRENTS_API_BASE_URL}/latest-news?${params}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('CurrentsAPI error:', error);
      throw new Error(error.message || 'Failed to fetch news from CurrentsAPI');
    }

    const data: CurrentsAPIResponse = await response.json();

    if (data.status !== 'ok' || !data.news) {
      return [];
    }

    // Transform CurrentsAPI response to match NewsAPI format
    return data.news.slice(0, pageSize).map((article) => ({
      source: {
        id: null,
        name: extractSourceFromUrl(article.url),
      },
      author: article.author || null,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.image || null,
      publishedAt: article.published,
      content: article.description,
    }));
  } catch (error) {
    console.error('Error fetching from CurrentsAPI:', error);
    return [];
  }
}

function extractSourceFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'Unknown';
  }
}
