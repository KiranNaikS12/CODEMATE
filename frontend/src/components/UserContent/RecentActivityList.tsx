import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useDateFormatter from '../../hooks/useFormatDate';
import { TotalSubmission } from '../../types/userTypes';

export interface RecentActivityListProps {
    submissionData: TotalSubmission;
}

const RecentActivityList: React.FC<RecentActivityListProps> = ({ submissionData }) => {
    const { formatToISODate } = useDateFormatter();
    const [currentPage, setCurrentPage] = useState(1);
    const [processedData, setProcessedData] = useState<TotalSubmission['submissions']>([]);
    const itemsPerPage = 7;

    // Process data once when submissionData changes
    useEffect(() => {
        if (submissionData?.submissions) {
            const newData = [...submissionData.submissions].sort((a, b) => {
                return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
            });
            setProcessedData(newData);
            // Reset to first page when data changes
            setCurrentPage(1);
        }
    }, [submissionData]);

    // Pagination calculations
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = processedData.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between px-6 mb-4 md:px-0">
                <div className="text-sm text-gray-600">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, processedData.length)} of {processedData.length}
                </div>
            </div>

            <div className="px-6 mb-4 overflow-hidden sm:rounded-lg md:px-0">
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
                        {currentItems.map((stats) => (
                            <tr key={`${stats.problemId}-${stats.submittedAt}`} className="flex flex-col mb-4 sm:table-row sm:mb-0">
                                <td className="grid grid-cols-2 px-6 py-2 text-sm text-gray-500 sm:py-4 whitespace-nowrap sm:table-cell">
                                    {formatToISODate(stats.submittedAt.toString())}
                                </td>
                                <td className="grid grid-cols-2 px-6 py-2 text-sm text-gray-500 sm:py-4 whitespace-nowrap sm:table-cell">
                                    <Link to={`/view-problem/${stats.problemId}`} className="cursor-pointer hover:text-blue-500 hover:underline w-[190px] whitespace-normal break-words">
                                        {stats.title}
                                    </Link>
                                </td>
                                <td className="grid grid-cols-2 px-6 py-2 text-sm sm:py-4 whitespace-nowrap sm:table-cell">
                                    <span className={`font-bold ${
                                        stats.status === 'Attempted' ? 'text-red-500' : 'text-green-500'
                                    }`}>
                                        {stats.status === 'Attempted' ? 'Wrong Answer' : 'Submitted'}
                                    </span>
                                </td>
                                <td className="grid grid-cols-2 px-6 py-2 text-sm sm:py-4 whitespace-nowrap sm:table-cell">
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
                                    {stats.language}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 mt-4 md:px-0">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Previous
                </button>
                <div className="flex items-center space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                                pageNum === currentPage
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default RecentActivityList;