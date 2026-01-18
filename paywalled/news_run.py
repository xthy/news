from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from datetime import datetime, timedelta

import time
import random
import pandas as pd
import urllib.parse
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

# ────────────────────────────────────────────────
import pandas as pd
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email.mime.text import MIMEText
from datetime import datetime
import os

# 1. 이메일 설정
EMAIL_CONFIG = {
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "sender_email": "xxxthy@gmail.com",
    "sender_password": "ckxi cbhu myzv ejyt",  # Gmail 앱 비밀번호
    "recipient_email": [
        "thyang@affinityequity.com",
        "smpark@affinityequity.com"
    ]
}



# ────────────────────────────────────────────────
# 크롬 드라이버 및 실행 옵션
chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
chromedriver_path = "C:/Users/Bloomberg/AppData/Local/Microsoft/WindowsApps/chromedriver.exe"

def setup_driver():
    options = Options()
    options.binary_location = chrome_path
    options.add_argument("--log-level=3")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-images")  # 속도 향상
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    options.add_experimental_option("detach", True)

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service)
    
    # 봇 탐지 회피
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    return driver

# ────────────────────────────────────────────────
# 키워드 목록 정의
base_keywords = [
    "교보생명", "버거킹", "팀홀튼", "맥도날드", "현대커머셜", "유베이스", "서브원", 
    "락앤락", "잡코리아", "알바몬", "요기요", "쿠팡이츠", "배달의민족", "배민", 
    "SK렌터카", "롯데렌탈", "롯데렌터카", "어피니티", "어피너티"
]
suffixes = ["", " 매출", " 순익", " 수익"]
keywords = [kw + suf for kw in base_keywords for suf in suffixes]

# ────────────────────────────────────────────────
# 기준일 설정
today = datetime.today()
cutoff = today - timedelta(days=2)

# ────────────────────────────────────────────────
# 더벨 크롤링 함수
def scrape_thebell():
    print(f"\n{'='*60}")
    print("📰 더벨 크롤링 시작")
    print(f"{'='*60}")
    
    driver = setup_driver()
    results = []
    
    try:
        # 로그인
        print("🔐 더벨 로그인 중...")
        driver.get("https://www.thebell.co.kr/LoginCert/Login.asp")
        driver.find_element(By.ID, "id").send_keys("affinity")
        driver.find_element(By.ID, "pw").send_keys("equity")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "btn1")))
        driver.find_element(By.ID, "btn1").click()
        time.sleep(random.uniform(2.0, 3.0))
        print("✅ 더벨 로그인 완료")
        
        # 키워드별 검색
        for i, keyword in enumerate(keywords):
            print(f"\n🔎 키워드 ({i+1}/{len(keywords)}): {keyword}")
            url = f"https://www.thebell.co.kr/search/search.asp?keyword2={keyword}"
            driver.get(url)
            time.sleep(random.uniform(1.5, 2.5))
            
            try:
                WebDriverWait(driver, 8).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "dt > a.txtE"))
                )
            except:
                print("- 검색 결과 없음")
                continue
            
            items = driver.find_elements(By.CSS_SELECTOR, "ul > li")
            found_any = False
            
            for item in items:
                try:
                    a_tag = item.find_element(By.CSS_SELECTOR, "dt > a.txtE")
                    date_tag = item.find_element(By.CSS_SELECTOR, "dd.userBox span.date")
                    title = a_tag.text.strip()
                    date_text = date_tag.text.strip()
                    
                    try:
                        date_obj = datetime.strptime(date_text, "%Y-%m-%d %H:%M:%S")
                    except ValueError:
                        continue
                        
                    if date_obj >= cutoff:
                        href = a_tag.get_attribute("href")
                        link = "https://www.thebell.co.kr" + href if href.startswith("/") else href
                        result = {
                            "사이트": "더벨",
                            "검색 키워드": keyword,
                            "날짜": date_text,
                            "제목": title,
                            "링크": link
                        }
                        results.append(result)
                        print(f"- [{date_text}] {title}")
                        found_any = True
                except:
                    continue
                    
            if not found_any:
                print("- (최근 3일 내 기사 없음)")
                
            if i < len(keywords) - 1:
                time.sleep(random.uniform(0.5, 1.0))
                
    except Exception as e:
        print(f"❌ 더벨 크롤링 오류: {str(e)}")
    finally:
        driver.quit()
    
    return results

