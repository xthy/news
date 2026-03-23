// ===== 기본 설정 =====
var CLIENT_ID = typeof SECRETS !== 'undefined' ? SECRETS.NAVER_CLIENT_ID : 'YOUR_NAVER_CLIENT_ID';
var CLIENT_SECRET = typeof SECRETS !== 'undefined' ? SECRETS.NAVER_CLIENT_SECRET : 'YOUR_NAVER_CLIENT_SECRET';

// ===== GPT 설정 =====
var OPENAI_API_KEY = typeof SECRETS !== 'undefined' ? SECRETS.OPENAI_API_KEY : 'sk-your-openai-api-key-here';
var USE_GPT_DEDUPLICATION = true;

// ===== 슬랙 설정 =====
var SLACK_WEBHOOK_URL = typeof SECRETS !== 'undefined' ? SECRETS.SLACK_WEBHOOK_URL_NEWS : 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL';
var SEND_SLACK = true;
var SLACK_CHANNEL = '#news-run';

// ===== 다수 이메일 수신자 설정 =====
var EMAIL_RECIPIENT = "michaelkim@affinityequity.com, samuelkim@affinityequity.com, hyeonchoi@affinityequity.com, dhkim@affinityequity.com, cindychoi@affinityequity.com, davidkim@affinityequity.com, dhchoi@affinityequity.com, yhlee@affinityequity.com, jennyhwang@affinityequity.com, mschoi@affinityequity.com, seanlee@affinityequity.com, thyang@affinityequity.com";
var SEND_EMAIL = true;

// ===== 히스토리 설정 (외부 스프레드시트) =====
var HISTORY_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/18KrjCdEEcNJrmNRAV19nhwAoya9l65gzH3ypFYaRlHM/edit?usp=sharing';
var HISTORY_SHEET_NAME = '뉴스 히스토리';
var HISTORY_DAYS = 7;
var HISTORY_KEYWORD_THRESHOLD = 3;  // ⭐ 3개 유지 (2개는 너무 harsh)

// ===== 키워드 설정 =====
var KEYWORDS = [
  '버거킹', '팀홀튼', '맥도날드', 'kfc', '투썸플레이스',
  '현대커머셜', '유베이스', '서브원', '락앤락',
  '잡코리아', '알바몬', '사람인', '원티드', '토스알바', '당근알바', '리멤버컴퍼니',
  '요기요', '쿠팡이츠', '배달의민족', '배민', '땡겨요',
  'SK렌터카', '롯데렌탈', '롯데렌터카',
  '어피니티', '어피너티', 'mbk', 'kkr', 'cvc', 'blackstone', 'baincapital', 'imm', 'vig',
  '스틱인베', '스카이레이크', '글렌우드', 'eqt', '베인캐피탈', '베인캐피털', '블랙스톤', '알토스'
];

var KEYWORD_GROUPING = {
  '버거킹': 'BKR', '팀홀튼': 'BKR', '맥도날드': 'BKR', 'kfc': 'BKR', '투썸플레이스': 'BKR',
  '현대커머셜': 'HCI',
  '유베이스': 'UBase',
  '서브원': 'Serveone',
  '락앤락': 'Lock&Lock',
  '잡코리아': 'Worxphere', '알바몬': 'Worxphere', '사람인': 'Worxphere', '원티드': 'Worxphere',
  '토스알바': 'Worxphere', '당근알바': 'Worxphere', '리멤버컴퍼니': 'Worxphere',
  '요기요': 'YGY', '쿠팡이츠': 'YGY', '배달의민족': 'YGY', '배민': 'YGY', '땡겨요': 'YGY',
  'SK렌터카': 'SKR and LTR', '롯데렌탈': 'SKR and LTR', '롯데렌터카': 'SKR and LTR',
  '어피니티': 'Market', '어피너티': 'Market', 'mbk': 'Market', 'kkr': 'Market', 'cvc': 'Market',
  'blackstone': 'Market', 'baincapital': 'Market', 'imm': 'Market', 'vig': 'Market',
  '스틱인베': 'Market', '스카이레이크': 'Market', '글렌우드': 'Market', 'eqt': 'Market',
  '베인캐피탈': 'Market', '베인캐피털': 'Market', '블랙스톤': 'Market', '알토스': 'Market'
};

var NEWS_COUNT = 50;
var ENABLE_GOOGLE_NEWS = true;
var GOOGLE_NEWS_REGION = 'KR';
var GOOGLE_NEWS_LANGUAGE = 'ko';

// ===== PE 키워드 =====
var PE_FOCUSED_KEYWORDS = {
  'critical': ['실적', '매출', '순이익', '영업이익', '손실', '적자', '흑자', 'ipo', '상장', '인수', '합병', 'm&a', '매각', '펀딩', '투자유치', '밸류에이션', '엑시트'],
  'high': ['ceo', '대표', '사장', '회장', '경영진', '임원', '구조조정', '조직개편', '전략', '사업확장', '진출', '시장점유율', '1위', '선두'],
  'medium': ['성장률', '증가', '감소', '출시', '런칭', '신제품', '신서비스', '경쟁', '점유율', '수익성', '마진'],
  'risk': ['논란', '소송', '규제', '제재', '조사', '압수수색', '과징금', '제재금', '분쟁', '고발']
};

// ⭐ 강화된 제외 키워드 목록
var STRONG_EXCLUDE_KEYWORDS = [
  // 이벤트/프로모션
  '이벤트', '프로모션', '할인', '쿠폰', '광고', '마케팅', '홍보', '캠페인',
  // 사회공헌
  '사회공헌', '봉사', '기부', '후원', '나눔', '자선', 'csr',
  // 행사
  '워크샵', '세미나', '교육', '연수', '체험', '견학', '채용설명회',
  '시상식', '수상', '포상', '표창', '감사패', '브리핑', '발표회', '컨퍼런스', '포럼', '설명회', '간담회', '협약식', '서명식',
  // 연예/엔터
  '연예인', '아이돌', '가수', '배우', '드라마', '영화', '방송출연', '예능', '앨범', '콘서트', '팬미팅', '화보', '인터뷰', '뮤직비디오',
  // 당구
  'pba', '당구', '포켓볼', '3쿠션', '4구', '빌리어드',
  // 스포츠
  '야구', '축구', '농구', '배구', '골프', '테니스', '경기', '선수단', '감독', '코치',
  '우승', '준우승', '플레이오프', 'ps진출', '순위권', '포스트시즌', '결승전', '준결승', '토너먼트', '리그', '시즌', '스코어', '득점', '승부', '패배', '무승부'
];

// ⭐ 새로 추가: 라운드업/산업동향 기사 패턴
var ROUNDUP_PATTERNS = [
  /外.*이슈/i,          // "外(여기 유통 이슈)"
  /外.*동향/i,          // "外(업계 동향)"
  /등\s*\d+개사/i,      // "등 5개사"
  /등\s*\d+곳/i,        // "등 10곳"
  /[\s·]外$/,           // 끝이 "外"로 끝남
  /업계\s*(동향|이슈|소식)/i,
  /유통\s*(이슈|동향|소식)/i,
  /산업\s*(동향|이슈)/i,
  /\d+개\s*기업/i,      // "10개 기업"
  /주요\s*기업.*동향/i
];

