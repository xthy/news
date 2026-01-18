/**
 * Global Headlines Summary for Business Leaders
 * Version 5.4 - Enhanced Quality Filtering
 *
 * Sections:
 * 1. International Headlines - Economy, policy, major events, crises (10 articles)
 * 2. Korea Headlines - Economy, policy, major events (10 articles)
 *
 * Focus: Must-know headlines, major global events, volatility drivers
 */

// ==================== CONFIGURATION ====================

const CONFIG = {
  // API Keys
  OPENAI_API_KEY: 'sk-proj-',
  PERPLEXITY_API_KEY: 'pplx-',
  SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/',

  // AI Settings
  GPT_MODEL: 'gpt-4-turbo-preview',
  GPT_TEMPERATURE: 0.3,
  PERPLEXITY_MODEL: 'sonar-pro',
  PERPLEXITY_TEMPERATURE: 0.2,

  // Time Range (hours)
  NEWS_HOURS_BACK: 24,

  // News Settings
  MAX_ARTICLES_PER_SOURCE: 15,
  SIMILARITY_THRESHOLD: 0.7,
  
  // Section-specific limits
  INTERNATIONAL_HEADLINES: 10,
  KOREA_HEADLINES: 10,

  // Pre-AI candidate pool
  CANDIDATE_POOL_SIZE: 30,
  PERPLEXITY_VALIDATION_POOL: 25,
  
  // Deduplication
  FINAL_DEDUP_THRESHOLD: 0.35,
  MIN_KEYWORD_OVERLAP: 3,
  MAX_ARTICLES_PER_TOPIC: 1,

  // Market Data
  MARKET_SYMBOLS: {
    US_STOCKS: ['^GSPC', '^DJI', '^IXIC'],
    KOREA_STOCKS: ['^KS11', '^KQ11'],
    COMMODITIES: ['GC=F', 'CL=F', 'BTC-USD'],
    FOREX: ['KRW=X', 'JPY=X']
  }
};

// ==================== NEWS SOURCES ====================

const NEWS_SOURCES_XX = [
  // =================================================
  // SECTION 1: INTERNATIONAL HEADLINES
  // =================================================
  
  // --- TOP TIER: Premium Business News ---
  
  {
    name: 'WSJ - World News',
    type: 'rss',
    url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
    section: 'international',
    tier: 1
  },
  {
    name: 'WSJ - Markets',
    type: 'rss',
    url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
    section: 'international',
    tier: 1
  },
  {
    name: 'WSJ - Business',
    type: 'rss',
    url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml',
    section: 'international',
    tier: 1
  },
  
  {
    name: 'NYT - Business',
    type: 'rss',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
    section: 'international',
    tier: 1
  },
  {
    name: 'NYT - World',
    type: 'rss',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    section: 'international',
    tier: 1
  },
  {
    name: 'NYT - Economy',
    type: 'rss',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml',
    section: 'international',
    tier: 1
  },
  
  {
    name: 'FT - World',
    type: 'rss',
    url: 'https://www.ft.com/world?format=rss',
    section: 'international',
    tier: 1
  },
  {
    name: 'FT - Companies',
    type: 'rss',
    url: 'https://www.ft.com/companies?format=rss',
    section: 'international',
    tier: 1
  },
  {
    name: 'FT - Markets',
    type: 'rss',
    url: 'https://www.ft.com/markets?format=rss',
    section: 'international',
    tier: 1
  },
  
  {
    name: 'Bloomberg Business',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:bloomberg.com+business+OR+economy+OR+markets+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'international',
    tier: 1
  },
  
  {
    name: 'Reuters Business',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:reuters.com+business+OR+economy+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'international',
    tier: 1
  },
  
  {
    name: 'The Economist',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:economist.com+economy+OR+policy+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'international',
    tier: 1
  },
  
  // --- BREAKING NEWS & MAJOR EVENTS ---
  
  {
    name: 'Reuters World',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:reuters.com+breaking+OR+urgent+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'international',
    tier: 1
  },
  
  {
    name: 'AP Breaking News',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:apnews.com+breaking+OR+urgent+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'international',
    tier: 1
  },
  
  {
    name: 'BBC World News',
    type: 'rss',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    section: 'international',
    tier: 1
  },
  
  {
    name: 'BBC - Business',
    type: 'rss',
    url: 'http://feeds.bbci.co.uk/news/business/rss.xml',
    section: 'international',
    tier: 2
  },
  
  {
    name: 'CNN Breaking',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:cnn.com+breaking+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'international',
    tier: 2
  },
  
  {
    name: 'Al Jazeera',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:aljazeera.com+breaking+OR+crisis+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'international',
    tier: 2
  },
  
  // --- CRISES & DISASTERS ---
  
  {
    name: 'Major Incidents',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=disaster+OR+emergency+OR+crisis+OR+collapse+OR+explosion+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'international',
    tier: 1
  },
  
  {
    name: 'Natural Disasters',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=earthquake+OR+tsunami+OR+hurricane+OR+typhoon+OR+flood+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'international',
    tier: 2
  },
  
  // --- GEOPOLITICAL & CONFLICTS ---
  
  {
    name: 'Geopolitical Events',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=china+OR+russia+OR+ukraine+OR+taiwan+OR+iran+OR+israel+conflict+OR+war+OR+sanctions+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'international',
    tier: 1
  },
  
  {
    name: 'US Politics Impact',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=white+house+OR+congress+OR+fed+OR+treasury+policy+OR+regulation+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'international',
    tier: 1
  },
  
  // --- TECH & MAJOR DISRUPTIONS ---
  
  {
    name: 'Major Tech Events',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:techcrunch.com+OR+site:theverge.com+layoff+OR+shutdown+OR+breakthrough+OR+regulation+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'international',
    tier: 2
  },
  
  {
    name: 'AI & Tech Policy',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=artificial+intelligence+OR+ai+regulation+OR+ban+OR+policy+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'international',
    tier: 2
  },
  
  // --- TRADITIONAL BUSINESS SOURCES ---
  
  {
    name: 'WaPo - Business',
    type: 'rss',
    url: 'https://feeds.washingtonpost.com/rss/business',
    section: 'international',
    tier: 1
  },
  
  {
    name: 'CNBC - Top News',
    type: 'rss',
    url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    section: 'international',
    tier: 2
  },
  
  {
    name: 'Guardian - Business',
    type: 'rss',
    url: 'https://www.theguardian.com/uk/business/rss',
    section: 'international',
    tier: 2
  },
  
  {
    name: 'Axios',
    type: 'rss',
    url: 'https://api.axios.com/feed/',
    section: 'international',
    tier: 2
  },
  
  {
    name: 'Politico',
    type: 'rss',
    url: 'https://www.politico.com/rss/economy-and-jobs.xml',
    section: 'international',
    tier: 2
  },
  
  // --- ASIA FOCUS ---
  
  {
    name: 'Nikkei Asia',
    type: 'rss',
    url: 'https://asia.nikkei.com/rss/feed/nar',
    section: 'international',
    tier: 2
  },
  
  {
    name: 'SCMP - Business',
    type: 'rss',
    url: 'https://www.scmp.com/rss/91/feed',
    section: 'international',
    tier: 2
  },
  
  {
    name: 'China Business',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=china+economy+OR+policy+OR+crisis+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'international',
    tier: 2
  },

  // =================================================
  // SECTION 2: KOREA HEADLINES
  // =================================================
  
  // --- Korean Major Newspapers ---
  
  {
    name: '조선일보 - 경제',
    type: 'rss',
    url: 'https://www.chosun.com/arc/outboundfeeds/rss/category/economy/?outputType=xml',
    section: 'korea',
    tier: 1
  },
  {
    name: '조선일보 - 산업',
    type: 'rss',
    url: 'https://www.chosun.com/arc/outboundfeeds/rss/category/industry/?outputType=xml',
    section: 'korea',
    tier: 1
  },
  
  {
    name: '중앙일보 - 경제',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:joongang.co.kr+OR+site:joins.com+경제+OR+economy+when:24h&hl=ko&gl=KR&ceid=KR:ko',
    section: 'korea',
    tier: 1
  },
  
  {
    name: '동아일보 - 경제',
    type: 'rss',
    url: 'https://rss.donga.com/economy.xml',
    section: 'korea',
    tier: 1
  },
  {
    name: '동아일보 - 산업',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:donga.com+경제+OR+산업+when:24h&hl=ko&gl=KR&ceid=KR:ko',
    section: 'korea',
    tier: 1
  },
  
  {
    name: '한겨레 - 경제',
    type: 'rss',
    url: 'https://www.hani.co.kr/rss/economy/',
    section: 'korea',
    tier: 1
  },
  
  // --- Korean Business Papers ---
  
  {
    name: '한국경제',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:hankyung.com+경제+when:24h&hl=ko&gl=KR&ceid=KR:ko',
    section: 'korea',
    tier: 1
  },
  {
    name: '한국경제 - 증권',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:hankyung.com+증권+OR+주식+when:24h&hl=ko&gl=KR&ceid=KR:ko',
    section: 'korea',
    tier: 1
  },
  {
    name: '한국경제 - 기업',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:hankyung.com+기업+when:24h&hl=ko&gl=KR&ceid=KR:ko',
    section: 'korea',
    tier: 1
  },
  
  {
    name: '매일경제',
    type: 'rss',
    url: 'https://www.mk.co.kr/rss/30100041/',
    section: 'korea',
    tier: 1
  },
  {
    name: '매일경제 - 증권',
    type: 'rss',
    url: 'https://www.mk.co.kr/rss/50200011/',
    section: 'korea',
    tier: 1
  },
  
  // --- Korean Breaking & Events ---
  
  {
    name: 'Korea Breaking',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=korea+속보+OR+긴급+OR+breaking+when:24h&hl=ko&gl=KR&ceid=KR:ko',
    section: 'korea',
    tier: 1
  },
  
  {
    name: 'Korea Major Events',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=korea+사고+OR+재난+OR+위기+OR+crisis+when:24h&hl=ko&gl=KR&ceid=KR:ko',
    section: 'korea',
    tier: 1
  },
  
  // --- English Korea Coverage ---
  
  {
    name: 'Yonhap - Economy',
    type: 'rss',
    url: 'https://en.yna.co.kr/RSS/economy.xml',
    section: 'korea',
    tier: 2
  },
  
  {
    name: 'Google News - Korea Business',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=korea+business+OR+samsung+OR+hyundai+OR+sk+OR+lg&hl=en-US&gl=US&ceid=US:en',
    section: 'korea',
    tier: 2
  },
  
  {
    name: 'SCMP - Korea',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:scmp.com+korea&hl=en-US&gl=US&ceid=US:en',
    section: 'korea',
    tier: 2
  },
  
  {
    name: 'Nikkei - Korea',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:asia.nikkei.com+korea&hl=en-US&gl=US&ceid=US:en',
    section: 'korea',
    tier: 2
  }
];