# ────────────────────────────────────────────────
# 인베스트조선 크롤링 함수
def scrape_investchosun():
    print(f"\n{'='*60}")
    print("📰 인베스트조선 크롤링 시작")
    print(f"{'='*60}")
    
    driver = setup_driver()
    results = []

    try:
        # 로그인
        print("🔐 인베스트조선 로그인 중...")
        driver.get("https://www.investchosun.com/svc/member/invest_login.html")
        
        # WebDriverWait 설정
        wait = WebDriverWait(driver, 10)
        
        # 로그인 폼이 로드될 때까지 대기
        username_field = wait.until(EC.presence_of_element_located((By.ID, "username")))
        password_field = wait.until(EC.presence_of_element_located((By.ID, "login_password")))
        
        # 입력 필드가 클릭 가능할 때까지 대기 후 입력
        wait.until(EC.element_to_be_clickable((By.ID, "username")))
        username_field.clear()
        username_field.send_keys("affini1")
        
        wait.until(EC.element_to_be_clickable((By.ID, "login_password")))
        password_field.clear()
        password_field.send_keys("affini12026")
        
        # 로그인 버튼이 클릭 가능할 때까지 대기
        login_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "#SignIn")))
        
        # 스크롤해서 버튼이 화면에 보이도록 함
        driver.execute_script("arguments[0].scrollIntoView();", login_button)
        time.sleep(0.5)
        
        # JavaScript로 클릭 (더 안전함)
        driver.execute_script("arguments[0].click();", login_button)
        
        # 로그인 완료까지 대기
        time.sleep(random.uniform(3.0, 4.0))
        print("✅ 인베스트조선 로그인 완료")
        
        # 키워드별 검색
        for i, keyword in enumerate(keywords):
            print(f"\n🔎 키워드 ({i+1}/{len(keywords)}): {keyword}")
            encoded_keyword = urllib.parse.quote(keyword)
            url = f"https://www.investchosun.com/svc/news/search.html?query={encoded_keyword}&sort=date"
            driver.get(url)
            
            # 검색 결과 페이지가 로드될 때까지 대기
            try:
                wait.until(EC.presence_of_element_located((By.TAG_NAME, "li")))
            except:
                print("- 검색 결과 로딩 실패")
                continue
                
            time.sleep(random.uniform(1.5, 2.5))
            
            # 기사 목록 가져오기
            all_items = driver.find_elements(By.CSS_SELECTOR, "li")
            items = []
            for item in all_items:
                try:
                    item.find_element(By.CSS_SELECTOR, ".list_detail")
                    items.append(item)
                except:
                    continue
            
            found_any = False
            for item in items[:15]:  # 상위 15개만 처리
                try:
                    # 제목 요소가 존재할 때까지 대기
                    title_element = WebDriverWait(item, 3).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "dl dt a"))
                    )
                    title = title_element.text.strip()
                    
                    if not title:
                        continue
                    
                    href = title_element.get_attribute("href")
                    link = "https://www.investchosun.com" + href if href.startswith("/") else href
                    
                    # 날짜 요소가 존재할 때까지 대기
                    date_element = WebDriverWait(item, 3).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "dl dd.date span"))
                    )
                    date_text = date_element.text.strip()
                    
                    if "|" in date_text:
                        date_text = date_text.split("|")[0].strip()
                    
                    try:
                        date_obj = datetime.strptime(date_text, "%Y.%m.%d")
                        if date_obj >= cutoff:
                            result = {
                                "사이트": "인베스트조선",
                                "검색 키워드": keyword,
                                "날짜": date_text,
                                "제목": title,
                                "링크": link
                            }
                            results.append(result)
                            print(f"- [{date_text}] {title}")
                            found_any = True
                    except ValueError:
                        continue
                        
                except Exception as e:
                    # 개별 아이템 처리 실패는 무시하고 계속
                    continue
                    
            if not found_any:
                print("- (최근 3일 내 기사 없음)")
                
            if i < len(keywords) - 1:
                time.sleep(random.uniform(0.5, 1.0))
                
    except Exception as e:
        print(f"❌ 인베스트조선 크롤링 오류: {str(e)}")
        # 스크린샷 저장 (디버깅용)
        try:
            driver.save_screenshot("investchosun_error.png")
            print("🖼️ 에러 스크린샷 저장: investchosun_error.png")
        except:
            pass
    finally:
        driver.quit()

    return results

