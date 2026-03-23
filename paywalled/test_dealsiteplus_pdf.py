"""
Test script: DealSitePlus PDF generation - NO re-login
Tests both print URL and direct URL approaches
"""
import os
import sys
import time
import json
import base64
import re
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_result.log")

def log(msg):
    line = f"[{datetime.now().strftime('%H:%M:%S')}] {msg}"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")

# Clear log file
with open(LOG_FILE, "w", encoding="utf-8") as f:
    f.write("")

CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")
with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    config_data = json.load(f)

CREDENTIALS = config_data.get("CREDENTIALS", {})
READABILITY_JS_URL = 'https://unpkg.com/@mozilla/readability@0.4.4/Readability.js'

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_dealsiteplus_pdfs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def setup_driver():
    options = Options()
    chrome_paths = [
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
        "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    ]
    for cp in chrome_paths:
        if os.path.exists(cp):
            options.binary_location = cp
            break
    options.add_argument("--log-level=3")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-notifications")
    options.add_argument("--disable-popup-blocking")
    options.add_argument("--disable-features=MediaRouter")
    options.add_argument("--deny-permission-prompts")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    options.add_experimental_option("excludeSwitches", ["enable-automation", "enable-logging"])
    options.add_experimental_option('useAutomationExtension', False)
    settings = {
        "recentDestinations": [{"id": "Save as PDF", "origin": "local", "account": ""}],
        "selectedDestinationId": "Save as PDF", "version": 2
    }
    prefs = {
        'printing.print_preview_sticky_settings.appState': json.dumps(settings),
        'savefile.default_directory': os.path.abspath(OUTPUT_DIR),
        'profile.default_content_setting_values': {'notifications': 2},
    }
    options.add_experimental_option('prefs', prefs)
    options.add_argument('--kiosk-printing')
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    driver.set_page_load_timeout(30)
    return driver


def generate_pdf(driver, target_url, title, site, article_url, output_name):
    """Attempt to generate PDF from a given URL. Returns (success, file_size)."""
    log(f"  Navigating to: {target_url}")
    try:
        driver.get(target_url)
    except TimeoutException:
        log(f"  WARN: Timeout loading page")
        driver.execute_script("window.stop();")
    
    driver.execute_script("window.print = function() { console.log('print blocked'); };")
    time.sleep(3)
    
    # Check what we got
    page_text = driver.find_element(By.TAG_NAME, "body").text
    has_paywall = "유료회원전용" in page_text or "유료서비스" in page_text
    is_404 = "찾을 수 없" in page_text or "404" in page_text or len(page_text.strip()) < 50
    log(f"  Page text length: {len(page_text)}")
    log(f"  Paywall visible: {has_paywall}")
    log(f"  Is 404/empty: {is_404}")
    log(f"  Body preview: {page_text[:200]}")
    
    if is_404:
        log(f"  SKIP: Page is 404 or empty")
        return False, 0
    
    # DOM cleanup
    driver.execute_script("""
        var selectors = [
            '.ranking', '.ad_article_bottom', '.ad_article_bottom1',
            '.header_area_01', '.article_sns', '.article_font',
            '.article_print', '.btn_move.icon_top', '.article_tag_area',
            'header', 'footer', 'nav', '.sidebar', '.aside',
            '.related_news', '.most_viewed', '.popular',
            '[class*="banner"]', '[class*="ad_"]', '[class*="popup"]'
        ];
        selectors.forEach(function(sel) {
            document.querySelectorAll(sel).forEach(function(el) { el.remove(); });
        });
    """)
    
    if site == "DealSitePlus":
        driver.execute_script("""
            var paywallSelectors = [
                '.article-paywall', '.paywall', '.login-overlay',
                '[class*="paywall"]', '[class*="login-form"]',
                '.article-locked', '.premium-wall',
                '.aside-right', '.right-sidebar', '[class*="sidebar"]',
                '.most-read', '[class*="popular"]', '[class*="ranking"]',
                '.share-buttons', '.social-share', '[class*="share"]',
                '.tag-area', '.related', '[class*="related"]'
            ];
            paywallSelectors.forEach(function(sel) {
                document.querySelectorAll(sel).forEach(function(el) { el.remove(); });
            });
            var articleBody = document.querySelector('.article-body, .article-content, .news-content, .view-content');
            if (articleBody) {
                articleBody.style.maxHeight = 'none';
                articleBody.style.overflow = 'visible';
            }
            document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]').forEach(function(el) {
                if (el.tagName !== 'HEADER' && el.tagName !== 'NAV') el.remove();
            });
        """)
    
    # Inject Readability
    driver.execute_script(f"var s=document.createElement('script');s.src='{READABILITY_JS_URL}';document.head.appendChild(s);")
    time.sleep(2)
    
    article_data = driver.execute_script("try{return new Readability(document.cloneNode(true)).parse();}catch(e){return null;}")
    
    if not article_data:
        log(f"  FAIL: Readability returned null")
        return False, 0
    
    content = article_data.get('content', '')
    text_content = article_data.get('textContent', '')
    log(f"  Readability OK: content={len(content)} chars, text={len(text_content)} chars")
    log(f"  Text preview: {text_content[:200] if text_content else 'EMPTY'}")
    
    # Build HTML
    content = re.sub(r'^\s*<h[1-6][^>]*>.*?</h[1-6]>\s*', '', content, flags=re.DOTALL)
    e_title = title.replace('\n', ' ')
    final_html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
        body {{ font-family: 'Noto Sans KR', sans-serif; line-height: 1.8; padding: 50px; color: #111; font-size: 17px; }}
        .h {{ border-bottom: 3px solid #3366cc; margin-bottom: 30px; padding-bottom: 15px; }}
        .t {{ font-size: 30px; font-weight: 700; margin-bottom: 12px; line-height: 1.3; }}
        .m {{ font-size: 14px; color: #555; }}
        .c img {{ max-width: 100%; height: auto; display: block; margin: 25px auto; border-radius: 4px; }}
        .c p {{ margin-bottom: 18px; text-align: justify; }}
    </style></head><body>
    <div class="h"><div class="t">{e_title}</div>
    <div class="m"><strong>{site}</strong> | {article_url}</div></div>
    <div class="c">{content}</div></body></html>"""
    
    driver.execute_script("document.open(); document.write(arguments[0]); document.close();", final_html)
    time.sleep(1)
    
    try:
        pdf_data = driver.execute_cdp_cmd("Page.printToPDF", {"printBackground": True, "preferCSSPageSize": True})
        filename = os.path.join(OUTPUT_DIR, output_name)
        with open(filename, "wb") as f:
            f.write(base64.b64decode(pdf_data['data']))
        file_size = os.path.getsize(filename)
        log(f"  PDF: {filename} ({file_size:,} bytes)")
        return True, file_size
    except Exception as e:
        log(f"  FAIL: PDF gen error: {e}")
        return False, 0


def main():
    log("=" * 60)
    log("DealSitePlus PDF Test v2 (no re-login)")
    log("=" * 60)
    
    driver = setup_driver()
    
    try:
        # Login
        log("\n--- LOGIN ---")
        creds = CREDENTIALS["dealsiteplus"]
        try:
            driver.get(creds["login_url"])
        except TimeoutException:
            driver.execute_script("window.stop();")
        time.sleep(2)
        wait = WebDriverWait(driver, 15)
        wait.until(EC.element_to_be_clickable((By.ID, creds["input_id"]))).send_keys(creds["ids"][0])
        driver.find_element(By.ID, creds["input_pw"]).send_keys(creds["pws"][0])
        time.sleep(0.5)
        driver.find_element(By.ID, creds["input_pw"]).submit()
        time.sleep(3)
        try:
            alert = driver.switch_to.alert
            log(f"Alert: {alert.text}")
            alert.accept()
        except:
            pass
        
        curr_url = driver.current_url
        login_ok = "login" not in curr_url.lower()
        log(f"Login result: {'OK' if login_ok else 'FAIL'} (URL: {curr_url})")
        if not login_ok:
            log("ABORT")
            return
        
        # Collect article
        log("\n--- COLLECT ARTICLE ---")
        try:
            driver.get("https://dealsiteplus.co.kr/categories/002062")
        except TimeoutException:
            driver.execute_script("window.stop();")
        time.sleep(3)
        
        items = driver.find_elements(By.CSS_SELECTOR, "div.mnm-news")
        log(f"Found {len(items)} articles")
        if not items:
            log("ABORT: no articles")
            return
        
        link_el = items[0].find_element(By.CSS_SELECTOR, "a.ss-news-top-title")
        article_url = link_el.get_attribute("href")
        title = link_el.text.strip()
        log(f"Article: {title}")
        log(f"URL: {article_url}")
        
        # Extract article_id
        article_id = article_url.split("/articles/")[1].split("/")[0] if "/articles/" in article_url else ""
        log(f"Article ID: {article_id}")
        
        # TEST A: Print URL (old approach with login)
        log("\n--- TEST A: Print URL (old approach) ---")
        print_url = f"https://dealsiteplus.co.kr/articles/print/{article_id}" if article_id else ""
        if print_url:
            ok_a, size_a = generate_pdf(driver, print_url, title, "DealSitePlus", article_url, "test_A_print.pdf")
            log(f"  Test A result: {'SUCCESS' if ok_a else 'FAIL'} (size: {size_a:,})")
        else:
            log("  SKIP: no article_id")
            ok_a, size_a = False, 0
        
        # TEST B: Direct URL (new approach)
        log("\n--- TEST B: Direct URL (new approach) ---")
        ok_b, size_b = generate_pdf(driver, article_url, title, "DealSitePlus", article_url, "test_B_direct.pdf")
        log(f"  Test B result: {'SUCCESS' if ok_b else 'FAIL'} (size: {size_b:,})")
        
        # Summary
        log("\n" + "=" * 60)
        log("SUMMARY:")
        log(f"  Test A (print URL): {'SUCCESS' if ok_a else 'FAIL'} - {size_a:,} bytes")
        log(f"  Test B (direct URL): {'SUCCESS' if ok_b else 'FAIL'} - {size_b:,} bytes")
        if ok_a and ok_b:
            log("  CONCLUSION: Both approaches work when logged in!")
            if size_a > size_b:
                log("  RECOMMENDATION: Print URL produces larger/better PDF")
            else:
                log("  RECOMMENDATION: Direct URL produces larger/better PDF")
        elif ok_b and not ok_a:
            log("  CONCLUSION: Only direct URL works. Print URL is broken.")
        elif ok_a and not ok_b:
            log("  CONCLUSION: Only print URL works.")
        else:
            log("  CONCLUSION: BOTH FAILED!")
        log("=" * 60)
        
    except Exception as e:
        import traceback
        log(f"ERROR: {e}")
        log(traceback.format_exc())
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
