/**
 * Global News Summary for Private Equity Professionals
 *
 * This script aggregates news from top global sources, analyzes market trends,
 * and delivers a comprehensive daily briefing via Slack.
 *
 * Required Configuration:
 * 1. Set your OpenAI API Key in OPENAI_API_KEY
 * 2. Set your Slack Webhook URL in SLACK_WEBHOOK_URL
 * 3. Set News API Key (optional) in NEWS_API_KEY
 * 4. Deploy as time-triggered function (daily at desired time)
 */

// ==================== CONFIGURATION ====================

const CONFIG = {
  // API Keys - REPLACE THESE WITH YOUR ACTUAL KEYS
  OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE',
  SLACK_WEBHOOK_URL: 'YOUR_SLACK_WEBHOOK_URL_HERE',
  NEWS_API_KEY: 'YOUR_NEWS_API_KEY_HERE', // Get from https://newsapi.org

  // ChatGPT Settings
  GPT_MODEL: 'gpt-4-turbo-preview',
  GPT_TEMPERATURE: 0.3,

  // Time Range (hours)
  NEWS_HOURS_BACK: 24,

  // News Settings
  MAX_ARTICLES_PER_SOURCE: 10,
  TOTAL_TOP_ARTICLES: 20,
  SIMILARITY_THRESHOLD: 0.7, // For duplicate detection

  // Market Data
  MARKET_SYMBOLS: {
    US_STOCKS: ['^GSPC', '^DJI', '^IXIC'], // S&P 500, Dow Jones, NASDAQ
    KOREA_STOCKS: ['^KS11', '^KQ11'], // KOSPI, KOSDAQ
    CRYPTO: ['BTC-USD'],
    FOREX: ['KRW=X'] // USD/KRW
  }
};

// ==================== NEWS SOURCES ====================

const NEWS_SOURCES = [
  // US Major News - Premium Quality
  {
    name: 'Financial Times',
    type: 'rss',
    url: 'https://www.ft.com/world?format=rss',
    category: 'business'
  },
  {
    name: 'The Wall Street Journal',
    type: 'rss',
    url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml',
    category: 'business'
  },
  {
    name: 'The New York Times',
    type: 'rss',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
    category: 'business'
  },
  {
    name: 'Bloomberg',
    type: 'rss',
    url: 'https://feeds.bloomberg.com/markets/news.rss',
    category: 'markets'
  },
  {
    name: 'Reuters',
    type: 'rss',
    url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
    category: 'business'
  },
  {
    name: 'CNN Business',
    type: 'rss',
    url: 'http://rss.cnn.com/rss/money_news_economy.rss',
    category: 'business'
  },
  {
    name: 'The Economist',
    type: 'rss',
    url: 'https://www.economist.com/business/rss.xml',
    category: 'business'
  },

  // Europe
  {
    name: 'BBC News - Business',
    type: 'rss',
    url: 'http://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'business'
  },

  // Korea Major News
  {
    name: '조선일보',
    type: 'rss',
    url: 'https://www.chosun.com/arc/outboundfeeds/rss/category/economy/',
    category: 'economy'
  },
  {
    name: '중앙일보',
    type: 'rss',
    url: 'https://koreajoongangdaily.joins.com/news/rss',
    category: 'business'
  },
  {
    name: '한국경제',
    type: 'rss',
    url: 'https://www.hankyung.com/feed/economy',
    category: 'economy'
  },

  // Asia
  {
    name: 'Nikkei Asia',
    type: 'rss',
    url: 'https://asia.nikkei.com/rss/feed/nar',
    category: 'business'
  },
  {
    name: 'South China Morning Post',
    type: 'rss',
    url: 'https://www.scmp.com/rss/91/feed',
    category: 'business'
  },

  // Tech & Innovation (quality sources)
  {
    name: 'MIT Technology Review',
    type: 'rss',
    url: 'https://www.technologyreview.com/feed/',
    category: 'tech'
  },

  // Supplementary - Google News for broader coverage
  {
    name: 'Google News - Business',
    type: 'rss',
    url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB',
    category: 'business'
  },
  {
    name: 'Google News - Economy',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=economy+OR+policy+OR+regulation&hl=en-US&gl=US&ceid=US:en',
    category: 'economy'
  }
];

// ==================== MAIN FUNCTION ====================

/**
 * Main function to run the daily news summary
 * Set this as a time-triggered function in Google Apps Script
 */
