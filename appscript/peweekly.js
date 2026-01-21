/**
 * PE Weekly Roundup v3.8
 * - MAJOR: 중복 뉴스 대폭 강화
 * - 회사/이벤트당 최대 기사 수 제한
 * - 향상된 시그니처 추출
 * - 더 공격적인 GPT dedup
 * - 최종 다양성 체크 추가
 */

// ==================== Config ====================

var Config = {
  OPENAI_API_KEY: typeof SECRETS !== 'undefined' ? SECRETS.OPENAI_API_KEY : 'sk-your-openai-api-key-here',
  PERPLEXITY_API_KEY: typeof SECRETS !== 'undefined' ? SECRETS.PERPLEXITY_API_KEY : 'pplx-your-perplexity-api-key-here',
  SLACK_WEBHOOK_URL: typeof SECRETS !== 'undefined' ? SECRETS.SLACK_WEBHOOK_URL_NEWS : 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
  GPT_MODEL: 'gpt-4-turbo-preview',
  PERPLEXITY_MODEL: 'sonar-pro',

  DAYS_BACK: 7,

  KOREA_ARTICLES: 10,
  ASIA_MENA_ARTICLES: 10,
  US_ARTICLES: 7,
  EUROPE_ARTICLES: 7,

  // 같은 회사/이벤트 최대 기사 수
  MAX_PER_COMPANY: 2,
  MAX_PER_EVENT: 2
};

// ==================== SOURCE QUALITY ====================

var SOURCE_QUALITY = {
  tier1: [
    'wsj.com', 'ft.com', 'bloomberg.com', 'reuters.com',
    'nytimes.com', 'economist.com', 'pitchbook.com', 'pehub.com',
    'privateequityinternational.com', 'theinformation.com', 'axios.com',
    'nikkei.com', 'koreatimes.co.kr', 'koreaherald.com',
    'chosun.com', 'chosunbiz.com', 'joins.com', 'hankyung.com',
    'forbes.com', 'maeil.com', 'mk.co.kr', 'sedaily.com'
  ],
  tier2: [
    'techcrunch.com', 'cnbc.com', 'businessinsider.com',
    'dealstreetasia.com', 'asianinvestor.net', 'theaustralian.com.au'
  ],
  blacklist: [
    'marketbeat', 'zacks', 'benzinga', 'gurufocus', 'ts2.tech',
    'citybiz', 'thehawk.in', 'inkl', 'spilled.gg', 'tweaktown',
    'technology org', 'jakarta globe', 'ssbcrack', 'cryptorank',
    'techstock', 'sporting goods intelligence'
  ]
};

// ==================== KOREAN ENTITIES ====================

var KOREAN_ENTITIES = [
  'korea', 'korean', 'seoul', 'kospi', 'kosdaq', 'won ',
  'mbk partners', 'mbk ', 'imm investment', 'imm ', 'anchor equity', 'arc capital',
  'altos ventures', 'atinum', 'stic investments',
  'samsung', 'hyundai', 'sk group', 'sk ', 'lg group', 'lg ',
  'lotte', 'cj group', 'cj ', 'kakao', 'naver', 'coupang', 'musinsa',
  'hybe', 'dunamu', 'upbit', 'toss', 'homeplus', 'emart', 'shinsegae',
  'hanwha', 'posco', 'kia', 'celltrion', 'krafton', 'nexon', 'netmarble',
  'yanolja', 'woowa', 'daangn', 'doosan', 'ecorbit', 'chindata',
  'bang si-hyuk', 'kim kwang-il', 'fss ', 'financial supervisory',
  'chosun', 'joongang', 'hankyung', 'maeil', 'ked global', 'yonhap'
];

// ==================== NEWS SOURCES ====================

