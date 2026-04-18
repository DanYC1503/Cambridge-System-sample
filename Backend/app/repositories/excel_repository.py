import io
import pandas as pd
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

from Backend.app.config import GOOGLE_CREDENTIALS_PATH, GOOGLE_SHEET_ID


def download_excel():
    creds = Credentials.from_service_account_file(
        GOOGLE_CREDENTIALS_PATH,
        scopes=["https://www.googleapis.com/auth/drive.readonly"]
    )

    service = build("drive", "v3", credentials=creds)

    request = service.files().get_media(fileId=GOOGLE_SHEET_ID)

    file_stream = io.BytesIO()
    downloader = MediaIoBaseDownload(file_stream, request)

    done = False
    while not done:
        _, done = downloader.next_chunk()

    file_stream.seek(0)
    return file_stream

def get_excel_file():
    file_stream = download_excel()
    return pd.ExcelFile(file_stream)

