// ===== 간단한 GPT 체크 (고점수 기사만 대상) =====
function simpleGPTRelevanceCheck(articles) {
  if (articles.length === 0) return [];
  
  Logger.log('\n🤖 === 선별적 GPT 관련성 체크 시작 ===');
  
  // 점수 8점 이상인 기사만 GPT 체크 대상
  var highScoreArticles = articles.filter(function(a) { return a.importanceScore >= 8; });
  var lowScoreArticles = articles.filter(function(a) { return a.importanceScore < 8; });
  
  Logger.log('📊 GPT 체크 대상: ' + highScoreArticles.length + '개 (8점 이상)');
  Logger.log('📊 자동 통과: ' + lowScoreArticles.length + '개 (8점 미만)');
  
  if (highScoreArticles.length === 0) {
    return articles;
  }
  
  // 그룹별로 나누어 GPT 체크
  var groupedHighScore = {};
  for (var i = 0; i < highScoreArticles.length; i++) {
    var article = highScoreArticles[i];
    var displayGroup = KEYWORD_GROUPING[article.keyword] || article.keyword;
    
    if (!groupedHighScore[displayGroup]) {
      groupedHighScore[displayGroup] = [];
    }
    groupedHighScore[displayGroup].push(article);
  }
  
  var validatedArticles = [];
  var gptCallCount = 0;
  
  for (var groupName in groupedHighScore) {
    var groupArticles = groupedHighScore[groupName];
    
    // 그룹당 최대 10개씩만 GPT 체크 (토큰 절약)
    var checkArticles = groupArticles.slice(0, 10);
    
    Logger.log('🔍 ' + groupName + ': ' + checkArticles.length + '개 기사 GPT 관련성 체크...');
    
    var prompt = getSimpleRelevancePrompt(groupName, checkArticles);
    gptCallCount++;
    
    try {
      var gptResponse = callSimpleGPT(prompt);
      
      if (!gptResponse) {
        Logger.log('⚠️ ' + groupName + ': GPT 호출 실패 → 모든 기사 통과');
        validatedArticles = validatedArticles.concat(checkArticles);
      } else {
        var validNumbers = gptResponse.match(/\d+/g) || [];
        var validIndices = validNumbers.map(function(n) { return parseInt(n) - 1; })
                                      .filter(function(i) { return i >= 0 && i < checkArticles.length; });
        
        if (validIndices.length === 0) {
          Logger.log('⚠️ ' + groupName + ': 유효한 응답 없음 → 상위 50% 통과');
          var halfCount = Math.ceil(checkArticles.length / 2);
          validatedArticles = validatedArticles.concat(checkArticles.slice(0, halfCount));
        } else {
          for (var i = 0; i < validIndices.length; i++) {
            validatedArticles.push(checkArticles[validIndices[i]]);
          }
          Logger.log('✅ ' + groupName + ': ' + checkArticles.length + '개 → ' + validIndices.length + '개 통과');
        }
      }
      
    } catch (e) {
      Logger.log('❌ ' + groupName + ': GPT 에러 → 모든 기사 통과: ' + e.toString());
      validatedArticles = validatedArticles.concat(checkArticles);
    }
    
    Utilities.sleep(300); // 짧은 대기
  }
  
  Logger.log('🤖 GPT 체크 완료: ' + gptCallCount + '회 호출, ' + highScoreArticles.length + '개 → ' + validatedArticles.length + '개 검증');

  // 검증된 고점수 기사 + 저점수 기사 합쳐서 반환
  return validatedArticles.concat(lowScoreArticles);
}

// ===== GPT 기반 중복 기사 제거 =====
function gptDeduplicateArticles(articles) {
  if (articles.length === 0) return [];

  Logger.log('\n🔄 === GPT 기반 중복 제거 시작 ===');
  Logger.log('📊 입력: ' + articles.length + '개 기사');

  // 그룹별로 나누어 GPT 중복 체크
  var groupedArticles = {};
  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];
    var displayGroup = KEYWORD_GROUPING[article.keyword] || article.keyword;

    if (!groupedArticles[displayGroup]) {
      groupedArticles[displayGroup] = [];
    }
    groupedArticles[displayGroup].push(article);
  }

  var deduplicatedArticles = [];
  var gptCallCount = 0;
  var totalRemoved = 0;

  for (var groupName in groupedArticles) {
    var groupArticles = groupedArticles[groupName];

    // 그룹 내 기사가 5개 미만이면 GPT 체크 스킵 (중복 가능성 낮음)
    if (groupArticles.length < 5) {
      deduplicatedArticles = deduplicatedArticles.concat(groupArticles);
      Logger.log('⏭️ ' + groupName + ': ' + groupArticles.length + '개 (GPT 스킵 - 기사 수 적음)');
      continue;
    }

    // 그룹당 최대 15개씩만 GPT 체크
    var checkArticles = groupArticles.slice(0, 15);

    Logger.log('🔍 ' + groupName + ': ' + checkArticles.length + '개 기사 GPT 중복 체크...');

    var prompt = getDeduplicationPrompt(groupName, checkArticles);
    gptCallCount++;

    try {
      var gptResponse = callSimpleGPT(prompt);

      if (!gptResponse) {
        Logger.log('⚠️ ' + groupName + ': GPT 호출 실패 → 모든 기사 유지');
        deduplicatedArticles = deduplicatedArticles.concat(checkArticles);
      } else {
        // GPT 응답 파싱: 유지할 기사 번호들
        var keepNumbers = gptResponse.match(/\d+/g) || [];
        var keepIndices = keepNumbers.map(function(n) { return parseInt(n) - 1; })
                                     .filter(function(i) { return i >= 0 && i < checkArticles.length; });

        if (keepIndices.length === 0) {
          Logger.log('⚠️ ' + groupName + ': 유효한 응답 없음 → 모든 기사 유지');
          deduplicatedArticles = deduplicatedArticles.concat(checkArticles);
        } else {
          var removedCount = checkArticles.length - keepIndices.length;
          totalRemoved += removedCount;

          for (var i = 0; i < keepIndices.length; i++) {
            deduplicatedArticles.push(checkArticles[keepIndices[i]]);
          }
          Logger.log('✅ ' + groupName + ': ' + checkArticles.length + '개 → ' + keepIndices.length + '개 유지 (' + removedCount + '개 중복 제거)');
        }
      }

    } catch (e) {
      Logger.log('❌ ' + groupName + ': GPT 에러 → 모든 기사 유지: ' + e.toString());
      deduplicatedArticles = deduplicatedArticles.concat(checkArticles);
    }

    Utilities.sleep(500); // API 호출 간 대기
  }

  Logger.log('🔄 GPT 중복 제거 완료: ' + gptCallCount + '회 호출, ' + articles.length + '개 → ' + deduplicatedArticles.length + '개 (중복 ' + totalRemoved + '개 제거)');

  return deduplicatedArticles;
}

// ===== GPT 중복 제거 프롬프트 =====
function getDeduplicationPrompt(groupName, articles) {
  var contentList = [];
  for (var i = 0; i < articles.length; i++) {
    var a = articles[i];
    contentList.push((i + 1) + '. "' + a.title + '"');
  }

  return '당신은 뉴스 큐레이션 전문가입니다. 다음 "' + groupName + '" 그룹 기사들 중에서 중복되거나 유사한 내용의 기사들을 제거하고 유지할 기사들만 선별해주세요.\n\n**중복 판정 기준:**\n1️⃣ 제목에 같은 핵심 키워드가 3개 이상 반복되는 경우\n2️⃣ 같은 사건/이슈를 다루는 기사 (예: "A사 매출 증가" vs "A사 실적 호조")\n3️⃣ 뉘앙스가 매우 유사한 경우 (예: "B사 신제품 출시" vs "B사 새로운 제품 런칭")\n\n**선별 우선순위:**\n- 더 구체적이고 정보가 많은 기사 우선\n- 공식 발표/실적 관련 기사 우선\n- 제목이 명확한 기사 우선\n\n**중복이 아닌 경우:**\n- 서로 다른 사건/이슈를 다루는 경우\n- 시간대가 다른 별개의 뉴스인 경우\n- 같은 회사라도 다른 주제인 경우\n\n**출력 형식:** 유지할 기사 번호만 쉼표로 구분 (예: 1,3,5,7)\n\n📰 기사 목록:\n' + contentList.join('\n');
}

