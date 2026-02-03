/**
 * Global Headlines Summary - Version 11.0
 * Robust Insights, Diverse Macro Topics, and Credibility Filters
 */

// ==================== CONFIGURATION (Same) ====================

const CONFIG = {
  OPENAI_API_KEY: typeof SECRETS !== 'undefined' ? SECRETS.OPENAI_API_KEY : 'sk-your-openai-api-key-here',
  PERPLEXITY_API_KEY: typeof SECRETS !== 'undefined' ? SECRETS.PERPLEXITY_API_KEY : 'pplx-your-perplexity-api-key-here',
  SLACK_WEBHOOK_URL: typeof SECRETS !== 'undefined' ? SECRETS.SLACK_WEBHOOK_URL_NEWS : 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',

  GPT_MODEL: 'gpt-4-turbo-preview',
  PERPLEXITY_MODEL: 'sonar-pro',
  
  NEWS_HOURS_BACK: 24,
  MAX_ARTICLES_PER_SOURCE: 15,
  
  REQUIRED_INTL_ARTICLES: 10,
  REQUIRED_KOREA_ARTICLES: 10,
  REQUIRED_MIN_INSIGHTS: 5,
  REQUIRED_MAX_INSIGHTS: 7,
  
  STAGE1_CANDIDATES: 60,
  STAGE2_PERPLEXITY: 25,
  STAGE3_FINAL: 10,
  
  SIMILARITY_THRESHOLD: 0.45,
  INSIGHT_SIMILARITY_THRESHOLD: 0.35,
  MIN_SOURCE_DIVERSITY: 6,
  
  MARKET_SYMBOLS: {
    US_STOCKS: ['^GSPC', '^DJI', '^IXIC'],
    KOREA_STOCKS: ['^KS11', '^KQ11'],
    COMMODITIES: ['GC=F', 'SI=F', 'CL=F', 'BTC-USD'],
    FX_RATES: ['KRW=X', 'EURKRW=X', 'JPYKRW=X']
  }
};

// ==================== NEWS SOURCES (Same as v10.8) ====================
// [All NEWS_SOURCEX same as before]

