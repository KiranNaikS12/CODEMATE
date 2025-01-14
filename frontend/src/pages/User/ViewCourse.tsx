import React, { useState } from 'react';
import Header from '../../components/Headers/Header';
import { Globe, UserCircle } from 'lucide-react';
import ReviewSection from '../../components/ReviewSection/ReviewSection';
import { useParams } from 'react-router-dom';
import { useAddToCartMutation, useViewCourseDataQuery } from '../../services/userApiSlice';
import usePriceCalculations from '../../hooks/usePriceCalculation';
import ReactStars from 'react-stars';
import { toast, Toaster } from 'sonner';
import { APIError, ErrorData } from '../../types/types';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import UserNotFound from '../CommonPages/UserNotFound';

const ViewCourse: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState('description');
    const userInfo = useSelector((state: RootState) => state.auth.userInfo);
    const { data: courseResoponse, isError, error } = useViewCourseDataQuery(id!);
    const courseDetail = courseResoponse?.data;
    const { formatPrice, calculateDiscountPrice } = usePriceCalculations();
    const [addToCart] = useAddToCartMutation();

    const handleCartSubmit = async (userId: string, courseId: string) => {
        if (!userId) {
            return;
        }
        try {
            const response = await addToCart({ userId, courseId }).unwrap();
            if (response) {
                toast.success(response?.message);
            }
        } catch (error) {
            const apiError = error as APIError;
            if (apiError.data && apiError.data.message) {
                toast.error(apiError.data.message);
            }
        }
    }

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
    };

    const formatRating = courseDetail?.averageRating
        ? parseFloat(courseDetail.averageRating.toFixed(2))
        : 0;


    if(isError || error) {
        return (
            <UserNotFound errorData={error as ErrorData} />
        )
    }

    return (
        <>
            <Toaster
                position="bottom-center"
                richColors
            />
            <div className="flex flex-col w-full min-h-screen bg-customGrey">
                <Header />
                <div className='flex items-center justify-center p-5 pt-0'>
                    <div className="w-full p-6 rounded-md max-w-8xl">
                        <div className="flex items-start justify-between space-x-4">
                            {/* div1 */}
                            <div className="flex-1 space-y-4 text-gray-500">
                                <h1 className="text-4xl font-medium text-themeColor">{courseDetail?.title}</h1>
                                <div className="">
                                    <p className='break-words w-[1000px]'>
                                        {courseDetail?.description}
                                    </p>
                                </div>
                                <div className='flex items-center space-x-4'>
                                    <div className='flex items-center space-x-2 '>
                                        <h1>
                                            <ReactStars
                                                count={5}
                                                size={28}
                                                color2={'#ffd700'}
                                                half={true}
                                                value={courseDetail?.averageRating}
                                            />
                                        </h1>
                                        <h1 className='mt-1 text-base text-themeColor'>
                                            {formatRating} <span className='text-sm text-gray-500'>Average Ratings.</span>
                                        </h1>
                                    </div>
                                </div>
                                <div className='mt-0 text-highlightBlue'>
                                    <p>
                                        <span className='pr-3'> Total Lessons: {courseDetail?.lesson}</span>
                                        <span className='pr-3'> {courseDetail?.subject}</span>
                                        <span className='pr-3'> {courseDetail?.category}</span>
                                        <span className='pr-3'> {courseDetail?.level}</span>
                                    </p>
                                </div>
                                <div className='flex items-center gap-x-2'>
                                    <UserCircle size={20} className='' />
                                    <h1 className=''>Course create by <span className='text-themeColor'>{courseDetail?.tutorName}</span></h1>
                                </div>
                                <div className='flex items-center gap-x-2'>
                                    <Globe size={20} className='' />
                                    <h1>Language: <span className='text-themeColor'>{courseDetail?.language}</span></h1>
                                </div>
                                <div>
                                    <h1 className='flex items-center gap-2 mt-10 text-2xl text-green-600'>{formatPrice(calculateDiscountPrice(courseDetail?.price || 0, courseDetail?.discount || 0))}
                                        <span className='text-base text-gray-500 line-through'>{formatPrice(courseDetail?.price || 0)} </span>
                                        <span className={`text-base ${courseDetail?.discount === 0 ? 'text-red-500' : 'text-green-500'}`}>
                                            {courseDetail?.discount === 0 ? 'currently no offers available' : `${courseDetail?.discount}%off available`}
                                        </span>
                                    </h1>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center w-full max-w-sm">
                                <div className="flex flex-col items-center w-full">
                                    <img src={courseDetail?.coverImage} alt={courseDetail?.title} className="object-cover w-full h-48 rounded-lg" />
                                    <div className="w-full mt-4">
                                        {courseDetail && courseDetail?.isBlocked ? (
                                            <button
                                                className="flex items-center justify-center w-full py-3 mb-3 space-x-2 text-lg text-red-500 rounded-lg cursor-not-allowed bg-gradient-to-r from-themeColor to-highlightBlue"
                                                disabled
                                            >
                                                Currently Unavilable
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleCartSubmit(userInfo!._id, courseDetail!._id)}
                                                className="w-full py-3 mb-3 rounded-lg text-customGrey bg-gradient-to-r from-themeColor to-highlightBlue">
                                                Add To Queue
                                            </button>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16">
                            <div className="flex space-x-48 border-b border-gray-300">
                                <button
                                    className={`px-4 py-2 text-md font-medium ${activeTab === 'description' ? 'border-b-2 border-themeColor text-themeColor' : 'text-gray-500'}`}
                                    onClick={() => handleTabClick('description')}
                                >
                                    Description
                                </button>
                                <button
                                    className={`px-4 py-2 text-md font-medium ${activeTab === 'syllabus' ? 'border-b-2 border-themeColor text-themeColor ' : 'text-gray-500'}`}
                                    onClick={() => handleTabClick('syllabus')}
                                >
                                    Syllabus
                                </button>
                                <button
                                    className={`px-4 py-2 text-md font-medium ${activeTab === 'reviews' ? 'border-b-2 border-themeColor text-themeColor ' : 'text-gray-500'}`}
                                    onClick={() => handleTabClick('reviews')}
                                >
                                    Reviews
                                </button>
                                <button
                                    className={`px-4 py-2 text-md font-medium ${activeTab === 'instructor' ? 'border-b-2 border-themeColor text-themeColor ' : 'text-gray-500'}`}
                                    onClick={() => handleTabClick('instructor')}
                                >
                                    Instructor
                                </button>
                            </div>

                            <div className="mt-4">
                                {activeTab === 'description' && (
                                    <div>
                                        <p className='text-gray-500 break-words w-[1000px]'>{courseDetail?.description}</p>
                                    </div>
                                )}
                                {activeTab === 'syllabus' && (
                                    <div>
                                        <p>This is the syllabus content.</p>
                                    </div>
                                )}
                                {activeTab === 'reviews' && (
                                    <>
                                        <ReviewSection id={courseDetail?._id} avgRating={courseDetail?.averageRating} reviewCount={courseDetail?.reviewCount} formattedRating={formatRating} />
                                    </>
                                )}
                                {activeTab === 'instructor' && (
                                    <div>
                                        <p>This is the instructor content.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewCourse;