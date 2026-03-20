import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
import os

options = Options()
options.add_argument('--headless=new')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)

driver.get("https://www.investchosun.com/svc/news/tlist.html?catid=114")
time.sleep(5)
with open('test_invest_html.txt', 'w', encoding='utf-8') as f:
    f.write(driver.page_source)

driver.quit()
