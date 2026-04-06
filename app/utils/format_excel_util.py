
from app.repositories.excel_repository import get_excel_file


import pandas as pd

from app.utils.date_utils import fix_speaking_hours_column

def load_clean_sheet(sheet_name: str, excel):
    raw_df = pd.read_excel(excel, sheet_name=sheet_name, header=None)

    header_row = find_header_row(raw_df)

    if header_row is None:
        raise Exception("Header row not found")

    df = pd.read_excel(
        excel,
        sheet_name=sheet_name,
        header=header_row,
        converters={"SPEAKING HOURS": str}
    )

    # Clean column names FIRST
    df.columns = (
        df.columns
        .astype(str)
        .str.replace("\n", " ")
        .str.strip()
        .str.upper()
    )

    section_map = detect_sections(raw_df, header_row)

    # df index starts at 0 → raw_df index starts at header_row+1
    raw_indices = list(range(header_row + 1, header_row + 1 + len(df)))

    periods = []
    day_types = []

    for idx in raw_indices:
        if idx in section_map:
            periods.append(section_map[idx]["PERIOD"])
            day_types.append(section_map[idx]["DAY_TYPE"])
        else:
            # fallback (important!)
            periods.append("AM")
            day_types.append("WEEKDAY")

    df["PERIOD"] = periods
    df["DAY_TYPE"] = day_types

    # fix times
    df = fix_speaking_hours_column(df)

    # drop junk columns
    df = df.loc[:, ~df.columns.str.contains("^UNNAMED", case=False)]

    # forward fill
    for col in ["TEACHER", "CLASS"]:
        if col in df.columns:
            df[col] = df[col].ffill()

    return df

def find_header_row(df):
    for i, row in df.iterrows():
        row_values = [str(cell).upper() for cell in row.tolist()]

        if any("TEACHER" in cell for cell in row_values) and \
           any("DATE" in cell for cell in row_values):
            return i

    return None


def detect_sections(raw_df, header_row):
    section_map = {}

    current_period = "AM"
    current_day = "MORNING"

    for i, row in raw_df.iterrows():
        

        row_text = " ".join([str(cell).upper() for cell in row if pd.notna(cell)])

        if "AFTERNOON" in row_text:
            current_period = "PM"
            current_day = "AFTERNOON"
            continue

        if "SATURDAY" in row_text:
            current_day = "SATURDAY"
            current_period = "AM"
            continue

        if "NIGHT" in row_text:
            current_period = "PM"
            current_day = "NIGHT"
            continue

        if i <= header_row:
            continue
        # assign context to THIS row index
        section_map[i] = {
            "PERIOD": current_period,
            "DAY_TYPE": current_day
        }

    return section_map

def add_start_end_time(df):
    import pandas as pd

    def parse_row(row):
        val = row["SPEAKING HOURS"]
        period = row["PERIOD"]

        if pd.isna(val) or "-" not in val:
            return pd.Series([None, None])

        try:
            start_str, end_str = val.split("-")

            h1, m1 = map(int, start_str.split(":"))
            h2, m2 = map(int, end_str.split(":"))

            # apply PM logic
            if period == "PM":
                if h1 < 12:
                    h1 += 12
                if h2 < 12:
                    h2 += 12

            start = f"{h1:02d}:{m1:02d}"
            end = f"{h2:02d}:{m2:02d}"

            return pd.Series([start, end])

        except:
            return pd.Series([None, None])

    df[["START TIME", "END TIME"]] = df.apply(parse_row, axis=1)

    return df