/**
 * Global News Summary for Private Equity Professionals
 * Version 3.1 - Fixed Newline Issues
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
  OPENAI_API_KEY: 'sk-proj-2g3OmSfqt4sA4r4KE2OjOjYYRq5abvx0luzb4A7PYy1FazAthsL',
  SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/T08SQU00JQ7/B09SW4SR18E',

  // ChatGPT Settings
  GPT_MODEL: 'gpt-4-turbo-preview',
  GPT_TEMPERATURE: 0.3,

  // Time Range (hours)
  NEWS_HOURS_BACK: 24,

  // News Settings
  MAX_ARTICLES_PER_SOURCE: 15,
  SIMILARITY_THRESHOLD: 0.7,
  
  // Section-specific limits (final output after GPT curation)
  GLOBAL_TOP_HEADLINES: 7,       // Curated to 7 most important
  KOREA_TOP_HEADLINES: 7,        // Curated to 7 most important
  PE_SPECIFIC_NEWS: 7,           // Curated to 7 most important

  // Pre-GPT candidate pool (for GPT to choose from)
  CANDIDATE_POOL_SIZE: 25,        // Fetch 25 candidates, GPT picks top 7

  // Market Data
  MARKET_SYMBOLS: {
    US_STOCKS: ['^GSPC', '^DJI', '^IXIC'],
    KOREA_STOCKS: ['^KS11', '^KQ11'],
    COMMODITIES: ['GC=F', 'CL=F', 'BTC-USD'],  // Gold, Oil, Bitcoin
    FOREX: ['KRW=X', 'JPY=X']
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
    url: 'https://news.google.com/rss/search?q=business+OR+economy+OR+markets+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'global',
    tier: 1
  },
  
  // --- Reuters ---
  {
    name: 'Reuters Business',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=business+OR+finance+OR+economy+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'global',
    tier: 1
  },
  
  // --- The Economist ---
  {
    name: 'The Economist',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=economy+OR+trade+OR+policy+when:24h&hl=en-US&gl=US&ceid=US:en',
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
  
  // --- Associated Press ---
  {
    name: 'AP Business',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=business+OR+finance+source:ap+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'global',
    tier: 1
  },
  
  // --- Politico ---
  {
    name: 'Politico',
    type: 'rss',
    url: 'https://www.politico.com/rss/economy-and-jobs.xml',
    section: 'global',
    tier: 2
  },
  
  // --- Forbes ---
  {
    name: 'Forbes',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=business+OR+ceo+OR+markets+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'global',
    tier: 2
  },
  
  // --- Business Insider ---
  {
    name: 'Business Insider',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=finance+OR+markets+OR+economy+when:24h&hl=en-US&gl=US&ceid=US:en',
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

  // --- Premium Tech & Business Sources ---

  // Wired - Tech & Business
  {
    name: 'Wired',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:wired.com+business+OR+technology+OR+ai+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'global',
    tier: 2
  },

  // The Verge - Tech & Policy
  {
    name: 'The Verge',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:theverge.com+business+OR+tech+OR+regulation+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'global',
    tier: 2
  },

  // Ars Technica - Tech Analysis
  {
    name: 'Ars Technica',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:arstechnica.com+business+OR+tech+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'global',
    tier: 2
  },

  // MIT Technology Review
  {
    name: 'MIT Tech Review',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:technologyreview.com+business+OR+ai+OR+climate+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'global',
    tier: 2
  },

  // VentureBeat - Tech Business
  {
    name: 'VentureBeat',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:venturebeat.com+ai+OR+business+OR+tech+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'global',
    tier: 2
  },

  // =================================================
  // SECTION 2: KOREA TOP HEADLINES
  // 4대 일간지 (조선/중앙/동아/한겨레) 경제면 + 주요 경제지
  // =================================================
  
  // --- 조선일보 경제 ---
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
  
  // --- 중앙일보 경제 ---
  {
    name: '중앙일보 - 경제',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:joongang.co.kr+OR+site:joins.com+경제+OR+economy+when:24h&hl=ko&gl=KR&ceid=KR:ko',
    section: 'korea',
    tier: 1
  },
  
  // --- 동아일보 경제 ---
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
  
  // --- 한겨레 경제 ---
  {
    name: '한겨레 - 경제',
    type: 'rss',
    url: 'https://www.hani.co.kr/rss/economy/',
    section: 'korea',
    tier: 1
  },
  
  // --- 한국경제 (경제지) ---
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
  
  // --- 매일경제 (경제지) ---
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
  
  // --- Yonhap (English for international context) ---
  {
    name: 'Yonhap - Economy',
    type: 'rss',
    url: 'https://en.yna.co.kr/RSS/economy.xml',
    section: 'korea',
    tier: 2
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
  // Professional PE & Deal Flow Intelligence
  // =================================================

  // --- Tier 1: Premium PE-Specific Publications ---

  // PE Hub - Leading PE industry publication
  {
    name: 'PE Hub',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:pehub.com+OR+%22pe+hub%22+private+equity+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // Private Equity International (PEI)
  {
    name: 'Private Equity International',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:privateequityinternational.com+OR+%22private+equity+international%22+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // PERE - Real Estate PE
  {
    name: 'PERE',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:perenews.com+OR+%22real+estate+private+equity%22+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // AltAssets
  {
    name: 'AltAssets',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:altassets.net+private+equity+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // Private Equity Wire
  {
    name: 'Private Equity Wire',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%22private+equity+wire%22+OR+site:privateequitywire.co.uk+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // --- Tier 1: Premium Business Publications with PE Focus ---

  // Forbes - M&A and PE
  {
    name: 'Forbes PE/M&A',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:forbes.com+%22private+equity%22+OR+%22merger%22+OR+%22acquisition%22+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // The Information - Tech deals
  {
    name: 'The Information',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:theinformation.com+acquisition+OR+funding+OR+valuation+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // Axios - Deals
  {
    name: 'Axios Deals',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:axios.com+deals+OR+merger+OR+acquisition+OR+%22private+equity%22+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // --- Tier 1: Major PE Firms Coverage ---

  // Mega PE Firms (Blackstone, KKR, Carlyle, Apollo, TPG)
  {
    name: 'Mega PE Firms',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%22blackstone%22+OR+%22kkr%22+OR+%22carlyle+group%22+OR+%22apollo+global%22+OR+%22tpg+capital%22+deal+OR+acquisition+OR+investment+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // Top-tier PE Firms (Silver Lake, Thoma Bravo, Vista, Bain Capital)
  {
    name: 'Top PE Firms',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%22silver+lake%22+OR+%22thoma+bravo%22+OR+%22vista+equity%22+OR+%22bain+capital%22+OR+%22general+atlantic%22+acquisition+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // --- Tier 1: Deal Activity & M&A ---

  // Major M&A Announcements (WSJ, FT, Bloomberg sources)
  {
    name: 'Major M&A',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%28site:wsj.com+OR+site:ft.com+OR+site:bloomberg.com%29+merger+OR+acquisition+OR+takeover+billion+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // LBO & Buyout News
  {
    name: 'Leveraged Buyouts',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%22leveraged+buyout%22+OR+%22lbo%22+OR+%22buyout%22+%22private+equity%22+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 1
  },

  // --- Tier 2: IPO & Exit Activity ---

  // IPO Filings & Listings
  {
    name: 'IPO Activity',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%22files+for+ipo%22+OR+%22ipo+pricing%22+OR+%22going+public%22+OR+%22stock+listing%22+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 2
  },

  // SPAC & Exit News
  {
    name: 'PE Exits',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%22private+equity%22+exit+OR+spac+OR+%22portfolio+company%22+sale+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 2
  },

  // --- Tier 2: Venture Capital & Growth Equity ---

  // Major VC Rounds
  {
    name: 'Venture Capital',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%22series+a%22+OR+%22series+b%22+OR+%22series+c%22+OR+%22series+d%22+funding+million+OR+billion+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 2
  },

  // Crunchbase News - Startup funding
  {
    name: 'Crunchbase',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:news.crunchbase.com+funding+OR+acquisition+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 2
  },

  // TechCrunch - Tech deals
  {
    name: 'TechCrunch Deals',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:techcrunch.com+acquisition+OR+raises+OR+funding+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 2
  },

  // --- Tier 2: Distressed & Special Situations ---

  // Corporate Restructuring
  {
    name: 'Restructuring',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=corporate+restructuring+OR+%22chapter+11%22+OR+bankruptcy+OR+%22distressed+debt%22+when:24h&hl=en-US&gl=US&ceid=US:en',
    section: 'pe',
    tier: 2
  }
];

// ==================== MAIN FUNCTION ====================

function sendDailyNewsSummary() {
  try {
    Logger.log('🚀 Starting Global News Summary v3.1...');

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

    const peArticles = processArticlesBySection(
      allArticles.filter(a => a.section === 'pe'),
      CONFIG.PE_SPECIFIC_NEWS,
      'pe'
    );
    Logger.log(`✅ PE Specific: ${peArticles.length} articles`);

    const koreaArticles = processArticlesBySection(
      allArticles.filter(a => a.section === 'korea'),
      CONFIG.KOREA_TOP_HEADLINES,
      'korea'
    );
    Logger.log(`✅ Korea: ${koreaArticles.length} articles`);

    // 3. Get market data
    const marketData = fetchMarketData();
    Logger.log('📊 Market data fetched');

    // 4. Generate AI summary
    const aiSummary = generateAISummary(
      globalArticles,
      peArticles,
      koreaArticles,
      marketData
    );
    Logger.log('🤖 AI summary generated');

    // 5. Format and send to Slack
    const message = formatSlackMessage(
      aiSummary,
      globalArticles,
      peArticles,
      koreaArticles,
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

        const title = cleanTitle(getElementText(item, 'title'));

        // Validate title - filter out empty or meaningless titles
        if (!title || title.length < 3) return;

        const titleLower = title.toLowerCase().trim();

        // Filter exact matches
        const invalidTitles = [
          '-', '--', '---',
          'deals', 'news', 'article',
          'untitled', 'no title', '[no title]'
        ];
        if (invalidTitles.includes(titleLower)) return;

        // Filter titles that start with generic words followed by dash
        const invalidPrefixes = [
          'deals - ', 'news - ', 'article - ', 'updates - ',
          '- ', '--', 'null - ', 'undefined - '
        ];
        for (const prefix of invalidPrefixes) {
          if (titleLower.startsWith(prefix)) return;
        }

        // Filter titles that are just a source name
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
  // For aggregated feeds, extract actual source from URL
  if (feedName.includes('Google News') || 
      feedName.includes('PE/M&A') || 
      feedName.includes('IPO') || 
      feedName.includes('Venture') ||
      feedName.includes('Restructuring') ||
      feedName.includes('Activist') ||
      feedName.includes('Leveraged') ||
      feedName.includes('Infrastructure') ||
      feedName.includes('Valuation') ||
      feedName.includes('Tech M&A')) {
    if (link) {
      if (link.includes('wsj.com')) return 'WSJ';
      if (link.includes('ft.com')) return 'FT';
      if (link.includes('bloomberg.com')) return 'Bloomberg';
      if (link.includes('reuters.com')) return 'Reuters';
      if (link.includes('nytimes.com')) return 'NYT';
      if (link.includes('economist.com')) return 'Economist';
      if (link.includes('techcrunch.com')) return 'TechCrunch';
      if (link.includes('cnbc.com')) return 'CNBC';
      if (link.includes('axios.com')) return 'Axios';
      if (link.includes('theguardian.com')) return 'Guardian';
      if (link.includes('washingtonpost.com')) return 'Washington Post';
      if (link.includes('marketwatch.com')) return 'MarketWatch';
      // Korea sources
      if (link.includes('koreaherald.com')) return 'Korea Herald';
      if (link.includes('koreatimes.co.kr')) return 'Korea Times';
      if (link.includes('yna.co.kr')) return 'Yonhap';
      if (link.includes('chosun.com')) return 'Chosun Ilbo';
      if (link.includes('joongang.co.kr')) return 'JoongAng';
      if (link.includes('hankyung.com')) return 'Korea Economic Daily';
      if (link.includes('mk.co.kr')) return 'Maeil Business';
      if (link.includes('etnews.com')) return 'ET News';
      if (link.includes('mt.co.kr')) return 'Money Today';
      if (link.includes('thebell.co.kr')) return 'The Bell';
    }
    return 'Financial Press';
  }
  
  // Clean up direct feed names
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
    // Remove all types of newlines and line breaks
    .replace(/[\r\n\u2028\u2029\u000A\u000B\u000C\u000D\u0085]+/g, ' ')
    // Remove URL-encoded newlines
    .replace(/%0A/gi, ' ')
    .replace(/%0D/gi, ' ')
    .replace(/%09/gi, ' ')
    // Remove HTML line breaks
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<p>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Remove extra whitespace from markdown links
    .replace(/>\s+</g, '><')
    // Collapse multiple spaces into one
    .replace(/\s+/g, ' ')
    .trim();
}

// ==================== ARTICLE PROCESSING ====================

function processArticlesBySection(articles, limit, sectionType) {
  // Score articles based on section type
  articles.forEach(article => {
    article.score = scoreArticleBySection(article, sectionType);
  });

  // Sort by score
  articles.sort((a, b) => b.score - a.score);

  // Remove basic duplicates (exact/similar titles)
  let uniqueArticles = removeDuplicates(articles);

  // Remove semantic duplicates using GPT (same story, different wording)
  uniqueArticles = removeSemanticDuplicates(uniqueArticles, sectionType);

  // Get candidate pool (more articles than final limit)
  const candidatePool = uniqueArticles.slice(0, CONFIG.CANDIDATE_POOL_SIZE);

  // Use GPT to curate the most important articles from candidate pool
  const curatedArticles = curateTopArticlesWithGPT(candidatePool, limit, sectionType);

  // Return curated articles
  return curatedArticles;
}

function scoreArticleBySection(article, sectionType) {
  let score = 0;
  const text = (article.title + ' ' + (article.description || '')).toLowerCase();

  // ==================== UNIVERSAL FILTER: EXCLUDE SPORTS & ENTERTAINMENT ====================
  const excludeKeywords = [
    'sport', 'sports', 'football', 'soccer', 'baseball', 'basketball', 'nfl', 'nba', 'mlb', 'nhl',
    'olympic', 'olympics', 'fifa', 'uefa', 'premier league', 'champions league', 'world cup',
    'tennis', 'golf', 'boxing', 'mma', 'ufc', 'wrestling', 'racing', 'formula 1', 'f1',
    'athlete', 'athletes', 'player', 'players', 'team', 'teams', 'coach', 'coaches', 
    'stadium', 'arena', 'league', 'tournament', 'championship', 'playoff', 'playoffs',
    'game', 'games', 'match', 'matches', 'score', 'scored', 'win', 'wins', 'loss', 'defeat',
    'athletic', 'athletics', 'aggie', 'aggies', 'bulldogs', 'wildcats', 'tigers', 'bears',
    'college football', 'college basketball', 'ncaa', 'division', 'conference',
    'quarterback', 'running back', 'pitcher', 'batter', 'goalie', 'defender',
    '스포츠', '야구', '축구', '농구', '배구', '골프', '테니스', '올림픽',
    'k-pop', 'kpop', 'bts', 'blackpink', 'celebrity', 'celebrities', 'entertainment', 'hollywood',
    'movie', 'movies', 'film', 'films', 'actor', 'actress', 'drama', 'dramas', 'tv show', 'netflix', 'streaming',
    'music', 'album', 'albums', 'concert', 'concerts', 'tour', 'grammy', 'grammys', 'oscar', 'oscars', 'emmy', 'emmys',
    'box office', 'premiere', 'trailer', 'songwriter', 'musician', 'band', 'singer',
    '연예', '드라마', '영화', '가수', '배우', '아이돌', 'k드라마',
    'stabbed', 'stabbing', 'shooting', 'shot', 'killed', 'murder', 'murdered', 'assault', 'assaulted',
    'rape', 'raped', 'robbery', 'robbed', 'burglary', 'burglar', 'theft', 'stolen',
    'arrested', 'arrest', 'police', 'cop', 'sheriff', 'investigation', 'suspect', 'victim',
    'crime', 'criminal', 'prison', 'jail', 'inmate', 'convicted', 'trial', 'guilty',
    'weather', 'forecast', 'hurricane', 'tornado', 'earthquake', 'flood',
    'accident', 'crash', 'collision', 'died', 'death', 'funeral', 'obituary'
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

  // Section-specific scoring
  if (sectionType === 'global') {
    const globalKeywords = [
      'fed', 'federal reserve', 'interest rate', 'inflation', 'gdp',
      'central bank', 'economy', 'trade war', 'tariff', 'china',
      'recession', 'growth', 'treasury', 'bond'
    ];
    globalKeywords.forEach(kw => {
      if (text.includes(kw)) score += 5;
    });

    const majorCompanies = ['apple', 'microsoft', 'google', 'amazon', 'meta', 'tesla', 'nvidia'];
    majorCompanies.forEach(co => {
      if (text.includes(co)) score += 3;
    });
  }

  if (sectionType === 'korea') {
    const majorCompanies = [
      'samsung', 'hyundai', 'sk', 'lg', 'lotte', 'hanwha', 'gs', 'hanjin',
      'doosan', 'shinsegae', 'cj', 'posco',
      'samsung electronics', 'hyundai motor', 'sk hynix', 'lg energy',
      '삼성', '현대', 'sk', 'lg', '롯데', '한화', 'gs', '한진',
      '두산', '신세계', 'cj', '포스코',
      'kakao', 'naver', 'coupang', 'toss', 'krafton', 'nexon', 'ncsoft',
      'baemin', 'woowa', 'zigbang', 'daangn', 'karrot', 'viva republica',
      'yanolja', 'socar', 'musinsa', 'kurly', 'market kurly', 'dunamu',
      '카카오', '네이버', '쿠팡', '토스', '크래프톤', '넥슨', '엔씨소프트',
      '배달의민족', '배민', '우아한형제들', '직방', '당근마켓', '비바리퍼블리카',
      '야놀자', '쏘카', '무신사', '컬리', '마켓컬리', '두나무'
    ];

    let hasRelevantCompany = false;
    majorCompanies.forEach(co => {
      if (text.includes(co)) {
        hasRelevantCompany = true;
        score += 12;
      }
    });

    const peRelatedKeywords = [
      '인수', '합병', '매각', '지분', '투자', '펀딩',
      'acquisition', 'merger', 'stake', 'investment', 'funding', 'deal',
      'm&a', 'buyout', 'takeover',
      'private equity', 'venture capital', 'pe firm', 'vc',
      '사모펀드', '벤처캐피탈', '프라이빗에쿼티',
      'ipo', 'valuation', '기업가치', '밸류에이션', 'exit',
      '상장', 'listing', 'unicorn', '유니콘',
      '스타트업', 'startup', 'start-up', '벤처', 'venture',
      '시리즈', 'series a', 'series b', 'series c'
    ];
    peRelatedKeywords.forEach(kw => {
      if (text.includes(kw)) {
        hasRelevantCompany = true;
        score += 18;
      }
    });

    const policyKeywords = [
      '정부', 'government', '금융위', '공정위', '공정거래위원회', '금융감독원',
      'financial services commission', 'fair trade commission', 'fsc', 'ftc',
      '국회', 'national assembly', '기재부', 'ministry of finance',
      '산업부', 'ministry of trade', '과기부', 'ministry of science',
      '정책', 'policy', '규제', 'regulation', '법안', 'bill', 'legislation',
      '개혁', 'reform', '완화', 'easing', '강화', 'strengthening',
      '승인', 'approval', '허가', 'permit', '제재', 'sanctions',
      '금융정책', 'monetary policy', '재정정책', 'fiscal policy',
      '부동산', 'real estate', '세제', 'tax', '세금', '조세'
    ];
    policyKeywords.forEach(kw => {
      if (text.includes(kw)) {
        hasRelevantCompany = true;
        score += 12;
      }
    });

    const macroKeywords = [
      'kospi', 'kosdaq', '경제', '수출', '무역', '환율', 'gdp', '금리',
      'economy', 'export', 'trade', 'interest rate', '한국은행', 'bank of korea',
      '인플레이션', 'inflation', '경기', 'economic growth'
    ];
    macroKeywords.forEach(kw => {
      if (text.includes(kw)) {
        hasRelevantCompany = true;
        score += 10;
      }
    });

    const koreaKeywords = [
      'chaebol', '재벌', '반도체', 'semiconductor', '자동차', 'automotive',
      '배터리', 'battery', 'k-chip', '디스플레이', 'display'
    ];
    koreaKeywords.forEach(kw => {
      if (text.includes(kw)) score += 6;
    });

    if (text.includes('lee jae-yong') || text.includes('chung eui-sun') ||
        text.includes('이재용') || text.includes('정의선')) score += 8;

    if (!hasRelevantCompany) {
      score -= 300;
    }
    
    const promotionalKeywords = [
      'medica', '전시회', 'exhibition', '참가', 'participation',
      '가입자', 'subscriber', '돌파', 'breakthrough', 
      '특징주', 'featured stock', '상승', 'rise', '하락', 'fall',
      '[특징주]', '전략적 투자', 'strategic investment', '신성장',
      '견본주택', '분양', '모델하우스', 'model house', 'showroom',
      '아파트', 'apartment', 'officetel', '오피스텔',
      '개관', 'opening', 'grand opening', '오픈'
    ];
    promotionalKeywords.forEach(kw => {
      if (text.includes(kw)) score -= 250;
    });
  }

  if (sectionType === 'pe') {
    const professionalPESources = [
      'pe hub', 'pehub', 'private equity international', 'pere', 'altassets',
      'private equity wire', 'institutional investor'
    ];
    professionalPESources.forEach(src => {
      if (article.source.toLowerCase().includes(src)) {
        score += 30;
      }
    });

    const consumerNoise = [
      'black friday', 'cyber monday', 'deals are heating', 'save up to', 'discount',
      'shopping', 'buy now', 'on sale', 'price drop', 'grill', 'traeger', 'weber',
      'blackstone griddle', 'mattress', 'vacuum', 'tv deals', 'headphones',
      'iphone case', 'airpods', 'smart watch', 'fitness tracker',
      'video game', 'playstation', 'xbox', 'nintendo', 'fortnite', 'minecraft',
      'stock ideal for retirement', 'buy this stock', 'stock rises', 'stock falls',
      'best of', 'top 10', 'gift guide', 'how to buy'
    ];
    for (const noise of consumerNoise) {
      if (text.includes(noise)) {
        return -1000;
      }
    }

    const tier1Keywords = [
      'private equity', 'pe firm', 'pe fund', 'leveraged buyout', 'lbo',
      'take private', 'buyout', 'management buyout', 'mbo',
      'portfolio company', 'fund raising', 'fundraising', 'closes fund',
      'limited partner', 'lp commitment', 'general partner',
      'dry powder', 'deal flow', 'exit strategy', 'holding period',
      'sponsor', 'financial sponsor', 'add-on acquisition', 'platform acquisition',
      'recapitalization', 'dividend recap', 'secondary buyout'
    ];
    let hasTier1 = false;
    tier1Keywords.forEach(kw => {
      if (text.includes(kw)) {
        score += 25;
        hasTier1 = true;
      }
    });

    const tier2Keywords = [
      'acquisition', 'acquires', 'acquired', 'merger', 'takeover',
      'agrees to buy', 'to acquire', 'deal valued', 'transaction',
      'agreed to sell', 'sells stake', 'stake sale'
    ];
    let hasTier2 = false;
    tier2Keywords.forEach(kw => {
      if (text.includes(kw)) {
        score += 15;
        hasTier2 = true;
      }
    });

    const tier3Keywords = [
      'venture capital', 'vc firm', 'series a', 'series b', 'series c', 'series d',
      'seed round', 'growth equity', 'growth capital',
      'ipo', 'initial public offering', 'files for ipo', 'going public', 'stock listing',
      'spac merger', 'de-spac', 'public listing'
    ];
    tier3Keywords.forEach(kw => {
      if (text.includes(kw)) {
        score += 12;
        hasTier2 = true;
      }
    });

    const valuationKeywords = [
      'valuation', 'enterprise value', 'ebitda', 'multiple', 'ebitda multiple',
      'deal value', 'transaction value', 'equity value', 'purchase price',
      'raised at a valuation', 'valued at'
    ];
    valuationKeywords.forEach(kw => {
      if (text.includes(kw)) score += 8;
    });

    const megaPEFirms = [
      'blackstone', 'kkr', 'kohlberg kravis', 'carlyle group', 'carlyle',
      'apollo global', 'apollo management', 'tpg capital', 'tpg',
      'warburg pincus', 'advent international', 'thoma bravo',
      'silver lake', 'bain capital', 'cvc capital',
      'hellman & friedman', 'hellman friedman', 'neuberger berman',
      'leonard green', 'general atlantic', 'vista equity',
      'brookfield', 'ares management', 'bridgepoint',
      'cinven', 'permira', 'pai partners', 'apax partners',
      'bc partners', 'ardian', 'nordic capital', 'eqt',
      'affinity equity', 'gaw capital', 'hillhouse capital',
      'citic capital', 'fosun', 'hony capital'
    ];
    let hasPEFirm = false;
    megaPEFirms.forEach(firm => {
      if (text.includes(firm)) {
        score += 30;
        hasPEFirm = true;
        hasTier1 = true;
      }
    });

    if (text.includes('billion')) score += 12;
    if (text.includes('million') && (text.includes('acquisition') || text.includes('funding'))) score += 6;

    const businessContext = [
      'company', 'companies', 'firm', 'corporation',
      'investor', 'investment', 'capital', 'fund', 'equity',
      'stake', 'shares', 'deal', 'transaction'
    ];
    let hasContext = false;
    businessContext.forEach(kw => {
      if (text.includes(kw)) {
        hasContext = true;
        score += 2;
      }
    });

    if (!hasTier1 && !hasPEFirm && !hasTier2) {
      score -= 600;
    }

    if (!hasContext) {
      score -= 400;
    }

    const premiumSources = [
      'wsj', 'wall street journal', 'financial times', 'ft.com',
      'bloomberg', 'reuters', 'economist', 'forbes', 'axios',
      'the information', 'business insider'
    ];
    premiumSources.forEach(src => {
      if (article.source.toLowerCase().includes(src)) {
        score += 10;
      }
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

function removeSemanticDuplicates(articles, sectionType) {
  if (!CONFIG.OPENAI_API_KEY || CONFIG.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    return articles;
  }

  if (articles.length <= 5) {
    return articles;
  }

  try {
    const articleList = articles.map((a, idx) => {
      return `${idx}: ${a.title}`;
    }).join('\n');

    const prompt = `You are analyzing news article titles to identify duplicates - articles covering the SAME news story/event.

CRITICAL RULES:
- Articles about the SAME story/event = DUPLICATES (even if worded differently)
- Articles about DIFFERENT stories = NOT DUPLICATES (even if similar topic/company)
- Look for: same company + same event/announcement + same timeframe
- Ignore: source differences, minor wording variations

Examples:
DUPLICATES (same story):
- "KKR aims to raise $15 billion for Asia fund"
- "KKR seeks $15B in new Asia private equity fund"
- "KKR launches $15 billion fundraising for fifth Asia fund"
→ All about KKR's specific $15B Asia fundraising

NOT DUPLICATES (different stories):
- "Apple announces new iPhone 15"
- "Apple reports Q3 earnings beat"
→ Different Apple stories

Articles to analyze:
${articleList}

Task: Identify groups of articles covering the SAME story. Return ONLY duplicate groups (2+ articles about same story).

Response format (JSON array of arrays):
[[1, 4, 7], [2, 9]]

This means:
- Articles 1, 4, 7 are duplicates (same story)
- Articles 2, 9 are duplicates (same story)
- All other articles are unique

If NO duplicates found, return: []

CRITICAL: Respond with ONLY valid JSON - no explanations or comments.
Do NOT say "I'm unable to..." or "I apologize..." - just return the JSON array.

Respond with JSON only (no other text):`;

    const response = callChatGPT(prompt, 800);

    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    // Validate that response looks like JSON array before parsing
    if (!cleanedResponse.trim().startsWith('[')) {
      Logger.log(`⚠ Semantic dedup response is not JSON array. Response: ${cleanedResponse.substring(0, 200)}`);
      throw new Error('GPT did not return valid JSON array for deduplication');
    }

    const duplicateGroups = JSON.parse(cleanedResponse);

    if (!Array.isArray(duplicateGroups) || duplicateGroups.length === 0) {
      Logger.log('✓ No semantic duplicates found');
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
        if (idx !== bestIdx) {
          indicesToRemove.add(idx);
        }
      });
    });

    const dedupedArticles = articles.filter((_, idx) => !indicesToRemove.has(idx));

    Logger.log(`✓ Semantic dedup: ${articles.length} → ${dedupedArticles.length} (removed ${indicesToRemove.size})`);

    return dedupedArticles;

  } catch (error) {
    Logger.log(`❌ Semantic dedup failed: ${error.toString()}`);
    Logger.log(`❌ Error stack: ${error.stack}`);

    // Try to log the response if available
    try {
      if (response) {
        Logger.log(`❌ GPT Response (first 300 chars): ${response.substring(0, 300)}`);
      }
    } catch (e) {
      // Ignore logging errors
    }

    Logger.log(`⚠ Continuing with original articles (no deduplication)`);
    return articles; // Return original on error
  }
}

function curateTopArticlesWithGPT(articles, targetCount, sectionType) {
  // Skip GPT curation if API key not configured or too few articles
  if (!CONFIG.OPENAI_API_KEY || CONFIG.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    return articles.slice(0, targetCount);
  }

  if (articles.length <= targetCount) {
    return articles; // Already at or below target
  }

  try {
    // Prepare article list with indices for GPT
    const articleList = articles.map((a, idx) => {
      const preview = a.description ? ` - ${a.description.substring(0, 100)}...` : '';
      return `${idx}: [${a.source}] ${a.title}${preview}`;
    }).join('\n\n');

    const sectionContext = {
      'global': 'global business, economy, policy, markets, and major corporate news',
      'pe': 'private equity, M&A, deals, fundraising, exits, and investment activity',
      'korea': 'Korean business, economy, policy, major companies (chaebols, startups), and market developments'
    };

    const prompt = `You are a senior business analyst curating the most important news for PE professionals.

SECTION: ${sectionContext[sectionType] || 'business news'}

Your task: Select the ${targetCount} MOST IMPORTANT articles from the candidate list below.

IMPORTANCE CRITERIA (ranked):
1. **Market-moving news** - Central bank decisions, major economic data, policy changes
2. **Major deals & transactions** - Large M&A, significant PE deals, IPO filings
3. **Corporate developments** - CEO changes, major restructuring, earnings surprises
4. **Regulatory & policy** - New regulations, government actions affecting business
5. **Strategic shifts** - Major business model changes, industry disruptions

AVOID selecting:
- Minor incremental news without clear impact
- Repetitive updates on the same ongoing story
- Speculative or rumor-based reporting
- Minor regional news without broader significance

Articles to analyze:
${articleList}

Task: Select exactly ${targetCount} articles that are MOST important for business decision-makers.

Response format (JSON array of indices):
[3, 7, 12, 15, 20]

This means articles at indices 3, 7, 12, 15, and 20 are the most important.

CRITICAL INSTRUCTIONS:
- Return EXACTLY ${targetCount} indices
- Respond with ONLY valid JSON - no explanations, apologies, or comments
- Do NOT say "I'm unable to..." or "I apologize..." - just return the JSON array
- If you cannot select, return indices [0, 1, 2, ..., ${targetCount - 1}]

Respond with JSON array only (no other text):`;

    const response = callChatGPT(prompt, 300);

    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    // Validate that response looks like JSON array before parsing
    if (!cleanedResponse.trim().startsWith('[')) {
      Logger.log(`⚠ GPT curation response is not JSON array. Response: ${cleanedResponse.substring(0, 200)}`);
      throw new Error('GPT did not return valid JSON array');
    }

    const selectedIndices = JSON.parse(cleanedResponse);

    if (!Array.isArray(selectedIndices) || selectedIndices.length === 0) {
      Logger.log('⚠ GPT curation returned no selections, using top articles by score');
      return articles.slice(0, targetCount);
    }

    // Extract selected articles in the order GPT chose them
    const curatedArticles = selectedIndices
      .filter(idx => idx >= 0 && idx < articles.length)
      .map(idx => articles[idx]);

    Logger.log(`✓ GPT curation: ${articles.length} → ${curatedArticles.length} curated articles`);

    // If GPT didn't return enough, fill with top-scored articles
    if (curatedArticles.length < targetCount) {
      const selectedSet = new Set(selectedIndices);
      const remaining = articles
        .map((a, idx) => ({ article: a, idx }))
        .filter(item => !selectedSet.has(item.idx))
        .map(item => item.article)
        .slice(0, targetCount - curatedArticles.length);
      curatedArticles.push(...remaining);
    }

    return curatedArticles.slice(0, targetCount);

  } catch (error) {
    Logger.log(`❌ GPT curation failed: ${error.toString()}`);
    Logger.log(`❌ Error stack: ${error.stack}`);

    // Try to log the response if available
    try {
      if (response) {
        Logger.log(`❌ GPT Response (first 300 chars): ${response.substring(0, 300)}`);
      }
    } catch (e) {
      // Ignore logging errors
    }

    Logger.log(`⚠ Falling back to top ${targetCount} articles by score`);
    return articles.slice(0, targetCount); // Return top by score on error
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

function generateAISummary(globalArticles, peArticles, koreaArticles, marketData) {
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

    const peContext = peArticles.slice(0, 8).map((a, i) => {
      return `${i + 1}. [${a.source}] ${a.title}`;
    }).join('\n');

    const koreaContext = koreaArticles.slice(0, 8).map((a, i) => {
      return `${i + 1}. [${a.source}] ${a.title}`;
    }).join('\n');

    const marketContext = formatMarketContextForAI(marketData);

    const prompt = `You are an executive analyst for private equity professionals.
Analyze TODAY'S news (last 24 hours) and provide a daily briefing focused on NEW developments.

CRITICAL: This is a DAILY briefing. Focus on what CHANGED or HAPPENED in the last 24 hours.
Use present tense and "today" language: "announced today", "reports show", "markets responded to..."
Avoid generic evergreen analysis. Highlight NEW information, decisions, announcements, and movements.

IMPORTANT FILTER: Ignore ANY sports or entertainment news that may have slipped through:
- Sports: football, basketball, soccer, tennis, olympics, athlete deals, team acquisitions, stadium sales
- Entertainment: movies, music, concerts, celebrities, K-pop, streaming services, box office
- Focus ONLY on business, finance, economy, policy, corporate M&A, technology, industry

=== MARKET DATA (Last 24 Hours) ===
${marketContext}

=== GLOBAL TOP HEADLINES (Today) ===
${globalContext}

=== PE/M&A SPECIFIC NEWS (Today) ===
${peContext}

=== KOREA HEADLINES (Today) ===
${koreaContext}

TASK: Synthesize TODAY'S BUSINESS developments into actionable intelligence:

1. **Key Insights** (6 bullets, 150-200 chars each)
   - PRIORITY ORDER: (1) Global macro/economic developments, (2) Korea economic/policy news, (3) PE deals/M&A, (4) Other significant business events
   - Start with what's shaking global/Korea economies - central banks, policy, inflation, trade, markets
   - Place PE deals and M&A news in the MIDDLE positions (bullets 3-4), not at the beginning
   - Use action verbs: "announced", "reported", "reached", "fell", "surged"
   - Focus on concrete events and numbers from TODAY
   - Example order: [Global macro] [Korea policy] [Deal news] [Deal news] [Market reaction] [Sector development]

2. **Macro-Economic & Policy** (700-900 chars)
   - TODAY'S central bank actions, economic data releases, policy announcements
   - NEW inflation/employment numbers, rate decisions, fiscal policy changes
   - Market reactions to today's developments
   - How today's news affects investment strategy going forward
   - Use temporal markers: "today", "this morning", "announced", "reported"

3. **PE & Deal Activity** (600-800 chars)
   - Deals ANNOUNCED today, closings, IPO filings, PE exits
   - NEW valuations, fundraising announcements, LP commitments
   - TODAY'S market conditions affecting deal activity
   - Recent transaction trends visible in today's news
   - If no major deals today, write: "(No significant PE transactions reported in last 24 hours)"

4. **Korea Business Focus** (500-700 chars)
   - TODAY'S major Korean corporate announcements and decisions
   - Samsung, Hyundai, SK, LG developments from today
   - Korean market reactions and policy news
   - Cross-border implications of today's Korea news
   - IMPORTANT: Even if news seems minor, analyze what's available rather than saying "limited developments"
   - Focus on what DID happen, not what didn't

5. **Sector Trends** (500-700 chars or empty)
   - Which sectors saw major developments TODAY
   - NEW product launches, regulatory changes, earnings reports
   - TODAY'S technology breakthroughs or industry shifts
   - If no clear sector story today, leave empty

CRITICAL REMINDERS:
- This is a DAILY update - emphasize what's NEW in last 24 hours
- Use present tense and time markers: "today", "announced", "reported"
- Focus on EVENTS and CHANGES, not static analysis
- For Korea section: ALWAYS provide analysis based on available news, don't use placeholder text
- If a section has minimal news, briefly note market conditions or sentiment instead
- Readers get this EVERY day - make each day's content feel fresh and timely

RESPONSE FORMAT - CRITICAL:
You MUST respond ONLY with valid JSON. Do NOT include any explanatory text, apologies, or comments.
If you cannot generate a summary, return the JSON structure with empty arrays/strings.
Do NOT say "I'm unable to..." or "I apologize..." - just return the JSON.

Expected JSON format (respond with ONLY this, nothing else):
{
  "insights": ["insight1 with TODAY'S news", "insight2...", "insight3...", "insight4...", "insight5...", "insight6..."],
  "macroEconomic": "today's economic/policy developments...",
  "peDeals": "today's PE/M&A activity - if truly nothing, briefly note 'Quiet day for major transactions, markets focused on...'",
  "korea": "today's Korea business news - ALWAYS provide analysis, never use placeholder text",
  "sectors": "today's sector developments or empty string"
}

Respond with JSON only (no other text):`;

    const response = callChatGPT(prompt, 3500);

    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    // Validate that response looks like JSON before parsing
    if (!cleanedResponse.trim().startsWith('{')) {
      Logger.log(`⚠ AI response is not JSON. Response: ${cleanedResponse.substring(0, 200)}`);
      throw new Error('AI did not return valid JSON');
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
    Logger.log(`❌ AI summary error: ${error.toString()}`);
    Logger.log(`❌ Error stack: ${error.stack}`);

    // Try to log the response if available
    try {
      if (response) {
        Logger.log(`❌ GPT Response (first 500 chars): ${response.substring(0, 500)}`);
      }
    } catch (e) {
      // Ignore logging errors
    }

    return {
      headline: 'Global News Headlines',
      insights: ['AI summary unavailable - check logs for details'],
      macroEconomic: 'Summary generation failed. Please check system logs.',
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

  if (marketData.forex && marketData.forex.length > 0) {
    context += 'FX: ';
    marketData.forex.forEach(fx => {
      if (fx && fx.price) {
        const chg = fx.dayChange >= 0 ? `+${fx.dayChange.toFixed(2)}%` : `${fx.dayChange.toFixed(2)}%`;
        let pairName = 'USD/???';
        if (fx.symbol === 'KRW=X') pairName = 'USD/KRW';
        else if (fx.symbol === 'JPY=X') pairName = 'USD/JPY';
        else {
          const currency = fx.symbol.replace('=X', '');
          pairName = `USD/${currency}`;
        }
        context += `${pairName} ${fx.price.toFixed(2)} (${chg}), `;
      }
    });
    context = context.slice(0, -2) + '\n';
  }

  if (marketData.commodities && marketData.commodities.length > 0) {
    context += 'Commodities: ';
    marketData.commodities.forEach(item => {
      if (item && item.price) {
        const chg = item.dayChange >= 0 ? `+${item.dayChange.toFixed(2)}%` : `${item.dayChange.toFixed(2)}%`;

        let displayName = 'Unknown';
        if (item.symbol === 'GC=F') displayName = 'Gold';
        else if (item.symbol === 'CL=F') displayName = 'Oil';
        else if (item.symbol === 'BTC-USD') displayName = 'Bitcoin';
        else displayName = item.name || item.symbol;

        const priceStr = (item.symbol === 'BTC-USD') ? `$${item.price.toFixed(0)}` : `$${item.price.toFixed(2)}`;
        context += `${displayName} ${priceStr} (${chg}), `;
      }
    });
    context = context.slice(0, -2) + '\n';
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

function formatSlackMessage(aiSummary, globalArticles, peArticles, koreaArticles, marketData) {
  const blocks = [];
  const today = Utilities.formatDate(new Date(), 'GMT+9', 'yyyy-MM-dd EEEE');

  // ==================== HEADER ====================
  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: 'Global Business & Markets Brief',
      emoji: true
    }
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

    const globalLines = globalArticles.map((a, i) => {
      const cleanedTitle = deepCleanText(a.title);
      const cleanedLink = deepCleanText(a.link);
      return `${i + 1}. <${cleanedLink}|${cleanedTitle}>`;
    });

    addArticleBlocks(blocks, globalLines);

    blocks.push({ type: 'divider' });
  }

  // ==================== SECTION 2: PE/M&A NEWS ====================
  if (peArticles.length > 0) {
    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: '💼 Private Equity & M&A',
        emoji: true
      }
    });

    const peLines = peArticles.map((a, i) => {
      const cleanedTitle = deepCleanText(a.title);
      const cleanedLink = deepCleanText(a.link);
      return `${i + 1}. <${cleanedLink}|${cleanedTitle}>`;
    });

    addArticleBlocks(blocks, peLines);

    blocks.push({ type: 'divider' });
  }

  // ==================== SECTION 3: KOREA HEADLINES ====================
  if (koreaArticles.length > 0) {
    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🇰🇷 Korea Business & Markets',
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

  // ==================== FOOTER ====================
  blocks.push({
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: `🤖 Analysis by GPT-4 | ${globalArticles.length + peArticles.length + koreaArticles.length} curated articles`
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
    
    // Skip empty or too short lines
    if (!cleanLine || cleanLine.trim().length < 10) {
      return;
    }
    
    const lineLength = cleanLine.length + 1;

    if (currentLength + lineLength > CHARS_PER_BLOCK && currentChunk.length > 0) {
      // Join and clean again before adding block
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

  if (marketData.forex && marketData.forex.length > 0) {
    text += '*FX*\n';
    marketData.forex.forEach(fx => {
      if (fx && fx.price != null) {
        const emoji = fx.dayChange >= 0 ? '📈' : '📉';
        const day = fx.dayChange.toFixed(2);
        const week = fx.weekChange.toFixed(2);

        // Extract currency pair name from symbol (e.g., KRW=X -> USD/KRW)
        let pairName = 'USD/???';
        if (fx.symbol === 'KRW=X') pairName = 'USD/KRW';
        else if (fx.symbol === 'JPY=X') pairName = 'USD/JPY';
        else {
          const currency = fx.symbol.replace('=X', '');
          pairName = `USD/${currency}`;
        }

        text += `${emoji} ${pairName}: ${fx.price.toFixed(2)} (${day}% | WoW ${week}%)\n`;
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

        // Determine display name and price format
        let displayName = 'Unknown';
        let priceStr = '';

        if (item.symbol === 'GC=F') {
          displayName = 'Gold';
          priceStr = `$${item.price.toFixed(2)}`;
        } else if (item.symbol === 'CL=F') {
          displayName = 'Oil (WTI)';
          priceStr = `$${item.price.toFixed(2)}`;
        } else if (item.symbol === 'BTC-USD') {
          displayName = 'Bitcoin';
          priceStr = `$${item.price.toFixed(0)}`;
        } else {
          displayName = item.name || item.symbol;
          priceStr = `$${item.price.toFixed(2)}`;
        }

        text += `${emoji} ${displayName}: ${priceStr} (${day}% | WoW ${week}%)\n`;
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
  Logger.log('🧪 Testing v3.1 Multi-Section...\n');

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
