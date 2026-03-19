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
    return res.status(500).json({
      error: 'BRAVE_API_KEY environment variable not set.'
    });
  }

  // Check cache
  const cacheKey = `news_${category}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`Cache hit for category ${category}`);
    return res.json(cached.data);
  }

  // Map category IDs to Brave News topics
  const categoryMap = {
    1: 'technology news',
    2: 'world news',
    3: 'business news',
    4: 'sports news',
    5: 'science news',
    6: 'entertainment news',
    7: 'health news',
  };

  // Category 8 = "I Feel Lucky" — fetch all 7 topics and combine
  if (String(category) === '8') {
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
    // Shuffle combined results
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
        summary: `${description}\n\nSource: ${item.url}`,
        sourceCategoryId: sourceCatId,
        sourceCategoryColor: CATEGORY_COLORS[sourceCatId],
      };
    });
    cache.set(cacheKey, { data: articles, timestamp: Date.now() });
    return res.json(articles);
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

    // Take up to 15 articles
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
        summary: `${description}\n\nSource: ${item.url}`,
      };
    });

    // Store in cache
    cache.set(cacheKey, { data: articles, timestamp: Date.now() });
    console.log(`Cached ${articles.length} articles for category ${category}`);

    res.json(articles);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch news', message: err.message });
  }
};
