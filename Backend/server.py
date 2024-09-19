import numpy as np
import openpyxl as xl
import pandas as pd
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from io import BytesIO
import json
import os
import re
from werkzeug.datastructures import FileStorage
from openpyxl import Workbook
from openpyxl.utils.dataframe import dataframe_to_rows

from analyze_ocm import stats_for_each_file, get_columns
from generate_seasonal import get_module_info, generate_excel_file
from analyze_ser import analyze_seasonal


app = Flask(__name__)
CORS(app)



    
# Define a function to check if the Excel file follows a certain format of OCM
def is_module_same(module_name_list):
    # Extract the "COMP-XXXX" part for each string
    module_name = [s.split(' - ')[0] for s in module_name_list]
    
    # Check if all "COMP-XXXX" parts are the same
    return all(name == module_name[0] for name in module_name)

# Define a function to check if the Excel file follows a certain format of OCM
def is_valid_excel(df):
    subject_regex = r"Subject: .+"
    title_regex = r"Title: .+"
    term_regex = r"Term: \d{4} Academic Year"
    semester_regex = r"Semester: .+"

    # Combine all regex patterns
    regex_pattern = f"{subject_regex}\n{title_regex}\n{term_regex}\n{semester_regex}"

    # Compile the regex pattern
    pattern = re.compile(regex_pattern)

    cell_value = df.columns[1]  # First row (0) and second column (1)
    print(cell_value)
    if not pattern.match(str(cell_value)):
        return False

    # Additional validation checks can be added here as needed
    return True

# Define a function to check if the Excel file follows a certain format of OCM
def is_valid_seasonal_excel(df):
    expected_columns = [
    'Student ID',
    'First Name',
    'Last Name',
    'Career',
    'Mean Overall Course Mark',
    'Total Credits',
    'Total Credits < 30',
    'Total Credits 30-39',
    'Total Pass Credits'
    ]
    
    first_9_columns = df.iloc[:, :9]
    print(first_9_columns.columns)

    # Check if column names match
    if list(first_9_columns.columns) == expected_columns:
        return True
    else:
        return False

@app.post("/api/analyzeOcm")
def analyze_ocm_file():

    try:
        if len(request.files) == 0:
            return jsonify({"error": "No files provided"})
        to_send = {"data": []}
        for _, file in request.files.items():
            df = pd.read_excel(file)

            is_valid = is_valid_excel(df)
            if not is_valid:
                return jsonify({"error": "The input file : "+ file.filename + " is not ocm"}), 400

            df.dropna()
            df.columns = get_columns(df)
            df = df.loc[3:]

            # for col in df.columns[4:]:
            stats_from_file = stats_for_each_file(df)
            to_send["data"].append(stats_from_file)

        return jsonify(to_send)
    except Exception as e:
         error_message = str(e)
         return jsonify({"error": error_message}), 400


@app.post("/api/year-over-year")
def yearoveryear():
    try:
        if len(request.files) == 0:
            return jsonify({"error": "No files provided"})
        module_name = []
        to_send = {"data": []}
        
        for _, file in request.files.items():
            df = pd.read_excel(file)
            split_arr = df.columns[1].split("\n")
            info_arr = [line.split(":") for line in split_arr]
            info_arr = [[line[0], line[1].strip()] for line in info_arr]
            module_name.append(dict(info_arr)["Subject"])
            
        if not is_module_same(module_name):
            return jsonify({"error": "The input file is not from the same module"}), 400
        
        print(module_name)
        for _, file in request.files.items():
            df = pd.read_excel(file)

            is_valid = is_valid_excel(df)
            if not is_valid:
                return jsonify({"error": "The input file : "+ file.filename + " is not ocm"}), 400
            
            print(get_columns(df))
            df.dropna()
            df.columns = get_columns(df)
            df = df.loc[3:]

            # for col in df.columns[4:]:
            stats_from_file = stats_for_each_file(df)
            to_send["data"].append(stats_from_file)

        return jsonify(to_send)
    except Exception as e:
         error_message = str(e)
         return jsonify({"error": error_message}), 400
    

def convert_df_to_excel(merged_df: pd.DataFrame):
    '''
    function helping to convert a pandas dataframe to an excel file
    '''
    # convert the df to excel file
    excel_buffer = BytesIO()
    merged_df.to_excel(excel_buffer, index=False)
    excel_buffer.seek(0)  # Move the cursor to the beginning of the buffer
    return excel_buffer



@app.post("/api/beforeGenerateSeasonalExcelFile")
def filter():
    '''
    route handler to check whether or not the files to generate the seasonal file
    are OCM format or not
    '''
    for _, file in request.files.items():
        df = pd.read_excel(file)
        is_valid = is_valid_excel(df)
        if not is_valid:
            return jsonify({"error": "The input file : "+ file.filename + " is not ocm"}), 400
    return jsonify({"data": "Filter pass"}), 200