const NEWS_SOURCEX = [
  {name: 'WSJ - World', url: 'https://feeds.content.dowjones.io/public/rss/RSSWorldNews', section: 'intl', tier: 1},
  {name: 'WSJ - Markets', url: 'https://feeds.content.dowjones.io/public/rss/RSSMarketsMain', section: 'intl', tier: 1},
  {name: 'WSJ - Business', url: 'https://feeds.content.dowjones.io/public/rss/RSSBusiness', section: 'intl', tier: 1},
  {name: 'FT - World', url: 'https://www.ft.com/world?format=rss', section: 'intl', tier: 1},
  {name: 'FT - Companies', url: 'https://www.ft.com/companies?format=rss', section: 'intl', tier: 1},
  {name: 'NYT - Business', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', section: 'intl', tier: 1},
  {name: 'NYT - World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', section: 'intl', tier: 1},
  {name: 'Bloomberg', url: 'https://news.google.com/rss/search?q=site:bloomberg.com+business+OR+economy+when:24h&hl=en-US&gl=US&ceid=US:en', section: 'intl', tier: 1},
  {name: 'Reuters Business', url: 'https://news.google.com/rss/search?q=site:reuters.com+business+OR+economy+when:24h&hl=en-US&gl=US&ceid=US:en', section: 'intl', tier: 1},
  {name: 'Economist', url: 'https://news.google.com/rss/search?q=site:economist.com+economy+OR+policy+when:24h&hl=en-US&gl=US&ceid=US:en', section: 'intl', tier: 1},
  {name: 'Reuters Breaking', url: 'https://news.google.com/rss/search?q=site:reuters.com+breaking+OR+urgent+when:24h&hl=en-US&gl=US&ceid=US:en', section: 'intl', tier: 1},
  {name: 'AP Breaking', url: 'https://news.google.com/rss/search?q=site:apnews.com+breaking+OR+urgent+when:24h&hl=en-US&gl=US&ceid=US:en', section: 'intl', tier: 1},
  {name: 'Major Disasters', url: 'https://news.google.com/rss/search?q=disaster+OR+emergency+OR+crisis+when:24h&hl=en-US&gl=US&ceid=US:en', section: 'intl', tier: 1},
  {name: 'BBC Business', url: 'http://feeds.bbci.co.uk/news/business/rss.xml', section: 'intl', tier: 2},
  {name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', section: 'intl', tier: 2},
  {name: 'Guardian Business', url: 'https://www.theguardian.com/uk/business/rss', section: 'intl', tier: 2},
  {name: 'WaPo Business', url: 'https://feeds.washingtonpost.com/rss/business', section: 'intl', tier: 2},
  
  {name: '조선일보 경제', url: 'https://www.chosun.com/arc/outboundfeeds/rss/category/economy/?outputType=xml', section: 'korea', tier: 1},
  {name: '조선일보 산업', url: 'https://news.google.com/rss/search?q=site:chosun.com+산업+when:24h&hl=ko&gl=KR&ceid=KR:ko', section: 'korea', tier: 1},
  {name: '중앙일보 경제', url: 'https://news.google.com/rss/search?q=site:joongang.co.kr+경제+when:24h&hl=ko&gl=KR&ceid=KR:ko', section: 'korea', tier: 1},
  {name: '동아일보 경제', url: 'https://rss.donga.com/economy.xml', section: 'korea', tier: 1},
  {name: '한국경제', url: 'https://news.google.com/rss/search?q=site:hankyung.com+경제+when:24h&hl=ko&gl=KR&ceid=KR:ko', section: 'korea', tier: 1},
  {name: '매일경제', url: 'https://www.mk.co.kr/rss/30100041/', section: 'korea', tier: 1},
  {name: '매일경제 증권', url: 'https://www.mk.co.kr/rss/50200011/', section: 'korea', tier: 1},
  {name: '서울경제', url: 'https://news.google.com/rss/search?q=site:sedaily.com+경제+when:24h&hl=ko&gl=KR&ceid=KR:ko', section: 'korea', tier: 1},
  {name: '머니투데이', url: 'https://news.google.com/rss/search?q=site:mt.co.kr+경제+when:24h&hl=ko&gl=KR&ceid=KR:ko', section: 'korea', tier: 1},
  {name: '전자신문', url: 'https://news.google.com/rss/search?q=site:etnews.com+when:24h&hl=ko&gl=KR&ceid=KR:ko', section: 'korea', tier: 1},
  {name: '연합뉴스 경제', url: 'https://news.google.com/rss/search?q=site:yna.co.kr+경제+when:24h&hl=ko&gl=KR&ceid=KR:ko', section: 'korea', tier: 1},
  {name: '이데일리', url: 'https://news.google.com/rss/search?q=site:edaily.co.kr+경제+when:24h&hl=ko&gl=KR&ceid=KR:ko', section: 'korea', tier: 1},
  {name: '경향신문 경제', url: 'https://news.google.com/rss/search?q=site:khan.co.kr+경제+when:24h&hl=ko&gl=KR&ceid=KR:ko', section: 'korea', tier: 2},
  {name: '한겨레 경제', url: 'https://news.google.com/rss/search?q=site:hani.co.kr+경제+when:24h&hl=ko&gl=KR&ceid=KR:ko', section: 'korea', tier: 2},
  {name: '한국일보 경제', url: 'https://news.google.com/rss/search?q=site:hankookilbo.com+경제+when:24h&hl=ko&gl=KR&ceid=KR:ko', section: 'korea', tier: 2},
  {name: 'Korea Breaking', url: 'https://news.google.com/rss/search?q=korea+속보+OR+긴급+when:24h&hl=ko&gl=KR&ceid=KR:ko', section: 'korea', tier: 1},
  {name: 'Korea Times', url: 'https://news.google.com/rss/search?q=korea+business+OR+samsung+OR+hyundai+when:24h&hl=en-US&gl=US&ceid=US:en', section: 'korea', tier: 2}
];

// ==================== MAIN FUNCTION ====================

// Alias functions to match the README
function sendDailyNewsSummary() {
  v110_sendDailyNewsSummary();
}

function v110_sendDailyNewsSummary() {
  try {
    Logger.log('🚀 v11.0 - Robust & Diverse Insights\n');

    const allArticles = v110_fetchAllNews();
    Logger.log(`\n📰 Collected: ${allArticles.length} articles`);
    
    v110_validate24HourWindow(allArticles);

    const intlArticles = v110_processWithGuarantee(
      allArticles.filter(a => a.section === 'intl'),
      CONFIG.REQUIRED_INTL_ARTICLES,
      'intl'
    );
    Logger.log(`\n✅ International: ${intlArticles.length}/${CONFIG.REQUIRED_INTL_ARTICLES}`);
    v110_logSourceDistribution(intlArticles, 'International');

    const intlTopics = v110_extractTopics(intlArticles);
    Logger.log(`   → International topics: ${intlTopics.join(', ')}`);

    const koreaArticles = v110_processWithGuarantee(
      allArticles.filter(a => a.section === 'korea'),
      CONFIG.REQUIRED_KOREA_ARTICLES,
      'korea',
      intlTopics
    );
    Logger.log(`\n✅ Korea: ${koreaArticles.length}/${CONFIG.REQUIRED_KOREA_ARTICLES}`);
    v110_logSourceDistribution(koreaArticles, 'Korea');

    const marketData = v110_fetchMarketData();
    Logger.log('\n📊 Market data fetched');

    const aiSummary = v110_generateExecutiveInsights(intlArticles, koreaArticles, marketData);
    Logger.log(`\n🤖 Insights: ${aiSummary.insights.length}/${CONFIG.REQUIRED_MIN_INSIGHTS}-${CONFIG.REQUIRED_MAX_INSIGHTS}`);

    const message = v110_formatSlackMessage(aiSummary, intlArticles, koreaArticles, marketData);
    v110_sendToSlack(message);

    Logger.log('\n✅ SUCCESS! Diverse & Robust insights.');

  } catch (error) {
    Logger.log('\n❌ ERROR: ' + error.toString());
    v110_sendErrorToSlack(error);
  }
}

// ==================== ALL HELPER FUNCTIONS (Same as v10.8) ====================
// [Copy all from v10.8: extractTopics, validate24HourWindow, logSourceDistribution, 
//  removeDuplicatesAggressive, calculateEnhancedSimilarity, ensureSourceDiversity,
//  processWithGuarantee, headlineScore, callPerplexity, callGPT, perplexityAnalysis,
//  gptFinalCuration, fetchAllNews, fetchRSS, getText, extractSource, cleanTitle,
//  cleanDesc, parseDate, deepClean, fetchMarketData, etc.]

// I'll include the key changed functions below:

// ==================== EXECUTIVE INSIGHTS (IMPROVED PROMPT) ====================

function v110_generateExecutiveInsights(intlArticles, koreaArticles, marketData) {
  if (!CONFIG.OPENAI_API_KEY) return { insights: ["API 키가 설정되지 않았습니다."] };

  if (!intlArticles || !Array.isArray(intlArticles)) intlArticles = [];
  if (!koreaArticles || !Array.isArray(koreaArticles)) koreaArticles = [];
  
  if (intlArticles.length === 0 && koreaArticles.length === 0) {
    return { insights: ["분석할 기사가 없습니다. 뉴스 소스 상태를 확인해주세요."] };
  }

  const attempts = [
    { minLen: 40, maxLen: 400, temp: 0.3 },
    { minLen: 30, maxLen: 500, temp: 0.5 },
    { minLen: 20, maxLen: 600, temp: 0.7 }
  ];

  let lastError = "";

  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    Logger.log(`   → Insights attempt ${i + 1}/${attempts.length} (temp=${attempt.temp})`);
    
    try {
      const result = v110_generateFactBasedInsights(intlArticles, koreaArticles, marketData, attempt);
      
      if (result.insights && result.insights.length > 0) {
        Logger.log(`     ✓ Generated ${result.insights.length} raw insights`);
        
        const deduplicated = v110_deduplicateInsights(result.insights);
        
        if (deduplicated.length >= CONFIG.REQUIRED_MIN_INSIGHTS) {
          Logger.log(`   ✓ SUCCESS: ${deduplicated.length} unique insights`);
          return { insights: deduplicated };
        } else {
          Logger.log(`     ⚠️ Only ${deduplicated.length} insights after dedup`);
          // If we have at least 3, and it's the last attempt, just use them
          if (i === attempts.length - 1 && deduplicated.length >= 3) {
            return { insights: deduplicated };
          }
        }
      }
    } catch (e) {
      lastError = e.toString();
      Logger.log(`     ❌ Attempt failed: ${lastError}`);
    }
  }

  Logger.log('   ❌ All attempts failed or yielded insufficient results');
  return { 
    insights: [
      "⚠️ AI 인사이트 생성 중 오류가 발생했거나 충분한 결과가 도출되지 않았습니다.",
      "기사 원문을 참고하시기 바랍니다.",
      lastError ? `(Error: ${lastError.substring(0, 50)}...)` : ""
    ].filter(s => s !== "")
  };
}

function v110_generateFactBasedInsights(intlArticles, koreaArticles, marketData, params) {
  try {
    const intlContext = intlArticles.map((a, i) => {
      let context = `${i + 1}. [${a.source}] ${a.title}`;
      if (a.aiReasoning) context += `\n   분석: ${a.aiReasoning}`;
      return context;
    }).join('\n\n');

    const koreaContext = koreaArticles.map((a, i) => {
      let context = `${i + 1}. [${a.source}] ${a.title}`;
      if (a.aiReasoning) context += `\n   분석: ${a.aiReasoning}`;
      return context;
    }).join('\n\n');

    const marketContext = v110_formatMarketContextForAI(marketData);

    const prompt = `You are a Senior Strategic Analyst writing a high-level briefing for global business executives.
Based on the provided news, deliver exactly ${CONFIG.REQUIRED_MAX_INSIGHTS} distinct professional insights in English.

**STRICT RULES:**
- DO NOT start all sentences with the same entity (e.g., avoid "Trump..." in every point).
- DO NOT use vague references like "This event," "This trend," or "This development."
- EACH insight must cover a DIFFERENT topic (e.g., if one covers trade, another should cover energy, tech, or monetary policy).
- Focus on the STRATEGIC IMPACT: "Why does this matter to a CEO or Investor?"

=== MARKET DATA ===
${marketContext}

=== INTERNATIONAL NEWS ===
${intlContext || 'None'}

=== KOREA NEWS ===
${koreaContext || 'None'}

**WRITING GUIDELINES:**
1. **Diversity:** Ensure coverage across different sectors (Tech, Geopolitics, Finance, Energy).
2. **Structure:** [The Fact] + [Critical Analysis] + [Future Outlook/Risk].
3. **Length:** Max 300 characters. Be concise but impactful.
4. **Tone:** Sharp, professional, and forward-looking.

**GOOD EXAMPLE:**
"The record $1.1T US trade deficit, despite aggressive tariff rhetoric, underscores the deep structural reliance on Asian manufacturing. Executives should expect continued currency volatility and supply chain friction as re-shoring efforts face labor bottlenecks. Diversification into Southeast Asian hubs remains a critical hedge."

Return response ONLY in JSON format:
{
  "insights": [
    "Insight 1 (e.g., Geopolitics/Trade)",
    "Insight 2 (e.g., Tech/AI Regulation)",
    "Insight 3 (e.g., Energy/Climate)",
    "Insight 4 (e.g., Korea Market/Export)",
    "Insight 5 (e.g., Monetary Policy/Inflation)",
    "Insight 6 (e.g., Global Finance)",
    "Insight 7 (e.g., Supply Chain)"
  ]
}`;

    Logger.log(`     → Calling GPT (temp=${params.temp})...`);
    const response = v110_callGPT(prompt, 4096, params.temp);
    
    const summary = v110_extractJSON(response);
    
    if (!summary || !summary.insights || !Array.isArray(summary.insights)) {
      Logger.log(`     ✗ Invalid response structure`);
      return { insights: [] };
    }
    
    const validInsights = summary.insights.map(i => {
      if (typeof i === 'object' && i !== null) {
        let body = i.insight || i.text || i.content || i.fact || "";
        if (i.implication) body += ` ${i.implication}`;
        return body || JSON.stringify(i);
      }
      return i;
    }).filter(i => {
      if (!i || typeof i !== 'string') return false;
      const clean = i.replace(/^\d+[\.\)]\s*/, '').trim(); 
      return clean.length >= params.minLen; // Relax max length check, GPT knows best
    }).map(i => i.replace(/^\d+[\.\)]\s*/, '').trim());
    
    Logger.log(`     → Valid insights: ${validInsights.length}/${summary.insights.length}`);
    return { insights: validInsights };

  } catch (error) {
    Logger.log(`     ❌ Insights error: ${error.toString()}`);
    return { insights: [] };
  }
}

