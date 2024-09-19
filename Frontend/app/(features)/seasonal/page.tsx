"use client";

import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { saveAs } from 'file-saver';
import axios, { AxiosResponse } from "axios";
import { X as CancelIcon, Plus as AddIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { UserType } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import toast, { Toaster } from "react-hot-toast";
import ShowInputButton from "@/components/showinput-button";
import SeasonalExcelFileAnalysis from "../analyze-seasonal/seasonalExcelFileAnalysis";


interface info {
    id: string;
    file: File;
    credit: number;
}

interface moduleCredit {
    name: string;
    credit: number;
}

export default function Home() {
    const [seasonalExcelFile, setSeasonalExcelFile] = useState<Blob | null>(null);
    const [dataExists, setIsDataExists] = useState(false);
    const [file_naming, setFile_naming] = useState<string>("");

    const [filesToSend, setFilesToSend] = useState<info[]>([]);
    const [creditList, setCreditList] = useState<moduleCredit[]>();
    const [showInput, setShowInput] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const creditRef = useRef<HTMLInputElement>(null);

    const [creditFile, setCreditFile] = useState<File>();

    // const [ chartRefs, setChartRefs ] = useState<React.MutableRefObject<HTMLCanvasElement | null>[]>([]);
    const [selectedFileIndex, setSelectedFileIndex] = useState(0); // State to keep track of the selected file index

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (file_naming == "" || filesToSend.length == 0) {
            toast.error("Field is empty. Check again")
            return;
        }
        var isCreditEmpty = false;
        filesToSend.forEach((file) => {
            if (file.credit == 0) {
                isCreditEmpty = true;
            }
        });

        if (isCreditEmpty) {
            toast.error("Credit is empty.")
            return;
        }

        console.log(file_naming)

        const formData = new FormData();
        console.log(filesToSend);
        if (filesToSend.length !== 0) {
            for (let i = 0; i < filesToSend.length; i++) {
                formData.append(`excel_file${i}`, filesToSend[i].file);
                formData.append(`credit${i}`, filesToSend[i].credit.toString());
            }

            console.log(formData);

            axios
                .post(`http://localhost:3001/api/beforeGenerateSeasonalExcelFile`, formData,)
                .then((response: AxiosResponse) => {
                    axios
                        .post(`http://localhost:3001/api/generateSeasonalExcelFile`, formData, {
                            responseType: 'arraybuffer',
                        })
                        .then((response: AxiosResponse) => {
                            // Directly create a Blob from the ArrayBuffer
                            setSeasonalExcelFile(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
                            // Trigger file download using FileSaver.js
                            setIsDataExists(true);
                            toast.success("File Generated. You can download it now")
                            setShowInput(false);
                        }).catch((error) => {
                            toast.error(error);
                        });
                }).catch((error) => {
                    if (error.response) {
                        // The request was made and the server responded with a status code
                        console.log(error); // Error message from Flask
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
                    setIsDataExists(false);
                });
        }
    };

    const handleFileDelete = (obj: info) => {
        setFilesToSend((prevFiles) => prevFiles.filter((f2) => f2.id !== obj.id));
    };

    useEffect(() => {
        // Additional actions or side effects after updating state
        // This code will run whenever the component is mounted or when filesToSend changes
    }, [filesToSend]);

    const handleDownload = () => {
        if (seasonalExcelFile) {
            saveAs(seasonalExcelFile, file_naming);
            toast.success("File downloaded")
        }
    };


    const show = (event: React.FormEvent) => {
        event.preventDefault();
        setShowInput(prev => !prev);
    };

    const handleCreditFileUpload = (file: File) => {
        const formData = new FormData();
        formData.append(`CreditList`, file);

        axios
            .post(`http://localhost:3001/api/extract-creditList`, formData,)
            .then((response: AxiosResponse) => {
                console.log(response.data);
                setCreditList(response.data.data);
                toast.success("Credit List Upload Successfully");
            }).catch((error) => {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    console.log(error); // Error message from Flask
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
                setIsDataExists(false);
            });
    }

    const matchCreditWithFile = (filename: string) => {
        console.log(creditList)

        const pattern: RegExp = /_(.*?)\./;

        const match: RegExpMatchArray | null = filename.match(pattern);
        if (match && creditList) {
            const matchedString: string = match[1];
            const obj = creditList.find((entry) => entry.name === matchedString);
            return obj ? obj.credit : 0;
        } else {
            console.log("No match found");
            return 0;
        }


    }

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
                className="mx-auto text-center space-y-8 mt-4"
                onSubmit={handleSubmit}
                encType="multipart/form-data"
            >
                <div className="flex justify-around items-center">
                    <Label htmlFor="excel_files">
                        Upload excel file containing module name and credit of each module here.(Optional)
                    </Label>

                    <div className="space-x-4">
                        <Button onClick={(e) => {
                            e.preventDefault();
                            creditRef.current?.click();
                        }}>Add a file</Button>

                        <Button onClick={(e) => {
                            e.preventDefault();
                            const fileUrl = `/CreditList.xlsx`; // Path to your file in the public folder

                            // Create a temporary link element
                            const link = document.createElement('a');
                            link.href = fileUrl;
                            link.setAttribute('download', "CreditList-Template");

                            // Simulate a click on the link to trigger the download
                            document.body.appendChild(link);
                            link.click();

                            // Clean up
                            document.body.removeChild(link);
                        }}>Download Template</Button>

                    </div>
                </div>
                {creditFile &&
                    <div
                        className=" w-4/5 mx-auto items-center flex flex-row justify-between p-4 border-2 border-gray-100 rounded-lg"
                    >
                        <div className="w-1/3">{creditFile.name}</div>

                        <span
                            onClick={(e) => {
                                setCreditFile(undefined);
                                toast.success("Credit List Removed Successfully");
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
                }

                <div className="flex justify-around items-center">
                    <Label htmlFor="excel_files">
                        Upload your Excel files of each module here
                    </Label>

                    <div className="space-x-4">
                        <Button onClick={(e) => {
                            e.preventDefault();
                            inputRef.current?.click();
                        }}>Add a file</Button>

                        <ShowInputButton showInput={showInput} show={show} />
                    </div>
                </div>

                <input
                    ref={creditRef}
                    hidden
                    className="w-1/3 mx-auto"
                    id="credit"
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={(e) => {
                        const selectedFiles = Array.from(e.target.files || []) as File[];
                        setCreditFile(selectedFiles[0]);
                        handleCreditFileUpload(selectedFiles[0])
                        e.target.value = "";
                    }}
                />

                <input
                    ref={inputRef}
                    hidden
                    className="w-1/3 mx-auto"
                    id="excel_files"
                    type="file"
                    multiple
                    accept=".xlsx, .xls, .csv"
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
                                credit: matchCreditWithFile(file.name) != 0 ? matchCreditWithFile(file.name) : 0,
                            }))
                        ]);
                        setShowInput(true);
                        //clear the input
                        e.target.value = "";
                    }}
                />
                <div className=
                    {`w-4/5 mx-auto space-y-2 ${showInput ? 'visible' : 'hidden'}`}>
                    {filesToSend.map((f, i) => (
                        <div
                            className="items-center flex flex-row justify-between p-4 border-2 border-gray-100 rounded-lg"
                            key={`file_${f.id}`}
                        >
                            <div className="w-1/3">{f.file.name}</div>
                            <div className="w-1/4 flex flex-row gap-2">
                                <Select
                                    defaultValue={matchCreditWithFile(f.file.name) != 0 ? matchCreditWithFile(f.file.name).toString() : "0"}
                                    onValueChange={(value) => {
                                        setFilesToSend(prevFiles => {
                                            const updatedFiles = prevFiles.map(file =>
                                                file.id === f.id ? { ...file, credit: parseInt(value) } : file
                                            );
                                            return updatedFiles;
                                        });
                                    }}
                                >
                                    <SelectTrigger value={filesToSend[filesToSend.findIndex((file) => file.id === f.id)].credit.toString()}>
                                        <SelectValue placeholder="No. of Credits" />
                                    </SelectTrigger>
                                    <SelectContent defaultValue={10}>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="30">30</SelectItem>
                                        <SelectItem value="40">40</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span
                                    onClick={(e) => {
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
                    <div className="flex flex-col items-start max-w-sm gap-4 mt-8">
                        <Label htmlFor="email">File name</Label>
                        <Input onChange={(e) => setFile_naming(e.target.value)} value={file_naming} type="text" id="email" placeholder="2023 Spring School of CS" />
                        <div className="py-6">
                            <Button type="submit">Generate</Button>

                        </div>
                    </div>

                </div>
                {/* <input type='submit' value='Upload Excel File' /> */}


            </form>

            <div className="py-8 px-4 md:px-24">
                {dataExists && (
                    <div className="py-6">
                        <Button onClick={handleDownload} disabled={!dataExists}>
                            Download Seasonal Excel File
                        </Button>
                    </div>
                )}


                {seasonalExcelFile &&
                    <>
                        <div><h1 className="text-lg font-semibold mb-4">Seasonal Excel File Analysis</h1></div>
                        <SeasonalExcelFileAnalysis seasonalExcelFile={seasonalExcelFile} />
                    </>
                }

                <div className="my-8 bg-blue-100 p-5 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Generate Seasonal Excel File Guide</h2>
                    <h4 className="mb-4 font-light">Please read the guide carefully before generate the seasonal Excel File </h4>
                    <ul className="list-decimal pl-5 space-y-2">
                        <li>User is suggested to upload a excel file containing module name and its credit in the first input section, after upload it, the ocm file upload after it will be automatically be fill in the credit if there is a match</li>
                        <li>The file needed to be input is an OCM file.</li>
                        <li>If user upload only autumn/ spring module, the seasonal report generated will not have the progression column</li>
                        <li>If user upload both autumn and spring module, there will be progression column, but those student with credit less than 120 will show “Not Available” in the column</li>
                        <li>The credit must be specified with each OCM file uploaded.</li>
                        <li>After Generate, User can download the seasonal excel report using the "Download Seasonal Excel File" button</li>
                        <li>After Generate, the analysis will also directly show below</li>
                    </ul>
                </div>

            </div>



        </div>);
}