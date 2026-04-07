
import os
import time
import json
import base64
import logging
import re
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

READABILITY_JS_URL = 'https://unpkg.com/@mozilla/readability@0.4.4/Readability.js'

def setup_driver():
    options = Options()
    options.add_argument("--log-level=3")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-extensions")
    options.page_load_strategy = 'eager'
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    settings = {
        "recentDestinations": [{"id": "Save as PDF", "origin": "local", "account": ""}],
        "selectedDestinationId": "Save as PDF",
        "version": 2
    }
    prefs = {
        'printing.print_preview_sticky_settings.appState': json.dumps(settings),
        'savefile.default_directory': os.path.abspath(".")
    }
    options.add_experimental_option('prefs', prefs)
    options.add_argument('--kiosk-printing')

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver

def login_thebell(driver, username, password):
    login_url = "https://www.thebell.co.kr/LoginCert/Login.asp"
    logger.info(f"Starting login for TheBell at {login_url}")
    driver.get(login_url)
    time.sleep(3)
    
    try:
        # Handle initial alert if any
        try:
            alert = driver.switch_to.alert
            logger.info(f"Alert on load: {alert.text}")
            alert.accept()
        except: pass

        # Use script to set values as it's more reliable for some sites
        logger.info(f"Setting ID: {username}")
        driver.execute_script(f"document.getElementById('id').value='{username}';")
        logger.info(f"Setting PW: {'*'*len(password)}")
        driver.execute_script(f"document.getElementById('pw').value='{password}';")
        
        time.sleep(1)
        # Click login button
        try:
            btn = driver.find_element(By.ID, "btn1")
            driver.execute_script("arguments[0].click();", btn)
            logger.info("Clicked login button via script-arguments")
        except:
            driver.execute_script("document.getElementById('btn1').click();")
            logger.info("Clicked login button via direct script")
        
        time.sleep(5)
        
        # Handle any after-login alerts
        try:
            alert = driver.switch_to.alert
            logger.info(f"Alert after login: {alert.text}")
            alert.accept()
            time.sleep(2)
        except: pass

        curr_url = driver.current_url
        if "Login" not in curr_url:
            logger.info(f"Login successful, landed on: {curr_url}")
            return True
            
        # Check for logout link to confirm success if still on login page or weird page
        try:
            logout_link = driver.find_elements(By.XPATH, "//a[contains(@href, 'LogOut')]")
            if logout_link:
                logger.info("Logout link found - login success!")
                return True
        except: pass
            
        return False
    except Exception as e:
        logger.error(f"Login failed: {e}")
        return False

def test_thebell_article(driver, article_key):
    try:
        # Try Normal View first
        normal_url = f"https://www.thebell.co.kr/front/newsview.asp?key={article_key}"
        logger.info(f"Navigating to normal view: {normal_url}")
        driver.get(normal_url)
        time.sleep(5)
        
        body_text = driver.find_element(By.TAG_NAME, "body").text.strip()
        logger.info(f"Normal view body text length: {len(body_text)}")
        driver.save_screenshot("test_thebell_normal_view.png")

        # Now Try Print View
        print_url = f"https://www.thebell.co.kr/front/NewsPrint.asp?key={article_key}"
        logger.info(f"Navigating to print view: {print_url}")
        driver.get(print_url)
        time.sleep(5)
        
        body_text = driver.find_element(By.TAG_NAME, "body").text.strip()
        logger.info(f"Print view body text length: {len(body_text)}")
        driver.save_screenshot("test_thebell_print_view.png")

        # Inject Readability
        driver.execute_script(f"var s=document.createElement('script');s.src='{READABILITY_JS_URL}';document.head.appendChild(s);")
        time.sleep(2)
        
        article_data = driver.execute_script("try{return new Readability(document.cloneNode(true)).parse();}catch(e){return null;}")
        
        if not article_data:
            logger.error("Readability failed to parse the page content.")
            return False
            
        logger.info(f"Parsed Title: {article_data.get('title')}")
        logger.info(f"Content length: {len(article_data.get('content', ''))}")
        return True
    except Exception as e:
        logger.error(f"Test failed: {e}")
        return False

if __name__ == "__main__":
    with open("config.json", "r", encoding="utf-8") as f:
        config = json.load(f)
    
    creds = config["CREDENTIALS"]["thebell"]
    username = creds["ids"][0]
    password = creds["pws"][0]
    
    driver = setup_driver()
    try:
        if login_thebell(driver, username, password):
            # Use the key from the user's log
            test_thebell_article(driver, "202603261647584280108646")
        else:
            logger.error("Login failed completely.")
    finally:
        driver.quit()