// ==================== MAIN FUNCTION ====================

function sendDailyNewsSummary() {
  try {
    Logger.log('🚀 Starting Headlines Summary v5.4...');

    // 1. Fetch all news articles
    const allArticles = fetchAllNews();
    Logger.log(`📰 Fetched ${allArticles.length} total articles`);

    // 2. Separate by section and process
    const internationalArticles = processArticlesBySection(
      allArticles.filter(a => a.section === 'international'),
      CONFIG.INTERNATIONAL_HEADLINES,
      'international'
    );
    Logger.log(`✅ International: ${internationalArticles.length} articles`);

    const koreaArticles = processArticlesBySection(
      allArticles.filter(a => a.section === 'korea'),
      CONFIG.KOREA_HEADLINES,
      'korea'
    );
    Logger.log(`✅ Korea: ${koreaArticles.length} articles`);

    // 3. Get market data
    const marketData = fetchMarketData();
    Logger.log('📊 Market data fetched');

    // 4. Generate AI summary
    const aiSummary = generateAISummary(
      internationalArticles,
      koreaArticles,
      marketData
    );
    Logger.log('🤖 AI summary generated');

    // 5. Format and send to Slack
    const message = formatSlackMessage(
      aiSummary,
      internationalArticles,
      koreaArticles,
      marketData
    );
    sendToSlack(message);

    Logger.log('✅ Daily headlines summary sent successfully!');

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    sendErrorToSlack(error);
  }
}

// ==================== NEWS FETCHING ====================

