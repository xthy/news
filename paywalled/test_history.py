import os
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import pickle

def get_google_services():
    SCOPES = [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/gmail.send'
    ]
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
            
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
            
    if creds and creds.valid:
        sheets = build('sheets', 'v4', credentials=creds)
        return sheets
    return None

sheets = get_google_services()
SPREADSHEET_ID = '18KrjCdEEcNJrmNRAV19nhwAoya9l65gzH3ypFYaRlHM'
HISTORY_SHEET_NAME = 'paywalled_pdf'

try:
    range_name = f"'{HISTORY_SHEET_NAME}'!A:E"
    result = sheets.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID, range=range_name
    ).execute()
    rows = result.get('values', [])
    print(f"Total rows: {len(rows)}")
    for i, row in enumerate(rows[-5:]):
        print(f"Row {len(rows)-5+i}: {row}")
except Exception as e:
    print(f"Error: {e}")
