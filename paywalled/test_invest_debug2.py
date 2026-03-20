"""
Debug script: write all output to a file
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

log_lines = []
def log(msg):
    print(msg)
    log_lines.append(msg)

with open('config.json') as f:
    config = json.load(f)
creds = config['CREDENTIALS']['investchosun']

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
options.add_argument("--headless=new")

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
    log("1. Logging in...")
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
    
    try:
        alert = driver.switch_to.alert
        log(f"  Alert: {alert.text}")
        alert.accept()
        time.sleep(1)
    except:
        pass

    log(f"  Current URL after login: {driver.current_url}")
    
    log("2. Navigating to list.html?catid=114...")
    driver.get("https://www.investchosun.com/svc/news/list.html?catid=114")
    time.sleep(5)
    
    log(f"  Current URL: {driver.current_url}")
    log(f"  Page title: {driver.title}")
    
    # Check JavaScript for articles
    js_result = driver.execute_script("""
        var results = [];
        
        // Check search-list
        var searchList = document.querySelectorAll('ul.search-list li');
        results.push('ul.search-list li: ' + searchList.length);
        
        // Check all ul
        var uls = document.querySelectorAll('ul');
        results.push('Total ul elements: ' + uls.length);
        for(var i=0; i<uls.length; i++) {
            var classes = uls[i].className;
            var childCount = uls[i].children.length;
            if (childCount > 0) {
                results.push('  ul['+i+'] class="' + classes + '" children=' + childCount);
            }
        }
        
        // Check all li with date-like text
        var allLi = document.querySelectorAll('li');
        results.push('Total li: ' + allLi.length);
        var liWithDate = 0;
        for(var j=0; j<allLi.length; j++) {
            var txt = allLi[j].textContent;
            if (/\\d{4}\\.\\d{2}\\.\\d{2}/.test(txt)) {
                liWithDate++;
                if (liWithDate <= 3) {
                    var links = allLi[j].querySelectorAll('a');
                    var dateMatch = txt.match(/\\d{4}\\.\\d{2}\\.\\d{2}/);
                    results.push('  DATE-li['+j+']: date=' + (dateMatch ? dateMatch[0] : 'N/A') + ' links=' + links.length);
                    if (links.length > 0) {
                        results.push('    href=' + links[0].href + ' text=' + links[0].textContent.substring(0, 40));
                    }
                }
            }
        }
        results.push('Li with dates: ' + liWithDate);
        
        // Check if content loaded via AJAX (look for common patterns)
        var body = document.body.innerHTML;
        results.push('Body length: ' + body.length);
        results.push('Has search-list class: ' + (body.indexOf('search-list') >= 0));
        results.push('Has html_dir: ' + (body.indexOf('html_dir') >= 0));
        
        // Check for dt a elements
        var dtAs = document.querySelectorAll('dt a');
        results.push('dt a elements: ' + dtAs.length);
        for(var k=0; k<Math.min(dtAs.length, 3); k++) {
            results.push('  dt a['+k+']: href=' + dtAs[k].href + ' text=' + dtAs[k].textContent.substring(0, 40));
        }
        
        // Iframes
        var iframes = document.querySelectorAll('iframe');
        results.push('Iframes: ' + iframes.length);
        
        return results.join('\\n');
    """)
    log("\n3. JavaScript DOM analysis:")
    log(js_result)

except Exception as e:
    log(f"ERROR: {e}")
    import traceback
    log(traceback.format_exc())
finally:
    driver.quit()
    with open('invest_debug_results.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(log_lines))
    log("Done. Results saved to invest_debug_results.txt")