function fetchAllNews() {
  const allArticles = [];
  const cutoffTime = new Date(Date.now() - CONFIG.NEWS_HOURS_BACK * 60 * 60 * 1000);

  NEWS_SOURCES_XX.forEach(source => {
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

        const title = cleanTitle(getElementText(item, 'title'));

        // Validate title
        if (!title || title.length < 3) return;

        const titleLower = title.toLowerCase().trim();

        const invalidTitles = [
          '-', '--', '---',
          'deals', 'news', 'article',
          'untitled', 'no title', '[no title]'
        ];
        if (invalidTitles.includes(titleLower)) return;

        const invalidPrefixes = [
          'deals - ', 'news - ', 'article - ', 'updates - ',
          '- ', '--', 'null - ', 'undefined - '
        ];
        for (const prefix of invalidPrefixes) {
          if (titleLower.startsWith(prefix)) return;
        }

        if (titleLower.split(' ').length <= 3 &&
            (titleLower.includes('wire') || titleLower.includes('news') ||
             titleLower.includes('international') || titleLower.includes('hub'))) {
          return;
        }

        const article = {
          source: extractSourceName(source.name, link),
          title: deepCleanText(title),
          link: deepCleanText(link),
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
  if (feedName.includes('Google News') || feedName.includes('Breaking') || 
      feedName.includes('Major') || feedName.includes('Geopolitical')) {
    if (link) {
      if (link.includes('wsj.com')) return 'WSJ';
      if (link.includes('ft.com')) return 'FT';
      if (link.includes('bloomberg.com')) return 'Bloomberg';
      if (link.includes('reuters.com')) return 'Reuters';
      if (link.includes('nytimes.com')) return 'NYT';
      if (link.includes('economist.com')) return 'Economist';
      if (link.includes('cnbc.com')) return 'CNBC';
      if (link.includes('axios.com')) return 'Axios';
      if (link.includes('theguardian.com')) return 'Guardian';
      if (link.includes('washingtonpost.com')) return 'Washington Post';
      if (link.includes('bbc.com') || link.includes('bbc.co.uk')) return 'BBC';
      if (link.includes('cnn.com')) return 'CNN';
      if (link.includes('aljazeera.com')) return 'Al Jazeera';
      if (link.includes('apnews.com')) return 'AP';
      if (link.includes('koreaherald.com')) return 'Korea Herald';
      if (link.includes('koreatimes.co.kr')) return 'Korea Times';
      if (link.includes('yna.co.kr')) return 'Yonhap';
      if (link.includes('chosun.com')) return 'Chosun Ilbo';
      if (link.includes('joongang.co.kr')) return 'JoongAng';
      if (link.includes('hankyung.com')) return 'Korea Economic Daily';
      if (link.includes('mk.co.kr')) return 'Maeil Business';
    }
    return 'News Wire';
  }
  
  return feedName
    .replace(/Google News - /g, '')
    .replace(/ - World News/g, '')
    .replace(/ - World/g, '')
    .replace(/ - Markets/g, '')
    .replace(/ - Business/g, '')
    .replace(/ - Economy/g, '')
    .replace(/ - Breaking/g, '')
    .trim();
}

function cleanTitle(title) {
  if (!title) return '';

  title = title
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/ - [\w\s\.\-&]+(\.com|\.net|\.org|\.co\.uk)$/gi, '')
    .replace(/ - [A-Z][\w\s\.\-&]+$/g, '')
    .replace(/ - report$/gi, '')
    .replace(/ \| .*$/, '')
    .trim();

  return title;
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

function deepCleanText(text) {
  if (!text) return '';

  return text
    .replace(/[\r\n\u2028\u2029\u000A\u000B\u000C\u000D\u0085]+/g, ' ')
    .replace(/%0A/gi, ' ')
    .replace(/%0D/gi, ' ')
    .replace(/%09/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<p>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .trim();
}

// ==================== ARTICLE PROCESSING ====================

function processArticlesBySection(articles, limit, sectionType) {
  articles.forEach(article => {
    article.score = scoreArticleBySection(article, sectionType);
  });

  articles.sort((a, b) => b.score - a.score);

  let uniqueArticles = removeDuplicates(articles);
  uniqueArticles = removeSemanticDuplicates(uniqueArticles, sectionType);

  const topCandidates = uniqueArticles.slice(0, CONFIG.PERPLEXITY_VALIDATION_POOL);
  const validatedArticles = validateArticlesWithPerplexity(topCandidates, sectionType);
  const curatedArticles = curateTopArticlesWithGPT(validatedArticles, limit * 2, sectionType);
  
  let topicFiltered = removeTopicDuplicates(curatedArticles, sectionType);
  
  // ⭐ ENHANCED: Quality filtering
  let qualityFiltered = filterLowQualityHeadlines(topicFiltered, sectionType);
  let finalArticles = removeFinalDuplicates(qualityFiltered, CONFIG.FINAL_DEDUP_THRESHOLD);
  
  if (finalArticles.length < limit) {
    const usedTitles = new Set(finalArticles.map(a => a.title));
    const backfill = uniqueArticles
      .filter(a => !usedTitles.has(a.title))
      .filter(a => isHeadlineWorthy(a, sectionType))
      .slice(0, limit - finalArticles.length);
    finalArticles = finalArticles.concat(backfill);
  }

  return finalArticles.slice(0, limit);
}

function removeTopicDuplicates(articles, sectionType) {
  const topicKeywords = {
    'flood': ['flood', 'flooding', '홍수', 'cyclone', 'storm', 'monsoon'],
    'earthquake': ['earthquake', 'quake', '지진', 'tremor', 'seismic'],
    'fire': ['fire', 'wildfire', '화재', 'blaze'],
    'coupang': ['coupang', '쿠팡', 'kim bum-suk', '김범석'],
    'samsung': ['samsung', '삼성', 'galaxy'],
    'hyundai': ['hyundai', '현대', 'kia', '기아'],
    'sk': ['sk hynix', 'sk텔레콤', 'sk이노베이션'],
    'lg': ['lg전자', 'lg에너지'],
    'tariff': ['tariff', '관세', 'trade duty', 'customs'],
    'inflation': ['inflation', '물가', 'cpi', '인플레이션', 'consumer price'],
    'currency': ['currency', '환율', 'exchange rate', 'won', 'forex'],
    'interest_rate': ['interest rate', '금리', 'fed rate', 'base rate'],
    'ukraine_war': ['ukraine', '우크라이나', 'russia', 'putin', 'zelensky', 'kyiv'],
    'israel_gaza': ['israel', 'gaza', 'hezbollah', 'lebanon', '이스라엘', 'hamas'],
    'syria': ['syria', 'assad', '시리아', 'damascus'],
    'china_taiwan': ['taiwan', 'strait', '대만', 'cross-strait'],
    'layoff': ['layoff', 'job cut', '정리해고', '구조조정', 'restructuring'],
    'bankruptcy': ['bankruptcy', 'bankrupt', '파산', '부도', 'insolvency'],
    'merger': ['merger', 'acquisition', 'takeover', '인수합병', 'm&a'],
    'ipo': ['ipo', '상장', 'listing', 'public offering'],
    'data_breach': ['data breach', 'leak', '유출', 'hack', 'cyber attack', '해킹'],
    'kospi': ['kospi', 'kosdaq', '코스피', '코스닥'],
    'korea_export': ['korea export', '한국 수출', '수출', 'korean shipment']
  };
  
  const topicGroups = {};
  
  articles.forEach(article => {
    const text = (article.title + ' ' + (article.description || '')).toLowerCase();
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const matchCount = keywords.filter(kw => text.includes(kw.toLowerCase())).length;
      
      if (matchCount > 0) {
        if (!topicGroups[topic]) {
          topicGroups[topic] = [];
        }
        topicGroups[topic].push(article);
        break;
      }
    }
  });
  
  const selectedArticles = new Set();
  const usedArticles = new Set();
  
  Object.entries(topicGroups).forEach(([topic, topicArticles]) => {
    if (topicArticles.length > 1) {
      Logger.log(`🔍 Topic "${topic}": ${topicArticles.length} articles found`);
      
      topicArticles.sort((a, b) => b.score - a.score);
      const bestArticle = topicArticles[0];
      
      selectedArticles.add(bestArticle);
      topicArticles.forEach(a => usedArticles.add(a));
      
      Logger.log(`  ✓ Kept: "${bestArticle.title}"`);
      topicArticles.slice(1).forEach(a => {
        Logger.log(`  ✗ Removed: "${a.title}"`);
      });
    }
  });
  
  const result = articles.filter(a => {
    if (usedArticles.has(a)) {
      return selectedArticles.has(a);
    }
    return true;
  });
  
  if (result.length < articles.length) {
    Logger.log(`✓ Topic dedup: ${articles.length} → ${result.length} articles`);
  }
  
  return result;
}

function calculateKeywordSimilarity(title1, title2) {
  const stopwords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'has', 'was', 'been', 'have', 'this', 'that', 'with', 'from', 'will', 'their', 'there', 'what', 'which', 'when', 'who', 'where', 'how', 'about', 'after', 'before']);
  
  const extractKeywords = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 3 && !stopwords.has(word));
  };

  const keywords1 = extractKeywords(title1);
  const keywords2 = extractKeywords(title2);
  
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  
  const intersection = [...set1].filter(x => set2.has(x));
  const overlapCount = intersection.length;
  
  const union = new Set([...set1, ...set2]);
  const jaccard = union.size > 0 ? intersection.length / union.size : 0;
  
  return {
    similarity: jaccard,
    overlapCount: overlapCount,
    sharedKeywords: intersection
  };
}

