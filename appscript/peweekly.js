/**
 * PE Weekly Roundup v3.6
 * - Filter gossip/dating rumors (BTS, K-pop)
 * - Filter newsletter titles
 * - More source names removed from titles
 * - Dynamic GPT-based dedup
 */

// ==================== CONFIX ====================

var CONFIX = {
  OPENAI_API_KEY: 'sk-proj-',
  PERPLEXITY_API_KEY: 'pplx',
  SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/T',

  GPT_MODEL: 'gpt-4-turbo-preview',
  PERPLEXITY_MODEL: 'sonar-pro',

  DAYS_BACK: 7,
  
  KOREA_ARTICLES: 10,
  ASIA_MENA_ARTICLES: 10,
  US_ARTICLES: 7,
  EUROPE_ARTICLES: 7,
  
  MIN_KOREA_ARTICLES: 5,
  MIN_ASIA_MENA_ARTICLES: 5,
  MIN_US_ARTICLES: 3,
  MIN_EUROPE_ARTICLES: 3
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
    'technology org', 'jakarta globe'
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
  { name: 'US Mega Deals', url: 'https://news.google.com/rss/search?q=(acquisition+OR+buyout)+billion+dollars+when:7d&hl=en-US&gl=US&ceid=US:en', region: 'us', priority: 2 }
];

// ==================== MAIN ====================

