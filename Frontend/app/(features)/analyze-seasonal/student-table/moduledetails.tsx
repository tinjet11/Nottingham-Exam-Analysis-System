import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { TableBody, TableRow, TableCell, Table } from '@/components/ui/table'

import React from 'react'
import { Bar as BarChart } from "react-chartjs-2";
import { AllData } from '../seasonalExcelFileAnalysis';

interface ModuleDetailsProps {
    data: AllData,
    index: number,
    withAccordion: boolean
}



const ModuleDetails = ({ data, index, withAccordion }: ModuleDetailsProps) => {
    return (

        withAccordion ?
            <Accordion key={index} type="single" collapsible className="mb-4">
                <AccordionItem value={data.resit_data["Student ID"].toString()}>
                    <AccordionTrigger className="cursor-pointer hover:bg-gray-100 px-4 py-2">
                        {`${data.resit_data["First Name"]} ${data.resit_data["Last Name"]}`}
                    </AccordionTrigger>
                    <AccordionContent className="bg-gray-50 p-4">
                        <div className="mb-4">
                            <p className="font-semibold">Career:</p>
                            <p>{data.resit_data.Career}</p>
                        </div>
                        <div className="mb-4">
                            <p className="font-semibold">Student ID:</p>
                            <p>{data.resit_data["Student ID"]}</p>
                        </div>
                        <div className="mb-4">
                            <p className="font-semibold">Overall Weightage Mark:</p>
                            <p>{data.resit_data["Mean Overall Course Mark"]}</p>
                        </div>

                        <Table className="w-full mb-4">
                            <TableBody>
                                <TableRow>
                                    <TableCell className="p-4 text-center">Total Credits</TableCell>
                                    <TableCell className="p-4 text-center">Total Credits &lt; 30</TableCell>
                                    <TableCell className="p-4 text-center">Total Credits 30-39</TableCell>
                                    <TableCell className="p-4 text-center">Total Pass Credits</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="p-4 text-center">{data.resit_data["Total Credits"]}</TableCell>
                                    <TableCell className="p-4 text-center">{data.resit_data["Total Credits < 30"]}</TableCell>
                                    <TableCell className="p-4 text-center">{data.resit_data["Total Credits 30-39"]}</TableCell>
                                    <TableCell className="p-4 text-center">{data.resit_data["Total Pass Credits"]}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>

                        <BarChart
                            data={{
                                labels: Object.keys(data.module_data),
                                datasets: [
                                    {
                                        label: "Module mark",
                                        data: Object.values(data.module_data),
                                        backgroundColor: "#4F46E5",
                                        borderColor: "#4F46E5",
                                    }
                                ],
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: "top" },
                                    title: {
                                        display: true,
                                        text: "Marks of Modules Taken",
                                        font: {
                                            size: 16,
                                            weight: "bold"
                                        }
                                    },
                                },
                            }}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            :

            (
                <div>
                    <div className="mb-4">
                        <p className="font-semibold">Name:</p>
                        <p>{`${data.resit_data["First Name"]} ${data.resit_data["Last Name"]}`}</p>
                    </div>

                    <div className="mb-4">
                        <p className="font-semibold">Career:</p>
                        <p>{data.resit_data.Career}</p>
                    </div>
                    <div className="mb-4">
                        <p className="font-semibold">Student ID:</p>
                        <p>{data.resit_data["Student ID"]}</p>
                    </div>
                    <div className="mb-4">
                        <p className="font-semibold">Overall Weightage Mark:</p>
                        <p>{data.resit_data["Mean Overall Course Mark"]}</p>
                    </div>

                    <Table className="w-full mb-4">
                        <TableBody>
                            <TableRow>
                                <TableCell className="p-4 text-center">Total Credits</TableCell>
                                <TableCell className="p-4 text-center">Total Credits &lt; 30</TableCell>
                                <TableCell className="p-4 text-center">Total Credits 30-39</TableCell>
                                <TableCell className="p-4 text-center">Total Pass Credits</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="p-4 text-center">{data.resit_data["Total Credits"]}</TableCell>
                                <TableCell className="p-4 text-center">{data.resit_data["Total Credits < 30"]}</TableCell>
                                <TableCell className="p-4 text-center">{data.resit_data["Total Credits 30-39"]}</TableCell>
                                <TableCell className="p-4 text-center">{data.resit_data["Total Pass Credits"]}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>

                    <BarChart
                        data={{
                            labels: Object.keys(data.module_data),
                            datasets: [
                                {
                                    label: "Module mark",
                                    data: Object.values(data.module_data),
                                    backgroundColor: "#4F46E5",
                                    borderColor: "#4F46E5",
                                }
                            ],
                        }}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { position: "top" },
                                title: {
                                    display: true,
                                    text: "Marks of Modules Taken",
                                    font: {
                                        size: 16,
                                        weight: "bold"
                                    }
                                },
                            },
                        }}
                    />
                </div>
            )
    )
}

export default ModuleDetails