function sendDailyNewsSummary() {
  try {
    Logger.log('🚀 Starting Global News Summary...');

    // 1. Fetch all news articles
    const articles = fetchAllNews();
    Logger.log(`📰 Fetched ${articles.length} articles`);

    // 2. Filter and deduplicate
    const filteredArticles = processArticles(articles);
    Logger.log(`✅ Processed ${filteredArticles.length} unique articles`);

    // 3. Get market data
    const marketData = fetchMarketData();
    Logger.log('📊 Market data fetched');

    // 4. Get Trump activity
    const trumpActivity = fetchTrumpActivity();
    Logger.log('🏛️ Trump activity fetched');

    // 5. Generate AI summary
    const aiSummary = generateAISummary(filteredArticles, marketData, trumpActivity);
    Logger.log('🤖 AI summary generated');

    // 6. Format and send to Slack
    const message = formatSlackMessage(aiSummary, filteredArticles, marketData, trumpActivity);
    sendToSlack(message);

    Logger.log('✅ Daily news summary sent successfully!');

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    sendErrorToSlack(error);
  }
}

// ==================== NEWS FETCHING ====================

/**
 * Fetch news from all configured sources
 */
function fetchAllNews() {
  const allArticles = [];
  const cutoffTime = new Date(Date.now() - CONFIG.NEWS_HOURS_BACK * 60 * 60 * 1000);

  NEWS_SOURCES.forEach(source => {
    try {
      let articles = [];

      if (source.type === 'rss') {
        articles = fetchRSSFeed(source);
      } else if (source.type === 'newsapi') {
        articles = fetchNewsAPI(source);
      } else if (source.type === 'naver') {
        articles = fetchNaverNews(source);
      }

      // Filter by time
      articles = articles.filter(article =>
        new Date(article.publishedAt) > cutoffTime
      );

      // Limit per source
      articles = articles.slice(0, CONFIG.MAX_ARTICLES_PER_SOURCE);

      allArticles.push(...articles);

      Logger.log(`✓ ${source.name}: ${articles.length} articles`);

    } catch (error) {
      Logger.log(`✗ Error fetching ${source.name}: ${error.toString()}`);
    }
  });

  return allArticles;
}

/**
 * Fetch and parse RSS feed
 */
function fetchRSSFeed(source) {
  try {
    const response = UrlFetchApp.fetch(source.url, {
      muteHttpExceptions: true,
      followRedirects: true
    });

    if (response.getResponseCode() !== 200) {
      throw new Error(`HTTP ${response.getResponseCode()}`);
    }

    const xml = response.getContentText();
    const document = XmlService.parse(xml);
    const root = document.getRootElement();

    // Handle both RSS 2.0 and Atom feeds
    const items = root.getChild('channel')
      ? root.getChild('channel').getChildren('item')
      : root.getChildren('entry');

    const articles = [];

    items.forEach(item => {
      try {
        const article = {
          source: source.name,
          title: getElementText(item, 'title'),
          link: getElementText(item, 'link') || item.getChild('link')?.getAttribute('href')?.getValue(),
          description: getElementText(item, 'description') || getElementText(item, 'summary'),
          publishedAt: parseDate(getElementText(item, 'pubDate') || getElementText(item, 'published')),
          category: source.category,
          score: 0
        };

        if (article.title && article.link) {
          articles.push(article);
        }
      } catch (e) {
        // Skip malformed items
      }
    });

    return articles;

  } catch (error) {
    Logger.log(`RSS fetch error for ${source.name}: ${error.toString()}`);
    return [];
  }
}

/**
 * Fetch from News API
 */
function fetchNewsAPI(source) {
  if (!CONFIG.NEWS_API_KEY || CONFIG.NEWS_API_KEY === 'YOUR_NEWS_API_KEY_HERE') {
    Logger.log('News API key not configured, skipping...');
    return [];
  }

  try {
    const fromDate = new Date(Date.now() - CONFIG.NEWS_HOURS_BACK * 60 * 60 * 1000);
    const fromDateStr = Utilities.formatDate(fromDate, 'UTC', 'yyyy-MM-dd');

    const url = `https://newsapi.org/v2/everything?` +
      `q=${encodeURIComponent(source.query)}&` +
      `from=${fromDateStr}&` +
      `sortBy=publishedAt&` +
      `language=en&` +
      `pageSize=50&` +
      `apiKey=${CONFIG.NEWS_API_KEY}`;

    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());

    if (data.status !== 'ok') {
      throw new Error(data.message || 'News API error');
    }

    return data.articles.map(article => ({
      source: article.source.name,
      title: article.title,
      link: article.url,
      description: article.description,
      publishedAt: article.publishedAt,
      category: source.category,
      score: 0
    }));

  } catch (error) {
    Logger.log(`News API error: ${error.toString()}`);
    return [];
  }
}

/**
 * Fetch from Naver News API
 */
