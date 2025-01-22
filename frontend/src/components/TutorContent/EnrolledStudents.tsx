import React, { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react';
import TutorChatInterface from './TutorChatInterface';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useGetEnrolledUserQuery } from '../../services/tutorApiSlice';

const EnrolledStudents: React.FC = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [totalStudents, setTotalStudents] = useState(0);
    const tutorInfo = useSelector((state: RootState) => state.tutor.tutorInfo);
    const id = tutorInfo?._id;
    const { data: studentDetails } = useGetEnrolledUserQuery({
        tutorId: id!,
        page: currentPage,
        limit: itemsPerPage
    })

    const studentData = studentDetails?.data

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen)
    }

    useEffect(() => {
        if (studentDetails) {
            setTotalStudents(studentDetails?.data?.total)
        }
    }, [studentDetails]);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="relative flex-1 p-6 pl-2 overflow-auto">
            <div className='mt-2'>
                <div className="flex justify-between mt-2">
                    <h1 className="flex items-center text-2xl font-medium text-themeColor">Enrolled Students</h1>

                </div>
            </div>

            <div className="mt-4">
                <table className="w-3/4 overflow-hidden bg-white rounded-lg shadow-lg">
                    <thead className="text-white bg-gradient-to-r from-highlightBlue to-themeColor ">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase">Profile</th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase">Name</th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase">Email</th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase">Country</th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {studentData?.users?.map((user) => (
                            <tr
                                key={user._id}
                                className="transition duration-300 ease-in-out hover:bg-gray-50"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 w-10 h-10">
                                            <img
                                                className="object-cover w-10 h-10 border-2 rounded-full border-hoverColor"
                                                src={user.profileImage || '/profile.webp'}
                                                alt={`${user.username}'s profile`}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {user.fullname ? user.fullname : user.username}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{user.country}</div>

                                </td>
                                <td>
                                    <button
                                        onClick={toggleChat}
                                        className="flex items-center px-4 py-2 space-x-2 text-white transition-colors rounded-lg bg-hoverColor hover:bg-blue-600"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span>Chat</span>
                                    </button>
                                </td>
                                <TutorChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} data={user} />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between max-w-5xl mt-4 ">
                <div>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-400 rounded-lg shadow-none bg-customGrey focus:outline-none focus:border-hoverColor"
                    >
                        {[8, 12].map((size) => (
                            <option key={size} value={size}>
                                Show {size} rows per page
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center justify-center gap-x-2">
                    {/* previous */}
                    <button
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={`px-4 py-2 bg-gray-300 rounded-md ${currentPage === 1
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-400"
                            }`}
                    >
                        Previous
                    </button>

                    <div className="flex gap-2">
                        {Array.from({ length: Math.ceil(totalStudents / itemsPerPage) }, (_, i) => i + 1).map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-4 py-2 rounded-md ${pageNum === currentPage
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-300 hover:bg-gray-400"
                                    }`}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>
                    {/* next */}
                    <button
                        disabled={currentPage === Math.ceil(totalStudents / itemsPerPage)}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={`px-4 py-2 bg-gray-300 rounded-md ${currentPage === Math.ceil(totalStudents / itemsPerPage)
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-400"
                            }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EnrolledStudents