// ⭐ 새로 추가: 여러 회사명 나열 감지용 회사 목록
var COMPANY_NAMES_FOR_ROUNDUP_DETECTION = [
  '현대백화점', '롯데백화점', '신세계', '이마트', '홈플러스', '코스트코',
  '하이트진로', 'CJ', '농심', '오뚜기', '풀무원', '동원',
  '삼성', 'LG', 'SK', '현대', '롯데', '신세계',
  '스타벅스', '투썸', '이디야', '할리스', '탐앤탐스',
  '맥도날드', 'kfc', '버거킹', '롯데리아', '맘스터치',
  'GS25', 'CU', '세븐일레븐', '이마트24', '미니스톱'
];

var KEYWORD_RELEVANCE_CHECK = {
  '버거킹': ['버거킹', 'bk', '햄버거'],
  '팀홀튼': ['팀홀튼', 'tim', 'hortons'],
  '맥도날드': ['맥도날드', 'mcdonald'],
  'kfc': ['kfc', '켄터키'],
  '투썸플레이스': ['투썸플레이스', 'twosome'],
  '현대커머셜': ['현대커머셜', '현대상용차'],
  '유베이스': ['유베이스', 'ubase'],
  '서브원': ['서브원', 'serveone'],
  '락앤락': ['락앤락', 'locknlock'],
  '잡코리아': ['잡코리아', 'jobkorea'],
  '알바몬': ['알바몬', 'albamon'],
  '사람인': ['사람인', 'saramin'],
  '원티드': ['원티드', 'wanted'],
  '토스알바': ['토스알바', 'toss', '알바'],
  '당근알바': ['당근알바', '당근'],
  '리멤버컴퍼니': ['리멤버컴퍼니', 'remember'],
  '요기요': ['요기요', 'yogiyo'],
  '쿠팡이츠': ['쿠팡이츠', 'coupang'],
  '배달의민족': ['배달의민족', '배민'],
  '배민': ['배민', '배달의민족'],
  '땡겨요': ['땡겨요'],
  'SK렌터카': ['sk렌터카', 'sk렌탈'],
  '롯데렌탈': ['롯데렌탈', '롯데렌터카'],
  '롯데렌터카': ['롯데렌터카', '롯데렌탈'],
  'mbk': ['mbk', '엠비케이'],
  'kkr': ['kkr'],
  'cvc': ['cvc'],
  'blackstone': ['blackstone', '블랙스톤'],
  'baincapital': ['bain', '베인'],
  'imm': ['imm'],
  'vig': ['vig'],
  '스틱인베': ['스틱인베', 'stic'],
  '스카이레이크': ['스카이레이크', 'skylake'],
  '글렌우드': ['글렌우드'],
  'eqt': ['eqt'],
  '베인캐피탈': ['베인', 'bain'],
  '베인캐피털': ['베인', 'bain'],
  '블랙스톤': ['블랙스톤', 'blackstone'],
  '알토스': ['알토스', 'altos']
};

// ===== 유틸리티 함수들 =====
var COMPREHENSIVE_DOMAIN_MAPPING = {
  'hankyung.com': '한국경제', 'mk.co.kr': '매일경제', 'fnnews.com': '파이낸셜뉴스',
  'mt.co.kr': '머니투데이', 'edaily.co.kr': '이데일리', 'sedaily.com': '서울경제',
  'heraldcorp.com': '헤럴드경제', 'asiae.co.kr': '아시아경제', 'thebell.co.kr': '더벨',
  'biz.chosun.com': '조선비즈', 'chosun.com': '조선일보', 'joongang.co.kr': '중앙일보'
};