function fetchNaverNews(source) {
  // Note: This requires Naver API credentials
  // For now, we'll use Naver News RSS as an alternative
  try {
    const query = encodeURIComponent(source.query);
    // Naver News RSS feed URL
    const url = `https://news.naver.com/main/list.naver?mode=LSD&mid=sec&sid1=101`;

    // Alternative: Search results RSS (if available)
    const searchUrl = `https://openapi.naver.com/v1/search/news.xml?query=${query}&display=10&sort=date`;

    // Since we need API keys for Naver, we'll return empty for now
    // Users should add their Naver API credentials to use this feature
    Logger.log('Naver News API requires credentials - skipping for now');
    return [];

  } catch (error) {
    Logger.log(`Naver News error: ${error.toString()}`);
    return [];
  }
}

/**
 * Helper function to get element text
 */
function getElementText(element, childName) {
  const child = element.getChild(childName);
  return child ? child.getText() : null;
}

/**
 * Parse date string
 */
function parseDate(dateStr) {
  if (!dateStr) return new Date();
  return new Date(dateStr);
}

// ==================== ARTICLE PROCESSING ====================

/**
 * Detect language of article (Korean vs English)
 */
function detectLanguage(text) {
  if (!text) return 'en';

  // Check for Korean characters (Hangul)
  const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;
  const hasKorean = koreanRegex.test(text);

  return hasKorean ? 'ko' : 'en';
}

/**
 * Process articles: filter, deduplicate, score, and prioritize
 */
function processArticles(articles) {
  // 1. Detect language for each article
  articles.forEach(article => {
    article.language = detectLanguage(article.title + ' ' + (article.description || ''));
  });

  // 2. Score articles based on relevance
  articles.forEach(article => {
    article.score = scoreArticle(article);
  });

  // 3. Sort by score
  articles.sort((a, b) => b.score - a.score);

  // 4. Remove duplicates and similar articles
  const uniqueArticles = removeDuplicates(articles);

  // 5. Return top articles
  return uniqueArticles.slice(0, CONFIG.TOTAL_TOP_ARTICLES);
}

/**
 * Score article based on keywords and relevance for business leaders
 */
function scoreArticle(article) {
  let score = 1;
  const text = (article.title + ' ' + (article.description || '')).toLowerCase();

  // Economic & Policy keywords (highest priority)
  const economicPolicyKeywords = [
    'fed', 'federal reserve', 'interest rate', 'inflation', 'gdp', 'economy',
    'stock market', 'bond', 'treasury', 'recession', 'growth',
    'central bank', 'monetary policy', 'fiscal policy', 'tax',
    'regulation', 'policy', 'trade', 'tariff', 'sanctions'
  ];

  // Corporate & Business keywords
  const businessKeywords = [
    'm&a', 'merger', 'acquisition', 'deal', 'partnership',
    'ipo', 'earnings', 'revenue', 'profit', 'valuation',
    'restructuring', 'bankruptcy', 'investment'
  ];

  // Leadership & Strategy keywords
  const leadershipKeywords = [
    'ceo', 'cfo', 'executive', 'leadership', 'board',
    'strategy', 'transformation', 'innovation', 'disruption'
  ];

  // Geopolitical keywords
  const geopoliticalKeywords = [
    'china', 'us-china', 'trump', 'biden', 'election',
    'war', 'conflict', 'diplomacy', 'trade war', 'brexit',
    'eu', 'europe', 'asia', 'japan', 'korea'
  ];

  // Technology & Innovation keywords
  const techKeywords = [
    'ai', 'artificial intelligence', 'technology', 'tech',
    'digital', 'automation', 'blockchain', 'semiconductor'
  ];

  // Score based on keyword presence
  economicPolicyKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 3;
  });

  businessKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 2.5;
  });

  geopoliticalKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 2;
  });

  leadershipKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 1.5;
  });

  techKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 1.5;
  });

  // Boost for major publications
  const majorPubs = [
    'Financial Times', 'Wall Street Journal', 'Bloomberg', 'The Economist',
    'New York Times', 'Reuters', 'CNN', 'BBC'
  ];
  if (majorPubs.some(pub => article.source.includes(pub))) {
    score *= 1.3;
  }

  return score;
}

/**
 * Remove duplicate and similar articles
 */
function removeDuplicates(articles) {
  const unique = [];
  const seen = new Set();

  for (const article of articles) {
    const titleNormalized = normalizeTitle(article.title);

    // Check for exact duplicates
    if (seen.has(titleNormalized)) {
      continue;
    }

    // Check for similar articles
    let isSimilar = false;
    for (const existingArticle of unique) {
      if (calculateSimilarity(article.title, existingArticle.title) > CONFIG.SIMILARITY_THRESHOLD) {
        // Boost score of existing article (multiple sources covering same story)
        existingArticle.score += 2;
        isSimilar = true;
        break;
      }
    }

    if (!isSimilar) {
      unique.push(article);
      seen.add(titleNormalized);
    }
  }

  // Re-sort after boosting scores
  unique.sort((a, b) => b.score - a.score);

  return unique;
}

