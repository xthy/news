
import os
import time
import json
import base64
import random
import urllib.parse
import re
import shutil
import logging
import json
import os
from datetime import datetime, timedelta
import pandas as pd
from PyPDF2 import PdfMerger
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# ────────────────────────────────────────────────
# Configuration
# ────────────────────────────────────────────────

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [%(name)s] - %(message)s',
    handlers=[
        logging.FileHandler(f'paywalled_scraper_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Calculate Date Range for scraping
TODAY = datetime.now()
YESTERDAY = TODAY - timedelta(days=1)
SEARCH_WINDOW_DAYS = 1
START_DATE = TODAY - timedelta(days=SEARCH_WINDOW_DAYS)

YESTERDAY_STR = YESTERDAY.strftime("%Y-%m-%d")
YESTERDAY_STR_DOT = YESTERDAY.strftime("%Y.%m.%d")
YESTERDAY_STR_NODASH = YESTERDAY.strftime("%Y%m%d")

logger.info(f"Target Date Range: {START_DATE.date()} ~ {TODAY.date()}")

# Load Configuration from config.json
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.json")
try:
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config_data = json.load(f)
except:
    config_data = {}

SLACK_WEBHOOK_URL = config_data.get("SLACK_WEBHOOK_URL", "")
LOG_SLACK_WEBHOOK_URL = config_data.get("LOG_SLACK_WEBHOOK_URL", "")
SPREADSHEET_ID = config_data.get("SPREADSHEET_ID", "18KrjCdEEcNJrmNRAV19nhwAoya9l65gzH3ypFYaRlHM")
HISTORY_SHEET_NAME = "paywalled_pdf"
HISTORY_DAYS = 30
AB_TEST_MODE = False

def normalize(t):
    if not t: return ""
    # Remove all whitespace, special chars, and lower case
    return re.sub(r'[\s\W_]+', '', str(t)).lower()

# Global log buffer for Slack forwarding
class SlackLogHandler(logging.Handler):
    def __init__(self):
        super().__init__()
        self.log_buffer = []
    def emit(self, record):
        msg = self.format(record)
        self.log_buffer.append(msg)
    def get_summary(self):
        # Keep only INFO/ERROR levels for summary to avoid noise
        return "\n".join([line for line in self.log_buffer if "INFO" in line or "ERROR" in line])

slack_handler = SlackLogHandler()
slack_handler.setFormatter(logging.Formatter('%(message)s'))
logger.addHandler(slack_handler)

CREDENTIALS = {
    "dealsiteplus": {
        "login_url": "https://dealsiteplus.co.kr/user/access/login",
        "ids": ["affinity"],
        "pws": ["equity1!"],
        "input_id": "login",
        "input_pw": "password"
    },
    "thebell": {
        "login_url": "https://www.thebell.co.kr/LoginCert/Login.asp",
        "ids": ["affinity"],
        "pws": ["equity"],
        "input_id": "id",
        "input_pw": "pw",
        "btn_selector": "#login_form #btn1"
    },
    "hankyung": {
        "login_url": "https://marketinsight.hankyung.com/",
        "ids": ["affini1"],
        "pws": ["affini1"],
        "input_id": "user_id",
        "input_pw": "password",
        "btn_selector": ".btnLogin"
    },
    "investchosun": {
        "login_url": "https://www.investchosun.com/svc/member/invest_login.html",
        "ids": ["affini1"],
        "pws": ["affini12026"],
        "input_id": "username",
        "input_pw": "login_password",
        "btn_selector": "#SignIn"
    }
}

OUTPUT_DIR = f"paywalled_pdfs_{TODAY.strftime('%Y%m%d')}"
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# ────────────────────────────────────────────────
# WebDriver Setup
# ────────────────────────────────────────────────

def setup_driver():
    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    
    options = Options()
    if os.path.exists(chrome_path):
        options.binary_location = chrome_path
    
    # Basic options
    options.add_argument("--log-level=3")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-images")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    # Block permission popups and dialogs
    options.add_argument("--disable-notifications")
    options.add_argument("--disable-popup-blocking")
    
    # Block local network discovery (mDNS) - THIS IS THE KEY!
    options.add_argument("--disable-features=MediaRouter")
    options.add_argument("--disable-features=DialMediaRouteProvider")
    options.add_argument("--deny-permission-prompts")  # Automatically deny all permission prompts
    
    # Additional privacy/security blocks
    options.add_argument("--disable-web-security")
    options.add_argument("--disable-site-isolation-trials")
    
    options.add_experimental_option("excludeSwitches", ["enable-automation", "enable-logging"])
    options.add_experimental_option('useAutomationExtension', False)
    # options.add_argument("--headless=new") # Uncomment if you want headless
    
    # Print options
    settings = {
        "recentDestinations": [{
            "id": "Save as PDF",
            "origin": "local",
            "account": "",
        }],
        "selectedDestinationId": "Save as PDF",
        "version": 2
    }
    
    # Preferences to block all permission popups
    prefs = {
        'printing.print_preview_sticky_settings.appState': json.dumps(settings),
        'savefile.default_directory': os.path.abspath(OUTPUT_DIR),
        # Block permission requests
        'profile.default_content_setting_values': {
            'notifications': 2,  # 1=allow, 2=block
            'geolocation': 2,
            'media_stream': 2,
            'media_stream_mic': 2,
            'media_stream_camera': 2,
            'automatic_downloads': 2,
            'midi_sysex': 2,
            'push_messaging': 2,
            'ssl_cert_decisions': 2,
            'metro_switch_to_desktop': 2,
            'protected_media_identifier': 2,
            'app_banner': 2,
            'site_engagement': 2,
            'durable_storage': 2,
        },
        'profile.managed_default_content_settings': {
            'notifications': 2,
            'geolocation': 2,
        }
    }
    options.add_experimental_option('prefs', prefs)
    options.add_argument('--kiosk-printing')

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    # Stealth - prevent detection
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    # Set page load timeout
    driver.set_page_load_timeout(30)
    
    return driver

# ────────────────────────────────────────────────
# Crawlers
# ────────────────────────────────────────────────

class BaseCrawler:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(self.driver, 10)

    def login(self, site_key):
        creds = CREDENTIALS[site_key]
        logger.info(f"[{site_key}] Starting login process...")
        logger.debug(f"[{site_key}] Login URL: {creds['login_url']}")
        try:
            self.driver.get(creds["login_url"])
            time.sleep(2)
            logger.debug(f"[{site_key}] Login page loaded, current URL: {self.driver.current_url}")
            
            if site_key == "thebell":
                self.wait.until(EC.presence_of_element_located((By.ID, creds["input_id"]))).send_keys(creds["ids"][0])
                self.driver.find_element(By.ID, creds["input_pw"]).send_keys(creds["pws"][0])
                login_btn = self.driver.find_element(By.CSS_SELECTOR, creds["btn_selector"])
                self.driver.execute_script("arguments[0].click();", login_btn)
                
                
            elif site_key == "dealsiteplus":
                self.driver.find_element(By.ID, creds["input_id"]).send_keys(creds["ids"][0])
                self.driver.find_element(By.ID, creds["input_pw"]).send_keys(creds["pws"][0])
                # Usually enter works, or find submit button
                self.driver.find_element(By.ID, creds["input_pw"]).submit()
                
            elif site_key == "hankyung":
                self.driver.find_element(By.ID, creds["input_id"]).send_keys(creds["ids"][0])
                self.driver.find_element(By.ID, creds["input_pw"]).send_keys(creds["pws"][0])
                self.driver.find_element(By.CSS_SELECTOR, creds["btn_selector"]).click()
                
            elif site_key == "investchosun":
                # InvestChosun sometimes tricky with explicit waits
                self.wait.until(EC.element_to_be_clickable((By.ID, creds["input_id"]))).send_keys(creds["ids"][0])
                self.driver.find_element(By.ID, creds["input_pw"]).send_keys(creds["pws"][0])
                login_btn = self.driver.find_element(By.CSS_SELECTOR, creds["btn_selector"])
                self.driver.execute_script("arguments[0].click();", login_btn)

            time.sleep(3)
            
            # Handle any alerts that might appear
            try:
                alert = self.driver.switch_to.alert
                alert_text = alert.text
                logger.warning(f"[{site_key}] Alert detected: {alert_text}")
                alert.dismiss()  # or alert.accept() depending on what you want
                logger.info(f"[{site_key}] Alert dismissed")
            except:
                pass  # No alert present
            
            logger.info(f"[{site_key}] Login completed successfully")
            logger.debug(f"[{site_key}] Post-login URL: {self.driver.current_url}")
        except Exception as e:
            logger.error(f"[{site_key}] Login failed: {e}", exc_info=True)

class TheBellCrawler(BaseCrawler):
    def collect_links(self):
        logger.info(f"[TheBell] Starting link collection (Range: {START_DATE.date()} ~ {TODAY.date()})...")
        self.login("thebell")
        
        # Start URLs: Capital Market and M&A Insight search
        base_urls = [
            "https://www.thebell.co.kr/front/newslist.asp?code=0103", # Capital Market
            "https://www.thebell.co.kr/front/newslist.asp?code=0303" # M&A Insight
        ]
        target_links = []
        
        for base_url in base_urls:
            logger.info(f"[TheBell] Scanning Section: {base_url}")
            page = 1
            
            while True:
                url = f"{base_url}&page={page}"
                logger.info(f"[TheBell] Scanning Page {page}: {url}")
                self.driver.get(url)
                time.sleep(1.5)
                
                # Handle any alerts
                try:
                    alert = self.driver.switch_to.alert
                    alert_text = alert.text
                    logger.warning(f"[TheBell] Alert detected: {alert_text}")
                    alert.dismiss()
                    logger.info(f"[TheBell] Alert dismissed")
                    time.sleep(1)
                except:
                    pass  # No alert present
                
                # More robust selector for TheBell news list
                # Targeting div.listBox or div.articleBox (seen in some variants)
                page_articles = self.driver.find_elements(By.CSS_SELECTOR, "div.listBox li, div.articleBox li, div.newsList li")
                
                if not page_articles:
                    logger.warning(f"[TheBell] No articles found on page {page}. Stopping pagination.")
                    break
                    
                found_target = False
                found_older = False
                
                for item in page_articles:
                    try:
                        # 1. Capture Date
                        date_text = ""
                        # Try span.date or dd.userBox
                        try:
                            date_el = item.find_element(By.CSS_SELECTOR, "span.date, dd.userBox")
                            date_text = date_el.text.strip()
                        except:
                            # Search anywhere in item text for date pattern
                            m = re.search(r'\d{4}-\d{2}-\d{2}', item.text)
                            if m: date_text = m.group(0)
                        
                        if not date_text: continue

                        # Parse date (handle YYYY-MM-DD or full YYYY-MM-DD HH:MM:SS)
                        try:
                            clean_date = re.search(r'\d{4}-\d{2}-\d{2}', date_text).group(0)
                            article_date = datetime.strptime(clean_date, "%Y-%m-%d").date()
                        except:
                            continue
                            
                        # Check date range
                        if START_DATE.date() <= article_date <= TODAY.date():
                            # 2. Find Link and Title
                            link_el = None
                            try:
                                # Look for a.txtE or any anchor with significant text
                                link_el = item.find_element(By.CSS_SELECTOR, "a.txtE, dt a, a")
                            except: pass

                            if not link_el: continue

                            href = link_el.get_attribute("href")
                            
                            # CRITICAL: Exclude Code 00 and Search pages. 
                            # 'keyword=' was removed as it blocked legitimate keyword-themed articles.
                            if not href: continue
                            href_lower = href.lower()
                            if "code=00" in href_lower or "thebell+note" in href_lower or \
                               "search.asp" in href_lower or "keywordnews.asp" in href_lower or \
                               "newslistshort.asp" in href_lower:
                                continue
                                
                            # Take only the first line for the title (to avoid including descriptions)
                            title_raw = link_el.text.strip()
                            title = title_raw.split('\n')[0].strip()
                            
                            # '키워드' was removed from blacklist as it's often used in valid titles.
                            if len(title) < 5 or "검색결과" in title or "검색된" in title:
                                continue

                            # Fix relative links
                            if not href.startswith("http"):
                                 href = "https://www.thebell.co.kr" + (href if href.startswith("/") else "/front/" + href)
                                 
                            if not any(d['url'] == href for d in target_links):
                                target_links.append({"site": "TheBell", "title": title, "url": href, "date": clean_date})
                                logger.info(f"[TheBell] Found: {title} ({clean_date})")
                                found_target = True
                        elif article_date < START_DATE.date():
                            logger.debug(f"[TheBell] Older article found: {article_date}")
                            found_older = True
                    except Exception as e:
                        continue
                
                # Pagination logic
                if found_older:
                    logger.info(f"[TheBell] Reached articles older than target. Stopping pagination for this section.")
                    break
                
                if not found_target and page > 1: 
                    # If we found nothing targeted on page 2+, and didn't hit older, 
                    # it might mean gaps or we are just seeing unrelated stuff?
                    # But safer to rely on 'found_older' to stop.
                    pass

                page += 1
                if page > 10: # Safety break
                    logger.warning(f"[TheBell] Reached safety limit of 10 pages")
                    break
        
        logger.info(f"[TheBell] Collection complete. Found {len(target_links)} articles.")
        return target_links

class HankyungCrawler(BaseCrawler):
    def collect_links(self):
        logger.info(f"[Hankyung] Starting link collection for {YESTERDAY_STR}...")
        self.login("hankyung")
        
        target_links = []
        # Two sections to check
        urls = [
            "https://marketinsight.hankyung.com/investor/",
            "https://marketinsight.hankyung.com/mna"
        ]
        
        for section_url in urls:
            logger.info(f"[Hankyung] Scanning Section: {section_url}")
            self.driver.get(section_url)
            time.sleep(2)
            
            # Handle any alerts (e.g., app installation prompts)
            try:
                alert = self.driver.switch_to.alert
                alert_text = alert.text
                logger.warning(f"[Hankyung] Alert detected on section page: {alert_text}")
                alert.dismiss()
                logger.info(f"[Hankyung] Alert dismissed")
                time.sleep(1)
            except:
                pass  # No alert present
            
            # Try multiple selectors for article container
            articles = self.driver.find_elements(By.CSS_SELECTOR, "ul.list_news li")
            if not articles:
                 articles = self.driver.find_elements(By.CSS_SELECTOR, "li .txt-cont")
                 
            logger.debug(f"[Hankyung] Found {len(articles)} article elements in {section_url}")
            
            for art in articles:
                try:
                    # Try finding title with multiple selectors
                    title_el = None
                    try:
                        title_el = art.find_element(By.CSS_SELECTOR, "h3.news-tit a")
                    except:
                        try:
                            title_el = art.find_element(By.CSS_SELECTOR, "a.tit")
                        except:
                            pass
                            
                    if not title_el:
                         continue

                    href = title_el.get_attribute("href")
                    title = title_el.text.strip()
                    
                    # Date Check logic from User: "202601165722r" -> check "20260116"
                    # href example: https://marketinsight.hankyung.com/article/202601165722r
                    match = re.search(r'article/(\d{8})', href)
                    if match:
                        date_part = match.group(1) # 20260116
                        logger.debug(f"[Hankyung] Article date from URL: {date_part}, looking for: {YESTERDAY_STR_NODASH}")
                        if int(START_DATE.strftime("%Y%m%d")) <= int(date_part) <= int(TODAY.strftime("%Y%m%d")):
                            # Block irrelevant noise (appointments, general notices)
                            title_lower = title.lower()
                            if any(k in title_lower for k in ["인사", "취임", "부고", "게시판", "동정"]):
                                logger.debug(f"[Hankyung] Skipping irrelevant: {title}")
                                continue
                            
                            # Format date nicely
                            fmt_date = f"{date_part[:4]}-{date_part[4:6]}-{date_part[6:]}"
                            target_links.append({"site": "Hankyung", "title": title, "url": href, "date": fmt_date})
                            logger.info(f"[Hankyung] Found: {title} ({date_part})")
                        elif int(date_part) < int(START_DATE.strftime("%Y%m%d")):
                            logger.debug(f"[Hankyung] Article date {date_part} is older than window")
                        else:
                             logger.debug(f"[Hankyung] Article date {date_part} outside window")


                    else:
                        # Fallback to visual date if URL parsing fails
                        logger.debug(f"[Hankyung] No date pattern in URL: {href}, trying visual date")
                        try:
                            date_el = art.find_element(By.CSS_SELECTOR, "p.date")
                            is_in_range = False
                            for d in range(SEARCH_WINDOW_DAYS + 1):
                                check_date = TODAY - timedelta(days=d)
                                if check_date.strftime("%Y.%m.%d") in date_el.text:
                                    is_in_range = True
                                    break
                            
                            if is_in_range:
                                target_links.append({"site": "Hankyung", "title": title, "url": href})
                                logger.info(f"[Hankyung] Found (by text): {title}")
                        except Exception as date_e:
                            logger.debug(f"[Hankyung] Could not find visual date element: {date_e}")
                            pass
                            
                except Exception as e:
                    logger.error(f"[Hankyung] Error processing article: {e}", exc_info=True)
                    continue
        
        logger.info(f"[Hankyung] Collection complete. Found {len(target_links)} articles.")
        return target_links

class InvestChosunCrawler(BaseCrawler):
    def collect_links(self):
        logger.info(f"[InvestChosun] Starting link collection for {YESTERDAY_STR}...")
        self.login("investchosun")
        
        target_links = []
        # Strictly use CatID 12 (Deal) as requested
        url = "https://www.investchosun.com/svc/news/tlist.html?catid=12"
        logger.info(f"[InvestChosun] Navigating to: {url}")
        self.driver.get(url)
        time.sleep(2)
        
        articles = self.driver.find_elements(By.CSS_SELECTOR, "li")
        logger.debug(f"[InvestChosun] Found {len(articles)} li elements")
        
        for art in articles:
            try:
                # Find date span
                # User said: <span>2026.01.18</span>
                # date_el = art.find_element(By.CSS_SELECTOR, "dl dd.date span") 
                # (From news_run.py logic, it might be nested)
                try:
                    date_el = art.find_element(By.CSS_SELECTOR, ".date span")
                except:
                    continue

                date_text = date_el.text.strip()
                # Normalize InvestChosun date (YYYY.MM.DD HH:MM -> YYYY-MM-DD or YYYY.MM.DD)
                m = re.search(r'(\d{4})[.-](\d{2})[.-](\d{2})', date_text)
                if not m: continue
                
                clean_date = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
                article_date = datetime.strptime(clean_date, "%Y-%m-%d").date()

                if START_DATE.date() <= article_date <= TODAY.date():
                    # Get link
                    try:
                        title_el = art.find_element(By.CSS_SELECTOR, "dl dt a, a")
                        href = title_el.get_attribute("href")
                        # Use first line of text as title
                        title = title_el.text.strip().split('\n')[0].strip()
                        
                        if href and len(title) > 5:
                            if not href.startswith("http"):
                                href = "https://www.investchosun.com" + href
                            
                            if not any(d['url'] == href for d in target_links):
                                target_links.append({"site": "InvestChosun", "title": title, "url": href, "date": clean_date})
                                logger.info(f"[InvestChosun] Found: {title} ({clean_date})")
                    except: pass
                else:
                    logger.debug(f"[InvestChosun] Skipped date: {clean_date}")
            except Exception as e:
                logger.debug(f"[InvestChosun] Error processing article item: {e}")
                continue
        
        logger.info(f"[InvestChosun] Collection complete. Found {len(target_links)} articles.")
        return target_links

class DealSitePlusCrawler(BaseCrawler):
    def collect_links(self):
        logger.info(f"[DealSite+] Starting link collection for {YESTERDAY_STR}...")
        self.login("dealsiteplus")
        
        target_links = []
        processed_urls = set()  # Track duplicates across sections
        urls = [
            "https://dealsiteplus.co.kr/categories/002062",
            "https://dealsiteplus.co.kr/categories/016069"
        ]
        
        for section_url in urls:
            logger.info(f"[DealSite+] Scanning: {section_url}")
            self.driver.get(section_url)
            time.sleep(2)
            
            # Generic list item detection - adjusting based on common practices since DOM not fully known
            # Usually lists are in ul > li or div rows
            # Attempting to find date strings in text content of list items
            
            # Strategy: Find all 'a' tags, check if parent container has the date
            # Or finds elements containing the date text
            
            try:
                # Approximate structure of a news list
                # Try finding elements that contain the date string (e.g., '2026-01-17' or '2026.01.17')
                
                # DealSite often uses table or list
                # Let's try to find date elements specifically
                
                # Strategy: Find valid article rows or cards first
                # Common structures: tr, li, div.row, div.item
                # Then find date and link within
                
                possible_items = self.driver.find_elements(By.CSS_SELECTOR, "tr") + \
                                 self.driver.find_elements(By.CSS_SELECTOR, "li") + \
                                 self.driver.find_elements(By.CSS_SELECTOR, "div.article-item") # Hypothetical class

                # Specific strategy based on user-provided HTML structure
                items = self.driver.find_elements(By.CSS_SELECTOR, "div.mnm-news")
                logger.debug(f"[DealSite+] Found {len(items)} articles on page")
                
                for item in items:
                    try:
                        # 1. Find Date in .mnm-news-info
                        date_text = ""
                        try:
                            info_spans = item.find_elements(By.CSS_SELECTOR, ".mnm-news-info span")
                            for s in info_spans:
                                m = re.search(r'\d{4}[.-]\d{2}[.-]\d{2}', s.text)
                                if m:
                                    date_text = m.group(0).replace(".", "-") # Normalize to YYYY-MM-DD
                                    break
                        except: pass
                        
                        if not date_text: continue
                        
                        # Parse date for range check
                        article_date = datetime.strptime(date_text, "%Y-%m-%d").date()
                        
                        if START_DATE.date() <= article_date <= TODAY.date():
                            # 2. Find Link and Title in .ss-news-top-title
                            try:
                                link_el = item.find_element(By.CSS_SELECTOR, "a.ss-news-top-title")
                                href = link_el.get_attribute("href")
                                title = link_el.text.strip()
                                
                                # Handle relative URL
                                if href and not href.startswith("http"):
                                    href = "https://dealsiteplus.co.kr" + href
                                    
                                if href and href not in processed_urls:
                                    target_links.append({
                                        "site": "DealSitePlus", 
                                        "title": title, 
                                        "url": href, 
                                        "date": date_text
                                    })
                                    processed_urls.add(href)
                                    logger.info(f"[DealSite+] Found: {title} ({date_text})")
                            except: pass
                        elif article_date < START_DATE.date():
                            # Articles are sorted by newest, so we can probably stop if we hit old ones
                            # but DealSite might have mixed ordering, so we'll just continue
                            pass
                    except:
                        continue
            except Exception as e:
                logger.error(f"[DealSite+] Error scanning section: {e}", exc_info=True)
        
        logger.info(f"[DealSite+] Collection complete. Found {len(target_links)} articles.")
        return target_links


# ────────────────────────────────────────────────
# PDF Generation & Merging
# ────────────────────────────────────────────────

# ────────────────────────────────────────────────
# PDF Generation with Readability
# ────────────────────────────────────────────────

READABILITY_JS_URL = 'https://unpkg.com/@mozilla/readability@0.4.4/Readability.js'

def generate_pdf_for_link(driver, link_info, index, total):
    url = link_info["url"]
    site = link_info["site"]
    title = link_info["title"]
    
    logger.info(f"[PDF] [{index}/{total}] Processing: {title} ({site})")
    
    try:
        # 1. Nav to target or print view
        target_url = url
        if site == "TheBell" and "key=" in url:
            key = url.split("key=")[1].split("&")[0]
            target_url = f"https://www.thebell.co.kr/front/NewsPrint.asp?key={key}"
        elif site == "InvestChosun" and "contid=" in url:
            contid = url.split("contid=")[1].split("&")[0]
            target_url = f"https://www.investchosun.com/svc/news/article_print.html?contid={contid}"
        elif site == "DealSitePlus" and "/articles/" in url:
            article_id = url.split("/articles/")[1].split("/")[0]
            target_url = f"https://dealsiteplus.co.kr/articles/print/{article_id}"
        elif site == "Hankyung" and "/article/" in url:
            target_url = url.replace("/article/", "/print/")

        driver.get(target_url)
        time.sleep(3)
        
        # Inject Readability
        driver.execute_script(f"var s=document.createElement('script');s.src='{READABILITY_JS_URL}';document.head.appendChild(s);")
        time.sleep(2)
        
        article_data = driver.execute_script("try{return new Readability(document.cloneNode(true)).parse();}catch(e){return null;}")
        
        if not article_data:
            logger.warning(f"[PDF] Readability failed for {url}")
            return None

        content = article_data.get('content', '')
        e_title = title.replace('\n', ' ')
        # Remove unwanted headings from top of content
        content = re.sub(r'^\s*<h[1-6][^>]*>.*?</h[1-6]>\s*', '', content, flags=re.DOTALL)
        
        # Clean CSS to match other sites and remove unwanted bullets/indents
        final_html = f"""
        <!DOCTYPE html><html><head><meta charset="utf-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
            body {{ font-family: 'Noto Sans KR', sans-serif; line-height: 1.8; padding: 50px; color: #111; font-size: 17px; }}
            .h {{ border-bottom: 3px solid #3366cc; margin-bottom: 30px; padding-bottom: 15px; }}
            .t {{ font-size: 30px; font-weight: 700; margin-bottom: 12px; line-height: 1.3; }}
            .m {{ font-size: 14px; color: #555; }}
            .c img {{ max-width: 100%; height: auto; display: block; margin: 25px auto; border-radius: 4px; }}
            .c p {{ margin-bottom: 18px; text-align: justify; }}
            /* InvestChosun fix: remove potential list indent for main body if it was extracted as a list box */
            .c ul, .c li {{ list-style-type: none; margin-left: 0; padding-left: 0; }}
        </style>
        </head><body>
        <div class="h"><div class="t">{e_title}</div>
        <div class="m"><strong>{site}</strong> | {link_info.get('date','')} | {url}</div></div>
        <div class="c">{content}</div></body></html>
        """
        driver.execute_script("document.open(); document.write(arguments[0]); document.close();", final_html)
        time.sleep(1)
        
        pdf_data = driver.execute_cdp_cmd("Page.printToPDF", {"printBackground": True, "preferCSSPageSize": True})
        filename = f"{OUTPUT_DIR}/{index}_{site}.pdf"
        with open(filename, "wb") as f: f.write(base64.b64decode(pdf_data['data']))
        return filename
    except Exception as e:
        logger.error(f"[PDF] Failed for {url}: {e}")
        return None


def merge_pdfs(pdf_list):
    if not pdf_list:
        logger.warning("No PDFs to merge.")
        return

    merger = PdfMerger()
    count = 0
    for pdf in pdf_list:
        if pdf and os.path.exists(pdf):
            try:
                merger.append(pdf)
                count += 1
            except Exception as e:
                logger.error(f"Skipping corrupt PDF {pdf}: {e}")
    
    if count > 0:
        output_name = f"Daily_News_{YESTERDAY_STR_NODASH}.pdf"
        merger.write(output_name)
        merger.close()
        logger.info(f"Created merged PDF: {output_name} ({count} articles)")
        return output_name  # Return filename for upload
    else:
        logger.warning("No valid PDFs merged.")
        return None

# ────────────────────────────────────────────────
# Google Drive Upload & Slack Notification
# ────────────────────────────────────────────────

def upload_to_google_drive(pdf_path):
    """
    Upload PDF to Google Drive and return shareable link.
    Requires: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
    
    Setup:
    1. Go to https://console.cloud.google.com/
    2. Create project and enable Google Drive API
    3. Create OAuth 2.0 credentials (Desktop app)
    4. Download credentials.json to script directory
    5. First run will open browser for authorization
    """
    try:
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload
        import pickle
        
        SCOPES = ['https://www.googleapis.com/auth/drive.file']
        creds = None
        
        # Token file stores user's access and refresh tokens
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token:
                creds = pickle.load(token)
        
        # If no valid credentials, let user log in
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists('credentials.json'):
                    logger.error("credentials.json not found. Please set up Google Drive API credentials.")
                    return None
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Save credentials for next run
            with open('token.pickle', 'wb') as token:
                pickle.dump(creds, token)
        
        # Upload file
        service = build('drive', 'v3', credentials=creds)
        file_metadata = {'name': os.path.basename(pdf_path)}
        media = MediaFileUpload(pdf_path, mimetype='application/pdf')
        
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, webViewLink'
        ).execute()
        
        # Make file publicly accessible (anyone with link can view)
        service.permissions().create(
            fileId=file['id'],
            body={'type': 'anyone', 'role': 'reader'}
        ).execute()
        
        logger.info(f"Uploaded to Google Drive: {file.get('webViewLink')}")
        return file.get('webViewLink')
        
    except ImportError:
        logger.error("Google Drive libraries not installed. Run: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")
        return None
    except Exception as e:
        logger.error(f"Failed to upload to Google Drive: {e}", exc_info=True)
        return None

def get_google_services():
    """Returns (drive_service, sheets_service) using the same credentials."""
    try:
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request
        from googleapiclient.discovery import build
        import pickle
        
        SCOPES = [
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/spreadsheets'
        ]
        creds = None
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token:
                creds = pickle.load(token)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists('credentials.json'):
                    return None, None
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            with open('token.pickle', 'wb') as token:
                pickle.dump(creds, token)
        
        drive = build('drive', 'v3', credentials=creds)
        sheets = build('sheets', 'v4', credentials=creds)
        return drive, sheets
    except:
        return None, None

def clean_old_history(sheets_service, sheet_id):
    """Deletes rows older than HISTORY_DAYS."""
    if not sheets_service or sheet_id is None: return
    try:
        # Quote sheet name if it contains spaces
        range_name = f"'{HISTORY_SHEET_NAME}'!A:A"
        result = sheets_service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID, range=range_name
        ).execute()
        rows = result.get('values', [])
        if len(rows) <= 1: return
        
        cutoff = (datetime.now() - timedelta(days=HISTORY_DAYS)).date()
        rows_to_delete = []
        for i, row in enumerate(rows[1:], start=2):
            try:
                dt = datetime.strptime(row[0], "%Y-%m-%d").date()
                if dt < cutoff: rows_to_delete.append(i)
            except: continue
        
        if rows_to_delete:
            # Delete in reverse to keep indices valid
            requests = []
            for row_idx in sorted(rows_to_delete, reverse=True):
                requests.append({'deleteDimension': {'range': {
                    'sheetId': sheet_id, 'dimension': 'ROWS', 'startIndex': row_idx-1, 'endIndex': row_idx
                }}})
            
            if requests:
                sheets_service.spreadsheets().batchUpdate(
                    spreadsheetId=SPREADSHEET_ID,
                    body={'requests': requests}
                ).execute()
                logger.info(f"Old history cleanup complete: {len(rows_to_delete)} rows deleted.")
    except Exception as e:
        logger.debug(f"History cleanup failed (skipped): {e}")