function removeFinalDuplicates(articles, threshold = 0.35) {
  const unique = [];
  
  for (const article of articles) {
    let isDuplicate = false;
    
    for (const existing of unique) {
      const comparison = calculateKeywordSimilarity(article.title, existing.title);
      
      if (comparison.similarity > threshold || comparison.overlapCount >= CONFIG.MIN_KEYWORD_OVERLAP) {
        Logger.log(`🔍 Dedup: "${article.title}" vs "${existing.title}" (sim: ${comparison.similarity.toFixed(2)}, overlap: ${comparison.overlapCount})`);
        
        if (article.score > existing.score) {
          const index = unique.indexOf(existing);
          unique[index] = article;
        }
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      unique.push(article);
    }
  }
  
  Logger.log(`✓ Final dedup: ${articles.length} → ${unique.length} articles`);
  return unique;
}

// ⭐ ENHANCED: Quality filtering
function filterLowQualityHeadlines(articles, sectionType) {
  return articles.filter(article => isHeadlineWorthy(article, sectionType));
}

function isHeadlineWorthy(article, sectionType) {
  const text = (article.title + ' ' + (article.description || '')).toLowerCase();
  const source = article.source.toLowerCase();
  
  // ==================== UNIVERSAL FILTERS ====================
  
  // ❌ 1. Local city news (US small cities)
  const localCities = [
    'missoula', 'spokane', 'boise', 'billings', 'great falls',
    'eugene', 'salem', 'bend', 'tacoma', 'bellingham',
    'reno', 'bozeman', 'fargo', 'sioux falls', 'rapid city'
  ];
  
  for (const city of localCities) {
    if (text.includes(city)) {
      // Exception: Major disaster/crisis
      const majorEventKeywords = ['disaster', 'emergency', 'crisis', 'explosion', 'fire', 'shooting', 'attack'];
      const hasMajorEvent = majorEventKeywords.some(kw => text.includes(kw));
      
      if (!hasMajorEvent) {
        Logger.log(`❌ Filtered (local city): ${article.title}`);
        return false;
      }
    }
  }
  
  // ❌ 2. Local news patterns
  const localNewsPatterns = [
    /travel alert.*hazardous/i,
    /city council.*vote/i,
    /mayor announces/i,
    /local business.*open/i,
    /community event/i,
    /school district/i
  ];
  
  for (const pattern of localNewsPatterns) {
    if (pattern.test(text)) {
      Logger.log(`❌ Filtered (local news pattern): ${article.title}`);
      return false;
    }
  }
  
  // ❌ 3. Awards / Ceremonies
  const awardPatterns = [
    /수상|award|receives prize|wins award/i,
    /시상식|ceremony|recognition event/i,
    /영예|honor.*bestowed/i
  ];
  
  for (const pattern of awardPatterns) {
    if (pattern.test(text)) {
      // Exception: Major international awards (Nobel, Oscar, etc.)
      const majorAwards = ['nobel', 'oscar', 'grammy', 'pulitzer', 'booker'];
      const hasMajorAward = majorAwards.some(award => text.includes(award));
      
      if (!hasMajorAward) {
        Logger.log(`❌ Filtered (award/ceremony): ${article.title}`);
        return false;
      }
    }
  }
  
  // ❌ 4. Meta news / Media criticism
  const metaNewsPatterns = [
    /왜.*썼나|how.*wrote|why.*said/i,
    /언론.*비판|media criticism/i,
    /보도.*문제|reporting issue/i,
    /기자.*질문|journalist ask/i
  ];
  
  for (const pattern of metaNewsPatterns) {
    if (pattern.test(text)) {
      Logger.log(`❌ Filtered (meta news): ${article.title}`);
      return false;
    }
  }
  
  // ❌ 5. Columns / Opinion pieces (unless major publication)
  if (text.includes('칼럼') || text.includes('column') || text.includes('opinion')) {
    const majorOpinionSources = ['economist', 'ft', 'wsj', 'nyt', 'bloomberg'];
    const isMajorSource = majorOpinionSources.some(s => source.includes(s));
    
    if (!isMajorSource) {
      Logger.log(`❌ Filtered (opinion/column): ${article.title}`);
      return false;
    }
  }
  
  // ❌ 6. Low credibility sources
  const lowCredibilitySources = [
    'ai부동산신문',
    '부동산신문',
    '코리아투데이',
    '코리아뉴스',
    'korea today news'
  ];
  
  for (const lowSource of lowCredibilitySources) {
    if (source.includes(lowSource)) {
      Logger.log(`❌ Filtered (low credibility source): ${article.title}`);
      return false;
    }
  }
  
  // ❌ 7. Vague / Generic titles
  const vaguePatterns = [
    /^behind the curtain/i,
    /^what to know/i,
    /^things to watch/i,
    /^[0-9]+ things/i
  ];
  
  for (const pattern of vaguePatterns) {
    if (pattern.test(article.title)) {
      // Exception: If it has clear context in description
      if (!article.description || article.description.length < 50) {
        Logger.log(`❌ Filtered (vague title): ${article.title}`);
        return false;
      }
    }
  }
  
  // ==================== SECTION-SPECIFIC FILTERS ====================
  
  if (sectionType === 'korea') {
    // ❌ Minor company HR/personnel
    const minorHRPatterns = [
      /임직원.*정년/,
      /임직원.*채용/,
      /직원.*복지/,
      /인사.*발령/,
      /사장.*취임/,
      /신임.*임원/,
      /승진.*인사/
    ];
    
    for (const pattern of minorHRPatterns) {
      if (pattern.test(text)) {
        const majorCompanies = ['samsung', '삼성', 'hyundai', '현대', 'sk', 'lg', 'kakao', '카카오', 'naver', '네이버'];
        const hasMajorCompany = majorCompanies.some(co => text.includes(co));
        
        if (!hasMajorCompany) {
          Logger.log(`❌ Filtered (minor HR): ${article.title}`);
          return false;
        }
      }
    }
    
    // ❌ Unknown small companies
    const unknownCompanyPatterns = [
      /케어닥|올리브영|무신사|컬리|직방/
    ];
    
    for (const pattern of unknownCompanyPatterns) {
      if (pattern.test(text)) {
        const minorEvents = ['출시', '론칭', '오픈', '리뉴얼', '업데이트'];
        const hasMinorEvent = minorEvents.some(e => text.includes(e));
        
        if (hasMinorEvent) {
          Logger.log(`❌ Filtered (minor company): ${article.title}`);
          return false;
        }
      }
    }
    
    // ❌ Product launches (unless major)
    const productLaunchPatterns = [
      /신제품.*출시/,
      /새.*제품.*론칭/
    ];
    
    for (const pattern of productLaunchPatterns) {
      if (pattern.test(text)) {
        const majorTech = ['삼성', 'lg', '현대'];
        const hasMajorTech = majorTech.some(t => text.includes(t));
        
        if (!hasMajorTech) {
          Logger.log(`❌ Filtered (product launch): ${article.title}`);
          return false;
        }
      }
    }
    
    // ❌ PR / Marketing
    const prPatterns = [
      /제공.*이벤트/,
      /할인.*프로모션/,
      /경품.*증정/,
      /사은품/
    ];
    
    for (const pattern of prPatterns) {
      if (pattern.test(text)) {
        Logger.log(`❌ Filtered (PR/marketing): ${article.title}`);
        return false;
      }
    }
  }
  
  // ❌ Too short titles
  if (article.title.split(' ').length < 5 && article.title.length < 30) {
    Logger.log(`❌ Filtered (too short): ${article.title}`);
    return false;
  }
  
  return true;
}

function scoreArticleBySection(article, sectionType) {
  let score = 0;
  const text = (article.title + ' ' + (article.description || '')).toLowerCase();

  // ==================== EXCLUDE NOISE ====================
  const excludeKeywords = [
    'sport', 'sports', 'football', 'soccer', 'baseball', 'basketball', 'nfl', 'nba',
    'k-pop', 'kpop', 'celebrity', 'entertainment', 'hollywood',
    'movie', 'movies', 'film', 'actor', 'actress', 'netflix',
    'music', 'album', 'concert', 'grammy', 'oscar',
    '연예', '드라마', '영화', '가수', '배우', '아이돌',
    'private equity', 'pe firm', 'leveraged buyout', 'venture capital',
    'black friday', 'cyber monday', 'gift guide'
  ];
  
  for (const keyword of excludeKeywords) {
    if (text.includes(keyword)) {
      return -1000;
    }
  }

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
  else if (source.includes('bbc')) score += 8;
  else if (source.includes('cnn')) score += 8;

  // ==================== SECTION-SPECIFIC SCORING ====================

  if (sectionType === 'international') {
    
    const breakingKeywords = [
      'breaking', 'urgent', 'just in', 'developing', 'alert',
      'emergency', 'crisis', '속보', '긴급'
    ];
    breakingKeywords.forEach(kw => {
      if (text.includes(kw)) score += 30;
    });

    const disasterKeywords = [
      'disaster', 'earthquake', 'tsunami', 'hurricane', 'typhoon',
      'explosion', 'fire', 'collapse', 'crash', 'accident',
      'flood', 'volcano', 'storm', 'tornado',
      'terror', 'attack', 'shooting', 'bombing',
      '재난', '지진', '폭발', '사고', '붕괴'
    ];
    disasterKeywords.forEach(kw => {
      if (text.includes(kw)) score += 25;
    });

    const geopoliticalKeywords = [
      'war', 'conflict', 'invasion', 'coup', 'revolution',
      'sanctions', 'military', 'nuclear', 'missile',
      'china', 'russia', 'ukraine', 'taiwan', 'iran', 'israel',
      'nato', 'un security', 'diplomatic crisis',
      '전쟁', '분쟁', '제재', '군사'
    ];
    geopoliticalKeywords.forEach(kw => {
      if (text.includes(kw)) score += 22;
    });

    const macroKeywords = [
      'fed', 'federal reserve', 'interest rate', 'inflation', 'gdp',
      'central bank', 'recession', 'depression', 'bailout',
      'monetary policy', 'fiscal policy', 'treasury',
      'unemployment', 'jobs report', 'cpi', 'ppi'
    ];
    macroKeywords.forEach(kw => {
      if (text.includes(kw)) score += 20;
    });

    const policyKeywords = [
      'regulation', 'law', 'legislation', 'executive order',
      'parliament', 'congress', 'government shutdown',
      'reform', 'ban', 'restrict', 'approve', 'vote',
      'election', 'political crisis'
    ];
    policyKeywords.forEach(kw => {
      if (text.includes(kw)) score += 18;
    });

    const corporateCrisisKeywords = [
      'bankruptcy', 'bankrupt', 'default', 'insolvent',
      'ceo fired', 'ceo resigns', 'ceo steps down',
      'scandal', 'fraud', 'investigation', 'lawsuit',
      'massive layoff', 'plant closure', 'recall',
      'cyber attack', 'data breach', 'hack'
    ];
    corporateCrisisKeywords.forEach(kw => {
      if (text.includes(kw)) score += 16;
    });

    const globalEventKeywords = [
      'summit', 'g7', 'g20', 'world economic forum', 'davos',
      'olympics', 'world cup', 'pandemic', 'epidemic',
      'climate', 'cop', 'paris agreement'
    ];
    globalEventKeywords.forEach(kw => {
      if (text.includes(kw)) score += 12;
    });

    const techDisruptionKeywords = [
      'ai regulation', 'ban', 'antitrust', 'breakup',
      'layoffs', 'shutdown', 'outage', 'hack',
      'breakthrough', 'quantum', 'fusion'
    ];
    techDisruptionKeywords.forEach(kw => {
      if (text.includes(kw)) score += 10;
    });

    const marketShockKeywords = [
      'crash', 'plunge', 'surge', 'rally', 'sell-off',
      'circuit breaker', 'trading halt', 'volatility',
      'record high', 'record low', 'all-time high'
    ];
    marketShockKeywords.forEach(kw => {
      if (text.includes(kw)) score += 14;
    });
  }

  if (sectionType === 'korea') {
    
    const breakingKeywords = [
      'breaking', '속보', '긴급', '특보', 'urgent'
    ];
    breakingKeywords.forEach(kw => {
      if (text.includes(kw)) score += 30;
    });

    const disasterKeywords = [
      '사고', '재난', '화재', '폭발', '붕괴',
      'disaster', 'accident', 'fire', 'explosion', 'collapse'
    ];
    disasterKeywords.forEach(kw => {
      if (text.includes(kw)) score += 25;
    });

    const majorCompanies = [
      'samsung', 'hyundai', 'sk', 'lg', 'lotte', 'hanwha', 'posco',
      '삼성', '현대', '롯데', '한화', '포스코'
    ];
    let hasRelevantCompany = false;
    majorCompanies.forEach(co => {
      if (text.includes(co)) {
        hasRelevantCompany = true;
        score += 15;
      }
    });

    const macroKeywords = [
      '금리', '환율', '수출', '무역', 'gdp', '경제성장',
      'kospi', 'kosdaq', '한국은행', 'bank of korea',
      '경기', '경제', '인플레이션', '물가', 'cpi'
    ];
    let hasMacroRelevance = false;
    macroKeywords.forEach(kw => {
      if (text.includes(kw)) {
        hasMacroRelevance = true;
        score += 20;
      }
    });

    const policyKeywords = [
      '정부', '금융위', '공정위', '금융감독원', '국회',
      'government', 'policy', '정책', '규제', 'regulation',
      '법안', '개혁', 'reform', '승인', '제재'
    ];
    policyKeywords.forEach(kw => {
      if (text.includes(kw)) {
        hasMacroRelevance = true;
        score += 18;
      }
    });

    const industryKeywords = [
      '반도체', 'semiconductor', 'chip', '자동차', 'automotive',
      '배터리', 'battery', '디스플레이', '조선', 'shipbuilding'
    ];
    industryKeywords.forEach(kw => {
      if (text.includes(kw)) score += 12;
    });

    const crisisKeywords = [
      '위기', '파산', '부도', '경영난', '구조조정',
      'crisis', 'bankruptcy', 'restructuring', 'layoff'
    ];
    crisisKeywords.forEach(kw => {
      if (text.includes(kw)) score += 15;
    });

    if (!hasRelevantCompany && !hasMacroRelevance) {
      score -= 300;
    }
  }

  const hoursAgo = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 3) score += 10;
  else if (hoursAgo < 6) score += 5;

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

function removeSemanticDuplicates(articles, sectionType) {
  if (!CONFIG.OPENAI_API_KEY || articles.length <= 5) {
    return articles;
  }

  try {
    const articleList = articles.map((a, idx) => `${idx}: ${a.title}`).join('\n');

    const prompt = `Identify duplicate headlines (same story, different wording).

Articles:
${articleList}

Return JSON array of duplicate groups: [[1,4,7], [2,9]]
If no duplicates: []

CRITICAL: Respond with ONLY a valid JSON array. No markdown, no explanations.

Respond with JSON only:`;

    const response = callChatGPT(prompt, 800);
    
    let cleanedResponse = response.trim();
    
    cleanedResponse = cleanedResponse
      .replace(/^```(?:json)?\s*\n?/gi, '')
      .replace(/\n?```\s*$/gi, '')
      .trim();
    
    const arrayMatch = cleanedResponse.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      cleanedResponse = arrayMatch[0];
    }

    if (!cleanedResponse.startsWith('[')) {
      Logger.log(`⚠ Semantic dedup: Invalid JSON format. Using fallback.`);
      return articles;
    }

    const duplicateGroups = JSON.parse(cleanedResponse);

    if (!Array.isArray(duplicateGroups) || duplicateGroups.length === 0) {
      return articles;
    }

    const indicesToRemove = new Set();
    duplicateGroups.forEach(group => {
      if (!Array.isArray(group) || group.length < 2) return;
      let bestIdx = group[0];
      let bestScore = articles[group[0]].score;
      group.forEach(idx => {
        if (articles[idx].score > bestScore) {
          bestScore = articles[idx].score;
          bestIdx = idx;
        }
      });
      group.forEach(idx => {
        if (idx !== bestIdx) indicesToRemove.add(idx);
      });
    });

    return articles.filter((_, idx) => !indicesToRemove.has(idx));

  } catch (error) {
    Logger.log(`❌ Semantic dedup failed: ${error.toString()}`);
    return articles;
  }
}