// ==================== DEDUPLICATION & JSON EXTRACTION (Same as v10.8) ====================

function v110_deduplicateInsights(insights) {
  if (!insights || insights.length === 0) return [];
  
  Logger.log(`   🔍 Deduplicating ${insights.length} insights...`);
  
  const unique = [];
  
  for (const insight of insights) {
    let isDuplicate = false;
    
    for (const existing of unique) {
      const similarity = v110_calculateInsightSimilarity(insight, existing);
      
      if (similarity > CONFIG.INSIGHT_SIMILARITY_THRESHOLD) {
        Logger.log(`      ✗ Duplicate (${(similarity * 100).toFixed(0)}%): "${insight.substring(0, 50)}..."`);
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      unique.push(insight);
    }
  }
  
  Logger.log(`   → Kept ${unique.length}/${insights.length} unique insights`);
  return unique;
}

function v110_calculateInsightSimilarity(str1, str2) {
  const extractKeyEntities = (str) => {
    const entities = [];
    const majorEntities = [
      '대만', 'taiwan', 'tsmc', '반도체', 'semiconductor', 'chip',
      '삼성', 'samsung', 'sk하이닉스', 'sk', '미국', 'usa', 'america',
      '무관세', 'tariff', '관세', '투자', 'investment', '코스피', 'kospi',
      'fed', '연준', 'powell', '파월', '트럼프', 'trump', '러시아', 'russia',
      '우크라이나', 'ukraine', '중국', 'china', 'etf', '규제', 'regulation',
      '현대차', 'hyundai', '환율', 'exchange rate', '북한', 'north korea',
      '이란', 'iran', '이스라엘', 'israel', 'energy', '에너지', 'oil', '유가'
    ];
    
    const lower = str.toLowerCase();
    majorEntities.forEach(entity => {
      if (lower.includes(entity)) entities.push(entity);
    });
    return entities;
  };
  
  const entities1 = extractKeyEntities(str1);
  const entities2 = extractKeyEntities(str2);
  
  // Calculate entity Jaccard similarity
  let entitySimilarity = 0;
  if (entities1.length > 0 && entities2.length > 0) {
    const shared = entities1.filter(e => entities2.includes(e)).length;
    const total = new Set([...entities1, ...entities2]).size;
    entitySimilarity = shared / total;
  }
  
  // Calculate text Jaccard similarity (on words > 3 chars)
  const extractWords = (str) => {
    return new Set(str.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  };
  const words1 = extractWords(str1);
  const words2 = extractWords(str2);
  
  let textSimilarity = 0;
  if (words1.size > 0 && words2.size > 0) {
    const sharedWords = [...words1].filter(w => words2.has(w)).length;
    const totalWords = new Set([...words1, ...words2]).size;
    textSimilarity = sharedWords / totalWords;
  }
  
  // Weighted average: 60% entities, 40% words
  return (entitySimilarity * 0.6) + (textSimilarity * 0.4);
}

function v110_extractJSON(response) {
  Logger.log(`     → Extracting JSON from ${response.length} chars`);
  
  const patterns = [
    /\{[\s\S]*"insights"[\s\S]*\}/,
    /```json\s*(\{[\s\S]*?\})\s*```/,
    /"insights"\s*:\s*(\[[\s\S]*?\])/,
    /\{[^}]*"insights"[^}]*\[[^\]]*\][^}]*\}/
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    try {
      const match = response.match(patterns[i]);
      if (match) {
        let jsonStr = match[0];
        jsonStr = jsonStr.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        if (jsonStr.startsWith('[')) {
          jsonStr = `{"insights": ${jsonStr}}`;
        }
        
        Logger.log(`     → Pattern ${i + 1} matched, attempting parse...`);
        const parsed = JSON.parse(jsonStr);
        
        if (parsed.insights && Array.isArray(parsed.insights)) {
          Logger.log(`     ✓ Successfully parsed ${parsed.insights.length} insights`);
          return parsed;
        }
      }
    } catch (e) {
      Logger.log(`     ✗ Pattern ${i + 1} failed: ${e.message}`);
    }
  }
  
  Logger.log(`     ✗ All patterns failed`);
  return null;
}

// ==================== ALL OTHER FUNCTIONS (Copy from v10.8, rename v108 → v110) ====================
// I'll include the essential ones below for completeness:

function v110_extractTopics(articles) {
  const topics = new Set();
  articles.forEach(a => {
    const title = a.title.toLowerCase();
    const entities = [
      'canada', 'china', '캐나다', '중국',
      'openai', 'chatgpt', '오픈ai',
      'russia', 'ukraine', '러시아', '우크라이나',
      'trump', 'biden', '트럼프', '바이든',
      'fed', 'powell', '연준', '파울',
      'taiwan', '대만', 'tsmc'
    ];
    entities.forEach(entity => {
      if (title.includes(entity)) topics.add(entity);
    });
  });
  return Array.from(topics);
}

function v110_validate24HourWindow(articles) {
  const now = Date.now();
  const hoursBack24 = now - (24 * 60 * 60 * 1000);
  const stats = { total: articles.length, within24h: 0, older: 0, avgHoursAgo: 0 };
  let totalHours = 0;
  
  articles.forEach(a => {
    const publishTime = new Date(a.publishedAt).getTime();
    const hoursAgo = (now - publishTime) / (1000 * 60 * 60);
    totalHours += hoursAgo;
    if (publishTime >= hoursBack24) stats.within24h++;
    else stats.older++;
  });
  
  stats.avgHoursAgo = (totalHours / articles.length).toFixed(1);
  Logger.log(`\n⏰ 24h Validation:`);
  Logger.log(`   Within 24h: ${stats.within24h} articles`);
  Logger.log(`   Older: ${stats.older} articles`);
  Logger.log(`   Avg age: ${stats.avgHoursAgo} hours`);
  if (stats.older > 0) Logger.log(`   ⚠️ Warning: ${stats.older} articles outside 24h window`);
}

function v110_logSourceDistribution(articles, sectionName) {
  const sourceCounts = {};
  articles.forEach(a => sourceCounts[a.source] = (sourceCounts[a.source] || 0) + 1);
  const uniqueSources = Object.keys(sourceCounts).length;
  Logger.log(`   📊 ${sectionName} Source Distribution:`);
  Logger.log(`      Unique sources: ${uniqueSources}`);
  Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).forEach(([source, count]) => {
    Logger.log(`      - ${source}: ${count}`);
  });
}

