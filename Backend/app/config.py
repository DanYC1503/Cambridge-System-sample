import json
import os
from dotenv import load_dotenv

load_dotenv()


#GOOGLE_CREDENTIALS = json.loads(os.getenv("GOOGLE_CREDENTIALS", "{}"))
GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID")
def load_credentials():
    creds_env = os.getenv("GOOGLE_CREDENTIALS_JSON")

    if not creds_env:
        raise ValueError("Missing GOOGLE_CREDENTIALS_JSON")

    # CASE 1: it's a path to a file
    if os.path.exists(creds_env):
        with open(creds_env) as f:
            return json.load(f)

    # CASE 2: it's raw JSON string (Render)
    return json.loads(creds_env)