var NEWS_SOURCES = [
  // KOREA
  { name: 'Korea PE - MBK', url: 'https://news.google.com/rss/search?q=(MBK+Partners)+(korea+OR+korean)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'korea', priority: 1 },
  { name: 'Korea PE - IMM', url: 'https://news.google.com/rss/search?q=(IMM+Investment)+(korea+OR+korean)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'korea', priority: 1 },
  { name: 'Korea PE - Global', url: 'https://news.google.com/rss/search?q=(KKR+OR+Blackstone+OR+Carlyle+OR+Bain+Capital)+(korea+OR+korean)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'korea', priority: 1 },
  { name: 'Korea PE Deals', url: 'https://news.google.com/rss/search?q=(korea+OR+korean)+(private+equity)+(acquisition+OR+buyout)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'korea', priority: 1 },
  { name: 'Korea M&A', url: 'https://news.google.com/rss/search?q=(korea+OR+korean)+(M%26A+OR+merger+OR+acquisition)+(billion+OR+million)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'korea', priority: 1 },
  { name: 'Korea IPO', url: 'https://news.google.com/rss/search?q=(korea+OR+korean)+(IPO+OR+listing)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'korea', priority: 1 },
  { name: 'Korea Scandals', url: 'https://news.google.com/rss/search?q=(korea+OR+korean)+(MBK+OR+private+equity)+(scandal+OR+investigation+OR+fraud)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'korea', priority: 1 },
  { name: 'Homeplus', url: 'https://news.google.com/rss/search?q=homeplus+(MBK+OR+fraud+OR+investigation)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'korea', priority: 1 },
  { name: 'Korean Companies', url: 'https://news.google.com/rss/search?q=(Doosan+OR+Samsung+OR+Hyundai)+(acquisition+OR+private+equity)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'korea', priority: 1 },

  // ASIA-PACIFIC & MENA
  { name: 'Japan PE', url: 'https://news.google.com/rss/search?q=(japan+OR+japanese)+(private+equity+OR+acquisition)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'asia', priority: 1 },
  { name: 'Australia PE', url: 'https://news.google.com/rss/search?q=australia+(private+equity+OR+acquisition)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'asia', priority: 1 },
  { name: 'SEA PE', url: 'https://news.google.com/rss/search?q=(singapore+OR+vietnam+OR+indonesia)+(private+equity)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'asia', priority: 1 },
  { name: 'India PE', url: 'https://news.google.com/rss/search?q=india+(private+equity+OR+acquisition)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'asia', priority: 1 },
  { name: 'China PE', url: 'https://news.google.com/rss/search?q=china+(private+equity+OR+acquisition)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'asia', priority: 1 },
  { name: 'MENA PE', url: 'https://news.google.com/rss/search?q=(dubai+OR+saudi+OR+qatar+OR+uae)+(private+equity+OR+sovereign+wealth)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'asia', priority: 1 },
  { name: 'GCC SWF', url: 'https://news.google.com/rss/search?q=(PIF+OR+mubadala+OR+adia+OR+QIA)+(investment+OR+acquisition)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'asia', priority: 1 },

  // EUROPE
  { name: 'Europe PE', url: 'https://news.google.com/rss/search?q=(europe+OR+european)+(private+equity+OR+acquisition)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'europe', priority: 1 },
  { name: 'UK PE', url: 'https://news.google.com/rss/search?q=(uk+OR+britain+OR+london)+(private+equity+OR+buyout)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'europe', priority: 1 },
  { name: 'Germany France PE', url: 'https://news.google.com/rss/search?q=(germany+OR+france)+(private+equity+OR+acquisition)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'europe', priority: 1 },

  // US
  { name: 'PitchBook', url: 'https://news.google.com/rss/search?q=site:pitchbook.com+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'us', priority: 1 },
  { name: 'PE Hub', url: 'https://news.google.com/rss/search?q=site:pehub.com+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'us', priority: 1 },
  { name: 'WSJ PE', url: 'https://news.google.com/rss/search?q=site:wsj.com+(private+equity+OR+merger+OR+buyout)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'us', priority: 1 },
  { name: 'Bloomberg Deals', url: 'https://news.google.com/rss/search?q=site:bloomberg.com+(acquisition+OR+buyout+OR+private+equity)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'us', priority: 1 },
  { name: 'Reuters M&A', url: 'https://news.google.com/rss/search?q=site:reuters.com+(merger+OR+acquisition)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'us', priority: 1 },
  { name: 'PE Fundraising', url: 'https://news.google.com/rss/search?q=(private+equity)+(fundraising+OR+fund+close)+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'us', priority: 1 },
  { name: 'US Mega Deals', url: 'https://news.google.com/rss/search?q=(acquisition+OR+buyout)+billion+dollars+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'us', priority: 2 },
  { name: 'PE Hub Direct', url: 'https://www.pehub.com/feed/', region: 'us', priority: 1 },
  { name: 'DealStreetAsia Direct', url: 'https://www.dealstreetasia.com/feed/', region: 'asia', priority: 1 },
  { name: 'PE International', url: 'https://www.privateequityinternational.com/feed/', region: 'us', priority: 1 }
];

// ==================== NON-PE TOPICS ====================

var NON_PE_TOPICS = [
  'government budget', 'cabinet approves budget', 'defence budget', 'defense budget',
  'military budget', 'approves budget', 'budget with',
  'arms cooperation', 'military cooperation', 'diplomatic',
  'election', 'votes', 'parliament',
  'acquisition of submarines', 'acquisition of fighter', 'acquisition of warship',
  'acquisition of missile', 'acquisition of tank', 'military acquisition',
  'defense acquisition', 'defence acquisition', 'strike capabilities',
  'naval acquisition', 'army acquisition', 'air force acquisition',
  'billion gift', 'billion donation', 'philanthropic', 'philanthropy',
  'industry turnover', 'industry body', 'aerospace turnover',
  'dating rumor', 'dating rumors', 'dating scandal',
  'relationship rumor', 'romance rumor',
  'breakup', 'divorce', 'wedding', 'married',
  'jungkook', 'bts ', ' bts', 'aespa', 'blackpink', 'k-pop', 'kpop',
  'daily news,', 'weekly news,', 'news roundup', 'news digest',
  'morning brief', 'evening brief', 'daily brief',
  'weather', 'earthquake', 'hurricane', 'flood', 'typhoon'
];

var BAD_TITLE_PATTERNS = [
  /daily news.*\d{4}/i,
  /weekly news.*\d{4}/i,
  /news digest/i,
  /dating rumor/i,
  /relationship with/i,
  /^\s*\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i
];

// ==================== MAIN ====================

function runWeeklyPEBrief() {
  try {
    Logger.log('🚀 Starting PE Weekly Roundup v3.8...\n');

    // 1. Fetch all articles by region
    var regionData = fetchAllNewsByRegion();

    // 2. Reclassify by content
    regionData = reclassifyByContent(regionData);

    Logger.log('\n📊 After content reclassification:');
    Logger.log('   Korea: ' + regionData.korea.length);
    Logger.log('   Asia/MENA: ' + regionData.asia.length);
    Logger.log('   US: ' + regionData.us.length);
    Logger.log('   Europe: ' + regionData.europe.length);

    // 3. ENHANCED DEDUP per region
    Logger.log('\n🔄 Enhanced deduplication...');
    regionData.korea = enhancedDedup(regionData.korea, 'korea');
    regionData.asia = enhancedDedup(regionData.asia, 'asia');
    regionData.us = enhancedDedup(regionData.us, 'us');
    regionData.europe = enhancedDedup(regionData.europe, 'europe');

    Logger.log('\n📊 After enhanced dedup:');
    Logger.log('   Korea: ' + regionData.korea.length);
    Logger.log('   Asia/MENA: ' + regionData.asia.length);
    Logger.log('   US: ' + regionData.us.length);
    Logger.log('   Europe: ' + regionData.europe.length);

    // 4. Score and pre-select articles
    var koreaRaw = selectTopArticles(regionData.korea, Config.KOREA_ARTICLES * 2, 'korea');
    var asiaMenaRaw = selectTopArticles(regionData.asia, Config.ASIA_MENA_ARTICLES * 2, 'asia');
    var usRaw = selectTopArticles(regionData.us, Config.US_ARTICLES * 2, 'us');
    var europeRaw = selectTopArticles(regionData.europe, Config.EUROPE_ARTICLES * 2, 'europe');

    // 5. AGGRESSIVE GPT-based final dedup
    Logger.log('\n🤖 GPT-based aggressive deduplication...');
    var korea = gptAggressiveDedup(koreaRaw, 'Korea', Config.KOREA_ARTICLES);
    var asiaMena = gptAggressiveDedup(asiaMenaRaw, 'Asia/MENA', Config.ASIA_MENA_ARTICLES);
    var us = gptAggressiveDedup(usRaw, 'US', Config.US_ARTICLES);
    var europe = gptAggressiveDedup(europeRaw, 'Europe', Config.EUROPE_ARTICLES);

    // 6. Final diversity check
    Logger.log('\n✨ Final diversity check...');
    korea = enforceDiversity(korea, 'Korea');
    asiaMena = enforceDiversity(asiaMena, 'Asia/MENA');
    us = enforceDiversity(us, 'US');
    europe = enforceDiversity(europe, 'Europe');

    Logger.log('\n✅ Final article counts:');
    Logger.log('   Korea: ' + korea.length);
    Logger.log('   Asia/MENA: ' + asiaMena.length);
    Logger.log('   US: ' + us.length);
    Logger.log('   Europe: ' + europe.length);

    // 7. Generate highlights
    var highlights = generateHighlights({ korea: korea, asiaMena: asiaMena, us: us, europe: europe });

    // 8. Send to Slack
    var message = formatSlackMessage(highlights, korea, asiaMena, us, europe);
    sendToSlack(message);

    Logger.log('\n✅ PE Weekly Roundup sent successfully!');

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    Logger.log(error.stack);
    sendErrorToSlack(error);
  }
}

// ==================== FETCH NEWS ====================

function fetchAllNewsByRegion() {
  var data = { korea: [], asia: [], us: [], europe: [] };
  var cutoff = new Date(Date.now() - Config.DAYS_BACK * 24 * 60 * 60 * 1000);

  NEWS_SOURCES.forEach(function (source) {
    try {
      Logger.log('Fetching: ' + source.name + '...');
      var articles = fetchRSS(source.url);

      articles = articles.filter(function (a) {
        return new Date(a.publishedAt) > cutoff;
      });

      articles = articles.filter(function (a) {
        var linkLower = a.link.toLowerCase();
        return !SOURCE_QUALITY.blacklist.some(function (bad) {
          return linkLower.indexOf(bad) !== -1;
        });
      });

      articles = articles.filter(function (a) {
        var textLower = (a.title + ' ' + a.description).toLowerCase();

        var hasNonPETopic = NON_PE_TOPICS.some(function (topic) {
          return textLower.indexOf(topic) !== -1;
        });
        if (hasNonPETopic) return false;

        var hasBadPattern = BAD_TITLE_PATTERNS.some(function (pattern) {
          return pattern.test(a.title);
        });
        if (hasBadPattern) return false;

        return true;
      });

      articles.forEach(function (a) {
        a.title = cleanTitle(a.title);
        a.priority = source.priority;
        a.sourceRegion = source.region;
      });

      data[source.region] = data[source.region].concat(articles);
      Logger.log('  → ' + articles.length + ' articles');

    } catch (e) {
      Logger.log('  ✗ Error: ' + e.toString());
    }
  });

  return data;
}

function fetchRSS(url) {
  try {
    var response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: { 'User-Agent': 'Mozilla/5.0 PEWeeklyBot/1.0' }
    });

    if (response.getResponseCode() !== 200) return [];

    var xml = response.getContentText();
    var doc = XmlService.parse(xml);
    var root = doc.getRootElement();
    var items = root.getChild('channel') ? root.getChild('channel').getChildren('item') : [];

    var articles = [];
    items.forEach(function (item) {
      try {
        var title = item.getChild('title') ? item.getChild('title').getText() : '';
        var link = item.getChild('link') ? item.getChild('link').getText() : '';
        var pubDate = item.getChild('pubDate') ? item.getChild('pubDate').getText() : '';
        var desc = item.getChild('description') ? item.getChild('description').getText() : '';

        title = cleanTitle(title);

        if (!isValidTitle(title)) return;
        if (!link) return;

        articles.push({
          title: title,
          link: link,
          description: desc.replace(/<[^>]*>/g, '').substring(0, 200),
          publishedAt: pubDate ? new Date(pubDate) : new Date(),
          score: 0
        });
      } catch (e) { }
    });

    return articles;
  } catch (e) {
    return [];
  }
}

function isValidTitle(title) {
  if (!title || title.length < 25) return false;

  var words = title.split(/\s+/).filter(function (w) { return w.length > 0; });
  if (words.length < 4) return false;

  var badTitles = ['exclusive', 'breaking', 'update', 'news', 'article', 'untitled'];
  var titleLower = title.toLowerCase().trim();
  if (badTitles.indexOf(titleLower) !== -1) return false;

  return true;
}

// ==================== TITLE CLEANING ====================

function cleanTitle(title) {
  if (!title) return '';

  title = title.replace(/<[^>]*>/g, '');
  title = title.replace(/^Exclusive\s*[\|:\-–—]\s*/gi, '');
  title = title.replace(/\.?\s*Details here\.?$/gi, '');

  var sourcesToRemove = [
    'Bloomberg', 'Reuters', 'WSJ', 'Wall Street Journal', 'FT', 'Financial Times',
    'NYT', 'New York Times', 'CNBC', 'Forbes', 'TechCrunch', 'Yahoo', 'AP', 'AFP',
    'PitchBook', 'PE Hub', 'Private Equity International', 'Business Wire', 'PR Newswire',
    '조선일보', '조선비즈', 'CHOSUNBIZ', 'Chosunbiz', '중앙일보', 'JoongAng',
    '한경', 'Hankyung', '매일경제', 'MK', 'Korea Times', 'Korea Herald',
    'The Australian', 'Nikkei', 'Nikkei Asia', 'DealStreetAsia',
    'TradingView', 'TweakTown', 'Bitget', 'Soap Central', 'MSN',
    'SSBCrack', 'SSBCrack News', 'CryptoRank', 'TechStock²',
    'Sporting Goods Intelligence', 'Sporting Goods Intelligence Europe'
  ];

  sourcesToRemove.forEach(function (source) {
    var patterns = [
      new RegExp('\\s*[-–—]\\s*' + escapeRegex(source) + '\\s*$', 'gi'),
      new RegExp('\\s*\\|\\s*' + escapeRegex(source) + '\\s*$', 'gi')
    ];
    patterns.forEach(function (p) {
      title = title.replace(p, '');
    });
  });

  title = title.replace(/\s*[-–—]\s*[a-z0-9]+\.[a-z]{2,}(\.[a-z]{2,})?\s*$/gi, '');
  title = title.replace(/^(United States|UK|Europe|Asia|Africa|Middle East)\s*[-–—]\s*/gi, '');

  return title.replace(/\s+/g, ' ').trim();
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ==================== CONTENT RECLASSIFICATION ====================

function reclassifyByContent(data) {
  var result = { korea: [], asia: [], us: [], europe: [] };

  var all = data.korea.concat(data.asia).concat(data.us).concat(data.europe);

  all.forEach(function (article) {
    var text = (article.title + ' ' + article.description).toLowerCase();

    var isKorean = KOREAN_ENTITIES.some(function (entity) {
      return text.indexOf(entity.toLowerCase()) !== -1;
    });

    if (isKorean) {
      result.korea.push(article);
    } else if (isAsiaContent(text)) {
      result.asia.push(article);
    } else if (isEuropeContent(text)) {
      result.europe.push(article);
    } else {
      result.us.push(article);
    }
  });

  return result;
}

function isAsiaContent(text) {
  var northAmericaKeywords = ['canada', 'canadian', 'toronto', 'vancouver', 'montreal'];
  var hasNorthAmerica = northAmericaKeywords.some(function (kw) { return text.indexOf(kw) !== -1; });
  if (hasNorthAmerica) return false;

  var keywords = [
    'japan', 'japanese', 'tokyo', 'softbank', 'nikkei',
    'australia', 'australian', 'sydney', 'melbourne',
    'singapore', 'vietnam', 'thailand', 'indonesia', 'malaysia', 'philippines',
    'india', 'indian', 'mumbai', 'adani',
    'china', 'chinese', 'shanghai', 'hong kong', 'beijing',
    'taiwan', 'taipei',
    'uae', 'dubai', 'abu dhabi', 'saudi', 'qatar', 'gcc',
    'pif', 'mubadala', 'adia', 'qia', 'temasek', 'gic',
    'israel', 'israeli', 'tel aviv',
    'kenya', 'kenyan', 'nairobi', 'south africa', 'nigeria', 'africa'
  ];
  return keywords.some(function (kw) { return text.indexOf(kw) !== -1; });
}

function isEuropeContent(text) {
  var keywords = [
    'europe', 'european', 'eu ',
    'uk', 'britain', 'british', 'london',
    'france', 'french', 'paris',
    'germany', 'german', 'berlin', 'frankfurt',
    'spain', 'italy', 'netherlands', 'sweden', 'switzerland'
  ];
  return keywords.some(function (kw) { return text.indexOf(kw) !== -1; });
}

// ==================== ENHANCED DEDUPLICATION ====================

function enhancedDedup(articles, region) {
  if (articles.length === 0) return [];

  // Step 1: Extract enhanced signature
  articles.forEach(function (a) {
    var sig = extractEnhancedSignature(a.title, a.description);
    a.signature = sig.signature;
    a.companies = sig.companies;
    a.event = sig.event;
  });

  // Step 2: Group by signature
  var groups = {};
  articles.forEach(function (a) {
    var sig = a.signature;
    if (!groups[sig]) {
      groups[sig] = [];
    }
    groups[sig].push(a);
  });

  // Step 3: Keep only best from each group
  var unique = [];
  for (var sig in groups) {
    var group = groups[sig];
    group.sort(function (a, b) {
      return getSourceScore(b.link) - getSourceScore(a.link);
    });
    unique.push(group[0]);

    if (group.length > 1) {
      Logger.log('  [' + region + '] Merged ' + group.length + ' articles: "' + sig + '"');
    }
  }

  // Step 4: Enforce per-company and per-event limits
  unique = enforceCompanyLimits(unique, region);

  return unique;
}

// 향상된 시그니처 추출 - 회사명과 이벤트 타입 결합
function extractEnhancedSignature(title, desc) {
  var text = (title + ' ' + desc).toLowerCase();

  var companies = extractAllCompanies(text);
  var event = extractEventType(text);
  var amount = extractAmount(text);

  // Signature: company1+company2|event|amount
  var companySig = companies.slice(0, 2).sort().join('+');
  var signature = companySig + '|' + event;
  if (amount) signature += '|' + amount;

  // Fallback: use first 5 significant words
  if (signature.length < 8) {
    var words = text.replace(/[^\w\s]/g, '').split(/\s+/).filter(function (w) {
      return w.length > 3 && ['the', 'and', 'for', 'with'].indexOf(w) === -1;
    });
    signature = words.slice(0, 5).join('+');
  }

  return {
    signature: signature,
    companies: companies,
    event: event
  };
}

// 모든 주요 회사명 추출
function extractAllCompanies(text) {
  var companyPatterns = [
    // PE Firms
    'blackstone', 'kkr', 'carlyle', 'apollo', 'tpg', 'bain capital', 'warburg',
    'mbk partners', 'mbk', 'imm investment', 'imm', 'affinity',

    // Korean companies
    'homeplus', 'musinsa', 'coupang', 'kakao', 'naver',
    'samsung', 'hyundai', 'doosan', 'hybe', 'sk ', 'lg ',

    // Tech/Global
    'netflix', 'disney', 'warner', 'spacex', 'tesla', 'uber',
    'softbank', 'alibaba', 'tencent', 'bytedance', 'baidu',
    'starbucks', 'ea ', 'electronic arts',

    // SWFs
    'pif', 'mubadala', 'adia', 'qia', 'temasek', 'gic',

    // Other notable
    'sapporo', 'steadfast', 'arctos', 'quarterra', 'lennar',
    'gds holdings', 'kunlunxin', 'torrent pharma', 'minimax'
  ];

  var found = [];
  companyPatterns.forEach(function (company) {
    if (text.indexOf(company) !== -1) {
      found.push(company);
    }
  });

  return found;
}

// 이벤트 타입 추출
function extractEventType(text) {
  if (text.indexOf('fraud') !== -1 || text.indexOf('scandal') !== -1 ||
    text.indexOf('investigation') !== -1 || text.indexOf('probe') !== -1 ||
    text.indexOf('freeze') !== -1 || text.indexOf('frozen') !== -1) return 'scandal';

  if (text.indexOf('ipo') !== -1 || text.indexOf('listing') !== -1) return 'ipo';

  if (text.indexOf('acquisition') !== -1 || text.indexOf('acquire') !== -1 ||
    text.indexOf('buyout') !== -1 || text.indexOf('merger') !== -1 ||
    text.indexOf('buy') !== -1 || text.indexOf('purchase') !== -1) return 'acquisition';

  if (text.indexOf('fundrais') !== -1 || text.indexOf('fund close') !== -1 ||
    text.indexOf('raises fund') !== -1 || text.indexOf('raises $') !== -1) return 'fundraising';

  if (text.indexOf('exit') !== -1 || text.indexOf('sell') !== -1 ||
    text.indexOf('divest') !== -1) return 'exit';

  if (text.indexOf('stake') !== -1 || text.indexOf('investment') !== -1) return 'investment';

  return 'general';
}

// 금액 추출 및 정규화
function extractAmount(text) {
  var match = text.match(/\$?\d+\.?\d*\s*(billion|million|bn|m\b|b\b)/i);
  if (!match) return null;

  var numText = match[0].toLowerCase().replace(/[\$,]/g, '');
  var num = parseFloat(numText);

  if (numText.indexOf('billion') !== -1 || numText.indexOf('bn') !== -1 || numText.match(/\d+b\b/)) {
    return Math.round(num) + 'B';
  }
  if (numText.indexOf('million') !== -1 || numText.match(/\d+m\b/)) {
    return Math.round(num) + 'M';
  }
  return null;
}

// 회사/이벤트당 최대 기사 수 제한
function enforceCompanyLimits(articles, region) {
  var companyCount = {};
  var eventCount = {};
  var result = [];

  articles.forEach(function (article) {
    var shouldKeep = true;

    // Check company limit
    article.companies.forEach(function (company) {
      var key = company + '|' + article.event;
      companyCount[key] = (companyCount[key] || 0);

      if (companyCount[key] >= Config.MAX_PER_COMPANY) {
        shouldKeep = false;
        Logger.log('  [' + region + '] Company limit - removed: "' + article.title.substring(0, 50) + '..."');
      }
    });

    // Check event limit for same signature
    var eventKey = article.signature;
    eventCount[eventKey] = (eventCount[eventKey] || 0);

    if (eventCount[eventKey] >= Config.MAX_PER_EVENT) {
      shouldKeep = false;
      Logger.log('  [' + region + '] Event limit - removed: "' + article.title.substring(0, 50) + '..."');
    }

    if (shouldKeep) {
      article.companies.forEach(function (company) {
        var key = company + '|' + article.event;
        companyCount[key] = (companyCount[key] || 0) + 1;
      });
      eventCount[eventKey]++;
      result.push(article);
    }
  });

  return result;
}

function getSourceScore(link) {
  var linkLower = link.toLowerCase();

  if (SOURCE_QUALITY.tier1.some(function (d) { return linkLower.indexOf(d) !== -1; })) return 100;
  if (SOURCE_QUALITY.tier2.some(function (d) { return linkLower.indexOf(d) !== -1; })) return 50;

  return 10;
}

// ==================== SCORING & SELECTION ====================

function selectTopArticles(articles, count, region) {
  if (articles.length === 0) return [];

  articles.forEach(function (a) {
    a.score = scoreArticle(a, region);
  });

  articles.sort(function (a, b) { return b.score - a.score; });

  return articles.slice(0, count);
}

function scoreArticle(article, region) {
  var score = 0;
  var text = (article.title + ' ' + article.description).toLowerCase();

  score += getSourceScore(article.link);
  score += (article.priority === 1) ? 30 : 15;

  if (text.match(/\$\d+(\.\d+)?\s*billion/i)) score += 40;
  else if (text.match(/\$\d+\s*million/i)) score += 15;

  var peFirms = ['kkr', 'blackstone', 'carlyle', 'apollo', 'tpg', 'bain capital', 'warburg'];
  if (peFirms.some(function (f) { return text.indexOf(f) !== -1; })) score += 25;

  if (text.indexOf('acquisition') !== -1 || text.indexOf('buyout') !== -1) score += 20;
  if (text.indexOf('ipo') !== -1) score += 20;
  if (text.indexOf('fund close') !== -1 || text.indexOf('raises fund') !== -1) score += 25;

  if (text.indexOf('scandal') !== -1 || text.indexOf('fraud') !== -1) score += 40;
  if (text.indexOf('investigation') !== -1 || text.indexOf('sanctions') !== -1) score += 35;

  var hoursAgo = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 24) score += 15;
  else if (hoursAgo < 72) score += 10;

  if (region === 'korea') {
    if (text.indexOf('mbk') !== -1 || text.indexOf('imm') !== -1) score += 30;
    if (text.indexOf('fss') !== -1 || text.indexOf('homeplus') !== -1) score += 30;
  }

  if (region === 'asia') {
    var swf = ['pif', 'mubadala', 'adia', 'qia', 'temasek', 'gic'];
    if (swf.some(function (s) { return text.indexOf(s) !== -1; })) score += 30;
  }

  return score;
}

// ==================== GPT AGGRESSIVE DEDUP ====================

function gptAggressiveDedup(articles, region, targetCount) {
  if (!Config.OPENAI_API_KEY || articles.length <= targetCount) {
    return articles.slice(0, targetCount);
  }

  try {
    var articleList = articles.map(function (a, i) {
      return i + '. ' + a.title;
    }).join('\n');

    var prompt = 'Review these ' + region + ' PE news. Find ALL DUPLICATES (same story/event/deal).\n\n' +
      'ARTICLES:\n' + articleList + '\n\n' +
      'DUPLICATE RULES:\n' +
      '- Same company + same event = DUPLICATE (e.g., 2+ MBK fraud articles = keep best 1)\n' +
      '- Same deal with different angles = DUPLICATE\n' +
      '- Same PE firm + similar target = likely DUPLICATE\n' +
      '- Be AGGRESSIVE - prioritize diversity over completeness\n\n' +
      'Return exactly ' + targetCount + ' best articles.\n' +
      'JSON: {"keep": [0,3,5...]} - indices of ' + targetCount + ' diverse, high-quality articles\n\nJSON only:';

    var response = callGPT(prompt, 1000);
    var result = parseJSON(response);

    if (!result || !result.keep || !Array.isArray(result.keep)) {
      Logger.log('  GPT dedup failed - using fallback');
      return articles.slice(0, targetCount);
    }

    var kept = result.keep.filter(function (idx) {
      return idx >= 0 && idx < articles.length;
    }).slice(0, targetCount);

    var final = kept.map(function (idx) {
      return articles[idx];
    });

    Logger.log('  GPT kept ' + final.length + '/' + articles.length + ' articles for ' + region);

    return final;

  } catch (e) {
    Logger.log('  GPT dedup error: ' + e.toString());
    return articles.slice(0, targetCount);
  }
}

// ==================== FINAL DIVERSITY CHECK ====================

function enforceDiversity(articles, region) {
  var keywordCount = {};
  var result = [];

  articles.forEach(function (article) {
    // Extract main keywords (companies + event)
    var mainKeywords = article.companies.slice(0, 2).concat([article.event]);
    var keywordSig = mainKeywords.sort().join('|');

    keywordCount[keywordSig] = (keywordCount[keywordSig] || 0);

    // Allow max 2 articles with same main keywords
    if (keywordCount[keywordSig] < 2) {
      keywordCount[keywordSig]++;
      result.push(article);
    } else {
      Logger.log('  [' + region + '] Diversity limit - removed: "' + article.title.substring(0, 50) + '..."');
    }
  });

  return result;
}

// ==================== HIGHLIGHTS ====================

function generateHighlights(regions) {
  if (!Config.OPENAI_API_KEY) return ['Configure OpenAI API key'];

  try {
    var context = '';

    if (regions.korea.length > 0) {
      context += '\n[KOREA]\n' + regions.korea.slice(0, 5).map(function (a) {
        return '• ' + a.title;
      }).join('\n');
    }

    if (regions.asiaMena.length > 0) {
      context += '\n\n[ASIA-PACIFIC & MENA]\n' + regions.asiaMena.slice(0, 5).map(function (a) {
        return '• ' + a.title;
      }).join('\n');
    }

    if (regions.us.length > 0) {
      context += '\n\n[US]\n' + regions.us.slice(0, 5).map(function (a) {
        return '• ' + a.title;
      }).join('\n');
    }

    if (regions.europe.length > 0) {
      context += '\n\n[EUROPE]\n' + regions.europe.slice(0, 4).map(function (a) {
        return '• ' + a.title;
      }).join('\n');
    }

    var prompt = 'Create 7 DIVERSE weekly highlights for PE professionals.\n\n' +
      'STORIES:' + context + '\n\n' +
      'REQUIREMENTS:\n' +
      '• Exactly 7 bullets, each 3-4 sentences\n' +
      '• NO MORE THAN 1 article per company/event\n' +
      '• Distribution: 2 Korea, 2 Asia-Pacific/MENA, 2 US, 1 Europe\n' +
      '• Start with [Region] tag\n' +
      '• Include what happened + why it matters\n' +
      '• PRIORITIZE scandals/risks if available\n' +
      '• ENSURE DIVERSITY - no repeated companies\n\n' +
      'Return JSON: {"highlights": ["[Korea] ...", "[US] ..."]}\n\nJSON only:';

    var response = callGPT(prompt, 3500);
    var result = parseJSON(response);

    if (result && result.highlights && Array.isArray(result.highlights)) {
      return result.highlights.slice(0, 7);
    }

    return fallbackHighlights(regions);

  } catch (e) {
    return fallbackHighlights(regions);
  }
}

function fallbackHighlights(regions) {
  var h = [];
  if (regions.korea.length > 0) h.push('[Korea] ' + regions.korea[0].title);
  if (regions.asiaMena.length > 0) h.push('[Asia-Pacific] ' + regions.asiaMena[0].title);
  if (regions.us.length > 0) h.push('[US] ' + regions.us[0].title);
  if (regions.europe.length > 0) h.push('[Europe] ' + regions.europe[0].title);
  return h.length > 0 ? h : ['Weekly PE roundup'];
}

// ==================== API CALLS ====================

function callGPT(prompt, maxTokens) {
  var url = 'https://api.openai.com/v1/chat/completions';

  var payload = {
    model: Config.GPT_MODEL,
    messages: [
      { role: 'system', content: 'You are a PE news curator. Respond with valid JSON only. Be AGGRESSIVE in removing duplicates.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: maxTokens
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + Config.OPENAI_API_KEY },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var json = JSON.parse(response.getContentText());

  if (json.error) throw new Error(json.error.message);
  return json.choices[0].message.content.trim();
}

function parseJSON(text) {
  if (!text) return null;
  try {
    var cleaned = text.replace(/^```(?:json)?\s*\n?/gi, '').replace(/\n?```\s*$/gi, '').trim();
    var match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}

// ==================== SLACK ====================

function formatSlackMessage(highlights, korea, asiaMena, us, europe) {
  var total = korea.length + asiaMena.length + us.length + europe.length;
  var dateRange = getDateRange();

  var blocks = [];

  blocks.push({
    type: 'header',
    text: { type: 'plain_text', text: '📈 PE Weekly Roundup | Week of ' + dateRange, emoji: true }
  });

  blocks.push({ type: 'divider' });

  blocks.push({
    type: 'header',
    text: { type: 'plain_text', text: '🎯 Weekly Highlights', emoji: true }
  });

  var highlightsText = highlights.map(function (h) { return '• ' + h; }).join('\n\n\n');
  addTextBlocks(blocks, highlightsText);

  blocks.push({ type: 'divider' });

  addSection(blocks, '🇰🇷 Korea', korea);
  blocks.push({ type: 'divider' });

  addSection(blocks, '🌏 Asia-Pacific & MENA', asiaMena);
  blocks.push({ type: 'divider' });

  addSection(blocks, '🇺🇸 United States', us);
  blocks.push({ type: 'divider' });

  addSection(blocks, '🇪🇺 Europe', europe);
  blocks.push({ type: 'divider' });

  blocks.push({
    type: 'context',
    elements: [{ type: 'mrkdwn', text: '🤖 Weekly PE News Curation Agent | ' + total + ' articles | v3.8' }]
  });

  return { blocks: blocks };
}

function addSection(blocks, title, articles) {
  blocks.push({
    type: 'header',
    text: { type: 'plain_text', text: title, emoji: true }
  });

  if (articles.length > 0) {
    var text = articles.map(function (a, i) {
      return (i + 1) + '. <' + a.link + '|' + a.title + '>';
    }).join('\n');
    addTextBlocks(blocks, text);
  } else {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: '_No articles this week_' } });
  }
}

function addTextBlocks(blocks, text) {
  if (!text) return;

  text = text.replace(/[\r\n\u2028\u2029]+/g, '\n').trim();

  if (text.length <= 2800) {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: text } });
    return;
  }

  var lines = text.split('\n');
  var chunk = '';

  lines.forEach(function (line) {
    if (chunk.length + line.length > 2800) {
      blocks.push({ type: 'section', text: { type: 'mrkdwn', text: chunk.trim() } });
      chunk = '';
    }
    chunk += line + '\n';
  });

  if (chunk) {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: chunk.trim() } });
  }
}

function getDateRange() {
  var now = new Date();
  var weekAgo = new Date(now.getTime() - Config.DAYS_BACK * 24 * 60 * 60 * 1000);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[weekAgo.getMonth()] + ' ' + weekAgo.getDate() + '-' + now.getDate() + ', ' + now.getFullYear();
}

function sendToSlack(message) {
  if (!Config.SLACK_WEBHOOK_URL) {
    Logger.log('⚠ Slack webhook not configured');
    return;
  }

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(message),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(Config.SLACK_WEBHOOK_URL, options);

  if (response.getResponseCode() !== 200) {
    throw new Error('Slack error: ' + response.getResponseCode());
  }

  Logger.log('✅ Message sent to Slack');
}

function sendErrorToSlack(error) {
  try {
    sendToSlack({
      blocks: [{
        type: 'section',
        text: { type: 'mrkdwn', text: '❌ *PE Weekly Error:* ' + error.toString() }
      }]
    });
  } catch (e) { }
}

// ==================== TEST ====================

function testWeeklyPEBrief() {
  Logger.log('=== TEST MODE ===');
  runWeeklyPEBrief();
}