/**
 * Normalize title for comparison
 */
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Calculate similarity between two strings (simple Jaccard similarity)
 */
function calculateSimilarity(str1, str2) {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

// ==================== MARKET DATA ====================

/**
 * Fetch market data from Yahoo Finance
 */
function fetchMarketData() {
  const data = {
    usStocks: fetchStockData(CONFIG.MARKET_SYMBOLS.US_STOCKS),
    koreaStocks: fetchStockData(CONFIG.MARKET_SYMBOLS.KOREA_STOCKS),
    crypto: fetchCryptoData(CONFIG.MARKET_SYMBOLS.CRYPTO),
    forex: fetchForexData(CONFIG.MARKET_SYMBOLS.FOREX)
  };

  return data;
}

/**
 * Fetch stock data from Yahoo Finance API
 */
function fetchStockData(symbols) {
  const stockData = [];

  symbols.forEach(symbol => {
    try {
      // Use Yahoo Finance API alternative or web scraping
      // For simplicity, using a public API endpoint
      const data = fetchYahooFinanceData(symbol);
      if (data) {
        stockData.push(data);
      }
    } catch (error) {
      Logger.log(`Error fetching ${symbol}: ${error.toString()}`);
    }
  });

  return stockData;
}

/**
 * Fetch data from Yahoo Finance
 */
function fetchYahooFinanceData(symbol) {
  try {
    // Using Yahoo Finance query API - encode symbol for URL
    const encodedSymbol = encodeURIComponent(symbol);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodedSymbol}?range=1mo&interval=1d`;

    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });

    if (response.getResponseCode() !== 200) {
      Logger.log(`Yahoo Finance HTTP error for ${symbol}: ${response.getResponseCode()}`);
      return null;
    }

    const json = JSON.parse(response.getContentText());

    // Check if response has expected structure
    if (!json.chart || !json.chart.result || json.chart.result.length === 0) {
      Logger.log(`Yahoo Finance invalid response for ${symbol}`);
      return null;
    }

    const result = json.chart.result[0];
    const meta = result.meta;

    if (!meta || !result.indicators || !result.indicators.quote || result.indicators.quote.length === 0) {
      Logger.log(`Yahoo Finance incomplete data for ${symbol}`);
      return null;
    }

    const quotes = result.indicators.quote[0];

    if (!quotes.close || quotes.close.length === 0) {
      Logger.log(`Yahoo Finance no price data for ${symbol}`);
      return null;
    }

    // Get last 20 trading days for trends (filter out null values)
    const allPrices = quotes.close.filter(p => p != null && !isNaN(p));
    const recentPrices = allPrices.slice(-20);
    const currentPrice = meta.regularMarketPrice || allPrices[allPrices.length - 1];
    const previousClose = meta.previousClose || allPrices[allPrices.length - 2] || currentPrice;

    const dayChange = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
    const weekChange = calculateChange(recentPrices, 5);
    const monthChange = calculateChange(recentPrices, 20);

    // Map symbols to full names
    const symbolNames = {
      '^GSPC': 'S&P 500',
      '^DJI': 'Dow Jones',
      '^IXIC': 'NASDAQ',
      '^KS11': 'KOSPI',
      '^KQ11': 'KOSDAQ',
      'BTC-USD': 'Bitcoin',
      'KRW=X': 'USD/KRW'
    };

    return {
      symbol: symbol,
      name: symbolNames[symbol] || meta.symbol || symbol,
      price: currentPrice,
      dayChange: dayChange,
      weekChange: weekChange,
      monthChange: monthChange,
      currency: meta.currency || 'USD'
    };

  } catch (error) {
    Logger.log(`Yahoo Finance error for ${symbol}: ${error.toString()}`);
    return null;
  }
}

/**
 * Calculate percentage change over period
 */
function calculateChange(prices, days) {
  if (!prices || prices.length < 2 || prices.length < days) return 0;
  const current = prices[prices.length - 1];
  const previous = prices[prices.length - days];
  if (!current || !previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Fetch crypto data
 */
function fetchCryptoData(symbols) {
  return fetchStockData(symbols); // Yahoo Finance also has crypto
}

/**
 * Fetch forex data
 */
function fetchForexData(symbols) {
  return fetchStockData(symbols); // Yahoo Finance also has forex
}

// ==================== TRUMP ACTIVITY ====================

/**
 * Fetch Trump's recent activity
 */
function fetchTrumpActivity() {
  try {
    // Search for Trump news in recent articles
    const trumpNews = searchTrumpNews();

    // Try to get Truth Social posts (if available via API)
    // For now, we'll rely on news coverage

    return {
      newsCount: trumpNews.length,
      headlines: trumpNews.slice(0, 5)
    };

  } catch (error) {
    Logger.log(`Trump activity error: ${error.toString()}`);
    return {
      newsCount: 0,
      headlines: []
    };
  }
}

/**
 * Search for Trump-related news using Google News RSS
 */
function searchTrumpNews() {
  try {
    const url = 'https://news.google.com/rss/search?q=Trump+OR+%22Donald+Trump%22&hl=en-US&gl=US&ceid=US:en';

    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });

    if (response.getResponseCode() !== 200) {
      return [];
    }

    const xml = response.getContentText();
    const document = XmlService.parse(xml);
    const root = document.getRootElement();
    const items = root.getChild('channel').getChildren('item');

    const articles = [];
    items.slice(0, 10).forEach(item => {
      try {
        articles.push({
          title: getElementText(item, 'title'),
          link: getElementText(item, 'link'),
          source: 'Google News'
        });
      } catch (e) {
        // Skip malformed items
      }
    });

    return articles;

  } catch (error) {
    Logger.log(`Trump news search error: ${error.toString()}`);
    return [];
  }
}

// ==================== AI SUMMARY (ChatGPT) ====================

/**
 * Generate AI summary using ChatGPT
 */
function generateAISummary(articles, marketData, trumpActivity) {
  if (!CONFIG.OPENAI_API_KEY || CONFIG.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    Logger.log('OpenAI API key not configured, skipping AI summary...');
    return {
      headline: '오늘의 글로벌 뉴스 헤드라인',
      bullets: [
        '글로벌 경제 및 시장 동향을 확인하세요',
        '주요 뉴스는 아래에서 확인할 수 있습니다'
      ],
      economicTrends: '경제 동향 분석을 위해 OpenAI API 키를 설정하세요'
    };
  }

  try {
    // Prepare rich context for GPT with descriptions
    const articlesContext = articles.slice(0, 20).map((a, i) => {
      const desc = a.description ? `\n   ${a.description.substring(0, 150)}...` : '';
      return `${i + 1}. [${a.source}] ${a.title}${desc}`;
    }).join('\n\n');

    // Prepare market context
    const marketContext = formatMarketContextForAI(marketData);

    const prompt = `You are an executive assistant for global business leaders and C-suite executives.
Your role is to analyze today's global news and provide a comprehensive daily briefing in professional English.

=== TODAY'S MARKET DATA ===
${marketContext}

=== TODAY'S NEWS HEADLINES ===
${articlesContext}

=== YOUR TASK ===
Provide a professional executive briefing with the following structure (ALL IN ENGLISH):

1. **Today's Key Insights** (5-6 bullets, each 150-200 chars)
   - Write RICH, DETAILED insights with context and implications
   - What happened today that business leaders MUST know?
   - Include specific details: companies, governments, leaders, key decisions, strategic moves
   - Focus on: economic policy, government regulations, geopolitical shifts, major corporate actions, market movements, technological breakthroughs
   - Explain WHY each insight matters for business strategy and decision-making
   - Example: "Fed signals policy shift as inflation cools to 2.5% - likely rate cuts in Q2 will ease financing costs for corporate expansion"

2. **Macro-Economic & Policy Impact** (600-800 chars)
   - Comprehensive analysis of economic and policy factors affecting business
   - Interest rates, inflation, monetary policy, fiscal policy, central bank actions
   - Government regulations, trade policies, tax changes
   - Credit markets, currency movements, commodity prices
   - Geopolitical developments and their economic impact
   - HOW these specifically affect corporate strategy, investment decisions, operations, and growth
   - Connect today's news to broader business implications

3. **Corporate & Market Highlights** (500-700 chars if relevant, or empty string)
   - Major corporate actions: M&A, restructuring, strategic pivots, leadership changes
   - Market movements and what they signal
   - Significant deals or partnerships and their strategic rationale
   - Industry consolidation or disruption trends

4. **Sector & Industry Spotlight** (500-700 chars if relevant, or empty string)
   - Which industries/sectors are seeing major developments and WHY
   - Regulatory changes, technological shifts, consumer trends affecting sectors
   - Opportunities or risks emerging for businesses
   - Innovation and disruption patterns

5. **Regional & Geopolitical Trends** (500-700 chars if relevant, or empty string)
   - Geographic analysis: US, Europe, Asia (China, Japan, Korea), emerging markets
   - Political developments, policy changes, regulatory shifts by region
   - Trade relationships, cross-border implications
   - Regional economic indicators and their global impact

IMPORTANT: Write in professional business English throughout. Be substantive, analytical, and actionable for business leaders.

Respond in JSON format:
{
  "insights": ["insight1", "insight2", "insight3", "insight4", "insight5", "insight6"],
  "macroEconomic": "comprehensive macro & policy analysis (600-800 chars)...",
  "deals": "corporate & market highlights (500-700 chars) or empty string if none",
  "sectors": "sector & industry analysis (500-700 chars) or empty string if none",
  "regional": "regional & geopolitical trends (500-700 chars) or empty string if none"
}

Focus on what matters for business leaders' strategic decisions with rich context and analysis.`;

    const response = callChatGPT(prompt, 2500);

    try {
      // Remove markdown code block wrapper if present
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
      }

      const summary = JSON.parse(cleanedResponse);
      return {
        headline: 'Global News Headlines',
        insights: summary.insights || [],
        macroEconomic: summary.macroEconomic || '',
        deals: summary.deals || '',
        sectors: summary.sectors || '',
        regional: summary.regional || ''
      };
    } catch (e) {
      // Fallback if JSON parsing fails
      Logger.log('JSON parse error: ' + e.toString());
      return {
        headline: 'Global News Headlines',
        insights: ['Unable to generate summary - check OpenAI response format'],
        macroEconomic: '',
        deals: '',
        sectors: '',
        regional: ''
      };
    }

  } catch (error) {
    Logger.log(`AI summary error: ${error.toString()}`);
    return {
      headline: 'Global News Headlines',
      insights: ['Error generating AI summary'],
      macroEconomic: '',
      deals: '',
      sectors: '',
      regional: ''
    };
  }
}

