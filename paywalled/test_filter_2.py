import test_history

sheets = test_history.sheets
SPREADSHEET_ID = test_history.SPREADSHEET_ID
HISTORY_SHEET_NAME = test_history.HISTORY_SHEET_NAME

range_name = f"'{HISTORY_SHEET_NAME}'!B:E"
result = sheets.spreadsheets().values().get(
    spreadsheetId=SPREADSHEET_ID, range=range_name
).execute()
rows = result.get('values', [])
print(f"B:E size: {len(rows)}")
if rows:
    print(f"Row 0: {rows[0]}")
    print(f"Row 1: {rows[1]}")
    print(f"Row -1: {rows[-1]}")
