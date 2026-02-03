import { NewsAPIResponse, NewsAPIArticle, COUNTRIES } from '@/types';

const NEWS_API_KEY = process.env.NEWS_API_KEY!;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

interface FetchNewsOptions {
  category?: string;
  country?: string;
  pageSize?: number;
  page?: number;
}

// Category keywords for search queries - specific terms that must appear in title
const CATEGORY_KEYWORDS: Record<string, string> = {
  general: '',
  business: '"stock market" OR "economy" OR "GDP" OR "inflation" OR "trade deal" OR "business"',
  technology: '"artificial intelligence" OR "AI" OR "software" OR "tech company" OR "startup" OR "cybersecurity"',
  science: '"scientists" OR "research study" OR "discovery" OR "NASA" OR "space" OR "climate change"',
  health: '"healthcare" OR "medical" OR "disease" OR "virus" OR "hospital" OR "patients" OR "treatment" OR "vaccine"',
  sports: '"cricket" OR "football" OR "tennis" OR "Olympics" OR "match" OR "tournament" OR "championship"',
  entertainment: '"movie" OR "film" OR "Bollywood" OR "Hollywood" OR "music" OR "concert" OR "actor" OR "actress"',
};

export async function fetchTopHeadlines(
  options: FetchNewsOptions = {}
): Promise<NewsAPIArticle[]> {
  const {
    category = 'general',
    country = 'us',
    pageSize = 20,
    page = 1,
  } = options;

  // For US, use the top-headlines endpoint (works on free tier)
  if (country === 'us') {
    const params = new URLSearchParams({
      country,
      category,
      pageSize: pageSize.toString(),
      page: page.toString(),
      apiKey: NEWS_API_KEY,
    });

    try {
      const response = await fetch(`${NEWS_API_BASE_URL}/top-headlines?${params}`, {
        next: { revalidate: 1800 },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('NewsAPI error:', error);
        throw new Error(error.message || 'Failed to fetch news');
      }

      const data: NewsAPIResponse = await response.json();
      return data.articles.filter(
        (article) => article.title && article.title !== '[Removed]'
      );
    } catch (error) {
      console.error('Error fetching headlines:', error);
      return [];
    }
  }

  // For other countries, use the "everything" endpoint with search terms
  const countryInfo = COUNTRIES.find((c) => c.code === country);
  const countryName = countryInfo?.name || country.toUpperCase();
  const categoryKeywords = CATEGORY_KEYWORDS[category] || '';

  // Build search query - for general, just search by country; for specific categories, prioritize keywords
  let searchQuery: string;
  if (category === 'general' || !categoryKeywords) {
    searchQuery = `"${countryName}"`;
  } else {
    // Put category keywords first for better relevancy, then filter by country
    searchQuery = `(${categoryKeywords}) AND "${countryName}"`;
  }

  // Get articles from last 2 days only
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 2);
  const fromDateStr = fromDate.toISOString().split('T')[0];

  const params = new URLSearchParams({
    q: searchQuery,
    pageSize: pageSize.toString(),
    page: page.toString(),
    sortBy: 'publishedAt',
    language: 'en',
    from: fromDateStr,
    apiKey: NEWS_API_KEY,
  });

  try {
    const response = await fetch(`${NEWS_API_BASE_URL}/everything?${params}`, {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('NewsAPI error:', error);
      throw new Error(error.message || 'Failed to fetch news');
    }

    const data: NewsAPIResponse = await response.json();
    return data.articles.filter(
      (article) => article.title && article.title !== '[Removed]'
    );
  } catch (error) {
    console.error('Error fetching international news:', error);
    return [];
  }
}

export async function searchNews(
  query: string,
  options: { pageSize?: number; page?: number } = {}
): Promise<NewsAPIArticle[]> {
  const { pageSize = 20, page = 1 } = options;

  const params = new URLSearchParams({
    q: query,
    pageSize: pageSize.toString(),
    page: page.toString(),
    sortBy: 'publishedAt',
    apiKey: NEWS_API_KEY,
  });

  try {
    const response = await fetch(`${NEWS_API_BASE_URL}/everything?${params}`, {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('NewsAPI error:', error);
      throw new Error(error.message || 'Failed to search news');
    }

    const data: NewsAPIResponse = await response.json();
    return data.articles.filter(
      (article) => article.title && article.title !== '[Removed]'
    );
  } catch (error) {
    console.error('Error searching news:', error);
    return [];
  }
}

export function transformToArticle(
  newsApiArticle: NewsAPIArticle,
  category: string,
  country: string = 'us'
) {
  return {
    source_name: newsApiArticle.source.name,
    source_url: null,
    author: newsApiArticle.author,
    title: newsApiArticle.title,
    original_content: newsApiArticle.content || newsApiArticle.description,
    facts_only: null,
    url: newsApiArticle.url,
    image_url: newsApiArticle.urlToImage,
    published_at: newsApiArticle.publishedAt,
    category,
    country,
    processed: false,
  };
}
