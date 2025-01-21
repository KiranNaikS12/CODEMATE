import React, { useEffect, useState } from 'react'
import Header from '../../components/Headers/Header'
import { useViewCourseDataQuery } from '../../services/userApiSlice';
import { useParams } from 'react-router-dom';
import CourseViewSidebar from '../../components/UserContent/CourseViewSidbar';
import { File, Globe, UserCircle, Video, Play, MessageCircle } from 'lucide-react';
import ChatInterface from '../../components/UserContent/ChatInterface';
import UserNotFound from '../CommonPages/UserNotFound';
import { ErrorData } from '../../types/types';


const AcessCourse: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: courseResponse, isError, error } = useViewCourseDataQuery(id!);
    const courseDetail = courseResponse?.data;
    console.log('courseDetails', courseDetail)
    const receiverId = courseDetail?.tutorId._id;

    console.log(receiverId)

    const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
    const [isChatOpen, setIsChatOpen] = useState(false)

    useEffect(() => {
        if (courseDetail?.chapters?.[0]?.videos?.[0]?.video) {
            setCurrentVideoUrl(courseDetail.chapters[0].videos[0].video);
        }
    }, [courseDetail]);

    // Flatten all videos and exclude the first video
    const upNextVideos = courseDetail?.chapters
        ?.flatMap(chapter => chapter.videos)
        ?.filter(video => video.video !== currentVideoUrl) || [];


    const handleVideoClick = (videoUrl: string) => {
        setCurrentVideoUrl(videoUrl)
    }

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen)
    }

    if (isError || error) {
        return (
            <UserNotFound errorData={error as ErrorData} />
        )
    }

    return (
        <div className='flex flex-col w-full min-h-screen bg-gray-200'>
            <Header />

            {/* SIDEBAR */}
            <div className='ml-4'>
                <CourseViewSidebar chapters={courseDetail?.chapters} />
            </div>

            {/* MAIN MENU */}
            <div className='p-4 ml-24 md:ml-24'>

                {/* COURSE TITLE */}
                <div className='flex items-center justify-between'>
                    <h1 className='text-2xl font-bold text-themeColor'>{courseDetail?.title}</h1>
                    <button
                        onClick={toggleChat}
                        className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat</span>
                    </button>
                    <ChatInterface
                        isOpen={isChatOpen}
                        onClose={() => setIsChatOpen(false)}
                        receiverId={receiverId}
                        fullname={courseDetail?.tutorName}
                        profile={courseDetail?.tutorId?.profileImage}
                    />
                </div>
                <div className='flex items-start mt-4 space-x-8'>
                    <div>
                        {/* VIDEO TAG */}
                        <video
                            key={currentVideoUrl}
                            width="800" height="360" controls
                            className='rounded-lg'
                        >
                            {currentVideoUrl ? (
                                <source src={currentVideoUrl} type="video/mp4" />
                            ) : (
                                <p>Video not available</p>
                            )}
                        </video>
                    </div>


                    <div className='flex flex-col p-2 px-4 bg-white'>
                        <div className='flex justify-start'>
                            <h1 className='text-xl font-medium text-gray-600'>About Course</h1>
                        </div>
                        <div className='flex flex-col mt-6'>
                            <p className='w-[600px] break-words text-gray-600'>{courseDetail?.description}</p>
                            <div className='flex items-center mt-6 space-x-1 text-gray-600'>
                                <UserCircle size={20} />
                                <h1 className=''>Author: <span className='text-themeColor'>{courseDetail?.tutorName}</span></h1>
                            </div>
                            <div className='flex items-center mt-4 space-x-1 text-gray-600'>
                                <Globe size={20} />
                                <h1><span className='text-text-gray-600'>{courseDetail?.language}</span></h1>
                            </div>
                            <div className='flex items-center mt-4 space-x-1 text-gray-600'>
                                <File size={20} />
                                <h1>Total Modules: <span className='text-themeColor'>{courseDetail?.chapters.length}</span></h1>
                            </div>
                            <div className='flex items-center mt-4 space-x-1 text-gray-600'>
                                <Video size={20} />
                                <h1>Total Videos: <span className='text-themeColor'>{courseDetail?.chapters.reduce((total, chapter) => total + chapter.videos.length, 0) || 0}</span></h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* UP NEXT VIDEOS */}
                <div className='mt-8'>
                    <h2 className='mb-4 text-xl font-semibold text-gray-700'>Up Next</h2>
                    <div className='flex flex-row flex-wrap gap-4'>
                        {upNextVideos.length > 0 ? (
                            upNextVideos.map((video) => {
                                if (video.video === currentVideoUrl) return null;

                                // Find the module (chapter) that the video belongs to
                                const chapterIndex = courseDetail?.chapters?.findIndex((chapter) =>
                                    chapter.videos.some((v) => v._id === video._id)
                                );
                                const moduleNumber = chapterIndex !== -1 ? chapterIndex! + 1 : 0;

                                return (
                                    <div
                                        key={video._id}
                                        className="flex items-center p-3 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-100 transition-colors duration-200 w-[calc(33.333%-1rem)] py-4"
                                        onClick={() => handleVideoClick(video.video)}
                                    >
                                        <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-themeColor">
                                            <Play size={20} className="text-white" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-medium text-gray-800 truncate">{video.title}</h3>
                                            {/* Display chapter/module number dynamically */}
                                            <p className="text-sm text-gray-500">From Module {moduleNumber}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-500">No more videos available.</p>
                        )}
                    </div>
                </div>
            </div>


        </div>
    )
}

export default AcessCourse
