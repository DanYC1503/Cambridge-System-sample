from datetime import datetime
import pandas as pd
import re
MONTHS_ES = {
    1: "ENERO",
    2: "FEBRERO",
    3: "MARZO",
    4: "ABRIL",
    5: "MAYO",
    6: "JUNIO",
    7: "JULIO",
    8: "AGOSTO",
    9: "SEPTIEMBRE",
    10: "OCTUBRE",
    11: "NOVIEMBRE",
    12: "DICIEMBRE"
}

def normalize_date_value(value):
    if pd.isna(value):
        return None

    value = str(value).strip()

    # Remove garbage time-only values
    if value == "00:00:00":
        return None

    # If it's already correct format like 2/4 → keep
    if "/" in value and len(value) <= 5:
        return value

    # If it's a full datetime like 2026-04-02
    try:
        parsed = pd.to_datetime(value, errors="coerce")
        if pd.notna(parsed):
            return f"{parsed.day}/{parsed.month}"
    except:
        pass

    return value  # fallback

def get_current_month_name():
    month_num = datetime.now().month
    return MONTHS_ES[month_num]

def split_speaking_dates(df):
    df = df.copy()

    # normalize first
    df["SPEAKING DATE"] = df["SPEAKING DATE"].apply(normalize_date_value)

    # drop invalid rows
    df = df[df["SPEAKING DATE"].notna()]

    # split safely
    df["SPEAKING DATE"] = (
        df["SPEAKING DATE"]
        .astype(str)
        .str.replace("\n", " ")
        .str.split()
    )

    # explode
    df = df.explode("SPEAKING DATE")

    # clean again
    df["SPEAKING DATE"] = df["SPEAKING DATE"].str.strip()

    # remove garbage again (safety)
    df = df[df["SPEAKING DATE"] != "00:00:00"]

    return df

def fix_speaking_hours_column(df):
    if "SPEAKING HOURS" not in df.columns:
        return df

    import pandas as pd
    import re

    def fix_value(val):
        if pd.isna(val):
            return None

        val_str = str(val).strip()

        # normalize dashes
        val_str = val_str.replace("\u2013", "-").replace("\u2014", "-")

        # -------------------------
        # CASE 1: already correct
        # -------------------------
        if re.match(r"^\d{1,2}:\d{2}-\d{1,2}:\d{2}$", val_str):
            return val_str

        # -------------------------
        # CASE 2: simple "5-6"
        # -------------------------
        if re.match(r"^\d{1,2}-\d{1,2}$", val_str):
            start, end = val_str.split("-")
            return f"{int(start)}:00-{int(end)}:00"

        # -------------------------
        # CASE 3: Excel-corrupted datetime
        # -------------------------
        if "00:00:00" in val_str:
            dt = pd.to_datetime(val_str, errors="coerce")

            if pd.notna(dt):
                start = dt.day
                end = dt.month

                # sanity check (avoid weird dates)
                if 1 <= start <= 12 and 1 <= end <= 12:
                    return f"{start}:00-{end}:00"

        # -------------------------
        # fallback
        # -------------------------
        return val_str

    df.loc[:, "SPEAKING HOURS"] = df["SPEAKING HOURS"].apply(fix_value)

    return df

def extract_year_from_sheet(excel_sheet, sheet_name):
    """
    Try to extract the year from a cell containing 'HOURS [TEACHER NAME] month year'
    Returns the year as string or None if not found
    """
    try:
        # Read the first few rows to find the HOURS cell
        df = pd.read_excel(excel_sheet, sheet_name=sheet_name, header=None, nrows=10)
        
        # Search through the first 10 rows and first 10 columns for the pattern
        for i in range(min(10, len(df))):
            for j in range(min(10, len(df.columns))):
                cell_value = str(df.iloc[i, j]).strip()
                
                # Look for "HOURS" pattern (case insensitive)
                if "HOURS" in cell_value.upper():
                    # Use regex to find a 4-digit year in the cell
                    year_match = re.search(r'\b(20\d{2})\b', cell_value)
                    if year_match:
                        year = year_match.group(1)
                        print(f"Found year '{year}' in cell: '{cell_value}'")
                        return year
                    
                    # Also try to find any 4-digit number that could be a year
                    year_match = re.search(r'\b(\d{4})\b', cell_value)
                    if year_match:
                        year = year_match.group(1)
                        print(f"Found year '{year}' in cell: '{cell_value}'")
                        return year
                        
        return None
    except Exception as e:
        print(f"Error extracting year from sheet '{sheet_name}': {e}")
        return None