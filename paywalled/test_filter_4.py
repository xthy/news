import test_history
import re

def normalize(t):
    if not t: return ""
    return re.sub(r'[\s\W_]+', '', str(t)).lower()

def normalize_url(u):
    if not u: return ""
    # Preserve 'key' for TheBell
    if "thebell.co.kr" in u and "key=" in u:
        base = u.split('?')[0]
        key_match = re.search(r'key=([^&#]+)', u)
        if key_match: return f"{base}?key={key_match.group(1)}".strip().rstrip('/')
    
    # Default: strip query params for others (standard)
    return u.split('?')[0].split('#')[0].strip().rstrip('/')

sheets = test_history.sheets
SPREADSHEET_ID = test_history.SPREADSHEET_ID
HISTORY_SHEET_NAME = test_history.HISTORY_SHEET_NAME

range_name = f"'{HISTORY_SHEET_NAME}'!B:E"
result = sheets.spreadsheets().values().get(
    spreadsheetId=SPREADSHEET_ID, range=range_name
).execute()
rows = result.get('values', [])

history_urls = set()
history_titles = {}

for row in rows[1:]:
    if len(row) >= 4:
        h_site = row[0].strip()
        h_title = row[2].strip()
        h_url = row[3].strip()
        
        history_urls.add(normalize_url(h_url))
        if h_site not in history_titles: history_titles[h_site] = set()
        history_titles[h_site].add(normalize(h_title))

for row in rows[-3:]:
    h_site = row[0].strip()
    h_title = row[2].strip()
    h_url = row[3].strip()
    print(f"Checking recently added: {h_site} - {h_title}")
    
    n_url = normalize_url(h_url)
    n_title = normalize(h_title)
    print(f" Is URL dup? {n_url in history_urls}")
    print(f" Is Title dup? {n_title in history_titles.get(h_site, set())}")

