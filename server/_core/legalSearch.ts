import { invokeLLM } from "./llm";

/**
 * Search for official state legal information from government sources
 */
export async function searchStateLaws(query: string, state: string): Promise<string> {
  try {
    // Use Data API to search for official government legal sources
    const searchUrl = `${process.env.BUILT_IN_FORGE_API_URL}/data_api/omni_search`;
    
    const searchQuery = `${state} state official government law: ${query}`;
    
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        search_type: 'info',
        max_results: 5,
      }),
    });

    if (!response.ok) {
      console.error('Search API error:', response.statusText);
      return '';
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return '';
    }

    // Extract relevant information from search results
    const sources = data.results
      .filter((r: any) => {
        const url = r.url?.toLowerCase() || '';
        // Prioritize official government sources
        return url.includes('.gov') || url.includes('legislature') || url.includes('law');
      })
      .slice(0, 3)
      .map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet || r.content || '',
      }));

    if (sources.length === 0) {
      return '';
    }

    // Format sources for LLM context
    const sourceContext = sources
      .map((s: any, idx: number) => 
        `Source ${idx + 1}: ${s.title}\nURL: ${s.url}\nContent: ${s.snippet}\n`
      )
      .join('\n');

    return sourceContext;
  } catch (error) {
    console.error('Error searching state laws:', error);
    return '';
  }
}

/**
 * Enhanced legal assistant that uses web-sourced information
 */
export async function getEnhancedLegalResponse(
  userMessage: string,
  state: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<{ response: string; sources: string[] }> {
  // Search for relevant official sources
  const webContext = await searchStateLaws(userMessage, state);

  // Build system prompt with web context
  const systemPrompt = `You are a friendly legal education assistant helping users learn about ${state} state laws.

Your role:
- Explain legal concepts in simple, accessible language
- Provide accurate, state-specific legal information
- Encourage learning and ask follow-up questions
- Always cite your sources when using web-sourced information
- Remind users this is educational, not legal advice

${webContext ? `\n=== OFFICIAL SOURCES ===\n${webContext}\n\nIMPORTANT: Use the information from these official government sources in your response. Cite the source URLs when referencing specific laws or regulations.\n` : ''}

Keep responses concise (under 250 words) and conversational.`;

  // Call LLM with enhanced context
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...chatHistory,
    { role: 'user' as const, content: userMessage }
  ];

  const llmResponse = await invokeLLM({ messages });
  
  const responseText = llmResponse.choices[0].message.content;
  if (typeof responseText !== 'string') {
    throw new Error('Invalid response from AI');
  }

  // Extract source URLs from web context
  const sourceUrls = webContext
    ? Array.from(webContext.matchAll(/URL: (https?:\/\/[^\s]+)/g))
        .map(match => match[1])
    : [];

  return {
    response: responseText,
    sources: sourceUrls,
  };
}
