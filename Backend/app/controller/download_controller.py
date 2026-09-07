from functools import cache

from app.exceptions.app_exceptions import AppException, InvalidFormException
from app.services.sheet_format_service import get_current_month_sheets
from app.services.teacher_service import find_teacher_sheets, get_teacher_schedule, get_teachers_from_month
from app.repositories.excel_repository import get_excel_file
from app.utils.format_excel_util import load_clean_sheet, add_start_end_time
import pandas as pd
def download_sheet(course_teacher_name: str = None):
    try:
        excel = get_excel_file()

        speaking_teacher_sheets = get_current_month_sheets(excel)

        speaking_teachers = get_teachers_from_month(
            speaking_teacher_sheets
        )

        all_data = []

        for teacher in speaking_teachers:
            sheets = find_teacher_sheets(teacher, excel)
            for sheet in sheets:
                df = load_clean_sheet(sheet, excel)

                if df is None:
                    continue


                if course_teacher_name:
                    temp_df = get_teacher_schedule(
                        course_teacher_name,
                        df
                    )
                else:
                    temp_df = df.copy()

                if temp_df is None or temp_df.empty:
                    print(f"No data for teacher in sheet: {sheet}")
                    continue
                temp_df = temp_df.copy()
                temp_df["SOURCE_SHEET"] = sheet
                temp_df["SPEAKING_TEACHER"] = teacher

                all_data.append(temp_df)

        if not all_data:
            print("No data found for any teacher")
            return {"df": []}

        final_df = pd.concat(
            all_data,
            ignore_index=True
        )

        final_df = add_start_end_time(final_df)

        result = final_df.fillna("").to_dict(
            orient="records"
        )
        print(f"Returning {len(result)} records")

        return {
            "df": result,
        }

    except FileNotFoundError:
        raise AppException(
            "The Excel file could not be found.",
            404
        )

    except ValueError as e:
        raise InvalidFormException(str(e))

    except Exception as e:
        import traceback
        traceback.print_exc()

        raise AppException(
            "Failed to retrieve speaking schedule.",
            500
        )
        