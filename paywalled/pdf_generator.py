from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from datetime import datetime
import time
import base64
import os
import pandas as pd
from PyPDF2 import PdfMerger
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import re
from playwright.sync_api import sync_playwright
import tempfile
import json

# ────────────────────────────────────────────────
# 개선된 Readability 설정 및 스타일
READABILITY_JS_URL = 'https://unpkg.com/@mozilla/readability@0.4.4/Readability.js'

# 한국어 최적화된 CSS 스타일
KOREAN_PDF_STYLE = """
<style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
    
    * {
        box-sizing: border-box;
    }
    
    body {
        font-family: 'Noto Sans KR', 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif;
        line-height: 1.8;
        padding: 40px 30px;
        max-width: 800px;
        margin: 0 auto;
        color: #333;
        background: #fff;
        font-size: 15px;
        word-break: keep-all;
        word-wrap: break-word;
    }
    
    .article-header {
        border-bottom: 3px solid #007bff;
        margin-bottom: 30px;
        padding-bottom: 20px;
    }
    
    .article-title {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 15px;
        color: #1a1a1a;
        line-height: 1.4;
    }
    
    .article-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        color: #666;
        margin-bottom: 10px;
    }
    
    .article-source {
        font-weight: 500;
        color: #007bff;
        background: #f8f9fa;
        padding: 5px 12px;
        border-radius: 15px;
        border: 1px solid #e9ecef;
    }
    
    .article-date {
        color: #999;
    }
    
    .article-byline {
        font-size: 13px;
        color: #666;
        margin-bottom: 10px;
    }
    
    .article-url {
        font-size: 11px;
        color: #999;
        word-break: break-all;
        margin-top: 5px;
    }
    
    .article-content {
        margin-top: 30px;
    }
    
    .article-content h1, .article-content h2, .article-content h3 {
        font-weight: 600;
        margin-top: 30px;
        margin-bottom: 15px;
        color: #2c3e50;
    }
    
    .article-content h1 { font-size: 24px; }
    .article-content h2 { font-size: 20px; }
    .article-content h3 { font-size: 18px; }
    
    .article-content p {
        margin-bottom: 18px;
        line-height: 1.8;
        text-align: justify;
    }
    
    .article-content img {
        max-width: 100%;
        max-height: 25vh; /* 화면 높이의 25% 제한 */
        height: auto;
        width: auto;
        margin: 15px auto;
        display: block;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        object-fit: contain; /* 비율 유지하면서 크기 조정 */
    }
    
    /* 이미지가 너무 작을 때는 최소 크기 보장 */
    .article-content img[width], .article-content img[height] {
        max-width: min(100%, 400px) !important;
        max-height: min(25vh, 300px) !important;
        width: auto !important;
        height: auto !important;
    }
    
    /* 인라인 스타일로 지정된 큰 이미지 강제 조정 */
    .article-content img[style*="width"], .article-content img[style*="height"] {
        max-width: min(100%, 400px) !important;
        max-height: min(25vh, 300px) !important;
        width: auto !important;
        height: auto !important;
    }
    
    .article-content blockquote {
        border-left: 4px solid #007bff;
        padding-left: 20px;
        margin: 20px 0;
        color: #555;
        font-style: italic;
        background: #f8f9fa;
        padding: 15px 20px;
        border-radius: 0 8px 8px 0;
    }
    
    .article-content ul, .article-content ol {
        margin: 15px 0;
        padding-left: 25px;
    }
    
    .article-content li {
        margin-bottom: 8px;
        line-height: 1.6;
    }
    
    .copyright-info {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #eee;
        font-size: 12px;
        color: #999;
        text-align: center;
    }
    
    @media print {
        body {
            padding: 20px;
            font-size: 14px;
        }
        .article-title {
            font-size: 24px;
        }
        /* 인쇄 시 이미지 크기 더 엄격하게 제한 */
        .article-content img {
            max-width: 80% !important;
            max-height: 20vh !important;
            page-break-inside: avoid;
        }
    }
</style>
"""

# 언론사 식별을 위한 패턴 매핑
MEDIA_PATTERNS = {
    # 언론사별 도메인과 이름 매핑
    'domain_mapping': {
        'thebell.co.kr': '더벨',
        'investchosun.com': '인베스트조선',
        'marketinsight.hankyung.com': '한경마켓인사이트',
        'news.naver.com': '네이버뉴스',
        'chosun.com': '조선일보',
        'joongang.co.kr': '중앙일보',
        'donga.com': '동아일보',
        'hankyung.com': '한국경제',
        'mk.co.kr': '매일경제',
        'edaily.co.kr': '이데일리',
        'newsway.co.kr': '뉴스웨이',
        'newspim.com': '뉴스핌',
        'ajunews.com': '아주경제',
        'etnews.com': '전자신문',
        'dt.co.kr': '디지털타임스',
        'zdnet.co.kr': 'ZDNet Korea',
        'yonhapnews.co.kr': '연합뉴스',
        'yna.co.kr': '연합뉴스'
    }
}

