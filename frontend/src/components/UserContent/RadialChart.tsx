import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {  UserAdditional } from "../../types/userTypes";
import { ProblemStats } from "@/types/problemTypes";


interface RadialChartProps {
    user: UserAdditional;
    problemCount: ProblemStats;
}

const RadialChart: React.FC<RadialChartProps> = ({ user, problemCount }) => {
    const easySolved = user?.solvedEasy?.solvedCount || 0;
    const mediumSolved = user?.solvedMedium?.solvedCount || 0;
    const hardSolved = user?.solvedHard?.solvedCount || 0;
    const totalSubmission = user?.totalSubmission?.count; 

    const totalSolved = (user?.solvedEasy?.solvedCount || 0) + (user?.solvedMedium?.solvedCount || 0) + (user?.solvedHard?.solvedCount || 0);
    const totalPercentage = (totalSolved / problemCount?.total) * 100

    const chartOptions: ApexOptions = {
        chart: {
            height: 280,
            type: "radialBar",
        },
        plotOptions: {
            radialBar: {
                dataLabels: {
                    show: true,
                    name: {
                        fontSize: '22px',
                    },
                    value: {
                        fontSize: '16px',
                    },
                    total: {
                        show: true,
                        label: "Total",
                        formatter: function () {
                            return `${totalPercentage.toFixed(2)}%`;
                        }
                    },

                },
                track: {
                    background: '#f2f2f2',
                },
            },
        },
        labels: ["Easy", "Medium", "Hard"],
        colors: ["#22c55e", "#facc15", "#dc2626"],
    };

    const chartSeries = [
        (easySolved / problemCount?.easy) * 100,
        (mediumSolved / problemCount?.medium) * 100,
        (hardSolved / problemCount?.hard) * 100,
    ];

    const labels: (string[]) = ["Easy", "Medium", "Hard"]
    const solvedCounts = [easySolved, mediumSolved, hardSolved];
    const totalCounts = [problemCount?.easy, problemCount?.medium, problemCount?.hard];

    return (
        <>
            <div className="flex flex-col w-full mt-2 border rounded-lg shadow-md bg-customGrey">
                <div className="flex items-center justify-between p-2 px-4 m-0">
                    <h1 className="text-xl font-medium text-gray-500 ">Track your stats</h1>
                    <h1 className="text-sm font-normal text-hoverColor">Total Submission: {totalSubmission}</h1>
                </div>
                <div className="flex justify-start p-0 -ml-12">
                    <Chart options={chartOptions} series={chartSeries} type="radialBar" height={180} />
                    <div className="flex flex-col py-4 space-y-4">
                        {labels.map((label, index) => (
                            <button
                                key={index}
                                className={`px-2 py-1 text-themeColor rounded-lg text-xs${label === "Easy"
                                        ? "border border-green-500 bg-green-100 shadow-md"
                                        : label === "Medium"
                                            ? "border border-yellow-500 bg-yellow-100 shadow-md"
                                            : "border border-red-500 bg-red-200 shadow-md"
                                    }`}
                            >
                                {label}: {solvedCounts[index]}/{totalCounts[index]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default RadialChart;