function v110_removeDuplicatesAggressive(articles) {
  Logger.log(`   🔍 Aggressive deduplication: ${articles.length} articles`);
  const unique = [];
  const seen = new Set();
  for (const article of articles) {
    const normalized = article.title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    if (seen.has(normalized)) continue;
    let isDuplicate = false;
    for (const existing of unique) {
      const similarity = v110_calculateEnhancedSimilarity(article.title, existing.title);
      if (similarity > CONFIG.SIMILARITY_THRESHOLD) {
        if (article.score > existing.score) {
          const idx = unique.indexOf(existing);
          unique[idx] = article;
        }
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      unique.push(article);
      seen.add(normalized);
    }
  }
  Logger.log(`   → Deduplicated: ${unique.length} unique articles (removed ${articles.length - unique.length})`);
  return unique;
}

function v110_calculateEnhancedSimilarity(str1, str2) {
  const extract = (str) => {
    const normalized = str.toLowerCase();
    const words = normalized.split(/\s+/);
    const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been']);
    return words.filter(w => w.length > 2 && !stopwords.has(w));
  };
  const words1 = new Set(extract(str1));
  const words2 = new Set(extract(str2));
  if (words1.size === 0 || words2.size === 0) return 0;
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  const jaccard = intersection.size / union.size;
  const properNouns1 = new Set(str1.match(/\b[A-Z][a-z]+\b/g) || []);
  const properNouns2 = new Set(str2.match(/\b[A-Z][a-z]+\b/g) || []);
  const sharedProperNouns = new Set([...properNouns1].filter(x => properNouns2.has(x)));
  const properNounBonus = sharedProperNouns.size >= 2 ? 0.2 : 0;
  return Math.min(jaccard + properNounBonus, 1.0);
}

function v110_ensureSourceDiversity(articles, requiredCount) {
  if (articles.length <= requiredCount) return articles;
  
  const sourceCounts = {};
  const selected = [];
  const remaining = [...articles];
  
  // Rule: Try to pick at least one from each source first, then allow more
  while (selected.length < requiredCount && remaining.length > 0) {
    let bestIdx = -1;
    let minSourceCount = Infinity;
    let maxArticleScore = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
        const source = remaining[i].source;
        const count = sourceCounts[source] || 0;
        
        // Priority 1: Lower occurrence of source
        // Priority 2: Higher article score/rank
        if (count < minSourceCount) {
            minSourceCount = count;
            maxArticleScore = remaining[i].score || 0;
            bestIdx = i;
        } else if (count === minSourceCount) {
            if ((remaining[i].score || 0) > maxArticleScore) {
                maxArticleScore = remaining[i].score || 0;
                bestIdx = i;
            }
        }
    }

    if (bestIdx !== -1) {
        const article = remaining.splice(bestIdx, 1)[0];
        selected.push(article);
        sourceCounts[article.source] = (sourceCounts[article.source] || 0) + 1;
    } else {
        break;
    }
  }

  const uniqueSources = Object.keys(sourceCounts).length;
  Logger.log(`   → Source diversity: ${uniqueSources} unique sources in ${selected.length} articles`);
  return selected;
}

function v110_processWithGuarantee(articles, requiredCount, sectionType, intlTopics = []) {
  Logger.log(`\n🎯 Processing ${sectionType} - GUARANTEE ${requiredCount}`);
  Logger.log(`   Input: ${articles.length} articles`);
  if (articles.length === 0) return [];
  articles.forEach(a => a.score = v110_headlineScore(a, sectionType, intlTopics));
  articles.sort((a, b) => b.score - a.score);
  let filtered = v110_removeDuplicatesAggressive(articles);
  filtered = filtered.filter(a => a.score > 0);
  Logger.log(`   → After filter: ${filtered.length} articles`);
  if (filtered.length < requiredCount) {
    Logger.log(`   ⚠️ Insufficient articles (${filtered.length} < ${requiredCount})`);
    return filtered.slice(0, requiredCount);
  }
  const candidates = filtered.slice(0, CONFIG.STAGE1_CANDIDATES);
  let analyzed = v110_perplexityAnalysis(candidates, sectionType);
  if (analyzed.length < CONFIG.STAGE2_PERPLEXITY) {
    Logger.log(`   ⚠️ Perplexity insufficient, using top ${CONFIG.STAGE2_PERPLEXITY}`);
    analyzed = candidates.slice(0, CONFIG.STAGE2_PERPLEXITY);
  }
  let final = v110_gptFinalCuration(analyzed, sectionType, requiredCount);
  if (final.length < requiredCount) {
    Logger.log(`   ⚠️ GPT insufficient, backfilling`);
    const used = new Set(final.map(a => a.title));
    const backfill = analyzed.filter(a => !used.has(a.title)).slice(0, requiredCount - final.length);
    final = [...final, ...backfill];
  }
  final = v110_ensureSourceDiversity(final, requiredCount);
  final = final.slice(0, requiredCount);
  Logger.log(`   → Final: ${final.length} (GUARANTEED)`);
  return final;
}

function v110_headlineScore(article, sectionType, intlTopics = []) {
  let score = article.sourceTier === 1 ? 40 : 25; // Slight boost to Tier 2 for diversity
  const text = (article.title + ' ' + article.description).toLowerCase();
  const title = article.title.toLowerCase();
  const source = article.source.toLowerCase();
  
  if (source.includes('wsj') || source.includes('ft')) score += 18;
  else if (source.includes('bloomberg') || source.includes('economist')) score += 15;
  else if (source.includes('nyt') || source.includes('reuters')) score += 12;

  // -- 1. Macro/Strategic keywords --
  const macroKeywords = [
    '지정학', 'geopolitics', '공급망', 'supply chain', '규제', 'regulation', 
    '인구', 'demographics', '에너지', 'energy', '전략', 'strategy', 
    '산업구조', 'reordering', '협정', 'accord', '관세', 'tariff',
    '보조금', 'subsidy', '국제기구', 'imf', 'world bank', 'iaea', 'un',
    '생산성', 'productivity', '노동', 'labor', '디지털 전환', 'digital transformation'
  ];
  macroKeywords.forEach(kw => {
    if (text.includes(kw)) score += 15;
  });

  // -- 2. Exclude non-business content --
  const columnKeywords = ['칼럼', 'column', '[칼럼]', '오피니언', 'opinion', '[오피니언]', '기고', 'editorial', 'commentary', '데스크', '[데스크]', 'op-ed', '사설', '논평', '기자수첩', '취재수첩'];
  for (const kw of columnKeywords) if (text.includes(kw) || title.includes(kw)) return -1000;
  
  const excludeKeywords = ['sport', 'football', 'soccer', 'baseball', 'basketball', 'k-pop', 'kpop', 'celebrity', 'entertainment', 'hollywood', 'movie', 'actor', 'actress', 'netflix', 'grammy', 'oscar', '연예', '드라마', '영화', '가수', '배우'];
  for (const kw of excludeKeywords) if (text.includes(kw)) return -1000;

  // -- 3. Filter trivial market/data entries --
  const trivialMarketKeywords = ['환율 종가', '환율 마감', '달러 환율', '원 오른', '원 내린', '원 상승', '원 하락', '시황', '장중', '상승 출발', '하락 출발', '금값 최고', '은값 최고', '금값 돌파'];
  for (const kw of trivialMarketKeywords) {
    if (title.includes(kw)) {
      if (!title.includes('사상 최고') && !title.includes('급등') && !title.includes('급락')) score -= 25;
    }
  }

  // Trivial consumer/personal finance
  const trivialKeywords = ['통장', '적금', '예금', '넣으면', '받는', '월 50만', '월50만', '목돈', '특판', '중과세', '다주택자', '양도세', '취득세', '입찰', '계약', '공사비'];
  for (const kw of trivialKeywords) {
    if (title.includes(kw)) {
      const majorKeywords = ['정부', '금융위', '기재부', '금리', '정책', '법', '규제', '대통령', '장관', 'fed', '중앙은행'];
      let hasMajorCount = 0;
      majorKeywords.forEach(m => { if (title.includes(m)) hasMajorCount++; });
      if (hasMajorCount === 0) return -1000;
      score -= 10;
    }
  }

  // -- 4. Section specific Scoring --
  if (sectionType === 'intl') {
    const majorKeywords = ['breaking', 'urgent', 'crisis', 'war', 'strike', 'fed', 'ecb', 'boj', 'rate', 'inflation', 'recession', 'tariff', 'sanctions', 'trade war', 'china', 'russia', 'ukraine', 'taiwan', 'iran', 'trump', 'biden', 'powell', 'apple', 'microsoft', 'nvidia', 'tesla', 'openai', 'ceasefire'];
    majorKeywords.forEach(kw => { if (text.includes(kw)) score += 12; });
  }

  if (sectionType === 'korea') {
    // International topic overlap penalty
    for (const topic of intlTopics) if (title.includes(topic)) score -= 25;

    // Diversity themes (Industrial sectors)
    const diversifyKeywords = ['자동차', '현대차', '기아', '원전', '에너지', '배터리', 'k-배터리', '방산', '방위산업', '바이오', '제약', '플랫폼', '네이버', '카카오', '반도체', '하이닉스', 'sk'];
    diversifyKeywords.forEach(kw => { if (text.includes(kw)) score += 10; });

    const majorKeywords = ['kospi', 'kosdaq', '사상 최고', '기준금리', '정책', '규제', '법안', '금융위', '공정위', '기재부', '삼성', 'samsung', '수출', '무역', 'gdp', '성장률', '인수합병', 'm&a', '구조조정', '상장'];
    majorKeywords.forEach(kw => { if (text.includes(kw)) score += 10; });
  }

  const hoursAgo = (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60);
  if (hoursAgo < 4) score += 15;
  else if (hoursAgo < 8) score += 10;
  else if (hoursAgo < 16) score += 5;

  return score;
}