# ────────────────────────────────────────────────
# 한경마켓인사이트 크롤링 함수
def scrape_hankyung():
    print(f"\n{'='*60}")
    print("📰 한경마켓인사이트 크롤링 시작")
    print(f"{'='*60}")
    
    driver = setup_driver()
    results = []
    
    try:
        # 로그인
        print("🔐 한경마켓인사이트 로그인 중...")
        driver.get("https://marketinsight.hankyung.com/")
        time.sleep(1.5)
        
        driver.find_element(By.ID, "user_id").send_keys("affini1")
        driver.find_element(By.ID, "password").send_keys("affini1")
        driver.find_element(By.CSS_SELECTOR, ".btnLogin").click()
        time.sleep(random.uniform(2.0, 3.0))
        print("✅ 한경마켓인사이트 로그인 완료")
        
        # 키워드별 검색
        for i, keyword in enumerate(keywords):
            print(f"\n🔎 키워드 ({i+1}/{len(keywords)}): {keyword}")
            encoded_keyword = urllib.parse.quote(keyword)
            url = f"https://marketinsight.hankyung.com/search?keyword={encoded_keyword}"
            driver.get(url)
            time.sleep(random.uniform(1.5, 2.5))
            
            # 기사 목록 가져오기
            all_items = driver.find_elements(By.CSS_SELECTOR, "li")
            items = []
            for item in all_items:
                try:
                    item.find_element(By.CSS_SELECTOR, ".txt-cont")
                    items.append(item)
                except:
                    continue
            
            found_any = False
            for item in items[:15]:  # 상위 15개만 처리
                try:
                    title_element = item.find_element(By.CSS_SELECTOR, ".txt-cont h3.news-tit a")
                    title = title_element.text.strip()
                    
                    if not title:
                        continue
                    
                    href = title_element.get_attribute("href")
                    link = "https://marketinsight.hankyung.com" + href if href.startswith("/") else href
                    
                    date_element = item.find_element(By.CSS_SELECTOR, ".txt-cont p.date")
                    date_text = date_element.text.strip()
                    
                    try:
                        date_obj = datetime.strptime(date_text, "%Y.%m.%d %H:%M")
                        if date_obj >= cutoff:
                            result = {
                                "사이트": "한경마켓인사이트",
                                "검색 키워드": keyword,
                                "날짜": date_text,
                                "제목": title,
                                "링크": link
                            }
                            results.append(result)
                            print(f"- [{date_text}] {title}")
                            found_any = True
                    except ValueError:
                        continue
                        
                except:
                    continue
                    
            if not found_any:
                print("- (최근 3일 내 기사 없음)")
                
            if i < len(keywords) - 1:
                time.sleep(random.uniform(0.5, 1.0))
                
    except Exception as e:
        print(f"❌ 한경마켓인사이트 크롤링 오류: {str(e)}")
    finally:
        driver.quit()
    
    return results

