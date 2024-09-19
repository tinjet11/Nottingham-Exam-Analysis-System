"use client";

import React, { useState, useRef, useEffect } from "react";
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
Chartjs.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Line } from "react-chartjs-2";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast, { Toaster } from "react-hot-toast";
import ChartToggle from "@/components/chart-toggle";
import ShowInputButton from "@/components/showinput-button";

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
}

export default function Home() {
  const [examData, setExamData] = useState<ExamData[][] | null>(); // Initialize as null
  const [isLoading, setIsLoading] = useState(false);

  const [filesToSend, setFilesToSend] = useState<info[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  // const [ chartRefs, setChartRefs ] = useState<React.MutableRefObject<HTMLCanvasElement | null>[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0); // State to keep track of the selected file index

  const extractFilename = (file: File): string | null => {
    // Extract filename from file object
    const filename = file.name;

    // Regular expression to match the pattern after underscore and before full stop
    const regex = /_(.*?)\./;

    // Extract the desired part of the filename using match() method
    const match = filename.match(regex);

    // If match is found, extract the matched substring
    const result = match ? match[1] : null;

    return result;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (filesToSend.length == 0) {
      toast.error("You need to upload file before analysis");
      return;
    }

    setShowInput(false);
    const formData = new FormData();
    console.log(filesToSend);
    if (filesToSend.length !== 0) {
      setIsLoading(true);
      for (let i = 0; i < filesToSend.length; i++) {
        formData.append(`excel_file${i}`, filesToSend[i].file);
      }

      console.log(formData);
      console.log(process.env.BACKENDPORT);
      axios
        .post(`http://localhost:3001/api/analyzeOcm`, formData)
        .then((response: AxiosResponse<{ data: ExamData[][] }>) => {
          setExamData((_) => {
            console.log(response.data.data);
            return response.data.data;
          });
          setIsLoading(false);
          toast.success("Analysis Successful");
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
          setExamData([]);
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
            console.log("Error", error.message);
            toast.error("Error occurred during request setup");
          }
          // console.log(error);
          // toast.error("Error occurs. Check the input file and try again")
          setIsLoading(false);
        });
    }
  };

  const handleFileDelete = (obj: info) => {
    setFilesToSend((prevFiles) => prevFiles.filter((f2) => f2.id !== obj.id));
  };

  const [showInput, setShowInput] = useState(false);

  const show = (event: React.FormEvent) => {
    event.preventDefault();
    setShowInput((prev) => !prev);
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
          <Label htmlFor="excel_files">Upload one or multiple ocm file</Label>
          <div className="space-x-4">
            <Button
              onClick={(e) => {
                e.preventDefault();
                inputRef.current?.click();
              }}
            >
              Add a file
            </Button>

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
            const updatedFiles = selectedFiles.filter(
              (file) =>
                !filesToSend.some(
                  (existingFile) => existingFile.file.name === file.name
                )
            );
            setFilesToSend((prevFiles) => [
              ...prevFiles,
              ...updatedFiles.map((file) => ({
                id: uuidv4(), // Generate a unique ID
                file: file,
              })),
            ]);
            //clear the input
            e.target.value = "";
            setShowInput(true);
          }}
        />

        <div
          className={`w-4/5 mx-auto space-y-2 ${
            showInput ? "visible" : "hidden"
          }`}
        >
          {filesToSend.map((f, i) => (
            <div
              className="items-center flex flex-row justify-between p-4 border-2 border-gray-100 rounded-lg"
              key={`file_${f.id}`}
            >
              <div className="w-1/3">{f.file.name}</div>
              <div className="w-1/4 flex flex-row gap-2">
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
        {isLoading && <p>Loading data...</p>}

        {examData &&
          examData.map((dxs, i) => (
            <Accordion type="single" collapsible key={`accordion_${i}`}>
              <AccordionItem value={`index-${i}`}>
                {filesToSend.map(
                  (file, index) =>
                    index === i && (
                      <AccordionTrigger key={`file_${i}`}>
                        {file.file.name }
                      </AccordionTrigger>
                    )
                )}

                <AccordionContent>
                  <div className="flex justify-center p-8">
                    <div className="flex flex-col w-11/12">
                      <div className="flex flex-col items-center my-8">
                        <h3 className="text-2xl font-semibold mb-4">
                          Statistics for {extractFilename(filesToSend[0].file)}
                        </h3>
                        <div className="w-full">
                          {dxs.map((dx, j) => (
                            <Accordion
                              className="w-11/12"
                              type="single"
                              key={`inner_accordion_${i}_${j}`}
                              defaultValue={`inner_index-${i}-${0}`}
                              collapsible
                            >
                              <AccordionItem value={`inner_index-${i}-${j}`}>
                                <AccordionTrigger>
                                  <h2 className="text-xl font-semibold mb-4">
                                    {dx.exam_title}
                                  </h2>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="bg-white p-6 rounded-md shadow-md w-full">
                                    <div className="flex flex-row space-x-2">
                                      <div className="w-1/5">
                                        <Card className="h-full py-4 border-black">
                                          <CardHeader>
                                            <CardTitle>Mean:</CardTitle>
                                            <CardDescription>
                                              {dx.statistics.mean}
                                            </CardDescription>
                                          </CardHeader>
                                        </Card>
                                      </div>
                                      <div className="w-1/5">
                                        <Card className="h-full py-4 border-black">
                                          <CardHeader>
                                            <CardTitle>Median:</CardTitle>
                                            <CardDescription>
                                              {dx.statistics.median}
                                            </CardDescription>
                                          </CardHeader>
                                        </Card>
                                      </div>
                                      <div className="w-1/5">
                                        <Card className="h-full py-4 border-black">
                                          <CardHeader>
                                            <CardTitle>Mode:</CardTitle>
                                            <CardDescription>
                                              {dx.statistics.mode}
                                            </CardDescription>
                                          </CardHeader>
                                        </Card>
                                      </div>
                                      <div className="w-1/5">
                                        <Card className="h-full py-4 border-black">
                                          <CardHeader>
                                            <CardTitle>
                                              Standard Deviation:
                                            </CardTitle>
                                            <CardDescription>
                                              {dx.statistics.standard_deviation}
                                            </CardDescription>
                                          </CardHeader>
                                        </Card>
                                      </div>
                                      <div className="w-1/5">
                                        <Card className="h-full py-8 mx-1 border-black">
                                          <CardHeader>
                                            <CardTitle>Variance:</CardTitle>
                                            <CardDescription>
                                              {dx.statistics.variance}
                                            </CardDescription>
                                          </CardHeader>
                                        </Card>
                                      </div>
                                    </div>
                                    <Table className="bg-white border mt-8 rounded-md shadow-md">
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="p-4 text-center">
                                            Range of Scores
                                          </TableHead>
                                          <TableHead className="p-4 text-center">
                                            Total (No. of Students)
                                          </TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {dx.mark.map((mark, index) => (
                                          <TableRow key={index}>
                                            <TableCell className="p-4 text-center">
                                              {dx.range[index]}
                                            </TableCell>
                                            <TableCell className="p-4 text-center">
                                              {mark}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          ))}
                        </div>
                      </div>
                      <ChartToggle
                        data={dxs}
                        course={{
                          name: extractFilename(filesToSend[i].file) ?? "",
                        }}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
      </div>
      <div className="my-8 bg-blue-100 p-5 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          Single Or Multiple Module Analysis Guide
        </h2>
        <h4 className="mb-4 font-light">
          Please read the guide carefully before doing Single Or Multiple Module
          Analysis
        </h4>
        <ul className=" list-decimal pl-5 space-y-2">
          <li>User can add file to analyze using "Add a File" button</li>
          <li>The file needed to be input is an OCM file.</li>
          <li>
            The input will be hide after "Analyze" is click, user can click
            "Show Input" button to show the input
          </li>
          <li>The chart generated is interactable by clicking the legend</li>
        </ul>
      </div>
    </div>
  );
}
