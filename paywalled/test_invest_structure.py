"""Check exact HTML structure of one <li> element"""
import time, json, os
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

options = Options()
chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
if os.path.exists(chrome_path):
    options.binary_location = chrome_path
options.add_argument("--headless=new")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_experimental_option("excludeSwitches", ["enable-automation", "enable-logging"])
options.add_experimental_option('useAutomationExtension', False)

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)
driver.set_page_load_timeout(30)
wait = WebDriverWait(driver, 10)

try:
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
        alert.accept()
    except:
        pass

    driver.get("https://www.investchosun.com/svc/news/list.html?catid=114")
    time.sleep(5)
    
    # Get innerHTML of the first search-list li
    result = driver.execute_script("""
        var items = document.querySelectorAll('ul.search-list li');
        var out = [];
        out.push('Total items: ' + items.length);
        if (items.length > 0) {
            out.push('=== FIRST LI outerHTML ===');
            out.push(items[0].outerHTML);
            out.push('=== SECOND LI outerHTML ===');
            if (items.length > 1) out.push(items[1].outerHTML);
        }
        return out.join('\\n');
    """)
    with open('invest_li_structure.txt', 'w', encoding='utf-8') as f:
        f.write(result)
    print("Done")
finally:
    driver.quit()