# 개선된 JS 스크립트
def get_enhanced_js_script():
    domain_mapping_json = json.dumps(MEDIA_PATTERNS['domain_mapping'])
    
    return f"""
(async function() {{
    try {{
        // Readability 라이브러리 로드
        const response = await fetch("{READABILITY_JS_URL}");
        const readabilityCode = await response.text();
        eval(readabilityCode);
        
        // 기사 추출
        const documentClone = document.cloneNode(true);
        const reader = new Readability(documentClone);
        const article = reader.parse();
        
        if (!article) {{
            return null;
        }}
        
        // 언론사 정보 추출
        function extractMediaInfo() {{
            const url = window.location.href;
            let mediaName = '';
            let copyrightInfo = '';
            
            // 1. 도메인 기반 언론사 식별
            const domain = window.location.hostname;
            const domainMapping = {domain_mapping_json};
            
            for (const [domainPattern, name] of Object.entries(domainMapping)) {{
                if (domain.includes(domainPattern)) {{
                    mediaName = name;
                    break;
                }}
            }}
            
            // 2. 저작권 정보 찾기
            const bodyText = document.body.innerText;
            const copyrightPatterns = [
                /©\\s*([^,\\n]+)/g,
                /저작권자\\s*©\\s*([^,\\n]+)/g,
                /Copyright\\s*©\\s*([^,\\n]+)/g,
                /ⓒ\\s*([^,\\n]+)/g,
                /©\\s*(\\d{{4}})\\s*([^,\\n]+)/g
            ];
            
            for (const pattern of copyrightPatterns) {{
                const matches = bodyText.match(pattern);
                if (matches && matches.length > 0) {{
                    copyrightInfo = matches[0].trim();
                    // 언론사 이름이 저작권 정보에 있으면 추출
                    if (!mediaName && copyrightInfo) {{
                        const cleanCopyright = copyrightInfo.replace(/©|저작권자|Copyright|ⓒ/g, '').trim();
                        if (cleanCopyright) {{
                            mediaName = cleanCopyright.split(',')[0].trim();
                        }}
                    }}
                    break;
                }}
            }}
            
            // 3. 메타 태그에서 언론사 정보 찾기
            if (!mediaName) {{
                const metaTags = [
                    'og:site_name',
                    'twitter:site',
                    'article:publisher',
                    'author'
                ];
                
                for (const tag of metaTags) {{
                    const meta = document.querySelector(`meta[property="${{tag}}"], meta[name="${{tag}}"]`);
                    if (meta && meta.content) {{
                        mediaName = meta.content;
                        break;
                    }}
                }}
            }}
            
            // 4. 네이버 뉴스의 경우 원본 언론사 찾기
            if (domain.includes('news.naver.com')) {{
                const pressLogo = document.querySelector('.press_logo img');
                const pressName = document.querySelector('.press_logo .name');
                const mediaEndArea = document.querySelector('.media_end_head_top .media_end_head_top_logo img');
                
                if (pressName) {{
                    mediaName = pressName.textContent.trim();
                }} else if (pressLogo && pressLogo.alt) {{
                    mediaName = pressLogo.alt.trim();
                }} else if (mediaEndArea && mediaEndArea.alt) {{
                    mediaName = mediaEndArea.alt.trim();
                }} else {{
                    // 기사 본문에서 언론사 정보 찾기
                    const articleByline = document.querySelector('.article_byline, .byline');
                    if (articleByline) {{
                        const bylineText = articleByline.textContent;
                        const mediaMatch = bylineText.match(/([가-힣]+)\\s*기자/);
                        if (mediaMatch) {{
                            mediaName = mediaMatch[1];
                        }}
                    }}
                }}
            }}
            
            return {{
                mediaName: mediaName || '알 수 없는 언론사',
                copyrightInfo: copyrightInfo,
                url: url
            }};
        }}
        
        const mediaInfo = extractMediaInfo();
        
        // 발행일 추출 개선
        function extractPublishDate() {{
            // 메타 태그에서 날짜 찾기
            const dateSelectors = [
                'meta[property="article:published_time"]',
                'meta[property="article:modified_time"]',
                'meta[name="pubdate"]',
                'meta[name="date"]',
                'time[datetime]',
                '.date', '.publish-date', '.article-date'
            ];
            
            for (const selector of dateSelectors) {{
                const element = document.querySelector(selector);
                if (element) {{
                    const dateValue = element.getAttribute('content') || 
                                    element.getAttribute('datetime') || 
                                    element.textContent;
                    if (dateValue) {{
                        try {{
                            const date = new Date(dateValue);
                            if (!isNaN(date.getTime())) {{
                                return date.toLocaleDateString('ko-KR', {{
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }});
                            }}
                        }} catch (e) {{
                            // 날짜 파싱 실패시 무시
                        }}
                    }}
                }}
            }}
            
            return new Date().toLocaleDateString('ko-KR', {{
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }});
        }}
        
        const publishDate = extractPublishDate();
        
        return {{
            title: article.title,
            content: article.content,
            textContent: article.textContent,
            length: article.length,
            excerpt: article.excerpt,
            byline: article.byline,
            mediaName: mediaInfo.mediaName,
            copyrightInfo: mediaInfo.copyrightInfo,
            publishDate: publishDate,
            url: mediaInfo.url
        }};
        
    }} catch (error) {{
        console.error('Enhanced readability extraction failed:', error);
        return null;
    }}
}})();
"""

