# 글로벌 뉴스 요약 시스템 (Global News Summary for PE Professionals)

Private Equity 전문가를 위한 AI 기반 글로벌 뉴스 자동 요약 및 배포 시스템입니다.

## 주요 기능

### 📰 뉴스 수집
- **Top 30 글로벌 언론사** 자동 스크래핑
  - 미국: NYT, WSJ, Financial Times, Bloomberg, Reuters, The Economist
  - 한국: 조선일보, 중앙일보, 한국경제
  - 기술: TechCrunch
- **News API 통합** (선택사항): 추가 뉴스 소스
- **24시간 이내 기사**만 수집

### 🤖 AI 기반 분석
- **ChatGPT 통합**으로 자동 요약 생성
- PE/VC, M&A, 경제정책 관련 뉴스 우선순위화
- 중복 기사 자동 감지 및 제거
- 유사 제목 필터링 및 점수 부스팅

### 📊 시장 데이터
- **미국 증시**: S&P 500, Dow Jones, NASDAQ (일간/주간/월간 추이)
- **한국 증시**: KOSPI, KOSDAQ
- **환율**: USD/KRW
- **암호화폐**: Bitcoin
- 실시간 데이터 with 이모티콘 (📈📉)

### 🏛️ 트럼프 대통령 동향
- 최근 24시간 트럼프 관련 뉴스 자동 수집
- 주요 행보 및 발언 요약

### 💬 Slack 연동
- 매일 정해진 시간에 자동 발송
- 깔끔한 포맷팅 with Block Kit
- 클릭 가능한 하이퍼링크

## 설치 및 설정

### 1. Google Apps Script 프로젝트 생성

