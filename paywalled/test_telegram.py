import requests

bot_token = '8386184147:AAFfqXEwURMfrD2qIZm2MI3gsDcl4QhYEDA'
chat_id = '119233082'
url = f'https://api.telegram.org/bot{bot_token}/sendMessage'

print("Sending request to Telegram API...")
try:
    resp = requests.post(url, json={'chat_id': chat_id, 'text': '봇 설정이 완료되었습니다! 앞으로 실행 로그가 이곳으로 전송됩니다.'}, timeout=15)
    print(f"Status Code: {resp.status_code}")
    print(f"Response: {resp.text}")
except Exception as e:
    print(f"Error occurred: {e}")