// ==================== PERPLEXITY VALIDATION ====================

function validateArticlesWithPerplexity(articles, sectionType) {
  if (!CONFIG.PERPLEXITY_API_KEY || articles.length === 0) {
    return articles;
  }

  try {
    const contexts = {
      'international': {
        criteria: `Evaluate HEADLINE IMPORTANCE:
- Breaking news & emergencies
- Major disasters & crises (high volatility)
- Economic policy & market-movers
- Geopolitical conflicts
- Corporate crises & disruptions

PRIORITIZE: Events that move markets, change policy, or demand executive attention
INCLUDE: Disasters, accidents, major global events`,
        
        question: 'Which headlines are MOST IMPORTANT for business leaders TODAY?'
      },
      
      'korea': {
        criteria: `Evaluate KOREA HEADLINE IMPORTANCE:
- Breaking news & emergencies
- Economic policy & data
- Major corporate events & crises
- Government actions
- Disasters & major incidents

INCLUDE: Macro policy, major events, crises
AVOID: Minor company news, HR announcements`,
        
        question: 'Which are MOST IMPORTANT for Korean executives TODAY?'
      }
    };

    const context = contexts[sectionType];
    const articleList = articles.map((a, i) => {
      const preview = a.description ? ` - ${a.description.substring(0, 100)}...` : '';
      return `${i}. [${a.source}] ${a.title}${preview}`;
    }).join('\n\n');

    const prompt = `Evaluate TODAY's headlines for business executives.

${context.criteria}

Articles:
${articleList}

${context.question}

Return: JSON array with 15-20 most important indices
Format: [3, 7, 1, 12, 5]

CRITICAL: Respond with ONLY a valid JSON array. No markdown, no explanations.

Respond with JSON only:`;

    const result = callPerplexity(prompt, true);
    
    let cleanedResponse = result.content.trim();
    
    cleanedResponse = cleanedResponse
      .replace(/^```(?:json)?\s*\n?/gi, '')
      .replace(/\n?```\s*$/gi, '')
      .trim();
    
    const arrayMatch = cleanedResponse.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      cleanedResponse = arrayMatch[0];
    }

    if (!cleanedResponse.startsWith('[')) {
      Logger.log(`⚠ Perplexity: Invalid JSON format. Using fallback.`);
      return articles;
    }

    const selectedIndices = JSON.parse(cleanedResponse);

    if (!Array.isArray(selectedIndices) || selectedIndices.length === 0) {
      return articles;
    }

    const validatedArticles = selectedIndices
      .filter(idx => idx >= 0 && idx < articles.length)
      .map(idx => articles[idx]);

    Logger.log(`✓ Perplexity validation (${sectionType}): ${articles.length} → ${validatedArticles.length}`);
    
    return validatedArticles;

  } catch (error) {
    Logger.log(`❌ Perplexity validation failed: ${error.toString()}`);
    return articles;
  }
}

