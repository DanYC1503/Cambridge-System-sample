import re


IGNORE_WORDS = [
    "SPEAKING",
    "HOURS",
    "HOUR",
    "FRENCH",
    "2024",
    "2025",
    "2026",
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE"
]
TEACHER_NORMALIZATION = {
    "DAVE": "DAVID",
}

def extract_teacher_name(sheet_name: str):
    sheet_name = sheet_name.strip()
    words = sheet_name.upper().split()

    filtered = [
        word for word in words
        if word not in IGNORE_WORDS
        and not re.search(r"\d", word)  # remove anything with numbers
    ]

    name = " ".join(filtered).strip()

    return TEACHER_NORMALIZATION.get(name, name)