# ────────────────────────────────────────────────
# 이메일 전송 함수ㄹ
def send_email_with_attachment(filename, total_articles, site_summary):
    print(f"\n{'='*60}")
    print("📧 이메일 전송 시작")
    print(f"{'='*60}")
    
    try:
        # 이메일 메시지 작성
        msg = MIMEMultipart()
        msg['From'] = EMAIL_CONFIG["sender_email"]
        msg['To'] = ", ".join(EMAIL_CONFIG["recipient_email"])
        msg['Subject'] = f"뉴스 크롤링 결과 - {today.strftime('%Y.%m.%d')}"
        
        # 이메일 본문 작성
        body = f"""
안녕하세요,

{today.strftime('%Y년 %m월 %d일')} 뉴스 크롤링 결과를 전송드립니다.

📊 수집 결과:
- 총 {total_articles}개 기사 수집
- 검색 기간: {cutoff.strftime('%Y-%m-%d')} ~ {today.strftime('%Y-%m-%d')}

📰 사이트별 수집 현황:
"""
        
        for site, count in site_summary.items():
            body += f"- {site}: {count}개\n"
        
        body += f"""
첨부된 엑셀 파일에서 상세 내용을 확인하실 수 있습니다.

감사합니다.
"""
        
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        # 파일 첨부
        if os.path.exists(filename):
            with open(filename, "rb") as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                
            encoders.encode_base64(part)
            part.add_header(
                'Content-Disposition',
                f'attachment; filename= {os.path.basename(filename)}'
            )
            msg.attach(part)
            print(f"✅ 파일 첨부 완료: {filename}")
        else:
            print(f"❌ 첨부 파일을 찾을 수 없습니다: {filename}")
            return False
        
        # SMTP 서버 연결 및 이메일 전송
        server = smtplib.SMTP(EMAIL_CONFIG["smtp_server"], EMAIL_CONFIG["smtp_port"])
        server.starttls()  # TLS 보안 연결
        server.login(EMAIL_CONFIG["sender_email"], EMAIL_CONFIG["sender_password"])
        
        text = msg.as_string()
        server.sendmail(EMAIL_CONFIG["sender_email"], EMAIL_CONFIG["recipient_email"], text)
        server.quit()
        
        print("✅ 이메일 전송 완료!")
        print(f"📧 수신자: {', '.join(EMAIL_CONFIG['recipient_email'])}")
        return True
        
    except Exception as e:
        print(f"❌ 이메일 전송 오류: {str(e)}")
        return False

# ────────────────────────────────────────────────
# 메인 실행
def main():
    print("🚀 다중 사이트 뉴스 크롤링 시작")
    print(f"📅 검색 기간: {cutoff.strftime('%Y-%m-%d')} ~ {today.strftime('%Y-%m-%d')}")
    print(f"🔍 총 키워드: {len(keywords)}개")
    
    all_results = []
    
    # 각 사이트별 크롤링 실행
    thebell_results = scrape_thebell()
    all_results.extend(thebell_results)
    
    investchosun_results = scrape_investchosun()
    all_results.extend(investchosun_results)
    
    hankyung_results = scrape_hankyung()
    all_results.extend(hankyung_results)
    
    # 결과 저장 및 이메일 전송
    if all_results:
        df = pd.DataFrame(all_results)
        # 중복 제거 (제목, 날짜 기준)
        df.drop_duplicates(subset=["제목", "날짜"], inplace=True)
        
        # 날짜순 정렬 (최신순)
        df = df.sort_values(["날짜"], ascending=[False])
        
        filename = f"paywalled_news_{today.strftime('%Y%m%d')}.xlsx"
        df.to_excel(filename, index=False)
        
        print(f"\n{'='*60}")
        print(f"✅ 크롤링 완료!")
        print(f"📊 총 {len(df)}개 기사 수집")
        print(f"💾 저장 파일: {filename}")
        print(f"{'='*60}")
        
        # 사이트별 요약
        site_summary = df.groupby('사이트').size()
        for site, count in site_summary.items():
            print(f"- {site}: {count}개")
        
        # 이메일 전송
        # email_success = send_email_with_attachment(filename, len(df), site_summary)
        email_success = False
        if email_success:
            print(f"\n🎉 모든 작업이 성공적으로 완료되었습니다!")
        else:
            print(f"\n⚠️ 크롤링은 완료되었으나 이메일 전송에 실패했습니다.")
            
    else:
        print("\n❗ 저장할 데이터가 없습니다.")
        # 데이터가 없어도 빈 결과를 이메일로 전송
        empty_df = pd.DataFrame(columns=["사이트", "검색 키워드", "날짜", "제목", "링크"])
        filename = f"paywalled_news_{today.strftime('%Y%m%d')}.xlsx"
        empty_df.to_excel(filename, index=False)
        
        site_summary = {}
        send_email_with_attachment(filename, 0, site_summary)

if __name__ == "__main__":
    main()