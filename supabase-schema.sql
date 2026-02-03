-- Unbiased News - Supabase Schema
-- Run this in your Supabase SQL Editor (Database > SQL Editor)

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_url TEXT,
  author TEXT,
  title TEXT NOT NULL,
  original_content TEXT,
  facts_only TEXT,
  url TEXT UNIQUE NOT NULL,
  image_url TEXT,
  published_at TIMESTAMPTZ,
  category TEXT,
  country TEXT DEFAULT 'us',
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_processed ON articles(processed);
CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);
CREATE INDEX IF NOT EXISTS idx_articles_country ON articles(country);

-- Enable Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows public read access
CREATE POLICY "Allow public read access" ON articles
  FOR SELECT
  USING (true);

-- Create a policy that allows all operations
CREATE POLICY "Allow all operations" ON articles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Migration: Add country column if table already exists
-- ALTER TABLE articles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'us';
