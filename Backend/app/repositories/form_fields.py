import requests
import re
import json


def extract_schema(form_url):
    response = requests.get(form_url)
    html = response.text
    match = re.search(r'FB_PUBLIC_LOAD_DATA_ = (.*?);', html)

    data = json.loads(match.group(1))
    questions = data[1][1]

    schema = {
        "date": None,
        "students": {},
        "fields": {}
    }

    for q in questions:
        try:
            q_title = q[1]
            q_type = q[3]

            # --- DATE ---
            if q_type == 9:
                schema["date"] = q[4][0][0]

            # --- STUDENTS ---
            elif q_type == 7:
                for student in q[4]:
                    entry_id = student[0]
                    name = student[3][0]
                    schema["students"][name] = entry_id

            # --- NORMAL FIELDS ---
            elif q[4] and isinstance(q[4][0], list):
                entry_id = q[4][0][0]

                if q_title:  # ignore section titles
                    schema["fields"][q_title.strip()] = entry_id

        except:
            continue

    return schema


def submit_to_google(form_url: str, payload: dict):
    post_url = form_url.replace("viewform", "formResponse")

    payload["pageHistory"] = "0,1,2,3"
    payload["fvv"] = "1"

    response = requests.post(post_url, data=payload)

    print("Status:", response.status_code)