function v110_callPerplexity(prompt, maxTokens = 1000) {
  const url = 'https://api.perplexity.ai/chat/completions';
  const payload = {
    model: CONFIG.PERPLEXITY_MODEL,
    messages: [
      {role: 'system', content: 'Business analyst with web search. Return valid JSON.'},
      {role: 'user', content: prompt}
    ],
    max_tokens: maxTokens,
    temperature: 0.2,
    search_domain_filter: ['bloomberg.com', 'reuters.com', 'ft.com', 'wsj.com']
  };
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {'Authorization': `Bearer ${CONFIG.PERPLEXITY_API_KEY}`},
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());
  if (json.error) throw new Error(json.error.message);
  return json.choices[0].message.content.trim();
}

function v110_callGPT(prompt, maxTokens = 4096, temperature = 0.3) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const payload = {
    model: CONFIG.GPT_MODEL,
    messages: [
      {role: 'system', content: 'You are a business analyst. Return ONLY valid JSON with no extra text.'},
      {role: 'user', content: prompt}
    ],
    temperature: temperature,
    max_tokens: maxTokens
  };
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`},
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  let lastError;
  for (let i = 0; i < 3; i++) {
    try {
      const response = UrlFetchApp.fetch(url, options);
      const json = JSON.parse(response.getContentText());
      if (json.error) {
        if (json.error.code === 'server_error' || json.error.type === 'server_error' || response.getResponseCode() >= 500) {
          lastError = json.error.message || 'Server Error';
          Utilities.sleep(1000 * (i + 1));
          continue;
        }
        throw new Error(json.error.message);
      }
      return json.choices[0].message.content.trim();
    } catch (e) {
      lastError = e.toString();
      Utilities.sleep(1000 * (i + 1));
    }
  }
  throw new Error(`GPT failed after 3 attempts. Last error: ${lastError}`);
}

function v110_perplexityAnalysis(articles, sectionType) {
  if (!CONFIG.PERPLEXITY_API_KEY || articles.length === 0) {
    Logger.log('   ⚠️ Skipping Perplexity');
    return articles.slice(0, CONFIG.STAGE2_PERPLEXITY);
  }
  try {
    const articleList = articles.map((a, i) => {
      const desc = a.description ? ` - ${a.description.substring(0, 100)}` : '';
      return `${i}. [${a.source}] ${a.title}${desc}`;
    }).join('\n\n');
    const prompt = `Analyze and select ${CONFIG.STAGE2_PERPLEXITY} most important HEADLINES. Avoid duplicates.\n\nHeadlines:\n${articleList}\n\nReturn JSON:\n{"selected": [{"index": 3, "reasoning": "...", "key_facts": "..."}]}`;
    const response = v110_callPerplexity(prompt, 2000);
    let cleaned = response.replace(/```json/gi, '').replace(/```/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) cleaned = match[0];
    const result = JSON.parse(cleaned);
    if (!result.selected || !Array.isArray(result.selected)) throw new Error('Invalid');
    const analyzed = result.selected.filter(item => item.index >= 0 && item.index < articles.length).map(item => ({
      ...articles[item.index],
      aiReasoning: item.reasoning,
      keyFacts: item.key_facts,
      aiScore: 100
    }));
    Logger.log(`   ✓ Perplexity: ${analyzed.length}`);
    return analyzed;
  } catch (error) {
    Logger.log(`   ❌ Perplexity: ${error.toString()}`);
    return articles.slice(0, CONFIG.STAGE2_PERPLEXITY);
  }
}

function v110_gptFinalCuration(articles, sectionType, requiredCount) {
  if (!CONFIG.OPENAI_API_KEY || articles.length === 0) return articles.slice(0, requiredCount);
  try {
    const articleList = articles.map((a, i) => {
      const reasoning = a.aiReasoning ? `\n   ${a.aiReasoning}` : '';
      return `${i}. [${a.source}] ${a.title}${reasoning}`;
    }).join('\n\n');
    const prompt = `Select ${requiredCount} most critical HEADLINES. Avoid duplicates.\n\nArticles:\n${articleList}\n\nReturn JSON array: [3, 7, 1, ...]`;
    const response = v110_callGPT(prompt, 300);
    let cleaned = response.replace(/```json/gi, '').replace(/```/g, '');
    const match = cleaned.match(/\[[\d\s,]+\]/);
    if (!match) return articles.slice(0, requiredCount);
    const indices = JSON.parse(match[0]);
    if (!Array.isArray(indices)) return articles.slice(0, requiredCount);
    const curated = indices.filter(i => i >= 0 && i < articles.length).map(i => articles[i]);
    if (curated.length < requiredCount) {
      const used = new Set(indices);
      const remaining = articles.filter((_, i) => !used.has(i)).slice(0, requiredCount - curated.length);
      return [...curated, ...remaining];
    }
    return curated.slice(0, requiredCount);
  } catch (error) {
    Logger.log(`   ❌ GPT: ${error.toString()}`);
    return articles.slice(0, requiredCount);
  }
}

// ==================== RSS & MARKET (Same as v10.8, rename) ====================

function v110_fetchAllNews() {
  const allArticles = [];
  const cutoffTime = new Date(Date.now() - CONFIG.NEWS_HOURS_BACK * 60 * 60 * 1000);
  NEWS_SOURCEX.forEach(source => {
    try {
      let articles = v110_fetchRSS(source);
      articles = articles.filter(a => new Date(a.publishedAt) > cutoffTime);
      articles = articles.slice(0, CONFIG.MAX_ARTICLES_PER_SOURCE);
      articles.forEach(a => {
        a.section = source.section;
        a.sourceTier = source.tier;
      });
      allArticles.push(...articles);
      Logger.log(`✓ ${source.name}: ${articles.length} items`);
    } catch (error) {
      Logger.log(`✗ ${source.name}: ${error.toString()}`);
    }
  });
  return allArticles;
}

function v110_fetchRSS(source) {
  try {
    const response = UrlFetchApp.fetch(source.url, {
      muteHttpExceptions: true,
      headers: {'User-Agent': 'Mozilla/5.0'}
    });
    if (response.getResponseCode() !== 200) return [];
    const xml = response.getContentText();
    const document = XmlService.parse(xml);
    const root = document.getRootElement();
    let items;
    if (root.getChild('channel')) {
       items = root.getChild('channel').getChildren('item');
    } else {
      const ns = root.getNamespace();
      items = root.getChildren('entry', ns);
    }
    const articles = [];
    items.forEach(item => {
      try {
        let link = v110_getText(item, 'link');
        if (!link) {
          const linkEl = item.getChild('link');
          if (linkEl) link = linkEl.getAttribute('href')?.getValue() || linkEl.getText();
        }
        const title = v110_cleanTitle(v110_getText(item, 'title'));
        if (!title || title.length < 20) return;
        articles.push({
          source: v110_extractSource(source.name, link),
          title: v110_deepClean(title),
          link: v110_deepClean(link),
          description: v110_cleanDesc(v110_getText(item, 'description') || v110_getText(item, 'summary')),
          publishedAt: v110_parseDate(v110_getText(item, 'pubDate') || v110_getText(item, 'published')),
          score: 0
        });
      } catch (e) {}
    });
    return articles;
  } catch (error) {
    return [];
  }
}

function v110_getText(element, childName) {
  const child = element.getChild(childName);
  return child ? child.getText() : null;
}

function v110_extractSource(feedName, link) {
  if (feedName.includes('Google News') || feedName.includes('Breaking')) {
    if (link) {
      if (link.includes('wsj.com')) return 'WSJ';
      if (link.includes('ft.com')) return 'FT';
      if (link.includes('bloomberg.com')) return 'Bloomberg';
      if (link.includes('reuters.com')) return 'Reuters';
      if (link.includes('nytimes.com')) return 'NYT';
      if (link.includes('economist.com')) return 'Economist';
      if (link.includes('bbc.')) return 'BBC';
      if (link.includes('hankyung.com')) return '한국경제';
      if (link.includes('chosun.com')) return '조선일보';
      if (link.includes('joongang.co.kr')) return '중앙일보';
      if (link.includes('mk.co.kr')) return '매일경제';
      if (link.includes('sedaily.com')) return '서울경제';
      if (link.includes('mt.co.kr')) return '머니투데이';
      if (link.includes('etnews.com')) return '전자신문';
      if (link.includes('yna.co.kr')) return '연합뉴스';
      if (link.includes('edaily.co.kr')) return '이데일리';
    }
  }
  return feedName.replace(/Google News - /g, '').replace(/ - .*$/g, '').trim();
}

function v110_cleanTitle(title) {
  if (!title) return '';
  return title.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').replace(/ - [\w\s\.\-&]+(\.com|\.net)$/gi, '').replace(/ \| .*$/, '').trim();
}

function v110_cleanDesc(desc) {
  if (!desc) return '';
  return desc.replace(/<[^>]*>/g, '').trim();
}

function v110_parseDate(dateStr) {
  return dateStr ? new Date(dateStr) : new Date();
}

function v110_deepClean(text) {
  if (!text) return '';
  return text.replace(/[\r\n\u2028\u2029]+/g, ' ').replace(/%0[A-D]/gi, ' ').replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
}

function v110_fetchMarketData() {
  Logger.log('🚀 Market Fetch v11.6 (Naver Tables for Commodities)');
  
  // 1. Korea Markets & FX from Naver Finance
  const naverData = v110_fetchNaverFinance();
  
  // 2. US Stocks from Yahoo
  const usStocks = v110_fetchStockData(CONFIG.MARKET_SYMBOLS.US_STOCKS);
  
  // 3. Commodities from Naver Detail Tables (Polling API is unreliable)
  const commodities = v110_fetchCommoditiesFromNaverTable();
  
  // 4. Add Bitcoin from Yahoo (Naver doesn't have it)
  const btcData = v110_fetchStockData(['BTC-USD']);
  if (btcData && btcData.length > 0) {
    commodities.push(btcData[0]);
  }

  // 5. Get FX Rates (Naver provides USD/KRW)
  const fxRates = v110_fetchFXRates(CONFIG.MARKET_SYMBOLS.FX_RATES);
  const usdKrwFromNaver = naverData.find(d => d.symbol === 'FX_USDKRW');
  if (usdKrwFromNaver) {
    const idx = fxRates.findIndex(f => f.name === 'USD/KRW');
    if (idx !== -1) fxRates[idx] = usdKrwFromNaver;
    else fxRates.push(usdKrwFromNaver);
  }

  // 6. Map Korea Stocks from Naver
  const koreaStocks = [
    naverData.find(d => d.symbol === 'KOSPI'),
    naverData.find(d => d.symbol === 'KOSDAQ')
  ].filter(Boolean);

  return {
    usStocks: usStocks,
    koreaStocks: koreaStocks.length > 0 ? koreaStocks : v110_fetchStockData(CONFIG.MARKET_SYMBOLS.KOREA_STOCKS),
    commodities: commodities,
    fxRates: fxRates
  };
}

function v110_fetchCommoditiesFromNaverTable() {
  const commodities = [];
  const items = [
    { code: 'CMDT_GC', name: 'Gold' },
    { code: 'CMDT_SI', name: 'Silver' },
    { code: 'OIL_CL', name: 'Oil (WTI)' }
  ];

  items.forEach(item => {
    try {
      const url = `https://finance.naver.com/marketindex/worldDailyQuote.naver?marketindexCd=${item.code}&fdtc=2&page=1`;
      const resp = UrlFetchApp.fetch(url, { 
        muteHttpExceptions: true, 
        headers: { 'User-Agent': 'Mozilla/5.0' } 
      });
      
      if (resp.getResponseCode() === 200) {
        const html = resp.getContentText('EUC-KR');
        
          // Improved regex to handle whitespace and newlines inside <td>
          const rowRegex = /<tr[^>]*>[\s\S]*?<td class="date">[\s\n]*(\d{4}\.\d{2}\.\d{2})[\s\n]*<\/td>([\s\S]*?)<\/tr>/;
          const rowMatch = html.match(rowRegex);
          
          if (rowMatch) {
            const rowContent = rowMatch[2];
            // Columns in order: Closing Price, Change, Change%
            const cellRegex = /<td class="num">([\s\S]*?)<\/td>/g;
            const cells = [];
            let m;
            while ((m = cellRegex.exec(rowContent)) !== null) {
              // Clean up HTML tags (like <img>) and trim whitespace/newlines
              let val = m[1].replace(/<[^>]*>/g, '').replace(/[\r\n\t]+/g, ' ').trim();
              cells.push(val);
            }
            
            if (cells.length >= 3) {
              const price = parseFloat(cells[0].replace(/,/g, ''));
              // The 3rd cell (index 2) is the percentage
              const change = parseFloat(cells[2].replace(/%/g, '').replace(/,/g, '').trim());
              
              commodities.push({ name: item.name, price: price, dayChange: change });
              Logger.log(`   [Naver Table] ${item.name}: $${price} (${change}%)`);
            }
          } else {
          Logger.log(`   ⚠️ Could not find data row for ${item.name}`);
        }
      }
    } catch (e) {
      Logger.log(`⚠️ Naver table fetch failed for ${item.name}: ${e.message}`);
    }
  });
  
  return commodities;
}



