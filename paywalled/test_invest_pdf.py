"""
Test script: InvestChosun PDF generation
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

LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_investpdf_result.log")

def log(msg):
    line = f"[{datetime.now().strftime('%H:%M:%S')}] {msg}"
    print(line)
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

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_invest_pdfs")
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

def generate_pdf(driver, target_url, title, site, article_url, output_name, reporter="", date=""):
    """Attempt to generate PDF from a given URL."""
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
    has_paywall = "유료회원" in page_text or "로그인" in page_text
    is_404 = "찾을 수 없" in page_text or "404" in page_text or len(page_text.strip()) < 50
    log(f"  Page text length: {len(page_text)}")
    log(f"  Paywall/Login hint visible: {has_paywall}")
    log(f"  Is 404/empty: {is_404}")
    log(f"  Body preview: {page_text[:150]}")
    
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
        
        // InvestChosun fix: unwrap article content safely to prevent truncation
        document.querySelectorAll('#article ul').forEach(function(ul) {
            var div = document.createElement('div');
            div.innerHTML = ul.innerHTML;
            ul.parentNode.replaceChild(div, ul);
        });
        document.querySelectorAll('#article li').forEach(function(li) {
            var p = document.createElement('p');
            p.innerHTML = li.innerHTML;
            li.parentNode.replaceChild(p, li);
        });
        
        // InvestChosun fix: images are wrapped in dl which Readability drops
        document.querySelectorAll('#article dl').forEach(function(dl) {
            var div = document.createElement('div');
            div.innerHTML = dl.innerHTML;
            dl.parentNode.replaceChild(div, dl);
        });
        document.querySelectorAll('#article dd, #article dt').forEach(function(el) {
            var p = document.createElement('p');
            p.innerHTML = el.innerHTML;
            el.parentNode.replaceChild(p, el);
        });
        
        // Fix lazy-loaded images globally and ensure they are preserved
        var articleDiv = document.querySelector('#article');
        document.querySelectorAll('img').forEach(function(img) {
            var attrs = ['data-src', 'lazy-src', 'data-original', 'data-url', 'lazyload'];
            var foundSrc = false;
            for (var i = 0; i < attrs.length; i++) {
                var val = img.getAttribute(attrs[i]);
                if (val && val.length > 5) {
                    if (!val.startsWith('http')) {
                        if (val.startsWith('//')) { val = 'https:' + val; }
                        else if (val.startsWith('/')) { val = window.location.origin + val; }
                    }
                    img.src = val;
                    foundSrc = true;
                    break;
                }
            }
            if (foundSrc || (img.src && img.src.length > 5)) {
                img.removeAttribute('loading');
                img.style.display = 'block';
                img.className = '';
                // Move image to be a direct child of article div to prevent stripping by Readability
                // We'll insert it before the closest ancestor that is a direct child of #article
                if (articleDiv && articleDiv.contains(img) && articleDiv !== img.parentNode) {
                    var ancestor = img;
                    while (ancestor.parentNode !== articleDiv && ancestor.parentNode !== null) {
                        ancestor = ancestor.parentNode;
                    }
                    if (ancestor.parentNode === articleDiv) {
                        articleDiv.insertBefore(img, ancestor);
                    }
                }
            }
        });
        
        // Clean up nested paragraphs that confuse Readability
        document.querySelectorAll('p p').forEach(function(p) {
            var parent = p.parentNode;
            while (p.firstChild) {
                parent.insertBefore(p.firstChild, p);
            }
            parent.removeChild(p);
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
    
    # Build HTML
    content = re.sub(r'^\s*<h[1-6][^>]*>.*?</h[1-6]>\s*', '', content, flags=re.DOTALL)
    e_title = title.replace('\n', ' ')
    
    with open("invest_debug_source.html", "w", encoding="utf-8") as f:
        f.write(driver.page_source)
    with open("invest_debug_readability.html", "w", encoding="utf-8") as f:
        f.write(content)

    reporter_html = f' | <span style="color: #333;">{reporter}</span>' if reporter else ''
    
    final_html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
        body {{ font-family: 'Noto Sans KR', sans-serif; line-height: 1.8; padding: 50px; color: #111; font-size: 17px; }}
        .h {{ border-bottom: 3px solid #3366cc; margin-bottom: 30px; padding-bottom: 15px; }}
        .t {{ font-size: 30px; font-weight: 700; margin-bottom: 12px; line-height: 1.3; }}
        .m {{ font-size: 14px; color: #555; }}
        .c img {{ max-width: 100%; height: auto; display: block; margin: 25px auto; border-radius: 4px; }}
        .c p {{ margin-bottom: 18px; text-align: justify; }}
        .c ul, .c li {{ list-style-type: none; margin-left: 0; padding-left: 0; }}
    </style></head><body>
    <div class="h"><div class="t">{e_title}</div>
    <div class="m"><strong>{site}</strong>{reporter_html} | {date} | {article_url}</div></div>
    <div class="c">{content}</div></body></html>"""
    
    driver.execute_script("document.open(); document.write(arguments[0]); document.close();", final_html)
    time.sleep(1)
    
    try:
        pdf_data = driver.execute_cdp_cmd("Page.printToPDF", {"printBackground": True, "preferCSSPageSize": True})
        filename = os.path.join(OUTPUT_DIR, output_name)
        with open(filename, "wb") as f:
            f.write(base64.b64decode(pdf_data['data']))
        file_size = os.path.getsize(filename)
        log(f"  PDF generated: {filename} ({file_size:,} bytes)")
        return True, file_size
    except Exception as e:
        log(f"  FAIL: PDF gen error: {e}")
        return False, 0


def main():
    log("=" * 60)
    log("InvestChosun PDF Test")
    log("=" * 60)
    
    driver = setup_driver()
    
    try:
        # Login
        log("\\n--- LOGIN ---")
        creds = CREDENTIALS["investchosun"]
        driver.get(creds["login_url"])
        time.sleep(2)
        wait = WebDriverWait(driver, 15)
        user_el = wait.until(EC.element_to_be_clickable((By.ID, creds["input_id"])))
        user_el.clear()
        user_el.send_keys(creds["ids"][0])
        pw_el = driver.find_element(By.ID, creds["input_pw"])
        pw_el.clear()
        pw_el.send_keys(creds["pws"][0])
        time.sleep(0.5)
        login_btn = driver.find_element(By.CSS_SELECTOR, creds["btn_selector"])
        driver.execute_script("arguments[0].click();", login_btn)
        time.sleep(3)
        try:
            alert = driver.switch_to.alert
            log(f"Alert: {alert.text}")
            alert.accept()
        except:
            pass
        
        curr_url = driver.current_url
        log(f"Login URL post-login: {curr_url}")
        
        # Collect article
        log("\n--- COLLECT ARTICLE ---")
        url_list = "https://www.investchosun.com/svc/news/list.html?catid=114"
        driver.get(url_list)
        time.sleep(5)
        
        js_articles = driver.execute_script("""
            var result = [];
            var items = document.querySelectorAll('ul.search-list li');
            for (var i = 0; i < items.length; i++) {
                var linkEl = items[i].querySelector('dt a');
                var dateEl = items[i].querySelector('dd.date em, .date em');
                var reporterEl = items[i].querySelector('dd.date span');
                if (linkEl && (linkEl.href.includes('html_dir') || linkEl.href.includes('contid='))) {
                    var title = linkEl.textContent.trim();
                    var url = linkEl.href;
                    var date = dateEl ? dateEl.textContent.trim() : "";
                    var reporter = reporterEl ? reporterEl.textContent.trim() : "";
                    reporter = reporter.replace(/기자.*/, '');
                    result.push({title: title, href: url, date: date, reporter: reporter.trim()});
                }
            }
            return result;
        """)
        
        if not js_articles:
            log("No active articles found.")
            return

        for idx, article in enumerate(js_articles[:2]):
            article_url = article['href']
            title = article['title'].replace('\n', ' ').strip()
            date = article['date']
            reporter_name = article['reporter']
            
            m = re.search(r'(\d{4})[.-](\d{2})[.-](\d{2})', date)
            if m:
                date = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
            
            log(f"\n--- [Article {idx+1}] ---")
            log(f"Article: {title}")
            log(f"URL: {article_url}")
            log(f"Reporter: {reporter_name}, Date: {date}")
            
            # Using only Direct URL method as the print URL doesn't work well
            ok_b, size_b = generate_pdf(driver, article_url, title, "InvestChosun", article_url, f"invest_test_{idx+1}.pdf", reporter_name, date)
            log(f"  Test PDF size: {size_b:,} bytes")
        
    except Exception as e:
        import traceback
        log(f"ERROR: {e}")
        log(traceback.format_exc())
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
