
from app.repositories.excel_repository import get_excel_file


import pandas as pd

from app.utils.date_utils import fix_speaking_hours_column

def load_clean_sheet(sheet_name: str, excel):
    raw_df = pd.read_excel(excel, sheet_name=sheet_name, header=None)
    
    # Get worksheet for color detection
    try:
        workbook = excel.book
        worksheet = workbook[sheet_name]
    except Exception as e:
        print(f"Warning: Could not load worksheet for color detection: {e}")
        worksheet = None
    
    header_row = find_header_row(raw_df)
    
    if header_row is None:
        raise Exception("Header row not found")
    
    df = pd.read_excel(
        excel,
        sheet_name=sheet_name,
        header=header_row,
        converters={"SPEAKING HOURS": str}
    )
    
    # Clean column names
    df.columns = (
        df.columns
        .astype(str)
        .str.replace("\n", " ")
        .str.strip()
        .str.upper()
    )
    
    # Detect sections with worksheet for colored dividers
    section_map = detect_sections(raw_df, header_row, worksheet)
    
    # Map sections to rows
    raw_indices = list(range(header_row + 1, header_row + 1 + len(df)))
    
    periods = []
    day_types = []
    
    for idx in raw_indices:
        if idx in section_map:
            periods.append(section_map[idx]["PERIOD"])
            day_types.append(section_map[idx]["DAY_TYPE"])
        else:
            # Fallback - if row not in section_map, use previous section
            # or default to AM/WEEKDAY
            if periods:
                periods.append(periods[-1])
                day_types.append(day_types[-1])
            else:
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


def is_colored_divider(worksheet, row_number):
    """Check if a row is a colored divider (no text, has background color)"""
    try:
        for cell in worksheet[row_number]:
            # Ignore cells with text/value
            if cell.value is not None:
                continue
            
            # Check if cell has fill
            if cell.fill is None:
                continue
                
            fill = cell.fill
            
            # Skip if no fill type
            if fill.fill_type is None:
                continue
            
            # Check for color
            color = fill.fgColor
            
            # RGB color
            if hasattr(color, 'type') and color.type == "rgb" and color.rgb:
                rgb = color.rgb[-6:].upper()
                # If it's not white or black, it's a colored divider
                if rgb not in {"FFFFFF", "000000"}:
                    return True
                    
            # Theme color (some Excel files use theme colors)
            if hasattr(color, 'theme') and color.theme is not None:
                # Theme colors usually indicate formatting
                return True
                
    except Exception as e:
        # If there's any error, assume it's not a divider
        print(f"  Error checking colored divider at row {row_number}: {e}")
        return False
    
    return False

def detect_sections(raw_df, header_row, worksheet=None):
    """
    Detect sections (MORNING, AFTERNOON, SATURDAY, NIGHT) in the Excel sheet.
    If worksheet is provided, also check for colored dividers.
    """
    section_map = {}
    
    # Define sections in order they appear
    sections = [
        ("AM", "MORNING"),
        ("PM", "AFTERNOON"),
        ("AM", "SATURDAY"),
        ("PM", "NIGHT"),
    ]
    
    section_index = 0
    current_period, current_day = sections[section_index]
    
    # Track if we've seen actual data rows
    saw_data_after_section = False
    last_section_row = -1
    
    for i, row in raw_df.iterrows():
        # Combine all cell values into a single string for text detection
        row_text = " ".join(
            str(cell).upper() 
            for cell in row 
            if pd.notna(cell) and str(cell).strip()
        ).strip()
        
        # Check for section headers by text
        if "MORNING" in row_text:
            section_index = 0
            current_period, current_day = sections[section_index]
            last_section_row = i
            saw_data_after_section = False
            continue
            
        if "AFTERNOON" in row_text:
            section_index = 1
            current_period, current_day = sections[section_index]
            last_section_row = i
            saw_data_after_section = False
            continue
            
        if "SATURDAY" in row_text:
            section_index = 2
            current_period, current_day = sections[section_index]
            last_section_row = i
            saw_data_after_section = False
            continue
            
        if "NIGHT" in row_text:
            section_index = 3
            current_period, current_day = sections[section_index]
            last_section_row = i
            saw_data_after_section = False
            continue
        
        # Skip rows before or at header
        if i <= header_row:
            continue
        
        # Check if this is a colored divider (empty row with color)
        if worksheet and not row_text:
            is_divider = is_colored_divider(worksheet, i + 1)  # +1 because Excel is 1-indexed
            
            if is_divider:
                # If we've seen data after the last section, this divider marks the end
                # Move to next section
                if saw_data_after_section and section_index < len(sections) - 1:
                    section_index += 1
                    current_period, current_day = sections[section_index]
                    saw_data_after_section = False
                    last_section_row = i
                continue
        
        # If we got here, this row has data or is an empty row without color
        # Check if it's an empty row (no text)
        if not row_text:
            # If we've seen data, this empty row might be the end of the section
            if saw_data_after_section:
                # Don't change section, but mark that we're in a gap
                pass
            continue
        
        # This row has data
        saw_data_after_section = True
        
        # Assign current section to this row
        section_map[i] = {
            "PERIOD": current_period,
            "DAY_TYPE": current_day
        }
    
    return section_map
def add_start_end_time(df):
    import pandas as pd

    def parse_time_part(part):
        part = str(part).strip()

        # 🔥 normalize dot format (8.30 → 8:30)
        part = part.replace(".", ":")

        # if only hour like "8"
        if ":" not in part:
            return int(part), 0

        h, m = part.split(":")
        return int(h.strip()), int(m.strip())

    def parse_row(row):
        val = row["SPEAKING HOURS"]
        period = str(row["PERIOD"]).upper()

        if pd.isna(val) or "-" not in str(val):
            return pd.Series([None, None])

        try:
            start_str, end_str = str(val).split("-")

            h1, m1 = parse_time_part(start_str)
            h2, m2 = parse_time_part(end_str)

            # PM logic
            if period == "PM":
                if h1 < 12:
                    h1 += 12
                if h2 < 12:
                    h2 += 12

            start = f"{h1:02d}:{m1:02d}"
            end = f"{h2:02d}:{m2:02d}"

            return pd.Series([start, end])

        except Exception as e:
            print("❌ TIME PARSE ERROR:", val, "|", e)
            return pd.Series([None, None])

    df[["START TIME", "END TIME"]] = df.apply(parse_row, axis=1)

    return df