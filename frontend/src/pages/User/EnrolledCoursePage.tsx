import React from 'react'
import Header from '../../components/Headers/Header'
import { useListEnrolledCourseQuery } from '../../services/userApiSlice';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom'


const EnrolledCoursePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: courseResponse } = useListEnrolledCourseQuery({ userId: id! }, { skip: !id });
    const course = courseResponse?.data || [];
    console.log(course);
    
    return (
        <div className='flex flex-col w-full min-h-screen bg-gray-200'>
            <Header />
            <div className='flex flex-col items-center w-full mb-8'>
                <div className='flex flex-col w-full max-w-[1200px] space-y-6 mx-auto mt-4'>

                    {/* Title Section */}
                    <div className='flex items-end space-x-2'>
                       <h1 className='text-3xl font-bold text-themeColor'>Enrolled Courses</h1>
                       <h1> {course.length === 0 ? "You haven't purchased any course yet" : `${course.length} Enrolled courses`}</h1>
                    </div>
                    

                    {/* Search Section */}
                    <div className="flex justify-center w-full">
                        <div className="relative flex items-center w-[1200px] gap-x-2">
                            <input
                                type="text"
                                placeholder="Search here for course"
                                className="w-full px-4 py-3 text-lg italic bg-white border border-gray-300 rounded-full focus:outline-none" />
                            <button className='px-12 py-3 rounded-full bg-themeColor text-customGrey'>
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Enrolled Courses or No Courses Found */}
                    {course.length <= 0 ? (
                        <div className="relative flex flex-col items-center mt-20 justify-evenly">
                            <img
                                src="/not_found.png"
                                alt="not_found"
                                className="w-96 h-w-96"
                            />
                            <div>
                                <Link to='/course'>
                                    <button className="px-3 py-2 rounded-lg shadow-inner bg-themeColor text-customGrey">Purchase Now</button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-[1200px] mx-auto mt-4">
                            {course.map((order, orderIndex) =>
                                order.items.map((item, itemIndex) => (
                                    <div
                                        key={`${orderIndex}-${itemIndex}`}
                                        className="flex-col p-2 bg-gray-200 rounded-md shadow-md"
                                    >
                                        <div className='relative z-10 p-1'>
                                            <img
                                                src={item.course?.coverImage || '/placeholder.jpg'} 
                                                alt="demoCourse.jpg"
                                                className="w-64 h-40 rounded-lg"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-y-1">
                                            <h1 className="text-lg font-bold text-themeColor">
                                                {item.course.title}
                                            </h1>
                                            <ul className="pl-5 mt-3 space-y-2 text-sm text-gray-500 list-disc">
                                                <li>Total Modules: {item.course?.chapters?.length }</li>
                                                <li>Total Videos:
                                                    <span className='ml-2'>
                                                        { item?.course?.chapters?.reduce((total, chapter) => total + chapter.videos.length, 0) || 0}
                                                    </span>  
                                                </li>
                                            </ul>
                                            <div className="flex w-full mt-3">
                                                <Link to ={ `/access-course/${item.course._id}`} className='block w-full'>
                                                    <button className='w-full px-2 py-2 rounded-lg shadow-md text-customGrey bg-themeColor hover:bg-highlightBlue'>
                                                        Continue Learning
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EnrolledCoursePage;
