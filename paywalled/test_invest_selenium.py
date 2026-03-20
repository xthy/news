import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
import os

options = Options()
# Removed headless so it might be easier or headless=new
options.add_argument('--headless=new')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)

driver.get("https://www.investchosun.com/svc/news/tlist.html?catid=114")
time.sleep(5)
html = driver.execute_script("return document.body.innerHTML;")

# extracting simple text and structure
import re

print("Finding articles...")
items = re.findall(r'<li.*?</li>', html, re.DOTALL | re.IGNORECASE)
print(f"Found {len(items)} li tags")
if len(items) == 0:
    # try divs
    items = re.findall(r'<div class="list_item".*?</div>', html, re.DOTALL | re.IGNORECASE)
    print(f"Found {len(items)} list_item divs")
    
if items:
    for i, it in enumerate(items[:3]):
        # remove inner html tags just to see text
        text = re.sub(r'<[^>]+>', ' ', it)
        text = re.sub(r'\s+', ' ', text).strip()
        print(f"Item {i}: {text[:200]}")

driver.quit()