// ===== 간단한 GPT 프롬프트 =====
function getSimpleRelevancePrompt(groupName, articles) {
  var contentList = [];
  for (var i = 0; i < articles.length; i++) {
    var a = articles[i];
    contentList.push((i + 1) + '. "' + a.title + '"');
  }

  return '당신은 PE투자사의 포트폴리오 모니터링 전문가입니다. "' + groupName + '" 그룹 기업들과 직접 관련된 의미있는 뉴스만 선별해주세요.\n\n**선별 기준:**\n✅ 해당 기업의 실적, 경영진, 사업변화, M&A 등 직접 관련\n❌ 업계 일반 동향, 이벤트/프로모션, 사회공헌, 단순 언급\n\n**출력:** 관련성 있는 기사 번호만 쉼표로 구분 (예: 1,3,5)\n\n기사 목록:\n' + contentList.join('\n');
}

// ===== 간단한 GPT 호출 (토큰 최소화) =====
function callSimpleGPT(prompt) {
  var OPENAI_API_KEY = 'sk-proj-';

  try {
    var response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY
      },
      payload: JSON.stringify({
        model: "gpt-4o-mini", // 저렴한 모델 사용
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 100, // 토큰 제한
        top_p: 0.9
      }),
      muteHttpExceptions: true
    });

    var responseCode = response.getResponseCode();
    if (responseCode === 200) {
      var result = JSON.parse(response.getContentText());
      if (result.choices && result.choices[0] && result.choices[0].message) {
        return result.choices[0].message.content.trim();
      }
    }
    
  } catch (e) {
    Logger.log('GPT 호출 에러: ' + e.toString());
  }
  
  return null;
}

