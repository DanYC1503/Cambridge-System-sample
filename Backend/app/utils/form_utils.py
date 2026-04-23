from urllib.parse import urlparse
import requests


def is_google_form(url: str) -> bool:
    try:
        parsed = urlparse(url)

        return (
            parsed.scheme in ("http", "https") and
            "docs.google.com" in parsed.netloc and
            "/forms/" in parsed.path
        )
    except:
        return False

def normalize_form_url(url: str) -> str:
    # Step 1: resolve redirects (handles forms.gle)
    response = requests.get(url, allow_redirects=True)
    final_url = response.url

    # Step 2: apply your existing fixes
    if "formResponse" in final_url:
        final_url = final_url.replace("formResponse", "viewform")

    if "/edit" in final_url:
        final_url = final_url.replace("/edit", "/viewform")

    # Step 3: ensure it ends with /viewform
    if "/viewform" not in final_url:
        final_url = final_url.rstrip("/") + "/viewform"

    return final_url