function v110_fetchBitcoinReliable() {
  try {
    const prompt = `Search for the current price of Bitcoin (BTC) in USD as of today, February 2, 2026.
Identify the live trading price on global exchanges during this market crash.
Return ONLY a valid JSON object. 
Format: {"price": <numeric_value>, "change": <numeric_percentage_change>}
(Example: {"price": 95000.5, "change": -2.4})`;
    const response = v110_callPerplexity(prompt, 500);
    const json = v110_extractJSON_Market(response);
    if (json && json.price) {
      const p = parseFloat(String(json.price).replace(/[^0-9.]/g, ''));
      const c = parseFloat(String(json.change || 0).replace(/[^0-9.-]/g, ''));
      return {name: 'Bitcoin', price: p, dayChange: c, weekChange: 0};
    }
  } catch (e) {
    Logger.log(`⚠️ Bitcoin fetch failed: ${e.message}`);
  }
  return null;
}





function v110_fetchNaverFinance() {
  const data = [];
  try {
    // Stable Mobile API for everything
    const codes = [
      {code: 'KOSPI', category: 'domestic', type: 'index'},
      {code: 'KOSDAQ', category: 'domestic', type: 'index'},
      {code: 'FX_USDKRW', category: 'exchange', type: 'price'},
      {code: 'FX_EURKRW', category: 'exchange', type: 'price'},
      {code: 'FX_JPYKRW', category: 'exchange', type: 'price'}
    ];

    // Domestic Indexes (KOSPI/KOSDAQ)
    codes.filter(c => c.category === 'domestic').forEach(c => {
       try {
         const url = `https://m.stock.naver.com/api/index/${c.code}/basic`;
         const resp = UrlFetchApp.fetch(url, {muteHttpExceptions:true});
         if (resp.getResponseCode() === 200) {
           const json = JSON.parse(resp.getContentText());
           const price = Number(json.closePrice.replace(/,/g, ''));
           data.push({
             symbol: c.code,
             name: c.code,
             price: price,
             dayChange: Number(json.fluctuationsRatio),
             source: 'Naver'
           });
         }
       } catch (e) {}
    });

    // Exchange Rates
    const fxUrl = 'https://m.stock.naver.com/front-api/v1/marketIndex/prices?category=exchange&recurrent=true';
    const fxResp = UrlFetchApp.fetch(fxUrl, { muteHttpExceptions: true });
    if (fxResp.getResponseCode() === 200) {
      const fxJson = JSON.parse(fxResp.getContentText());
      const list = fxJson.result || [];
      list.forEach(fx => {
        if (['USD', 'EUR', 'JPY'].includes(fx.itemCode)) {
           data.push({
             symbol: `FX_${fx.itemCode}KRW`,
             name: `${fx.itemCode}/KRW`,
             price: Number(fx.closePrice.replace(/,/g, '')),
             dayChange: Number(fx.fluctuationsRatio),
             weekChange: 0,
             source: 'Naver'
           });
        }
      });
    }

  } catch (e) {
    Logger.log(`❌ Naver Finance Error: ${e.message}`);
  }
  return data;
}