// ===== 텍스트 유사도 계산 =====
function calculateTextSimilarity(text1, text2) {
  // 텍스트 정규화
  var normalize = function(text) {
    return text.toLowerCase()
      .replace(/[^\w가-힣\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  var norm1 = normalize(text1);
  var norm2 = normalize(text2);
  
  if (norm1 === norm2) return 1.0;
  
  // 단어 기반 유사도
  var words1 = norm1.split(' ').filter(function(w) { return w.length > 1; });
  var words2 = norm2.split(' ').filter(function(w) { return w.length > 1; });
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  var commonWords = 0;
  for (var i = 0; i < words1.length; i++) {
    if (words2.indexOf(words1[i]) !== -1) {
      commonWords++;
    }
  }
  
  return commonWords / Math.max(words1.length, words2.length);
}

// ===== 통합 뉴스 수집 함수 (네이버 + 구글) =====
function fetchAllNewsFromBothSources() {
  Logger.log('\n📥 === 1단계: 네이버 + 구글 뉴스 통합 수집 시작 ===');
  Logger.log('📋 키워드 (' + KEYWORDS.length + '개): ' + KEYWORDS.join(', '));
  
  var allRawArticles = [];
  
  for (var i = 0; i < KEYWORDS.length; i++) {
    var keyword = KEYWORDS[i];
    Logger.log('\n📰 [' + (i + 1) + '/' + KEYWORDS.length + '] ' + keyword + ' 수집 중...');
    
    try {
      // 네이버 뉴스 수집
      var naverArticles = fetchRawArticlesForKeyword(keyword);
      Logger.log('  📰 네이버: ' + naverArticles.length + '개 수집');
      
      // 구글 뉴스 수집
      var googleArticles = [];
      if (ENABLE_GOOGLE_NEWS) {
        googleArticles = fetchGoogleNewsForKeyword(keyword);
        Logger.log('  🌐 구글: ' + googleArticles.length + '개 수집');
      }
      
      // 통합
      var keywordTotal = naverArticles.concat(googleArticles);
      allRawArticles = allRawArticles.concat(keywordTotal);
      
      Logger.log('✅ ' + keyword + ': 총 ' + keywordTotal.length + '개 기사 수집 (네이버 ' + naverArticles.length + ' + 구글 ' + googleArticles.length + ')');
      
    } catch (e) {
      Logger.log('❌ ' + keyword + ' 수집 중 에러: ' + e.toString());
    }
    
    Utilities.sleep(500); // 구글 뉴스 포함으로 대기 시간 증가
  }
  
  Logger.log('\n📊 === 1단계 완료: 총 ' + allRawArticles.length + '개 기사 수집 (네이버 + 구글) ===');
  return allRawArticles;
}

// ===== 1단계: 모든 키워드의 뉴스 수집 (기존 네이버 전용) =====
function fetchAllNewsForAllKeywords() {
  return fetchAllNewsFromBothSources(); // 통합 수집 함수 사용
}

function fetchRawArticlesForKeyword(keyword) {
  var queries = [
    encodeURIComponent('"' + keyword + '"'),
    encodeURIComponent(keyword)
  ];
  
  var allItems = [];
  
  for (var i = 0; i < queries.length; i++) {
    var q = queries[i];
    var searchType = i === 0 ? '정확검색' : '일반검색';
    var url = 'https://openapi.naver.com/v1/search/news.json?query=' + q + '&sort=date&display=' + NEWS_COUNT;
    
    try {
      var response = UrlFetchApp.fetch(url, {
        headers: { 
          'X-Naver-Client-Id': CLIENT_ID, 
          'X-Naver-Client-Secret': CLIENT_SECRET 
        },
        muteHttpExceptions: true
      });
      
      if (response.getResponseCode() === 200) {
        var data = JSON.parse(response.getContentText());
        
        if (data && data.items && data.items.length) {
          allItems = allItems.concat(data.items);
          Logger.log('  ' + keyword + ' ' + searchType + ': ' + data.items.length + '개');
        }
      } else {
        Logger.log('  ' + keyword + ' ' + searchType + ' API 에러: ' + response.getResponseCode());
      }
    } catch (e) {
      Logger.log('  ' + keyword + ' ' + searchType + ' 에러: ' + e.toString());
    }
    
    Utilities.sleep(100);
  }
  
  var uniqueItems = [];
  for (var i = 0; i < allItems.length; i++) {
    var item = allItems[i];
    if (!item || !item.link) continue;
    
    var isDuplicate = false;
    for (var j = 0; j < uniqueItems.length; j++) {
      if (uniqueItems[j] && uniqueItems[j].link === item.link) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      uniqueItems.push(item);
    }
  }
  
  var twoDaysAgo = new Date(Date.now() - (15 * 60 * 60 * 1000));
  var processedItems = [];
  
  for (var i = 0; i < uniqueItems.length; i++) {
    var item = uniqueItems[i];
    try {
      if (!item || !item.title || !item.link || !item.pubDate) continue;
      
      var pubDate = new Date(item.pubDate);
      var cleanTitle = cleanText(item.title);
      var cleanDesc = cleanText(item.description || '');
      
      if (pubDate && !isNaN(pubDate.getTime()) && pubDate >= twoDaysAgo && cleanTitle.length > 10) {
        var processedItem = {
          keyword: keyword,
          title: cleanTitle,
          link: item.link,
          originallink: item.originallink,
          pubDate: pubDate,
          pubDateStr: Utilities.formatDate(pubDate, 'GMT+9', 'yyyy-MM-dd HH:mm'),
          description: cleanDesc,
          source: extractNewsSource(item.originallink || item.link, cleanTitle, cleanDesc)
        };
        processedItems.push(processedItem);
      }
    } catch (e) {
      // 에러 발생한 아이템은 건너뛰기
    }
  }
  
  return processedItems;
}

// ===== 2단계: 강화된 중복 제거 =====
function removeDuplicatesFromAllArticles(articles) {
  Logger.log('\n🔄 === 2단계: 강화된 중복 제거 시작 ===');
  Logger.log('입력: ' + articles.length + '개 기사');
  
  var uniqueArticles = [];
  var duplicateCount = 0;
  
  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];
    var isDuplicate = false;
    
    for (var j = 0; j < uniqueArticles.length; j++) {
      var existing = uniqueArticles[j];
      
      // 1. 링크 기반 중복 체크
      if (existing.link === article.link) {
        isDuplicate = true;
        Logger.log('  중복 제거 (동일링크): "' + article.title.substring(0, 50) + '..."');
        break;
      }
      
      // 2. 강화된 단어 중복 체크 (3개 이상) - 더 좋은 기사로 교체
      if (isStrongDuplicate(existing.title, article.title)) {
        // 우선순위가 높은 기사를 유지
        var existingPriority = calculateKeywordPriority(existing);
        var articlePriority = calculateKeywordPriority(article);
        
        if (articlePriority > existingPriority) {
          // 새 기사가 더 좋음 - 기존 기사를 새 기사로 교체
          uniqueArticles[j] = article;
          Logger.log('  중복 교체 (키워드 우선순위 ' + articlePriority + ' > ' + existingPriority + '): "' + article.title.substring(0, 40) + '..." ← "' + existing.title.substring(0, 40) + '..."');
        } else if (articlePriority === existingPriority) {
          // 우선순위 같으면 중요도 점수로 비교
          if (article.importanceScore > existing.importanceScore) {
            uniqueArticles[j] = article;
            Logger.log('  중복 교체 (점수 ' + article.importanceScore + ' > ' + existing.importanceScore + '): "' + article.title.substring(0, 40) + '..."');
          } else {
            Logger.log('  중복 제거 (낮은 점수): "' + article.title.substring(0, 40) + '..." (기존 유지)');
          }
        } else {
          // 기존 기사가 더 좋음 - 새 기사 제거
          Logger.log('  중복 제거 (낮은 우선순위): "' + article.title.substring(0, 40) + '..." (기존 유지)');
        }
        isDuplicate = true;
        break;
      }
      
      // 3. 기존 유사도 체크 (0.8로 상향) - 더 좋은 기사로 교체
      var similarity = calculateTextSimilarity(existing.title, article.title);
      if (similarity >= 0.8) {
        var existingPriority = calculateKeywordPriority(existing);
        var articlePriority = calculateKeywordPriority(article);
        
        if (articlePriority > existingPriority) {
          uniqueArticles[j] = article;
          Logger.log('  유사도 교체 (키워드 우선): "' + article.title.substring(0, 40) + '..."');
        } else if (articlePriority === existingPriority && article.importanceScore > existing.importanceScore) {
          uniqueArticles[j] = article;
          Logger.log('  유사도 교체 (점수 우선): "' + article.title.substring(0, 40) + '..."');
        } else {
          Logger.log('  유사도 제거 (기존 유지): "' + article.title.substring(0, 40) + '..."');
        }
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      uniqueArticles.push(article);
    } else {
      duplicateCount++;
    }
  }
  
  Logger.log('✅ 2단계 완료: ' + duplicateCount + '개 중복 처리 (교체 포함), ' + uniqueArticles.length + '개 남음');
  return uniqueArticles;
}

// ===== 3단계: PE 관점 스마트 필터링 및 선별적 GPT 검증 =====
function peSmartFilteringAndValidation(articles) {
  Logger.log('\n🎯 === 3단계: PE 관점 스마트 필터링 시작 ===');
  Logger.log('입력: ' + articles.length + '개 기사');
  
  // 각 기사에 PE 중요도 점수 추가
  for (var i = 0; i < articles.length; i++) {
    articles[i].importanceScore = calculatePEImportanceScore(articles[i]);
  }
  
  // 점수 2점 이상인 기사만 필터링 (관련성 있는 기사)
  var relevantArticles = [];
  var irrelevantCount = 0;
  
  for (var i = 0; i < articles.length; i++) {
    if (articles[i].importanceScore >= 2) {
      relevantArticles.push(articles[i]);
    } else {
      irrelevantCount++;
    }
  }
  
  Logger.log('📊 관련성 필터링: ' + irrelevantCount + '개 비관련 기사 제거, ' + relevantArticles.length + '개 유지');
  
  // 선별적 GPT 검증 (고점수 기사만)
  var validatedArticles = simpleGPTRelevanceCheck(relevantArticles);
  
  // 그룹별로 분류하고 상위 기사 선별
  var groupedArticles = {};
  for (var i = 0; i < validatedArticles.length; i++) {
    var article = validatedArticles[i];
    var displayGroup = KEYWORD_GROUPING[article.keyword] || article.keyword;
    
    if (!groupedArticles[displayGroup]) {
      groupedArticles[displayGroup] = [];
    }
    groupedArticles[displayGroup].push(article);
  }
  
  var finalArticles = [];
  
  for (var groupName in groupedArticles) {
    var groupArticles = groupedArticles[groupName];
    
    // 키워드 우선순위 + 중요도 점수 + 날짜로 정렬
    groupArticles.sort(function(a, b) {
      // 1순위: 키워드 우선순위
      var aPriority = calculateKeywordPriority(a);
      var bPriority = calculateKeywordPriority(b);
      if (bPriority !== aPriority) {
        return bPriority - aPriority;
      }
      
      // 2순위: 중요도 점수
      if (b.importanceScore !== a.importanceScore) {
        return b.importanceScore - a.importanceScore;
      }
      
      // 3순위: 최신순
      return b.pubDate - a.pubDate;
    });
    
    // 그룹별 최대 8개 선별 (PE 관점에서 집중도 향상)
    var maxArticlesPerGroup = Math.min(8, groupArticles.length);
    var selectedArticles = groupArticles.slice(0, maxArticlesPerGroup);
    
    // 키워드 포함 기사 개수 계산
    var keywordIncludedCount = selectedArticles.filter(function(a) {
      return calculateKeywordPriority(a) >= 50;
    }).length;
    
    Logger.log('📈 ' + groupName + ': ' + groupArticles.length + '개 → ' + selectedArticles.length + '개 선별 (키워드포함: ' + keywordIncludedCount + '개, 평균점수: ' + 
      Math.round(selectedArticles.reduce(function(sum, a) { return sum + a.importanceScore; }, 0) / selectedArticles.length) + '점)');
    
    finalArticles = finalArticles.concat(selectedArticles);
  }
  
  Logger.log('✅ 3단계 완료: ' + articles.length + '개 → ' + finalArticles.length + '개 PE 관점 선별');
  return finalArticles;
}

// ===== 4단계: 최종 중복 제거 =====
function finalDuplicateRemoval(articles) {
  Logger.log('\n🔄 === 4단계: 최종 중복 제거 시작 ===');
  Logger.log('입력: ' + articles.length + '개 기사');
  
  var finalUniqueArticles = [];
  var finalDuplicateCount = 0;
  
  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];
    var isDuplicate = false;
    
    for (var j = 0; j < finalUniqueArticles.length; j++) {
      var existing = finalUniqueArticles[j];
      
      // 강화된 단어 중복 체크 (3개 이상)
      if (isStrongDuplicate(existing.title, article.title)) {
        // 키워드 우선순위 → 중요도 점수 순으로 비교
        var existingPriority = calculateKeywordPriority(existing);
        var articlePriority = calculateKeywordPriority(article);
        
        if (articlePriority > existingPriority) {
          finalUniqueArticles[j] = article;
          Logger.log('  최종 중복 교체 (키워드 우선): "' + article.title.substring(0, 40) + '..."');
        } else if (articlePriority === existingPriority && article.importanceScore > existing.importanceScore) {
          finalUniqueArticles[j] = article;
          Logger.log('  최종 중복 교체 (점수 우선): "' + article.title.substring(0, 40) + '..."');
        } else {
          Logger.log('  최종 중복 제거: "' + article.title.substring(0, 40) + '..."');
        }
        isDuplicate = true;
        break;
      }
      
      // 기존 유사도 체크 (0.6 유지)
      var similarity = calculateTextSimilarity(existing.title, article.title);
      if (similarity >= 0.6) {
        var existingPriority = calculateKeywordPriority(existing);
        var articlePriority = calculateKeywordPriority(article);
        
        if (articlePriority > existingPriority) {
          finalUniqueArticles[j] = article;
          Logger.log('  최종 유사도 교체 (키워드 우선): "' + article.title.substring(0, 40) + '..."');
        } else if (articlePriority === existingPriority && article.importanceScore > existing.importanceScore) {
          finalUniqueArticles[j] = article;
          Logger.log('  최종 유사도 교체 (점수 우선): "' + article.title.substring(0, 40) + '..."');
        } else {
          Logger.log('  최종 유사도 제거: "' + article.title.substring(0, 40) + '..."');
        }
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      finalUniqueArticles.push(article);
    } else {
      finalDuplicateCount++;
    }
  }
  
  Logger.log('✅ 4단계 완료: ' + finalDuplicateCount + '개 추가 제거, ' + finalUniqueArticles.length + '개 최종 확정');
  return finalUniqueArticles;
}

// ===== 기사들을 그룹별로 정리하는 함수 =====
function groupArticlesByDisplayGroup(articles) {
  var groupedArticles = {};
  
  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];
    var displayGroup = KEYWORD_GROUPING[article.keyword] || article.keyword;
    
    if (!groupedArticles[displayGroup]) {
      groupedArticles[displayGroup] = [];
    }
    
    groupedArticles[displayGroup].push(article);
  }
  
  return groupedArticles;
}

function sendSlackNewsReport(finalArticles) {
  if (!SEND_SLACK || !finalArticles.length) {
    Logger.log('⚠️ Slack 뉴스 발송이 비활성화되어 있거나 기사가 없습니다.');
    return false;
  }

  try {
    var groupedArticles = groupArticlesByDisplayGroup(finalArticles);
    var dateStr = Utilities.formatDate(new Date(), 'GMT+9', 'MM월 dd일');

    var groupOrder = [
      'BKR', 'HCI', 'UBase', 'Serveone',
      'Lock&Lock', 'JOBKOREA',
      'YGY', 'SKR and LTR', 'Market'
    ];

    var blocks = [];

    for (var i = 0; i < groupOrder.length; i++) {
      var groupName = groupOrder[i];
      var articles = groupedArticles[groupName];
      if (!articles || articles.length === 0) continue;

      var message = '*' + groupName + '*\n';
      // 키워드 우선순위 + 중요도 점수와 날짜로 정렬
      var sortedArticles = articles.sort(function(a, b) {
        // 1순위: 키워드 우선순위
        var aPriority = calculateKeywordPriority(a);
        var bPriority = calculateKeywordPriority(b);
        if (bPriority !== aPriority) {
          return bPriority - aPriority;
        }
        
        // 2순위: 중요도 점수
        if (b.importanceScore !== a.importanceScore) {
          return b.importanceScore - a.importanceScore;
        }
        
        // 3순위: 최신순
        return b.pubDate - a.pubDate;
      }).slice(0, 10);
      
      for (var j = 0; j < sortedArticles.length; j++) {
        var article = sortedArticles[j];
        message += '<' + article.link + '|' + article.title + '>\n';
      }

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: message.trim()
        }
      });
    }

    // 나머지 그룹 처리
    for (var groupName in groupedArticles) {
      if (groupOrder.indexOf(groupName) !== -1 || groupedArticles[groupName].length === 0) continue;

      var articles = groupedArticles[groupName];
      var message = '*' + groupName + '*\n';
      var sortedArticles = articles.sort(function(a, b) {
        // 1순위: 키워드 우선순위
        var aPriority = calculateKeywordPriority(a);
        var bPriority = calculateKeywordPriority(b);
        if (bPriority !== aPriority) {
          return bPriority - aPriority;
        }
        
        // 2순위: 중요도 점수
        if (b.importanceScore !== a.importanceScore) {
          return b.importanceScore - a.importanceScore;
        }
        
        // 3순위: 최신순
        return b.pubDate - a.pubDate;
      }).slice(0, 10);
      
      for (var j = 0; j < sortedArticles.length; j++) {
        var article = sortedArticles[j];
        message += '<' + article.link + '|' + article.title + '>\n';
      }

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: message.trim()
        }
      });
    }

    // summary block
    blocks.unshift({
      type: "section",
      text: {
        type: "mrkdwn",
        text: ':bar_chart: *Daily News Run - ' + dateStr + '*\nTotal ' + finalArticles.length + ' Articles'
      }
    });

    var payload = {
      username: 'News Bot',
      icon_emoji: ':newspaper:',
      channel: SLACK_CHANNEL,
      blocks: blocks
    };

    var response = UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    if (response.getResponseCode() === 200) {
      Logger.log('✅ Slack 뉴스 보고서 전송 성공 (' + finalArticles.length + '개 기사)');
      return true;
    } else {
      Logger.log('❌ Slack 전송 실패: ' + response.getContentText());
      return false;
    }

  } catch (e) {
    Logger.log('❌ Slack 뉴스 발송 중 에러: ' + e.toString());
    return false;
  }
}

// ===== 메인 실행 함수 =====
function fetchAndWrite() {
  var startTime = new Date();
  Logger.log('\n🚀 === 스마트 뉴스 큐레이션 시작: ' + Utilities.formatDate(startTime, 'GMT+9', 'yyyy-MM-dd HH:mm:ss') + ' ===');
  Logger.log('📋 키워드 (' + KEYWORDS.length + '개): ' + KEYWORDS.join(', '));
  
  var sheet = SpreadsheetApp.getActive().getSheetByName('뉴스 Part 1') || SpreadsheetApp.getActive().getActiveSheet();
  sheet.clear();
  sheet.appendRow(['사이트', '검색 키워드', '날짜', '제목', '링크', '중요도 점수', '언론사']);

  try {
    var allRawArticles = fetchAllNewsFromBothSources(); // 통합 수집 사용

    if (allRawArticles.length === 0) {
      Logger.log('수집된 기사가 없습니다. 프로세스 종료.');
      return;
    }

    var uniqueArticles = removeDuplicatesFromAllArticles(allRawArticles);
    var peFilteredArticles = peSmartFilteringAndValidation(uniqueArticles);
    var gptDeduplicatedArticles = gptDeduplicateArticles(peFilteredArticles); // GPT 기반 중복 제거
    var finalArticles = finalDuplicateRemoval(gptDeduplicatedArticles);
    
    // 최종 정렬: 키워드 우선순위 > 중요도 점수 > 날짜
    finalArticles.sort(function(a, b) {
      // 1순위: 키워드 우선순위
      var aPriority = calculateKeywordPriority(a);
      var bPriority = calculateKeywordPriority(b);
      if (bPriority !== aPriority) {
        return bPriority - aPriority;
      }
      
      // 2순위: 중요도 점수
      if (b.importanceScore !== a.importanceScore) {
        return b.importanceScore - a.importanceScore;
      }
      
      // 3순위: 최신순
      return b.pubDate - a.pubDate;
    });

    for (var i = 0; i < finalArticles.length; i++) {
      var article = finalArticles[i];
      var sourceType = article.source === '구글뉴스' || article.link.includes('news.google.com') ? '구글뉴스' : '네이버';
      sheet.appendRow([
        sourceType,
        article.keyword,
        article.pubDateStr,
        article.title,
        article.link,
        article.importanceScore,
        article.source
      ]);
    }
    
    var endTime = new Date();
    var duration = (endTime - startTime) / 1000;
    
    Logger.log('\n📊 === 최종 결과 ===');
    Logger.log('📥 수집: ' + allRawArticles.length + '개 → 🔄 중복제거: ' + uniqueArticles.length + '개 → 🎯 PE필터링: ' + peFilteredArticles.length + '개 → 🤖 GPT중복제거: ' + gptDeduplicatedArticles.length + '개 → 🏆 최종선별: ' + finalArticles.length + '개');
    Logger.log('⏱️ 전체 작업 시간: ' + Math.round(duration) + '초 (네이버+구글 통합 PE 필터링 + GPT 중복제거)');
    
    // 중요도 통계
    var scoreStats = {
      'critical': finalArticles.filter(function(a) { return a.importanceScore >= 15; }).length,
      'high': finalArticles.filter(function(a) { return a.importanceScore >= 10 && a.importanceScore < 15; }).length,
      'medium': finalArticles.filter(function(a) { return a.importanceScore >= 5 && a.importanceScore < 10; }).length,
      'low': finalArticles.filter(function(a) { return a.importanceScore < 5; }).length
    };
    
    Logger.log('\n📈 === PE 중요도 분포 ===');
    Logger.log('🔥 매우중요(15+점): ' + scoreStats.critical + '개');
    Logger.log('⭐ 중요(10-14점): ' + scoreStats.high + '개');
    Logger.log('📈 보통(5-9점): ' + scoreStats.medium + '개');
    Logger.log('📄 낮음(2-4점): ' + scoreStats.low + '개');
    
    Logger.log('\n📈 === 그룹별 최종 통계 ===');
    var groupStats = groupArticlesByDisplayGroup(finalArticles);
    for (var group in groupStats) {
      var articles = groupStats[group];
      var avgScore = Math.round(articles.reduce(function(sum, a) { return sum + a.importanceScore; }, 0) / articles.length);
      Logger.log('  ' + group + ': ' + articles.length + '개 기사 (평균 ' + avgScore + '점)');
    }

    if (finalArticles.length > 0) {
      sendSlackNewsReport(finalArticles);
    } else {
      Logger.log('최종 선별된 기사가 없어 Slack 발송을 생략합니다.');
    }
    
  } catch (e) {
    Logger.log('❌ 전체 프로세스 중 에러: ' + e.toString());
  }
}

