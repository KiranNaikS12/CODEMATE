import React, { useEffect, useRef, useState } from 'react'
import Header from '../../components/Headers/Header'
import { useTrackVideoProgressMutation, useViewCourseDataQuery } from '../../services/userApiSlice';
import { useParams } from 'react-router-dom';
import CourseViewSidebar from '../../components/UserContent/CourseViewSidbar';
import { File, Globe, UserCircle, Video, Play, MessageCircle, PhoneCall } from 'lucide-react';
import ChatInterface from '../../components/UserContent/ChatInterface';
import UserNotFound from '../CommonPages/UserNotFound';
import { ErrorData } from '../../types/types';
import ListCallHistory from '../../components/ChatHandler/ListCallHistory';
import socketService from '../../services/socket.service';
import { ICallHistory } from '../../types/callHistoryTypes';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Swal from 'sweetalert2';
import Certificate from '../../components/Modals/Certificate';


const AcessCourse: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const userInfo = useSelector((state: RootState) => state.auth.userInfo)
    const { data: courseResponse, isError, error } = useViewCourseDataQuery(id!);
    const courseDetail = courseResponse?.data;
    const receiverId = courseDetail?.tutorId._id;
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isChatHistoryOpen, setIsChatHistoryOpen] = useState<boolean>(false);
    const [history, setHistory] = useState<ICallHistory[]>([]);
    const userId = userInfo?._id;
    const [trackVideoProgress] = useTrackVideoProgressMutation();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentVideoProgress, setCurrentVideoProgress] = useState({
        videoId: '',
        percentage: 0
    });
    const [certificateViewed, setCertificateViewed] = useState<boolean>(false)

    useEffect(() => {
        if (courseDetail?.chapters?.[0]?.videos?.[0]?.video) {
            setCurrentVideoUrl(courseDetail.chapters[0].videos[0].video);
        }

        if (receiverId) {
            const currentUserId = userId;
            if (currentUserId) {
                socketService.loadCallHistory((callHistories) => {
                    setHistory(callHistories)
                })
            }
        }

        return () => {
            socketService.unloadCallHistory();
        }

    }, [courseDetail, receiverId, userId]);

    useEffect(() => {
        if (courseDetail?.userProgress?.percentage === 100) {
            Swal.fire({
                title: 'Congratulations! ',
                text: 'You have successfully completed the course.',
                toast: true,
                position: 'top',
                background: '#AFE1AF',
                color: '#00000',
                confirmButtonText: 'Great!',
                customClass: {
                    popup: 'rounded-lg shadow-lg  border border-green-500'
                },
            });
        }
    }, [courseDetail?.userProgress]);


    const handleVideoProgress = async () => {
        const video = videoRef.current;
        if (!video || !courseDetail) return;

        const currentVideo = courseDetail?.chapters
            .flatMap(chapter => chapter?.videos)
            .find(videoObj => videoObj?.video === currentVideoUrl)

        if (!currentVideo) return;

        const percentage = (video.currentTime / video.duration) * 100;

        if (Math.abs(percentage - currentVideoProgress.percentage) >= 10) {
            setCurrentVideoProgress({
                videoId: currentVideo._id,
                percentage
            });

            if (percentage >= 89.5) {
                await trackVideoProgress({
                    userId: userId!,
                    courseId: id!,
                    chapterId: courseDetail?.chapters.find(chapter =>
                        chapter.videos.some(v => v._id === currentVideo._id)
                    )?._id || '',
                    videoId: currentVideo._id,
                    completed: true,
                })
            }
        }
    };



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

    const toggleCallHistory = () => {
        setIsChatHistoryOpen(!isChatHistoryOpen)
    }

    if (isError || error) {
        return (
            <UserNotFound errorData={error as ErrorData} />
        )
    }

    const handleCertificateView = () => {
        setCertificateViewed(!certificateViewed)
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
                    <div className='flex space-x-2'>
                        <button
                            onClick={toggleChat}
                            className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>Chat</span>
                        </button>
                        <button
                            onClick={toggleCallHistory}
                            className="flex items-center px-4 py-2 space-x-2 transition-colors bg-blue-200 border rounded-lg border-hoverColor"
                        >
                            <PhoneCall className="w-4 h-4" />
                            <span>Call History</span>
                        </button>
                    </div>
                    <ChatInterface
                        isOpen={isChatOpen}
                        onClose={() => setIsChatOpen(false)}
                        receiverId={receiverId}
                        fullname={courseDetail?.tutorName}
                        profile={courseDetail?.tutorId?.profileImage}
                    />
                    {isChatHistoryOpen && (
                        <ListCallHistory
                            onClose={() => setIsChatHistoryOpen(false)}
                            callHistory={history}
                            fullname={courseDetail?.tutorName}
                            profile={courseDetail?.tutorId?.profileImage}
                        />
                    )}
                </div>
                <div className='flex items-start mt-4 space-x-8'>
                    <div>
                        {/* VIDEO TAG */}
                        <video
                            ref={videoRef}
                            key={currentVideoUrl}
                            width="800" height="360" controls
                            className='rounded-lg'
                            onTimeUpdate={handleVideoProgress}
                        >
                            {currentVideoUrl ? (
                                <source src={currentVideoUrl} type="video/mp4" />
                            ) : (
                                <p>Video not available</p>
                            )}
                        </video>
                    </div>


                    <div className='flex flex-col p-2 px-4 bg-gray-200'>
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
                            <div className='flex flex-col justify-start mt-2'>
                                {courseDetail?.userProgress?.percentage === 100 && (
                                    <div className='flex flex-col justify-start mt-6'>
                                        <div className="p-4 pl-0 text-green-800 rounded-lg text-md dark:text-green-400" role="alert">
                                            <span className="font-medium"> Congratulations! </span>Now you can download your course certificate.
                                        </div>
                                        <div>
                                            <p
                                                className='text-sm text-blue-700 underline cursor-pointer'
                                                onClick={handleCertificateView}
                                            >
                                                Click Here To Download
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {certificateViewed && (
                                    <Certificate
                                        userName={courseDetail?.userName || ''}
                                        mentorName={courseDetail?.tutorName || 'Instructor'}
                                        courseName={courseDetail?.title || 'Course'}
                                        issueDate={new Date().toLocaleDateString()}
                                        onClose={() => setCertificateViewed(false)}
                                    />
                                )}
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