# The client is supposed to send multiple OCM files
# as a POST request, along with their credit information
# we send some data as well produce the file which can be
# downloaded later by the client
@app.post("/api/generateSeasonalExcelFile")
def generate_seasonal_file():

    # of course, we respond with an error to the client if
    # there are no files given
    if len(request.files) == 0:
        return jsonify({"error": "no files given"})

    # we now pass in the list of files and corresponding credits
    # to another function which will be explained below
    seasonal = generate_excel_file(
        [f for _, f in request.files.items()],  # list of files
        [int(c) for _, c in request.form.items()]  # list of credits given
    )
    # If Total Credits check passes, continue to generate the Excel file
    excel_buf = None  # Initialize excel_buf

    # Check if seasonal is not empty before generating Excel
    if not seasonal.empty:
        excel_buf = convert_df_to_excel(seasonal)
    else:
        return jsonify({"error": "DataFrame is empty. Cannot generate Excel file"}), 400

    # server sends the file as downloadable content if the file was converted successfully
    if excel_buf is not None:
        return send_file(
            excel_buf,
            as_attachment=True,
            download_name='merged_file_final.xlsx',
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    else:
        return jsonify({"error": "Failed to generate Excel file"}), 500

# route handler for the analysis of seasonal excel file
# client sends a POST request containing the seasonal excel file
# server responds with information and statistics
@app.post("/api/analyzeSer")
def analyze_ser():
    if len(request.files) == 0:
        return jsonify({"error": "No files provided"})

    # only one seasonal file allowed for analysis per request
    if len(request.files) > 1:
        return jsonify({"error": "only one seasonal file needed"})
    
    # check whether the file is a seasonal file or not
    for _, file in request.files.items():
        df = pd.read_excel(file)
        is_valid = is_valid_seasonal_excel(df)
        if not is_valid:
            return jsonify({"error": "The input file : "+ file.filename + " is not a valid seasonal excel file"}), 400

    # analysis done in this function
    analysis = analyze_seasonal([f for _, f in request.files.items()][0])
    return jsonify(analysis)


@app.post("/api/module-info-excel-file")
def module_info_excel():
    rcvd = request.json
    df = pd.DataFrame(rcvd)
    col_order = ["name", "mean", "median", "variance",
                 "standard_deviation", "total_student", "max_score", "min_score"]
    df = df[col_order]
    print(df)
    df.to_excel("module_info.xlsx")
    with open("module_info.xlsx", "rb") as ef:
        ebytes = ef.read()
    os.remove("module_info.xlsx")
    return send_file(BytesIO(ebytes), mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", as_attachment=True, download_name="module_info.xlsx")


def check_progression_exists(df):
    # Assume progression column is at column 9
    # FUTURE: Need to change if the naming in seasonal excel file change
    header = df.columns[9]
    if (header == "Progression"):
        return True
    else:
        return False
    
@app.post("/api/resit-listing-excel-file")
def resit_listing():

    df = pd.read_excel([f for _, f in request.files.items()][0], header=0)

    if check_progression_exists(df):
        # Extracting students who need to resit with their failed modules (below 40)
        progression_column = df.iloc[:, 9]
        resit_students = df[progression_column == "Resit"]
        # Convert failed module columns to numeric (excluding non-numeric values like "N/E")
        failed_modules = resit_students.iloc[:, 10:].apply(
            pd.to_numeric, errors='coerce')

        # Filter failed modules less than 40
        failed_modules_below_40 = failed_modules[failed_modules < 40]

        # Get columns where values are less than 40
        columns_below_40 = failed_modules_below_40.dropna(
            axis=1, how='all').columns

        # Melt the DataFrame to create separate rows for each failed module
        melted = pd.melt(resit_students, id_vars=["Student ID", "First Name", "Last Name", "Progression"],
                        value_vars=columns_below_40, var_name="Course Code", value_name="Mark")

        # Filter out rows with "N/E" in "Mark" (since they are not actual failures)
        melted = melted[melted["Mark"].notnull()]

        filtered_resits = melted[(melted["Mark"] < 40) & (melted["Progression"] == "Resit")]


        # Selecting required columns

        result = filtered_resits[["Student ID", "First Name",
                        "Last Name", "Course Code", "Mark"]]
        result = result.sort_values(by=["First Name", "Last Name"])

        # Create an in-memory Excel file
        excel_output = BytesIO()

        # Write DataFrame to Excel
        with pd.ExcelWriter(excel_output, engine='openpyxl') as writer:
            result.to_excel(writer, index=False, sheet_name='Failed_Students')
        excel_output.seek(0)

        # Send the Excel file to the frontend for download
        return send_file(
            excel_output,
            as_attachment=True,
            download_name="failed_students.xlsx",
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    else:
        return jsonify({"error": "No progression Column in the file"}), 400


@app.post('/api/extract-creditList')
def extract_credit():
        try:
            # Read the Excel file into a Pandas DataFrame
            df = pd.read_excel([f for _, f in request.files.items()][0])
            
            # Check if "Module Name" and "Credit" columns exist
            if 'Module Name' not in df.columns or 'Credit' not in df.columns:
                return jsonify({'error': 'Missing columns. Please ensure "Module Name" and "Credit" columns exist.'})

            # Check if any rows have missing values in "Module Name" or "Credit" columns
            if df['Module Name'].isnull().any() or df['Credit'].isnull().any():
                return jsonify({'error': 'Some rows have missing values in "Module Name" or "Credit" columns.'})

            # Convert "Module Name" and "Credit" columns to lists
            modulename = df["Module Name"].tolist()
            credit = df["Credit"].tolist()

            # Combine into a list of dictionaries
            data = [{'name': name, 'credit': cred} for name, cred in zip(modulename, credit)]

            return jsonify({'data': data})
        except Exception as e:
            print(e)
            return jsonify({'error': str(e)})

if __name__ == "__main__":
    app.run(debug=True, port=3001)