def ensure_history_sheet_exists(sheets_service):
    """Ensures the history sheet exists and returns its sheetId."""
    try:
        spreadsheet = sheets_service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
        for s in spreadsheet.get('sheets', []):
            if s['properties']['title'] == HISTORY_SHEET_NAME:
                return s['properties']['sheetId']
        
        # Create it if not found
        res = sheets_service.spreadsheets().batchUpdate(
            spreadsheetId=SPREADSHEET_ID,
            body={'requests': [{'addSheet': {'properties': {'title': HISTORY_SHEET_NAME}}}]}
        ).execute()
        sheet_id = res['replies'][0]['addSheet']['properties']['sheetId']
        
        sheets_service.spreadsheets().values().append(
            spreadsheetId=SPREADSHEET_ID, range=f"'{HISTORY_SHEET_NAME}'!A1",
            valueInputOption="RAW", body={'values': [['CrawledDate', 'Site', 'Date', 'Title', 'URL']]}
        ).execute()
        return sheet_id
    except Exception as e:
        logger.error(f"Failed to ensure history sheet exists: {e}")
        return None

def filter_by_sheet_history(all_links, sheets_service):
    """Filters out links already present in GSheets history with title normalization."""
    if not sheets_service: return all_links
    try:
        sheet_id = ensure_history_sheet_exists(sheets_service)
        if sheet_id is None:
            logger.warning("History sheet could not be found or created. Proceeding without history filtering.")
            return all_links

        # Save sheet_id for later use in cleanup
        globals()['CURRENT_SHEET_ID'] = sheet_id

        # Read history
        range_name = f"'{HISTORY_SHEET_NAME}'!B:E"
        result = sheets_service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID, range=range_name
        ).execute()
        rows = result.get('values', [])
        
        history_urls = set()
        history_titles = {} # site -> set of normalized titles
        

        def normalize_url(u):
            if not u: return ""
            # Preserve 'key' for TheBell
            if "thebell.co.kr" in u and "key=" in u:
                base = u.split('?')[0]
                key_match = re.search(r'key=([^&#]+)', u)
                if key_match: return f"{base}?key={key_match.group(1)}".strip().rstrip('/')
            
            # Default: strip query params for others (standard)
            return u.split('?')[0].split('#')[0].strip().rstrip('/')

        for row in rows[1:]: # Skip header
            if len(row) >= 4:
                h_site = row[0].strip()
                h_title = row[2].strip()
                h_url = row[3].strip()
                
                history_urls.add(normalize_url(h_url))
                if h_site not in history_titles: history_titles[h_site] = set()
                history_titles[h_site].add(normalize(h_title))

        logger.info(f"[History] Loaded {len(history_urls)} URLs and {sum(len(v) for v in history_titles.values())} titles from history.")

        unique = []
        for link in all_links:
            norm_url = normalize_url(link['url'])
            norm_title = normalize(link['title'])
            site = link['site']
            
            is_url_dup = norm_url in history_urls
            is_title_dup = (site in history_titles and norm_title in history_titles[site])
            
            if not is_url_dup and not is_title_dup:
                unique.append(link)
            else:
                reason = "URL" if is_url_dup else "Title"
                logger.info(f"[History] Skipping Duplicate ({reason}): {link['title']} [{site}]")
        
        return unique
    except Exception as e:
        logger.error(f"GSheets History check failed: {e}", exc_info=True)
        return all_links