function curateTopArticlesWithGPT(articles, targetCount, sectionType) {
  if (!CONFIG.OPENAI_API_KEY || articles.length <= targetCount) {
    return articles.slice(0, targetCount);
  }

  try {
    const articleList = articles.map((a, idx) => {
      const preview = a.description ? ` - ${a.description.substring(0, 100)}...` : '';
      return `${idx}: [${a.source}] ${a.title}${preview}`;
    }).join('\n\n');

    const sectionContext = {
      'international': 'Top HEADLINES: breaking news, crises, major events, policy changes',
      'korea': 'Top KOREA HEADLINES: breaking news, economy, policy, major events (NO minor company HR news)'
    };

    const prompt = `Select ${targetCount} most important HEADLINES for ${sectionContext[sectionType]}.

PRIORITY:
1. Breaking news & emergencies
2. Disasters & major incidents
3. Economic policy & market shocks
4. Geopolitical crises
5. Corporate crises

⚠️ CRITICAL - AVOID DUPLICATES:
- If multiple articles cover the SAME EVENT/STORY, pick ONLY the best one
- Examples of duplicates to avoid:
  * Multiple flood articles about same region → Pick 1 best
  * Multiple articles about same company scandal → Pick 1 best
  * Multiple articles about same policy/tariff → Pick 1 best
- Prioritize: More comprehensive coverage, better source, more detail

EXCLUDE:
- Minor company HR/personnel announcements
- Small startup product launches
- Marketing/promotional content
- DUPLICATE stories (same event, different source)
- Local city news (Missoula, Spokane, etc.)
- Award ceremonies / Media criticism

Articles:
${articleList}

Return: JSON array with exactly ${targetCount} DIVERSE, NON-DUPLICATE indices
Format: [3, 7, 12]

CRITICAL: Respond with ONLY a valid JSON array. No markdown, no explanations, no text outside the array.

Respond with JSON only:`;

    const response = callChatGPT(prompt, 400);
    
    let cleanedResponse = response.trim();
    
    cleanedResponse = cleanedResponse
      .replace(/^```(?:json)?\s*\n?/gi, '')
      .replace(/\n?```\s*$/gi, '')
      .trim();
    
    const arrayMatch = cleanedResponse.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      cleanedResponse = arrayMatch[0];
    }

    if (!cleanedResponse.startsWith('[')) {
      Logger.log(`⚠ GPT curation: Invalid JSON format. Using fallback.`);
      return articles.slice(0, targetCount);
    }

    const selectedIndices = JSON.parse(cleanedResponse);

    if (!Array.isArray(selectedIndices) || selectedIndices.length === 0) {
      Logger.log('⚠ GPT curation: Empty array. Using fallback.');
      return articles.slice(0, targetCount);
    }

    const curatedArticles = selectedIndices
      .filter(idx => idx >= 0 && idx < articles.length)
      .map(idx => articles[idx]);

    Logger.log(`✓ GPT curation: ${articles.length} → ${curatedArticles.length}`);

    if (curatedArticles.length < targetCount) {
      const selectedSet = new Set(selectedIndices);
      const remaining = articles
        .filter((_, idx) => !selectedSet.has(idx))
        .slice(0, targetCount - curatedArticles.length);
      curatedArticles.push(...remaining);
    }

    return curatedArticles.slice(0, targetCount);

  } catch (error) {
    Logger.log(`❌ GPT curation failed: ${error.toString()}`);
    return articles.slice(0, targetCount);
  }
}