function sendSlackOnly() {
  var startTime = new Date();
  Logger.log('\n🚀 === Slack 전용 스마트 뉴스 큐레이션 시작: ' + Utilities.formatDate(startTime, 'GMT+9', 'yyyy-MM-dd HH:mm:ss') + ' ===');
  
  try {
    var allRawArticles = fetchAllNewsFromBothSources(); // 통합 수집 사용
    var uniqueArticles = removeDuplicatesFromAllArticles(allRawArticles);
    var peFilteredArticles = peSmartFilteringAndValidation(uniqueArticles);
    var gptDeduplicatedArticles = gptDeduplicateArticles(peFilteredArticles); // GPT 기반 중복 제거
    var finalArticles = finalDuplicateRemoval(gptDeduplicatedArticles);
    
    finalArticles.sort(function(a, b) {
      // 1순위: 키워드 우선순위
      var aPriority = calculateKeywordPriority(a);
      var bPriority = calculateKeywordPriority(b);
      if (bPriority !== aPriority) {
        return bPriority - aPriority;
      }
      
      // 2순위: 중요도 점수
      if (b.importanceScore !== a.importanceScore) {
        return b.importanceScore - a.importanceScore;
      }
      
      // 3순위: 최신순
      return b.pubDate - a.pubDate;
    });

    var endTime = new Date();
    var duration = Math.round((endTime - startTime) / 1000);

    Logger.log('\n📊 === Slack 전용 네이버+구글 통합 결과 ===');
    Logger.log('📥 ' + allRawArticles.length + '개 → 🔄 ' + uniqueArticles.length + '개 → 🎯 ' + peFilteredArticles.length + '개 → 🤖 ' + gptDeduplicatedArticles.length + '개 → 🏆 ' + finalArticles.length + '개');
    Logger.log('⏱️ 소요 시간: ' + duration + '초 (네이버+구글 통합 PE 처리 + GPT 중복제거)');

    if (finalArticles.length > 0) {
      var avgScore = Math.round(finalArticles.reduce(function(sum, a) { return sum + a.importanceScore; }, 0) / finalArticles.length);
      Logger.log('📊 평균 PE 중요도: ' + avgScore + '점');
      sendSlackNewsReport(finalArticles);
    } else {
      Logger.log('최종 선별된 기사가 없어 Slack 발송을 생략합니다.');
    }
    
  } catch (e) {
    Logger.log('❌ Slack 전용 프로세스 중 에러: ' + e.toString());
  }
}

// ===== 테스트 함수들 =====
function testSlackWebhook() {
  Logger.log('=== 📱 Slack 웹훅 테스트 ===');
  
  var testArticles = [
    {
      keyword: '버거킹',
      title: '버거킹, 국내 매장 수 200개 돌파',
      link: 'https://test.com/1',
      pubDate: new Date(),
      pubDateStr: '2024-07-11 10:00',
      importanceScore: 18,
      source: '한국경제'
    },
    {
      keyword: 'SK렌터카',
      title: 'SK렌터카 신규 서비스 출시',
      link: 'https://test.com/2',
      pubDate: new Date(),
      pubDateStr: '2024-07-11 12:00',
      importanceScore: 8,
      source: '매일경제'
    }
  ];
  
  try {
    Logger.log('📊 테스트 데이터: ' + testArticles.length + '개 기사');
    
    var success = sendSlackNewsReport(testArticles);
    
    if (success) {
      Logger.log('✅ Slack 웹훅 테스트 성공');
    } else {
      Logger.log('❌ Slack 웹훅 테스트 실패');
    }
    
  } catch (e) {
    Logger.log('❌ Slack 웹훅 테스트 실패: ' + e.toString());
  }
  
  Logger.log('=== 📱 테스트 완료 ===');
}

function testImportanceScoring() {
  Logger.log('=== 🎯 중요도 점수 테스트 ===');
  
  var testArticles = [
    {
      keyword: '버거킹',
      title: '버거킹 3분기 매출 증가, 전년 대비 15% 상승',
      description: '버거킹이 3분기 실적을 발표하며 매출이 크게 증가했다고 발표했다.',
      source: '한국경제',
      pubDate: new Date()
    },
    {
      keyword: '잡코리아',
      title: '잡코리아 새로운 AI 채용 서비스 출시',
      description: '잡코리아가 AI 기반 채용 매칭 서비스를 새롭게 출시한다고 발표했다.',
      source: '기타언론',
      pubDate: new Date(Date.now() - 12 * 60 * 60 * 1000)
    },
    {
      keyword: 'SK렌터카',
      title: 'SK렌터카 신임 CEO 선임, 디지털 혁신 가속화 예고',
      description: 'SK렌터카가 새로운 CEO를 선임하고 디지털 혁신을 가속화하겠다고 밝혔다.',
      source: '파이낸셜뉴스',
      pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ];
  
  for (var i = 0; i < testArticles.length; i++) {
    var article = testArticles[i];
    var score = calculatePEImportanceScore(article);
    Logger.log((i + 1) + '. "' + article.title + '" → ' + score + '점');
  }
  
  Logger.log('=== 🎯 중요도 점수 테스트 완료 ===');
}

function testCompleteProcess() {
  Logger.log('🔍 === 완전한 프로세스 테스트 (제한된 키워드) ===');
  
  try {
    var originalKeywords = KEYWORDS.slice();
    var originalGoogleNews = ENABLE_GOOGLE_NEWS;
    
    KEYWORDS.length = 0;
    KEYWORDS.push('버거킹', 'SK렌터카');
    ENABLE_GOOGLE_NEWS = true; // 구글 뉴스도 테스트
    
    Logger.log('🔍 제한된 키워드로 네이버+구글 뉴스 수집 테스트...');
    var testArticles = fetchAllNewsFromBothSources();
    
    Logger.log('📊 수집된 기사: ' + testArticles.length + '개');
    
    if (testArticles.length > 0) {
      var uniqueArticles = removeDuplicatesFromAllArticles(testArticles);
      Logger.log('📊 중복 제거 후: ' + uniqueArticles.length + '개');
      
      var peFiltered = peSmartFilteringAndValidation(uniqueArticles);
      Logger.log('📊 PE 필터링 후: ' + peFiltered.length + '개');
      
      var finalArticles = finalDuplicateRemoval(peFiltered);
      Logger.log('📊 최종 선별: ' + finalArticles.length + '개');
      
      if (finalArticles.length > 0) {
        sendSlackNewsReport(finalArticles);
      }
    } else {
      Logger.log('⚠️ 수집된 기사가 없어 테스트 데이터로 진행');
      testSlackWebhook();
    }
    
    // 원래 설정 복원
    KEYWORDS.length = 0;
    for (var i = 0; i < originalKeywords.length; i++) {
      KEYWORDS.push(originalKeywords[i]);
    }
    ENABLE_GOOGLE_NEWS = originalGoogleNews;
    
  } catch (e) {
    Logger.log('❌ 완전 프로세스 테스트 실패: ' + e.toString());
  }
  
  Logger.log('🔍 === 완전한 프로세스 테스트 완료 ===');
}

// ===== 구글 뉴스 전용 테스트 함수 =====
function testGoogleNewsOnly() {
  Logger.log('🌐 === 구글 뉴스 단독 테스트 ===');
  
  var testKeywords = ['버거킹', 'SK렌터카', 'vig'];
  
  for (var i = 0; i < testKeywords.length; i++) {
    var keyword = testKeywords[i];
    Logger.log('\n🔍 ' + keyword + ' 구글 뉴스 테스트...');
    
    try {
      var articles = fetchGoogleNewsForKeyword(keyword);
      Logger.log('📊 ' + keyword + ': ' + articles.length + '개 수집');
      
      for (var j = 0; j < Math.min(3, articles.length); j++) {
        var article = articles[j];
        Logger.log('  - "' + article.title.substring(0, 50) + '..." [' + article.source + ']');
      }
      
    } catch (e) {
      Logger.log('❌ ' + keyword + ' 구글 뉴스 테스트 실패: ' + e.toString());
    }
    
    Utilities.sleep(1000);
  }
  
  Logger.log('🌐 === 구글 뉴스 테스트 완료 ===');
}// ===== 기본 설정 =====
var CLIENT_ID = 'uR0yTrjlddTbvm1736PJ';
var CLIENT_SECRET = 'BDFXk56Okq';

// ===== 슬랙 설정 =====
var SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/T08SQU00JQ7/B091L9V9LKF/';
var SEND_SLACK = true;
var SLACK_CHANNEL = '#news-bot';

// ===== 키워드 설정 =====
var KEYWORDS = [
    '버거킹', '팀홀튼', '맥도날드', 'kfc', '투썸플레이스', '롯데리아', '현대커머셜', '유베이스', '서브원',
    '락앤락', '잡코리아', '알바몬', '사람인', '원티드', '토스알바', '당근알바', '리멤버컴퍼니', '그리팅',
    '요기요', '쿠팡이츠', '배달의민족', '배민', '땡겨요',
    'SK렌터카', '롯데렌탈', '롯데렌터카', '어피니티', '어피너티',
    'mbk', 'kkr', 'cvc', 'blackstone', 'baincapital', 'imm', 'vig', '스틱인베', '스카이레이크', '글렌우드', 'eqt', '베인캐피탈', '베인캐피털', '블랙스톤', '알토스'
];

var KEYWORD_GROUPING = {
    '버거킹': 'BKR',
    '팀홀튼': 'BKR',
    '맥도날드': 'BKR',
    'kfc': 'BKR',
    '투썸플레이스': 'BKR',
    '롯데리아': 'BKR',
    '현대커머셜': 'HCI',
    '유베이스': 'UBase',
    '서브원': 'Serveone',
    '락앤락': 'Lock&Lock',
    '잡코리아': 'JOBKOREA',
    '알바몬': 'JOBKOREA',
    '사람인': 'JOBKOREA',
    '원티드': 'JOBKOREA',
    '토스알바': 'JOBKOREA',
    '당근알바': 'JOBKOREA',
    '리멤버컴퍼니': 'JOBKOREA',
    '그리팅': 'JOBKOREA',
    '요기요': 'YGY',
    '쿠팡이츠': 'YGY',
    '배달의민족': 'YGY',
    '배민': 'YGY',
    '땡겨요': 'YGY',
    'SK렌터카': 'SKR and LTR',
    '롯데렌탈': 'SKR and LTR',
    '롯데렌터카': 'SKR and LTR',
    '어피니티': 'Market',
    '어피너티': 'Market',
    'mbk': 'Market',
    'kkr': 'Market',
    'cvc': 'Market',
    'blackstone': 'Market',
    'baincapital': 'Market',
    'imm': 'Market',
    'vig': 'Market',
    '스틱인베': 'Market',
    '스카이레이크': 'Market',
    '글렌우드': 'Market',
    'eqt': 'Market',
    '베인캐피탈': 'Market',
    '베인캐피털': 'Market',
    '블랙스톤': 'Market',
    '알토스': 'Market'
};

var NEWS_COUNT = 50;

// ===== 구글 뉴스 설정 =====
var ENABLE_GOOGLE_NEWS = true; // 구글 뉴스 수집 활성화
var GOOGLE_NEWS_REGION = 'KR'; // 한국 뉴스
var GOOGLE_NEWS_LANGUAGE = 'ko'; // 한국어

// ===== PE/투자자 관점의 키워드 필터링 =====
var PE_FOCUSED_KEYWORDS = {
    // 매우 중요 - 직접적 투자 관련 (15점)
    'critical': ['실적', '매출', '순이익', '영업이익', '손실', '적자', '흑자', 'ipo', '상장', '인수', '합병', 'm&a', '매각', '펀딩', '투자유치', '밸류에이션', '엑시트'],
    
    // 중요 - 경영/사업 변화 (10점)  
    'high': ['ceo', '대표', '사장', '회장', '경영진', '임원', '구조조정', '조직개편', '전략', '사업확장', '진출', '시장점유율', '1위', '선두'],
    
    // 보통 - 운영/성과 (7점)
    'medium': ['성장률', '증가', '감소', '출시', '런칭', '신제품', '신서비스', '경쟁', '점유율', '수익성', '마진'],
    
    // 리스크 - 부정적 요소 (5점, 모니터링 필요)
    'risk': ['논란', '소송', '규제', '제재', '조사', '압수수색', '과징금', '제재금', '분쟁', '고발']
};

var STRONG_EXCLUDE_KEYWORDS = [
    // 완전 제외 대상
    '이벤트', '프로모션', '할인', '쿠폰', '광고', '마케팅', '홍보', '캠페인',
    '사회공헌', '봉사', '기부', '후원', '나눔', '자선', 'csr',
    '워크샵', '세미나', '교육', '연수', '체험', '견학', '채용설명회',
    '시상식', '수상', '포상', '표창', '감사패', '브리핑', '발표회',
    '컨퍼런스', '포럼', '설명회', '간담회', '협약식', '서명식',
    // 연예 관련
    '연예인', '아이돌', '가수', '배우', '드라마', '영화', '방송출연', '예능', '앨범', '콘서트', '팬미팅', '화보', '인터뷰', '뮤직비디오',
    // 스포츠 관련 (SK렌터카 당구단 등)
    'pba', '당구', '포켓볼', '3쿠션', '4구', '빌리어드', '야구', '축구', '농구', '배구', '골프', '테니스',
    '경기', '선수단', '감독', '코치', '우승', '준우승', '플레이오프', 'ps진출', '순위권', '포스트시즌',
    '결승전', '준결승', '토너먼트', '리그', '시즌', '스코어', '득점', '승부', '패배', '무승부'
];

// ===== 키워드 관련성 체크 =====
var KEYWORD_RELEVANCE_CHECK = {
    '버거킹': ['버거킹', 'bk', '햄버거'],
    '팀홀튼': ['팀홀튼', 'tim', 'hortons', '도넛', '커피'],
    '맥도날드': ['맥도날드', 'mcdonald', '맥딜리버리'],
    'kfc': ['kfc', '켄터키', '치킨'],
    '투썸플레이스': ['투썸플레이스', 'twosome', 'a twosome'],
    '롯데리아': ['롯데리아', 'lotteria'],
    '현대커머셜': ['현대커머셜', '현대상용차', '트럭', '버스'],
    '유베이스': ['유베이스', 'ubase'],
    '서브원': ['서브원', 'serveone'],
    '락앤락': ['락앤락', 'locknlock'],
    '잡코리아': ['잡코리아', 'jobkorea'],
    '알바몬': ['알바몬', 'albamon'],
    '사람인': ['사람인', 'saramin'],
    '원티드': ['원티드', 'wanted'],
    '토스알바': ['토스알바', 'toss', '알바'],
    '당근알바': ['당근알바', '당근', '알바'],
    '리멤버컴퍼니': ['리멤버컴퍼니', 'remember', 'company'],
    '그리팅': ['그리팅', 'greeting'],
    '요기요': ['요기요', 'yogiyo', '배달'],
    '쿠팡이츠': ['쿠팡이츠', 'coupang', 'eats'],
    '배달의민족': ['배달의민족', '배민', 'baemin'],
    '배민': ['배민', '배달의민족'],
    '땡겨요': ['땡겨요', '배달'],
    'SK렌터카': ['sk렌터카', 'sk렌탈', '렌터카'],
    '롯데렌탈': ['롯데렌탈', '롯데렌터카'],
    '롯데렌터카': ['롯데렌터카', '롯데렌탈'],
    '어피니티': ['어피니티', 'affinity'],
    '어피너티': ['어피너티', 'affinity'],
    'mbk': ['mbk', '엠비케이', 'partners'],
    'kkr': ['kkr', 'kohlberg'],
    'cvc': ['cvc', '캐피탈'],
    'blackstone': ['blackstone', '블랙스톤'],
    'baincapital': ['bain', '베인캐피탈', '베인캐피털'],
    'imm': ['imm', '아이엠엠'],
    'vig': ['vig', '브이아이지'],
    '스틱인베': ['스틱인베', 'stic'],
    '스카이레이크': ['스카이레이크', 'skylake'],
    '글렌우드': ['글렌우드', 'glenwood'],
    'eqt': ['eqt', 'eqt partners'],
    '베인캐피탈': ['베인캐피탈', '베인캐피털', 'bain', 'bain capital'],
    '베인캐피털': ['베인캐피털', '베인캐피탈', 'bain', 'bain capital'],
    '블랙스톤': ['블랙스톤', 'blackstone'],
    '알토스': ['알토스', 'altos']
};

// ===== 언론사 추출 =====
var COMPREHENSIVE_DOMAIN_MAPPING = {
  'chosun.com': '조선일보',
  'biz.chosun.com': '조선비즈',
  'joongang.co.kr': '중앙일보',
  'donga.com': '동아일보',
  'hani.co.kr': '한겨레',
  'khan.co.kr': '경향신문',
  'seoul.co.kr': '서울신문',
  'munhwa.com': '문화일보',
  'kmib.co.kr': '국민일보',
  'segye.com': '세계일보',
  'hankyung.com': '한국경제',
  'mk.co.kr': '매일경제',
  'maekyung.com': '매일경제',
  'fnnews.com': '파이낸셜뉴스',
  'mt.co.kr': '머니투데이',
  'moneytoday.co.kr': '머니투데이',
  'edaily.co.kr': '이데일리',
  'asiae.co.kr': '아시아경제',
  'etoday.co.kr': '이투데이',
  'businesspost.co.kr': '비즈니스포스트',
  'ajunews.com': '아주경제',
  'thebell.co.kr': '더벨',
  'sedaily.com': '서울경제',
  'wowtv.co.kr': '한국경제TV',
  'sbs.co.kr': 'SBS',
  'mbc.co.kr': 'MBC',
  'kbs.co.kr': 'KBS',
  'jtbc.co.kr': 'JTBC',
  'mbn.co.kr': 'MBN',
  'ytn.co.kr': 'YTN',
  'tvchosun.com': 'TV조선',
  'channel-a.com': '채널A',
  'yna.co.kr': '연합뉴스',
  'yonhapnews.co.kr': '연합뉴스',
  'yonhapnewstv.co.kr': '연합뉴스TV',
  'newsis.com': '뉴시스',
  'news1.kr': '뉴스1',
  'etnews.com': '전자신문',
  'ddaily.co.kr': '디지털데일리',
  'dt.co.kr': 'DT',
  'zdnet.co.kr': 'ZDNet Korea',
  'bloter.net': '블로터',
  'platum.kr': '플래텀',
  'heraldcorp.com': '헤럴드경제',
  'herald.co.kr': '헤럴드경제'
};

function extractDomainFromURL(url) {
  try {
    if (!url || typeof url !== 'string') return null;
    
    var naverOidMapping = {
      '001': '연합뉴스', '003': '뉴시스', '005': '국민일보', '008': '머니투데이',
      '009': '매일경제', '011': '서울경제', '014': '파이낸셜뉴스', '015': '한국경제',
      '016': '헤럴드경제', '018': '이데일리', '020': '동아일보', '021': '문화일보',
      '022': '세계일보', '023': '조선일보', '025': '중앙일보', '028': '한겨레',
      '032': '경향신문', '081': '서울신문', '087': 'MBC', '214': 'MBN',
      '421': '뉴스1', '422': '연합뉴스TV', '449': '채널A'
    };
    
    if (url.includes('naver.com')) {
      var oidMatch = url.match(/[?&]oid=(\d+)/);
      if (oidMatch && naverOidMapping[oidMatch[1]]) {
        return naverOidMapping[oidMatch[1]];
      }
    }
    
    var hostname = url.toLowerCase()
      .replace(/^https?:\/\//, '')
      .split('/')[0]
      .split(':')[0]
      .replace(/^(www\.|m\.|mobile\.)/, '');
    
    return hostname;
    
  } catch (e) {
    Logger.log('도메인 추출 오류: ' + e.toString());
    return null;
  }
}

function extractNewsSource(url, title, description) {
  if (!url) return '출처불명';
  
  try {
    var domain = extractDomainFromURL(url);
    if (domain && COMPREHENSIVE_DOMAIN_MAPPING[domain]) {
      return COMPREHENSIVE_DOMAIN_MAPPING[domain];
    }
    
    var content = title + ' ' + description;
    var patterns = [
      /\[([가-힣a-zA-Z0-9\s]+)\]/g,
      /\(([가-힣a-zA-Z0-9\s]+)\)/g,
      /([가-힣]+(?:일보|신문|뉴스|경제|타임즈|데일리))/g,
      /(KBS|MBC|SBS|JTBC|YTN|MBN|채널A|TV조선)/gi
    ];
    
    for (var i = 0; i < patterns.length; i++) {
      var match = patterns[i].exec(content);
      if (match) {
        var source = match[1].trim();
        if (source.length >= 2 && source.length <= 15) {
          return source;
        }
      }
    }
    
    if (domain) {
      for (var pattern in COMPREHENSIVE_DOMAIN_MAPPING) {
        if (domain.includes(pattern.split('.')[0])) {
          return COMPREHENSIVE_DOMAIN_MAPPING[pattern];
        }
      }
      
      var cleanDomain = domain.split('.')[0];
      if (cleanDomain.length <= 10) {
        return cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1);
      }
    }
    
    return '기타언론';
    
  } catch (e) {
    Logger.log('언론사 추출 오류: ' + e.toString());
    return '오류';
  }
}

// ===== 텍스트 정리 =====
function cleanText(text) {
  if (!text) return '';
  
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8230;/g, '…')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/\s+/g, ' ')
    .trim();
}