function v110_fetchFXRates(symbols) {
  const data = [];
  const names = {'KRW=X': 'USD/KRW', 'EURKRW=X': 'EUR/KRW', 'JPYKRW=X': 'JPY/KRW'};
  symbols.forEach(symbol => {
    try {
      const result = v110_fetchYahoo(symbol);
      if (result) {
        if (names[symbol]) result.name = names[symbol];
        data.push(result);
      }
    } catch (e) {
      Logger.log(`❌ FX Error (${symbol}): ${e.toString()}`);
    }
  });
  return data;
}

function v110_fetchStockData(symbols) {
  const data = [];
  symbols.forEach(symbol => {
    try {
      const result = v110_fetchYahoo(symbol);
      if (result) data.push(result);
    } catch (e) {}
  });
  return data;
}

function v110_fetchYahoo(symbol) {
  try {
    const cacheBuster = Date.now();
    let currentPrice, dayChange, previousClose;
    
    // 1. Try Finance Quote for latest real-time data first
    try {
      const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}&_=${cacheBuster}`;
      const qResp = UrlFetchApp.fetch(quoteUrl, { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (qResp.getResponseCode() === 200) {
        const qJson = JSON.parse(qResp.getContentText());
        const quote = qJson.quoteResponse?.result?.[0];
        if (quote) {
          currentPrice = quote.regularMarketPrice;
          dayChange = quote.regularMarketChangePercent;
          previousClose = quote.regularMarketPreviousClose;
          Logger.log(`   [Quote] ${symbol}: ${currentPrice} (${dayChange}%)`);
        }
      }
    } catch (e) {
      Logger.log(`   ⚠️ Quote API failed for ${symbol}: ${e.message}`);
    }

    // 2. Fetch Chart for historical data and WoW
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d&_=${cacheBuster}`;
    const response = UrlFetchApp.fetch(chartUrl, { 
      muteHttpExceptions: true,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (response.getResponseCode() !== 200) return null;
    const json = JSON.parse(response.getContentText());
    if (!json.chart?.result?.[0]) return null;

    const result = json.chart.result[0];
    const meta = result.meta;
    const quotes = result.indicators.quote[0];
    const allPrices = quotes.close.filter(p => p != null);
    
    if (allPrices.length === 0) return null;

    // Fallback if Quote API failed - calculate from chart data
    if (currentPrice === undefined || dayChange === undefined) {
      currentPrice = meta.regularMarketPrice || allPrices[allPrices.length - 1];
      // Use yesterday's close from chart data (second to last value)
      previousClose = allPrices.length >= 2 ? allPrices[allPrices.length - 2] : null;
      // Only use meta.previousClose if chart data doesn't have enough history
      if (!previousClose) previousClose = meta.previousClose;
      dayChange = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
      Logger.log(`   [Chart Fallback] ${symbol}: ${currentPrice} (${dayChange.toFixed(2)}%) prev=${previousClose}`);
    }

    // WoW calculation (5 trading days ago)
    const weekAgoPrice = allPrices.length >= 6 ? allPrices[allPrices.length - 6] : allPrices[0];
    const weekChange = weekAgoPrice ? ((currentPrice - weekAgoPrice) / weekAgoPrice) * 100 : 0;

    const names = {
      '^GSPC': 'S&P 500', '^DJI': 'Dow Jones', '^IXIC': 'NASDAQ',
      'GC=F': 'Gold', 'SI=F': 'Silver', 'CL=F': 'Oil (WTI)', 'BTC-USD': 'Bitcoin'
    };

    return {
      symbol: symbol,
      name: names[symbol] || symbol,
      price: currentPrice,
      dayChange: dayChange,
      weekChange: weekChange,
      isStale: (Date.now() / 1000 - (meta.regularMarketTime || 0)) > 21600 // Over 6 hours is stale for a daily brief
    };
  } catch (e) {
    Logger.log(`❌ Error in fetchYahoo for ${symbol}: ${e.toString()}`);
    return null;
  }
}

/**
 * Validates market data against latest news headlines.
 * If news says "KOSPI collapsed to 2400" but market data says "2550", 
 * we use the headline data as the source of truth for the brief.
 */
function v110_validateMarketDataWithAI(marketData, articles) {
  if (!CONFIG.OPENAI_API_KEY) return marketData;

  try {
    const headlines = articles.slice(0, 30).map(a => a.title).join('\n');
    const currentBrief = JSON.stringify(marketData);

const prompt = `You are a Precision Market Auditor.
Compare the Data below with the Headlines.

=== MARKET DATA (FROM API/SEARCH) ===
${currentBrief}

=== NEWS HEADLINES (GROUND TRUTH) ===
${headlines}

**TASK:**
1. If a value in the Market Data is clearly wrong compared to the headlines (e.g., news says "KOSPI 4940" but Data says "2500"), CORRECT IT.
2. If news says "USD/KRW broke 1450" but Data is lower, CORRECT IT.
3. For Bitcoin and Commodities, ensure they match the sentiment and any mentioned levels in global headlines.
4. If the Data looks reasonable and roughly matches the news, DO NOT CHANGE IT.

Return the JSON object only.`;

    const response = v110_callGPT(prompt, 2000, 0.1);
    const cleaned = v110_extractJSON_Market(response);
    
    if (cleaned) {
      Logger.log(`   ✓ AI Validation complete. Updates applied if discrepancies were found.`);
      return cleaned;
    }
  } catch (e) {
    Logger.log(`   ⚠️ AI Validation failed: ${e.message}`);
  }
  return marketData;
}

function v110_extractJSON_Market(response) {
  try {
    let cleaned = response.replace(/```json/gi, '').replace(/```/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (e) {}
  return null;
}

function v110_formatMarketContextForAI(marketData) {
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
  if (marketData.fxRates && marketData.fxRates.length > 0) {
    context += 'FX: ';
    marketData.fxRates.forEach(fx => {
      if (fx && fx.price) {
        const chg = fx.dayChange >= 0 ? `+${fx.dayChange.toFixed(2)}%` : `${fx.dayChange.toFixed(2)}%`;
        context += `${fx.name} ${fx.price.toFixed(2)} ${chg}, `;
      }
    });
    context = context.slice(0, -2) + '\n';
  }
  return context || 'N/A';
}

// ==================== SLACK ====================

function v110_formatSlackMessage(aiSummary, intlArticles, koreaArticles, marketData) {
  const blocks = [];
  const dateObj = new Date();
  const dateStr = dateObj.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  
  blocks.push({type: 'header', text: {type: 'plain_text', text: `Global Business Brief (${mm}/${dd})`, emoji: true}});
  blocks.push({type: 'divider'});
  blocks.push({type: 'header', text: {type: 'plain_text', text: '📊 Market Snapshot', emoji: true}});
  blocks.push({type: 'section', text: {type: 'mrkdwn', text: v110_truncate(v110_formatMarketData(marketData), 2900)}});
  blocks.push({type: 'divider'});
  if (aiSummary.insights && aiSummary.insights.length > 0) {
    blocks.push({type: 'header', text: {type: 'plain_text', text: '🎯 Executive Insights', emoji: true}});
    const insightsText = aiSummary.insights.map((i, idx) => `*${idx + 1}.* ${v110_truncate(i, 500)}`).join('\n\n');
    blocks.push({type: 'section', text: {type: 'mrkdwn', text: v110_truncate(insightsText, 2900)}});
    blocks.push({type: 'divider'});
  }
  if (intlArticles && intlArticles.length > 0) {
    blocks.push({type: 'header', text: {type: 'plain_text', text: '🌍 International Headlines', emoji: true}});
    const intlText = intlArticles.map((a, i) => `${i + 1}. <${v110_truncate(a.link, 400)}|${v110_truncate(a.title, 250)}>`).join('\n');
    blocks.push({type: 'section', text: {type: 'mrkdwn', text: v110_truncate(intlText, 2900)}});
    blocks.push({type: 'divider'});
  }
  if (koreaArticles && koreaArticles.length > 0) {
    blocks.push({type: 'header', text: {type: 'plain_text', text: '🇰🇷 Korea Business Headlines', emoji: true}});
    const koreaText = koreaArticles.map((a, i) => `${i + 1}. <${v110_truncate(a.link, 400)}|${v110_truncate(a.title, 250)}>`).join('\n');
    blocks.push({type: 'section', text: {type: 'mrkdwn', text: v110_truncate(koreaText, 2900)}});
    blocks.push({type: 'divider'});
  }
  const total = (intlArticles?.length || 0) + (koreaArticles?.length || 0);
  blocks.push({type: 'context', elements: [{type: 'mrkdwn', text: `Daily BIZ News Agent 🤖 v11.0 | ${total} curated articles`}]});
  return {blocks: blocks};
}

function v110_truncate(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

function v110_formatMarketData(marketData) {
  let text = '';
  
  if (marketData.usStocks && marketData.usStocks.length > 0) {
    text += '*US Markets*\n';
    marketData.usStocks.forEach(s => {
      if (!s) return;
      const emoji = s.dayChange >= 0 ? '📈' : '📉';
      text += `${emoji} ${s.name}: ${Number(s.price).toLocaleString(undefined, {minimumFractionDigits: 2})} (${s.dayChange >= 0 ? '+' : ''}${Number(s.dayChange).toFixed(2)}%)\n`;
    });
  }

  if (marketData.koreaStocks && marketData.koreaStocks.length > 0) {
    text += '\n*Korea Markets*\n';
    marketData.koreaStocks.forEach(s => {
      if (!s) return;
      const emoji = s.dayChange >= 0 ? '📈' : '📉';
      text += `${emoji} ${s.name}: ${Number(s.price).toLocaleString(undefined, {minimumFractionDigits: 2})} (${s.dayChange >= 0 ? '+' : ''}${Number(s.dayChange).toFixed(2)}%)\n`;
    });
  }

  if (marketData.fxRates && marketData.fxRates.length > 0) {
    text += '\n*FX Rates*\n';
    marketData.fxRates.forEach(fx => {
      if (!fx) return;
      const emoji = fx.dayChange >= 0 ? '📈' : '📉';
      text += `${emoji} ${fx.name}: ${Number(fx.price).toFixed(2)} (${fx.dayChange >= 0 ? '+' : ''}${Number(fx.dayChange).toFixed(2)}%)\n`;
    });
  }

  if (marketData.commodities && marketData.commodities.length > 0) {
    text += '\n*Commodities & Crypto*\n';
    marketData.commodities.forEach(c => {
      if (!c) return;
      const emoji = c.dayChange >= 0 ? '📈' : '📉';
      const priceStr = c.name === 'Bitcoin' ? `$${Number(c.price).toLocaleString()}` : `$${Number(c.price).toLocaleString(undefined, {minimumFractionDigits: 2})}`;
      text += `${emoji} ${c.name}: ${priceStr} (${c.dayChange >= 0 ? '+' : ''}${Number(c.dayChange).toFixed(2)}%)\n`;
    });
  }
  
  return text || 'Market data unavailable';
}

// === DEBUG FUNCTION ===
function debugCommodityAPI() {
  Logger.log('=== Naver Metals (Gold, Silver) ===');
  try {
    const metalsUrl = 'https://stock.naver.com/api/polling/marketindex/metals/GCcv1,SIcv1';
    const resp = UrlFetchApp.fetch(metalsUrl, { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } });
    Logger.log(`Status: ${resp.getResponseCode()}`);
    const json = JSON.parse(resp.getContentText());
    (json.datas || []).forEach(item => {
      Logger.log(`${item.name} (${item.reutersCode}):`);
      Logger.log(`  closePrice: ${item.closePrice}`);
      Logger.log(`  fluctuationsRatio: ${item.fluctuationsRatio}%`);
      Logger.log(`  fluctuations: ${item.fluctuations}`);
      Logger.log(`  compareToPreviousClosePrice: ${item.compareToPreviousClosePrice}`);
    });
  } catch (e) {
    Logger.log(`Error: ${e.message}`);
  }
  
  Logger.log('');
  Logger.log('=== Naver Energy (WTI Oil) ===');
  try {
    const oilUrl = 'https://stock.naver.com/api/polling/marketindex/energy/CLcv1';
    const resp = UrlFetchApp.fetch(oilUrl, { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } });
    Logger.log(`Status: ${resp.getResponseCode()}`);
    const json = JSON.parse(resp.getContentText());
    (json.datas || []).forEach(item => {
      Logger.log(`${item.name} (${item.reutersCode}):`);
      Logger.log(`  closePrice: ${item.closePrice}`);
      Logger.log(`  fluctuationsRatio: ${item.fluctuationsRatio}%`);
      Logger.log(`  fluctuations: ${item.fluctuations}`);
    });
  } catch (e) {
    Logger.log(`Error: ${e.message}`);
  }
  
  Logger.log('');
  Logger.log('=== Yahoo Bitcoin ===');
  try {
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?range=1d&interval=1d';
    const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } });
    Logger.log(`Status: ${resp.getResponseCode()}`);
    if (resp.getResponseCode() === 200) {
      const json = JSON.parse(resp.getContentText());
      const meta = json.chart?.result?.[0]?.meta;
      if (meta) {
        Logger.log(`Current Price: ${meta.regularMarketPrice}`);
        Logger.log(`Previous Close: ${meta.previousClose}`);
        const change = ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100;
        Logger.log(`Calculated Change: ${change.toFixed(2)}%`);
      }
    }
  } catch (e) {
    Logger.log(`Error: ${e.message}`);
  }
}

function v110_sendToSlack(message) {
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
}

function v110_sendErrorToSlack(error) {
  const message = {
    blocks: [
      {type: 'header', text: {type: 'plain_text', text: '❌ System Error'}},
      {type: 'section', text: {type: 'mrkdwn', text: `*Error Detail:* ${v110_truncate(error.toString(), 500)}`}},
      {type: 'context', elements: [{type: 'mrkdwn', text: 'Daily BIZ News Agent 🤖 v11.0'}]}
    ]
  };
  try { v110_sendToSlack(message); } catch (e) {}
}

// ==================== TRIGGERS ====================

function v110_testScript() {
  Logger.log('🧪 Testing v11.0 - Robust & Diverse Insights...\n');
  v110_sendDailyNewsSummary();
  Logger.log('\n✅ Test complete!');
}

function v110_createDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'v110_sendDailyNewsSummary' || t.getHandlerFunction() === 'v109_sendDailyNewsSummary') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('v110_sendDailyNewsSummary').timeBased().atHour(8).everyDays(1).create();
  Logger.log('✅ Daily trigger created for 8:00 AM');
}