/**
 * Format market data for AI context
 */
function formatMarketContextForAI(marketData) {
  let context = '';

  // US Markets
  if (marketData.usStocks && marketData.usStocks.length > 0) {
    context += 'US Markets: ';
    marketData.usStocks.forEach(stock => {
      if (stock && stock.price != null) {
        const change = stock.dayChange >= 0 ? `+${stock.dayChange.toFixed(2)}%` : `${stock.dayChange.toFixed(2)}%`;
        context += `${stock.name} ${change}, `;
      }
    });
    context = context.slice(0, -2) + '\n';
  }

  // Korea Markets
  if (marketData.koreaStocks && marketData.koreaStocks.length > 0) {
    context += 'Korea Markets: ';
    marketData.koreaStocks.forEach(stock => {
      if (stock && stock.price != null) {
        const change = stock.dayChange >= 0 ? `+${stock.dayChange.toFixed(2)}%` : `${stock.dayChange.toFixed(2)}%`;
        context += `${stock.name} ${change}, `;
      }
    });
    context = context.slice(0, -2) + '\n';
  }

  // Crypto
  if (marketData.crypto && marketData.crypto.length > 0) {
    marketData.crypto.forEach(crypto => {
      if (crypto && crypto.price != null) {
        const change = crypto.dayChange >= 0 ? `+${crypto.dayChange.toFixed(2)}%` : `${crypto.dayChange.toFixed(2)}%`;
        context += `Bitcoin: $${crypto.price.toFixed(0)} (${change})\n`;
      }
    });
  }

  return context || 'Market data unavailable';
}

