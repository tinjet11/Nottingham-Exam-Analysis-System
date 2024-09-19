"use client"

import React from 'react'
import { AllStudentColumn, columns } from './column'
import { DataTable } from '@/components/ui/data-table'

interface Props {
    data: AllStudentColumn[]
}

const keyList = [
    {
        value: "Name",
        label: "Name",
    },
    {
        value: "Progression",
        label: "Progression",
    },
]

const AllStudentComponent = ({ data }: Props) => {
    return (
        <>
            <div className='flex items-center'>
                
                <DataTable columns={columns} data={data} filterKeyList={keyList}/>
            </div>
        </>
    )
}

export default AllStudentComponent