1. [Google Apps Script](https://script.google.com) 접속
2. "새 프로젝트" 클릭
3. 프로젝트 이름을 "Global News Summary"로 변경
4. `Code.gs` 파일 내용을 삭제하고 `globalnews.gs` 내용 복사

### 2. API 키 설정

파일 상단의 `CONFIG` 섹션에서 다음 값들을 설정하세요:

```javascript
const CONFIG = {
  // 필수: OpenAI API Key
  OPENAI_API_KEY: 'sk-your-openai-api-key-here',

  // 필수: Slack Webhook URL
  SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',

  // 선택: News API Key (추가 뉴스 소스용)
  NEWS_API_KEY: 'your-news-api-key-here',

  // ... 나머지 설정
};
```

#### API 키 발급 방법

**OpenAI API Key** (필수)
1. [OpenAI Platform](https://platform.openai.com/api-keys) 접속
2. "Create new secret key" 클릭
3. 키 복사하여 `OPENAI_API_KEY`에 입력

**Slack Webhook URL** (필수)
1. Slack 워크스페이스에서 [Incoming Webhooks 앱](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks) 추가
2. 채널 선택 (예: #news 또는 #general)
3. Webhook URL 복사하여 `SLACK_WEBHOOK_URL`에 입력

**News API Key** (선택)
1. [NewsAPI.org](https://newsapi.org/register) 가입
2. API 키 복사하여 `NEWS_API_KEY`에 입력
3. 무료 플랜: 100 requests/day

### 3. 테스트 실행

설정 완료 후 테스트:

```javascript
// 스크립트 에디터에서 실행 함수 선택
testScript()  // 기본 테스트
quickTest()   // 빠른 메시지 포맷 테스트
```

### 4. 자동 실행 설정

매일 자동으로 실행하려면:

**방법 1: 함수 실행**
```javascript
createDailyTrigger()  // 매일 오전 8시 실행 설정
```

**방법 2: 수동 설정**
1. Google Apps Script 에디터에서 ⏰ (트리거) 아이콘 클릭
2. "+ 트리거 추가" 클릭
3. 설정:
   - 실행할 함수: `sendDailyNewsSummary`
   - 이벤트 소스: 시간 기반
   - 시간 기반 트리거 유형: 일 타이머
   - 시간 선택: 오전 8-9시 (원하는 시간)
4. "저장" 클릭

### 5. 권한 승인

처음 실행 시 Google 계정 권한 승인 필요:
1. "권한 검토" 클릭
2. 계정 선택
3. "고급" → "프로젝트로 이동" 클릭
4. "허용" 클릭

## 사용 방법

### 수동 실행
```javascript
sendDailyNewsSummary()  // 즉시 뉴스 요약 발송
```

### 자동 실행
설정된 시간에 자동으로 Slack 채널로 발송됩니다.

## 커스터마이징

### 뉴스 소스 추가

`NEWS_SOURCES` 배열에 추가:

```javascript
{
  name: '새로운 언론사',
  type: 'rss',
  url: 'https://example.com/rss',
  category: 'business'
}
```

### 키워드 조정

`scoreArticle()` 함수에서 키워드 수정:

```javascript
const peKeywords = [
  'private equity', 'venture capital',
  // 원하는 키워드 추가
];
```

### 발송 시간 변경

`createDailyTrigger()` 함수에서:

```javascript
.atHour(8)  // 0-23 사이 값으로 변경
```

### GPT 모델 변경

```javascript
GPT_MODEL: 'gpt-4-turbo-preview',  // 또는 'gpt-3.5-turbo'
```

### 기사 수 조정

```javascript
MAX_ARTICLES_PER_SOURCE: 10,  // 언론사별 최대 기사 수
TOTAL_TOP_ARTICLES: 20,        // 최종 보여줄 기사 수
```

## 문제 해결

### API 키 오류
- OpenAI API 키가 올바른지 확인
- API 사용량 한도 확인 ([OpenAI Usage](https://platform.openai.com/usage))

### 뉴스를 불러올 수 없음
- RSS 피드 URL이 유효한지 확인
- News API 키 및 사용량 확인

### Slack 메시지가 안 옴
- Webhook URL이 올바른지 확인
- Slack 채널에 앱이 추가되어 있는지 확인

### 실행 시간 초과
- Google Apps Script는 최대 6분 실행 제한
- `MAX_ARTICLES_PER_SOURCE` 값을 줄여보세요
- `TOTAL_TOP_ARTICLES` 값을 줄여보세요

### 로그 확인
Google Apps Script 에디터에서:
1. "실행" → "실행 로그" 확인
2. 또는 `Logger.log()` 출력 확인

## 고급 기능

### 뉴스 카테고리별 필터링

```javascript
// 특정 카테고리만 포함
const filteredArticles = articles.filter(a =>
  ['business', 'economy'].includes(a.category)
);
```

### AI 요약 프롬프트 커스터마이징

`generateAISummary()` 함수의 `prompt` 수정:

```javascript
const prompt = `당신의 커스텀 프롬프트...`;
```

### 추가 시장 지표

`CONFIG.MARKET_SYMBOLS`에 추가:

```javascript
MARKET_SYMBOLS: {
  US_STOCKS: ['^GSPC', '^DJI', '^IXIC', '^VIX'],  // VIX 추가
  // ...
}
```

## 비용 안내

### OpenAI API
- GPT-4 Turbo: ~$0.01-0.03 per run (약 30-90원)
- GPT-3.5 Turbo: ~$0.001 per run (약 1-3원)
- 월 비용 (일 1회): GPT-4 기준 $0.30-0.90 (약 900-2700원)

### News API
- 무료 플랜: 100 requests/day (충분)
- 비즈니스 플랜: $449/month (필요시)

### Google Apps Script
- 완전 무료!

## 기능 확장 아이디어

1. **이메일 발송**: GmailApp API 활용
2. **PDF 저장**: Google Drive API 활용
3. **데이터 분석**: Google Sheets에 기록
4. **커스텀 알림**: 특정 키워드 감지 시 즉시 알림
5. **다국어 지원**: 여러 언어로 번역
6. **감성 분석**: 뉴스 sentiment 분석

## 라이선스

이 프로젝트는 개인 및 상업적 용도로 자유롭게 사용 가능합니다.

## 지원

문제가 있거나 질문이 있으시면:
1. Google Apps Script 로그 확인
2. API 키 및 권한 재확인
3. 코드 내 주석 참고

---

**Made with ❤️ for Private Equity Professionals**

*Powered by ChatGPT, Google Apps Script, and Slack*