function runWeeklyPEBrief() {
  try {
    Logger.log('🚀 Starting PE Weekly Roundup v3.6...\n');
    
    // 1. Fetch all articles by region
    var regionData = fetchAllNewsByRegion();
    
    // 2. Reclassify by content (Korean entities get moved to Korea)
    regionData = reclassifyByContent(regionData);
    
    Logger.log('\n📊 After content reclassification:');
    Logger.log('   Korea: ' + regionData.korea.length);
    Logger.log('   Asia/MENA: ' + regionData.asia.length);
    Logger.log('   US: ' + regionData.us.length);
    Logger.log('   Europe: ' + regionData.europe.length);
    
    // 3. AGGRESSIVE DEDUP per region
    Logger.log('\n🔄 Aggressive deduplication...');
    regionData.korea = aggressiveDedup(regionData.korea, 'korea');
    regionData.asia = aggressiveDedup(regionData.asia, 'asia');
    regionData.us = aggressiveDedup(regionData.us, 'us');
    regionData.europe = aggressiveDedup(regionData.europe, 'europe');
    
    Logger.log('\n📊 After aggressive dedup:');
    Logger.log('   Korea: ' + regionData.korea.length);
    Logger.log('   Asia/MENA: ' + regionData.asia.length);
    Logger.log('   US: ' + regionData.us.length);
    Logger.log('   Europe: ' + regionData.europe.length);
    
    // 4. Score and select top articles
    var koreaRaw = selectTopArticles(regionData.korea, CONFIX.KOREA_ARTICLES + 5, 'korea');
    var asiaMenaRaw = selectTopArticles(regionData.asia, CONFIX.ASIA_MENA_ARTICLES + 5, 'asia');
    var usRaw = selectTopArticles(regionData.us, CONFIX.US_ARTICLES + 5, 'us');
    var europeRaw = selectTopArticles(regionData.europe, CONFIX.EUROPE_ARTICLES + 5, 'europe');
    
    // 5. GPT-based final dedup (catches semantic duplicates)
    Logger.log('\n🤖 GPT-based final deduplication...');
    var korea = gptFinalDedup(koreaRaw, 'Korea', CONFIX.KOREA_ARTICLES);
    var asiaMena = gptFinalDedup(asiaMenaRaw, 'Asia/MENA', CONFIX.ASIA_MENA_ARTICLES);
    var us = gptFinalDedup(usRaw, 'US', CONFIX.US_ARTICLES);
    var europe = gptFinalDedup(europeRaw, 'Europe', CONFIX.EUROPE_ARTICLES);
    
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

// Non-PE topics to filter out
var NON_PE_TOPICS = [
  // Government/Politics
  'government budget', 'cabinet approves budget', 'defence budget', 'defense budget',
  'military budget', 'approves budget', 'budget with',
  'arms cooperation', 'military cooperation', 'diplomatic',
  'election', 'votes', 'parliament',
  
  // Philanthropy
  'billion gift', 'billion donation', 'philanthropic', 'philanthropy',
  
  // Industry stats (not deals)
  'industry turnover', 'industry body', 'aerospace turnover',
  
  // Gossip/Entertainment news (NOT PE related)
  'dating rumor', 'dating rumors', 'dating scandal',
  'relationship rumor', 'romance rumor',
  'breakup', 'divorce', 'wedding', 'married',
  'jungkook', 'bts ', ' bts', 'aespa', 'blackpink', 'k-pop', 'kpop',
  
  // Generic newsletters/roundups
  'daily news,', 'weekly news,', 'news roundup', 'news digest',
  'morning brief', 'evening brief', 'daily brief',
  
  // Weather/Disasters
  'weather', 'earthquake', 'hurricane', 'flood', 'typhoon'
];

// Bad title patterns - filter these out entirely
var BAD_TITLE_PATTERNS = [
  /daily news.*\d{4}/i,           // "Daily News, 05 December 2025"
  /weekly news.*\d{4}/i,
  /news digest/i,
  /dating rumor/i,
  /relationship with/i,
  /^\s*\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i  // Date-only titles
];

function fetchAllNewsByRegion() {
  var data = { korea: [], asia: [], us: [], europe: [] };
  var cutoff = new Date(Date.now() - CONFIX.DAYS_BACK * 24 * 60 * 60 * 1000);
  
  NEWS_SOURCES.forEach(function(source) {
    try {
      Logger.log('Fetching: ' + source.name + '...');
      var articles = fetchRSS(source.url);
      
      // Filter by date
      articles = articles.filter(function(a) {
        return new Date(a.publishedAt) > cutoff;
      });
      
      // Filter blacklist sources
      articles = articles.filter(function(a) {
        var linkLower = a.link.toLowerCase();
        return !SOURCE_QUALITY.blacklist.some(function(bad) {
          return linkLower.indexOf(bad) !== -1;
        });
      });
      
      // Filter non-PE topics
      articles = articles.filter(function(a) {
        var textLower = (a.title + ' ' + a.description).toLowerCase();
        
        // Check non-PE topics
        var hasNonPETopic = NON_PE_TOPICS.some(function(topic) {
          return textLower.indexOf(topic) !== -1;
        });
        if (hasNonPETopic) return false;
        
        // Check bad title patterns
        var hasBadPattern = BAD_TITLE_PATTERNS.some(function(pattern) {
          return pattern.test(a.title);
        });
        if (hasBadPattern) return false;
        
        return true;
      });
      
      // Clean and tag
      articles.forEach(function(a) {
        a.title = cleanTitle(a.title);
        a.priority = source.priority;
        a.sourceRegion = source.region;
      });
      
      // Add to region bucket
      data[source.region] = data[source.region].concat(articles);
      Logger.log('  → ' + articles.length + ' articles');
      
    } catch (e) {
      Logger.log('  ✗ Error: ' + e.toString());
    }
  });
  
  return data;
}

// Bad/incomplete titles to filter out
var BAD_TITLES = [
  'exclusive', 'breaking', 'update', 'news', 'article', 'untitled',
  'read more', 'click here', 'subscribe', 'sign up', 'watch',
  'live updates', 'developing', 'just in', 'alert'
];

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
    items.forEach(function(item) {
      try {
        var title = item.getChild('title') ? item.getChild('title').getText() : '';
        var link = item.getChild('link') ? item.getChild('link').getText() : '';
        var pubDate = item.getChild('pubDate') ? item.getChild('pubDate').getText() : '';
        var desc = item.getChild('description') ? item.getChild('description').getText() : '';
        
        // Clean title first
        title = cleanTitle(title);
        
        // Skip if title is too short or invalid
        if (!isValidTitle(title)) return;
        if (!link) return;
        
        articles.push({
          title: title,
          link: link,
          description: desc.replace(/<[^>]*>/g, '').substring(0, 200),
          publishedAt: pubDate ? new Date(pubDate) : new Date(),
          score: 0
        });
      } catch (e) {}
    });
    
    return articles;
  } catch (e) {
    return [];
  }
}

