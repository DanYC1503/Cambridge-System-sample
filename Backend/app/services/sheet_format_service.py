from app.repositories.excel_repository import get_excel_file
from app.utils.date_utils import get_current_month_name
from datetime import datetime

def get_current_month_sheets(excel_sheet):
    current_month = get_current_month_name()
    current_year = str(datetime.now().year)

    return [
        sheet for sheet in excel_sheet.sheet_names
        if current_month in sheet.upper()
        and current_year in sheet
    ]
