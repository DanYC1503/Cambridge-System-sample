from functools import cache

from app.services.sheet_format_service import get_current_month_sheets
from app.services.teacher_service import find_teacher_sheets, get_teacher_schedule, get_teachers_from_month
from app.repositories.excel_repository import get_excel_file
from app.utils.format_excel_util import load_clean_sheet, add_start_end_time
import pandas as pd

def download_sheet(course_teacher_name: str = None):
    try:
        excel = get_excel_file()

        # STEP 1: Month filter
        speaking_teacher_sheets = get_current_month_sheets(excel)

        # STEP 2: Extract teachers
        speaking_teachers = get_teachers_from_month(speaking_teacher_sheets)

        all_data = []

        # STEP 3: Iterate teachers
        for teacher in speaking_teachers:
            sheets = find_teacher_sheets(teacher, excel)

            for sheet in sheets:
                df = load_clean_sheet(sheet, excel)

                # STEP 4: Filter by requested teacher
                if course_teacher_name:
                    temp_df = get_teacher_schedule(course_teacher_name, df)
                else:
                    temp_df = df.copy()

                if temp_df is None or temp_df.empty:
                    continue

                # avoid pandas mutation issues
                temp_df = temp_df.copy()

                # metadata
                temp_df["SOURCE_SHEET"] = sheet
                temp_df["SPEAKING_TEACHER"] = teacher

                all_data.append(temp_df)

        # STEP 5: Final aggregation
        if not all_data:
            return {"df": []}

        final_df = pd.concat(all_data, ignore_index=True)

        # ADD YOUR FINAL TRANSFORMATION HERE
        final_df = add_start_end_time(final_df)

        return {
            "df": final_df.fillna("").to_dict(orient="records"),
        }

    except Exception as e:
        return {"error": str(e)}