/**
 * Call ChatGPT API
 */
function callChatGPT(prompt, maxTokens = 500) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const payload = {
    model: CONFIG.GPT_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an executive analyst for global business leaders. Provide substantive, actionable insights on economics, policy, and strategic business developments in professional English.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: CONFIG.GPT_TEMPERATURE,
    max_tokens: maxTokens
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());

  if (json.error) {
    throw new Error(json.error.message);
  }

  return json.choices[0].message.content.trim();
}

// ==================== SLACK FORMATTING ====================

/**
 * Format message for Slack
 */
function formatSlackMessage(aiSummary, articles, marketData, trumpActivity) {
  const blocks = [];
  const today = Utilities.formatDate(new Date(), 'GMT+9', 'yyyy년 MM월 dd일 EEEE');

  // Header
  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: `📰 ${aiSummary.headline}`,
      emoji: true
    }
  });

  blocks.push({
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: `${today} | Global Business Leaders Brief`
    }]
  });

  blocks.push({ type: 'divider' });

  // AI Summary - Executive Briefing (combine title and content in single blocks)

  // Key insights
  if (aiSummary.insights && aiSummary.insights.length > 0) {
    const insightsText = aiSummary.insights.map(i => `• ${i}`).join('\n');
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🎯 Today's Key Insights*\n${insightsText}`
      }
    });
  }

  // Macro-economic & policy impact
  if (aiSummary.macroEconomic) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*📊 Macro-Economic & Policy Impact*\n${aiSummary.macroEconomic}`
      }
    });
  }

  // Corporate & market highlights
  if (aiSummary.deals) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*💼 Corporate & Market Highlights*\n${aiSummary.deals}`
      }
    });
  }

  // Sector & industry spotlight
  if (aiSummary.sectors) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🏭 Sector & Industry Spotlight*\n${aiSummary.sectors}`
      }
    });
  }

  // Regional & geopolitical trends
  if (aiSummary.regional) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🌍 Regional & Geopolitical Trends*\n${aiSummary.regional}`
      }
    });
  }

  blocks.push({ type: 'divider' });

  // Market Data (combine title and content)
  const marketText = formatMarketData(marketData);
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*📈 Market Indicators*\n${marketText}`
    }
  });

  blocks.push({ type: 'divider' });

  // Trump Activity (combine title and content)
  if (trumpActivity.newsCount > 0) {
    const trumpText = trumpActivity.headlines
      .map(h => `• <${h.link}|${h.title}>`)
      .join('\n');

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🏛️ Trump Administration Updates*\n${trumpText}`
      }
    });

    blocks.push({ type: 'divider' });
  }

  // All Articles (no language separation)
  if (articles.length > 0) {
    // Split articles into chunks to avoid Slack's 3000 char limit per block
    const CHARS_PER_BLOCK = 2800; // Safety margin
    const titleText = '*📑 Top Headlines*\n';
    let currentChunk = [titleText];
    let currentLength = titleText.length;

    articles.forEach((article, index) => {
      const shouldShowSource = !article.source.toLowerCase().includes('google news') &&
                               !article.source.includes('네이버');
      const sourceText = shouldShowSource ? `\n_${article.source}_` : '';
      const articleText = `*${index + 1}. <${article.link}|${article.title}>*${sourceText}`;
      const articleLength = articleText.length + 1; // +1 for newline

      if (currentLength + articleLength > CHARS_PER_BLOCK && currentChunk.length > 1) {
        // Push current chunk as a block
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: currentChunk.join('\n')
          }
        });
        currentChunk = [articleText];
        currentLength = articleLength;
      } else {
        currentChunk.push(articleText);
        currentLength += articleLength;
      }
    });

    // Push remaining chunk
    if (currentChunk.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: currentChunk.join('\n')
        }
      });
    }
  }

  // Footer
  blocks.push({ type: 'divider' });
  blocks.push({
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: `Generated by Global News AI | Last 24 hours | Powered by ChatGPT`
    }]
  });

  return { blocks: blocks };
}

