import test_history
import re

history_urls = set()
history_titles = {}

def normalize(t):
    if not t: return ""
    return re.sub(r'[\s\W_]+', '', str(t)).lower()

def normalize_url(u):
    if not u: return ""
    if "thebell.co.kr" in u and "key=" in u:
        base = u.split('?')[0]
        key_match = re.search(r'key=([^&#]+)', u)
        if key_match: return f"{base}?key={key_match.group(1)}".strip().rstrip('/')
    return u.split('?')[0].split('#')[0].strip().rstrip('/')

sheets = test_history.sheets
SPREADSHEET_ID = test_history.SPREADSHEET_ID
HISTORY_SHEET_NAME = test_history.HISTORY_SHEET_NAME

range_name = f"'{HISTORY_SHEET_NAME}'!B:E"
result = sheets.spreadsheets().values().get(
    spreadsheetId=SPREADSHEET_ID, range=range_name
).execute()
rows = result.get('values', [])

for row in rows[1:]:
    if len(row) >= 4:
        h_site = row[0].strip()
        h_title = row[2].strip()
        h_url = row[3].strip()
        history_urls.add(normalize_url(h_url))
        if h_site not in history_titles: history_titles[h_site] = set()
        history_titles[h_site].add(normalize(h_title))

print(f"URLs in history: {len(history_urls)}")
# check duplicates for some mock URLs from current
# e.g., 'https://dealsiteplus.co.kr/articles/15888'
u = 'https://dealsiteplus.co.kr/articles/15888'
t = '에이티넘 30년 원클럽맨 박은수 대표, 쇄신 이끌까'
u_norm = normalize_url(u)
t_norm = normalize(t)
print("URL in history?", u_norm in history_urls)
print("Title in history?", t_norm in history_titles.get('DealSitePlus', set()))
