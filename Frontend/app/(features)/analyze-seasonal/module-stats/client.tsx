"use client"

import React from 'react'
import { ModuleStatsColumn, columns } from './column'
import { DataTable } from '@/components/ui/data-table'

interface Props {
    data: ModuleStatsColumn[]
}

const keyList = [
    {
        value: "Name",
        label: "Name",
    },
]
const ModuleStatsComponent = ({ data }: Props) => {

    return (
        <>
            <div className='flex items-center'>
                <DataTable columns={columns} data={data} filterKeyList={keyList} />
            </div>
        </>
    )
}

export default ModuleStatsComponent