function isValidTitle(title) {
  if (!title) return false;
  
  // Must be at least 25 characters
  if (title.length < 25) return false;
  
  // Must have at least 4 words
  var words = title.split(/\s+/).filter(function(w) { return w.length > 0; });
  if (words.length < 4) return false;
  
  // Check against bad titles
  var titleLower = title.toLowerCase().trim();
  if (BAD_TITLES.indexOf(titleLower) !== -1) return false;
  
  // Check if title starts with bad word only
  var firstWord = titleLower.split(/\s+/)[0];
  if (BAD_TITLES.indexOf(firstWord) !== -1 && words.length < 5) return false;
  
  return true;
}

// ==================== TITLE CLEANING ====================

function cleanTitle(title) {
  if (!title) return '';
  
  // Remove HTML
  title = title.replace(/<[^>]*>/g, '');
  
  // List of known source names to remove (be specific, not generic patterns)
  var sourcesToRemove = [
    // Major wire services & newspapers
    'Bloomberg', 'Reuters', 'WSJ', 'Wall Street Journal', 'FT', 'Financial Times',
    'NYT', 'New York Times', 'CNBC', 'Forbes', 'TechCrunch', 'Yahoo', 'AP', 'AFP',
    'The Wall Street Journal', 'The New York Times', 'The Financial Times',
    
    // PE-specific
    'PitchBook', 'PE Hub', 'Private Equity International', 'Business Wire', 'PR Newswire',
    'FinSMEs', 'Pensions & Investments', 'Pensions and Investments',
    
    // Korean media
    '조선일보', '조선비즈', 'CHOSUNBIZ', 'Chosunbiz', '중앙일보', 'JoongAng',
    '한경', 'Hankyung', '매일경제', 'MK', 'Korea Times', 'Korea Herald', 
    'KED Global', 'Yonhap', '연합뉴스', '알파경제',
    
    // Asian media
    'The Australian', 'Nikkei', 'Nikkei Asia', 'DealStreetAsia',
    'South China Morning Post', 'SCMP', 'The Hindu', 'Mint',
    'Economic Times', 'Moneycontrol', 'Business Standard',
    'Saudi Gazette', 'Arab News', 'Gulf News', 'Asharq Al-Awsat',
    
    // Misc sources that keep appearing
    'TradingView', 'TweakTown', 'Bitget', 'Soap Central', 'MSN',
    'FashionNetwork USA', 'FashionNetwork', 'Media Play News',
    'Crude Oil Prices Today', 'OilPrice.com', 'OilPrice',
    'HuffPost UK', 'HuffPost', 'Citywire', 'bloomingbit',
    'Jakarta Globe', 'Technology Org',
    
    // Law firms
    'Herbert Smith Freehills', 'Latham & Watkins', 'Latham & Watkins LLP',
    'Mayer Brown', 'Kirkland & Ellis', 'Simpson Thacher',
    'Skadden', 'Sullivan & Cromwell', 'Davis Polk',
    
    // Other
    'Financial News London', 'Financial News', 'businesscloud.co.uk',
    'businesscloud', 'The TRADE'
  ];
  
  // Remove " - Source" or " | Source" patterns only for known sources
  sourcesToRemove.forEach(function(source) {
    var patterns = [
      new RegExp('\\s*[-–—]\\s*' + escapeRegex(source) + '\\s*$', 'gi'),
      new RegExp('\\s*\\|\\s*' + escapeRegex(source) + '\\s*$', 'gi'),
      new RegExp('\\s*[-–—]\\s*' + escapeRegex(source) + '\\s*[-–—].*$', 'gi')
    ];
    patterns.forEach(function(p) {
      title = title.replace(p, '');
    });
  });
  
  // Remove domain patterns at end: " - example.com" or " - site.co.uk"
  title = title.replace(/\s*[-–—]\s*[a-z0-9]+\.[a-z]{2,}(\.[a-z]{2,})?\s*$/gi, '');
  
  // Remove "United States - " or "Country - " prefix from title
  title = title.replace(/^(United States|UK|Europe|Asia|Africa|Middle East)\s*[-–—]\s*/gi, '');
  
  return title.replace(/\s+/g, ' ').trim();
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ==================== CONTENT RECLASSIFICATION ====================

function reclassifyByContent(data) {
  var result = { korea: [], asia: [], us: [], europe: [] };
  
  // Combine all articles
  var all = data.korea.concat(data.asia).concat(data.us).concat(data.europe);
  
  all.forEach(function(article) {
    var text = (article.title + ' ' + article.description).toLowerCase();
    
    // Korean content check - highest priority
    var isKorean = KOREAN_ENTITIES.some(function(entity) {
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
  var keywords = [
    // Asia-Pacific
    'japan', 'japanese', 'tokyo', 'softbank', 'nikkei',
    'australia', 'australian', 'sydney', 'melbourne',
    'singapore', 'vietnam', 'thailand', 'indonesia', 'malaysia', 'philippines',
    'india', 'indian', 'mumbai', 'adani',
    'china', 'chinese', 'shanghai', 'hong kong', 'beijing',
    'taiwan', 'taipei',
    // MENA
    'uae', 'dubai', 'abu dhabi', 'saudi', 'qatar', 'gcc',
    'pif', 'mubadala', 'adia', 'qia', 'temasek', 'gic',
    'israel', 'israeli', 'tel aviv',
    'egypt', 'egyptian', 'cairo',
    'bahrain', 'kuwait', 'oman',
    // Africa (include in Asia/MENA bucket for now)
    'kenya', 'kenyan', 'nairobi', 'safaricom',
    'south africa', 'johannesburg', 'nigeria', 'lagos',
    'africa', 'african'
  ];
  return keywords.some(function(kw) { return text.indexOf(kw) !== -1; });
}

function isEuropeContent(text) {
  var keywords = [
    'europe', 'european', 'eu ',
    'uk', 'britain', 'british', 'london',
    'france', 'french', 'paris',
    'germany', 'german', 'berlin', 'frankfurt',
    'spain', 'italy', 'netherlands', 'sweden', 'switzerland'
  ];
  return keywords.some(function(kw) { return text.indexOf(kw) !== -1; });
}

// ==================== AGGRESSIVE DEDUPLICATION ====================

function aggressiveDedup(articles, region) {
  if (articles.length === 0) return [];
  
  // Step 1: Extract key signature for each article
  articles.forEach(function(a) {
    a.signature = extractSignature(a.title);
  });
  
  // Step 2: Group by signature
  var groups = {};
  articles.forEach(function(a) {
    var sig = a.signature;
    if (!groups[sig]) {
      groups[sig] = [];
    }
    groups[sig].push(a);
  });
  
  // Step 3: Keep only the best from each group
  var unique = [];
  var keptSignatures = [];
  
  for (var sig in groups) {
    var group = groups[sig];
    
    // Sort by source quality
    group.sort(function(a, b) {
      return getSourceScore(b.link) - getSourceScore(a.link);
    });
    
    // Keep the best one
    unique.push(group[0]);
    keptSignatures.push(sig);
    
    if (group.length > 1) {
      Logger.log('  [' + region + '] Merged ' + group.length + ' articles: "' + sig + '"');
    }
  }
  
  // Step 4: Additional fuzzy dedup - same company + same topic
  unique = fuzzyDedup(unique);
  
  return unique;
}

function extractSignature(title) {
  var text = title.toLowerCase();
  
  // Extract key elements
  var companies = [];
  var amounts = [];
  var actions = [];
  
  // Find company names
  var companyPatterns = [
    'netflix', 'warner', 'disney', 'spacex', 'tesla', 'uber', 'airbnb',
    'blackstone', 'kkr', 'carlyle', 'apollo', 'tpg', 'bain',
    'mbk', 'imm', 'homeplus', 'musinsa', 'coupang', 'kakao', 'naver',
    'samsung', 'hyundai', 'doosan', 'hybe', 'dunamu', 'upbit',
    'softbank', 'alibaba', 'tencent', 'bytedance',
    'mubadala', 'pif', 'adia', 'qia', 'temasek', 'gic',
    'fss', 'ecorbit', 'chindata', 'steadfast', 'golden goose',
    'starbucks', 'baidu', 'jd.com', 'ripple'
  ];
  
  companyPatterns.forEach(function(c) {
    if (text.indexOf(c) !== -1) companies.push(c);
  });
  
  // Find amounts (normalize)
  var amountMatch = text.match(/\$?\d+\.?\d*\s*(billion|million|bn|m\b|b\b)/i);
  if (amountMatch) {
    amounts.push(normalizeAmount(amountMatch[0]));
  }
  
  // Find actions
  var actionPatterns = [
    'acquisition', 'acquire', 'buyout', 'merger', 'merge',
    'ipo', 'listing', 'fundrais', 'fund close', 'raises fund',
    'sanctions', 'fraud', 'investigation', 'probe', 'scandal',
    'exit', 'sell', 'divest', 'stake'
  ];
  
  actionPatterns.forEach(function(a) {
    if (text.indexOf(a) !== -1) actions.push(a.substring(0, 5)); // Truncate for matching
  });
  
  // Create signature
  var sig = companies.sort().join('+');
  if (amounts.length > 0) sig += '|' + amounts[0];
  if (actions.length > 0) sig += '|' + actions.sort().slice(0, 2).join('+');
  
  // Fallback: first 5 significant words
  if (sig.length < 5) {
    var words = text.replace(/[^\w\s]/g, '').split(/\s+/).filter(function(w) {
      return w.length > 3 && ['the', 'and', 'for', 'with', 'from', 'that', 'this'].indexOf(w) === -1;
    });
    sig = words.slice(0, 5).join('+');
  }
  
  return sig;
}

function normalizeAmount(amountStr) {
  var text = amountStr.toLowerCase().replace(/[\$,]/g, '');
  var num = parseFloat(text);
  
  if (text.indexOf('billion') !== -1 || text.indexOf('bn') !== -1 || text.match(/\d+b\b/)) {
    return Math.round(num) + 'B';
  }
  if (text.indexOf('million') !== -1 || text.match(/\d+m\b/)) {
    return Math.round(num) + 'M';
  }
  return text;
}

function fuzzyDedup(articles) {
  var result = [];
  var usedCompanies = {};
  
  articles.forEach(function(article) {
    var text = article.title.toLowerCase();
    
    // Extract main company
    var mainCompany = extractMainCompany(text);
    
    // Extract topic type
    var topic = extractTopic(text);
    
    var key = mainCompany + '|' + topic;
    
    if (!mainCompany || !usedCompanies[key]) {
      result.push(article);
      if (mainCompany) {
        usedCompanies[key] = true;
      }
    } else {
      Logger.log('  Fuzzy dedup removed: "' + article.title.substring(0, 50) + '..."');
    }
  });
  
  return result;
}

function extractMainCompany(text) {
  // Only keep truly stable groupings (parent-subsidiary relationships)
  var stableGroups = [
    ['netflix', 'warner', 'discovery'],  // This specific deal
    ['blackstone', 'steadfast'],  // This specific deal
    ['doosan', 'bobcat', 'wacker'],  // This specific deal
    ['starbucks', 'boyu'],  // This specific deal
    ['ripple', 'gtreasury']  // This specific deal
  ];
  
  for (var i = 0; i < stableGroups.length; i++) {
    var group = stableGroups[i];
    for (var j = 0; j < group.length; j++) {
      if (text.indexOf(group[j]) !== -1) {
        return group[0];
      }
    }
  }
  
  // For everything else, return null - let GPT handle complex dedup
  return null;
}

// GPT-based final deduplication for selected articles
function gptFinalDedup(articles, region, targetCount) {
  if (!CONFIX.OPENAI_API_KEY || articles.length <= targetCount) {
    return articles.slice(0, targetCount);
  }
  
  try {
    var articleList = articles.slice(0, Math.min(articles.length, targetCount + 5)).map(function(a, i) {
      return i + '. ' + a.title;
    }).join('\n');
    
    var prompt = 'Review these ' + region + ' PE news articles. Find DUPLICATE STORIES (same event/deal reported differently).\n\n' +
                 'ARTICLES:\n' + articleList + '\n\n' +
                 'DUPLICATE EXAMPLES:\n' +
                 '- Same company doing same thing (e.g., "Court freezes X shares" and "Asset freeze on X chairman" = SAME)\n' +
                 '- Same deal with different details (e.g., "$72B acquisition" and "$83B acquisition" of same companies = SAME)\n' +
                 '- Same person/company in related headlines = likely SAME event\n\n' +
                 'Return JSON: {"duplicates": [[0,3], [2,5]], "keep": [0,2]} where each array in duplicates contains indices of same story, keep indicates which to keep.\n' +
                 'If no duplicates: {"duplicates": [], "keep": []}\n\nJSON only:';
    
    var response = callGPT(prompt, 500);
    var result = parseJSON(response);
    
    if (!result || !result.duplicates || result.duplicates.length === 0) {
      return articles.slice(0, targetCount);
    }
    
    // Build set of indices to remove
    var toRemove = new Set();
    result.duplicates.forEach(function(group, groupIdx) {
      var keepIdx = result.keep && result.keep[groupIdx] !== undefined ? result.keep[groupIdx] : group[0];
      group.forEach(function(idx) {
        if (idx !== keepIdx && idx >= 0 && idx < articles.length) {
          toRemove.add(idx);
          Logger.log('  GPT dedup removed [' + region + ']: "' + articles[idx].title.substring(0, 50) + '..."');
        }
      });
    });
    
    var filtered = articles.filter(function(_, idx) {
      return !toRemove.has(idx);
    });
    
    return filtered.slice(0, targetCount);
    
  } catch (e) {
    Logger.log('  GPT dedup error: ' + e.toString());
    return articles.slice(0, targetCount);
  }
}

function extractTopic(text) {
  if (text.indexOf('ipo') !== -1 || text.indexOf('listing') !== -1) return 'ipo';
  if (text.indexOf('acqui') !== -1 || text.indexOf('buyout') !== -1 || text.indexOf('merger') !== -1 || text.indexOf('buy') !== -1) return 'acquisition';
  if (text.indexOf('sanction') !== -1 || text.indexOf('fraud') !== -1 || text.indexOf('investigation') !== -1 || text.indexOf('probe') !== -1 || text.indexOf('freeze') !== -1 || text.indexOf('frozen') !== -1) return 'scandal';
  if (text.indexOf('fund') !== -1 || text.indexOf('raises') !== -1) return 'fundraising';
  if (text.indexOf('exit') !== -1 || text.indexOf('sell') !== -1) return 'exit';
  return 'general';
}

function getSourceScore(link) {
  var linkLower = link.toLowerCase();
  
  var tier1Score = SOURCE_QUALITY.tier1.some(function(d) {
    return linkLower.indexOf(d) !== -1;
  });
  if (tier1Score) return 100;
  
  var tier2Score = SOURCE_QUALITY.tier2.some(function(d) {
    return linkLower.indexOf(d) !== -1;
  });
  if (tier2Score) return 50;
  
  return 10;
}

// ==================== SCORING & SELECTION ====================

function selectTopArticles(articles, count, region) {
  if (articles.length === 0) return [];
  
  // Score articles
  articles.forEach(function(a) {
    a.score = scoreArticle(a, region);
  });
  
  // Sort by score
  articles.sort(function(a, b) { return b.score - a.score; });
  
  // Take top N
  return articles.slice(0, count);
}

function scoreArticle(article, region) {
  var score = 0;
  var text = (article.title + ' ' + article.description).toLowerCase();
  
  // Source quality
  score += getSourceScore(article.link);
  
  // Priority
  score += (article.priority === 1) ? 30 : 15;
  
  // Deal size
  if (text.match(/\$\d+(\.\d+)?\s*billion/i)) score += 40;
  else if (text.match(/\$\d+\s*million/i)) score += 15;
  
  // PE firms
  var peFirms = ['kkr', 'blackstone', 'carlyle', 'apollo', 'tpg', 'bain capital', 'warburg'];
  if (peFirms.some(function(f) { return text.indexOf(f) !== -1; })) score += 25;
  
  // Deal types
  if (text.indexOf('acquisition') !== -1 || text.indexOf('buyout') !== -1) score += 20;
  if (text.indexOf('ipo') !== -1) score += 20;
  if (text.indexOf('fund close') !== -1 || text.indexOf('raises fund') !== -1) score += 25;
  
  // Scandal/risk (high priority)
  if (text.indexOf('scandal') !== -1 || text.indexOf('fraud') !== -1) score += 40;
  if (text.indexOf('investigation') !== -1 || text.indexOf('sanctions') !== -1) score += 35;
  
  // Recency
  var hoursAgo = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 24) score += 15;
  else if (hoursAgo < 72) score += 10;
  
  // Region-specific
  if (region === 'korea') {
    if (text.indexOf('mbk') !== -1 || text.indexOf('imm') !== -1) score += 30;
    if (text.indexOf('fss') !== -1 || text.indexOf('homeplus') !== -1) score += 30;
  }
  
  if (region === 'asia') {
    var swf = ['pif', 'mubadala', 'adia', 'qia', 'temasek', 'gic'];
    if (swf.some(function(s) { return text.indexOf(s) !== -1; })) score += 30;
  }
  
  return score;
}

// ==================== HIGHLIGHTS ====================

function generateHighlights(regions) {
  if (!CONFIX.OPENAI_API_KEY) return ['CONFIXure OpenAI API key'];
  
  try {
    var context = '';
    
    if (regions.korea.length > 0) {
      context += '\n[KOREA]\n' + regions.korea.slice(0, 5).map(function(a) {
        return '• ' + a.title;
      }).join('\n');
    }
    
    if (regions.asiaMena.length > 0) {
      context += '\n\n[ASIA-PACIFIC & MENA]\n' + regions.asiaMena.slice(0, 5).map(function(a) {
        return '• ' + a.title;
      }).join('\n');
    }
    
    if (regions.us.length > 0) {
      context += '\n\n[US]\n' + regions.us.slice(0, 5).map(function(a) {
        return '• ' + a.title;
      }).join('\n');
    }
    
    if (regions.europe.length > 0) {
      context += '\n\n[EUROPE]\n' + regions.europe.slice(0, 4).map(function(a) {
        return '• ' + a.title;
      }).join('\n');
    }
    
    var prompt = 'Create 5-6 weekly highlights for PE professionals.\n\n' +
                 'STORIES:' + context + '\n\n' +
                 'REQUIREMENTS:\n' +
                 '• 5-6 bullets, each 3-4 sentences\n' +
                 '• Distribution: 1-2 Korea, 1-2 Asia-Pacific/MENA, 2 US, 1 Europe\n' +
                 '• Start with [Region] tag\n' +
                 '• Include what happened + why it matters\n' +
                 '• PRIORITIZE scandals/risks\n\n' +
                 'Return JSON: {"highlights": ["[Korea] ...", "[US] ..."]}\n\nJSON only:';
    
    var response = callGPT(prompt, 2500);
    var result = parseJSON(response);
    
    if (result && result.highlights && Array.isArray(result.highlights)) {
      return result.highlights;
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
    model: CONFIX.GPT_MODEL,
    messages: [
      { role: 'system', content: 'Respond with valid JSON only.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    max_tokens: maxTokens
  };
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + CONFIX.OPENAI_API_KEY },
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
  
  // Highlights
  blocks.push({
    type: 'header',
    text: { type: 'plain_text', text: '🎯 Weekly Highlights', emoji: true }
  });
  
  var highlightsText = highlights.map(function(h) { return '• ' + h; }).join('\n\n');
  addTextBlocks(blocks, highlightsText);
  
  blocks.push({ type: 'divider' });
  
  // Korea
  addSection(blocks, '🇰🇷 Korea', korea);
  blocks.push({ type: 'divider' });
  
  // Asia-Pacific & MENA
  addSection(blocks, '🌏 Asia-Pacific & MENA', asiaMena);
  blocks.push({ type: 'divider' });
  
  // US
  addSection(blocks, '🇺🇸 United States', us);
  blocks.push({ type: 'divider' });
  
  // Europe
  addSection(blocks, '🇪🇺 Europe', europe);
  blocks.push({ type: 'divider' });
  
  blocks.push({
    type: 'context',
    elements: [{ type: 'mrkdwn', text: '🤖 AI-Curated PE Intelligence | ' + total + ' articles | v3.6' }]
  });
  
  return { blocks: blocks };
}

function addSection(blocks, title, articles) {
  blocks.push({
    type: 'header',
    text: { type: 'plain_text', text: title, emoji: true }
  });
  
  if (articles.length > 0) {
    var text = articles.map(function(a, i) {
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
  
  lines.forEach(function(line) {
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
  var weekAgo = new Date(now.getTime() - CONFIX.DAYS_BACK * 24 * 60 * 60 * 1000);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[weekAgo.getMonth()] + ' ' + weekAgo.getDate() + '-' + now.getDate() + ', ' + now.getFullYear();
}

function sendToSlack(message) {
  if (!CONFIX.SLACK_WEBHOOK_URL) {
    Logger.log('⚠ Slack webhook not CONFIXured');
    return;
  }
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(message),
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(CONFIX.SLACK_WEBHOOK_URL, options);
  
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
  } catch (e) {}
}

// ==================== TEST ====================

function testWeeklyPEBrief() {
  Logger.log('=== TEST MODE ===');
  runWeeklyPEBrief();
}