/**
 * Format market data for display
 */
function formatMarketData(marketData) {
  let text = '';

  // US Stocks
  if (marketData.usStocks && marketData.usStocks.length > 0) {
    text += '*US Markets*\n';
    marketData.usStocks.forEach(stock => {
      if (stock && stock.price != null && !isNaN(stock.price)) {
        const dayEmoji = stock.dayChange >= 0 ? '📈' : '📉';
        const weekEmoji = stock.weekChange >= 0 ? '⬆️' : '⬇️';
        const price = stock.price.toFixed(2);
        const dayChange = (stock.dayChange != null && !isNaN(stock.dayChange)) ? stock.dayChange.toFixed(2) : '0.00';
        const weekChange = (stock.weekChange != null && !isNaN(stock.weekChange)) ? stock.weekChange.toFixed(2) : '0.00';
        text += `${dayEmoji} ${stock.name}: ${price} (Day ${dayChange}% ${weekEmoji} Week ${weekChange}%)\n`;
      }
    });
    text += '\n';
  }

  // Korea Stocks
  if (marketData.koreaStocks && marketData.koreaStocks.length > 0) {
    text += '*Korea Markets*\n';
    marketData.koreaStocks.forEach(stock => {
      if (stock && stock.price != null && !isNaN(stock.price)) {
        const dayEmoji = stock.dayChange >= 0 ? '📈' : '📉';
        const price = stock.price.toFixed(2);
        const dayChange = (stock.dayChange != null && !isNaN(stock.dayChange)) ? stock.dayChange.toFixed(2) : '0.00';
        text += `${dayEmoji} ${stock.name}: ${price} (${stock.dayChange >= 0 ? '+' : ''}${dayChange}%)\n`;
      }
    });
    text += '\n';
  }

  // Forex
  if (marketData.forex && marketData.forex.length > 0) {
    text += '*FX*\n';
    marketData.forex.forEach(fx => {
      if (fx && fx.price != null && !isNaN(fx.price)) {
        const emoji = fx.dayChange >= 0 ? '📈' : '📉';
        const price = fx.price.toFixed(2);
        const dayChange = (fx.dayChange != null && !isNaN(fx.dayChange)) ? fx.dayChange.toFixed(2) : '0.00';
        text += `${emoji} USD/KRW: ${price} (${fx.dayChange >= 0 ? '+' : ''}${dayChange}%)\n`;
      }
    });
    text += '\n';
  }

  // Crypto
  if (marketData.crypto && marketData.crypto.length > 0) {
    text += '*Crypto*\n';
    marketData.crypto.forEach(crypto => {
      if (crypto && crypto.price != null && !isNaN(crypto.price)) {
        const emoji = crypto.dayChange >= 0 ? '🚀' : '⬇️';
        const price = crypto.price.toFixed(0);
        const dayChange = (crypto.dayChange != null && !isNaN(crypto.dayChange)) ? crypto.dayChange.toFixed(2) : '0.00';
        text += `${emoji} Bitcoin: $${price} (${crypto.dayChange >= 0 ? '+' : ''}${dayChange}%)\n`;
      }
    });
  }

  return text || 'Market data unavailable';
}

