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
        <div>
            <table className="w-full divide-y divide-customGrey">
                <thead className="bg-customGrey">
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
                <tbody className="divide-y divide-white bg-customGrey">
                    {sortedData.map((stats) => (
                        <React.Fragment key={stats.problemId}>
                            <tr>
                                {/* SUBMISSION */}
                                <td className="px-6 py-4 text-sm font-normal text-gray-500 whitespace-nowrap">
                                    {formatToISODate(stats.submittedAt.toString())}
                                </td>
                                <Link to = {`/view-problem/${stats.problemId}`}>
                                <td className="px-6 py-4 text-sm font-normal text-gray-500 cursor-pointer whitespace-nowrap hover:text-blue-500 hover:underline">
                                    {stats.title}
                                </td>
                                </Link>
                                <td
                                    className={`px-6 py-4 font-bold text-sm whitespace-nowrap ${stats.status === 'Attempted'
                                            ? 'text-red-500'
                                            : 'text-green-500'
                                        }`}
                                >
                                    {stats.status === 'Attempted' ? 'Wrong Answer' : 'Submitted'}
                                </td>
                                <td
                                    className={`px-6 py-4 font-normal text-sm whitespace-nowrap ${stats.difficulty === 'easy'
                                            ? 'text-green-500'
                                            : stats.difficulty === 'medium'
                                                ? 'text-yellow-500'
                                                : 'text-red-500'
                                        }`}
                                >
                                    {stats.difficulty}
                                </td>
                                <td className="px-6 py-4 text-sm font-normal text-gray-500 whitespace-nowrap">
                                    {stats.language}
                                </td>
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

        </div>
    )
}

export default RecentActivityList
