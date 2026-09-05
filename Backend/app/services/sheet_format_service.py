from app.utils.date_utils import get_current_month_name, extract_year_from_sheet
from datetime import datetime


def get_current_month_sheets(excel_sheet):
    current_month = get_current_month_name()
    current_year = str(datetime.now().year)

    matching_sheets = []

    for sheet in excel_sheet.sheet_names:
        # Check if month is in sheet name
        month_in_sheet = current_month in sheet.upper()

        # Check if year is in sheet name
        year_in_sheet = current_year in sheet

        # If both are present, it's a match
        if month_in_sheet and year_in_sheet:
            matching_sheets.append(sheet)
            continue

        # If month is present but year isn't, try to find year in document
        if month_in_sheet and not year_in_sheet:
            year_from_doc = extract_year_from_sheet(
                excel_sheet,
                sheet
            )

            if year_from_doc == current_year:
                matching_sheets.append(sheet)

    return matching_sheets