// ==================== MARKET DATA ====================

function fetchMarketData() {
  return {
    usStocks: fetchStockData(CONFIG.MARKET_SYMBOLS.US_STOCKS),
    koreaStocks: fetchStockData(CONFIG.MARKET_SYMBOLS.KOREA_STOCKS),
    commodities: fetchStockData(CONFIG.MARKET_SYMBOLS.COMMODITIES),
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
      'GC=F': 'Gold',
      'CL=F': 'Oil (WTI)',
      'KRW=X': 'USD/KRW',
      'JPY=X': 'USD/JPY'
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

function generateAISummary(internationalArticles, koreaArticles, marketData) {
  if (!CONFIG.OPENAI_API_KEY) {
    return {
      insights: ['CONFIGure OpenAI API key']
    };
  }

  try {
    const intlContext = internationalArticles.slice(0, 10).map((a, i) => {
      const desc = a.description ? `\n   ${a.description.substring(0, 150)}` : '';
      return `${i + 1}. [${a.source}] ${a.title}${desc}`;
    }).join('\n\n');

    const koreaContext = koreaArticles.slice(0, 10).map((a, i) => {
      return `${i + 1}. [${a.source}] ${a.title}`;
    }).join('\n');

    const marketContext = formatMarketContextForAI(marketData);

    const prompt = `Analyze TODAY's MAJOR HEADLINES for business executives.

=== MARKET DATA ===
${marketContext}

=== INTERNATIONAL HEADLINES ===
${intlContext}

=== KOREA HEADLINES ===
${koreaContext}

Focus on:
- Breaking news & emergencies
- Major disasters/crises creating volatility
- Economic policy changes
- Geopolitical events
- Corporate disruptions

TASK: Create 8-10 rich, detailed insights covering TODAY's most important developments.

**Key Insights Requirements:**
- 8-10 bullets total
- Each bullet: 200-250 characters (detailed, not just headlines)
- Include context, implications, or why it matters
- Mix of:
  * Breaking news & urgent developments (2-3)
  * Economic/policy changes & market impacts (2-3)
  * Korea-specific developments (2-3)
  * Geopolitical or major global events (1-2)

**Style:**
- Start with action: "announced", "reported", "surged", "plunged", "reached"
- Include key numbers/data when relevant
- Add brief context or implication
- Be specific, not generic

**Example good insights:**
✅ "Fed signals potential rate pause in March as inflation data shows continued cooling to 3.1% YoY, sparking equity rally with S&P 500 up 2.3% - markets pricing in 70% chance of cuts by June"
✅ "Samsung Electronics faces $2B quarterly loss as chip oversupply deepens, announcing 10,000 job cuts globally - signals broader semiconductor downturn affecting Korea's export-dependent economy"

**Example bad insights (too generic):**
❌ "Fed may pause rate hikes"
❌ "Samsung reports losses"

RESPONSE FORMAT:
{
  "insights": [
    "detailed insight 1 with context and numbers...",
    "detailed insight 2 with implications...",
    "detailed insight 3 with market impact...",
    "detailed insight 4...",
    "detailed insight 5...",
    "detailed insight 6...",
    "detailed insight 7...",
    "detailed insight 8..."
  ]
}

CRITICAL: Respond with ONLY a valid JSON object. No markdown, no explanations.

Respond with JSON only:`;

    const response = callChatGPT(prompt, 3500);

    let cleanedResponse = response.trim();
    
    cleanedResponse = cleanedResponse
      .replace(/^```(?:json)?\s*\n?/gi, '')
      .replace(/\n?```\s*$/gi, '')
      .trim();
    
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }

    if (!cleanedResponse.startsWith('{')) {
      Logger.log(`⚠ AI summary: Invalid JSON format`);
      throw new Error('Invalid JSON format from AI summary');
    }

    const summary = JSON.parse(cleanedResponse);
    return {
      insights: summary.insights || []
    };

  } catch (error) {
    Logger.log(`❌ AI summary error: ${error.toString()}`);
    return {
      insights: ['AI summary unavailable - check logs']
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

  if (marketData.commodities && marketData.commodities.length > 0) {
    context += 'Commodities: ';
    marketData.commodities.forEach(c => {
      if (c && c.price) {
        const chg = c.dayChange >= 0 ? `+${c.dayChange.toFixed(2)}%` : `${c.dayChange.toFixed(2)}%`;
        let priceStr = c.symbol === 'BTC-USD' ? `$${c.price.toFixed(0)}` : `$${c.price.toFixed(2)}`;
        context += `${c.name} ${priceStr} (${chg}), `;
      }
    });
    context = context.slice(0, -2) + '\n';
  }

  if (marketData.forex && marketData.forex.length > 0) {
    context += 'FX: ';
    marketData.forex.forEach(fx => {
      if (fx && fx.price) {
        const chg = fx.dayChange >= 0 ? `+${fx.dayChange.toFixed(2)}%` : `${fx.dayChange.toFixed(2)}%`;
        context += `USD/${fx.symbol.replace('=X', '')} ${fx.price.toFixed(2)} (${chg}), `;
      }
    });
    context = context.slice(0, -2) + '\n';
  }

  return context || 'Market data unavailable';
}

// ==================== API FUNCTIONS ====================

function callChatGPT(prompt, maxTokens = 500) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const payload = {
    model: CONFIG.GPT_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an executive analyst providing detailed headline news insights. Always respond with valid JSON only, no markdown formatting.'
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

function callPerplexity(prompt, useSearch = true) {
  const url = 'https://api.perplexity.ai/chat/completions';
  
  const payload = {
    model: useSearch ? CONFIG.PERPLEXITY_MODEL : 'sonar',
    messages: [
      {
        role: 'system',
        content: 'You are a senior business analyst. Always respond with valid JSON only, no markdown formatting.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: CONFIG.PERPLEXITY_TEMPERATURE,
    max_tokens: 1000,
    return_citations: true,
    search_recency_filter: 'day'
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${CONFIG.PERPLEXITY_API_KEY}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());
  
  if (json.error) throw new Error(json.error.message);
  
  return {
    content: json.choices[0].message.content.trim(),
    citations: json.citations || []
  };
}

// ==================== SLACK FORMATTING ====================

function formatSlackMessage(aiSummary, internationalArticles, koreaArticles, marketData) {
  const blocks = [];

  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: '📰 Global Headlines Brief',
      emoji: true
    }
  });

  blocks.push({ type: 'divider' });

  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: '📊 Market Snapshot',
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

  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: '🎯 Today\'s Key Insights',
      emoji: true
    }
  });

  if (aiSummary.insights && aiSummary.insights.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: aiSummary.insights.map(i => `• ${i}`).join('\n\n')
      }
    });
  }

  blocks.push({ type: 'divider' });

  if (internationalArticles.length > 0) {
    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🌍 International Headlines',
        emoji: true
      }
    });

    const intlLines = internationalArticles.map((a, i) => {
      const cleanedTitle = deepCleanText(a.title);
      const cleanedLink = deepCleanText(a.link);
      return `${i + 1}. <${cleanedLink}|${cleanedTitle}>`;
    });

    addArticleBlocks(blocks, intlLines);
    blocks.push({ type: 'divider' });
  }

  if (koreaArticles.length > 0) {
    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🇰🇷 Korea Headlines',
        emoji: true
      }
    });

    const koreaLines = koreaArticles.map((a, i) => {
      const cleanedTitle = deepCleanText(a.title);
      const cleanedLink = deepCleanText(a.link);
      return `${i + 1}. <${cleanedLink}|${cleanedTitle}>`;
    });

    addArticleBlocks(blocks, koreaLines);
    blocks.push({ type: 'divider' });
  }

  blocks.push({
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: `🤖 AI-Curated Headlines | ${internationalArticles.length + koreaArticles.length} articles`
    }]
  });

  return { blocks: blocks };
}