// ===== 구글 뉴스 RSS 수집 함수 =====
function fetchGoogleNewsForKeyword(keyword) {
  if (!ENABLE_GOOGLE_NEWS) return [];
  
  try {
    // 구글 뉴스 RSS URL 생성 (한국어, 최근 1일)
    var encodedKeyword = encodeURIComponent(keyword);
    var googleNewsUrl = 'https://news.google.com/rss/search?q=' + encodedKeyword + 
                       '&hl=' + GOOGLE_NEWS_LANGUAGE + 
                       '&gl=' + GOOGLE_NEWS_REGION + 
                       '&ceid=' + GOOGLE_NEWS_REGION + ':' + GOOGLE_NEWS_LANGUAGE;
    
    Logger.log('  구글 뉴스 RSS 요청: ' + keyword);
    
    var response = UrlFetchApp.fetch(googleNewsUrl, {
      muteHttpExceptions: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
      }
    });
    
    if (response.getResponseCode() !== 200) {
      Logger.log('  구글 뉴스 RSS 에러: ' + response.getResponseCode());
      return [];
    }
    
    var xmlText = response.getContentText();
    var items = parseGoogleNewsRSS(xmlText, keyword);
    
    Logger.log('  구글 뉴스: ' + items.length + '개 수집');
    return items;
    
  } catch (e) {
    Logger.log('  구글 뉴스 수집 에러: ' + e.toString());
    return [];
  }
}

// ===== 구글 뉴스 RSS XML 파싱 =====
function parseGoogleNewsRSS(xmlText, keyword) {
  try {
    var items = [];
    var itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/g);
    
    if (!itemMatches) return items;
    
    var twentySixHoursAgo = new Date(Date.now() - (15 * 60 * 60 * 1000));
    
    for (var i = 0; i < Math.min(itemMatches.length, 20); i++) { // 최대 20개로 제한
      var itemXml = itemMatches[i];
      
      try {
        // 제목 추출
        var titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
        if (!titleMatch) {
          titleMatch = itemXml.match(/<title>(.*?)<\/title>/);
        }
        var title = titleMatch ? titleMatch[1] : '';
        
        // 링크 추출
        var linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
        var link = linkMatch ? linkMatch[1] : '';
        
        // 설명 추출
        var descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
        if (!descMatch) {
          descMatch = itemXml.match(/<description>(.*?)<\/description>/);
        }
        var description = descMatch ? descMatch[1] : '';
        
        // 발행일 추출
        var pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
        var pubDate = new Date();
        if (pubDateMatch) {
          pubDate = new Date(pubDateMatch[1]);
        }
        
        // 15시간 내 기사만 필터링
        if (isNaN(pubDate.getTime()) || pubDate < twentySixHoursAgo) {
          continue;
        }
        
        // 한국어 기사만 필터링 (간단한 한글 포함 체크)
        var content = title + ' ' + description;
        var koreanPattern = /[가-힣]/;
        if (!koreanPattern.test(content)) {
          continue;
        }
        
        var cleanTitle = cleanText(title);
        var cleanDesc = cleanText(description);
        
        if (cleanTitle.length > 10) {
          var processedItem = {
            keyword: keyword,
            title: cleanTitle,
            link: link,
            originallink: link,
            pubDate: pubDate,
            pubDateStr: Utilities.formatDate(pubDate, 'GMT+9', 'yyyy-MM-dd HH:mm'),
            description: cleanDesc,
            source: extractGoogleNewsSource(cleanTitle, cleanDesc, link)
          };
          items.push(processedItem);
        }
        
      } catch (e) {
        // 개별 아이템 파싱 에러는 건너뛰기
        continue;
      }
    }
    
    return items;
    
  } catch (e) {
    Logger.log('RSS 파싱 에러: ' + e.toString());
    return [];
  }
}

