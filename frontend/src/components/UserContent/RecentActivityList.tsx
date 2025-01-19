import { Link } from 'react-router-dom'
import useDateFormatter from '../../hooks/useFormatDate'
import { TotalSubmission } from '../../types/userTypes'
import React from 'react'

export interface RecentActivityListProps {
    submissionData: TotalSubmission
}

const RecentActivityList: React.FC<RecentActivityListProps> = ({ submissionData }) => {
    const { formatToISODate } = useDateFormatter();
    const submittedData = Array.isArray(submissionData?.submissions) ? submissionData.submissions : [];
    console.log(submittedData.length)
    const sortedData = [...submittedData].sort((a, b) => {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

    return (
        <div className="px-6 mb-12 overflow-hidden sm:rounded-lg md:px-0">
            <table className="min-w-full divide-y divide-customGrey">
                <thead className="hidden bg-white sm:table-header-group">
                    <tr>
                        <th className="px-6 py-3 text-sm font-medium tracking-wider text-left uppercase text-themeColor">
                            Time Submitted
                        </th>
                        <th className="px-6 py-3 text-sm font-medium tracking-wider text-left uppercase text-themeColor">
                            Question
                        </th>
                        <th className="px-6 py-3 text-sm font-medium tracking-wider text-left uppercase text-themeColor">
                            Status
                        </th>
                        <th className="px-6 py-3 text-sm font-medium tracking-wider text-left uppercase text-themeColor">
                            Difficulty
                        </th>
                        <th className="px-6 py-3 text-sm font-medium tracking-wider text-left uppercase text-themeColor">
                            Language
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-gray-200 divide-y divide-white">
                    {sortedData.map((stats) => (
                        <tr key={stats.problemId} className="flex flex-col mb-4 sm:table-row sm:mb-0">
                            <td className="grid grid-cols-2 px-6 py-2 text-sm text-gray-500 sm:py-4 whitespace-nowrap sm:table-cell">
                                <span className="font-medium sm:hidden">Time Submitted:</span>
                                {formatToISODate(stats.submittedAt.toString())}
                            </td>
                            <td className="grid grid-cols-2 px-6 py-2 text-sm text-gray-500 sm:py-4 whitespace-nowrap sm:table-cell">
                                <span className="font-medium sm:hidden ">Question:</span>
                                <Link to={`/view-problem/${stats.problemId}`} className="cursor-pointer hover:text-blue-500 hover:underline w-[190px] whitespace-normal break-words">
                                    {stats.title}
                                </Link>
                            </td>
                            <td className="grid grid-cols-2 px-6 py-2 text-sm sm:py-4 whitespace-nowrap sm:table-cell">
                                <span className="font-medium sm:hidden">Status:</span>
                                <span className={`font-bold ${
                                    stats.status === 'Attempted' ? 'text-red-500' : 'text-green-500'
                                }`}>
                                    {stats.status === 'Attempted' ? 'Wrong Answer' : 'Submitted'}
                                </span>
                            </td>
                            <td className="grid grid-cols-2 px-6 py-2 text-sm sm:py-4 whitespace-nowrap sm:table-cell">
                                <span className="font-medium sm:hidden">Difficulty:</span>
                                <span className={`${
                                    stats.difficulty === 'easy'
                                        ? 'text-green-500'
                                        : stats.difficulty === 'medium'
                                        ? 'text-yellow-500'
                                        : 'text-red-500'
                                }`}>
                                    {stats.difficulty}
                                </span>
                            </td>
                            <td className="grid grid-cols-2 px-6 py-2 text-sm text-gray-500 sm:py-4 whitespace-nowrap sm:table-cell">
                                <span className="font-medium sm:hidden">Language:</span>
                                {stats.language}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default RecentActivityList
