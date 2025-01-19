import React, { useState } from 'react'
import Header from '../../components/Headers/Header'
import CommonButton from '../../components/Buttons/CommonButton'
import ReactStars from "react-stars";
import { CircleChevronRight, ShoppingCart } from 'lucide-react';
import { useAddToCartMutation, useAddToWishlistMutation, useListAllCourseQuery, useListTutorProfileQuery } from '../../services/userApiSlice';
import { CourseTypes } from '../../types/courseTypes';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { toast, Toaster } from 'sonner';
import { APIError } from '../../types/types';
import { motion } from 'framer-motion';
import { Player } from "@lottiefiles/react-lottie-player";
import { Tutor } from '../../types/tutorTypes';
import { FaHeart, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';


const UserCoursePage: React.FC = () => {
    const [isClicked, setIsClicked] = useState<Record<string, boolean>>({});
    const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);
    const [isCartAdded, setIsCartAdded] = useState<Record<string, boolean>>({});
    const userInfo = useSelector((state: RootState) => state.auth.userInfo);
    const { data: courseDetails } = useListAllCourseQuery('');
    const { data: tutorData } = useListTutorProfileQuery()
    const [addToCart,] = useAddToCartMutation();
    const [addToWishlist] = useAddToWishlistMutation();



    //handle_cart_submit
    const handleCartSubmit = async (userId: string, courseId: string) => {
        if (!userId) {
            return;
        }
        try {
            const response = await addToCart({ userId, courseId }).unwrap();
            if (response) {
                setIsCartAdded((prev) => ({
                    ...prev,
                    [courseId]: true
                }))
                toast.success(response?.message);
                setTimeout(() => {
                    setIsCartAdded((prev) => ({
                        ...prev,
                        [courseId]: false
                    }))
                }, 2000)

            }
        } catch (error) {
            const apiError = error as APIError;
            if (apiError.data && apiError.data.message) {
                toast.error(apiError.data.message);
            }
        }
    }


    //handle wishlist submit
    const handleWishlistSubmit = async (userId: string, courseId: string) => {
        try {
            const response = await addToWishlist({ userId, courseId }).unwrap();
            if (response) {
                setIsClicked((prev) => ({
                    ...prev,
                    [courseId]: true
                }));
                toast.success(response?.message);
                setTimeout(() => {
                    setIsClicked((prev) => ({
                        ...prev,
                        [courseId]: false,
                    }));
                }, 2200);
            }
        } catch (error) {
            const apiError = error as APIError;
            if (apiError.data && apiError.data.message) {
                toast.error(apiError.data.message);
            }
        }
    }

    const hanldeMourseEnter = (courseId: string) => {
        console.log(courseId)
        setHoveredCourse(courseId)
    }

    const hanldeMourseLeave = () => {
        setHoveredCourse(null);
    }

    return (
        <>
            <Toaster
                position="bottom-center"
                richColors
            />
            <div className='flex flex-col w-full min-h-screen bg-gray-200'>
                <Header />
                <div className='flex flex-col w-full'>
                    <div className='flex flex-col items-center justify-center w-full'>

                        {/* COURSE BANNER SECTION */}
                        <div className='w-[1200px] h-[280px] rounded-lg relative'>
                            <img src="/courseBanner3.jpg" alt="Course Banner" className='object-cover w-full h-full rounded-lg opacity-100' />
                            <div className='absolute inset-0 flex flex-col items-center justify-center text-customGrey'>
                                <h1 className='mb-2 text-4xl font-bold'>
                                    Unlock Your Potential With CodeMate
                                </h1>
                                <p className='text-lg max-w-[1100px]'>
                                    Welcome to Byway, where learning knows no bounds. We believe that
                                    education is the key to personal and professional growth,
                                </p>
                                <p>and we're here to guide you on your journey to success. </p>
                                <CommonButton className='px-2 py-2 mt-4 border rounded-md border-customGrey' buttonText='Browse Course' />
                            </div>
                        </div>

                        {/* STATISITICS SECTION */}
                        <div className='flex justify-center w-full mt-14'>
                            <div className='flex justify-between w-[1200px] text-themeColor'>
                                <div className='text-center'>
                                    <h2 className='text-3xl font-bold'>1000+</h2>
                                    <p className='text-sm'>Active enrolled students</p>
                                </div>
                                <div className='px-8 text-center border-l border-gray-300'>
                                    <h2 className='text-3xl font-bold'>250+</h2>
                                    <p className='text-sm'>Best quality mentors</p>
                                </div>
                                <div className='px-8 text-center border-l border-gray-300'>
                                    <h2 className='text-3xl font-bold'>500+</h2>
                                    <p className='text-sm'>Courses by our mentors</p>
                                </div>
                                <div className='px-8 text-center border-l border-gray-300'>
                                    <h2 className='text-3xl font-bold'>15+</h2>
                                    <p className='text-sm'>Best quality categories</p>
                                </div>
                            </div>
                        </div>

                        {/* SEARCH SECTION */}
                        <div className="flex justify-center w-full mt-16">
                            <div className="relative flex items-center w-[1200px] gap-x-2">
                                {/* <Search className="absolute w-4 h-4 ml-6 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" /> */}
                                <input
                                    type="text"
                                    placeholder="Search here for course,tutors...."
                                    className="w-full px-4 py-3 text-lg italic bg-white border border-gray-300 rounded-full focus:outline-none" />
                                <button className='px-12 py-3 rounded-full bg-themeColor text-customGrey'>
                                    search
                                </button>
                            </div>
                        </div>

                        {/* COURSE SECTION */}
                        <div className='flex justify-center w-full mt-12 '>
                            <div className='flex justify-between w-[1200px]'>
                                <h1 className='text-2xl font-medium'>Top Courses</h1>
                                <button className='text-sm font-normal text-blue-500'>
                                    <div className='flex items-center gap-x-1'>
                                        See More
                                        <CircleChevronRight size={16} color='#3B82F6' />
                                    </div>
                                </button>
                            </div>
                        </div>
                        {/* COURSE CARD SECTION */}
                        <div className="flex justify-center w-full mt-4 mb-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-[1200px] mx-auto">
                                {courseDetails?.data.map((course: CourseTypes) => (
                                    <motion.div
                                        className="flex flex-col bg-gray-200 rounded-md shadow-md h-[400px] w-full" // Fixed height
                                        whileHover={{ scale: 1.02 }}
                                        key={course.title}
                                        onMouseEnter={() => hanldeMourseEnter(course._id)}
                                        onMouseLeave={hanldeMourseLeave}
                                    >
                                        {/* Animation overlays */}
                                        {isClicked[course._id] && hoveredCourse === course._id && (
                                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black rounded-md bg-opacity-30">
                                                <Player
                                                    autoplay
                                                    loop
                                                    src="/wishlistgif.json"
                                                    style={{ height: '200px', width: '200px' }}
                                                />
                                            </div>
                                        )}
                                        {isCartAdded[course._id] && hoveredCourse === course._id && (
                                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black rounded-md bg-opacity-30">
                                                <Player
                                                    autoplay
                                                    loop
                                                    src="/cartgif.json"
                                                    style={{ height: '200px', width: '200px' }}
                                                />
                                            </div>
                                        )}

                                        {/* Image container with fixed height */}
                                        <div className="relative h-40 p-1">
                                            <img
                                                src={course.coverImage}
                                                alt="demoCourse.jpg"
                                                className="object-cover w-full h-full rounded-lg"
                                            />
                                            <motion.div
                                                className="absolute z-30 px-2 py-2 rounded-full opacity-75 bg-gray-50 top-2 right-2"
                                                onClick={() => handleWishlistSubmit(userInfo!._id, course._id)}
                                                whileTap={{ scale: 1.2 }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <FaHeart
                                                    style={{
                                                        color: isClicked[course._id] ? "red" : "gray",
                                                    }}
                                                    size={24}
                                                    className="cursor-pointer"
                                                />
                                            </motion.div>
                                        </div>

                                        {/* Content container with fixed heights and overflow handling */}
                                        <div className="flex flex-col flex-grow p-4">
                                            <div className="flex-grow">
                                                <h1 className="mb-1 text-lg font-bold text-themeColor line-clamp-2">
                                                    {course.title}
                                                </h1>
                                                <h4 className="text-sm text-gray-500 line-clamp-1">
                                                    By {course.tutorName}
                                                </h4>
                                                <h1 className="mt-1">
                                                    Rs.<span className="text-lg font-medium text-themeColor">
                                                        {course.price}
                                                    </span>
                                                </h1>
                                                <ReactStars
                                                    count={5}
                                                    value={4.5}
                                                    size={22}
                                                    color2={'#ffd700'}
                                                    edit={false}
                                                />
                                                <h1 className="text-sm text-gray-500 line-clamp-1">
                                                    {course.category}. {course.level}
                                                </h1>
                                            </div>

                                            {/* Buttons container with fixed position at bottom */}
                                            <div className="flex gap-x-2">
                                                <Link to={`/view-course/${course._id}`} className="w-1/2">
                                                    <button
                                                        className={`w-full px-6 py-2 border rounded-lg border-hoverColor 
                                                        ${course.isBlocked ? 'cursor-not-allowed opacity-50' : ''}`
                                                        }
                                                        disabled={course.isBlocked}
                                                    >
                                                        View
                                                    </button>
                                                </Link>
                                                <motion.button
                                                    className={`w-full px-2 py-2 rounded-lg ${course.isBlocked
                                                            ? "bg-gray-400 cursor-not-allowed text-gray-700"
                                                            : "bg-themeColor text-customGrey"
                                                        }`}
                                                    whileHover={course.isBlocked ? {} : { background: "#3D3D7E" }}
                                                    onClick={() => {
                                                        if (!course.isBlocked) {
                                                            handleCartSubmit(userInfo!._id, course._id);
                                                        }
                                                    }}
                                                    disabled={course.isBlocked}
                                                >
                                                    <div className="flex items-center justify-center gap-x-2">
                                                        <ShoppingCart size={18} />
                                                        {course.isBlocked ? "Unavailable" : "Add To Queue"}
                                                    </div>
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    {/* TUTOR SECTION */}
                    <div className='flex items-center justify-center w-full mt-12'>
                        <div className='flex justify-between w-[1200px]'>
                            <h1 className='text-2xl font-medium'>Top Mentors</h1>
                            <button className='text-sm font-normal text-blue-500'>
                                <div className='flex items-center gap-x-1'>
                                    See More
                                    <CircleChevronRight size={16} color='#3B82F6' />
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className='mb-4'>
                        <div className='flex w-[1200px] mt-5 space-x-4'>
                            {tutorData?.data.map((tutor: Tutor) => (
                                <motion.div className='flex flex-col items-center justify-center p-5 pb-4 bg-gray-200 rounded-md'
                                    key={tutor._id}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className=''>
                                        <img src={tutor.profileImage || '/profile.webp'} alt="profile" className='object-cover rounded-full w-36 h-36' />
                                    </div>
                                    <div className='flex flex-col items-center justify-center p-2 gap-y-1'>
                                        <h1 className='text-lg font-medium text-hoverColor'>James Rodri</h1>
                                        <h1 className='text-sm font-thin text-highlightBlue'>Full Stack Developer</h1>
                                    </div>
                                    <hr className='w-full border-t-2 border-customGrey' />
                                    <div className="flex justify-between mt-2 gap-x-6 text-highlightBlue">
                                        <h1 className='flex items-center text-sm gap-x-1'><span><FaStar style={{ color: "#ffd700", fontSize: "16px" }} /></span> 4.5</h1>
                                        <h1 className='text-sm'>100 students</h1>
                                    </div>
                                    <motion.button className='w-full px-2 py-2 mt-3 rounded-lg bg-themeColor text-customGrey'
                                        whileHover={{ background: '#3D3D7E' }}
                                    >
                                        View Profile
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div >
        </>
    )
}

export default UserCoursePage
