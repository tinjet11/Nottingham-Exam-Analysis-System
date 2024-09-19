import pandas as pd
import numpy as np
from werkzeug.datastructures import FileStorage


def analyze_seasonal(file: FileStorage) -> dict:

    # Read the Excel file into a DataFrame without a header
    df = pd.read_excel(file, header=0)

    def get_stats_list():
        stats_list = []
        # Assume is full year
        index = 10
        if (check_progression_exists()):
            index = 10
        else:
            # if progression not exists then need to subtract by one column
            index = 9

        
        for i in range(index, df.shape[1]):
            # getting the columns for each module
            # and filtering not enrolled values at the same time
            x = df.iloc[:, i]
            x = x[x != "N/E"]
            x_numeric = pd.to_numeric(x, errors='coerce')

            mean_value = x_numeric.mean()
            median_value = x_numeric.median()
            mode_value = x_numeric.mode().values.tolist(
            )[0] if not x_numeric.empty and not x_numeric.mode().empty else np.nan
            std_value = x_numeric.std()
            var_value = x_numeric.var()

            max_marks = "N/A" if pd.isna(x_numeric.max()) else int(x_numeric.max())
            min_marks = "N/A" if pd.isna(x_numeric.min()) else int(x_numeric.min())
            total_student = x_numeric.count()

            # Check if any of the statistics are NaN and convert them to 0
            if pd.isna(mean_value):
                mean_value = "N/A"
            if pd.isna(median_value):
                median_value = "N/A"
            if pd.isna(mode_value):
                mode_value = "N/A"
            if pd.isna(std_value):
                std_value = "N/A"
            if pd.isna(var_value):
                var_value = "N/A"

            stats = {
            "name": df.columns[i],
            "total_student": int(total_student) if is_numeric(total_student) else total_student,
            "mean": round(float(mean_value), 2) if is_numeric(mean_value) else mean_value,
            "median": round(float(median_value), 2) if is_numeric(median_value) else median_value,
            "mode": round(float(mode_value), 2) if is_numeric(mode_value) else mode_value,
            "standard_deviation": round(float(std_value), 2) if is_numeric(std_value) else std_value,
            "variance": round(float(var_value), 2) if is_numeric(var_value) else var_value,
            "max_score": int(max_marks) if is_numeric(max_marks) else max_marks,
            "min_score": int(min_marks) if is_numeric(min_marks) else min_marks
            }

            stats_list.append(stats)

        return stats_list
    
    def is_numeric(value):
        return np.issubdtype(type(value), np.number)

    def check_progression_exists():
        header = df.columns[9]
        # FUTURE: Need to change if the naming in seasonal excel file change
        if (header == "Progression"):
            return True
        else:
            return False

    def get_progression_data():

        progression_column = df.iloc[:, 9]
        print(progression_column)

        # Calculate the occurrence of values in the column
        progression = progression_column.value_counts()

        print(progression)

        # Convert the result to a dictionary
        progression_dict = progression.to_dict()

        # Define the keys you're interested in
        keys = [
            "Not Available",
            "Progress Reg 9",
            "Progress Reg 10 b",
            "Progress Reg 10 c",
            "Progress Reg 10 a",
            "Resit"
        ]

        # Create the final progression dictionary with default value of 0 if key is not found
        progression_result = {
            key: progression_dict.get(key, 0) for key in keys}
        return progression_result

    def get_all_data():
        keys = [
            "Not Available",
            "Progress Reg 9",
            "Progress Reg 10 b",
            "Progress Reg 10 c",
            "Progress Reg 10 a",
            "Resit"
        ]
        all_data = []
        for key in keys:
            resit_indices = df.index[df['Progression'] == key].tolist()
            for i in resit_indices:
                # Select only the first 11 columns for student data
                resit_data = df.iloc[i, :10].to_dict()
                module_data = df.iloc[i, 10:].fillna(0)

                # Only select rows where module_data is not "N/E"
                module_data = module_data[module_data != "N/E"].to_dict()

                all_data.append(
                    {"title": key, "resit_data": resit_data, "module_data": module_data})

        return all_data

    def get_all_data_without_progression():
        all_data = []
        
        # Iterate through each row in the DataFrame
        for i in range(len(df)):
            # Extract resit_data for each row (assuming first 10 columns)
            resit_data = df.iloc[i, :9].to_dict()

            # Extract module data for each row (assuming module data starts from column 11)
            module_data = df.iloc[i, 9:].fillna(0)
            # Filter out "N/E" values in module_data
            module_data = module_data[module_data != "N/E"].to_dict()

            all_data.append({
                "resit_data": resit_data,
                "module_data": module_data
            })

        return all_data


    stats_list = get_stats_list()

    if (check_progression_exists()):
        progression_result = get_progression_data()
        all_data = get_all_data()
    else:
        progression_result = {}
        print(get_all_data_without_progression())
        all_data = get_all_data_without_progression()

    to_send = {
        "stats": stats_list,
        "progression": progression_result,
        "all": all_data,
    }

    return to_send
