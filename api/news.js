// Using global fetch (Node 18+ built-in)

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { category } = req.query;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY environment variable not set. Please configure it in Vercel project settings.'
    });
  }

  // Map category IDs to display names
  const categoryMap = {
    1: 'Technology',
    2: 'World',
    3: 'Business',
    4: 'Sports',
    5: 'Science',
    6: 'Entertainment',
  };

  const categoryName = categoryMap[category] || 'Technology';

  const prompt = `Search for the top 3 most important ${categoryName} news stories from the last 24 hours. Return ONLY a valid JSON array with exactly 3 objects. No markdown, no explanation, just the raw JSON array.

Each object must have these exact fields:
- "headline": The article title (max 100 chars)
- "summary": A 2-3 sentence AI-generated summary of the article
- "source": The news source name (e.g., "Reuters", "TechCrunch", "BBC")
- "url": The full article URL

Return format:
[{"headline": "...", "summary": "...", "source": "...", "url": "..."}, ...]`;

  try {
    const response = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        tools: [{ googleSearch: {} }],
        generationConfig: {
          responseMimeType: 'application/json',
        }
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Gemini API error:', response.status, text);
      return res.status(response.status).json({ error: 'Gemini API request failed', details: text });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error('No content in Gemini response:', JSON.stringify(data));
      return res.status(500).json({ error: 'No content returned from Gemini' });
    }

    // Parse the JSON response from Gemini
    let articles;
    try {
      // Try to extract JSON if Gemini wraps it in markdown
      let jsonStr = rawText.trim();
      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      const rawArticles = JSON.parse(jsonStr);
      
      articles = rawArticles.slice(0, 3).map((item, i) => {
        const description = item.summary || '';
        const teaser = description.substring(0, 100) + (description.length > 100 ? '...' : '');
        
        return {
          id: `g${category}${i + 1}`,
          headline: item.headline,
          teaser: teaser,
          source: item.source || 'Unknown',
          time: '24h',
          url: item.url,
          summary: description,
        };
      });
    } catch (parseErr) {
      console.error('Failed to parse Gemini response:', parseErr, 'Raw:', rawText);
      return res.status(500).json({ error: 'Failed to parse Gemini response', message: parseErr.message });
    }

    res.json(articles);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch news', message: err.message });
  }
};
