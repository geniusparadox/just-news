import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const FACT_EXTRACTION_PROMPT = `You are an unbiased news rewriter. Your task is to rewrite the given news article as a neutral, factual summary that removes all bias, opinion, and editorializing while preserving the complete story.

## Your Task:
Rewrite the article as a clear, readable summary that:
- Presents the facts in a narrative format (not bullet points)
- Maintains the flow and context of the story
- Covers all the key information: WHO, WHAT, WHEN, WHERE, WHY, HOW
- Is written in neutral, objective journalistic tone

## Remove:
- Opinion language ("experts believe", "critics say", "many think", "sources claim")
- Emotional/sensationalist words ("shocking", "devastating", "incredible", "slammed", "blasted")
- Political bias or loaded framing
- Speculation and predictions presented as fact
- Editorializing and commentary

## Keep:
- All factual information (dates, names, numbers, locations, events)
- Direct quotes (clearly attributed)
- Context necessary to understand the story
- Multiple perspectives if factually reported (without editorial framing)

## Output Format:
Write 2-4 paragraphs that summarize the article factually. Use clear, simple language. If certain claims are unverified, note them as "reportedly" or "according to [source]".

## Example:
Instead of: "In a shocking move that critics say will devastate the economy..."
Write: "The government announced a new economic policy on Monday. The policy includes [specific details]. Some economists have raised concerns about potential impacts, while government officials stated the measures aim to [stated goal]."

Now rewrite this article as an unbiased factual summary:`;

export async function extractFacts(articleContent: string): Promise<string> {
  if (!articleContent || articleContent.trim().length === 0) {
    return 'No content available for fact extraction.';
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `${FACT_EXTRACTION_PROMPT}\n\n---\n\n${articleContent}`,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return 'Unable to extract facts from this article.';
    }

    return textContent.text;
  } catch (error) {
    console.error('Error extracting facts:', error);
    throw new Error('Failed to extract facts from article');
  }
}

export async function extractFactsBatch(
  articles: { id: string; content: string }[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    const promises = batch.map(async (article) => {
      const facts = await extractFacts(article.content);
      return { id: article.id, facts };
    });

    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ id, facts }) => {
      results.set(id, facts);
    });

    // Small delay between batches
    if (i + batchSize < articles.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}
