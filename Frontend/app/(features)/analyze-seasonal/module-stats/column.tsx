"use client"

import { ColumnDef } from "@tanstack/react-table"


export type ModuleStatsColumn = {
    Mean: number;
    Median: number;
    Mode: number;
    Name: string;
    StandardDeviation: number;
    Variance: number;
    TotalStudent: number;
    Max: number;
    Min: number;
}

export const columns: ColumnDef<ModuleStatsColumn>[] = [
    {
        accessorKey: "Name",
        header: "Name(Credit)",
    },
    {
        accessorKey: "Mean",
        header: "Mean",
    },
    {
        accessorKey: "Mode",
        header: "Mode",
    },
    {
        accessorKey: "Median",
        header: "Median",
    },
    {
        accessorKey: "Variance",
        header: "Variance",
    },
    {
        accessorKey: "StandardDeviation",
        header: "Standard Deviation",
    },
    {
        accessorKey: "TotalStudent",
        header: "No. Student",
    },
    {
        accessorKey: "Max",
        header: "Max Score"
    },
    {
        accessorKey: "Min",
        header: "Min Score"
    }
];
