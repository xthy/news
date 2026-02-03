/**
 * Global Headlines Summary - Version 10.9
 * Longer Fact-Based Insights with Implications
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
  REQUIRED_MIN_INSIGHTS: 6,
  REQUIRED_MAX_INSIGHTS: 8,
  
  STAGE1_CANDIDATES: 50,
  STAGE2_PERPLEXITY: 20,
  STAGE3_FINAL: 10,
  
  SIMILARITY_THRESHOLD: 0.5,
  INSIGHT_SIMILARITY_THRESHOLD: 0.4,
  MIN_SOURCE_DIVERSITY: 5,
  
  MARKET_SYMBOLS: {
    US_STOCKS: ['^GSPC', '^DJI', '^IXIC'],
    KOREA_STOCKS: ['^KS11', '^KQ11'],
    COMMODITIES: ['GC=F', 'CL=F', 'BTC-USD'],
    FX_RATES: ['KRW=X', 'EURKRW=X', 'JPYKRW=X']
  }
};

// ==================== NEWS SOURCES (Same as v10.8) ====================
// [All NEWS_SOURCEX same as before]

const NEWS_SOURCEX = [
  {name: 'WSJ - World', url: 'https://feeds.content.dowjones.io/public/rss/RSSWorldNews', section: 'intl', tier: 1},
  {name: 'WSJ - Markets', url: 'https://feeds.content.dowjones.io/public/rss/RSSMarketsMain', section: 'intl', tier: 1},
  {name: 'WSJ - Business', url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml', section: 'intl', tier: 1},
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
  {name: '조선일보 산업', url: 'https://www.chosun.com/arc/outboundfeeds/rss/category/industry/?outputType=xml', section: 'korea', tier: 1},
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
  {name: 'Korea Breaking', url: 'https://news.google.com/rss/search?q=korea+속보+OR+긴급+when:24h&hl=ko&gl=KR&ceid=KR:ko', section: 'korea', tier: 1},
  {name: 'Korea Times', url: 'https://news.google.com/rss/search?q=korea+business+OR+samsung+OR+hyundai+when:24h&hl=en-US&gl=US&ceid=US:en', section: 'korea', tier: 2}
];

// ==================== MAIN FUNCTION ====================

// Alias functions to match the README
function sendDailyNewsSummary() {
  v109_sendDailyNewsSummary();
}

function v109_sendDailyNewsSummary() {
  try {
    Logger.log('🚀 v10.9 -  Insights\n');

    const allArticles = v109_fetchAllNews();
    Logger.log(`\n📰 Collected: ${allArticles.length} articles`);
    
    v109_validate24HourWindow(allArticles);

    const intlArticles = v109_processWithGuarantee(
      allArticles.filter(a => a.section === 'intl'),
      CONFIG.REQUIRED_INTL_ARTICLES,
      'intl'
    );
    Logger.log(`\n✅ International: ${intlArticles.length}/${CONFIG.REQUIRED_INTL_ARTICLES}`);
    v109_logSourceDistribution(intlArticles, 'International');

    const intlTopics = v109_extractTopics(intlArticles);
    Logger.log(`   → International topics: ${intlTopics.join(', ')}`);

    const koreaArticles = v109_processWithGuarantee(
      allArticles.filter(a => a.section === 'korea'),
      CONFIG.REQUIRED_KOREA_ARTICLES,
      'korea',
      intlTopics
    );
    Logger.log(`\n✅ Korea: ${koreaArticles.length}/${CONFIG.REQUIRED_KOREA_ARTICLES}`);
    v109_logSourceDistribution(koreaArticles, 'Korea');

    const marketData = v109_fetchMarketData();
    Logger.log('\n📊 Market data fetched');

    const aiSummary = v109_generateExecutiveInsights(intlArticles, koreaArticles, marketData);
    Logger.log(`\n🤖 Insights: ${aiSummary.insights.length}/${CONFIG.REQUIRED_MIN_INSIGHTS}-${CONFIG.REQUIRED_MAX_INSIGHTS}`);

    const message = v109_formatSlackMessage(aiSummary, intlArticles, koreaArticles, marketData);
    v109_sendToSlack(message);

    Logger.log('\n✅ SUCCESS! Fact-based insights.');

  } catch (error) {
    Logger.log('\n❌ ERROR: ' + error.toString());
    v109_sendErrorToSlack(error);
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

function v109_generateExecutiveInsights(intlArticles, koreaArticles, marketData) {
  if (!CONFIG.OPENAI_API_KEY) return { insights: [] };

  if (!intlArticles || !Array.isArray(intlArticles)) intlArticles = [];
  if (!koreaArticles || !Array.isArray(koreaArticles)) koreaArticles = [];
  
  if (intlArticles.length === 0 && koreaArticles.length === 0) return { insights: [] };

  const attempts = [
    { minLen: 100, maxLen: 200, temp: 0.3 },
    { minLen: 80, maxLen: 220, temp: 0.4 },
    { minLen: 70, maxLen: 250, temp: 0.5 }
  ];

  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    Logger.log(`   → Insights attempt ${i + 1}/${attempts.length} (temp=${attempt.temp})`);
    
    const result = v109_generateFactBasedInsights(intlArticles, koreaArticles, marketData, attempt);
    
    if (result.insights && result.insights.length > 0) {
      Logger.log(`     ✓ Generated ${result.insights.length} raw insights`);
      
      const deduplicated = v109_deduplicateInsights(result.insights);
      
      if (deduplicated.length >= CONFIG.REQUIRED_MIN_INSIGHTS) {
        Logger.log(`   ✓ SUCCESS: ${deduplicated.length} unique insights`);
        return { insights: deduplicated };
      } else {
        Logger.log(`     ⚠️ Only ${deduplicated.length} insights after dedup`);
      }
    } else {
      Logger.log(`     ✗ No insights generated`);
    }
  }

  Logger.log('   ❌ All attempts failed - returning empty');
  return { insights: [] };
}

function v109_generateFactBasedInsights(intlArticles, koreaArticles, marketData, params) {
  try {
    const intlContext = intlArticles.map((a, i) => {
      let context = `${i + 1}. [${a.source}] ${a.title}`;
      if (a.aiReasoning) context += `\n   분석: ${a.aiReasoning}`;
      if (a.keyFacts) context += `\n   핵심: ${a.keyFacts}`;
      return context;
    }).join('\n\n');

    const koreaContext = koreaArticles.map((a, i) => {
      let context = `${i + 1}. [${a.source}] ${a.title}`;
      if (a.aiReasoning) context += `\n   분석: ${a.aiReasoning}`;
      if (a.keyFacts) context += `\n   핵심: ${a.keyFacts}`;
      return context;
    }).join('\n\n');

    const marketContext = v109_formatMarketContextForAI(marketData);

    const prompt = `당신은 한국 비즈니스 임원을 위한 아침 브리핑을 작성하는 senior analyst입니다.

=== 시장 데이터 (이미 제공됨 - 중복 금지!) ===
${marketContext}

=== 국제 헤드라인 ===
${intlContext || '없음'}

=== 한국 헤드라인 ===
${koreaContext || '없음'}

**중요: 정확히 ${CONFIG.REQUIRED_MAX_INSIGHTS}개의 fact-based 인사이트를 작성하세요.**

⭐ **CRITICAL RULES:**

1. **길이: 100-200자 (2-3문장)**
   - 구조: **핵심 사실** + **구체적 수치/맥락** + **시사점**
   - 예: "정부가 ETF 배수 규제를 완화하며 레버리지 3배 상품까지 허용한다. 개인투자자의 고위험 상품 접근성이 높아지는 동시에 시장 변동성 확대가 예상된다."

2. **Fact-based (사실 중심)**
   - 구체적 수치, 날짜, 비율, 금액 포함
   - "정부", "한은", "Fed", "삼성", "현대" 등 주체 명확히
   - 모호한 표현 금지: "상당한", "많은", "일부"
   
   ✅ "현대차가 미국 시장 점유율 11.3%를 기록하며 4위를 차지했다"
   ❌ "현대차가 미국 시장에서 좋은 성과를 거뒀다"

3. **시사점 언급 (but "이는..." 금지!)**
   
   ✅ 좋은 시사점 표현:
   - "...전망이다"
   - "...예상된다"
   - "...영향을 미칠 것으로 보인다"
   - "...가능성이 커졌다"
   - 새 문장으로 시작: "금융시장 변동성이 확대될 전망이다"
   
   ❌ 절대 금지:
   - "이는 ~을 의미한다"
   - "이는 ~에 영향을 미친다"
   - "투자자 입장에서..."
   - "시장 참여자들은..."

4. **각 인사이트 = 완전히 다른 주제**
   - 대만/TSMC = 1개만
   - Fed/트럼프 = 1개만
   - 반도체 = 1개만

5. **Executive-Level Only**
   ✅ 포함: 정책 발표, M&A, 지수 milestone, 산업 영향, 지정학
   ❌ 제외: 금속 가격, 지역 정책, 일일 변동, 시장 데이터 중복

**우수 사례 (100-200자):**

✅ "정부가 ETF 종목과 레버리지 배수 규제를 완화해 개인의 고위험 상품 접근을 허용한다. 레버리지 3배 상품까지 거래 가능해지며, 파생상품 시장 확대와 함께 변동성이 커질 전망이다." (93자)

✅ "한은이 미국의 추가 금리 인하 가능성을 언급하며 한미 금리차 축소를 전망했다. 원화 환율 안정과 국내 통화정책 완화 여지가 커질 것으로 보이며, 외환시장 변동성은 줄어들 전망이다." (96자)

✅ "현대차그룹이 2024년 미국 시장 점유율 11.3%를 기록하며 역대 최고치를 달성했다. 토요타, GM, 포드에 이어 4위를 차지하며 글로벌 경쟁력을 입증했고, 북미 시장 확대가 지속될 전망이다." (100자)

✅ "삼성과 SK하이닉스가 강유전체 메모리 특허 출원에서 1위를 차지하며 AI 메모리 경쟁을 주도하고 있다. 차세대 반도체 기술 선점으로 글로벌 시장 지배력이 강화될 것으로 예상된다." (90자)

✅ "주요 은행들이 주택담보대출 금리를 0.15%p 인상하며 가계 대출 부담이 커졌다. 연초부터 시작된 금리 인상으로 주담대 상환 압박이 심화되고, 부동산 시장 위축이 우려된다." (88자)

✅ "트럼프가 그린란드 매입 협상이 진행되지 않으면 유럽 국가들에 10% 관세를 부과하겠다고 밝혔다. EU는 긴급 대사회의를 소집했으며, 대서양 무역 긴장이 고조될 가능성이 커졌다." (96자)

**나쁜 사례:**

❌ "정부가 ETF 규제를 완화했다." (너무 짧음, 16자)

❌ "정부가 ETF 규제를 완화해 투자자들이 더 많은 선택을 할 수 있게 됐다. 이는 시장 활성화를 의미한다." ("이는..." 사용 금지!)

❌ "투자자 입장에서 볼 때 ETF 규제 완화는 긍정적이다." (주관적, "투자자 입장" 금지)

JSON 형식 (반드시 이 형식으로):
{
  "insights": [
    "fact-based 인사이트 1 (100-200자, 2-3문장)",
    "fact-based 인사이트 2 (100-200자, 2-3문장)",
    "fact-based 인사이트 3 (100-200자, 2-3문장)",
    "fact-based 인사이트 4 (100-200자, 2-3문장)",
    "fact-based 인사이트 5 (100-200자, 2-3문장)",
    "fact-based 인사이트 6 (100-200자, 2-3문장)",
    "fact-based 인사이트 7 (100-200자, 2-3문장)",
    "fact-based 인사이트 8 (100-200자, 2-3문장)"
  ]
}`;

    Logger.log(`     → Calling GPT (temp=${params.temp})...`);
    const response = v109_callGPT(prompt, 4096, params.temp);
    
    Logger.log(`     → Got response: ${response.length} chars`);
    
    const summary = v109_extractJSON(response);
    
    if (!summary || !summary.insights || !Array.isArray(summary.insights)) {
      Logger.log(`     ✗ Invalid response structure`);
      return { insights: [] };
    }
    
    const validInsights = summary.insights.filter(i => {
      if (!i || typeof i !== 'string') return false;
      const len = i.length;
      const isValid = len >= params.minLen && len <= params.maxLen;
      if (!isValid) {
        Logger.log(`     ⚠️ Invalid length (${len}): "${i.substring(0, 50)}..."`);
      }
      return isValid;
    });
    
    Logger.log(`     → Valid insights: ${validInsights.length}/${summary.insights.length}`);
    
    return { insights: validInsights };

  } catch (error) {
    Logger.log(`     ❌ Insights error: ${error.toString()}`);
    return { insights: [] };
  }
}

// ==================== DEDUPLICATION & JSON EXTRACTION (Same as v10.8) ====================

function v109_deduplicateInsights(insights) {
  if (!insights || insights.length === 0) return [];
  
  Logger.log(`   🔍 Deduplicating ${insights.length} insights...`);
  
  const unique = [];
  
  for (const insight of insights) {
    let isDuplicate = false;
    
    for (const existing of unique) {
      const similarity = v109_calculateInsightSimilarity(insight, existing);
      
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

function v109_calculateInsightSimilarity(str1, str2) {
  const extractKeyEntities = (str) => {
    const entities = [];
    const majorEntities = [
      '대만', 'taiwan', 'tsmc',
      '반도체', 'semiconductor', 'chip',
      '삼성', 'samsung', 'sk하이닉스', 'sk',
      '미국', 'usa', 'america',
      '무관세', 'tariff', '관세',
      '투자', 'investment',
      '코스피', 'kospi',
      'fed', '연준', 'powell', '파월',
      '트럼프', 'trump',
      '러시아', 'russia', '우크라이나', 'ukraine',
      '중국', 'china',
      'etf', '규제', 'regulation',
      '현대차', 'hyundai',
      '환율', 'exchange rate'
    ];
    
    const lower = str.toLowerCase();
    majorEntities.forEach(entity => {
      if (lower.includes(entity)) {
        entities.push(entity);
      }
    });
    
    return entities;
  };
  
  const entities1 = extractKeyEntities(str1);
  const entities2 = extractKeyEntities(str2);
  
  if (entities1.length === 0 || entities2.length === 0) return 0;
  
  const shared = entities1.filter(e => entities2.includes(e)).length;
  const total = new Set([...entities1, ...entities2]).size;
  
  if (shared >= 2) {
    return 0.8;
  }
  
  return shared / total;
}

function v109_extractJSON(response) {
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

// ==================== ALL OTHER FUNCTIONS (Copy from v10.8, rename v108 → v109) ====================
// I'll include the essential ones below for completeness:

function v109_extractTopics(articles) {
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

function v109_validate24HourWindow(articles) {
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

function v109_logSourceDistribution(articles, sectionName) {
  const sourceCounts = {};
  articles.forEach(a => sourceCounts[a.source] = (sourceCounts[a.source] || 0) + 1);
  const uniqueSources = Object.keys(sourceCounts).length;
  Logger.log(`   📊 ${sectionName} Source Distribution:`);
  Logger.log(`      Unique sources: ${uniqueSources}`);
  Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).forEach(([source, count]) => {
    Logger.log(`      - ${source}: ${count}`);
  });
}

function v109_removeDuplicatesAggressive(articles) {
  Logger.log(`   🔍 Aggressive deduplication: ${articles.length} articles`);
  const unique = [];
  const seen = new Set();
  for (const article of articles) {
    const normalized = article.title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    if (seen.has(normalized)) continue;
    let isDuplicate = false;
    for (const existing of unique) {
      const similarity = v109_calculateEnhancedSimilarity(article.title, existing.title);
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

function v109_calculateEnhancedSimilarity(str1, str2) {
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

function v109_ensureSourceDiversity(articles, requiredCount) {
  if (articles.length <= requiredCount) return articles;
  const sourceCounts = {};
  const selected = [];
  const remaining = [...articles];
  while (selected.length < requiredCount && remaining.length > 0) {
    let bestIdx = 0;
    let minCount = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const source = remaining[i].source;
      const count = sourceCounts[source] || 0;
      if (count < minCount) {
        minCount = count;
        bestIdx = i;
      }
    }
    const article = remaining.splice(bestIdx, 1)[0];
    selected.push(article);
    sourceCounts[article.source] = (sourceCounts[article.source] || 0) + 1;
  }
  const uniqueSources = Object.keys(sourceCounts).length;
  Logger.log(`   → Source diversity: ${uniqueSources} unique sources in ${selected.length} articles`);
  return selected;
}

function v109_processWithGuarantee(articles, requiredCount, sectionType, intlTopics = []) {
  Logger.log(`\n🎯 Processing ${sectionType} - GUARANTEE ${requiredCount}`);
  Logger.log(`   Input: ${articles.length} articles`);
  if (articles.length === 0) return [];
  articles.forEach(a => a.score = v109_headlineScore(a, sectionType, intlTopics));
  articles.sort((a, b) => b.score - a.score);
  let filtered = v109_removeDuplicatesAggressive(articles);
  filtered = filtered.filter(a => a.score > 0);
  Logger.log(`   → After filter: ${filtered.length} articles`);
  if (filtered.length < requiredCount) {
    Logger.log(`   ⚠️ Insufficient articles (${filtered.length} < ${requiredCount})`);
    return filtered.slice(0, requiredCount);
  }
  const candidates = filtered.slice(0, CONFIG.STAGE1_CANDIDATES);
  let analyzed = v109_perplexityAnalysis(candidates, sectionType);
  if (analyzed.length < CONFIG.STAGE2_PERPLEXITY) {
    Logger.log(`   ⚠️ Perplexity insufficient, using top ${CONFIG.STAGE2_PERPLEXITY}`);
    analyzed = candidates.slice(0, CONFIG.STAGE2_PERPLEXITY);
  }
  let final = v109_gptFinalCuration(analyzed, sectionType, requiredCount);
  if (final.length < requiredCount) {
    Logger.log(`   ⚠️ GPT insufficient, backfilling`);
    const used = new Set(final.map(a => a.title));
    const backfill = analyzed.filter(a => !used.has(a.title)).slice(0, requiredCount - final.length);
    final = [...final, ...backfill];
  }
  final = v109_ensureSourceDiversity(final, requiredCount);
  final = final.slice(0, requiredCount);
  Logger.log(`   → Final: ${final.length} (GUARANTEED)`);
  return final;
}

function v109_headlineScore(article, sectionType, intlTopics = []) {
  let score = article.sourceTier === 1 ? 40 : 20;
  const text = (article.title + ' ' + article.description).toLowerCase();
  const title = article.title.toLowerCase();
  const source = article.source.toLowerCase();
  if (source.includes('wsj') || source.includes('ft')) score += 15;
  else if (source.includes('bloomberg') || source.includes('economist')) score += 12;
  else if (source.includes('nyt') || source.includes('reuters')) score += 10;
  const columnKeywords = ['칼럼', 'column', '[칼럼]', '오피니언', 'opinion', '[오피니언]', '기고', 'editorial', 'commentary', '데스크', '[데스크]', 'op-ed', '사설', '논평', '기자수첩', '취재수첩'];
  for (const kw of columnKeywords) {
    if (text.includes(kw) || title.includes(kw)) return -1000;
  }
  const excludeKeywords = ['sport', 'football', 'soccer', 'baseball', 'basketball', 'k-pop', 'kpop', 'celebrity', 'entertainment', 'hollywood', 'movie', 'actor', 'actress', 'netflix', 'grammy', 'oscar', '연예', '드라마', '영화', '가수', '배우'];
  for (const kw of excludeKeywords) {
    if (text.includes(kw)) return -1000;
  }
  const trivialKeywords = ['환율 종가', '환율 마감', '달러 환율', '원 오른', '원 내린', '원 상승', '원 하락', '통장', '적금', '예금', '넣으면', '받는', '월 50만', '월50만', '목돈', '특판', '중과세', '다주택자', '양도세', '취득세', '인구감소지역', '비규제지역', '응찰', '입찰', '계약', '공사비', '금 가격', '은 가격', '동 가격', '최고가 찍', '사상 최대', '사상 최고', '동시에 최고가', '특별시', '광역시', '인센티브', '공기관 이전', '지원금', '보조금', '가이드', '방법', '어떻게', '팁'];
  for (const kw of trivialKeywords) {
    if (title.includes(kw)) {
      const majorKeywords = ['정부', '금융위', '기재부', '금리', '정책', '법', '규제', '대통령', '장관', 'fed', '중앙은행'];
      let hasMajor = false;
      for (const major of majorKeywords) {
        if (title.includes(major)) {
          hasMajor = true;
          break;
        }
      }
      if (!hasMajor) return -1000;
    }
  }
  if (sectionType === 'korea') {
    for (const topic of intlTopics) {
      if (title.includes(topic)) return -1000;
    }
    const foreignOnly = ['openai', 'chatgpt', 'gpt-4', 'claude', 'google', '구글', 'apple', '애플', 'meta', '메타', 'amazon', '아마존', 'microsoft', '마이크로소프트', 'tesla', '테슬라', 'nvidia', '엔비디아', 'trump', '트럼프', 'biden', '바이든', 'putin', '푸틴', '캐나다', 'canada', '독일', 'germany', '영국', 'uk', '포르쉐', 'porsche', 'bmw', '벤츠', 'mercedes'];
    let hasForeign = false;
    for (const entity of foreignOnly) {
      if (title.includes(entity)) {
        hasForeign = true;
        break;
      }
    }
    if (hasForeign) {
      const koreaKeywords = ['삼성', 'samsung', 'sk', 'sk하이닉스', '현대', 'hyundai', '한국', '국내', '서울', '정부', '금융위', '공정위', '대', 'vs', '비교', '영향', '진출', '협력'];
      let hasKoreaRelevance = false;
      for (const kw of koreaKeywords) {
        if (title.includes(kw)) {
          hasKoreaRelevance = true;
          break;
        }
      }
      if (!hasKoreaRelevance) return -1000;
    }
    const foreignMarkets = ['중국서', '중국 시장', '미국 시장', '일본 시장', '유럽 시장'];
    for (const market of foreignMarkets) {
      if (title.includes(market)) {
        if (!title.includes('한국') && !title.includes('국내') && !title.includes('삼성') && !title.includes('sk') && !title.includes('현대')) {
          return -1000;
        }
      }
    }
  }
  const hoursAgo = (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60);
  if (hoursAgo < 3) score += 15;
  else if (hoursAgo < 6) score += 10;
  else if (hoursAgo < 12) score += 5;
  if (sectionType === 'intl') {
    const majorKeywords = ['breaking', 'urgent', 'crisis', 'war', 'strike', 'fed', 'ecb', 'boj', 'rate', 'inflation', 'recession', 'tariff', 'sanctions', 'trade war', 'china', 'russia', 'ukraine', 'taiwan', 'iran', 'trump', 'biden', 'powell', 'apple', 'microsoft', 'nvidia', 'tesla', 'openai'];
    majorKeywords.forEach(kw => {
      if (text.includes(kw)) score += 12;
    });
  }
  if (sectionType === 'korea') {
    const majorKeywords = ['kospi', 'kosdaq', '4800', '5000', '사상', '최고', '최저', '금리', '기준금리', '정책', '규제', '법안', '정부', '금융위', '공정위', '기재부', '삼성', 'samsung', 'sk하이닉스', '현대', 'hyundai', '반도체', '배터리', '자동차', '조선', '철강', '수출', '무역', '환율', 'gdp', '성장률', '인수', '합병', 'm&a', '구조조정', '상장'];
    majorKeywords.forEach(kw => {
      if (text.includes(kw)) score += 12;
    });
  }
  return score;
}

function v109_callPerplexity(prompt, maxTokens = 1000) {
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

function v109_callGPT(prompt, maxTokens = 4096, temperature = 0.3) {
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
  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());
  if (json.error) throw new Error(json.error.message);
  return json.choices[0].message.content.trim();
}

function v109_perplexityAnalysis(articles, sectionType) {
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
    const response = v109_callPerplexity(prompt, 2000);
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

function v109_gptFinalCuration(articles, sectionType, requiredCount) {
  if (!CONFIG.OPENAI_API_KEY || articles.length === 0) return articles.slice(0, requiredCount);
  try {
    const articleList = articles.map((a, i) => {
      const reasoning = a.aiReasoning ? `\n   ${a.aiReasoning}` : '';
      return `${i}. [${a.source}] ${a.title}${reasoning}`;
    }).join('\n\n');
    const prompt = `Select ${requiredCount} most critical HEADLINES. Avoid duplicates.\n\nArticles:\n${articleList}\n\nReturn JSON array: [3, 7, 1, ...]`;
    const response = v109_callGPT(prompt, 300);
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

function v109_fetchAllNews() {
  const allArticles = [];
  const cutoffTime = new Date(Date.now() - CONFIG.NEWS_HOURS_BACK * 60 * 60 * 1000);
  NEWS_SOURCEX.forEach(source => {
    try {
      let articles = v109_fetchRSS(source);
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

function v109_fetchRSS(source) {
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
        let link = v109_getText(item, 'link');
        if (!link) {
          const linkEl = item.getChild('link');
          if (linkEl) link = linkEl.getAttribute('href')?.getValue() || linkEl.getText();
        }
        const title = v109_cleanTitle(v109_getText(item, 'title'));
        if (!title || title.length < 20) return;
        articles.push({
          source: v109_extractSource(source.name, link),
          title: v109_deepClean(title),
          link: v109_deepClean(link),
          description: v109_cleanDesc(v109_getText(item, 'description') || v109_getText(item, 'summary')),
          publishedAt: v109_parseDate(v109_getText(item, 'pubDate') || v109_getText(item, 'published')),
          score: 0
        });
      } catch (e) {}
    });
    return articles;
  } catch (error) {
    return [];
  }
}

function v109_getText(element, childName) {
  const child = element.getChild(childName);
  return child ? child.getText() : null;
}

function v109_extractSource(feedName, link) {
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

function v109_cleanTitle(title) {
  if (!title) return '';
  return title.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').replace(/ - [\w\s\.\-&]+(\.com|\.net)$/gi, '').replace(/ \| .*$/, '').trim();
}

function v109_cleanDesc(desc) {
  if (!desc) return '';
  return desc.replace(/<[^>]*>/g, '').trim();
}

function v109_parseDate(dateStr) {
  return dateStr ? new Date(dateStr) : new Date();
}

function v109_deepClean(text) {
  if (!text) return '';
  return text.replace(/[\r\n\u2028\u2029]+/g, ' ').replace(/%0[A-D]/gi, ' ').replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
}

function v109_fetchMarketData() {
  return {
    usStocks: v109_fetchStockData(CONFIG.MARKET_SYMBOLS.US_STOCKS),
    koreaStocks: v109_fetchStockData(CONFIG.MARKET_SYMBOLS.KOREA_STOCKS),
    commodities: v109_fetchStockData(CONFIG.MARKET_SYMBOLS.COMMODITIES),
    fxRates: v109_fetchFXRates(CONFIG.MARKET_SYMBOLS.FX_RATES)
  };
}

function v109_fetchFXRates(symbols) {
  const data = [];
  const names = {'KRW=X': 'USD/KRW', 'EURKRW=X': 'EUR/KRW', 'JPYKRW=X': 'JPY/KRW'};
  symbols.forEach(symbol => {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`;
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      if (response.getResponseCode() !== 200) return;
      const json = JSON.parse(response.getContentText());
      const result = json.chart.result[0];
      const meta = result.meta;
      const quotes = result.indicators.quote[0];
      const allPrices = quotes.close.filter(p => p != null);
      const currentPrice = meta.regularMarketPrice || allPrices[allPrices.length - 1];
      const previousClose = meta.previousClose || allPrices[allPrices.length - 2];
      const dayChange = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
      const weekChange = allPrices.length >= 5 ? ((allPrices[allPrices.length - 1] - allPrices[allPrices.length - 5]) / allPrices[allPrices.length - 5]) * 100 : 0;
      data.push({ symbol: symbol, name: names[symbol] || symbol, price: currentPrice, dayChange: dayChange, weekChange: weekChange });
    } catch (e) {}
  });
  return data;
}

function v109_fetchStockData(symbols) {
  const data = [];
  symbols.forEach(symbol => {
    try {
      const result = v109_fetchYahoo(symbol);
      if (result) data.push(result);
    } catch (e) {}
  });
  return data;
}

function v109_fetchYahoo(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d`;
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) return null;
    const json = JSON.parse(response.getContentText());
    const result = json.chart.result[0];
    const meta = result.meta;
    const quotes = result.indicators.quote[0];
    const allPrices = quotes.close.filter(p => p != null);
    const currentPrice = meta.regularMarketPrice || allPrices[allPrices.length - 1];
    const previousClose = meta.previousClose || allPrices[allPrices.length - 2];
    const dayChange = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
    const weekChange = allPrices.length >= 5 ? ((allPrices[allPrices.length - 1] - allPrices[allPrices.length - 5]) / allPrices[allPrices.length - 5]) * 100 : 0;
    const names = {
      '^GSPC': 'S&P 500', '^DJI': 'Dow Jones', '^IXIC': 'NASDAQ',
      '^KS11': 'KOSPI', '^KQ11': 'KOSDAQ',
      'GC=F': 'Gold', 'CL=F': 'Oil (WTI)', 'BTC-USD': 'Bitcoin'
    };
    return {
      symbol: symbol,
      name: names[symbol] || symbol,
      price: currentPrice,
      dayChange: dayChange,
      weekChange: weekChange
    };
  } catch (e) {
    return null;
  }
}

function v109_formatMarketContextForAI(marketData) {
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

function v109_formatSlackMessage(aiSummary, intlArticles, koreaArticles, marketData) {
  const blocks = [];
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  blocks.push({type: 'header', text: {type: 'plain_text', text: '📰 Global Business Brief', emoji: true}});
  blocks.push({type: 'divider'});
  blocks.push({type: 'header', text: {type: 'plain_text', text: '📊 Market Snapshot', emoji: true}});
  blocks.push({type: 'section', text: {type: 'mrkdwn', text: v109_truncate(v109_formatMarketData(marketData), 2900)}});
  blocks.push({type: 'divider'});
  if (aiSummary.insights && aiSummary.insights.length > 0) {
    blocks.push({type: 'header', text: {type: 'plain_text', text: '🎯 Executive Insights', emoji: true}});
    const insightsText = aiSummary.insights.map((i, idx) => `${idx + 1}. ${v109_truncate(i, 400)}`).join('\n\n');
    blocks.push({type: 'section', text: {type: 'mrkdwn', text: v109_truncate(insightsText, 2900)}});
    blocks.push({type: 'divider'});
  }
  if (intlArticles && intlArticles.length > 0) {
    blocks.push({type: 'header', text: {type: 'plain_text', text: '🌍 International', emoji: true}});
    const intlText = intlArticles.map((a, i) => `${i + 1}. <${v109_truncate(a.link, 400)}|${v109_truncate(a.title, 250)}>`).join('\n');
    blocks.push({type: 'section', text: {type: 'mrkdwn', text: v109_truncate(intlText, 2900)}});
    blocks.push({type: 'divider'});
  }
  if (koreaArticles && koreaArticles.length > 0) {
    blocks.push({type: 'header', text: {type: 'plain_text', text: '🇰🇷 Korea', emoji: true}});
    const koreaText = koreaArticles.map((a, i) => `${i + 1}. <${v109_truncate(a.link, 400)}|${v109_truncate(a.title, 250)}>`).join('\n');
    blocks.push({type: 'section', text: {type: 'mrkdwn', text: v109_truncate(koreaText, 2900)}});
    blocks.push({type: 'divider'});
  }
  const total = (intlArticles?.length || 0) + (koreaArticles?.length || 0);
  blocks.push({type: 'context', elements: [{type: 'mrkdwn', text: `Daily BIZ News Agent 🤖 v10.9 | ${total} articles`}]});
  return {blocks: blocks};
}

function v109_truncate(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

function v109_formatMarketData(marketData) {
  let text = '';
  if (marketData.usStocks && marketData.usStocks.length > 0) {
    text += '*US Markets*\n';
    marketData.usStocks.forEach(s => {
      const emoji = s.dayChange >= 0 ? '📈' : '📉';
      text += `${emoji} ${s.name}: ${s.price.toFixed(2)} (${s.dayChange.toFixed(2)}% | WoW ${s.weekChange.toFixed(2)}%)\n`;
    });
    text += '\n';
  }
  if (marketData.koreaStocks && marketData.koreaStocks.length > 0) {
    text += '*Korea Markets*\n';
    marketData.koreaStocks.forEach(s => {
      const emoji = s.dayChange >= 0 ? '📈' : '📉';
      text += `${emoji} ${s.name}: ${s.price.toFixed(2)} (${s.dayChange.toFixed(2)}% | WoW ${s.weekChange.toFixed(2)}%)\n`;
    });
    text += '\n';
  }
  if (marketData.fxRates && marketData.fxRates.length > 0) {
    text += '*FX Rates*\n';
    marketData.fxRates.forEach(fx => {
      const emoji = fx.dayChange >= 0 ? '📈' : '📉';
      text += `${emoji} ${fx.name}: ${fx.price.toFixed(2)} (${fx.dayChange.toFixed(2)}% | WoW ${fx.weekChange.toFixed(2)}%)\n`;
    });
    text += '\n';
  }
  if (marketData.commodities && marketData.commodities.length > 0) {
    text += '*Commodities & Crypto*\n';
    marketData.commodities.forEach(c => {
      const emoji = c.dayChange >= 0 ? '📈' : '📉';
      const priceStr = c.name === 'Bitcoin' ? `$${c.price.toFixed(0)}` : `$${c.price.toFixed(2)}`;
      text += `${emoji} ${c.name}: ${priceStr} (${c.dayChange.toFixed(2)}% | WoW ${c.weekChange.toFixed(2)}%)\n`;
    });
  }
  return text || 'Market data unavailable';
}

function v109_sendToSlack(message) {
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

function v109_sendErrorToSlack(error) {
  const message = {
    blocks: [
      {type: 'header', text: {type: 'plain_text', text: '❌ Error'}},
      {type: 'section', text: {type: 'mrkdwn', text: `*Error:* ${v109_truncate(error.toString(), 500)}`}}
    ]
  };
  try { v109_sendToSlack(message); } catch (e) {}
}

// ==================== TRIGGERS ====================

function v109_testScript() {
  Logger.log('🧪 Testing v10.9 - Fact-Based Insights...\n');
  v109_sendDailyNewsSummary();
  Logger.log('\n✅ Test complete!');
}

function v109_createDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'v109_sendDailyNewsSummary') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('v109_sendDailyNewsSummary').timeBased().atHour(8).everyDays(1).create();
  Logger.log('✅ Daily trigger created for 8:00 AM');
}