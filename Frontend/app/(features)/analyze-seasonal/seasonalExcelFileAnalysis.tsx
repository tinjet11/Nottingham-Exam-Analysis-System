"use client";

import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { v4 as uuidv4 } from "uuid";
import {
    Chart as Chartjs,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
    ArcElement,
} from "chart.js";
import { Bar as BarChart } from "react-chartjs-2";

Chartjs.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

import axios, { AxiosResponse } from "axios";
import { X as CancelIcon, Plus as AddIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";

import toast, { Toaster } from "react-hot-toast";
import AllStudentComponent from "./student-table/client";
import { AllStudentColumn } from "./student-table/column";
import ModuleStatsComponent from "./module-stats/client";
import { saveAs } from "file-saver";
import { error } from "console";


interface info {
    id: string;
    file: File;
    credit: number;
}

interface ModuleData {
    [moduleCode: string]: number; // Key-value pairs where key is module code and value is mark
}

export type GeneralData = {
    Career: string;
    'First Name': string;
    'Last Name': string;
    'Mean Overall Course Mark': number;
    Progression: string;
    'Student ID': number;
    'Total Credits': number;
    'Total Credits 30-39': number;
    'Total Credits < 30': number;
    'Total Pass Credits': number;
}


export type AllData = {
    title: string,
    module_data: ModuleData;
    resit_data: GeneralData;
}


interface Stats {
    mean: number;
    median: number;
    mode: number;
    name: string;
    standard_deviation: number;
    variance: number;
    total_student: number;
    max_score: number;
    min_score: number;
}

interface Progression {
    "Not Available": number,
    ProgressReg9: number,
    ProgressReg10b: number,
    ProgressReg10c: number,
    ProgressReg10a: number,
    Resit: number,
}



interface Data {
    stats: Stats[];
    progression: Progression,
    all: AllData[],
}

interface Props {
    seasonalExcelFile?: Blob;
}

const SeasonalExcelFileAnalysis = ({ seasonalExcelFile }: Props) => {
    const [returnData, setReturnData] = useState<Data>();
    const [dataLoaded, setDataLoaded] = useState(false);
    const [filesToSend, setFilesToSend] = useState<info[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<FormData>();
    const [progressionView, setProgressionView] = useState<string>("");

    const getResitListingExcelFile = () => {
        axios.post(`http://localhost:3001/api/resit-listing-excel-file`, formData, {
            responseType: 'blob', // Receive response as a Blob
        }).then((resitListingResponse) => {
            const resitListingBlob = new Blob([resitListingResponse.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            if (resitListingBlob) {
                saveAs(resitListingBlob, "Resit_Listing");
                toast.success("File downloaded")
            }

        }).catch((error) => {
            if (error.response) {
                // The request was made and the server responded with a status code
                console.log(error.response.data); // Error message from Flask
                console.log(error.response.status); // HTTP status code
                toast.error(error.response.data.error);
            } else if (error.request) {
                // The request was made but no response was received
                console.log(error.request);
                toast.error("No response received from server");
            } else {
                // Something happened in setting up the request that triggered an error
                console.log('Error', error.message);
                toast.error("Error occurred during request setup");
            }
        });
    };

    const getModuleListExcelFile = () => {
        console.log(returnData?.stats)
        fetch(`http://localhost:3001/api/module-info-excel-file`, {
            method: "POST",
            body: JSON.stringify(returnData?.stats),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(r => r.blob())
            .then(b => saveAs(b, "module_info_list.xlsx"))

    }


    useEffect(() => {
        if (seasonalExcelFile != null) {
            const fileFromBlob = new File([seasonalExcelFile], "seasonal_report.xlsx", { type: seasonalExcelFile.type });

            const formData = new FormData();

            formData.append(`excel_file${0}`, fileFromBlob);
            setFormData(formData);
            console.log(formData);
            try {
                axios.post(`http://localhost:3001/api/analyzeSer`, formData).then((response) => {
                    console.log(response.data);
                    setReturnData(response.data);
                });
            } catch (error) {
                console.log(error);
                // Handle error, show toast message, etc.
                toast.error("Error")
            } finally {
                console.log(returnData);
                setDataLoaded(true); // Set to true to trigger delayed loading
            }
        }
    }, [seasonalExcelFile])

    const handleProgressionViewChange = (progression: string) => {
        console.log(progression)
        setProgressionView(progression)
    }


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const formData = new FormData();
        console.log(filesToSend);

        if (filesToSend.length == 0) {
            toast.error("You need to upload file before analysis")
        }
        if (filesToSend.length !== 0) {

            for (let i = 0; i < filesToSend.length; i++) {
                formData.append(`excel_file${i}`, filesToSend[i].file);
            }
            setFormData(formData);
            console.log(formData);

            axios.post(`http://localhost:3001/api/analyzeSer`, formData).then((response: AxiosResponse) => {
                console.log(response.data);
                setReturnData(response.data);
                setDataLoaded(true); // Set to true to trigger delayed loading
            }).catch((error) => {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    console.log(error.response.data); // Error message from Flask
                    console.log(error.response.status); // HTTP status code
                    toast.error(error.response.data.error);
                } else if (error.request) {
                    // The request was made but no response was received
                    console.log(error.request);
                    toast.error("No response received from server");
                } else {
                    // Something happened in setting up the request that triggered an error
                    console.log('Error', error.message);
                    toast.error("Error occurred during request setup");
                }
            });


        }
    };

    const handleFileDelete = (obj: info) => {
        setDataLoaded(false);
        setFilesToSend((prevFiles) => prevFiles.filter((f2) => f2.id !== obj.id));
        setReturnData(undefined);
        setProgressionView("");
    };

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
      setIsMounted(true);
    }, []);
  
    //prevent hydration error
    if (!isMounted) {
      return null;
    }

    return (
        <div className="container mx-auto">
            <Toaster />
            <form
                className="mx-auto text-center space-y-2 mt-4"
                onSubmit={handleSubmit}
                encType="multipart/form-data"
            >
                {!seasonalExcelFile &&


                    <div className="flex justify-around items-center space-x-4 ">
                        <Label htmlFor="excel_files">
                            Upload one seasonal excel file
                        </Label>
                        <div className="space-x-4">
                            <Button onClick={(e) => {
                                e.preventDefault();
                                if (filesToSend.length >= 1) {
                                    toast.error('Only can upload one file');
                                } else {

                                    inputRef.current?.click();
                                }
                            }}>Add a file</Button>

                            <Button type="submit">Analyze</Button>

                        </div>

                    </div>

                }


                <input
                    ref={inputRef}
                    hidden
                    className="w-1/3 mx-auto"
                    id="excel_files"
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    multiple={false}
                    onChange={(e) => {
                        const selectedFiles = Array.from(e.target.files || []) as File[];
                        const updatedFiles = selectedFiles.filter(file =>
                            !filesToSend.some(existingFile => existingFile.file.name === file.name)
                        );
                        setFilesToSend(prevFiles => [
                            ...prevFiles,
                            ...updatedFiles.map(file => ({
                                id: uuidv4(), // Generate a unique ID
                                file: file,
                                credit: 0
                            }))
                        ]);
                        //clear the input
                        e.target.value = "";
                    }}
                />



                <div className="w-4/5 mx-auto space-y-2">
                    {filesToSend.map((f, i) => (
                        <div
                            className="items-center flex flex-row justify-between p-4 border-2 border-gray-100 rounded-lg"
                            key={`file_${i}`}
                        >
                            <div className="w-1/3">{f.file.name}</div>
                            <div className="w-1/4 flex flex-row gap-2">
                                <span
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleFileDelete(f);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <CancelIcon
                                        className="text-gray-400 hover:text-red-500 hover:cursor-pointer"
                                        width={30}
                                        height={30}
                                    />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </form>
            {dataLoaded && returnData && (
                <>
                    <div className="flex flex-col items-start mt-4 py-4">

                        <div className="w-full overflow-x-auto">
                            <div className="w-full mb-8">
                                <p className="text-lg font-semibold mb-4">Information of All Modules</p>
                                <Button onClick={getModuleListExcelFile} className="mb-4">
                                    Get as excel file
                                </Button>

                                {returnData.all &&
                                    <ModuleStatsComponent
                                        data={returnData?.stats.map((item, index) => ({
                                            Mean: item.mean,
                                            Median: item.median,
                                            Mode: item.mode,
                                            Name: item.name,
                                            StandardDeviation: item.standard_deviation,
                                            Variance: item.variance,
                                            TotalStudent: item.total_student,
                                            Max: item.max_score,
                                            Min: item.min_score
                                        }))}
                                    />
                                }
                            </div>
                        </div>


                        {returnData?.progression && Object.keys(returnData.progression).length > 0 &&
                            <div className="w-full lg:w-3/5 mb-8">
                                <p className="text-lg font-semibold mb-4">Progression Overview</p>
                                <Table className="w-full">
                                    <TableBody>
                                        {Object.entries(returnData?.progression || {}).map(([key, value]) => (
                                            key !== "Resit" && (
                                                <TableRow key={key}>
                                                    <TableCell>{key}</TableCell>
                                                    <TableCell>{value}</TableCell>

                                                    <TableCell className="flex align-middle justify-end space-x-4"><Button onClick={() => handleProgressionViewChange(key)}>View</Button></TableCell>

                                                </TableRow>
                                            )
                                        ))}
                                        <TableRow className="bg-green-400">
                                            <TableCell className="p-4">Total Progress</TableCell>
                                            <TableCell className="p-4">
                                                {Object.entries(returnData?.progression || {}).reduce((total, [key, value]) => (
                                                    key !== "Resit" && key !== "Not Available" ? total + value : total
                                                ), 0)}
                                            </TableCell>
                                            <TableCell className="flex align-middle justify-end space-x-4"><Button onClick={() => handleProgressionViewChange("Not Resit")}>View</Button></TableCell>
                                        </TableRow>
                                        <TableRow className=" bg-red-400">
                                            <TableCell className="p-4">Total Resit</TableCell>
                                            <TableCell className="p-4">{returnData?.progression.Resit}</TableCell>
                                            <TableCell className="flex align-middle justify-end space-x-4">



                                                <Button onClick={() => handleProgressionViewChange("Resit")}>View</Button>
                                                <Button onClick={getResitListingExcelFile} className="mb-4">
                                                    Get resit listing
                                                </Button>

                                            </TableCell>


                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        }

                        <div className="w-full overflow-x-auto">
                            <div className="w-full mb-8">

                                {returnData.all && progressionView != "Not Resit" && progressionView != "" &&
                                    <>
                                        <p className="text-lg font-semibold mb-4">{progressionView}</p>

                                        <AllStudentComponent
                                            data={returnData?.all.filter((v) => {
                                                const progression = v.resit_data.Progression.trim();
                                                const view = progressionView.trim();
                                                return progression === view;
                                            }).map((item, index) => ({
                                                Name: item.resit_data["First Name"] + " " + item.resit_data["Last Name"],
                                                StudentID: item.resit_data["Student ID"],
                                                Career: item.resit_data["Career"],
                                                MeanOverallCourseMark: Number(item.resit_data["Mean Overall Course Mark"].toFixed(2)),
                                                Progression: item.resit_data["Progression"] || "",
                                                TotalCredits: item.resit_data["Total Credits"],
                                                TotalCredits30_39: item.resit_data["Total Credits 30-39"],
                                                TotalCreditsLessThan30: item.resit_data["Total Credits < 30"],
                                                TotalPassCredits: item.resit_data["Total Pass Credits"],
                                                allData: item,
                                                index: index
                                            }))}
                                        />
                                    </>

                                }
                                {returnData.all
                                    && progressionView == "Not Resit" &&
                                    <>
                                        <p className="text-lg font-semibold mb-4">All progress student</p>
                                        <AllStudentComponent
                                            data={returnData?.all.filter((v) => {
                                                const progression = v.resit_data.Progression.trim();
                                                return progression !== "Resit" && progression !== "Not Available";
                                            }).map((item, index) => ({
                                                Name: item.resit_data["First Name"] + " " + item.resit_data["Last Name"],
                                                StudentID: item.resit_data["Student ID"],
                                                Career: item.resit_data["Career"],
                                                MeanOverallCourseMark: Number(item.resit_data["Mean Overall Course Mark"].toFixed(2)),
                                                Progression: item.resit_data["Progression"] || "",
                                                TotalCredits: item.resit_data["Total Credits"],
                                                TotalCredits30_39: item.resit_data["Total Credits 30-39"],
                                                TotalCreditsLessThan30: item.resit_data["Total Credits < 30"],
                                                TotalPassCredits: item.resit_data["Total Pass Credits"],
                                                allData: item,
                                                index: index
                                            }))}
                                        /></>

                                }

                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default SeasonalExcelFileAnalysis;