import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { clearCredentials } from "../../store/slices/tutorSlice";
import { useNavigate } from "react-router-dom";

const DashBoard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | ''>('')
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tutorInfo = useSelector((state: RootState) => state.tutor.tutorInfo);

  console.log(tutorInfo)

  useEffect(() => {
    if (tutorInfo) {
      setUserName(tutorInfo.username);
      if(tutorInfo.isBlocked){
        dispatch(clearCredentials())
        navigate('/tutor/login')
      }
    }
  }, [tutorInfo, dispatch, navigate])

 

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  return (
    <div className="relative flex-1 p-6">
      <div className="absolute left-0 z-10 p-6 mt-4 space-y-4 overflow-auto bg-gray-200 rounded-lg shadow-lg -top-4 ">
        {loading ? (
          <>
            <div className="w-64 h-8 bg-gray-300 rounded-md animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-300 rounded-md animate-pulse"></div>
            <div className="h-4 w-full xl:w-[980px] lg:w-[550px] bg-gray-300 rounded-md animate-pulse"></div>
            <div className="h-4 w-full xl:w-[980px] lg:w-[550px] bg-gray-300 rounded-md animate-pulse"></div>
            <div className="h-4 w-3/4 xl:w-[980px] lg:w-[550px] bg-gray-300 rounded-md animate-pulse"></div>
          </>
        ) : (
          <>
            <h1 className="mb-4 text-xl font-bold text-themeColor">Welcome Back :)</h1>
            <h1 className="mb-4 text-themeColor">{userName}</h1>
            <p className="w-full xl:w-[980px] break-words xl:text-md lg:w-[550px] lg:text-md text-themeColor ">
              Welcome to your tutor dashboard! Here, you can manage your
              courses, track student progress, and access teaching resources.
              Stay updated with the latest notifications and ensure your
              students receive the best learning experience.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default DashBoard;
