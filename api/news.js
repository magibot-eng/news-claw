// In-memory cache with 8-hour TTL
const cache = new Map();

const CACHE_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

const CATEGORY_COLORS = {
  1: '#00d4ff', // Tech
  2: '#ff6b6b', // World
  3: '#ffd700', // Business
  4: '#2ecc71', // Sports
  5: '#9b59b6', // Science
  6: '#e91e63', // Entertainment
  7: '#00bfa5', // Health
  8: '#ffd700', // I Feel Lucky
};

// ── LLM Summarization (Grok primary, Cerebras fallback, Brave fallback) ─────────
async function generateSummary(article) {
  const rawDesc = (article.description || article.snippet || '').trim();
  if (!rawDesc) return '';

  // Try Grok first
  const grokKey = process.env.GROK_API_KEY;
  if (grokKey) {
    try {
      const text = await callGrok(grokKey, article.title || article.headline || '', rawDesc);
      if (text) return text;
    } catch (err) {
      console.error('Grok failed:', err.message);
    }
  }

  // Try Cerebras second
  const cerebrasKey = process.env.CEREBRAS_API_KEY;
  if (cerebrasKey) {
    try {
      const text = await callCerebras(cerebrasKey, article.title || article.headline || '', rawDesc);
      if (text) return text;
    } catch (err) {
      console.error('Cerebras failed:', err.message);
    }
  }

  // Fallback: clean Brave description
  return braveFallback(rawDesc);
}

async function callGrok(apiKey, title, description) {
  const prompt = `Summarize the following news article in 2-3 clear, informative sentences. Focus on what happened, why it matters, and the key facts. Write in active voice. Do not be vague or use filler phrases like "according to reports."

Title: ${title}

${description}

Summary:`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-3-beta',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 256,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error('Grok API error:', response.status, errText);
      return null;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      console.error('Grok timed out');
    }
    throw err;
  }
}

async function callCerebras(apiKey, title, description) {
  const prompt = `Summarize the following news article in 2-3 clear, informative sentences. Focus on what happened, why it matters, and key facts. Write in active voice.

Title: ${title}

${description}

Summary:`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 256,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error('Cerebras API error:', response.status, errText);
      return null;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      console.error('Cerebras timed out');
    }
    throw err;
  }
}

function braveFallback(raw) {
  const s = raw.trim();
  if (!s) return '';
  return s.length > 600 ? s.substring(0, 600).replace(/\s+\S*$/, '') + '...' : s;
}

// ── Main handler ──────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { category } = req.query;
  const apiKey = process.env.BRAVE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'BRAVE_API_KEY environment variable not set.' });
  }

  // Check cache
  const cacheKey = `news_${category}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`Cache hit for category ${category}`);
    return res.json(cached.data);
  }

  const categoryMap = {
    1: 'technology news',
    2: 'world news',
    3: 'business news',
    4: 'sports news',
    5: 'science news',
    6: 'entertainment news',
    7: 'health news',
  };

  if (String(category) === '8') {
    // I Feel Lucky — fetch all 7 topics
    const results = [];
    for (const [catId, topic] of Object.entries(categoryMap)) {
      const u = `https://api.search.brave.com/res/v1/news/search?q=${encodeURIComponent(topic)}&freshness=pd&count=20`;
      try {
        const r = await fetch(u, {
          headers: { 'Accept': 'application/json', 'X-Subscription-Token': apiKey },
        });
        if (r.ok) {
          const d = await r.json();
          for (const item of d.results || []) {
            results.push({ ...item, _sourceCatId: Number(catId) });
          }
        }
      } catch (_) {}
    }
    for (let i = results.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [results[i], results[j]] = [results[j], results[i]];
    }
    const articles = results.slice(0, 15).map((item, i) => {
      const description = item.description || '';
      const source = item.meta_url?.hostname?.replace(/^www\./, '') || item.source?.name || 'Brave';
      const sourceCatId = item._sourceCatId || 1;
      return {
        id: `blucky${i + 1}`,
        headline: item.title,
        teaser: description.substring(0, 120) + (description.length > 120 ? '...' : ''),
        source,
        time: '24h',
        url: item.url,
        description,
        sourceCategoryId: sourceCatId,
        sourceCategoryColor: CATEGORY_COLORS[sourceCatId],
      };
    });

    const summarizedArticles = await Promise.all(
      articles.map(async (article) => {
        const summary = await generateSummary(article);
        return { ...article, summary: `${summary}\n\nSource: ${article.url}` };
      })
    );

    cache.set(cacheKey, { data: summarizedArticles, timestamp: Date.now() });
    return res.json(summarizedArticles);
  }

  const topic = categoryMap[category] || 'technology news';
  const url = `https://api.search.brave.com/res/v1/news/search?q=${encodeURIComponent(topic)}&freshness=pd&count=20`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Brave API error:', response.status, text);
      return res.status(response.status).json({ error: 'Brave API request failed', details: text });
    }

    const data = await response.json();
    const results = data.results || [];

    const articles = results.slice(0, 15).map((item, i) => {
      const description = item.description || '';
      const teaser = description.substring(0, 120) + (description.length > 120 ? '...' : '');
      const source = item.meta_url?.hostname?.replace(/^www\./, '') || item.source?.name || 'Brave';

      return {
        id: `b${category}${i + 1}`,
        headline: item.title,
        teaser: teaser,
        source: source,
        time: '24h',
        url: item.url,
        description,
        sourceCategoryId: Number(category),
        sourceCategoryColor: CATEGORY_COLORS[category],
      };
    });

    const summarizedArticles = await Promise.all(
      articles.map(async (article) => {
        const summary = await generateSummary(article);
        return { ...article, summary: `${summary}\n\nSource: ${article.url}` };
      })
    );

    cache.set(cacheKey, { data: summarizedArticles, timestamp: Date.now() });
    console.log(`Cached ${summarizedArticles.length} articles for category ${category}`);

    res.json(summarizedArticles);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch news', message: err.message });
  }
};
