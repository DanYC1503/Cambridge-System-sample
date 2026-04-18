
from app.repositories.form_fields import extract_schema, submit_to_google
from app.utils.form_utils import is_google_form, normalize_form_url


FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScgYPW4xBUstY3z76HT9Y63QHEYezjs3TNN0yHfkhUzt4LLTA/viewform"

def get_form_via_link(form_url: str):
    if not is_google_form(form_url):
        raise ValueError("Invalid Google Form URL")
    form_url = normalize_form_url(form_url)
    
    return extract_schema(form_url)
    
def build_payload(input_json, schema):
    data = {}

    # date
    y, m, d = input_json["fecha"].split("-")
    date_id = schema["date"]

    data[f"entry.{date_id}_year"] = y
    data[f"entry.{date_id}_month"] = m
    data[f"entry.{date_id}_day"] = d

    # fields
    for k, v in input_json["fields"].items():
        entry_id = schema["fields"][k]
        data[f"entry.{entry_id}"] = v

    # students
    for name, status in input_json["students"].items():
        entry_id = schema["students"][name]
        data[f"entry.{entry_id}"] = status

    return data

def submit_form_service(form_url: str, data):
    schema = extract_schema(form_url)

    payload = build_payload(data.dict(), schema)

    submit_to_google(form_url, payload)