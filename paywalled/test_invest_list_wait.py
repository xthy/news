import sys
import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import os

with open('config.json') as f:
    config = json.load(f)
creds = config['CREDENTIALS']['investchosun']

options = Options()
options.add_argument('--headless=new')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)
wait = WebDriverWait(driver, 10)

try:
    print("Logging in...")
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

    print("Navigating to list.html?catid=114...")
    driver.get("https://www.investchosun.com/svc/news/list.html?catid=114")
    time.sleep(5)
    
    articles = driver.find_elements(By.CSS_SELECTOR, "ul.search-list li")
    print(f"Found {len(articles)} articles with wait 5s")
    if len(articles) > 0:
        print(articles[0].text)
finally:
    driver.quit()