def update_sheet_history(new_links, sheets_service):
    """Appends new articles to GSheets."""
    if not sheets_service or not new_links: return
    try:
        # Ensure sheet exists even if filtering was skipped
        sheet_id = ensure_history_sheet_exists(sheets_service)
        
        values = [[TODAY.strftime("%Y-%m-%d"), l['site'], l['date'], l['title'], l['url']] for l in new_links]
        sheets_service.spreadsheets().values().append(
            spreadsheetId=SPREADSHEET_ID, range=f"'{HISTORY_SHEET_NAME}'!A1",
            valueInputOption="RAW", body={'values': values}
        ).execute()
        
        logger.info(f"[History] Updated sheet with {len(new_links)} new articles.")
        
        if sheet_id is not None:
            clean_old_history(sheets_service, sheet_id)
    except Exception as e:
        logger.error(f"Failed to update GSheets history: {e}")

def send_slack_notification(webhook_url, site_pdfs, all_links, date_str):
    """Notification with per-site PDF links."""
    try:
        import requests
        if not webhook_url or "YOUR_SLACK_WEBHOOK" in webhook_url: return False
        
        # Site mappings: internal name (from crawler) -> Slack display name
        site_map = {
            "Hankyung": "MarketInsight",
            "TheBell": "TheBell",
            "DealSitePlus": "DealSitePlus",
            "InvestChosun": "InvestChosun"
        }
        
        # Group collected articles by their internal site name
        grouped = {site: [] for site in site_map.keys()}
        for link in all_links:
            site = link.get('site')
            if site in grouped:
                grouped[site].append(link.get('title'))

        # Construct dynamic date range for header: (Yesterday - Today)
        start_date_str = (TODAY - timedelta(days=1)).strftime("%m/%d")
        end_date_str = TODAY.strftime("%m/%d")
        header_text = f"Daily PE & M&A Paywalled News ({start_date_str} - {end_date_str})"

        blocks = [{
            "type": "header",
            "text": {"type": "plain_text", "text": header_text}
        }]

        # Iterate through all defined sites to handle 'No articles' case
        for internal_site, display_name in site_map.items():
            titles = grouped.get(internal_site, [])
            pdf_link = site_pdfs.get(internal_site, "")
            
            # [SiteName] PDF 보기 링크 - Concise format as requested
            pdf_text = f" - <{pdf_link}|PDF 보기 링크>" if pdf_link else ""
            
            if not titles:
                article_content = "> 기사 없음"
            else:
                article_content = "\n".join([f"• {t}" for t in titles])
            
            blocks.append({
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"*<{display_name}>*{pdf_text}\n{article_content}"}
            })
            
        requests.post(webhook_url, json={"text": f"News Summary {date_str}", "blocks": blocks}, timeout=10)
    except Exception as e:
        logger.error(f"Slack notify error: {e}")