# ────────────────────────────────────────────────
# 키워드 그룹핑 매핑
KEYWORD_GROUPING = {
    # 영문 매핑 (기존)
    '교보생명': 'Kyobo Life',
    '버거킹': 'BKR',
    '팀홀튼': 'BKR',
    '맥도날드': 'BKR',
    '현대커머셜': 'HCI',
    '유베이스': 'UBase',
    '서브원': 'Serveone',
    '락앤락': 'Lock&Lock',
    '잡코리아': 'JOBKOREA',
    '알바몬': 'JOBKOREA',
    '요기요': 'YGY',
    '쿠팡이츠': 'YGY',
    '배달의민족': 'YGY',
    '배민': 'YGY',
    'SK렌터카': 'SK Rent-a-Car',
    # Market (롯데렌탈 + 어피니티 관련)
    '롯데렌탈': 'Market',
    '롯데렌터카': 'Market',
    '어피니티': 'Market',
    '어피너티': 'Market'
}

# 그룹 순서 정의
GROUP_ORDER = [
    'Kyobo Life',
    'BKR',
    'HCI',
    'UBase',
    'Serveone',
    'Shinhan Financial Group',
    'Lock&Lock',
    'JOBKOREA',
    'YGY',
    'SK Rent-a-Car',
    'Market'
]

# ────────────────────────────────────────────────
# 사이트별 설정
SITE_CONFIGS = {
    "thebell": {
        "name": "더벨",
        "login_url": "https://www.thebell.co.kr/LoginCert/Login.asp",
        "id": "affinity",
        "password": "equity",
        "login_selectors": {
            "id_field": "id",
            "pw_field": "pw",
            "login_button": "#btn1"
        }
    },
    "investchosun": {
        "name": "인베스트조선",
        "login_url": "https://www.investchosun.com/svc/member/invest_login.html",
        "id": "affini1",
        "password": "affini12026",
        "login_selectors": {
            "id_field": "username",
            "pw_field": "login_password",
            "login_button": "#SignIn"
        }
    },
    "hankyung": {
        "name": "한경마켓인사이트",
        "login_url": "https://marketinsight.hankyung.com/",
        "id": "affini1",
        "password": "affini1",
        "login_selectors": {
            "id_field": "user_id",
            "pw_field": "password",
            "login_button": ".btnLogin"
        }
    },
    "naver": {
        "name": "네이버"
    }
}

# ────────────────────────────────────────────────
# 이메일 설정
EMAIL_CONFIG = {
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "sender_email": "xxxthy@gmail.com",
    "sender_password": "ckxi cbhu myzv ejyt",
    "recipient_email": [
        "thyang@affinityequity.com",
        "xxxthy@gmail.com",
        "mistyjo12@outlook.kr",
        "nkcho@affinityequity.com",
        "smpark@affinityequity.com"
    ]
}

# ────────────────────────────────────────────────
# 날짜 기반 파일명 설정
today_str = datetime.today().strftime('%Y%m%d')
# 메일용 날짜 형식 (19Jun25)
today_date_obj = datetime.today()
mail_date_str = today_date_obj.strftime('%d%b%y')  # 19Jun25
excel_filename = f"curated_list_{today_str}.xlsx"
pdf_output_dir = f"news_articles_pdf_{today_str}"
merged_pdf_filename = f"News run_{mail_date_str}.pdf"

# Chrome 설정
chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
chromedriver_path = "C:/Users/Bloomberg/AppData/Local/Microsoft/WindowsApps/chromedriver.exe"

# ────────────────────────────────────────────────
# 사이트 감지 함수
def detect_site_from_url(url):
    """URL을 보고 어느 사이트인지 판단"""
    if "thebell.co.kr" in url:
        return "thebell"
    elif "investchosun.com" in url:
        return "investchosun"
    elif "marketinsight.hankyung.com" in url:
        return "hankyung"
    else:
        return "naver"  # 그 외 모든 URL은 네이버로 처리

# ────────────────────────────────────────────────
# 개선된 Readability 함수들
def extract_article_with_enhanced_playwright(url):
    """개선된 Playwright와 Readability를 사용하여 기사 추출"""
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # 한국어 폰트 지원을 위한 설정
            page.set_extra_http_headers({
                'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
            })
            
            page.goto(url, timeout=60000, wait_until='networkidle')
            page.wait_for_timeout(3000)
            
            # 개선된 스크립트 실행
            article = page.evaluate(get_enhanced_js_script())
            
            # 이미지 크기 제한을 위한 추가 스크립트 실행
            image_resize_script = """
            // 모든 이미지에 크기 제한 적용
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                // 인라인 스타일 제거
                img.removeAttribute('style');
                img.removeAttribute('width');
                img.removeAttribute('height');
                
                // CSS 클래스 추가로 크기 제한
                img.style.cssText = `
                    max-width: min(100%, 400px) !important;
                    max-height: min(25vh, 300px) !important;
                    width: auto !important;
                    height: auto !important;
                    object-fit: contain !important;
                    display: block !important;
                    margin: 15px auto !important;
                `;
            });
            """
            page.evaluate(image_resize_script)
            
            browser.close()
            
            if article and article.get('title') and article.get('content'):
                # 현재 날짜 정보
                current_date = datetime.now().strftime('%Y년 %m월 %d일')
                
                # HTML 템플릿 생성
                html_content = f"""
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{article['title']}</title>
    {KOREAN_PDF_STYLE}
</head>
<body>
    <div class="article-header">
        <h1 class="article-title">{article['title']}</h1>
        <div class="article-meta">
            <span class="article-source">{article.get('mediaName', '알 수 없는 언론사')}</span>
            <span class="article-date">{article.get('publishDate', current_date)}</span>
        </div>
        {f'<div class="article-byline">기자: {article["byline"]}</div>' if article.get('byline') else ''}
        <div class="article-url">{article.get('url', url)}</div>
    </div>
    
    <div class="article-content">
        {article['content']}
    </div>
    
    <div class="copyright-info">
        {f'<div>{article["copyrightInfo"]}</div>' if article.get('copyrightInfo') else ''}
        <div>출처: {article.get('mediaName', '알 수 없는 언론사')}</div>
        <div>원문 링크: {article.get('url', url)}</div>
    </div>
</body>
</html>
"""
                return html_content
            else:
                return None
                
    except Exception as e:
        print(f"   ⚠️ Enhanced Readability 추출 실패: {e}")
        return None

