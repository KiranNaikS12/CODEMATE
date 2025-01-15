import React, { useState } from 'react'
import { MessageCircle } from 'lucide-react';
import TutorChatInterface from './TutorChatInterface';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useGetEnrolledUserQuery } from '../../services/tutorApiSlice';

const EnrolledStudents: React.FC = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const tutorInfo = useSelector((state: RootState) => state.tutor.tutorInfo);
    const id = tutorInfo?._id;
    const { data: studentDetails } = useGetEnrolledUserQuery(id || '', {
        skip: !id
    })

    const studentData = studentDetails?.data

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen)
    }

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
                        {studentData?.map((user) => (
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
                                <TutorChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} data={user}  />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default EnrolledStudents
