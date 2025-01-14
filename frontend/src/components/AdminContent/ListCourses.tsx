import React, { useState } from 'react'
import { useListAllCourseQuery } from '../../services/adminApiSlice'
import { motion } from "framer-motion";
import { CourseTypes } from '../../types/courseTypes';
import useThrottle from '../../hooks/useThrottle';
import { Search } from 'lucide-react';


const ListCourses: React.FC = () => {
    const [isExpand, setIsExpand] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const throttledSearchTerm = useThrottle(searchTerm, 300)
    const { data: courseDetails } = useListAllCourseQuery({
        searchTerm: throttledSearchTerm
    });

    const toggleDescription = () => {
        setIsExpand(!isExpand)
    }

    const MAX_DESCRIPTION_LENGTH = 170;

    const renderDescription = (description: string | undefined) => {
        if (!description) return null;

        const shouldShowViewMore = description.length > MAX_DESCRIPTION_LENGTH;
        const displayText = isExpand || !shouldShowViewMore
            ? description
            : `${description.slice(0, MAX_DESCRIPTION_LENGTH)}...`;

        return (
            <>
                {displayText}
                {shouldShowViewMore && (
                    <button
                        onClick={toggleDescription}
                        className="mt-2 text-sm text-blue-500 underline"
                    >
                        {isExpand ? 'View Less' : 'View More'}
                    </button>
                )}
            </>
        );
    };


    return (
        <div className="flex flex-col min-h-screen p-2">
            <div >
                <h1 className="flex items-center mb-2 text-2xl font-semibold">
                    LIST OF COURSES
                    <span className="px-3 py-1 ml-2 text-sm font-medium border border-gray-400 rounded-full shadow-inner text-hoverColor">
                        Total: {courseDetails?.data.length}
                    </span>
                </h1>
            </div>
            <div className="relative w-full md:w-1/2">
                <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                    type="text"
                    placeholder="Search here..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-10 bg-white border rounded-lg shadow-md border-customGrey focus:outline-none focus:border-hoverColor"
                />
            </div>
            <div className='mb-4'>
                {courseDetails?.data && courseDetails?.data.length > 0 ? (
                    <div>
                        {courseDetails?.data.map((course: CourseTypes) => (
                            <div className="relative max-w-5xl p-6 mt-6 space-y-4 overflow-auto bg-gray-200 rounded-lg shadow-xl"
                                key={course.title}
                            >
                                <div className="flex gap-x-5">
                                    <div className="">
                                        <img src={course.coverImage} alt="" className="rounded-lg h-52 w-80" />
                                    </div>
                                    <div className="flex flex-col justify-start gap-y-2 text-themeColor">
                                        <div className="flex items-center justify-between">
                                            <h1 className="text-2xl font-bold">{course.title}
                                                <span className={`text-base font-medium px-1 ${course.isBlocked ? 'text-red-500' : 'text-green-500'}`}>
                                                    {course.isBlocked ? ' Blocked' : ' Active'}
                                                </span>
                                            </h1>
                                        </div>
                                        <div>
                                            <span className="text-sm text-highlightBlue">Total Lesson:{course.lesson}</span>
                                        </div>
                                        <motion.div
                                            initial={{ height: isExpand ? 'auto' : 80 }}
                                            animate={{ height: isExpand ? 'auto' : 80 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <p className="w-full xl:w-[680px] break-words xl:text-md lg:w-[500px] lg:text-md pr-4">
                                                {renderDescription(course.description)}
                                            </p>
                                        </motion.div>
                                        {!isExpand && (
                                            <div className="flex items-center mt-2 cursor-default gap-x-2">
                                                <motion.h1 className="flex justify-center px-3 py-2 text-sm border rounded-full bg-customGrey border-hoverColor"
                                                    whileHover={{ scale: 0.9 }}
                                                >{course.category}</motion.h1>
                                                <motion.h1 className="flex justify-center px-3 py-2 text-sm border rounded-full bg-customGrey border-hoverColor"
                                                    whileHover={{ scale: 0.9 }}
                                                >{course.subject}</motion.h1>
                                                <motion.h1 className="flex justify-center px-3 py-2 text-sm border rounded-full bg-customGrey border-hoverColor"
                                                    whileHover={{ scale: 0.9 }}
                                                >{course.level}</motion.h1>
                                                <motion.h1 className="flex justify-center px-3 py-2 text-sm border rounded-full bg-customGrey border-hoverColor"
                                                    whileHover={{ scale: 0.9 }}
                                                >{course.language}</motion.h1>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="relative flex items-center mt-20 justify-evenly">
                        <img
                            src="/not_found.png"
                            alt="not_found"
                            className="w-96 h-w-96"
                        />
                        <div className="absolute -bottom-6">
                            <h1 className="text-2xl text-gray-400">
                                Sorry! No result found.
                            </h1>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ListCourses