def create_enhanced_pdf_from_html(html_content):
    """개선된 HTML을 PDF로 변환"""
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # 한국어 폰트를 위한 설정
            page.set_content(html_content, wait_until='networkidle')
            
            # PDF 생성 옵션 개선
            pdf_data = page.pdf(
                format='A4',
                print_background=True,
                margin={
                    'top': '20mm',
                    'bottom': '20mm', 
                    'left': '15mm',
                    'right': '15mm'
                },
                prefer_css_page_size=True
            )
            
            browser.close()
            return pdf_data
            
    except Exception as e:
        print(f"   ⚠️ PDF 생성 실패: {e}")
        return None

def process_naver_article_enhanced(origin_url, idx, total_articles):
    """개선된 네이버 기사 처리"""
    try:
        print(f"   🔄 Readability로 기사 추출 중...")
        html_content = extract_article_with_enhanced_playwright(origin_url)
        
        if html_content:
            print(f"   📄 PDF 변환 중...")
            pdf_data = create_enhanced_pdf_from_html(html_content)
            
            if pdf_data:
                print(f"   ✅ {idx+1}/{total_articles}: 네이버 기사 PDF 생성 완료")
                return pdf_data
            else:
                raise Exception("PDF 변환 실패")
        else:
            raise Exception("Readability로 기사 추출 실패")
            
    except Exception as e:
        print(f"   ⚠️ {idx+1}/{total_articles}: 네이버 PDF 생성 실패 - {e}")
        return None

def enhance_pdf_for_other_sites(driver, print_url):
    """다른 사이트들의 PDF 품질 개선"""
    try:
        # 페이지 로딩 후 한국어 폰트 스타일 주입
        driver.get(print_url)
        time.sleep(3)
        
        # 한국어 최적화 CSS 주입
        korean_style_script = """
        const style = document.createElement('style');
        style.textContent = `
            body {
                font-family: 'Noto Sans KR', 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif !important;
                line-height: 1.8 !important;
                word-break: keep-all !important;
                word-wrap: break-word !important;
            }
            * {
                font-family: 'Noto Sans KR', 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif !important;
            }
            h1, h2, h3, h4, h5, h6 {
                font-weight: 600 !important;
                margin-top: 20px !important;
                margin-bottom: 10px !important;
            }
            p {
                margin-bottom: 15px !important;
                text-align: justify !important;
            }
            img {
                max-width: 100% !important;
                max-height: min(25vh, 300px) !important;
                height: auto !important;
                width: auto !important;
                margin: 15px auto !important;
                display: block !important;
                object-fit: contain !important;
            }
        `;
        document.head.appendChild(style);
        """
        
        driver.execute_script(korean_style_script)
        time.sleep(1)  # 스타일 적용 대기
        
        # 개선된 PDF 생성 옵션
        result = driver.execute_cdp_cmd("Page.printToPDF", {
            "printBackground": True,
            "preferCSSPageSize": True,
            "paperWidth": 8.27,  # A4 width in inches
            "paperHeight": 11.69,  # A4 height in inches
            "marginTop": 0.8,
            "marginBottom": 0.8,
            "marginLeft": 0.6,
            "marginRight": 0.6,
            "displayHeaderFooter": False,
            "scale": 0.9  # 약간 축소하여 더 많은 내용이 들어가도록
        })
        
        return base64.b64decode(result['data'])
        
    except Exception as e:
        print(f"   ⚠️ PDF 품질 개선 실패, 기본 방식 사용: {e}")
        # 실패시 기본 방식으로 폴백
        result = driver.execute_cdp_cmd("Page.printToPDF", {
            "printBackground": True,
            "preferCSSPageSize": True
        })
        return base64.b64decode(result['data'])

# 기존 extract_article_with_playwright 함수를 대체
def extract_article_with_playwright(url):
    """개선된 기사 추출 함수 (기존 함수명 유지)"""
    return extract_article_with_enhanced_playwright(url)

# ────────────────────────────────────────────────
# URL 변환 함수들
def convert_thebell_url(origin_url):
    """더벨 URL을 PDF 출력용 URL로 변환"""
    try:
        news_key = origin_url.split("key=")[-1]
        return f"https://www.thebell.co.kr/front/NewsPrint.asp?key={news_key}"
    except:
        return None

