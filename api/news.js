// In-memory cache with 8-hour TTL
const cache = new Map();
const summaryCache = new Map(); // per-article summary cache, keyed by URL hash

const CACHE_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

const CATEGORY_COLORS = {
  1: '#00c8e0', // Tech
  2: '#ff6b6b', // World
  3: '#ffb020', // Business
  4: '#3ddc84', // Sports
  5: '#a78bfa', // Science
  6: '#f472b6', // Entertainment
  7: '#34d399', // Health
  8: '#00c8e0', // I Feel Lucky
};

const SUMMARY_PROMPT = "Summarize this article in 2-3 sentences as if for a sophisticated general news reader. Focus on the key facts and why they matter. Write in active voice.";

// ── Per-article summary cache helpers ──────────────────────────────────────
function getSummaryCacheEntry(url) {
  const key = hashUrl(url);
  const entry = summaryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    summaryCache.delete(key);
    return null;
  }
  return entry.summary;
}

function setSummaryCacheEntry(url, summary) {
  const key = hashUrl(url);
  summaryCache.set(key, { summary, timestamp: Date.now() });
}

function hashUrl(url) {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return String(hash);
}

// ── Fetch with 5s timeout ────────────────────────────────────────────────────
function fetchWithTimeout(url, options, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timeout));
}

// ── Grok/Cerebras LLM Summarization ─────────────────────────────────────────
async function generateSummary(article) {
  const rawDesc = article.description || article.snippet || '';
  if (!rawDesc) return '';

  // Check per-article summary cache first
  const cached = getSummaryCacheEntry(article.url);
  if (cached) return cached;

  const grokKey = process.env.GROK_API_KEY;
  const cerebrasKey = process.env.CEREBRAS_API_KEY;

  if (!grokKey && !cerebrasKey) {
    const fallback = rewriteSummary(rawDesc);
    return fallback ? `${fallback} [AI summary unavailable]` : '';
  }

  // Try Grok first
  if (grokKey) {
    try {
      const prompt = `${SUMMARY_PROMPT}\n\nTitle: ${article.title || article.headline || ''}\n${rawDesc}`;
      const response = await fetchWithTimeout(
        'https://api.x.ai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${grokKey}`,
          },
          body: JSON.stringify({
            model: 'grok-2',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 200,
            temperature: 0.7,
          }),
        },
        5000
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) {
          setSummaryCacheEntry(article.url, text);
          return text;
        }
      } else {
        console.error('Grok API error:', response.status, await response.text());
      }
    } catch (err) {
      console.error('Grok fetch failed:', err.message);
    }
  }

  // Fallback to Cerebras
  if (cerebrasKey) {
    try {
      const prompt = `${SUMMARY_PROMPT}\n\nTitle: ${article.title || article.headline || ''}\n${rawDesc}`;
      const response = await fetchWithTimeout(
        'https://api.cerebras.ai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cerebrasKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 200,
            temperature: 0.7,
          }),
        },
        5000
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) {
          setSummaryCacheEntry(article.url, text);
          return text;
        }
      } else {
        console.error('Cerebras API error:', response.status, await response.text());
      }
    } catch (err) {
      console.error('Cerebras fetch failed:', err.message);
    }
  }

  // Both failed or timed out — use Brave description with badge
  const fallback = rewriteSummary(rawDesc);
  return fallback ? `${fallback} [AI summary unavailable]` : '';
}

// ── Fallback rewrite for Brave descriptions ─────────────────────────────────
function rewriteSummary(raw) {
  const s = raw.trim();
  if (!s) return '';
  return s.length > 600 ? s.substring(0, 600).replace(/\s+\S*$/, '') + '...' : s;
}

// ── Parallel fetch with max 5 concurrent LLM calls ──────────────────────────
async function fetchSummariesBatch(articles) {
  const results = [];
  for (let i = 0; i < articles.length; i += 5) {
    const batch = articles.slice(i, i + 5);
    const batchResults = await Promise.all(
      batch.map(async (article) => {
        const summary = await generateSummary(article);
        return { ...article, summary: `${summary}\n\nSource: ${article.url}` };
      })
    );
    results.push(...batchResults);
  }
  return results;
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

    const summarizedArticles = await fetchSummariesBatch(articles);

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

    const summarizedArticles = await fetchSummariesBatch(articles);

    cache.set(cacheKey, { data: summarizedArticles, timestamp: Date.now() });
    console.log(`Cached ${summarizedArticles.length} articles for category ${category}`);

    res.json(summarizedArticles);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch news', message: err.message });
  }
};
