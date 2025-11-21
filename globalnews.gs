/**
 * Global News Summary for Private Equity Professionals
 * Version 3.0 - Multi-Section Edition
 *
 * Sections:
 * 1. Global Top Headlines - Major world business/economic news
 * 2. Korea Top Headlines - Korea-specific business news
 * 3. PE Specific News - M&A, deals, private equity focus
 *
 * Required Configuration:
 * 1. Set your OpenAI API Key in OPENAI_API_KEY
 * 2. Set your Slack Webhook URL in SLACK_WEBHOOK_URL
 * 3. Deploy as time-triggered function (daily at desired time)
 */

// ==================== CONFIGURATION ====================

const CONFIG = {
  // API Keys
  OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE',
  SLACK_WEBHOOK_URL: 'YOUR_SLACK_WEBHOOK_URL_HERE',

  // ChatGPT Settings
  GPT_MODEL: 'gpt-4-turbo-preview',
  GPT_TEMPERATURE: 0.3,

  // Time Range (hours)
  NEWS_HOURS_BACK: 24,

  // News Settings
  MAX_ARTICLES_PER_SOURCE: 15,
  SIMILARITY_THRESHOLD: 0.7,

  // Section-specific limits
  GLOBAL_TOP_HEADLINES: 15,
  KOREA_TOP_HEADLINES: 10,
  PE_SPECIFIC_NEWS: 10,

  // Market Data
  MARKET_SYMBOLS: {
    US_STOCKS: ['^GSPC', '^DJI', '^IXIC'],
    KOREA_STOCKS: ['^KS11', '^KQ11'],
    CRYPTO: ['BTC-USD'],
    FOREX: ['KRW=X']
  }
};

// ==================== NEWS SOURCES ====================