/**
 * Get emoji for article category
 */
function getEmojiForCategory(category) {
  const emojiMap = {
    'business': '💼',
    'markets': '📊',
    'economy': '💰',
    'tech': '💻',
    'politics': '🏛️'
  };
  return emojiMap[category] || '📰';
}

/**
 * Format time ago
 */
function formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}일 전`;
  }
}

// ==================== SLACK SENDING ====================

/**
 * Send message to Slack
 */
function sendToSlack(message) {
  if (!CONFIG.SLACK_WEBHOOK_URL || CONFIG.SLACK_WEBHOOK_URL === 'YOUR_SLACK_WEBHOOK_URL_HERE') {
    Logger.log('Slack webhook not configured!');
    Logger.log('Message preview:');
    Logger.log(JSON.stringify(message, null, 2));
    return;
  }

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(message),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(CONFIG.SLACK_WEBHOOK_URL, options);

  if (response.getResponseCode() !== 200) {
    throw new Error(`Slack error: ${response.getContentText()}`);
  }

  Logger.log('Message sent to Slack successfully!');
}

/**
 * Send error notification to Slack
 */
function sendErrorToSlack(error) {
  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '❌ Global News Summary Error',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Error:* ${error.toString()}\n*Time:* ${new Date().toISOString()}`
        }
      }
    ]
  };

  try {
    sendToSlack(message);
  } catch (e) {
    Logger.log('Failed to send error to Slack: ' + e.toString());
  }
}

// ==================== TESTING & UTILITIES ====================

/**
 * Test function - run this to test the script
 */
function testScript() {
  Logger.log('🧪 Testing Global News Summary...\n');

  // Test configuration
  Logger.log('1. Testing configuration...');
  if (CONFIG.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    Logger.log('⚠️  OpenAI API key not set');
  } else {
    Logger.log('✅ OpenAI API key configured');
  }

  if (CONFIG.SLACK_WEBHOOK_URL === 'YOUR_SLACK_WEBHOOK_URL_HERE') {
    Logger.log('⚠️  Slack webhook not set');
  } else {
    Logger.log('✅ Slack webhook configured');
  }

  // Test news fetching
  Logger.log('\n2. Testing news sources...');
  const testSource = NEWS_SOURCES[0];
  Logger.log(`Testing ${testSource.name}...`);
  const articles = fetchRSSFeed(testSource);
  Logger.log(`✅ Fetched ${articles.length} articles from ${testSource.name}`);

  if (articles.length > 0) {
    Logger.log(`Sample article: ${articles[0].title}`);
  }

  // Test market data
  Logger.log('\n3. Testing market data...');
  const marketData = fetchYahooFinanceData('^GSPC');
  if (marketData) {
    Logger.log(`✅ S&P 500: ${marketData.price} (${marketData.dayChange.toFixed(2)}%)`);
  } else {
    Logger.log('⚠️  Market data fetch failed');
  }

  Logger.log('\n✅ Test complete! You can now run sendDailyNewsSummary()');
}

/**
 * Create time-based trigger
 * Run this once to set up daily automation
 */
function createDailyTrigger() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'sendDailyNewsSummary') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new trigger - runs every day at 8:00 AM
  ScriptApp.newTrigger('sendDailyNewsSummary')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();

  Logger.log('✅ Daily trigger created! Will run at 8:00 AM every day.');
}

/**
 * Manual test with sample data
 */
function quickTest() {
  Logger.log('Running quick test...');

  const sampleArticles = [
    {
      source: 'Test Source',
      title: 'Test Article',
      link: 'https://example.com',
      description: 'Test description',
      publishedAt: new Date(),
      category: 'business',
      score: 5
    }
  ];

  const sampleMarket = {
    usStocks: [],
    koreaStocks: [],
    crypto: [],
    forex: []
  };

  const sampleTrump = {
    newsCount: 0,
    headlines: []
  };

  const aiSummary = {
    headline: 'Global News Headlines',
    insights: ['Test insight 1', 'Test insight 2'],
    macroEconomic: 'Test macro economic analysis',
    deals: 'Test deal highlights',
    sectors: 'Test sector spotlight',
    regional: 'Test regional trends'
  };

  const message = formatSlackMessage(aiSummary, sampleArticles, sampleMarket, sampleTrump);
  Logger.log(JSON.stringify(message, null, 2));
  Logger.log('\n✅ Quick test complete!');
}
