export interface Article {
  id: string;
  source_name: string;
  source_url: string | null;
  author: string | null;
  title: string;
  original_content: string | null;
  facts_only: string | null;
  url: string;
  image_url: string | null;
  published_at: string | null;
  category: string | null;
  country: string | null;
  processed: boolean;
  created_at: string;
}

export interface NewsAPIArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export const CATEGORIES: Category[] = [
  { id: 1, name: 'General', slug: 'general' },
  { id: 2, name: 'Business', slug: 'business' },
  { id: 3, name: 'Technology', slug: 'technology' },
  { id: 4, name: 'Science', slug: 'science' },
  { id: 5, name: 'Health', slug: 'health' },
  { id: 6, name: 'Sports', slug: 'sports' },
  { id: 7, name: 'Entertainment', slug: 'entertainment' },
];

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'it', name: 'Italy', flag: '🇮🇹' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'kr', name: 'South Korea', flag: '🇰🇷' },
  { code: 'cn', name: 'China', flag: '🇨🇳' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
  { code: 'mx', name: 'Mexico', flag: '🇲🇽' },
  { code: 'za', name: 'South Africa', flag: '🇿🇦' },
  { code: 'ae', name: 'UAE', flag: '🇦🇪' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
];