def forward_logs_to_slack(webhook_url):
    """Sends current execution logs to Slack."""
    try:
        import requests
        summary = slack_handler.get_summary()
        if summary:
            requests.post(webhook_url, json={"text": f"📋 *Execution Log Summary*\n```\n{summary[-3000:]}\n```"}, timeout=10)
    except: pass


# ────────────────────────────────────────────────
# Main Execution
# ────────────────────────────────────────────────

def main():
    logger.info("="*60)
    logger.info("Starting Paywalled PDF Generator")
    logger.info("="*60)
    
    driver = setup_driver()
    all_links = []
    
    try:
        # 1. Collect Links
        logger.info("\n" + "─"*60)
        logger.info("PHASE 1: Collecting Links from All Sites")
        logger.info("─"*60)
        
        # Hankyung
        try:
            hk = HankyungCrawler(driver)
            hk_links = hk.collect_links()
            all_links.extend(hk_links)
        except Exception as e: 
            logger.error(f"Error in Hankyung crawler: {e}", exc_info=True)
        
        # TheBell
        try:
            tb = TheBellCrawler(driver)
            tb_links = tb.collect_links()
            all_links.extend(tb_links)
        except Exception as e: 
            logger.error(f"Error in TheBell crawler: {e}", exc_info=True)
        
        # DealSitePlus
        try:
            dsp = DealSitePlusCrawler(driver)
            dsp_links = dsp.collect_links()
            all_links.extend(dsp_links)
        except Exception as e: 
            logger.error(f"Error in DealSite+ crawler: {e}", exc_info=True)
        
        # InvestChosun
        try:
            ic = InvestChosunCrawler(driver)
            ic_links = ic.collect_links()
            all_links.extend(ic_links)
        except Exception as e: 
            logger.error(f"Error in InvestChosun crawler: {e}", exc_info=True)
            
        # 1.5 Deduplicate Links & Cross-check with GSheets History
        drive_svc, sheet_svc = get_google_services()
        
        def normalize_url(u):
            if not u: return ""
            if "thebell.co.kr" in u and "key=" in u:
                base = u.split('?')[0]
                key_match = re.search(r'key=([^&#]+)', u)
                if key_match: return f"{base}?key={key_match.group(1)}".strip().rstrip('/')
            return u.split('?')[0].split('#')[0].strip().rstrip('/')

        seen_normalized_urls = set()
        seen_site_titles = set()
        unique_links = []
        for link in all_links:
            u = normalize_url(link['url'])
            u = u.replace("dealsite.co.kr", "dealsiteplus.co.kr").replace("http://", "https://")
            site_title_key = (link['site'], normalize(link['title']))
            if u not in seen_normalized_urls and site_title_key not in seen_site_titles:
                unique_links.append(link)
                seen_normalized_urls.add(u)
                seen_site_titles.add(site_title_key)
        
        all_links = filter_by_sheet_history(unique_links, sheet_svc)
        logger.info(f"PHASE 1.5: GSheets Deduplication complete. Articles to process: {len(all_links)}")

        site_links = {}
        if all_links:
            # 2. Generate PDFs by site
            logger.info("PHASE 2: Generating PDFs")
            site_generated_pdfs = {} # site -> [pdf_paths]
            for i, link in enumerate(all_links):
                site = link['site']
                pdf_path = generate_pdf_for_link(driver, link, i+1, len(all_links))
                if pdf_path:
                    if site not in site_generated_pdfs: site_generated_pdfs[site] = []
                    site_generated_pdfs[site].append(pdf_path)
            
            # 3. Merge and Upload by Site
            logger.info("PHASE 3: Uploading Site PDFs")
            for site, pdfs in site_generated_pdfs.items():
                # Create shared merger function or just manual write for the site
                merger = PdfMerger()
                for p in pdfs: merger.append(p)
                out_name = f"{site}_{YESTERDAY_STR_NODASH}.pdf"
                merger.write(out_name)
                merger.close()
                
                drive_link = upload_to_google_drive(out_name)
                if drive_link: site_links[site] = drive_link
        else:
            logger.info("No new unique articles found.")

        # 4. History Update & Slack Notification
        update_sheet_history(all_links, sheet_svc)
        send_slack_notification(SLACK_WEBHOOK_URL, site_links, all_links, YESTERDAY_STR)
        
    except Exception as e:
        logger.error(f"CRITICAL ERROR in main process: {e}", exc_info=True)
        
    finally:
        # 5. Log Forwarding (Always try to send logs)
        forward_logs_to_slack(LOG_SLACK_WEBHOOK_URL)
        
        logger.info("\n" + "="*60)
        logger.info("Paywalled PDF Generator Complete")
        logger.info("="*60)
        driver.quit()
        # Cleanup temp dir? User might want to keep individual files.
        # shutil.rmtree(OUTPUT_DIR) 

if __name__ == "__main__":
    main()
