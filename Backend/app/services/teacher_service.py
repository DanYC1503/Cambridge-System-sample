
from datetime import datetime

from Backend.app.utils.date_utils import fix_speaking_hours_column, get_current_month_name, split_speaking_dates
from Backend.app.repositories.excel_repository import get_excel_file
from Backend.app.utils.name_utils import extract_teacher_name
import pandas as pd

TEACHER_ALIASES = {
    "DAVID": ["DAVID", "DAVE"],
}

def get_teachers_from_month(sheets):

    teachers = set()

    for sheet in sheets:
        name = extract_teacher_name(sheet)

        if name:  # avoid empty
            teachers.add(name)

    return list(teachers)


def find_teacher_sheets(teacher_name: str, excel):
    current_month = get_current_month_name()
    current_year = str(datetime.now().year)

    aliases = TEACHER_ALIASES.get(teacher_name.upper(), [teacher_name.upper()])

    return [
        sheet for sheet in excel.sheet_names
        if current_month in sheet.upper()
        and current_year in sheet.upper()
        and any(alias in sheet.upper() for alias in aliases)
    ]


def load_teacher_data(teacher_name: str):
    sheets = find_teacher_sheets(teacher_name)
    excel = get_excel_file()

    dataframes = []

    for sheet in sheets:
        df = pd.read_excel(excel, sheet_name=sheet)
        dataframes.append(df)

    return dataframes

def get_teacher_schedule(teacher_name: str, dataframe):
    # Step 1: clean merged cells
    df = dataframe.replace("", pd.NA)
    df = df.ffill()

    # Step 2: keep only needed columns (force copy)
    columns_needed = [
        "TEACHER",
        "CLASS",
        "SPEAKING DATE",
        "CLASSROOM / FACILITY",
        "SPEAKING HOURS",
        "PERIOD", 
        "DAY_TYPE"
    ]

    df2 = df[[col for col in columns_needed if col in df.columns]].copy()

    # Step 3: filter teacher
    df2 = df2[
        df2["TEACHER"]
        .astype(str)
        .str.upper()
        .str.contains(teacher_name.upper(), na=False)
    ]

    # Step 4: remove empty speaking dates
    df2 = df2[df2["SPEAKING DATE"].notna()].copy()

    # Step 5: normalize types (important)
    df2.loc[:, "SPEAKING DATE"] = df2["SPEAKING DATE"].astype(str)
    df2.loc[:, "SPEAKING HOURS"] = df2["SPEAKING HOURS"].astype(str)

    #  FIX HOURS FIRST (before anything else touches it)
    df2 = fix_speaking_hours_column(df2)

    # Step 6: split dates AFTER cleaning
    df2 = split_speaking_dates(df2)

    return df2