def convert_investchosun_url(origin_url):
    """인베스트조선 URL을 PDF 출력용 URL로 변환"""
    try:
        match = re.search(r'/(\d+)\.html$', origin_url)
        if match:
            contid = match.group(1)
            return f"https://www.investchosun.com/svc/news/article_print.html?contid={contid}"
        else:
            print(f"   ⚠️ URL 패턴을 인식할 수 없습니다: {origin_url}")
            return None
    except Exception as e:
        print(f"   ⚠️ URL 변환 실패: {e}")
        return None

def convert_hankyung_url(origin_url):
    """한경마켓인사이트 URL을 PDF 출력용 URL로 변환"""
    try:
        if "/article/" in origin_url:
            print_url = origin_url.replace("/article/", "/print/")
            return print_url
        else:
            print(f"   ⚠️ URL 패턴을 인식할 수 없습니다: {origin_url}")
            return None
    except Exception as e:
        print(f"   ⚠️ URL 변환 실패: {e}")
        return None

def convert_naver_url(origin_url):
    """네이버 URL은 변환 없이 그대로 반환 (Readability로 처리)"""
    return origin_url

# URL 변환 함수 매핑
URL_CONVERTERS = {
    "thebell": convert_thebell_url,
    "investchosun": convert_investchosun_url,
    "hankyung": convert_hankyung_url,
    "naver": convert_naver_url
}

# ────────────────────────────────────────────────
# 파일명 변환 함수
def get_english_filename(korean_filename, today_str):
    """한글 파일명을 영문 파일명으로 변환"""
    # News run_19Jun25.pdf 형식으로 반환
    return merged_pdf_filename

# ────────────────────────────────────────────────
# 사이트별 로그인 함수
def login_to_site(driver, site_key):
    """사이트별 로그인 수행"""
    config = SITE_CONFIGS[site_key]
    
    try:
        print(f"🔐 {config['name']} 로그인 중...")
        driver.get(config["login_url"])
        time.sleep(2)
        
        # 로그인 정보 입력
        id_field = driver.find_element(By.ID, config["login_selectors"]["id_field"])
        pw_field = driver.find_element(By.ID, config["login_selectors"]["pw_field"])
        
        id_field.clear()
        id_field.send_keys(config["id"])
        pw_field.clear()
        pw_field.send_keys(config["password"])
        
        # 로그인 버튼 클릭
        login_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, config["login_selectors"]["login_button"]))
        )
        login_button.click()
        time.sleep(3)
        
        print(f"   ✅ {config['name']} 로그인 성공")
        return True
        
    except Exception as e:
        print(f"   ❌ {config['name']} 로그인 실패: {e}")
        return False

# ────────────────────────────────────────────────
# 엑셀 데이터 분석 함수
def analyze_excel_data():
    """엑셀 파일을 분석하여 사이트별 기사 수를 파악"""
    try:
        df = pd.read_excel(excel_filename)
        
        if '링크' not in df.columns:
            print("   ❌ '링크' 컬럼이 없습니다.")
            return None, {}
        
        # 사이트별 기사 분류
        site_articles = {}
        total_articles = len(df)
        
        for idx, row in df.iterrows():
            url = row['링크']
            site_key = detect_site_from_url(url)
            
            if site_key not in site_articles:
                site_articles[site_key] = []
            site_articles[site_key].append({
                'index': idx,
                'url': url,
                'title': row.get('제목', f'기사_{idx+1}')
            })
        
        # 통계 출력
        print(f"   📊 총 {total_articles}개 기사 발견")
        for site_key, articles in site_articles.items():
            site_name = SITE_CONFIGS[site_key]['name']
            print(f"   - {site_name}: {len(articles)}개")
        
        return df, site_articles
        
    except Exception as e:
        print(f"   ❌ 엑셀 파일 분석 실패: {e}")
        return None, {}

