"use client";

import React, { useState, useRef } from "react";
import {
  Chart as Chartjs,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  LegendItem,
} from "chart.js";
import { Doughnut as DoughnutChart, Line } from "react-chartjs-2";
import { Button } from "./ui/button";
import { DownloadIcon } from "lucide-react";
import saveAs from "file-saver";

Chartjs.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

import {
  Tooltip as ToolTip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface CourseInfo {
  name: string;
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
const ChartToggle = ({
  data,
  course,
}: {
  data: ExamData[];
  course: CourseInfo;
}) => {
  const [showBarChart, setShowBarChart] = useState(true);

  const barChartRef = useRef<Chartjs<"line", number[], string> | null>(null);
  const toggleChart = () => {
    setShowBarChart((prev) => !prev);
  };
  return (
    <>
      {showBarChart ? (
        <div className="w-full mt-8">
          <TooltipProvider>
            <ToolTip>
              <TooltipTrigger asChild>
                <Button
                  className="relative top-8 left-8 float-left"
                  variant="outline"
                  onClick={(e) => {
                    if (!barChartRef.current) return;
                    barChartRef.current.canvas.toBlob(
                      (b) => (b ? saveAs(b, "bar-chart.png") : null),
                      "image/png"
                    );
                  }}
                >
                  <DownloadIcon size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click here to download the chart!</p>
              </TooltipContent>
            </ToolTip>
          </TooltipProvider>
          <Line
            className="w-full"
            ref={barChartRef}
            data={{
              labels: ["0-39", "40-49", "50-59", "60-69", "70-100"],
              // @ts-ignore
              datasets: data.map((dx, i) => ({
                type: dx.exam_title.includes("Overall") ? "bar" : "line",
                data: dx.mark,
                backgroundColor: dx.exam_title.includes("Overall")
                  ? BACKGROUND_COLORS[4]
                  : BACKGROUND_COLORS[i % BACKGROUND_COLORS.length],
                borderColor: dx.exam_title.includes("Overall")
                  ? BORDER_COLORS[4]
                  : BORDER_COLORS[i % BORDER_COLORS.length],
                borderWidth: 2.0,
              })),
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    generateLabels(chart): LegendItem[] {
                      return data.map((dx, i) => ({
                        strokeStyle: dx.exam_title.includes("Overall")
                          ? BORDER_COLORS[4]
                          : BORDER_COLORS[i % BORDER_COLORS.length],
                        fillStyle: dx.exam_title.includes("Overall")
                          ? BACKGROUND_COLORS[4]
                          : BACKGROUND_COLORS[i % BACKGROUND_COLORS.length],
                        text: dx.exam_title,
                      }));
                    },
                  },
                },
                title: {
                  display: true,
                  position: "top",
                  text: "No. of students for each degree in each component of grading",
                },
              },
            }}
          />
        </div>
      ) : (
        <div className="flex flex-wrap w-full justify-center">
          {data.map((exam, j) => (
            <div key={j} className="p-4">
              <TooltipProvider>
                <ToolTip>
                  <TooltipTrigger asChild>
                    <Button
                      className="relative top-0 left-0 float-left"
                      variant="outline"
                      onClick={(e) => {
                        const canvas = document.getElementById(
                          `ring_chart_${j + 1}`
                        ) as HTMLCanvasElement;
                        canvas.toBlob((b) => {
                          if (!b) return;
                          saveAs(b, `ring_chart_${j + 1}.png`);
                        }, "image/png");
                      }}
                    >
                      <DownloadIcon size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click here to download the chart!</p>
                  </TooltipContent>
                </ToolTip>
              </TooltipProvider>
              {/* <div className="flex flex-col w-72 items-center"> */}
              <DoughnutChart
                id={`ring_chart_${j + 1}`}
                className="w-52 h-52"
                data={{
                  labels: ["0-39", "40-49", "50-59", "60-69", "70-100"],
                  datasets: [
                    {
                      data: exam.mark,
                      backgroundColor: BACKGROUND_COLORS,
                      borderColor: BORDER_COLORS,
                      borderWidth: 1,
                      label: exam.exam_title,
                    },
                  ],
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
                      text: `${course.name}\n${exam.exam_title}`,
                    },
                  },
                }}
              />
            </div>
            // </div>
          ))}
        </div>
      )}
      <div className="flex justify-center mt-4">
        <Button onClick={toggleChart}>
          {showBarChart ? "Switch to Pie Chart" : "Switch to Bar Chart"}
        </Button>
      </div>
    </>
  );
};

export default ChartToggle;
