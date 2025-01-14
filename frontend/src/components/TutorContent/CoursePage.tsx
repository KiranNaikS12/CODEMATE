import React, { useEffect, useState } from "react";
import { EllipsisVertical, Plus, Edit, Trash, ActivitySquare } from "lucide-react";
import { Link } from "react-router-dom";
import {  useListMyCourseQuery, useUpdateCourseStatusMutation } from "../../services/tutorApiSlice";
import { CourseTypes } from "../../types/courseTypes";
import { AnimatePresence, motion } from "framer-motion";
import { APIError } from "../../types/types";
import { toast, Toaster } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const CoursePage: React.FC = () => {
  const tutorInfo = useSelector((state: RootState) => state.tutor.tutorInfo)
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isExpand, setIsExpand] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [localCourse, setLocalCourse] = useState<CourseTypes[]>([]);
  const id = tutorInfo?._id;
  const { data: courseDetails } = useListMyCourseQuery(id || '', {
    skip: !id
  });
  const [updateCourseStatus] = useUpdateCourseStatusMutation()

  console.log(courseDetails?.data)

  useEffect(() => {
    if (courseDetails) {
      setLocalCourse(courseDetails.data)
    }
  }, [courseDetails]);

  const MAX_DESCRIPTION_LENGTH = 170;

  //togle for menubar
  const toggleMenu = (courseTitle: string) => {
    if (menuOpen === courseTitle) {
      setMenuOpen(null);
    } else {
      setMenuOpen(courseTitle)
    }
  }

  //toggle for description expand
  const toggleDescription = () => {
    setIsExpand(!isExpand)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => {
      clearInterval(timer);
    }
  }, []);

  const toggleCourseBlock = async (courseId: string, isBlocked: boolean) => {
    const action = isBlocked ? "Activated" : 'Blocked';
    try {
      const response = await updateCourseStatus({
        id: courseId,
        isBlocked: !isBlocked,
      }).unwrap();
      if (response) {
        setLocalCourse((prev) =>
          prev.map((course) =>
            course._id === courseId
              ? { ...course, isBlocked: !isBlocked }
              : course
          )
        );

        const textColor = isBlocked ? 'green' : 'red';
        toast.success(`course ${action} successfully`, {
          style: {
            color: textColor
          }
        });
        setMenuOpen(null);
      }
    } catch (error) {
      const apiError = error as APIError;
      if (apiError.data && apiError.data.message) {
        toast.error(apiError.data.message);
      }
    }
  }

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
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{ style: { backgroundColor: "#D8D8FD" } }}
        richColors
      />
      <div className="relative flex-1 p-6 pl-2">
        <div className="mt-2">
          <h1 className="flex items-center text-2xl font-medium text-themeColor">MY COURSES
            {isLoading ? (
              <div className="w-20 h-6 ml-2 bg-gray-300 rounded-md animate-pulse"></div>
            ) : (
              <span className="pl-2 text-sm font-medium rounded-full shadow-inner text-hoverColor">
                Total: {localCourse.length}
              </span>
            )}
          </h1>
        </div>
        {isLoading ? (
          <div className="flex mt-8 gap-x-5 animate-pulse">
            <div className="bg-gray-300 rounded-lg w-80 h-52"></div>
            <div className="flex flex-col justify-start gap-y-2 text-themeColor">
              <div className="w-64 h-8 bg-gray-300 rounded-md"></div>
              <div className="w-32 h-6 bg-gray-300 rounded-md"></div>
              <div className="w-[700px] h-4 bg-gray-300 rounded-md "></div>
              <div className="h-4 bg-gray-300 rounded-md w-[700px]"></div>
              <div className="flex items-center mt-14 gap-x-2">
                <div className="w-40 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="w-24 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="w-24 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="w-24 h-8 bg-gray-300 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
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
                      <div>
                        <button className="text-gray-700"
                          onClick={() => toggleMenu(course.title)}
                        >
                          <EllipsisVertical size={18} />
                        </button>
                        <AnimatePresence>
                          {menuOpen === course.title && (
                            <motion.div className="absolute z-20 w-40 mt-2 bg-white border rounded-lg shadow-lg right-2"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                              <ul className="py-1">
                                <li className="flex items-center px-4 py-2 m-1 space-x-2 rounded-md cursor-pointer hover:bg-green-200">
                                  <Edit size={16} />
                                  <span>Edit</span>
                                </li>
                                <li className={`flex items-center px-4 py-2 m-1 space-x-2 rounded-md cursor-pointer ${course.isBlocked ? 'hover:bg-green-200' : 'hover:bg-red-200'}`}
                                  onClick={() => toggleCourseBlock(course._id, course.isBlocked)}
                                >
                                  {course.isBlocked ? (
                                    <ActivitySquare size={16} />
                                  ) : (
                                    <Trash size={16} />
                                  )}
                                  <span>{course.isBlocked ? 'Activate' : 'Block'}</span>
                                </li>
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-highlightBlue">Total Lesson:{course.lesson}</span>
                    </div>
                    <motion.div
                      initial={{ height: isExpand ? 'auto' : 80 }}
                      animate={{ height: isExpand ? 'auto' : 80 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <p className="w-full xl:w-[660px] break-words xl:text-md lg:w-[500px] lg:text-md pr-4">
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
          </>
        )}
        <div className="flex flex-col min-h-screen p-2">
          <Link to='/tutor/home/course/upload'>
            <div>
              <button
                className="fixed flex items-center px-2 py-2 mb-6 mr-6 text-base border rounded-lg shadow-lg border-hoverColor text-customGrey bottom-3 right-6 hover:bg-customGrey hover:text-themeColor gap-x-2 bg-themeColor"
              >
                Upload Course
                <div className="p-1 border rounded-full border-highlightBlue bg-customGrey hover:bg-customGrey ">
                  <Plus className="w-4 h-4 md:w-5 md:h-5 text-themeColor" />
                </div>
              </button>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default CoursePage;
