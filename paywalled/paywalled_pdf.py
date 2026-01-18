
import os
import time
import json
import base64
import random
import urllib.parse
import re
import shutil
import logging
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
        logging.FileHandler(f'paywalled_scraper_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Calculate "Yesterday" based on current system time
TODAY = datetime.now()
YESTERDAY = TODAY - timedelta(days=1)
YESTERDAY_STR = YESTERDAY.strftime("%Y-%m-%d")        # 2026-01-17
YESTERDAY_STR_DOT = YESTERDAY.strftime("%Y.%m.%d")    # 2026.01.17
YESTERDAY_STR_NODASH = YESTERDAY.strftime("%Y%m%d")   # 20260117

logger.info(f"Today is {TODAY.strftime('%Y-%m-%d')}, Target Yesterday is {YESTERDAY_STR}")

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
        "btn_id": "btn1"
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
    
    # Block permission popups
    options.add_argument("--disable-notifications")
    options.add_argument("--disable-popup-blocking")
    
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
                self.driver.find_element(By.ID, creds["input_id"]).send_keys(creds["ids"][0])
                self.driver.find_element(By.ID, creds["input_pw"]).send_keys(creds["pws"][0])
                self.driver.find_element(By.ID, creds["btn_id"]).click()
                
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
        logger.info(f"[TheBell] Starting link collection for {YESTERDAY_STR}...")
        self.login("thebell")
        
        # Start URL
        base_url = "https://www.thebell.co.kr/front/newslist.asp?code=0103"
        target_links = []
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
            
            # Check for articles
            articles = self.driver.find_elements(By.CSS_SELECTOR, "div.listBox .listBox") # Verify selector based on user info or standard TheBell
            # Use user provided selector logic: "ul > li" and "dt > a.txtE" from news_run.py
            page_articles = self.driver.find_elements(By.CSS_SELECTOR, "ul > li") # Main list
            
            logger.debug(f"[TheBell] Found {len(page_articles)} article elements on page {page}")
            if not page_articles:
                logger.warning(f"[TheBell] No articles found on page {page}. Stopping pagination.")
                break
                
            found_yesterday = False
            found_older = False
            
            for item in page_articles:
                try:
                    date_span = item.find_element(By.CSS_SELECTOR, "dd.userBox span.date")
                    date_text = date_span.text.strip() # 2026-01-16 15:50:06
                    
                    # Parse date
                    try:
                        article_date = datetime.strptime(date_text, "%Y-%m-%d %H:%M:%S")
                    except:
                        continue
                        
                    # Check date
                    if article_date.date() == YESTERDAY.date():
                        link_el = item.find_element(By.CSS_SELECTOR, "dt > a.txtE")
                        href = link_el.get_attribute("href")
                        # Fix relative links
                        if href and not href.startswith("http"):
                             href = "https://www.thebell.co.kr/front/" + href
                             
                        title = link_el.text.strip()
                        target_links.append({"site": "TheBell", "title": title, "url": href, "date": date_text})
                        logger.info(f"[TheBell] ✓ Found: {title}")
                        found_yesterday = True
                    elif article_date.date() < YESTERDAY.date():
                        found_older = True
                except NoSuchElementException as e:
                    logger.debug(f"[TheBell] Element not found in article item: {e}")
                    continue
                except Exception as e:
                    logger.error(f"[TheBell] Error processing article: {e}", exc_info=True)
                    continue
            
            # Pagination logic
            if found_older:
                logger.info(f"[TheBell] Reached articles older than yesterday. Stopping pagination.")
                break
            
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
            
            articles = self.driver.find_elements(By.CSS_SELECTOR, "li .txt-cont")
            logger.debug(f"[Hankyung] Found {len(articles)} article elements in {section_url}")
            
            for art in articles:
                try:
                    title_el = art.find_element(By.CSS_SELECTOR, "h3.news-tit a")
                    href = title_el.get_attribute("href")
                    title = title_el.text.strip()
                    
                    # Date Check logic from User: "202601165722r" -> check "20260116"
                    # href example: https://marketinsight.hankyung.com/article/202601165722r
                    match = re.search(r'article/(\d{8})', href)
                    if match:
                        date_part = match.group(1) # 20260116
                        logger.debug(f"[Hankyung] Article date from URL: {date_part}, looking for: {YESTERDAY_STR_NODASH}")
                        if date_part == YESTERDAY_STR_NODASH:
                            target_links.append({"site": "Hankyung", "title": title, "url": href})
                            logger.info(f"[Hankyung] ✓ Found: {title}")
                    else:
                        # Fallback to visual date if URL parsing fails
                        logger.debug(f"[Hankyung] No date pattern in URL: {href}, trying visual date")
                        try:
                            date_el = art.find_element(By.CSS_SELECTOR, "p.date")
                            if YESTERDAY.strftime("%Y.%m.%d") in date_el.text:
                                target_links.append({"site": "Hankyung", "title": title, "url": href})
                                logger.info(f"[Hankyung] ✓ Found (by text): {title}")
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
        url = "https://www.investchosun.com/svc/news/tlist.html?catid=1"
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
                if "|" in date_text: 
                    date_text = date_text.split("|")[0].strip()
                
                logger.debug(f"[InvestChosun] Article date: '{date_text}', looking for: '{YESTERDAY_STR_DOT}'")
                if date_text == YESTERDAY_STR_DOT:
                    # Get link
                    title_el = art.find_element(By.CSS_SELECTOR, "dl dt a")
                    href = title_el.get_attribute("href")
                    title = title_el.text.strip()
                    
                    if href and not href.startswith("http"):
                        href = "https://www.investchosun.com" + href
                        
                    target_links.append({"site": "InvestChosun", "title": title, "url": href})
                    logger.info(f"[InvestChosun] ✓ Found: {title}")
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
                xpath_query = f"//*[contains(text(), '{YESTERDAY_STR}')] | //*[contains(text(), '{YESTERDAY_STR_DOT}')]"
                date_elements = self.driver.find_elements(By.XPATH, xpath_query)
                logger.debug(f"[DealSite+] Found {len(date_elements)} elements containing target date")
                
                processed_urls = set()
                
                for el in date_elements:
                    try:
                        # Find closest 'a' tag (article link)
                        # Go up to a container (li or tr) then down to 'a'
                        # Or check if parent is 'a'
                        
                        article_link = None
                        
                        # Check strict ancestry
                        parent = el
                        for _ in range(5):
                            parent = parent.find_element(By.XPATH, "..")
                            try:
                                links = parent.find_elements(By.TAG_NAME, "a")
                                # Filter valid article links (usually have longer hrefs or titles)
                                for l in links:
                                    h = l.get_attribute("href")
                                    t = l.text.strip()
                                    if h and "articles" in h and len(t) > 5:
                                        article_link = l
                                        break
                                if article_link: break
                            except: pass
                        
                        if article_link:
                            href = article_link.get_attribute("href")
                            title = article_link.text.strip()
                            
                            if href not in processed_urls:
                                target_links.append({"site": "DealSitePlus", "title": title, "url": href})
                                processed_urls.add(href)
                                logger.info(f"[DealSite+] ✓ Found: {title}")
                                
                    except Exception as inner_e:
                        continue
                        
            except Exception as e:
                logger.error(f"[DealSite+] Error scanning section: {e}", exc_info=True)
        
        logger.info(f"[DealSite+] Collection complete. Found {len(target_links)} articles.")
        return target_links

# ────────────────────────────────────────────────
# PDF Generation & Merging
# ────────────────────────────────────────────────

def generate_pdf_for_link(driver, link_info, index, total):
    url = link_info["url"]
    site = link_info["site"]
    title = link_info["title"]
    
    logger.info(f"[PDF] [{index}/{total}] Processing: {title} ({site})")
    
    try:
        # Pre-process URL for print view if applicable
        target_url = url
        if site == "TheBell":
            # Convert to print view: https://www.thebell.co.kr/front/NewsPrint.asp?key=...
            if "key=" in url:
                key = url.split("key=")[1].split("&")[0]
                target_url = f"https://www.thebell.co.kr/front/NewsPrint.asp?key={key}"
        elif site == "InvestChosun":
            # Convert to: https://www.investchosun.com/svc/news/article_print.html?contid=...
            # Original: https://www.investchosun.com/svc/news/tlist.html?catid=1...
            # Need to get article ID. Usually /news/article.html?contid=...
            # If default link is article view, replace with print view
            if "contid=" in url:
                contid = url.split("contid=")[1].split("&")[0]
                target_url = f"https://www.investchosun.com/svc/news/article_print.html?contid={contid}"
        elif site == "Hankyung":
             # Original: https://marketinsight.hankyung.com/article/2026...
             # Print: https://marketinsight.hankyung.com/print/2026...
             if "/article/" in url:
                 target_url = url.replace("/article/", "/print/")
        
        # Navigate
        logger.debug(f"[PDF] Navigating to: {target_url}")
        driver.get(target_url)
        time.sleep(3) # Wait for render
        
        # Inject CSS for better PDF
        # Note: PyPDF2 / Chrome Print might cut off text if not styled right
        style_js = """
            var style = document.createElement('style');
            style.innerHTML = `
                @media print { 
                    body { -webkit-print-color-adjust: exact; } 
                    header, footer, .ads, .navigation, .cookie-banner { display: none !important; }
                }
            `;
            document.head.appendChild(style);
        """
        driver.execute_script(style_js)
        
        # Print
        pdf_data = driver.execute_cdp_cmd("Page.printToPDF", {
            "printBackground": True,
            "paperWidth": 8.27, # A4
            "paperHeight": 11.69,
            "marginTop": 0.5,
            "marginBottom": 0.5,
            "marginLeft": 0.5,
            "marginRight": 0.5
        })
        
        filename = f"{OUTPUT_DIR}/{index}_{site}.pdf"
        with open(filename, "wb") as f:
            f.write(base64.b64decode(pdf_data['data']))
        
        logger.info(f"[PDF] ✓ Generated: {filename}")
        return filename
    except Exception as e:
        logger.error(f"[PDF] Failed to generate PDF for {url}: {e}", exc_info=True)
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
        logger.info(f"✓ Created merged PDF: {output_name} ({count} articles)")
    else:
        logger.warning("No valid PDFs merged.")

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
        
        logger.info("\n" + "="*60)
        logger.info(f"TOTAL LINKS COLLECTED: {len(all_links)}")
        logger.info("="*60)
        
        # 2. Generate PDFs
        logger.info("\n" + "─"*60)
        logger.info("PHASE 2: Generating PDFs")
        logger.info("─"*60)
        generated_pdfs = []
        for i, link in enumerate(all_links):
            # Re-login if needed (sessions might timeout or context switch)
            # Optimization: Group by site and login once per site block?
            # For simplicity, we just rely on cookies persisting or handle login inside if needed.
            # But since we switch domains, we just navigate. 
            # Note: DealSite/others might require active login.
            # We already logged in during collection. 
            # If session expires, we might need robust retry. 
            # For now, assume session persists during this run.
            
            pdf_path = generate_pdf_for_link(driver, link, i+1, len(all_links))
            if pdf_path:
                generated_pdfs.append(pdf_path)
        
        # 3. Merge
        logger.info("\n" + "─"*60)
        logger.info("PHASE 3: Merging PDFs")
        logger.info("─"*60)
        merge_pdfs(generated_pdfs)
        
    finally:
        logger.info("\n" + "="*60)
        logger.info("Paywalled PDF Generator Complete")
        logger.info("="*60)
        driver.quit()
        # Cleanup temp dir? User might want to keep individual files.
        # shutil.rmtree(OUTPUT_DIR) 

if __name__ == "__main__":
    main()
