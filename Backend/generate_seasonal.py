from io import BytesIO
import pandas as pd
import numpy as np
from werkzeug.datastructures import FileStorage
import re


def get_module_info(df: pd.DataFrame):
    split_arr = df.columns[1].split("\n")
    info_arr = [line.split(":") for line in split_arr]
    info_arr = [[line[0], line[1].strip()] for line in info_arr]

    return dict(info_arr)


def calculate_progression(row):
    total_credits = row['Total Credits']
    mean_mark = row['Mean Overall Course Mark']
    total_credits_below_30 = row['Total Credits < 30']
    total_credits_30_39 = row['Total Credits 30-39']
    total_pass_credits = row['Total Pass Credits']

    if total_pass_credits == 120:
        return "Progress Reg 9"

    if mean_mark > 50:
        if total_pass_credits >= 100:
            return "Progress Reg 10 b"
        elif total_pass_credits >= 90:
            if ((total_credits - total_credits_below_30) >= 110):
                return "Progress Reg 10 c"
            elif (total_credits_below_30 == 0):
                return "Progress Reg 10 a"
            else:
                return "Resit"
        elif total_credits >= 80:
            if (total_credits_below_30 == 0):
                return "Progress Reg 10 a"
            else:
                return "Resit"
        else:
            return "Resit"
    else:
        if mean_mark > 45:
            if total_pass_credits >= 90:
                if ((total_credits - total_credits_below_30) >= 110):
                    return "Progress Reg 10 c"
                elif (total_credits_below_30 == 0):
                    return "Progress Reg 10 a"
                else:
                    return "Resit"
            elif total_credits >= 80:
                if (total_credits_below_30 == 0):
                    return "Progress Reg 10 a"
                else:
                    return "Resit"
        else:
            if mean_mark > 40:
                if total_pass_credits >= 80:
                    if total_credits_below_30 == 0:
                        return "Progress Reg 10 a"
                    else:
                        return "Resit"
                else:
                    return "Resit"
            else:
                return "Resit"


# making each column for each module in the seasonal excel file along with their credits
def rename_overall_course_mark_column(df, result, credits_dict):
    column_to_replace = 'Overall Course Mark'
    # search for the column_to_replace using RegEx pattterns
    new_column_name = f"{result.group().split(' - ')[0]} ({credits_dict.get(result.group().split(' - ')[0])})"

    df.columns = df.columns.to_series().replace(
        {column_to_replace: new_column_name}).tolist()
    print(df.columns)
    return df.columns


# as mentioned before the list of files and 
# their corresponding credits is passed down 
# to this function
def generate_excel_file(files_to_merge: list[FileStorage], module_credit: list[int]):
    df_to_merge = []
    ocm_column = []
    modulename_without_credit = []
    module_info = []

    # to be added as more file merging
    current_merged_df_column = ['Student ID', "First Name",
                                "Last Name", "Career"]

    # to order the column of final excel file, similar to the end result of current_merged_df_column
    desired_column_order = ['Student ID', 'First Name', 'Last Name',
                            'Career', 'Mean Overall Course Mark', 'Total Credits', 'Total Credits < 30', 'Total Credits 30-39', 'Total Pass Credits', 'Progression']

    # list of autumn modules
    autumn_module = []
    # list of spring modules
    spring_module = []
    # RegExp pattern for scanning for tokens like COMP-1234
    pattern = r'[A-Za-z0-9]+-\d+'

    def create_credit_dict():
        '''
        create a dictionary where each module maps to the credits
        of that module
        '''
        for file in files_to_merge:
            df = pd.read_excel(file).fillna(0)
            result = re.search(pattern, get_module_info(df)["Subject"])
            modulename_without_credit.append(result.group().split(' - ')[0])
        credits_dict = dict(zip(modulename_without_credit, module_credit))
        return credits_dict

    def sort_different_sem():
        '''
        the function sorts all columns in the order of
        full year -> autumn -> spring
        '''
        for file in files_to_merge:
            df = pd.read_excel(file).fillna(0)
            module_info.append(get_module_info(df))
            result = re.search(pattern, get_module_info(df)["Subject"])

            if (get_module_info(df)["Semester"] == "Autumn Malaysia"):
                autumn_module.append(
                    f"{result.group().split(' - ')[0]} ({credits_dict.get(result.group().split(' - ')[0])})")

            else:
                spring_module.append(
                    f"{result.group().split(' - ')[0]} ({credits_dict.get(result.group().split(' - ')[0])})")
        desired_column_order.extend(autumn_module)
        desired_column_order.extend(spring_module)
        return desired_column_order

    def get_module_column_name():
        for module_code in modulename_without_credit:
            ocm_column.append(
                f"{module_code} ({credits_dict.get(module_code)})")


    def store_df_to_list():
        '''
        this function stores the Pandas Dataframes to merge into a single excel file
        '''
        # store the df to merge in a list
        iter = 0
        for file in files_to_merge:
            df = pd.read_excel(file, skiprows=3).fillna(0)
            # replace column['Overall Course Mark'] with 'Overall Course Mark ' + subjectname to avoid column name clash
            result = re.search(pattern,  module_info[iter]["Subject"])
            df.columns = rename_overall_course_mark_column(
                df, result, credits_dict)
            df_to_merge.append(df)
            iter += 1
        return df_to_merge

    def merge_all_df(df_to_merge):
        # then after that merge them by go through the list,
        # remove the file that i have merge from the list
        i = 0
        merged_df = None  # Initialize merged_df before the loop
        while len(df_to_merge) > 0:
            current_df = df_to_merge[0]
            if i == 0:
                next_df = df_to_merge[1]
                # merge the first data frame in an outer method
                # we copy the first few columns as they are about the
                # students
                merged_df = pd.merge(
                    current_df[['Student ID', "First Name",
                                "Last Name", "Career", ocm_column[i]]],
                    next_df[['Student ID', "First Name",
                            "Last Name", "Career", ocm_column[i+1]]],
                    on=['Student ID', 'First Name', 'Last Name', 'Career'],
                    how='outer',
                    suffixes=("1", " 2")
                )
                # add column name that have been merge
                current_merged_df_column.append(ocm_column[i])
                current_merged_df_column.append(ocm_column[i+1])
                i += 2
                # remove the first 2 file that have been merged
                df_to_merge = df_to_merge[2:]
            else:
                merged_df = pd.merge(
                    current_df[['Student ID', "First Name",
                                "Last Name", "Career", ocm_column[i]]],
                    merged_df[current_merged_df_column],
                    on=['Student ID', 'First Name', 'Last Name', 'Career'],
                    how='outer',
                    suffixes=(" 1", " 2")
                )
                # after append, add the new column name into the list
                current_merged_df_column.append(ocm_column[i])
                i += 1
                # remove the first file that have been merged
                df_to_merge = df_to_merge[1:]

        # Fill empty cell with -1, which means the module is not taken by the student for subsequent calculation
        merged_df = merged_df.fillna(-1)

        return merged_df

    temp_total_module_name_list = []

    def calculate_credit_distribution():
        # Initialize the columns
        merged_df['Total Credits < 30'] = 0
        merged_df['Total Credits 30-39'] = 0
        merged_df['Total Pass Credits'] = 0
        for module_code in ocm_column:
            # only for calculating the final mark purpose
            # wont appear in the excel file because not in desired column order
            extracted_code = re.search(
                r'([A-Za-z0-9]+-\d+)', module_code).group(1) if re.search(r'([A-Za-z0-9]+-\d+)', module_code) else None
            # print(extracted_code)
            merged_df['Total: ' + module_code] = merged_df[module_code] * \
                int(credits_dict.get(extracted_code))
            temp_total_module_name_list.append('Total: ' + module_code)

            merged_df['Total Credits < 30'] += np.where((merged_df[module_code] < 30) & (
                merged_df[module_code] != -1), credits_dict.get(extracted_code), 0)

            merged_df['Total Credits 30-39'] += np.where(
                (30 <= merged_df[module_code]) & (
                    merged_df[module_code] < 40) & (merged_df[module_code] != -1),
                credits_dict.get(extracted_code), 0)
            merged_df['Total Pass Credits'] += np.where(
                (merged_df[module_code] >= 40) & (merged_df[module_code] != -1), credits_dict.get(extracted_code), 0)

    def calculate_mean_column():
        merged_df['Mean Overall Course Mark'] = 0
        for module_code in ocm_column:
            # only for calculating the final mark purpose
            # won't appear in the excel file because not in desired column order
            extracted_code = re.search(
                r'([A-Za-z0-9]+-\d+)', module_code).group(1) if re.search(r'([A-Za-z0-9]+-\d+)', module_code) else None
            # print(extracted_code)

            # Calculate total credits, skipping cells with value -1
            merged_df['Mean Overall Course Mark'] += np.where(
                (merged_df[module_code] != -1), merged_df[module_code] * credits_dict.get(extracted_code), 0)

        # Calculate mean by dividing by total credits
        merged_df['Mean Overall Course Mark'] /= merged_df['Total Credits']
        merged_df['Mean Overall Course Mark'] = round(
            merged_df['Mean Overall Course Mark'], 2)

    def calculate_TotalCredit_column():
        # merged_df['Total Credits'] = sum(module_credit)
        merged_df['Total Credits'] = 0
        for module_code in ocm_column:
            # only for calculating the final mark purpose
            # won't appear in the excel file because not in desired column order
            extracted_code = re.search(
                r'([A-Za-z0-9]+-\d+)', module_code).group(1) if re.search(r'([A-Za-z0-9]+-\d+)', module_code) else None
            # print(extracted_code)
            # Calculate total credits, skipping cells with value -1
            merged_df['Total Credits'] += np.where(
                (merged_df[module_code] != -1), credits_dict.get(extracted_code), 0)

    def sort_all_column(desired_column_order, merged_df):
        # Sort the column in a predefined order using the header for each column
        return merged_df[desired_column_order]

    def convert_minus1_to_NE():
        # Replace all occurrences of -1 with "N/E"
        merged_df.replace(-1, "N/E", inplace=True)

    def sort_all_column(desired_column_order, merged_df):
        # Sort the column in a predefined order using the header for each column
        return merged_df[desired_column_order]

    # create a dictionary for easy credit reading for each module
    credits_dict = create_credit_dict()
    desired_column_order = sort_different_sem()
    get_module_column_name()
    # get all pandas Dataframes and store them in a list
    df_to_merge = store_df_to_list()
    # merge all the pandas Dataframes to a single one
    merged_df = merge_all_df(df_to_merge)
    # on the merged Dataframe, calculate the credits for each course
    calculate_credit_distribution()
    # also figure out whther the student has completed the required number of credits for that year
    calculate_TotalCredit_column()
    # finally, as a helpful statistic, calculate the mean of the section
    calculate_mean_column()

    # Determine the seasonal excel file type by checking is there have both autumn and spring module
    course_type = "full_year" if len(autumn_module) != 0 and len(
        spring_module) != 0 else "autumn/spring"
    
    # If course_type is full year, means there will have a  progression column
    if course_type == "full_year":
        # Initialise Progression Column
        merged_df['Progression'] = None
        for index, row in merged_df.iterrows():

            if row["Total Credits"] >= 120:
                # Set that particular cell value as the result of applying calculate_progression
                merged_df.at[index, 'Progression'] = calculate_progression(row)
            else:
                # Set that particular cell value as "Not Available"
                merged_df.at[index, 'Progression'] = "Not Available"

    # If course_type is not full year, means there won't have a progression column
    else:
        desired_column_order.remove("Progression")

    # sometimes in calculations, pandas leaves out  a -1 for students who have not enrolled
    # for results, we convert these values to Not Enrolled (N/E)
    convert_minus1_to_NE()
    # sort the dataframe to have columns in the desired order
    merged_df = sort_all_column(desired_column_order, merged_df)

    # Return the seasonal excel file
    # dataframe to sent as an excel file in the response
    return merged_df
