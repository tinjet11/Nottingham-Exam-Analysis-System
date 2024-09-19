import pandas as pd
import numpy as np


# get columns of OCM file
def get_columns(df: pd.DataFrame):
    return df.loc[2].to_list()


# cumulative stats for OCM file
def stats_for_each_file(df: pd.DataFrame):
    labels = ['0-39', '40-49', '50-59', '60-69', '70-100']
    custom_bins = [0, 39, 49, 59, 69, 100]

    arr = []
    for col in df.columns[4:]:
        df = df.fillna(0)
        cl = pd.cut(df[col], bins=custom_bins,
                    labels=labels, include_lowest=True)
        # Calculate statistics for the current column
        mean = round(np.mean(df[col]), 2)
        median = round(np.median(df[col]), 2)
        # Mode calculation
        mode = round(float(pd.Series(df[col]).mode().iloc[0]), 2)
        std_dev = round(np.std(df[col]), 2)
        variance = round(np.var(df[col]), 2)
        stats = {
            "mean": mean,
            "median": median,
            "mode": mode,
            "standard_deviation": std_dev,
            "variance": variance,  
        }
        print(cl.value_counts().values)
        j = {
            "exam_title": col,
            "mark": np.array(cl.value_counts().sort_index().values, dtype="int").tolist(),
            "range": labels,
            "statistics": stats
        }
        arr.append(j)
    
    return arr