function cleanText(text) {
  if (!text) return '';
  return text.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractNewsSource(url, title, description) {
  if (!url) return '기타언론';
  var domain = url.toLowerCase().replace(/^https?:\/\/(www\.|m\.)?/, '').split('/')[0];
  return COMPREHENSIVE_DOMAIN_MAPPING[domain] || '기타언론';
}

function checkKeywordRelevance(article) {
  var terms = KEYWORD_RELEVANCE_CHECK[article.keyword] || [article.keyword.toLowerCase()];
  var title = article.title.toLowerCase();
  for (var i = 0; i < terms.length; i++) {
    if (title.includes(terms[i].toLowerCase())) return true;
  }
  return false;
}

function calculateKeywordPriority(article) {
  var title = article.title.toLowerCase();
  if (title.includes(article.keyword.toLowerCase())) return 100;
  var related = KEYWORD_RELEVANCE_CHECK[article.keyword] || [];
  for (var i = 0; i < related.length; i++) {
    if (title.includes(related[i].toLowerCase())) return 50;
  }
  return 0;
}

// ⭐ 새로 추가: 라운드업 기사인지 체크
function isRoundupArticle(title) {
  // 패턴 매칭
  for (var i = 0; i < ROUNDUP_PATTERNS.length; i++) {
    if (ROUNDUP_PATTERNS[i].test(title)) {
      Logger.log('  ❌ 라운드업 패턴 매칭: "' + title.substring(0, 50) + '..."');
      return true;
    }
  }

  // 여러 회사명이 나열된 경우 체크
  var titleLower = title.toLowerCase();
  var companyCount = 0;
  var foundCompanies = [];

  for (var i = 0; i < COMPANY_NAMES_FOR_ROUNDUP_DETECTION.length; i++) {
    var company = COMPANY_NAMES_FOR_ROUNDUP_DETECTION[i].toLowerCase();
    if (titleLower.includes(company)) {
      companyCount++;
      foundCompanies.push(COMPANY_NAMES_FOR_ROUNDUP_DETECTION[i]);
    }
  }

  // 3개 이상 회사명이 나열되면 라운드업으로 판단
  if (companyCount >= 3) {
    Logger.log('  ❌ 다중 회사 나열(' + companyCount + '개): ' + foundCompanies.join(', ') + ' - "' + title.substring(0, 50) + '..."');
    return true;
  }

  // 구분자(·)가 많으면서 회사명이 2개 이상이면 라운드업
  var separators = (title.match(/[·•]/g) || []).length;
  if (separators >= 2 && companyCount >= 2) {
    Logger.log('  ❌ 구분자+회사 나열: "' + title.substring(0, 50) + '..."');
    return true;
  }

  return false;
}

function calculatePEImportanceScore(article) {
  var content = (article.title + ' ' + (article.description || '')).toLowerCase();
  var title = article.title;

  if (!checkKeywordRelevance(article)) return 0;

  // ⭐ 라운드업 기사 필터링 (새로 추가)
  if (isRoundupArticle(title)) {
    return 0;
  }

  // 저품질 기사 필터링
  if (title.match(/^\[.*?\]/)) {
    var afterBracket = title.replace(/^\[.*?\]\s*/, '');
    var separatorCount = (afterBracket.match(/[·•,\/]/g) || []).length;
    if (separatorCount >= 2) {
      Logger.log('  ❌ 저품질(보도자료 + 회사명 나열): "' + title.substring(0, 50) + '..."');
      return 0;
    }
  }

  var separators = (title.match(/[·•]/g) || []).length;
  if (separators >= 3) {
    Logger.log('  ❌ 저품질(회사명 나열): "' + title.substring(0, 50) + '..."');
    return 0;
  }
  if (separators >= 2 && title.length < 40) {
    Logger.log('  ❌ 저품질(회사명 나열 + 짧은 제목): "' + title.substring(0, 50) + '..."');
    return 0;
  }

  var trivialKeywords = ['퀴즈', '정답', '공개', '오늘의', '캐시워크', '돈버는', '당첨', '추첨', '이벤트'];
  var trivialCount = 0;
  for (var i = 0; i < trivialKeywords.length; i++) {
    if (content.includes(trivialKeywords[i])) trivialCount++;
  }
  if (trivialCount >= 2) {
    Logger.log('  ❌ 저품질(이벤트/퀴즈): "' + title.substring(0, 50) + '..."');
    return 0;
  }

  if (title.length < 15) {
    Logger.log('  ❌ 저품질(제목 너무 짧음): "' + title + '"');
    return 0;
  }

  if (title.match(/pick|유통/i) && separators >= 2) {
    Logger.log('  ❌ 저품질(PICK/유통 + 회사명 나열): "' + title.substring(0, 50) + '..."');
    return 0;
  }

  for (var i = 0; i < STRONG_EXCLUDE_KEYWORDS.length; i++) {
    if (content.includes(STRONG_EXCLUDE_KEYWORDS[i])) return 0;
  }

  var score = 0;
  var found = false;
  for (var level in PE_FOCUSED_KEYWORDS) {
    var keywords = PE_FOCUSED_KEYWORDS[level];
    var levelScore = level === 'critical' ? 15 : level === 'high' ? 10 : level === 'medium' ? 7 : 5;
    for (var i = 0; i < keywords.length; i++) {
      if (content.includes(keywords[i])) {
        score += levelScore;
        found = true;
        break;
      }
    }
  }
  if (!found) return 2;

  var priority = calculateKeywordPriority(article);
  if (priority === 100) score += 5;
  else if (priority === 50) score += 3;

  var premium = ['한국경제', '매일경제', '파이낸셜뉴스', '머니투데이', '이데일리', '서울경제', '헤럴드경제', '아시아경제', '조선비즈', '더벨'];
  if (premium.indexOf(article.source) !== -1) score += 2;

  var sixHoursAgo = new Date(Date.now() - (6 * 60 * 60 * 1000));
  if (article.pubDate >= sixHoursAgo) score += 1;

  return Math.max(0, score);
}

// ===== 4단계: 강력한 의미론적 중복 제거 =====
function semanticDeduplicateArticles(articles) {
  if (articles.length === 0) return [];

  Logger.log('\n🔥 === 4단계: 의미론적 중복 제거 시작 ===');
  Logger.log('📊 입력: ' + articles.length + '개 기사');

  var groupedArticles = {};
  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];
    var displayGroup = KEYWORD_GROUPING[article.keyword] || article.keyword;
    if (!groupedArticles[displayGroup]) groupedArticles[displayGroup] = [];
    groupedArticles[displayGroup].push(article);
  }

  var deduplicatedArticles = [];
  var totalRemoved = 0;

  for (var groupName in groupedArticles) {
    var groupArticles = groupedArticles[groupName];
    if (groupArticles.length < 2) {
      deduplicatedArticles = deduplicatedArticles.concat(groupArticles);
      continue;
    }

    Logger.log('🔍 ' + groupName + ': ' + groupArticles.length + '개 의미론적 분석...');
    var clusters = findSemanticClusters(groupArticles);
    var kept = [];

    for (var c = 0; c < clusters.length; c++) {
      var cluster = clusters[c];
      if (cluster.length === 1) {
        kept.push(cluster[0]);
      } else {
        var best = selectBestFromCluster(cluster);
        kept.push(best);
        Logger.log('  ➡️ 클러스터 ' + (c + 1) + ': ' + cluster.length + '개 → 1개 선택');
      }
    }

    var removed = groupArticles.length - kept.length;
    totalRemoved += removed;
    deduplicatedArticles = deduplicatedArticles.concat(kept);
    Logger.log('✅ ' + groupName + ': ' + groupArticles.length + '개 → ' + kept.length + '개 (' + removed + '개 제거)');
  }

  Logger.log('🔥 === 4단계 완료: ' + totalRemoved + '개 제거, ' + deduplicatedArticles.length + '개 남음 ===');
  return deduplicatedArticles;
}

