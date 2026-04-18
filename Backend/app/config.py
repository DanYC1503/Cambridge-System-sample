import json
import os
from dotenv import load_dotenv

load_dotenv()


GOOGLE_CREDENTIALS = json.loads(os.getenv("GOOGLE_CREDENTIALS", "{}"))
GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID")