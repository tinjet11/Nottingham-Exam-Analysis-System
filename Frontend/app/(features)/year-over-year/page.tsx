"use client";

import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { v4 as uuidv4 } from "uuid";
import { Line as LineChart } from "react-chartjs-2";
import { BsArrowDown } from "react-icons/bs";
import { BsArrowUp } from "react-icons/bs";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

import {
    Tooltip as ToolTip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import axios, { AxiosResponse } from "axios";
import { X as CancelIcon, Plus as AddIcon, ArrowRight, DownloadIcon } from "lucide-react";
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

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import TopNav from "@/components/topnav";
import { UserType } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import ShowInputButton from "@/components/showinput-button";
import { saveAs } from "file-saver";
import ReactDOM from "react-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
interface ExamData {
    exam_title: string;
    mark: number[];
    range: string[];
    statistics: {
        mean: number;
        median: number;
        mode: number;
        standard_deviation: number;
        variance: number;
    };
    filename: string;
}

const BACKGROUND_COLORS = [
    "rgba(255, 0, 0, 0.4)", // Red
    "rgba(255, 165, 0, 0.4)", // Orange
    "rgba(185,207,228, 0.6)", // Blue
    "rgba(0, 255, 255, 0.4)", // Cyan
    "rgba(0, 128, 0, 0.4)", // Green
    "rgba(148, 0, 211, 0.4)", // Purple
    "rgba(255, 255, 0, 0.4)", // Yellow
    "rgba(255, 69, 0, 0.4)", // Tomato
    "rgba(255, 20, 147, 0.4)", // Deep Pink
];

const BORDER_COLORS = [
    "rgb(255, 0, 0)", // Red
    "rgb(255, 165, 0)", // Orange
    "rgb(185,207,228)", // Blue
    "rgb(0, 255, 255)", // Cyan
    "rgb(0, 128, 0)", // Green
    "rgb(148, 0, 211)", // Purple
    "rgb(255, 255, 0)", // Yellow
    "rgb(255, 69, 0)", // Tomato
    "rgb(255, 20, 147)", // Deep Pink
];

interface info {
    id: string;
    file: File;
    year: number;
}

export default function Home() {
    const tooltipRef = useRef<HTMLDivElement | null>(null)
    const [examData, setExamData] = useState<ExamData[][] | null>(); // Initialize as null
    const [isLoading, setIsLoading] = useState(false);

    const [submitted, setSubmitted] = useState(false);

    const [filesToSend, setFilesToSend] = useState<info[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const years = Array.from({ length: 25 }, (_, index) => 2024 - index);
    const uniqueYears = Array.from(new Set(years));

    const duplicateYears = filesToSend.map(file => file.year);

    const extractFilename = (file: File, files: File[]): string | null => {
        // Extract filename from file object
        const filename = file.name;

        // Regular expression to match the pattern after underscore and before full stop
        const regex = /_(.*?)\./;

        // Extract the desired part of the filename using match() method
        const match = filename.match(regex);

        // If match is found, extract the matched substring
        const result = match ? match[1] : null;

        return result;
    }


    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        setSubmitted(true);

        if (filesToSend.length == 0) {
            toast.error("You need to upload file before analysis")
            return;
        }

        var isYearEmpty = false;
        filesToSend.forEach((file) => {
            if (file.year == 0) {
                isYearEmpty = true;
            }
        });

        if (isYearEmpty) {
            toast.error("Please select a year")
            return;
        }

        const hasDuplicates = (array: any) => {
            const yearSet = new Set();
            for (let year of array) {
                if (yearSet.has(year)) {
                    return true; // Duplicate found
                }
                yearSet.add(year);
            }
            return false; // No duplicates found
        };

        if (hasDuplicates(duplicateYears)) {
            toast.error("Duplicate years found.");
            return;
        }

        const formData = new FormData();
        console.log(filesToSend);
        if (filesToSend.length !== 0) {

            //setIsLoading(true);
            for (let i = 0; i < filesToSend.length; i++) {
                formData.append(`excel_file${i}`, filesToSend[i].file);
                formData.append(`year${i}`, filesToSend[i].year.toString());
            }
            console.log(formData);
            axios
                .post(`http://localhost:3001/api/year-over-year`, formData)
                .then((response: AxiosResponse<{ data: ExamData[][] }>) => {
                    setExamData((_) => {
                        console.log(response.data.data);
                        return response.data.data;
                    });

                    setIsLoading(false);
                    setShowInput(false);
                    toast.success("Analysis Successful")
                    console.log(
                        examData?.map((dxs) => {
                            console.log({
                                labels: dxs.map((dx) => dx.exam_title),
                                datasets: dxs.map((dx, i) => ({
                                    label: dx.range[i],
                                    data: dx.mark,
                                    backgroundColor: BACKGROUND_COLORS.slice(0, 3),
                                    borderColor: BORDER_COLORS.slice(0, 3),
                                })),
                            });
                        })
                    );
                })
                .catch((error) => {
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
                    setIsLoading(false);
                });
        }
    };

    const handleFileDelete = (obj: info) => {
        setFilesToSend((prevFiles) => prevFiles.filter((f2) => f2.id !== obj.id));

        setExamData(null);
    };


    const calculateChanges = (prev: number, current: number) => {
        const diff = current - prev;
        const percentageChange = ((diff / prev) * 100).toFixed(2); // Fixed to 2 decimal places

        return diff > 0 ? (
            <div className="flex">
                <span style={{ color: "green", marginRight: "4px" }}><BsArrowUp className="h-5" /></span>
                <span style={{ color: "green" }}>{percentageChange}%</span>
            </div>

        ) : diff < 0 ? (
            <div className="flex">
                <span style={{ color: "red", marginRight: "4px" }}><BsArrowDown className="h-5" /></span>
                <span style={{ color: "red" }}>{percentageChange}%</span>
            </div>
        ) : (
            <div className="flex">
                <span style={{ color: "green" }}>{0}%</span>
            </div>
        );
    };

    const [showInput, setShowInput] = useState(false);

    const show = (event: React.FormEvent) => {
        event.preventDefault();
        setShowInput(prev => !prev);
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
                <div className="flex justify-around items-center space-x-4 ">
                    <Label htmlFor="excel_files">
                        Upload one or multiple ocm file
                    </Label>
                    <div className="space-x-4">
                        <Button onClick={(e) => {
                            e.preventDefault();
                            inputRef.current?.click();
                            setShowInput(true)
                        }}>Add a file</Button>

                        <Button type="submit">Analyze</Button>
                        <ShowInputButton showInput={showInput} show={show} />
                    </div>

                </div>

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
                        const updatedFiles = selectedFiles.map((file) => {
                            const uniqueId = uuidv4(); // Generate a unique ID
                            const uniqueName = `${file.name}`; // Append unique ID to filename
                            return {
                                id: uniqueId,
                                file: new File([file], uniqueName), // Create a new File object with the unique filename
                                year: 0,
                            };
                        });

                        setFilesToSend((prevFiles) => [...prevFiles, ...updatedFiles]);
                        // Clear the input
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
                                    onValueChange={(value) => {
                                        setFilesToSend(prevFiles => {
                                            const updatedFiles = prevFiles.map(file =>
                                                file.id === f.id ? { ...file, year: parseInt(value) } : file
                                            );
                                            return updatedFiles;
                                        });
                                    }}
                                >
                                    <SelectTrigger value={filesToSend[filesToSend.findIndex((file) => file.id === f.id)].year}>
                                        <SelectValue placeholder="Year Taken" />
                                    </SelectTrigger>
                                    <SelectContent className="overflow-y-auto max-h-[15rem]">
                                        {uniqueYears.map((year, index) => (
                                            <SelectItem key={index} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
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
                </div>

            </form>

            <div className="py-8 p-24">
                <div className="flex flex-col items-center px-8">
                    {/* {filesToSend.slice(0, 1).map((file, index) => (
                        submitted && (
                            <h3 className="text-2xl font-semibold mb-4">
                                Statistics for {extractFilename(filesToSend[0].file)}
                            </h3>
                        )
                    ))} */}

                </div>

                {examData && examData[0].map((_, i) => (
                    <Accordion type="single" key={`year-over-year`} defaultValue={`index-${0}-${0}`} collapsible>
                        <AccordionItem key={i} value={`index-${i}-${0}`}>
                            <AccordionTrigger>
                                <h2 className="text-xl font-semibold mb-4">{examData[0][i].exam_title}</h2>
                            </AccordionTrigger>
                            <AccordionContent>
                                < div className="flex flex-row justify-center my-8" >
                                    {/* Statistics */}
                                    < div className="flex flex-row" >
                                        <div className="flex flex-col items-center mb-12 px-8">
                                            <div className="px-12">
                                                <div key={i} className="bg-white p-6 rounded-md shadow-md">
                                                    <h2 className="text-xl font-semibold mb-4">Year-Over-Year Comparison for {extractFilename(filesToSend[0].file, filesToSend.map(file => file.file))}</h2>
                                                    <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                                                        <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableCell className="p-4 text-center">{examData[0][i].exam_title}</TableCell>

                                                                    {examData.map((_, k) => (
                                                                        <>
                                                                            {
                                                                                k > 0 && (
                                                                                    <TableCell>
                                                                                        Difference
                                                                                    </TableCell>
                                                                                )
                                                                            }
                                                                            <TableCell className="p-4 text-center">
                                                                                {filesToSend[k].year} (Statistics)
                                                                            </TableCell>
                                                                        </>
                                                                    ))}
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody key={i}>
                                                                <TableRow>
                                                                    <TableCell className="p-4 text-center">
                                                                        Mean
                                                                    </TableCell>
                                                                    {examData.map((_, k) => (
                                                                        <>
                                                                            {
                                                                                k > 0 && (
                                                                                    <TableCell>
                                                                                        {calculateChanges(examData[k - 1][i].statistics.mean, examData[k][i].statistics.mean)}
                                                                                    </TableCell>
                                                                                )
                                                                            }
                                                                            <TableCell className="p-4 text-center">
                                                                                {examData[k][i].statistics.mean}
                                                                            </TableCell>
                                                                        </>
                                                                    ))}
                                                                </TableRow>

                                                                <TableRow>
                                                                    <TableCell className="p-4 text-center">
                                                                        Mode
                                                                    </TableCell>
                                                                    {examData.map((_, k) => (
                                                                        <>
                                                                            {
                                                                                k > 0 && (
                                                                                    <TableCell>
                                                                                        {calculateChanges(examData[k - 1][i].statistics.mode, examData[k][i].statistics.mode)}
                                                                                    </TableCell>
                                                                                )
                                                                            }
                                                                            <TableCell className="p-4 text-center">
                                                                                {examData[k][i].statistics.mode}
                                                                            </TableCell>
                                                                        </>
                                                                    ))}
                                                                </TableRow>

                                                                <TableRow>
                                                                    <TableCell className="p-4 text-center">
                                                                        Median
                                                                    </TableCell>
                                                                    {examData.map((_, k) => (
                                                                        <>
                                                                            {
                                                                                k > 0 && (
                                                                                    <TableCell>
                                                                                        {calculateChanges(examData[k - 1][i].statistics.median, examData[k][i].statistics.median)}
                                                                                    </TableCell>
                                                                                )
                                                                            }
                                                                            <TableCell className="p-4 text-center">
                                                                                {examData[k][i].statistics.median}
                                                                            </TableCell>
                                                                        </>
                                                                    ))}
                                                                </TableRow>

                                                                <TableRow>
                                                                    <TableCell className="p-4 text-center">
                                                                        Standard Deviation
                                                                    </TableCell>
                                                                    {examData.map((_, k) => (
                                                                        <>
                                                                            {
                                                                                k > 0 && (
                                                                                    <TableCell>
                                                                                        {calculateChanges(examData[k - 1][i].statistics.standard_deviation, examData[k][i].statistics.standard_deviation)}
                                                                                    </TableCell>
                                                                                )
                                                                            }
                                                                            <TableCell className="p-4 text-center">
                                                                                {examData[k][i].statistics.standard_deviation}
                                                                            </TableCell>
                                                                        </>
                                                                    ))}
                                                                </TableRow>

                                                                <TableRow>
                                                                    <TableCell className="p-4 text-center">
                                                                        Variance
                                                                    </TableCell>
                                                                    {examData.map((_, k) => (
                                                                        <>
                                                                            {
                                                                                k > 0 && (
                                                                                    <TableCell>
                                                                                        {calculateChanges(examData[k - 1][i].statistics.variance, examData[k][i].statistics.variance)}
                                                                                    </TableCell>
                                                                                )
                                                                            }
                                                                            <TableCell className="p-4 text-center">
                                                                                {examData[k][i].statistics.variance}
                                                                            </TableCell>
                                                                        </>
                                                                    ))}
                                                                </TableRow>
                                                            </TableBody>

                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableCell className="p-4 text-center">Range of Scores</TableCell>

                                                                    {examData.map((_, k) => (
                                                                        <>
                                                                            {
                                                                                k > 0 && (
                                                                                    <TableCell>
                                                                                        Difference
                                                                                    </TableCell>
                                                                                )
                                                                            }
                                                                            <TableCell className="p-4 text-center">
                                                                                {filesToSend[k].year} (No. of Students)
                                                                            </TableCell>
                                                                        </>
                                                                    ))}
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {examData[0][0].range.map((r, j) => (
                                                                    <TableRow>
                                                                        <TableCell className="p-4 text-center">
                                                                            {r}
                                                                        </TableCell>
                                                                        {examData.map((_, k) => (
                                                                            <>
                                                                                {
                                                                                    k > 0 && (
                                                                                        <TableCell>
                                                                                            {calculateChanges(examData[k - 1][i].mark[j], examData[k][i].mark[j])}
                                                                                        </TableCell>
                                                                                    )
                                                                                }
                                                                                <TableCell className="p-4 text-center">
                                                                                    {examData[k][i].mark[j]}
                                                                                </TableCell>
                                                                            </>
                                                                        ))}
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                ))
                }

                <div className="flex justify-center items-center">
                    <div className="flex flex-col w-3/5">
                        {examData && examData[0].map((assessmentType, i) => (
                            <div className="py-8">
                                <TooltipProvider>
                                    <ToolTip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" onClick={e => {
                                                const canvas = document.getElementById(`yoy_${assessmentType.exam_title}_${i}`) as HTMLCanvasElement;
                                                canvas.toBlob(b => {
                                                    if (b == null) return toast.error("Error while downloading")
                                                    saveAs(b, `yoy_${assessmentType.exam_title}_${i}.png`)
                                                }, "image/png")
                                            }}>
                                                <DownloadIcon size={24} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Click here to download the chart!</p>
                                        </TooltipContent>
                                    </ToolTip>
                                </TooltipProvider>
                                <LineChart
                                    key={i}
                                    id={`yoy_${assessmentType.exam_title}_${i}`}
                                    className="flex flex-col"
                                    data={{
                                        labels: ["0-39", "40-49", "50-59", "60-69", "70-100"],
                                        datasets: examData.map((dxs, j) => ({
                                            label: filesToSend[j].file.name,// Use the same index for both sets
                                            data: dxs[i].mark, // Use the same index for both sets
                                            backgroundColor: BACKGROUND_COLORS[j % BACKGROUND_COLORS.length],
                                            borderColor: BORDER_COLORS[j % BORDER_COLORS.length],
                                            fill: false,
                                        })),
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: "top",
                                            },
                                            title: {
                                                display: true,
                                                position: "top",
                                                text: `Comparison for ${examData[0][i].exam_title}`, // Dynamic title based on the exam title
                                            },
                                        },
                                    }}
                                />
                                <div className="text-center mt-4">
                                    <h2>The chart is interactive! You can click on the legends to hide any data you don't need.</h2>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="my-8 bg-blue-100 p-5 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Year Over Year Analysis Guide</h2>
                    <h4 className="mb-4 font-light">Please read the guide carefully before doing Year Over Year Analysis</h4>
                    <ul className="list-decimal pl-5 space-y-2">
                        <li>The file needed to be input is an OCM file.</li>
                        <li>The ocm file input must be the same module</li>
                        <li>Year must be specified with each ocm file</li>
                        <li>The year specified with each ocm file must be different</li>
                        <li>The chart generated is interactable by clicking the legend</li>
                    </ul>
                </div>
            </div >
        </div >
    );
}
