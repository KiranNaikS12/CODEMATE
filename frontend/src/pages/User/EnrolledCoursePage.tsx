import React, { useState } from 'react'
import Header from '../../components/Headers/Header'
import { useListEnrolledCourseQuery } from '../../services/userApiSlice';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom'
import CourseProgress from '../../components/UserContent/CourseProgress';
import CourseCompletionAnimation from '../../components/UserContent/CourseCompletionAnimation';


const EnrolledCoursePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [completedCoursesShown, setCompletedCoursesShown] = useState<string[]>([]);
    const { data: courseResponse } = useListEnrolledCourseQuery({ userId: id! }, { skip: !id });
    const course = courseResponse?.data || [];

    
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
                                order.items.map((item, itemIndex) => {
                                    // Calculate total videos across all chapters

                                    const courseProgress = item.course.courseProgress;
                                    const totalVideos = item.course?.chapters?.reduce(
                                        (total, chapter) => total + chapter.videos.length, 0
                                    ) || 0;
                                    const completedVideos = courseProgress?.chapters.reduce((total, chapter) => 
                                        total + chapter.videos.filter(v => v.completed).length, 0
                                    ) || 0;
                                    const progressPercentage = courseProgress?.percentage || 0;

                                    return (
                                        <div
                                            key={`${orderIndex}-${itemIndex}`}
                                            className="relative z-10 flex-col p-2 bg-gray-200 rounded-md shadow-md"
                                        >   {progressPercentage === 100 && 
                                            !completedCoursesShown.includes(item.course._id) && (
                                               <CourseCompletionAnimation 
                                                   onClose={() => setCompletedCoursesShown(prev => 
                                                       [...prev, item.course._id]
                                                   )}
                                               />
                                           )}
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
                                                
                                                <CourseProgress 
                                                    totalVideos={totalVideos}
                                                    completedVideos={completedVideos}
                                                    percentage={progressPercentage}
                                                />
                                                
                                                <div className="flex w-full mt-3">
                                                    <Link to ={ `/access-course/${item.course._id}`} className='block w-full'>
                                                        <button className='w-full px-2 py-2 rounded-lg shadow-md text-customGrey bg-themeColor hover:bg-highlightBlue'>
                                                            Continue Learning
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EnrolledCoursePage;
