from urllib.parse import urlparse



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
    if "formResponse" in url:
        return url.replace("formResponse", "viewform")
    if "/edit" in url:
        return url.replace("/edit", "/viewform")
    return url