# ────────────────────────────────────────────────
# 통합 PDF 생성 함수
def generate_unified_pdf(driver):
    """모든 사이트의 기사를 하나의 PDF로 생성"""
    print(f"\n📄 통합 PDF 생성 시작...")
    
    # 출력 디렉토리 생성
    os.makedirs(pdf_output_dir, exist_ok=True)
    
    # 엑셀 데이터 분석
    df, site_articles = analyze_excel_data()
    if df is None:
        return None, 0, {}
    
    total_articles = len(df)
    if total_articles == 0:
        print("   ❗ 처리할 기사가 없습니다.")
        return None, 0, {}
    
    # 로그인된 사이트 추적
    logged_in_sites = set()
    pdf_paths = []
    success_count = 0
    site_stats = {}
    
    # 사이트별 통계 초기화
    for site_key in site_articles.keys():
        site_stats[site_key] = {
            'name': SITE_CONFIGS[site_key]['name'],
            'total': len(site_articles[site_key]),
            'success': 0,
            'failed': 0
        }
    
    # 각 기사를 순서대로 처리
    for idx, row in df.iterrows():
        try:
            origin_url = row['링크']
            title = row.get('제목', f'기사_{idx+1}')
            site_key = detect_site_from_url(origin_url)
            
            site_name = SITE_CONFIGS[site_key]['name']
            print(f"   🔄 {idx+1}/{total_articles}: {site_name} - {title[:50]}...")
            
            # 네이버는 로그인 불필요, 다른 사이트는 필요시 로그인
            if site_key != "naver" and site_key not in logged_in_sites:
                if login_to_site(driver, site_key):
                    logged_in_sites.add(site_key)
                else:
                    print(f"   ❌ {site_name} 로그인 실패로 건너뜀")
                    site_stats[site_key]['failed'] += 1
                    continue
            
            # URL 변환
            url_converter = URL_CONVERTERS[site_key]
            print_url = url_converter(origin_url)
            
            if not print_url:
                print(f"   ⚠️ {idx+1}/{total_articles}: URL 변환 실패")
                site_stats[site_key]['failed'] += 1
                continue
            
            # PDF 생성
            pdf_data = None
            
            if site_key == "naver":
                # 개선된 네이버 처리
                pdf_data = process_naver_article_enhanced(print_url, idx, total_articles)
                if not pdf_data:
                    site_stats[site_key]['failed'] += 1
                    continue
            else:
                # 기존 사이트들은 개선된 방식으로 처리
                pdf_data = enhance_pdf_for_other_sites(driver, print_url)
            
            # 파일명 생성
            if site_key == "thebell":
                file_id = origin_url.split("key=")[-1]
            elif site_key == "investchosun":
                match = re.search(r'/(\d+)\.html$', origin_url)
                file_id = match.group(1) if match else f"article_{idx+1}"
            elif site_key == "hankyung":
                match = re.search(r'/([^/]+)$', origin_url)
                file_id = match.group(1) if match else f"article_{idx+1}"
            elif site_key == "naver":
                # 네이버 URL에서 고유 ID 추출
                match = re.search(r'article/(\d+)', origin_url)
                if not match:
                    match = re.search(r'aid=(\d+)', origin_url)
                file_id = match.group(1) if match else f"article_{idx+1}"
            else:
                file_id = f"article_{idx+1}"
            
            pdf_path = os.path.join(pdf_output_dir, f"{idx+1:03d}_{site_key}_{file_id}.pdf")
            with open(pdf_path, "wb") as f:
                f.write(pdf_data)
            pdf_paths.append(pdf_path)
            success_count += 1
            site_stats[site_key]['success'] += 1
            
            print(f"   ✅ {idx+1}/{total_articles}: 저장 완료")
            
        except Exception as e:
            print(f"   ⚠️ {idx+1}/{total_articles} 실패: {e}")
            if site_key in site_stats:
                site_stats[site_key]['failed'] += 1
    
    # PDF 병합
    if pdf_paths:
        print(f"\n🔗 통합 PDF 병합 중... ({len(pdf_paths)}개 파일)")
        
        # 파일 크기 계산
        total_size_mb = sum(os.path.getsize(path) for path in pdf_paths) / (1024 * 1024)
        print(f"   📊 예상 통합 PDF 크기: {total_size_mb:.1f}MB")
        
        try:
            merger = PdfMerger()
            for path in pdf_paths:
                merger.append(path)
            merger.write(merged_pdf_filename)
            merger.close()
            
            final_size_mb = os.path.getsize(merged_pdf_filename) / (1024 * 1024)
            print(f"   ✅ 병합 완료: {merged_pdf_filename} ({final_size_mb:.1f}MB)")
            
            # 개별 파일 정리
            print(f"   🗑️ 개별 PDF 파일들을 정리합니다...")
            deleted_count = 0
            for pdf_path in pdf_paths:
                try:
                    os.remove(pdf_path)
                    deleted_count += 1
                except Exception as e:
                    print(f"   삭제 실패: {os.path.basename(pdf_path)} → {e}")
            
            # 빈 디렉토리 삭제
            try:
                if os.path.exists(pdf_output_dir) and not os.listdir(pdf_output_dir):
                    os.rmdir(pdf_output_dir)
            except:
                pass
            
            print(f"   ✅ 정리 완료: {deleted_count}개 개별 파일 삭제")
            
            return merged_pdf_filename, success_count, site_stats
            
        except Exception as e:
            print(f"   ❌ PDF 병합 실패: {e}")
            return None, success_count, site_stats
    else:
        print(f"   ❗ 생성된 PDF가 없습니다.")
        return None, 0, site_stats

# ────────────────────────────────────────────────
# 이메일 발송 함수
def send_email_with_pdf(pdf_file, total_articles, site_stats):
    """생성된 PDF를 이메일로 발송"""
    try:
        print("\n📧 이메일 발송을 시작합니다...")
        
        # PDF 파일 확인
        if not pdf_file or not os.path.exists(pdf_file):
            print("   ⚠️ 첨부할 PDF 파일이 없습니다. 이메일 발송을 중단합니다.")
            return False
        
        pdf_size_mb = os.path.getsize(pdf_file) / (1024 * 1024)
        print(f"   📄 PDF 파일: {pdf_file} ({pdf_size_mb:.1f}MB)")
        
        # 엑셀 파일 다시 읽어서 그룹별 기사 정리
        df = pd.read_excel(excel_filename)
        grouped_news = {}
        
        # 키워드별로 그룹화
        for idx, row in df.iterrows():
            keyword = row.get('검색키워드', row.get('검색 키워드', row.get('키워드', '')))
            if pd.isna(keyword) or keyword == '':
                continue
            
            # 그룹 찾기
            group_name = KEYWORD_GROUPING.get(keyword, None)
            if group_name:
                if group_name not in grouped_news:
                    grouped_news[group_name] = []
                
                # 기사 정보 저장
                title = row.get('제목', '')
                url = row.get('링크', '')
                # 언론사 정보 가져오기 (엑셀의 '언론사' 컬럼 사용)
                media_name = row.get('언론사', '')
                if pd.isna(media_name) or media_name == '':
                    # 언론사 정보가 없으면 사이트명 사용
                    site_key = detect_site_from_url(url)
                    media_name = SITE_CONFIGS[site_key]['name']
                
                pub_date = row.get('날짜', row.get('게재일', ''))
                
                # 날짜 형식 처리 - 항상 DDMmm 형식으로
                if isinstance(pub_date, pd.Timestamp):
                    pub_date = pub_date.strftime('%d%b')
                elif isinstance(pub_date, str):
                    if len(pub_date) == 8 and pub_date.isdigit():
                        # 20250619 -> 19Jun
                        from datetime import datetime as dt
                        date_obj = dt.strptime(pub_date, '%Y%m%d')
                        pub_date = date_obj.strftime('%d%b')
                    elif '-' in pub_date:
                        # 2025-06-19 형식 처리 -> 19Jun
                        try:
                            from datetime import datetime as dt
                            date_obj = dt.strptime(pub_date.split(' ')[0], '%Y-%m-%d')
                            pub_date = date_obj.strftime('%d%b')
                        except:
                            # 날짜 파싱 실패시 기본값
                            pub_date = '19Jun'
                    elif '.' in pub_date:
                        # 2025.06.18 형식 처리 -> 18Jun
                        try:
                            from datetime import datetime as dt
                            date_obj = dt.strptime(pub_date.split(' ')[0], '%Y.%m.%d')
                            pub_date = date_obj.strftime('%d%b')
                        except:
                            pub_date = '19Jun'
                else:
                    pub_date = '19Jun'  # 기본값
                
                grouped_news[group_name].append({
                    'title': title,
                    'date': pub_date,
                    'source': media_name
                })
        
        # 이메일 메시지 생성
        msg = MIMEMultipart()
        msg['From'] = EMAIL_CONFIG["sender_email"]
        
        # 수신자 처리 - BCC로 변경
        recipients = EMAIL_CONFIG["recipient_email"]
        if isinstance(recipients, list):
            msg['To'] = ""  # To 필드는 비워둠
            msg['Bcc'] = ", ".join(recipients)  # BCC로 설정
            recipient_display = f"{len(recipients)}명 (BCC)"
        else:
            msg['To'] = ""
            msg['Bcc'] = recipients
            recipient_display = "1명 (BCC)"
            recipients = [recipients]  # 단일 수신자를 리스트로 변환
            
        # 날짜 형식 변환 - News run_19Jun25 형식
        msg['Subject'] = f"News run_{mail_date_str}"
        
        # HTML 형식으로 이메일 본문 생성 (Bold와 Underline을 위해)
        body_html = """<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; font-size: 14px; }
        .group-header { font-weight: bold; text-decoration: underline; margin-top: 15px; margin-bottom: 5px; }
        .article-item { margin-left: 20px; margin-bottom: 3px; }
        .signature { margin-top: 20px; }
    </style>
</head>
<body>
    <p>Dear All,</p>
    <p>Please see attached today's news.</p>
"""
        
        # 그룹별로 기사 목록 추가 (정의된 순서대로)
        for group in GROUP_ORDER:
            if group in grouped_news and grouped_news[group]:
                body_html += f'<div class="group-header">{group}</div>\n'
                for idx, article in enumerate(grouped_news[group], 1):
                    # 제목 처리 (너무 길면 자르기)
                    title = article['title']
                    if len(title) > 50:
                        title = title[:50] + '...'
                    body_html += f'<div class="article-item">{idx}. {title} [{article["date"]}. {article["source"]}]</div>\n'
        
        # 그룹에 속하지 않는 키워드가 있는 경우 Others로 표시
        other_keywords = []
        for idx, row in df.iterrows():
            keyword = row.get('검색키워드', row.get('검색 키워드', row.get('키워드', '')))
            if pd.isna(keyword) or keyword == '':
                continue
            if keyword not in KEYWORD_GROUPING:
                other_keywords.append(keyword)
        
        if other_keywords:
            unique_others = list(set(other_keywords))
            if unique_others:
                body_html += '<div class="group-header">Others</div>\n'
                body_html += f'<div class="article-item">Keywords not grouped: {", ".join(unique_others)}</div>\n'
        
        body_html += """
    <div class="signature">
        <p>Thank you.</p>
        <p>Best regards,<br>
        Sangmin Park</p>
    </div>
</body>
</html>
"""
        
        # HTML 메시지 첨부
        msg.attach(MIMEText(body_html, 'html'))
        
        # PDF 파일 첨부
        try:
            with open(pdf_file, "rb") as f:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(f.read())
            encoders.encode_base64(part)
            
            english_filename = get_english_filename(pdf_file, today_str)
            print(f"   📝 PDF 첨부: {english_filename}")
            
            part.add_header(
                'Content-Disposition',
                f'attachment; filename="{english_filename}"'
            )
            msg.attach(part)
            
            print(f"   ✅ PDF 파일 첨부 완료: {english_filename} ({pdf_size_mb:.1f}MB)")
        except Exception as e:
            print(f"   ❌ PDF 파일 첨부 실패: {e}")
            return False
        
        # SMTP 서버 연결 및 이메일 발송
        print("   🔄 SMTP 서버에 연결 중...")
        server = smtplib.SMTP(EMAIL_CONFIG["smtp_server"], EMAIL_CONFIG["smtp_port"])
        server.starttls()
        print("   🔐 로그인 중...")
        server.login(EMAIL_CONFIG["sender_email"], EMAIL_CONFIG["sender_password"])
        print("   📤 이메일 발송 중...")
        
        # sendmail 사용 (send_message 대신)
        server.sendmail(EMAIL_CONFIG["sender_email"], recipients, msg.as_string())
            
        server.quit()
        
        print(f"\n   🎉 이메일 발송 성공!")
        print(f"   📬 수신자: {recipient_display}")
        print(f"   📅 발송 시간: {datetime.now().strftime('%H:%M:%S')}")
        return True
        
    except Exception as e:
        print(f"\n   ❌ 이메일 발송 실패: {e}")
        print("   💡 다음 사항을 확인해 주세요:")
        print("      - 이메일 주소와 비밀번호")
        print("      - 인터넷 연결 상태")
        print("      - Gmail 2단계 인증 및 앱 비밀번호")
        print("      - PDF 파일 크기 (25MB 제한)")
        return False