function findSemanticClusters(articles) {
  var n = articles.length;
  var clusters = [];
  var assigned = new Array(n).fill(false);

  for (var i = 0; i < n; i++) {
    if (assigned[i]) continue;
    var cluster = [articles[i]];
    assigned[i] = true;

    for (var j = i + 1; j < n; j++) {
      if (assigned[j]) continue;
      if (areArticlesSemantically(articles[i], articles[j])) {
        cluster.push(articles[j]);
        assigned[j] = true;
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

function areArticlesSemantically(a1, a2) {
  var t1 = normalizeTitle(a1.title);
  var t2 = normalizeTitle(a2.title);

  var keywords1 = extractKeywords(t1);
  var keywords2 = extractKeywords(t2);

  var commonKeywords = [];
  for (var i = 0; i < keywords1.length; i++) {
    for (var j = 0; j < keywords2.length; j++) {
      if (areSynonyms(keywords1[i], keywords2[j])) {
        commonKeywords.push(keywords1[i]);
        break;
      }
    }
  }

  var longCommon = 0;
  for (var i = 0; i < commonKeywords.length; i++) {
    if (commonKeywords[i].length >= 3) longCommon++;
  }

  if (longCommon >= 3) return true;
  if (commonKeywords.length >= 2) return true;

  return matchSpecialPatterns(t1, t2);
}

function normalizeTitle(title) {
  return title.toLowerCase()
    .replace(/[^\w가-힣\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractKeywords(text) {
  var stopwords = [
    '주식회사', '코리아', '그룹', '기업', '회사', '관련', '대한', '한국', '서울',
    '등', '및', '위한', '통해', '대해', '따른', '위해', '있는', '있다', '한다',
    '오늘', '내일', '이번', '올해', '작년', '최근', '지난', '다음',
    '정답', '공개', '발표', '선정', '선택', '라이센스', 'pick'
  ];

  var words = text.split(' ').filter(function (w) {
    return w.length >= 2 && stopwords.indexOf(w) === -1;
  });
  return words;
}

function areSynonyms(w1, w2) {
  if (w1 === w2) return true;

  var synonymGroups = [
    ['리뉴얼', '새단장', '전면', '개편', '오픈', '재단장'],
    ['출시', '런칭', '오픈', '선보'],
    ['1위', '선두', '최고', '1등'],
    ['1년', '1주년', '만에'],
    ['청산', '결국', '남은', '남아', '없다', '종료'],
    ['중징계', '직무정지', '제재', '징계', '처분', '발등', '불', '후폭풍', '벼랑'],
    ['반대', '반발', '결사반대', '강행', '중단', '규탄'],
    ['mau', '이용자', '사용자', '회원'],
    ['kim', '김병주', '회장'],
    ['로드러너', 'roadrunner'],
    ['딜리버리', 'delivery', '배달'],
    ['대주주', '자격', '위태', '잃나'],
    ['자사주', '소각', '요구', '우회', '서한', '밝혀라'],
    ['mou', '협약', '업무협약', '제휴'],
    // ⭐ 마장동 관련 동의어 추가
    ['마장동', '마장축산물', '마장축산물시장', '마장시장', '마장'],
    ['입점', '판매개시', '판매시작', '론칭', '오픈'],
    ['한우', '소고기', '축산물', '정육']
  ];

  for (var i = 0; i < synonymGroups.length; i++) {
    var group = synonymGroups[i];
    var has1 = false, has2 = false;
    for (var j = 0; j < group.length; j++) {
      if (w1.includes(group[j]) || group[j].includes(w1)) has1 = true;
      if (w2.includes(group[j]) || group[j].includes(w2)) has2 = true;
    }
    if (has1 && has2) return true;
  }
  return false;
}

function matchSpecialPatterns(t1, t2) {
  var nums1 = t1.match(/\d+/g) || [];
  var nums2 = t2.match(/\d+/g) || [];

  if (nums1.length > 0 && nums2.length > 0) {
    for (var i = 0; i < nums1.length; i++) {
      for (var j = 0; j < nums2.length; j++) {
        if (nums1[i] === nums2[j] && parseInt(nums1[i]) >= 10) {
          return true;
        }
      }
    }
  }
  return false;
}

function selectBestFromCluster(cluster) {
  var best = cluster[0];
  var bestScore = calculateArticleQuality(best);

  for (var i = 1; i < cluster.length; i++) {
    var score = calculateArticleQuality(cluster[i]);
    if (score > bestScore) {
      best = cluster[i];
      bestScore = score;
    }
  }
  return best;
}

function calculateArticleQuality(article) {
  var score = 0;
  score += calculateKeywordPriority(article);
  score += (article.importanceScore || 0) * 10;
  score += article.title.length / 10;
  var hoursAgo = (Date.now() - article.pubDate.getTime()) / (1000 * 60 * 60);
  score += Math.max(0, 10 - hoursAgo);
  return score;
}

// ===== 4.5단계: 키워드 기반 중복 제거 =====
function keywordBasedDeduplication(articles) {
  if (articles.length === 0) return [];

  Logger.log('\n🔑 === 4.5단계: 키워드 기반 중복 제거 ===');
  Logger.log('📊 입력: ' + articles.length + '개 기사');

  var groupedArticles = {};
  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];
    var displayGroup = KEYWORD_GROUPING[article.keyword] || article.keyword;
    if (!groupedArticles[displayGroup]) groupedArticles[displayGroup] = [];
    groupedArticles[displayGroup].push(article);
  }

  var deduplicatedArticles = [];
  var totalRemoved = 0;

  for (var groupName in groupedArticles) {
    var groupArticles = groupedArticles[groupName];
    if (groupArticles.length < 2) {
      deduplicatedArticles = deduplicatedArticles.concat(groupArticles);
      continue;
    }

    Logger.log('🔍 ' + groupName + ': ' + groupArticles.length + '개 키워드 분석...');
    var kept = filterByKeywordOverlap(groupArticles);
    var removed = groupArticles.length - kept.length;
    totalRemoved += removed;
    deduplicatedArticles = deduplicatedArticles.concat(kept);
    Logger.log('✅ ' + groupName + ': ' + groupArticles.length + '개 → ' + kept.length + '개 (' + removed + '개 제거)');
  }

  Logger.log('🔑 === 4.5단계 완료: ' + totalRemoved + '개 제거, ' + deduplicatedArticles.length + '개 남음 ===');
  return deduplicatedArticles;
}

function filterByKeywordOverlap(articles) {
  var n = articles.length;
  var kept = [];
  var removed = new Array(n).fill(false);

  for (var i = 0; i < n; i++) {
    if (removed[i]) continue;
    var keywords1 = extractSignificantKeywords(articles[i].title);

    for (var j = i + 1; j < n; j++) {
      if (removed[j]) continue;
      var keywords2 = extractSignificantKeywords(articles[j].title);
      var commonCount = countCommonKeywords(keywords1, keywords2);

      // 3개 이상 공통 키워드 → 중복!
      if (commonCount >= 3) {
        var quality1 = calculateArticleQuality(articles[i]);
        var quality2 = calculateArticleQuality(articles[j]);

        if (quality2 > quality1) {
          removed[i] = true;
          Logger.log('  ❌ 키워드 중복(' + commonCount + '개): "' + articles[i].title.substring(0, 60) + '..."');
          Logger.log('    → 유지: "' + articles[j].title.substring(0, 60) + '..."');
          break;
        } else {
          removed[j] = true;
          Logger.log('  ❌ 키워드 중복(' + commonCount + '개): "' + articles[j].title.substring(0, 60) + '..."');
          Logger.log('    → 유지: "' + articles[i].title.substring(0, 60) + '..."');
        }
      }
    }

    if (!removed[i]) {
      kept.push(articles[i]);
    }
  }
  return kept;
}

function extractSignificantKeywords(title) {
  var stopwords = [
    '주식회사', '코리아', '그룹', '기업', '회사', '관련', '대한', '한국', '서울',
    '등', '및', '위한', '통해', '대해', '따른', '위해', '있는', '있다', '한다',
    '오늘', '내일', '이번', '올해', '작년', '최근', '지난', '다음',
    '정답', '공개', '발표', '선정', '선택', '라이센스', 'pick',
    '으로', '는', '은', '이', '가', '을', '를', '의', '와', '과', '하는', '하다', '위한', '위해', '대한', '대해'
  ];

  var normalized = title.toLowerCase()
    .replace(/[^\w가-힣\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  var words = normalized.split(' ').filter(function (w) {
    return w.length >= 2 && stopwords.indexOf(w) === -1;
  });

  var keywords = [];
  for (var i = 0; i < words.length; i++) {
    if (words[i].length >= 2) {
      keywords.push(words[i]);
    }
  }
  return keywords;
}

function countCommonKeywords(keywords1, keywords2) {
  var common = 0;
  for (var i = 0; i < keywords1.length; i++) {
    for (var j = 0; j < keywords2.length; j++) {
      if (keywords1[i] === keywords2[j]) {
        common++;
        break;
      }
    }
  }
  return common;
}

// ===== 5단계: GPT 기반 최종 중복 제거 =====
function gptDeduplicateByGroup(articles) {
  if (!USE_GPT_DEDUPLICATION || !OPENAI_API_KEY) {
    Logger.log('⚠️ GPT 중복 제거 비활성화 또는 API 키 없음');
    return articles;
  }

  if (articles.length === 0) return [];

  Logger.log('\n🤖 === 5단계: GPT 최종 중복 제거 시작 ===');
  Logger.log('📊 입력: ' + articles.length + '개 기사');

  var groupedArticles = {};
  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];
    var displayGroup = KEYWORD_GROUPING[article.keyword] || article.keyword;
    if (!groupedArticles[displayGroup]) groupedArticles[displayGroup] = [];
    groupedArticles[displayGroup].push(article);
  }

  var finalArticles = [];
  var totalRemoved = 0;

  for (var groupName in groupedArticles) {
    var groupArticles = groupedArticles[groupName];

    if (groupArticles.length <= 1) {
      finalArticles = finalArticles.concat(groupArticles);
      Logger.log('✅ ' + groupName + ': 1개 (GPT 스킵)');
      continue;
    }

    Logger.log('🔍 ' + groupName + ': ' + groupArticles.length + '개 → GPT 분석 중...');

    try {
      var kept = gptFilterDuplicates(groupArticles, groupName);
      var removed = groupArticles.length - kept.length;
      totalRemoved += removed;
      finalArticles = finalArticles.concat(kept);
      Logger.log('✅ ' + groupName + ': ' + groupArticles.length + '개 → ' + kept.length + '개 (' + removed + '개 제거)');

      if (removed > 0) {
        Logger.log('  제거된 기사:');
        for (var i = 0; i < groupArticles.length; i++) {
          var wasKept = false;
          for (var j = 0; j < kept.length; j++) {
            if (groupArticles[i].link === kept[j].link) {
              wasKept = true;
              break;
            }
          }
          if (!wasKept) {
            Logger.log('  ❌ "' + groupArticles[i].title.substring(0, 60) + '..."');
          }
        }
      }
    } catch (e) {
      Logger.log('⚠️ ' + groupName + ': GPT 오류 - ' + e.toString() + ' (원본 유지)');
      finalArticles = finalArticles.concat(groupArticles);
    }

    Utilities.sleep(1000);
  }

  Logger.log('🤖 === 5단계 완료: ' + totalRemoved + '개 제거, ' + finalArticles.length + '개 남음 ===');
  return finalArticles;
}

function gptFilterDuplicates(articles, groupName) {
  var titles = articles.map(function (a, idx) {
    return idx + ': [중요도:' + (a.importanceScore || 0) + '] ' + a.title;
  }).join('\n');

  var prompt = `당신은 PE(Private Equity) 뉴스 큐레이터입니다.
다음은 "${groupName}" 그룹의 뉴스 기사 제목들입니다:

${titles}

**작업: 2단계 필터링**

**STEP 1: 같은 맥락 기사 클러스터링**
같은 사건/이슈를 다루는 기사들을 그룹으로 묶으세요.

**⚠️ 핵심 원칙: 같은 회사라도 다른 사건은 반드시 다른 클러스터!**

**같은 맥락 (같은 클러스터로 묶어야 함):**
- "MBK 홈플러스 영장 기각" + "MBK 홈플러스 급여 지급" → 같은 사건 (홈플러스 이슈)
- "배민 마장동 입점" + "배민에 마장축산물시장 업체 입점" → 같은 사건

**다른 맥락 (절대 같은 클러스터로 묶지 말 것!):**
- "MBK 홈플러스 사태" vs "MBK-영풍 콜옵션/고려아연" → 완전히 다른 사건!
- "KKR 해상풍력 투자" vs "KKR 아시아 크레딧 펀드" → 다른 프로젝트
- "베인 안다르 인수" vs "베인 인스파이어 리조트" → 다른 딜

**STEP 2: 각 클러스터에서 1개만 선택**
같은 맥락 클러스터 내에서 PE 관점 가장 중요한 기사 1개 선택:
1. 실적/재무 분석 > 단순 사실 보도
2. 구체적 숫자 포함 > 추상적 표현
3. 프리미엄 언론사 우선

**응답 형식 (JSON only):**
{
  "clusters": [
    {
      "issue": "MBK 홈플러스 이슈",
      "article_indices": [0, 1],
      "selected": 0,
      "reason": "선택 이유"
    },
    {
      "issue": "MBK-고려아연 콜옵션",
      "article_indices": [2],
      "selected": 2,
      "reason": "단일 기사 (홈플러스와 별개 이슈)"
    }
  ],
  "keep_indices": [0, 2]
}

**절대 원칙: 
1. 같은 사건 기사만 1개로 병합 (가장 팩트가 풍부한 기사 선택)
2. 서로 다른 회사/딜/실적은 무조건 각각 유지! (예: 블랙스톤 실적, EQT 매각, 롯데카드 이슈는 다 별개임)
3. 비즈니스 가치가 없는 기사(단순 홍보, 아이돌 공연, 맛집/건물 소개 등)만 제외!**`;

  var payload = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a news deduplication specialist. CRITICAL RULE: Same company does NOT mean same cluster. Different events (e.g., MBK-Homeplus vs MBK-Korea Zinc) MUST be in separate clusters. Only merge articles about the EXACT same event. Always respond with valid JSON only.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  };

  var options = {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + OPENAI_API_KEY,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', options);
  var responseCode = response.getResponseCode();

  if (responseCode !== 200) {
    throw new Error('API 오류: ' + responseCode + ' - ' + response.getContentText());
  }

  var result = JSON.parse(response.getContentText());
  var content = result.choices[0].message.content;
  var gptResponse = JSON.parse(content);

  var keepIndices = gptResponse.keep_indices || [];
  var clusters = gptResponse.clusters || [];

  Logger.log('  📊 클러스터 분석:');
  for (var i = 0; i < clusters.length; i++) {
    var cluster = clusters[i];
    Logger.log('  🔸 ' + cluster.issue + ': ' + cluster.article_indices.length + '개 → 1개');
    Logger.log('    선택: [' + cluster.selected + '] ' + articles[cluster.selected].title.substring(0, 50) + '...');
    if (cluster.reason) {
      Logger.log('    이유: ' + cluster.reason);
    }
  }
  Logger.log('  ✅ 최종: ' + articles.length + '개 → ' + keepIndices.length + '개');

  var kept = [];
  for (var i = 0; i < keepIndices.length; i++) {
    var idx = keepIndices[i];
    if (idx >= 0 && idx < articles.length) {
      kept.push(articles[idx]);
    }
  }
  return kept;
}

// ===== 6단계: 최종 전체 중복 제거 (그룹 경계 무시) =====
function finalGlobalDeduplication(articles) {
  if (articles.length === 0) return [];

  Logger.log('\n🎯 === 6단계: 최종 전체 중복 제거 시작 ===');
  Logger.log('📊 입력: ' + articles.length + '개 기사');

  var clusters = findSemanticClusters(articles);
  var finalArticles = [];
  var totalRemoved = 0;

  for (var c = 0; c < clusters.length; c++) {
    var cluster = clusters[c];
    if (cluster.length === 1) {
      finalArticles.push(cluster[0]);
    } else {
      var best = selectBestFromCluster(cluster);
      finalArticles.push(best);
      var removed = cluster.length - 1;
      totalRemoved += removed;
      Logger.log('  ➡️ 최종 클러스터: ' + cluster.length + '개 → 1개 선택');
    }
  }

  Logger.log('🎯 === 6단계 완료: ' + totalRemoved + '개 제거, ' + finalArticles.length + '개 남음 ===');
  return finalArticles;
}

// ===== ⭐ 7단계: 과거 일주일 뉴스와 비교 필터링 (완전 개선) =====
function filterAgainstHistoricalNews(articles) {
  if (articles.length === 0) return [];

  Logger.log('\n📚 === 7단계: 과거 일주일 뉴스 필터링 시작 ===');
  Logger.log('📊 입력: ' + articles.length + '개 기사');

  var historicalNews = loadRecentHistoricalNews();
  if (historicalNews.length === 0) {
    Logger.log('✅ 히스토리 없음 - 모든 기사 통과');
    return articles;
  }

  Logger.log('📖 과거 ' + HISTORY_DAYS + '일 뉴스: ' + historicalNews.length + '개');

  var filtered = [];
  var removedCount = 0;

  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];
    var isDuplicate = false;
    var duplicateInfo = null;

    // 히스토리의 각 뉴스와 비교
    for (var j = 0; j < historicalNews.length; j++) {
      var historical = historicalNews[j];

      // ⭐ 개선: 그룹 경계 없이 전체 비교 (같은 주제는 다른 그룹에서도 중복 가능)
      // 하지만 성능을 위해 같은 그룹 우선 비교
      var currentGroup = KEYWORD_GROUPING[article.keyword] || article.keyword;
      var historicalGroup = KEYWORD_GROUPING[historical.keyword] || historical.keyword;

      // ⭐ 방법 1: 제목 유사도 체크 (기준 상향 70% -> 85%)
      // Market 그룹(PE 뉴스)은 중요도가 높으므로 더 엄격하게 똑같아야만 제거 (85% 이상)
      // 일반 소비재(버거킹 등)는 70%만 넘어도 중복으로 봄
      var threshold = (currentGroup === 'Market') ? 0.85 : 0.7;

      var similarity = calculateTitleSimilarity(article.title, historical.title);
      if (similarity >= threshold) {
        isDuplicate = true;
        duplicateInfo = {
          title: historical.title,
          date: historical.savedDate,
          method: '제목 유사도 ' + Math.round(similarity * 100) + '%'
        };
        break;
      }

      // ⭐ 방법 2: 핵심 주제어 매칭 (새로 추가)
      var topicMatch = checkTopicMatch(article.title, historical.title);
      if (topicMatch.isMatch) {
        isDuplicate = true;
        duplicateInfo = {
          title: historical.title,
          date: historical.savedDate,
          method: '주제 매칭: ' + topicMatch.topic
        };
        break;
      }

      // ⭐ 방법 3: 키워드 오버랩 (임계값 낮춤: 3→2)
      if (currentGroup === historicalGroup) {
        var currentKeywords = extractSignificantKeywords(article.title);
        var historicalKeywords = extractSignificantKeywords(historical.title);
        var commonCount = countCommonKeywordsWithSynonyms(currentKeywords, historicalKeywords);

        if (commonCount >= HISTORY_KEYWORD_THRESHOLD) {
          isDuplicate = true;
          duplicateInfo = {
            title: historical.title,
            date: historical.savedDate,
            method: '키워드 중복 ' + commonCount + '개'
          };
          break;
        }
      }
    }

    if (isDuplicate) {
      removedCount++;
      Logger.log('  ❌ 과거 뉴스와 중복: "' + article.title.substring(0, 50) + '..."');
      Logger.log('    → 방법: ' + duplicateInfo.method);
      Logger.log('    → 과거 기사(' + duplicateInfo.date + '): "' + duplicateInfo.title.substring(0, 50) + '..."');
    } else {
      filtered.push(article);
    }
  }

  Logger.log('📚 === 7단계 완료: ' + removedCount + '개 제거, ' + filtered.length + '개 남음 ===');
  return filtered;
}

// ⭐ 새로 추가: 제목 유사도 계산 (Jaccard + 동의어)
function calculateTitleSimilarity(title1, title2) {
  var words1 = extractSignificantKeywords(title1);
  var words2 = extractSignificantKeywords(title2);

  if (words1.length === 0 || words2.length === 0) return 0;

  var matchCount = 0;
  var matched2 = new Array(words2.length).fill(false);

  for (var i = 0; i < words1.length; i++) {
    for (var j = 0; j < words2.length; j++) {
      if (matched2[j]) continue;
      if (areSynonymsEnhanced(words1[i], words2[j])) {
        matchCount++;
        matched2[j] = true;
        break;
      }
    }
  }

  // Jaccard 유사도 변형
  var union = words1.length + words2.length - matchCount;
  return matchCount / union;
}

// ⭐ 새로 추가: 핵심 주제어 매칭
function checkTopicMatch(title1, title2) {
  // 특정 주제어 패턴 정의
  var topicPatterns = [
    { pattern: /마장(동|축산|시장)/gi, topic: '마장동/마장축산물시장' },
    { pattern: /1인\s*가구/gi, topic: '1인 가구' },
    { pattern: /배민.*입점|입점.*배민/gi, topic: '배민 입점' },
    { pattern: /쿠팡이츠.*1(위|등)|1(위|등).*쿠팡이츠/gi, topic: '쿠팡이츠 1위' },
    { pattern: /롯데렌탈.*sk|sk.*롯데렌탈|기업결합/gi, topic: 'SK-롯데 기업결합' },
    { pattern: /mbk.*홈플|홈플.*mbk/gi, topic: 'MBK 홈플러스' },
    { pattern: /잡코리아.*mau|mau.*잡코리아/gi, topic: '잡코리아 MAU' },
    { pattern: /맥도날드.*세종|세종.*맥도날드/gi, topic: '맥도날드 세종 진출' },
    { pattern: /베인.*안다르|안다르.*베인/gi, topic: '베인-안다르' },
    { pattern: /kkr.*해상풍력|해상풍력.*kkr/gi, topic: 'KKR 해상풍력' }
  ];

  var t1 = title1.toLowerCase();
  var t2 = title2.toLowerCase();

  for (var i = 0; i < topicPatterns.length; i++) {
    var pattern = topicPatterns[i].pattern;
    if (pattern.test(t1) && pattern.test(t2)) {
      return { isMatch: true, topic: topicPatterns[i].topic };
    }
    // 패턴 리셋 (global flag 때문에 필요)
    pattern.lastIndex = 0;
  }

  return { isMatch: false, topic: null };
}

// ⭐ 새로 추가: 동의어 포함 키워드 카운트
function countCommonKeywordsWithSynonyms(keywords1, keywords2) {
  var common = 0;
  var matched2 = new Array(keywords2.length).fill(false);

  for (var i = 0; i < keywords1.length; i++) {
    for (var j = 0; j < keywords2.length; j++) {
      if (matched2[j]) continue;
      if (areSynonymsEnhanced(keywords1[i], keywords2[j])) {
        common++;
        matched2[j] = true;
        break;
      }
    }
  }
  return common;
}

// ⭐ 강화된 동의어 체크
function areSynonymsEnhanced(w1, w2) {
  if (w1 === w2) return true;

  // 부분 문자열 매칭 (3글자 이상)
  if (w1.length >= 3 && w2.length >= 3) {
    if (w1.includes(w2) || w2.includes(w1)) return true;
  }

  var synonymGroups = [
    ['리뉴얼', '새단장', '전면', '개편', '오픈', '재단장'],
    ['출시', '런칭', '오픈', '선보'],
    ['1위', '선두', '최고', '1등'],
    ['1년', '1주년', '만에'],
    ['청산', '결국', '남은', '남아', '없다', '종료'],
    ['중징계', '직무정지', '제재', '징계', '처분'],
    ['반대', '반발', '결사반대', '강행', '중단', '규탄'],
    ['mau', '이용자', '사용자', '회원'],
    ['mou', '협약', '업무협약', '제휴', '협력'],
    // ⭐ 마장동 관련 강화
    ['마장동', '마장축산물', '마장축산물시장', '마장시장', '마장'],
    ['입점', '판매개시', '판매시작', '판매', '런칭', '오픈', '시작'],
    ['한우', '소고기', '축산물', '정육', '고기'],
    ['배민', '배달의민족', '우아한형제들'],
    ['쿠팡이츠', '쿠팡'],
    ['요기요'],
    // 기업결합 관련
    ['기업결합', '합병', '인수', '통합'],
    ['sk렌터카', 'sk렌탈'],
    ['롯데렌탈', '롯데렌터카'],
    // 일반 비즈니스 용어
    ['투자', '베팅', '출자'],
    ['esg', '지속가능', '친환경'],
    ['보고서', '리포트', '발간']
  ];

  for (var i = 0; i < synonymGroups.length; i++) {
    var group = synonymGroups[i];
    var has1 = false, has2 = false;
    for (var j = 0; j < group.length; j++) {
      if (w1.includes(group[j]) || group[j].includes(w1)) has1 = true;
      if (w2.includes(group[j]) || group[j].includes(w2)) has2 = true;
    }
    if (has1 && has2) return true;
  }
  return false;
}

// ===== 최근 7일 히스토리 로드 =====
function loadRecentHistoricalNews() {
  try {
    var historySpreadsheet = SpreadsheetApp.openByUrl(HISTORY_SPREADSHEET_URL);
    var historySheet = historySpreadsheet.getSheetByName(HISTORY_SHEET_NAME);

    if (!historySheet) {
      Logger.log('📝 히스토리 시트 생성 중...');
      historySheet = historySpreadsheet.insertSheet(HISTORY_SHEET_NAME);
      historySheet.appendRow(['저장일시', '검색 키워드', '발행일시', '제목', '링크', '중요도', '언론사']);
      return [];
    }

    var data = historySheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    var cutoffDate = new Date(Date.now() - (HISTORY_DAYS * 24 * 60 * 60 * 1000));
    var historical = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var savedDate = new Date(row[0]);

      if (savedDate >= cutoffDate) {
        historical.push({
          keyword: row[1],
          title: row[3],
          link: row[4],
          savedDate: Utilities.formatDate(savedDate, 'GMT+9', 'MM/dd')
        });
      }
    }

    return historical;
  } catch (e) {
    Logger.log('⚠️ 히스토리 로드 실패: ' + e.toString());
    return [];
  }
}

// ===== 히스토리에 저장 =====
function saveToHistory(articles) {
  if (articles.length === 0) return;

  Logger.log('\n💾 === 히스토리 저장 시작 ===');

  try {
    var historySpreadsheet = SpreadsheetApp.openByUrl(HISTORY_SPREADSHEET_URL);
    var historySheet = historySpreadsheet.getSheetByName(HISTORY_SHEET_NAME);

    if (!historySheet) {
      historySheet = historySpreadsheet.insertSheet(HISTORY_SHEET_NAME);
      historySheet.appendRow(['저장일시', '검색 키워드', '발행일시', '제목', '링크', '중요도', '언론사']);
    }

    var now = new Date();
    var savedCount = 0;

    for (var i = 0; i < articles.length; i++) {
      var a = articles[i];
      historySheet.appendRow([
        Utilities.formatDate(now, 'GMT+9', 'yyyy-MM-dd HH:mm:ss'),
        a.keyword,
        a.pubDateStr,
        a.title,
        a.link,
        a.importanceScore,
        a.source
      ]);
      savedCount++;
    }

    Logger.log('✅ ' + savedCount + '개 기사 히스토리에 저장 완료');

    cleanOldHistory(historySheet);
  } catch (e) {
    Logger.log('⚠️ 히스토리 저장 실패: ' + e.toString());
  }
}

// ===== 7일 이상 된 히스토리 정리 =====
function cleanOldHistory(historySheet) {
  var data = historySheet.getDataRange().getValues();
  if (data.length <= 1) return;

  var cutoffDate = new Date(Date.now() - (HISTORY_DAYS * 24 * 60 * 60 * 1000));
  var rowsToDelete = [];

  for (var i = data.length - 1; i >= 1; i--) {
    var savedDate = new Date(data[i][0]);
    if (savedDate < cutoffDate) {
      rowsToDelete.push(i + 1);
    }
  }

  if (rowsToDelete.length === 0) {
    Logger.log('🧹 정리할 오래된 히스토리 없음');
    return;
  }

  for (var i = 0; i < rowsToDelete.length; i++) {
    historySheet.deleteRow(rowsToDelete[i]);
  }

  Logger.log('🧹 ' + rowsToDelete.length + '개 오래된 히스토리 정리 완료');
}

function fetchAllNewsFromBothSources() {
  Logger.log('\n📥 === 1단계: 뉴스 수집 시작 ===');
  var allArticles = [];

  for (var i = 0; i < KEYWORDS.length; i++) {
    var keyword = KEYWORDS[i];
    try {
      var articles = fetchRawArticlesForKeyword(keyword);
      allArticles = allArticles.concat(articles);
      Logger.log('✅ ' + keyword + ': ' + articles.length + '개');
    } catch (e) {
      Logger.log('❌ ' + keyword + ': ' + e.toString());
    }
    Utilities.sleep(500);
  }

  Logger.log('📊 총 ' + allArticles.length + '개 수집');
  return allArticles;
}

function fetchRawArticlesForKeyword(keyword) {
  var url = 'https://openapi.naver.com/v1/search/news.json?query=' + encodeURIComponent(keyword) +
    '&sort=date&display=' + NEWS_COUNT;

  var response = UrlFetchApp.fetch(url, {
    headers: {
      'X-Naver-Client-Id': CLIENT_ID,
      'X-Naver-Client-Secret': CLIENT_SECRET
    },
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200) return [];

  var data = JSON.parse(response.getContentText());
  var items = data.items || [];
  var processed = [];
  var cutoff = new Date(Date.now() - (24 * 60 * 60 * 1000));

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    if (!item.title || !item.link) continue;

    var pubDate = new Date(item.pubDate);
    if (pubDate < cutoff) continue;

    processed.push({
      keyword: keyword,
      title: cleanText(item.title),
      link: item.link,
      pubDate: pubDate,
      pubDateStr: Utilities.formatDate(pubDate, 'GMT+9', 'yyyy-MM-dd HH:mm'),
      description: cleanText(item.description || ''),
      source: extractNewsSource(item.link, item.title, item.description)
    });
  }

  return processed;
}

function removeDuplicatesFromAllArticles(articles) {
  Logger.log('\n🔄 === 2단계: 기본 중복 제거 ===');
  var unique = [];
  var seen = {};

  for (var i = 0; i < articles.length; i++) {
    if (!seen[articles[i].link]) {
      seen[articles[i].link] = true;
      unique.push(articles[i]);
    }
  }

  Logger.log('✅ ' + articles.length + '개 → ' + unique.length + '개');
  return unique;
}

function peSmartFilteringAndValidation(articles) {
  Logger.log('\n🎯 === 3단계: PE 필터링 ===');

  var relevant = [];
  for (var i = 0; i < articles.length; i++) {
    var a = articles[i];

    // 원티드 특별 검증: career 관련 단어 없으면 무조건 스킵
    if (a.keyword === '원티드') {
      var text = (a.title + ' ' + a.description).toLowerCase();
      if (!/채용|취업|이직|커리어|매칭|원티드랩|연봉|직군/.test(text)) {
        Logger.log('  ❌ 원티드 노이즈 제거: "' + a.title.substring(0, 40) + '..."');
        continue;
      }
    }

    a.importanceScore = calculatePEImportanceScore(a);
    if (a.importanceScore >= 2) {
      relevant.push(a);
    }
  }

  Logger.log('✅ ' + articles.length + '개 → ' + relevant.length + '개');
  return relevant;
}

function groupArticlesByDisplayGroup(articles) {
  var grouped = {};
  for (var i = 0; i < articles.length; i++) {
    var group = KEYWORD_GROUPING[articles[i].keyword] || articles[i].keyword;
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(articles[i]);
  }
  return grouped;
}

function sendSlackNewsReport(articles) {
  if (!SEND_SLACK || !articles.length) return false;

  var grouped = groupArticlesByDisplayGroup(articles);
  var dateStr = Utilities.formatDate(new Date(), 'GMT+9', 'MM월 dd일');
  var groupOrder = ['BKR', 'HCI', 'UBase', 'Serveone', 'Lock&Lock', 'Worxphere', 'YGY', 'SKR and LTR', 'Market'];

  var blocks = [{
    type: "section",
    text: { type: "mrkdwn", text: '*Daily News Run - ' + dateStr + '*\nTotal ' + articles.length + ' Articles' }
  }];

  for (var i = 0; i < groupOrder.length; i++) {
    var group = groupOrder[i];
    var arts = grouped[group];
    if (!arts || arts.length === 0) continue;

    var message = '*' + group + '*\n';
    var sorted = arts.sort(function (a, b) {
      var ap = calculateKeywordPriority(a);
      var bp = calculateKeywordPriority(b);
      if (bp !== ap) return bp - ap;
      if (b.importanceScore !== a.importanceScore) return b.importanceScore - a.importanceScore;
      return b.pubDate - a.pubDate;
    }).slice(0, 10);

    for (var j = 0; j < sorted.length; j++) {
      message += '<' + sorted[j].link + '|' + sorted[j].title + '>\n';
    }

    blocks.push({ type: "section", text: { type: "mrkdwn", text: message.trim() } });
  }

  var payload = {
    username: 'News Bot',
    icon_emoji: ':newspaper:',
    channel: SLACK_CHANNEL,
    blocks: blocks
  };

  var response = UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  return response.getResponseCode() === 200;
}

function fetchAndWrite() {
  var startTime = new Date();
  Logger.log('\n🚀 === 뉴스 큐레이션 시작 ===');

  var sheet = SpreadsheetApp.getActive().getSheetByName('뉴스 Part 1') || SpreadsheetApp.getActive().getActiveSheet();
  sheet.clear();
  sheet.appendRow(['사이트', '검색 키워드', '날짜', '제목', '링크', '중요도 점수', '언론사']);

  var allRaw = fetchAllNewsFromBothSources();
  var unique = removeDuplicatesFromAllArticles(allRaw);
  var peFiltered = peSmartFilteringAndValidation(unique);
  var groupDeduplicated = semanticDeduplicateArticles(peFiltered);
  var keywordDeduplicated = keywordBasedDeduplication(groupDeduplicated);
  var gptDeduplicated = gptDeduplicateByGroup(keywordDeduplicated);
  var globalDeduplicated = finalGlobalDeduplication(gptDeduplicated);

  // ⭐ 7단계: 과거 일주일 뉴스와 비교 필터링
  var finalArticles = filterAgainstHistoricalNews(globalDeduplicated);

  finalArticles.sort(function (a, b) {
    var ap = calculateKeywordPriority(a);
    var bp = calculateKeywordPriority(b);
    if (bp !== ap) return bp - ap;
    if (b.importanceScore !== a.importanceScore) return b.importanceScore - a.importanceScore;
    return b.pubDate - a.pubDate;
  });

  for (var i = 0; i < finalArticles.length; i++) {
    var a = finalArticles[i];
    sheet.appendRow(['네이버', a.keyword, a.pubDateStr, a.title, a.link, a.importanceScore, a.source]);
  }

  // ⭐ 히스토리에 저장
  saveToHistory(finalArticles);

  var duration = (new Date() - startTime) / 1000;
  Logger.log('\n📊 최종: ' + allRaw.length + ' → ' + unique.length + ' → ' + peFiltered.length +
    ' → ' + groupDeduplicated.length + ' → ' + keywordDeduplicated.length + ' → ' + gptDeduplicated.length +
    ' → ' + globalDeduplicated.length + ' → ' + finalArticles.length + ' (히스토리 필터링 후)');
  Logger.log('⏱️ 소요: ' + Math.round(duration) + '초');

  if (finalArticles.length > 0) {
    sendSlackNewsReport(finalArticles);
    sendEmailNewsReport(finalArticles);
  }
}

// 기존에는 slack만 보내는 함수였으나, 이제 메일도 함께 보냅니다. 함수명은 호환성을 위해 유지합니다.
function sendSlackOnly() {
  var allRaw = fetchAllNewsFromBothSources();
  var unique = removeDuplicatesFromAllArticles(allRaw);
  var peFiltered = peSmartFilteringAndValidation(unique);
  var groupDeduplicated = semanticDeduplicateArticles(peFiltered);
  var keywordDeduplicated = keywordBasedDeduplication(groupDeduplicated);
  var gptDeduplicated = gptDeduplicateByGroup(keywordDeduplicated);
  var globalDeduplicated = finalGlobalDeduplication(gptDeduplicated);

  // ⭐ 과거 일주일 뉴스와 비교 필터링
  var finalArticles = filterAgainstHistoricalNews(globalDeduplicated);

  // ⭐ 히스토리에 저장
  saveToHistory(finalArticles);

  if (finalArticles.length > 0) {
    sendSlackNewsReport(finalArticles);
    sendEmailNewsReport(finalArticles);
  }
}

function sendEmailNewsReport(articles) {
  if (!SEND_EMAIL || !articles.length) return false;

  var grouped = groupArticlesByDisplayGroup(articles);
  var dateStr = Utilities.formatDate(new Date(), 'GMT+9', 'MM월 dd일');
  var groupOrder = ['BKR', 'HCI', 'UBase', 'Serveone', 'Lock&Lock', 'Worxphere', 'YGY', 'SKR and LTR', 'Market'];

  var subject = 'Daily News Run - ' + dateStr;

  var htmlBody = '<strong>Daily News Run - ' + dateStr + '</strong><br/>';
  htmlBody += 'Total ' + articles.length + ' Articles<br/><br/>';

  for (var i = 0; i < groupOrder.length; i++) {
    var group = groupOrder[i];
    var arts = grouped[group];
    if (!arts || arts.length === 0) continue;

    htmlBody += '<strong>' + group + '</strong><br/>';
    var sorted = arts.sort(function (a, b) {
      var ap = calculateKeywordPriority(a);
      var bp = calculateKeywordPriority(b);
      if (bp !== ap) return bp - ap;
      if (b.importanceScore !== a.importanceScore) return b.importanceScore - a.importanceScore;
      return b.pubDate - a.pubDate;
    }).slice(0, 10);

    for (var j = 0; j < sorted.length; j++) {
      htmlBody += '<a href="' + sorted[j].link + '">' + sorted[j].title + '</a><br/>';
    }
    htmlBody += '<br/>';
  }

  try {
    GmailApp.sendEmail(EMAIL_RECIPIENT, subject, '', {
      name: 'News Bot',
      htmlBody: htmlBody
    });
    Logger.log('✅ 이메일 전송 성공! (수신처: 여러 명)');
    return true;
  } catch (e) {
    Logger.log('❌ 이메일 전송 에러: ' + e.toString());
    return false;
  }
}

// ===== API 키 설정 함수 (한 번만 실행) =====
function setApiKey() {
  var key = typeof SECRETS !== 'undefined' ? SECRETS.OPENAI_API_KEY : '';
  if (key) {
    PropertiesService.getScriptProperties().setProperty('OPENAI_API_KEY', key);
    Logger.log('✅ API 키가 설정되었습니다.');
  } else {
    Logger.log('⚠️ SECRETS에 API 키가 정의되어 있지 않습니다.');
  }
}