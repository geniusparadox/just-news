import NewsFeed from '@/components/NewsFeed';

export default function HomePage() {
  return (
    <NewsFeed
      category="general"
      title="Latest News"
      subtitle="Facts extracted by AI — opinions and bias removed"
    />
  );
}