function addArticleBlocks(blocks, articleLines) {
  const CHARS_PER_BLOCK = 2800;
  let currentChunk = [];
  let currentLength = 0;

  articleLines.forEach(line => {
    const cleanLine = deepCleanText(line);
    
    if (!cleanLine || cleanLine.trim().length < 10) {
      return;
    }
    
    const lineLength = cleanLine.length + 1;

    if (currentLength + lineLength > CHARS_PER_BLOCK && currentChunk.length > 0) {
      const blockText = currentChunk
        .join('\n')
        .replace(/\n{2,}/g, '\n')
        .trim();
        
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: blockText
        }
      });
      currentChunk = [cleanLine];
      currentLength = lineLength;
    } else {
      currentChunk.push(cleanLine);
      currentLength += lineLength;
    }
  });

  if (currentChunk.length > 0) {
    const blockText = currentChunk
      .join('\n')
      .replace(/\n{2,}/g, '\n')
      .trim();
      
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: blockText
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
        text += `${emoji} ${stock.name}: ${price} (${day}% | WoW ${week}%)\n`;
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
        text += `${emoji} ${stock.name}: ${price} (${day}% | WoW ${week}%)\n`;
      }
    });
    text += '\n';
  }

  if (marketData.commodities && marketData.commodities.length > 0) {
    text += '*Commodities & Crypto*\n';
    marketData.commodities.forEach(item => {
      if (item && item.price != null) {
        const emoji = item.dayChange >= 0 ? '📈' : '📉';
        const day = item.dayChange.toFixed(2);
        const week = item.weekChange.toFixed(2);
        const priceStr = item.symbol === 'BTC-USD' ? `$${item.price.toFixed(0)}` : `$${item.price.toFixed(2)}`;
        text += `${emoji} ${item.name}: ${priceStr} (${day}% | WoW ${week}%)\n`;
      }
    });
  }

  return text || 'Market data unavailable';
}

// ==================== SLACK SENDING ====================

function sendToSlack(message) {
  if (!CONFIG.SLACK_WEBHOOK_URL) {
    Logger.log('Slack webhook not CONFIGured!');
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
          text: '❌ Headlines Summary Error',
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
  Logger.log('🧪 Testing Headlines v5.4...\n');

  Logger.log('1. Testing International sources...');
  const intlSource = NEWS_SOURCES_XX.find(s => s.section === 'international' && s.name.includes('WSJ'));
  if (intlSource) {
    const articles = fetchRSSFeed(intlSource);
    Logger.log(`✓ ${intlSource.name}: ${articles.length} articles`);
  }

  Logger.log('\n2. Testing Korea sources...');
  const koreaSource = NEWS_SOURCES_XX.find(s => s.section === 'korea');
  if (koreaSource) {
    const articles = fetchRSSFeed(koreaSource);
    Logger.log(`✓ ${koreaSource.name}: ${articles.length} articles`);
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