const NEWS_SOURCES = [
  // =================================================
  // SECTION 1: GLOBAL TOP HEADLINES
  // =================================================

  // --- Wall Street Journal ---
  {
    name: 'WSJ - World News',
    type: 'rss',
    url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
    section: 'global',
    tier: 1
  },
  {
    name: 'WSJ - Markets',
    type: 'rss',
    url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
    section: 'global',
    tier: 1
  },
  {
    name: 'WSJ - Business',
    type: 'rss',
    url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml',
    section: 'global',
    tier: 1
  },

  // --- New York Times ---
  {
    name: 'NYT - Business',
    type: 'rss',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
    section: 'global',
    tier: 1
  },
  {
    name: 'NYT - World',
    type: 'rss',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    section: 'global',
    tier: 1
  },
  {
    name: 'NYT - Economy',
    type: 'rss',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml',
    section: 'global',
    tier: 1
  },

  // --- Financial Times ---
  {
    name: 'FT - World',
    type: 'rss',
    url: 'https://www.ft.com/world?format=rss',
    section: 'global',
    tier: 1
  },
  {
    name: 'FT - Companies',
    type: 'rss',
    url: 'https://www.ft.com/companies?format=rss',
    section: 'global',
    tier: 1
  },
  {
    name: 'FT - Markets',
    type: 'rss',
    url: 'https://www.ft.com/markets?format=rss',
    section: 'global',
    tier: 1
  },

  // --- Bloomberg (via Google News) ---
  {
    name: 'Bloomberg Business',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:bloomberg.com+(markets+OR+economy+OR+business)&hl=en-US&gl=US&ceid=US:en',
    section: 'global',
    tier: 1
  },

  // --- Reuters ---
  {
    name: 'Reuters Business',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:reuters.com+(business+OR+markets+OR+economy)&hl=en-US&gl=US&ceid=US:en',
    section: 'global',
    tier: 1
  },

  // --- The Economist ---
  {
    name: 'The Economist',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:economist.com&hl=en-US&gl=US&ceid=US:en',
    section: 'global',
    tier: 1
  },

  // --- Washington Post ---
  {
    name: 'WaPo - Business',
    type: 'rss',
    url: 'https://feeds.washingtonpost.com/rss/business',
    section: 'global',
    tier: 1
  },

  // --- BBC ---
  {
    name: 'BBC - Business',
    type: 'rss',
    url: 'http://feeds.bbci.co.uk/news/business/rss.xml',
    section: 'global',
    tier: 2
  },

  // --- CNBC ---
  {
    name: 'CNBC - Top News',
    type: 'rss',
    url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    section: 'global',
    tier: 2
  },

  // --- MarketWatch ---
  {
    name: 'MarketWatch',
    type: 'rss',
    url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories',
    section: 'global',
    tier: 2
  },

  // --- Guardian ---
  {
    name: 'Guardian - Business',
    type: 'rss',
    url: 'https://www.theguardian.com/uk/business/rss',
    section: 'global',
    tier: 2
  },

  // --- Axios ---
  {
    name: 'Axios',
    type: 'rss',
    url: 'https://api.axios.com/feed/',
    section: 'global',
    tier: 2
  },

  // --- Tech News (for global section) ---
  {
    name: 'TechCrunch',
    type: 'rss',
    url: 'https://techcrunch.com/feed/',
    section: 'global',
    tier: 2
  },

  // --- Nikkei Asia ---
  {
    name: 'Nikkei Asia',
    type: 'rss',
    url: 'https://asia.nikkei.com/rss/feed/nar',
    section: 'global',
    tier: 2
  },

  // --- South China Morning Post ---
  {
    name: 'SCMP - Business',
    type: 'rss',
    url: 'https://www.scmp.com/rss/91/feed',
    section: 'global',
    tier: 2
  },

  // =================================================
  // SECTION 2: KOREA TOP HEADLINES
  // =================================================

  // --- Korea Herald ---
  {
    name: 'Korea Herald - Business',
    type: 'rss',
    url: 'http://www.koreaherald.com/rss/020100000000.xml',
    section: 'korea',
    tier: 1
  },
  {
    name: 'Korea Herald - Finance',
    type: 'rss',
    url: 'http://www.koreaherald.com/rss/020200000000.xml',
    section: 'korea',
    tier: 1
  },
  {
    name: 'Korea Herald - IT',
    type: 'rss',
    url: 'http://www.koreaherald.com/rss/020400000000.xml',
    section: 'korea',
    tier: 1
  },

  // --- Korea Times ---
  {
    name: 'Korea Times - Business',
    type: 'rss',
    url: 'https://www.koreatimes.co.kr/www/rss/biz.xml',
    section: 'korea',
    tier: 1
  },
  {
    name: 'Korea Times - Finance',
    type: 'rss',
    url: 'https://www.koreatimes.co.kr/www/rss/finance.xml',
    section: 'korea',
    tier: 1
  },

  // --- Yonhap ---
  {
    name: 'Yonhap - Business',
    type: 'rss',
    url: 'https://en.yna.co.kr/RSS/business.xml',
    section: 'korea',
    tier: 1
  },
  {
    name: 'Yonhap - Economy',
    type: 'rss',
    url: 'https://en.yna.co.kr/RSS/economy.xml',
    section: 'korea',
    tier: 1
  },

  // --- Korea JoongAng Daily ---
  {
    name: 'JoongAng Daily',
    type: 'rss',
    url: 'https://koreajoongangdaily.joins.com/RSS/allArticle.xml',
    section: 'korea',
    tier: 1
  },

  // --- Google News Korea ---
  {
    name: 'Google News - Korea Business',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=korea+business+OR+samsung+OR+hyundai+OR+sk+OR+lg&hl=en-US&gl=US&ceid=US:en',
    section: 'korea',
    tier: 2
  },

  // --- SCMP Korea Coverage ---
  {
    name: 'SCMP - Korea',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:scmp.com+korea&hl=en-US&gl=US&ceid=US:en',
    section: 'korea',
    tier: 2
  },

  // --- Nikkei Korea Coverage ---
  {
    name: 'Nikkei - Korea',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:asia.nikkei.com+korea&hl=en-US&gl=US&ceid=US:en',
    section: 'korea',
    tier: 2
  },

  // =================================================
  // SECTION 3: PE SPECIFIC NEWS
  // =================================================

  // --- M&A and Deals ---
  {
    name: 'PE/M&A Deals - Premium',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=(merger+OR+acquisition+OR+buyout+OR+%22private+equity%22+OR+takeover)+site:wsj.com+OR+site:ft.com+OR+site:bloomberg.com+OR+site:reuters.com&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // --- IPO News ---
  {
    name: 'IPO & Listings',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=(ipo+OR+listing+OR+%22going+public%22+OR+spac)+site:wsj.com+OR+site:ft.com+OR+site:bloomberg.com&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // --- Venture Capital ---
  {
    name: 'Venture Capital',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=(%22venture+capital%22+OR+funding+OR+series+OR+startup+investment)+(site:techcrunch.com+OR+site:bloomberg.com+OR+site:wsj.com)&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // --- Corporate Restructuring ---
  {
    name: 'Restructuring & Bankruptcy',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=(restructuring+OR+bankruptcy+OR+distressed+OR+creditor)+(site:wsj.com+OR+site:ft.com+OR+site:reuters.com)&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // --- Activist Investors ---
  {
    name: 'Activist Investors',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=(%22activist+investor%22+OR+%22hedge+fund%22+OR+%22shareholder+activist%22)+(site:wsj.com+OR+site:bloomberg.com+OR+site:reuters.com)&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // --- Leveraged Finance ---
  {
    name: 'Leveraged Finance',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=(leveraged+OR+lbo+OR+%22high+yield%22+OR+%22junk+bond%22)+(site:wsj.com+OR+site:ft.com+OR+site:bloomberg.com)&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // --- PE Exits ---
  {
    name: 'PE Exits & Returns',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=(%22private+equity%22+exit+OR+secondary+sale+OR+portfolio+company)+(site:wsj.com+OR+site:ft.com+OR+site:bloomberg.com)&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // --- Infrastructure & Real Assets ---
  {
    name: 'Infrastructure Deals',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=(infrastructure+OR+%22real+assets%22+OR+renewable)+(investment+OR+acquisition)+(site:ft.com+OR+site:bloomberg.com+OR+site:reuters.com)&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // --- Valuation & Pricing ---
  {
    name: 'Valuation News',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=(valuation+OR+multiple+OR+%22enterprise+value%22)+(acquisition+OR+merger)+(site:wsj.com+OR+site:bloomberg.com)&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // --- Tech M&A ---
  {
    name: 'Tech M&A',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=(tech+OR+software+OR+saas)+(merger+OR+acquisition+OR+buyout)+(site:techcrunch.com+OR+site:bloomberg.com+OR+site:wsj.com)&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  }
];

// ==================== MAIN FUNCTION ====================

function sendDailyNewsSummary() {
  try {
    Logger.log('🚀 Starting Global News Summary v3.0...');

    // 1. Fetch all news articles
    const allArticles = fetchAllNews();
    Logger.log(`📰 Fetched ${allArticles.length} total articles`);

    // 2. Separate by section and process
    const globalArticles = processArticlesBySection(
      allArticles.filter(a => a.section === 'global'),
      CONFIG.GLOBAL_TOP_HEADLINES,
      'global'
    );
    Logger.log(`✅ Global: ${globalArticles.length} articles`);

    const koreaArticles = processArticlesBySection(
      allArticles.filter(a => a.section === 'korea'),
      CONFIG.KOREA_TOP_HEADLINES,
      'korea'
    );
    Logger.log(`✅ Korea: ${koreaArticles.length} articles`);

    const peArticles = processArticlesBySection(
      allArticles.filter(a => a.section === 'pe'),
      CONFIG.PE_SPECIFIC_NEWS,
      'pe'
    );
    Logger.log(`✅ PE Specific: ${peArticles.length} articles`);

    // 3. Get market data
    const marketData = fetchMarketData();
    Logger.log('📊 Market data fetched');

    // 4. Generate AI summary
    const aiSummary = generateAISummary(
      globalArticles,
      koreaArticles,
      peArticles,
      marketData
    );
    Logger.log('🤖 AI summary generated');

    // 5. Format and send to Slack
    const message = formatSlackMessage(
      aiSummary,
      globalArticles,
      koreaArticles,
      peArticles,
      marketData
    );
    sendToSlack(message);

    Logger.log('✅ Daily news summary sent successfully!');

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    sendErrorToSlack(error);
  }
}

// ==================== NEWS FETCHING ====================

function fetchAllNews() {
  const allArticles = [];
  const cutoffTime = new Date(Date.now() - CONFIG.NEWS_HOURS_BACK * 60 * 60 * 1000);

  NEWS_SOURCES.forEach(source => {
    try {
      let articles = fetchRSSFeed(source);

      // Filter by time
      articles = articles.filter(article =>
        new Date(article.publishedAt) > cutoffTime
      );

      // Limit per source
      articles = articles.slice(0, CONFIG.MAX_ARTICLES_PER_SOURCE);

      // Add section info
      articles.forEach(article => {
        article.section = source.section;
      });

      allArticles.push(...articles);

      Logger.log(`✓ ${source.name}: ${articles.length} articles (${source.section})`);

    } catch (error) {
      Logger.log(`✗ Error fetching ${source.name}: ${error.toString()}`);
    }
  });

  return allArticles;
}

function fetchRSSFeed(source) {
  try {
    const response = UrlFetchApp.fetch(source.url, {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
      }
    });

    if (response.getResponseCode() !== 200) {
      throw new Error(`HTTP ${response.getResponseCode()}`);
    }

    const xml = response.getContentText();
    const document = XmlService.parse(xml);
    const root = document.getRootElement();

    let items;
    if (root.getChild('channel')) {
      items = root.getChild('channel').getChildren('item');
    } else {
      const namespace = root.getNamespace();
      items = root.getChildren('entry', namespace);
    }

    const articles = [];

    items.forEach(item => {
      try {
        let link = getElementText(item, 'link');
        if (!link) {
          const linkElement = item.getChild('link');
          if (linkElement) {
            link = linkElement.getAttribute('href')?.getValue() || linkElement.getText();
          }
        }

        const article = {
          source: extractSourceName(source.name, link),
          title: cleanTitle(getElementText(item, 'title')),
          link: link,
          description: cleanDescription(getElementText(item, 'description') || getElementText(item, 'summary')),
          publishedAt: parseDate(getElementText(item, 'pubDate') || getElementText(item, 'published') || getElementText(item, 'updated')),
          sourceTier: source.tier || 2,
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

function extractSourceName(feedName, link) {
  if (feedName.includes('Google News') || feedName.includes('PE/M&A') || feedName.includes('IPO') || feedName.includes('Venture')) {
    if (link) {
      if (link.includes('wsj.com')) return 'WSJ';
      if (link.includes('ft.com')) return 'FT';
      if (link.includes('bloomberg.com')) return 'Bloomberg';
      if (link.includes('reuters.com')) return 'Reuters';
      if (link.includes('nytimes.com')) return 'NYT';
      if (link.includes('economist.com')) return 'Economist';
      if (link.includes('techcrunch.com')) return 'TechCrunch';
      if (link.includes('koreaherald.com')) return 'Korea Herald';
      if (link.includes('koreatimes.co.kr')) return 'Korea Times';
      if (link.includes('yna.co.kr')) return 'Yonhap';
    }
  }

  // Remove all category/section suffixes
  return feedName
    .replace(/Google News - /g, '')
    .replace(/ - World News/g, '')
    .replace(/ - World/g, '')
    .replace(/ - Markets/g, '')
    .replace(/ - Business/g, '')
    .replace(/ - Finance/g, '')
    .replace(/ - IT/g, '')
    .replace(/ - Economy/g, '')
    .replace(/ - Technology/g, '')
    .replace(/ - Companies/g, '')
    .replace(/ - Top News/g, '')
    .replace(/ - Top Stories/g, '')
    .replace(/ - Premium/g, '')
    .replace(/PE\/M&A Deals - Premium/g, 'Various')
    .replace(/IPO & Listings/g, 'Various')
    .replace(/Venture Capital/g, 'Various')
    .replace(/Restructuring & Bankruptcy/g, 'Various')
    .replace(/Activist Investors/g, 'Various')
    .replace(/Leveraged Finance/g, 'Various')
    .replace(/PE Exits & Returns/g, 'Various')
    .replace(/Infrastructure Deals/g, 'Various')
    .replace(/Valuation News/g, 'Various')
    .replace(/Tech M&A/g, 'Various')
    .trim();
}

function cleanTitle(title) {
  if (!title) return '';
  return title
    .replace(/ - WSJ$/, '')
    .replace(/ - The New York Times$/, '')
    .replace(/ - Financial Times$/, '')
    .replace(/ \| .*$/, '')
    .trim();
}

function cleanDescription(desc) {
  if (!desc) return '';
  return desc.replace(/<[^>]*>/g, '').trim();
}

function getElementText(element, childName) {
  const child = element.getChild(childName);
  return child ? child.getText() : null;
}

function parseDate(dateStr) {
  if (!dateStr) return new Date();
  return new Date(dateStr);
}

// ==================== ARTICLE PROCESSING ====================

function processArticlesBySection(articles, limit, sectionType) {
  // Score articles based on section type
  articles.forEach(article => {
    article.score = scoreArticleBySection(article, sectionType);
  });

  // Sort by score
  articles.sort((a, b) => b.score - a.score);

  // Remove duplicates
  const uniqueArticles = removeDuplicates(articles);

  // Return top N
  return uniqueArticles.slice(0, limit);
}

function scoreArticleBySection(article, sectionType) {
  let score = 0;
  const text = (article.title + ' ' + (article.description || '')).toLowerCase();

  // Base score by source tier
  if (article.sourceTier === 1) {
    score += 40;
  } else {
    score += 20;
  }

  // Source-specific bonuses
  const source = article.source.toLowerCase();
  if (source.includes('wsj') || source.includes('wall street')) score += 15;
  else if (source.includes('ft') || source.includes('financial times')) score += 15;
  else if (source.includes('bloomberg')) score += 12;
  else if (source.includes('economist')) score += 12;
  else if (source.includes('nyt') || source.includes('new york times')) score += 10;
  else if (source.includes('reuters')) score += 10;

  // Section-specific scoring
  if (sectionType === 'global') {
    // Global economics, policy, major corporations
    const globalKeywords = [
      'fed', 'federal reserve', 'interest rate', 'inflation', 'gdp',
      'central bank', 'economy', 'trade war', 'tariff', 'china',
      'recession', 'growth', 'treasury', 'bond'
    ];
    globalKeywords.forEach(kw => {
      if (text.includes(kw)) score += 5;
    });

    // Major companies
    const majorCompanies = ['apple', 'microsoft', 'google', 'amazon', 'meta', 'tesla', 'nvidia'];
    majorCompanies.forEach(co => {
      if (text.includes(co)) score += 3;
    });
  }

  if (sectionType === 'korea') {
    // Korea-specific scoring
    const koreaKeywords = [
      'samsung', 'hyundai', 'sk', 'lg', 'korea', 'korean',
      'kospi', 'kosdaq', 'seoul', 'chaebol', 'kdb', 'k-chip'
    ];
    koreaKeywords.forEach(kw => {
      if (text.includes(kw)) score += 8;
    });

    // Korea business leaders
    if (text.includes('lee jae-yong') || text.includes('chung eui-sun')) score += 5;
  }

  if (sectionType === 'pe') {
    // PE-specific scoring (highest weights)
    const peKeywords = [
      'private equity', 'buyout', 'lbo', 'pe firm',
      'merger', 'acquisition', 'm&a', 'takeover', 'deal',
      'ipo', 'listing', 'going public', 'spac',
      'venture capital', 'vc', 'funding', 'series',
      'valuation', 'multiple', 'ebitda', 'enterprise value',
      'restructuring', 'bankruptcy', 'distressed',
      'activist', 'shareholder', 'proxy',
      'leveraged', 'debt', 'credit', 'covenant',
      'portfolio company', 'exit', 'secondary'
    ];
    peKeywords.forEach(kw => {
      if (text.includes(kw)) score += 10;
    });

    // Major PE firms
    const peFirms = [
      'blackstone', 'kkr', 'carlyle', 'apollo', 'tpg',
      'warburg', 'advent', 'vista', 'thoma bravo', 'silver lake'
    ];
    peFirms.forEach(firm => {
      if (text.includes(firm)) score += 8;
    });
  }

  // Recency bonus
  const hoursAgo = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 3) score += 8;
  else if (hoursAgo < 6) score += 4;

  return score;
}

function removeDuplicates(articles) {
  const unique = [];
  const seen = new Set();

  for (const article of articles) {
    const titleNormalized = normalizeTitle(article.title);

    if (seen.has(titleNormalized)) {
      continue;
    }

    let isSimilar = false;
    for (const existingArticle of unique) {
      if (calculateSimilarity(article.title, existingArticle.title) > CONFIG.SIMILARITY_THRESHOLD) {
        if (article.score > existingArticle.score) {
          const index = unique.indexOf(existingArticle);
          unique[index] = article;
        }
        isSimilar = true;
        break;
      }
    }

    if (!isSimilar) {
      unique.push(article);
      seen.add(titleNormalized);
    }
  }

  unique.sort((a, b) => b.score - a.score);

  return unique;
}

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();
}

function calculateSimilarity(str1, str2) {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

// ==================== MARKET DATA ====================

function fetchMarketData() {
  return {
    usStocks: fetchStockData(CONFIG.MARKET_SYMBOLS.US_STOCKS),
    koreaStocks: fetchStockData(CONFIG.MARKET_SYMBOLS.KOREA_STOCKS),
    crypto: fetchStockData(CONFIG.MARKET_SYMBOLS.CRYPTO),
    forex: fetchStockData(CONFIG.MARKET_SYMBOLS.FOREX)
  };
}

function fetchStockData(symbols) {
  const stockData = [];
  symbols.forEach(symbol => {
    try {
      const data = fetchYahooFinanceData(symbol);
      if (data) stockData.push(data);
    } catch (error) {
      Logger.log(`Error fetching ${symbol}: ${error.toString()}`);
    }
  });
  return stockData;
}

function fetchYahooFinanceData(symbol) {
  try {
    const encodedSymbol = encodeURIComponent(symbol);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodedSymbol}?range=1mo&interval=1d`;

    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });

    if (response.getResponseCode() !== 200) return null;

    const json = JSON.parse(response.getContentText());
    if (!json.chart || !json.chart.result || json.chart.result.length === 0) return null;

    const result = json.chart.result[0];
    const meta = result.meta;

    if (!meta || !result.indicators || !result.indicators.quote || result.indicators.quote.length === 0) return null;

    const quotes = result.indicators.quote[0];
    if (!quotes.close || quotes.close.length === 0) return null;

    const allPrices = quotes.close.filter(p => p != null && !isNaN(p));
    const recentPrices = allPrices.slice(-20);
    const currentPrice = meta.regularMarketPrice || allPrices[allPrices.length - 1];
    const previousClose = meta.previousClose || allPrices[allPrices.length - 2] || currentPrice;

    const dayChange = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
    const weekChange = calculateChange(recentPrices, 5);

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
      currency: meta.currency || 'USD'
    };

  } catch (error) {
    Logger.log(`Yahoo Finance error for ${symbol}: ${error.toString()}`);
    return null;
  }
}

function calculateChange(prices, days) {
  if (!prices || prices.length < 2 || prices.length < days) return 0;
  const current = prices[prices.length - 1];
  const previous = prices[prices.length - days];
  if (!current || !previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

// ==================== AI SUMMARY ====================

function generateAISummary(globalArticles, koreaArticles, peArticles, marketData) {
  if (!CONFIG.OPENAI_API_KEY || CONFIG.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    return {
      headline: 'Global News Headlines',
      insights: ['Configure OpenAI API key'],
      macroEconomic: '',
      deals: '',
      sectors: '',
      regional: ''
    };
  }

  try {
    const globalContext = globalArticles.slice(0, 10).map((a, i) => {
      const desc = a.description ? `\n   ${a.description.substring(0, 150)}` : '';
      return `${i + 1}. [${a.source}] ${a.title}${desc}`;
    }).join('\n\n');

    const koreaContext = koreaArticles.slice(0, 8).map((a, i) => {
      return `${i + 1}. [${a.source}] ${a.title}`;
    }).join('\n');

    const peContext = peArticles.slice(0, 8).map((a, i) => {
      return `${i + 1}. [${a.source}] ${a.title}`;
    }).join('\n');

    const marketContext = formatMarketContextForAI(marketData);

    const prompt = `You are an executive analyst for private equity professionals.
Analyze today's news across three sections and provide comprehensive intelligence.

=== MARKET DATA ===
${marketContext}

=== GLOBAL TOP HEADLINES ===
${globalContext}

=== KOREA HEADLINES ===
${koreaContext}

=== PE/M&A SPECIFIC NEWS ===
${peContext}

TASK: Synthesize into actionable intelligence for PE professionals:

1. **Key Insights** (6 bullets, 150-200 chars each)
   - Most important developments from ALL sections
   - Focus on: economic policy, major deals, market movements, Korea business, PE activity
   - Include specific details and business implications

2. **Macro-Economic & Policy** (700-900 chars)
   - Central bank actions, inflation, rates, fiscal policy
   - Government regulation and trade
   - How these affect investment strategy

3. **PE & Deal Activity** (600-800 chars)
   - M&A transactions, IPOs, buyouts
   - PE firm activity and exits
   - Valuation trends and market conditions
   - Include Korea deals if relevant

4. **Korea Business Focus** (500-700 chars)
   - Major Korea corporate developments
   - Samsung, Hyundai, SK, LG updates
   - Korea economic policy and markets
   - Cross-border implications

5. **Sector Trends** (500-700 chars or empty)
   - Which sectors seeing major activity
   - Technology, semiconductors, energy, etc.
   - Investment implications

Respond in JSON:
{
  "insights": ["insight1", "insight2", "insight3", "insight4", "insight5", "insight6"],
  "macroEconomic": "analysis...",
  "peDeals": "PE & deal analysis...",
  "korea": "Korea business focus...",
  "sectors": "sector trends or empty"
}`;

    const response = callChatGPT(prompt, 3500);

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
      peDeals: summary.peDeals || '',
      korea: summary.korea || '',
      sectors: summary.sectors || ''
    };

  } catch (error) {
    Logger.log(`AI summary error: ${error.toString()}`);
    return {
      headline: 'Global News Headlines',
      insights: ['Error generating summary'],
      macroEconomic: '',
      peDeals: '',
      korea: '',
      sectors: ''
    };
  }
}

function formatMarketContextForAI(marketData) {
  let context = '';

  if (marketData.usStocks && marketData.usStocks.length > 0) {
    context += 'US: ';
    marketData.usStocks.forEach(s => {
      if (s && s.price) {
        const chg = s.dayChange >= 0 ? `+${s.dayChange.toFixed(2)}%` : `${s.dayChange.toFixed(2)}%`;
        context += `${s.name} ${chg}, `;
      }
    });
    context = context.slice(0, -2) + '\n';
  }

  if (marketData.koreaStocks && marketData.koreaStocks.length > 0) {
    context += 'Korea: ';
    marketData.koreaStocks.forEach(s => {
      if (s && s.price) {
        const chg = s.dayChange >= 0 ? `+${s.dayChange.toFixed(2)}%` : `${s.dayChange.toFixed(2)}%`;
        context += `${s.name} ${chg}, `;
      }
    });
    context = context.slice(0, -2) + '\n';
  }

  if (marketData.crypto && marketData.crypto.length > 0) {
    marketData.crypto.forEach(c => {
      if (c && c.price) {
        const chg = c.dayChange >= 0 ? `+${c.dayChange.toFixed(2)}%` : `${c.dayChange.toFixed(2)}%`;
        context += `Bitcoin: $${c.price.toFixed(0)} (${chg})\n`;
      }
    });
  }

  return context || 'Market data unavailable';
}

function callChatGPT(prompt, maxTokens = 500) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const payload = {
    model: CONFIG.GPT_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an executive analyst for PE professionals. Provide specific, actionable insights on deals, economics, and business strategy.'
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

  if (json.error) throw new Error(json.error.message);

  return json.choices[0].message.content.trim();
}

// ==================== SLACK FORMATTING ====================

function formatSlackMessage(aiSummary, globalArticles, koreaArticles, peArticles, marketData) {
  const blocks = [];
  const today = Utilities.formatDate(new Date(), 'GMT+9', 'yyyy-MM-dd EEEE');

  // ==================== HEADER ====================
  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: '📰 Daily Global News Intelligence',
      emoji: true
    }
  });

  blocks.push({
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: `${today} | Sources: WSJ, FT, Bloomberg, NYT, Reuters, Economist + Korea Media`
    }]
  });

  blocks.push({ type: 'divider' });

  // ==================== MARKET INDICATORS ====================
  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: '📊 Market Overview',
      emoji: true
    }
  });

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: formatMarketData(marketData)
    }
  });

  blocks.push({ type: 'divider' });

  // ==================== EXECUTIVE SUMMARY ====================
  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: '🎯 Executive Summary',
      emoji: true
    }
  });

  // Key Insights
  if (aiSummary.insights && aiSummary.insights.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: "*Today's Key Insights*"
      }
    });
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: aiSummary.insights.map(i => `• ${i}`).join('\n')
      }
    });
  }

  // Macro-Economic
  if (aiSummary.macroEconomic) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Macro-Economic & Policy*'
      }
    });
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: aiSummary.macroEconomic
      }
    });
  }

  // PE & Deals
  if (aiSummary.peDeals) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*PE & Deal Activity*'
      }
    });
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: aiSummary.peDeals
      }
    });
  }

  // Korea Focus
  if (aiSummary.korea) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Korea Business Focus*'
      }
    });
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: aiSummary.korea
      }
    });
  }

  // Sector Trends
  if (aiSummary.sectors) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Sector & Industry Trends*'
      }
    });
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: aiSummary.sectors
      }
    });
  }

  blocks.push({ type: 'divider' });

  // ==================== SECTION 1: GLOBAL HEADLINES ====================
  if (globalArticles.length > 0) {
    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🌍 Global Business & Economy',
        emoji: true
      }
    });

    blocks.push({
      type: 'context',
      elements: [{
        type: 'mrkdwn',
        text: `Top ${globalArticles.length} stories from international business press`
      }]
    });

    const globalLines = globalArticles.map((a, i) =>
      `*${i + 1}.* <${a.link}|${a.title}> _— ${a.source}_`
    );

    addArticleBlocks(blocks, globalLines);

    blocks.push({ type: 'divider' });
  }

  // ==================== SECTION 2: KOREA HEADLINES ====================
  if (koreaArticles.length > 0) {
    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🇰🇷 Korea Business & Markets',
        emoji: true
      }
    });

    blocks.push({
      type: 'context',
      elements: [{
        type: 'mrkdwn',
        text: `Top ${koreaArticles.length} stories from Korean business media`
      }]
    });

    const koreaLines = koreaArticles.map((a, i) =>
      `*${i + 1}.* <${a.link}|${a.title}> _— ${a.source}_`
    );

    addArticleBlocks(blocks, koreaLines);

    blocks.push({ type: 'divider' });
  }

  // ==================== SECTION 3: PE/M&A NEWS ====================
  if (peArticles.length > 0) {
    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: '💼 Private Equity & M&A',
        emoji: true
      }
    });

    blocks.push({
      type: 'context',
      elements: [{
        type: 'mrkdwn',
        text: `Top ${peArticles.length} deals, transactions & PE activity`
      }]
    });

    const peLines = peArticles.map((a, i) =>
      `*${i + 1}.* <${a.link}|${a.title}> _— ${a.source}_`
    );

    addArticleBlocks(blocks, peLines);

    blocks.push({ type: 'divider' });
  }

  // ==================== FOOTER ====================
  blocks.push({
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: `🤖 Global News AI v3.0 | Analysis by GPT-4 | ${globalArticles.length + koreaArticles.length + peArticles.length} curated articles`
    }]
  });

  return { blocks: blocks };
}

function addArticleBlocks(blocks, articleLines) {
  const CHARS_PER_BLOCK = 2800;
  let currentChunk = [];
  let currentLength = 0;

  articleLines.forEach(line => {
    const lineLength = line.length + 1;

    if (currentLength + lineLength > CHARS_PER_BLOCK && currentChunk.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: currentChunk.join('\n')
        }
      });
      currentChunk = [line];
      currentLength = lineLength;
    } else {
      currentChunk.push(line);
      currentLength += lineLength;
    }
  });

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

function formatMarketData(marketData) {
  let text = '';

  if (marketData.usStocks && marketData.usStocks.length > 0) {
    text += '*US Markets*\n';
    marketData.usStocks.forEach(stock => {
      if (stock && stock.price != null) {
        const emoji = stock.dayChange >= 0 ? '📈' : '📉';
        const price = stock.price.toFixed(2);
        const day = stock.dayChange.toFixed(2);
        const week = stock.weekChange.toFixed(2);
        text += `${emoji} ${stock.name}: ${price} (Day ${day}% | Week ${week}%)\n`;
      }
    });
    text += '\n';
  }

  if (marketData.koreaStocks && marketData.koreaStocks.length > 0) {
    text += '*Korea Markets*\n';
    marketData.koreaStocks.forEach(stock => {
      if (stock && stock.price != null) {
        const emoji = stock.dayChange >= 0 ? '📈' : '📉';
        const price = stock.price.toFixed(2);
        const day = stock.dayChange.toFixed(2);
        const week = stock.weekChange.toFixed(2);
        text += `${emoji} ${stock.name}: ${price} (Day ${day}% | Week ${week}%)\n`;
      }
    });
    text += '\n';
  }

  if (marketData.forex && marketData.forex.length > 0) {
    text += '*FX*\n';
    marketData.forex.forEach(fx => {
      if (fx && fx.price != null) {
        const emoji = fx.dayChange >= 0 ? '📈' : '📉';
        text += `${emoji} USD/KRW: ${fx.price.toFixed(2)} (${fx.dayChange.toFixed(2)}%)\n`;
      }
    });
    text += '\n';
  }

  if (marketData.crypto && marketData.crypto.length > 0) {
    text += '*Crypto*\n';
    marketData.crypto.forEach(c => {
      if (c && c.price != null) {
        const emoji = c.dayChange >= 0 ? '📈' : '📉';
        text += `${emoji} Bitcoin: $${c.price.toFixed(0)} (${c.dayChange.toFixed(2)}%)\n`;
      }
    });
  }

  return text || 'Market data unavailable';
}

// ==================== SLACK SENDING ====================

function sendToSlack(message) {
  if (!CONFIG.SLACK_WEBHOOK_URL || CONFIG.SLACK_WEBHOOK_URL === 'YOUR_SLACK_WEBHOOK_URL_HERE') {
    Logger.log('Slack webhook not configured!');
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

  Logger.log('✅ Message sent to Slack successfully!');
}

function sendErrorToSlack(error) {
  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '❌ News Summary Error',
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

// ==================== TESTING ====================

function testScript() {
  Logger.log('🧪 Testing v3.0 Multi-Section...\n');

  Logger.log('1. Testing Global sources...');
  const globalSource = NEWS_SOURCES.find(s => s.section === 'global' && s.name.includes('WSJ'));
  if (globalSource) {
    const articles = fetchRSSFeed(globalSource);
    Logger.log(`✓ ${globalSource.name}: ${articles.length} articles`);
  }

  Logger.log('\n2. Testing Korea sources...');
  const koreaSource = NEWS_SOURCES.find(s => s.section === 'korea');
  if (koreaSource) {
    const articles = fetchRSSFeed(koreaSource);
    Logger.log(`✓ ${koreaSource.name}: ${articles.length} articles`);
  }

  Logger.log('\n3. Testing PE sources...');
  const peSource = NEWS_SOURCES.find(s => s.section === 'pe');
  if (peSource) {
    const articles = fetchRSSFeed(peSource);
    Logger.log(`✓ ${peSource.name}: ${articles.length} articles`);
  }

  Logger.log('\n✅ Test complete!');
}

function createDailyTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'sendDailyNewsSummary') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger('sendDailyNewsSummary')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();

  Logger.log('✅ Daily trigger created for 8:00 AM');
}
