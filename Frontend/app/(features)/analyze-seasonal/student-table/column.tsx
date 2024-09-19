"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Copy } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ModuleDetails from "./moduledetails";
import { AllData } from "../seasonalExcelFileAnalysis";

export type AllStudentColumn = {
    Name: string
    StudentID: number
    Career: string
    MeanOverallCourseMark: number
    Progression: string
    TotalCredits: number
    TotalCredits30_39: number
    TotalCreditsLessThan30: number
    TotalPassCredits: number
    allData: AllData,
    index: number,
}

export const columns: ColumnDef<AllStudentColumn>[] = [
    {
        accessorKey: "Name",
        header: "Name",
    },
    {
        accessorKey: "StudentID",
        header: "Student ID",
    },
    {
        accessorKey: "Career",
        header: "Career",
    },
    {
        accessorKey: "MeanOverallCourseMark",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Mean Overall Course Mark
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "Progression",
        header: "Progression",
        cell: ({ row }) => {
            if (row.original.Progression != "") {
                return <span>{row.original.Progression}</span>;
            } else {
                return <span>not applicable</span>;
            }

        },
    },
    {
        accessorKey: "TotalCredits",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                   Total Credit
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "TotalCredits30_39",
        header: "Total Credits 30-39",
    },
    {
        accessorKey: "TotalCreditsLessThan30",
        header: "Total Credits < 30",
    },
    {
        accessorKey: "TotalPassCredits",
        header: "Total Pass Credits",
    },
    {
        id: "actions",
        header: "View More",
        cell: ({ row }) => <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">View</Button>
            </DialogTrigger>
            <DialogContent className=" lg:max-w-2xl overflow-x-auto">
                <DialogHeader>
                    <DialogTitle>Module Information</DialogTitle>
                </DialogHeader>
                <ModuleDetails data={row.original.allData} index={row.original.index} withAccordion={false} />
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    },
];
