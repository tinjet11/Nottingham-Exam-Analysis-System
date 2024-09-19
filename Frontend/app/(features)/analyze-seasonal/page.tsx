"use client"
import React, { useEffect, useState } from 'react'
import SeasonalExcelFileAnalysis from './seasonalExcelFileAnalysis'

const AnalyzeSeasonal = () => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
      setIsMounted(true);
    }, []);
  
    //prevent hydration error
    if (!isMounted) {
      return null;
    }
    return (
        <>
            <SeasonalExcelFileAnalysis />
            <div className="container mx-auto">
                <div className="my-8 bg-blue-100 p-5 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Seasonal Report Analysis Guide</h2>
                    <h4 className="mb-4 font-light">Please read the guide carefully before doing Seasonal Report Analysis</h4>
                    <ul className="list-decimal pl-5 space-y-2">
                        <li>The file needed to be input is the generated seasonal excel file generated from the system</li>
                        <li>Only one file is allowed</li>
                        <li>User can download the all module statistics by clicking the "Get as excel file" in the Information of all modules section</li>
                        <li>User can search in the table according to the filter selected</li>
                        <li>In the progression overview section, user can click "View" button to see the student data which is under the specified category</li>
                        <li>In the Resit section in the progression overview section, user can click "Get Resit Listing" button to get all info about the resit module and the student info</li>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default AnalyzeSeasonal