# ────────────────────────────────────────────────
# 메인 실행 함수
def main():
    driver = None
    
    try:
        print("=" * 70)
        print("🔔 뉴스 통합 스크래핑 및 PDF 생성 시작")
        print("=" * 70)
        print(f"📅 날짜: {datetime.today().strftime('%Y년 %m월 %d일')}")
        
        # 수신자 정보 출력
        recipients = EMAIL_CONFIG['recipient_email']
        if isinstance(recipients, list):
            print(f"📧 수신자: {len(recipients)}명")
            for i, email in enumerate(recipients, 1):
                print(f"   {i}. {email}")
        else:
            print(f"📧 수신자: {recipients}")
            
        print(f"📊 대상 파일: {excel_filename}")
        print()
        
        # 엑셀 파일 확인
        print(f"📊 엑셀 파일 확인...")
        if not os.path.exists(excel_filename):
            print(f"   ❌ 엑셀 파일이 존재하지 않습니다: {excel_filename}")
            return
        print(f"   ✅ 엑셀 파일 발견: {excel_filename}")
        
        # Chrome 설정 및 시작
        print("\n🌐 Chrome 브라우저를 시작합니다...")
        options = Options()
        options.binary_location = chrome_path
        options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--window-size=1920,1080")
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service)
        print("   ✅ 브라우저 시작 완료")
        
        # 통합 PDF 생성
        pdf_file, success_count, site_stats = generate_unified_pdf(driver)
        
        # 결과 요약 출력
        print(f"\n{'='*50}")
        print("📋 전체 작업 결과 요약")
        print(f"{'='*50}")
        
        total_processed = sum(stats['total'] for stats in site_stats.values())
        total_success = sum(stats['success'] for stats in site_stats.values())
        total_failed = sum(stats['failed'] for stats in site_stats.values())
        
        print(f"📊 전체 통계:")
        print(f"   - 총 기사 수: {total_processed}개")
        print(f"   - 성공: {total_success}개")
        print(f"   - 실패: {total_failed}개")
        print(f"   - 성공률: {(total_success/total_processed*100):.1f}%" if total_processed > 0 else "   - 성공률: 0%")
        
        print(f"\n📈 사이트별 상세:")
        for site_key, stats in site_stats.items():
            success_rate = (stats['success'] / stats['total'] * 100) if stats['total'] > 0 else 0
            print(f"   - {stats['name']}: {stats['success']}/{stats['total']}개 ({success_rate:.1f}%)")
        
        if pdf_file:
            pdf_size_mb = os.path.getsize(pdf_file) / (1024 * 1024)
            print(f"\n📄 통합 PDF: {pdf_file} ({pdf_size_mb:.1f}MB)")
        
        # 이메일 발송
        if total_success > 0:
            email_success = send_email_with_pdf(pdf_file, total_processed, site_stats)
            
            if email_success:
                print("\n🎉 모든 작업이 성공적으로 완료되었습니다!")
                print("   ✅ 이메일 발송 완료")
            else:
                print("\n⚠️ PDF 생성은 완료되었지만 이메일 발송에 실패했습니다.")
        else:
            print("\n❗ 성공한 작업이 없어 이메일을 발송하지 않습니다.")
            
    except Exception as e:
        print(f"\n❌ 작업 중 오류 발생: {e}")
        
    finally:
        if driver:
            driver.quit()
            print("\n🚪 브라우저를 종료합니다.")
        
        print("\n" + "=" * 70)
        print("작업 완료")
        print("=" * 70)

# ────────────────────────────────────────────────
# 실행 부분
if __name__ == "__main__":
    main()