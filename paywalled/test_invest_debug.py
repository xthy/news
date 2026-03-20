"""
Debug script: Emulate main code's driver setup exactly, login to InvestChosun, 
navigate to list.html?catid=114, and dump DOM + debug info.
"""
import sys
import time
import json
import re
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

with open('config.json') as f:
    config = json.load(f)
creds = config['CREDENTIALS']['investchosun']

# Replicate the EXACT same driver setup as paywalled_pdf.py
options = Options()
chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
if os.path.exists(chrome_path):
    options.binary_location = chrome_path
options.add_argument("--start-maximized")
options.add_argument("--disable-extensions")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--disable-infobars")
options.add_argument("--disable-browser-side-navigation")
options.add_argument("--disable-popup-blocking")
options.add_argument("--disable-features=MediaRouter")
options.add_argument("--disable-features=DialMediaRouteProvider")
options.add_argument("--deny-permission-prompts")
options.add_argument("--disable-web-security")
options.add_argument("--disable-site-isolation-trials")
options.add_experimental_option("excludeSwitches", ["enable-automation", "enable-logging"])
options.add_experimental_option('useAutomationExtension', False)
options.add_argument("--headless=new")  # Use headless for this test

settings = {
    "recentDestinations": [{"id": "Save as PDF", "origin": "local", "account": ""}],
    "selectedDestinationId": "Save as PDF",
    "version": 2
}
prefs = {
    'printing.print_preview_sticky_settings.appState': json.dumps(settings),
    'profile.default_content_setting_values': {
        'notifications': 2, 'geolocation': 2, 'media_stream': 2,
    },
}
options.add_experimental_option('prefs', prefs)
options.add_argument('--kiosk-printing')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)
driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
driver.set_page_load_timeout(30)
wait = WebDriverWait(driver, 10)

try:
    # Login
    print("1. Logging in...")
    driver.get(creds["login_url"])
    time.sleep(2)
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
    
    # Handle alert
    try:
        alert = driver.switch_to.alert
        print(f"  Alert: {alert.text}")
        alert.accept()
        time.sleep(1)
    except:
        pass

    print(f"  Current URL after login: {driver.current_url}")
    
    # Navigate to list
    print("\n2. Navigating to list.html?catid=114...")
    driver.get("https://www.investchosun.com/svc/news/list.html?catid=114")
    time.sleep(5)
    
    # Check current URL
    print(f"  Current URL: {driver.current_url}")
    print(f"  Page title: {driver.title}")
    
    # Try waiting for search-list
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "ul.search-list li"))
        )
        print("  SUCCESS: ul.search-list li found via WebDriverWait")
    except:
        print("  FAIL: ul.search-list li NOT found via WebDriverWait after 10s")
    
    # Dump all element counts
    for selector in ["ul.search-list li", "ul.search-list", "li", "dl", "dt a", 
                      ".date", ".date em", ".date span", "dd.date em",
                      "div.list-wrap", "div.news-list", "div.search-list"]:
        els = driver.find_elements(By.CSS_SELECTOR, selector)
        print(f"  Selector '{selector}': {len(els)} elements")
    
    # Get the full page source and look for article-looking HTML
    html = driver.page_source
    
    # Check if page has article content at all
    dates_found = re.findall(r'\d{4}\.\d{2}\.\d{2}', html)
    print(f"\n  Dates found in page source: {dates_found[:10]}")
    
    article_urls = re.findall(r'html_dir/\d{4}/\d{2}/\d{2}/\d+\.html', html)
    print(f"  Article URLs found: {len(article_urls)}")
    if article_urls:
        print(f"  First few: {article_urls[:3]}")
    
    # Look for ul.search-list in raw HTML
    if 'search-list' in html:
        print("\n  'search-list' class FOUND in HTML")
        idx = html.find('search-list')
        print(f"  Context: ...{html[max(0,idx-50):idx+200]}...")
    else:
        print("\n  'search-list' class NOT FOUND in HTML")
        
    # Save HTML for analysis
    with open('invest_debug_full.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("\n  Saved full HTML to invest_debug_full.html")
    
    # Try JavaScript approach to find articles
    print("\n3. Trying JavaScript queries...")
    js_result = driver.execute_script("""
        var results = [];
        var lis = document.querySelectorAll('ul.search-list li');
        results.push('ul.search-list li: ' + lis.length);
        
        // Try all ul elements
        var uls = document.querySelectorAll('ul');
        results.push('all ul: ' + uls.length);
        for(var i=0; i<uls.length; i++) {
            results.push('  ul['+i+'] class="' + uls[i].className + '" children=' + uls[i].children.length);
        }
        
        // Check iframes
        var iframes = document.querySelectorAll('iframe');
        results.push('iframes: ' + iframes.length);
        
        return results.join('\\n');
    """)
    print(js_result)

finally:
    driver.quit()