// ===== 구글 뉴스 언론사 추출 =====
function extractGoogleNewsSource(title, description, link) {
  // 구글 뉴스 링크에서 실제 언론사 도메인 추출 시도
  try {
    // 제목에서 언론사 추출 시도 (보통 마지막에 위치)
    var titleParts = title.split(' - ');
    if (titleParts.length > 1) {
      var lastPart = titleParts[titleParts.length - 1].trim();
      if (lastPart.length > 0 && lastPart.length < 20) {
        return lastPart;
      }
    }
    
    // 설명에서 언론사 추출
    var patterns = [
      /\[([가-힣a-zA-Z0-9\s]+)\]/g,
      /\(([가-힣a-zA-Z0-9\s]+)\)/g,
      /([가-힣]+(?:일보|신문|뉴스|경제|타임즈|데일리))/g
    ];
    
    var content = title + ' ' + description;
    for (var i = 0; i < patterns.length; i++) {
      var match = patterns[i].exec(content);
      if (match) {
        var source = match[1].trim();
        if (source.length >= 2 && source.length <= 15) {
          return source;
        }
      }
    }
    
    return '구글뉴스';
    
  } catch (e) {
    return '구글뉴스';
  }
}

// ===== 키워드 관련성 검증 함수 (엄격한 제목 기반 필터링) =====
function checkKeywordRelevance(article) {
  var keywordTerms = KEYWORD_RELEVANCE_CHECK[article.keyword] || [article.keyword.toLowerCase()];

  // 모든 키워드: 제목에만 키워드가 있어야 함 (더 엄격한 필터링)
  var title = article.title.toLowerCase();
  for (var i = 0; i < keywordTerms.length; i++) {
    if (title.includes(keywordTerms[i].toLowerCase())) {
      return true;
    }
  }

  // 제목에 키워드가 없으면 제외
  return false;
}

// ===== 강화된 중복 검사 함수 =====
function isStrongDuplicate(title1, title2) {
  // 제목을 단어로 분리 (2글자 이상만)
  var getWords = function(title) {
    return title.toLowerCase()
      .replace(/[^\w가-힣\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(function(word) { 
        return word.length >= 2 && 
               !['주식회사', '코리아', '그룹', '기업', '회사', '지주', '관련', '대한', '한국', '서울'].includes(word);
      });
  };
  
  var words1 = getWords(title1);
  var words2 = getWords(title2);
  
  if (words1.length < 3 || words2.length < 3) return false;
  
  // 공통 단어 개수 계산
  var commonWords = [];
  for (var i = 0; i < words1.length; i++) {
    if (words2.indexOf(words1[i]) !== -1) {
      commonWords.push(words1[i]);
    }
  }
  
  // 3개 이상 공통 단어가 있으면 중복으로 판정
  return commonWords.length >= 3;
}

// ===== 키워드 포함 우선순위 계산 =====
function calculateKeywordPriority(article) {
  var title = article.title.toLowerCase();
  var keyword = article.keyword.toLowerCase();
  
  // 1순위: 키워드가 제목에 완전히 포함
  if (title.includes(keyword)) {
    return 100;
  }
  
  // 2순위: 관련 키워드 포함
  var relatedKeywords = KEYWORD_RELEVANCE_CHECK[article.keyword] || [];
  for (var i = 0; i < relatedKeywords.length; i++) {
    if (title.includes(relatedKeywords[i].toLowerCase())) {
      return 50;
    }
  }
  
  // 3순위: 키워드 미포함
  return 0;
}

// ===== PE 관점 중요도 점수 계산 함수 =====
function calculatePEImportanceScore(article) {
  var content = (article.title + ' ' + (article.description || '')).toLowerCase();
  var score = 0;
  
  // 1단계: 키워드 관련성 체크 (관련 없으면 0점)
  if (!checkKeywordRelevance(article)) {
    return 0;
  }
  
  // 2단계: 강력 제외 키워드 체크
  for (var i = 0; i < STRONG_EXCLUDE_KEYWORDS.length; i++) {
    if (content.includes(STRONG_EXCLUDE_KEYWORDS[i])) {
      return 0; // 즉시 제외
    }
  }

  // 2-0단계: BKR 그룹 특별 필터링 (연극/문화 콘텐츠 제외)
  var bkrKeywords = ['버거킹', '팀홀튼', '맥도날드', 'kfc', '투썸플레이스', '롯데리아'];
  var isBkrGroup = false;
  for (var i = 0; i < bkrKeywords.length; i++) {
    if (article.keyword === bkrKeywords[i]) {
      isBkrGroup = true;
      break;
    }
  }

  if (isBkrGroup) {
    // BKR 그룹에서 연극/문화/공연 관련 제외
    var bkrExcludeKeywords = ['연극', '뮤지컬', '공연', '무대', '작품', '원작', '캐릭터', '영화', '드라마'];
    for (var i = 0; i < bkrExcludeKeywords.length; i++) {
      if (content.includes(bkrExcludeKeywords[i])) {
        return 0; // BKR 그룹에서 문화 콘텐츠 관련 기사 제외
      }
    }
  }

  // 2-1단계: SK렌터카 그룹 특별 필터링 (PBA, 당구 제외)
  if (article.keyword === 'SK렌터카') {
    var skExcludeKeywords = ['pba', '당구', '포켓볼', '3쿠션', '4구', '빌리어드'];
    for (var i = 0; i < skExcludeKeywords.length; i++) {
      if (content.includes(skExcludeKeywords[i])) {
        return 0; // SK렌터카에서 당구/PBA 관련 기사 제외
      }
    }
  }

  // 2-2단계: JOBKOREA 그룹 특별 필터링 (연예/스포츠 강화)
  var jobkoreaKeywords = ['잡코리아', '알바몬', '사람인', '원티드', '토스알바', '당근알바', '리멤버컴퍼니', '그리팅'];
  var isJobkoreaGroup = false;
  for (var i = 0; i < jobkoreaKeywords.length; i++) {
    if (article.keyword === jobkoreaKeywords[i]) {
      isJobkoreaGroup = true;
      break;
    }
  }

  if (isJobkoreaGroup) {
    // JOBKOREA 그룹에서 연예/스포츠 관련 더 강력하게 필터링
    var jobkoreaExcludeKeywords = [
      // 연예 관련
      '연예인', '아이돌', '가수', '배우', '드라마', '영화', '예능', '음악', '앨범', '콘서트',
      // 스포츠 관련
      'pba', '당구', '야구', '축구', '농구', '배구', '골프', '선수', '경기', '우승', 'ps진출', '순위권',
      // 기타 엔터테인먼트
      '화보', '인터뷰', '팬미팅', '공연', '무대'
    ];
    for (var i = 0; i < jobkoreaExcludeKeywords.length; i++) {
      if (content.includes(jobkoreaExcludeKeywords[i])) {
        return 0; // JOBKOREA 그룹에서 연예/스포츠 관련 기사 제외
      }
    }
  }
  
  // 3단계: PE 중심 중요도 점수 계산
  var foundImportantKeyword = false;
  
  for (var level in PE_FOCUSED_KEYWORDS) {
    var keywords = PE_FOCUSED_KEYWORDS[level];
    var levelScore = 0;
    
    switch(level) {
      case 'critical': levelScore = 15; break;
      case 'high': levelScore = 10; break;
      case 'medium': levelScore = 7; break;
      case 'risk': levelScore = 5; break;
    }
    
    for (var i = 0; i < keywords.length; i++) {
      if (content.includes(keywords[i])) {
        score += levelScore;
        foundImportantKeyword = true;
        break; // 같은 레벨에서는 하나만 점수 추가
      }
    }
  }
  
  // 4단계: PE 관련 중요 키워드가 없으면 낮은 점수
  if (!foundImportantKeyword) {
    return 2; // 관련성은 있지만 중요도 낮음
  }
  
  // 5단계: 키워드 우선순위 보너스 (NEW!)
  var keywordPriority = calculateKeywordPriority(article);
  if (keywordPriority === 100) {
    score += 5; // 키워드 완전 포함 보너스
  } else if (keywordPriority === 50) {
    score += 3; // 관련 키워드 포함 보너스
  }
  
  // 6단계: 신뢰할 만한 경제 언론사 보너스
  var premiumSources = ['한국경제', '매일경제', '파이낸셜뉴스', '머니투데이', '이데일리', '서울경제', '헤럴드경제', '아시아경제', '조선비즈', '더벨'];
  if (premiumSources.indexOf(article.source) !== -1) {
    score += 2;
  }
  
  // 7단계: 최신성 보너스 (6시간 이내)
  var sixHoursAgo = new Date(Date.now() - (6 * 60 * 60 * 1000));
  if (article.pubDate >= sixHoursAgo) {
    score += 1;
  }
  
  return Math.max(0, score);
}

// ===== 간단한 GPT 체크 (고점수 기사만 대상) =====
