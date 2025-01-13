import { useEffect } from "react";
import CommonButton from "../../components/Buttons/CommonButton";
import DateTime from "../../components/HelperContent/DateTime";

import Header from "../../components/Headers/Header";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Link, useNavigate } from "react-router-dom";
import { clearCredentials } from "../../store/slices/authSlice";
import { motion } from "framer-motion";
import { FaExpand, FaGraduationCap, FaTrophy, FaWallet } from "react-icons/fa";
import { MdEditDocument } from "react-icons/md";
import HeatMapComponent from "../../components/UserContent/HeatMapComponent";
import RadialChart from "../../components/UserContent/RadialChart";
import { useGetDashboardStatsQuery, useGetProblemCountQuery, useGetUserProgressDataQuery } from "../../services/userApiSlice";
import Greetings from "../../components/HelperContent/Greetings";
import HomeTabs from "../../components/UserContent/HomeTabs";

const UserHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const userId = userInfo?._id


  const { data: userResponse } = useGetUserProgressDataQuery(userId);
  const userData = userResponse?.data;
  const { data: problemResponse } = useGetProblemCountQuery('');
  const problemCounts = problemResponse?.data;
  const { data: dashStats } = useGetDashboardStatsQuery(userId);
  
  useEffect(() => {
    if (userInfo) {
      if (userInfo.isBlocked) {
        dispatch(clearCredentials());
        navigate("/login");
      }
    }
  }, [userInfo, dispatch, navigate]);


  const totalSolved = (userData?.solvedEasy?.solvedCount || 0) + (userData?.solvedMedium?.solvedCount || 0) + (userData?.solvedHard?.solvedCount || 0);

  return (
    <div className="flex flex-col w-full min-h-screen bg-customGrey">
      <Header />
      <div className="flex items-start ">
        <div>
          {/* first section */}
          <div className="flex flex-col items-center justify-center pt-2 pr-4 sm:flex-row lg:pr-36 lg:pl-36 gap-x-4 gap-y-4 ">
            <div className="relative w-full p-2 pt-2 pb-1 overflow-hidden rounded-lg shadow-lg bg-themeColor basis-3/4">
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none -left-6">
                <motion.h1 className="text-[45px] md:text-[130px] font-extrabold text- tracking-wider select-none leading-none font-rubik-wet-paint">
                  {["C", "O", "D", "E", "M", "A", "T", "E"].map((letter, index) => (
                    <motion.span
                      key={index}
                      animate={{
                        opacity: [0.1, 0.3, 0.1],
                        textShadow: [
                          "0 0 0px rgba(255,255,255,0.1)",
                          "0 0 20px rgba(255,255,255,0.3)",
                          "0 0 0px rgba(255,255,255,0.1)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2,
                        ease: "easeInOut",
                      }}
                      className="inline-block"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </motion.h1>
              </div>
              <div className="relative flex flex-col items-start justify-between h-full sm:flex-row ">
                <div className="flex flex-col items-start justify-start p-2 sm:p-4 gap-y-2">
                  <div className="bg-[#3D3D7E] flex justify-center py-1 px-1 rounded-md text-customGrey md:py-2 md:px-2">
                    <DateTime />
                  </div>
                  <div className="flex-col py-5 text-xs font-normal text-customGrey md:text-1xl sm:text-xl">
                    <div className="flex-col font-medium sm:text-base">
                      <h1 className="flex ">
                        <Greetings />!
                      </h1>
                      <h1 className="">{userInfo?.username}</h1>
                    </div>
                  </div>

                  <div className="-mt-2">
                    <CommonButton
                      buttonText="START CODING"
                      className="px-1 py-1 text-xs border rounded-md text-customGrey border-hoverColor md:text-sm md:px-2 md:py-2"
                    />
                  </div>
                </div>
                <div className="absolute right-0 flex justify-end w-36 sm:w-64 -bottom-2 sm:right-16 md:right-0 md:w-48">
                  <img
                    src="/man-with-computer-vector.png"
                    alt="vector"
                    className="object-contain h-auto max-w-full"
                  />
                </div>
              </div>
            </div>

            <div className="relative items-center justify-center rounded-lg shadow-lg bg-themeColor text-customGrey shrink-0 sm:w-[400px] w-full overflow-hidden">
              <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden pointer-events-none opacity-20 -right-52 -top-24">
                <img
                  src="/splash.png"
                  alt="splash"
                  className="object-contain w-48"
                />
              </div>
              <div className="relative">
                <div className="flex items-center p-6">
                  <motion.div
                    className=" w-20 h-20 overflow-hidden border-2 rounded-lg border-[#3D3D7E] md:h-24 md:w-24 cursor-pointer hover:border-hoverColor"
                    whileHover={{
                      scale: 1.10,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <motion.img
                      src={userInfo?.profileImage || "/profile.webp"}
                      alt="profile"
                      className="object-cover object-top w-full h-full"

                    />
                  </motion.div>
                  <div className="mx-2 ">
                    <h1 className="text-lg font-medium text-gray-300 md:text-1xl">
                      {userInfo?.fullname || "Full Name"}
                    </h1>
                    <h1 className="text-xs font-light text-gray-400 md:text-sm">
                      {userInfo?.username || "userName"}
                    </h1>
                    <div className="mt-4">
                      <h1 className="font-medium">Rank</h1>
                    </div>
                  </div>
                </div>
                <div className="m-4 mt-2">
                  <button className="w-full px-1 py-2 text-sm font-thin text-gray-300 border rounded-md md:px-2 md:py-2 md:font-medium md:text-base border-[#3D3D7E]">
                    EDIT PROFILE
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* second section */}
          <div className="flex flex-col items-start pt-2 mt-3 sm:flex-row lg:pr-36 lg:pl-36 gap-x-4 gap-y-4">
            <div className="w-full pt-2 pb-1 overflow-hidden rounded-lg basis-3/4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                <div className="flex flex-col justify-center w-full max-w-xs p-6 py-6 transition-transform duration-300 ease-in-out transform border-2 border-gray-200 rounded-lg shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex items-center justify-between ">
                    <div>
                      <p className="text-xl font-medium text-blue-600 hover:text-blue-500 hover:underline">
                        Solved Questions
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {totalSolved}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10">
                      <MdEditDocument size={28} style={{ color: '#2A2A48' }} />
                    </div>

                  </div>
                </div>

                <div className="flex flex-col justify-center w-full max-w-xs p-6 py-6 transition-transform duration-300 ease-in-out transform border-2 border-gray-200 rounded-lg shadow-md bg-gradient-to-br from-rose-50 to-rose-100">
                  <div className="flex items-center justify-between cursor-pointer">
                    <div>
                      <Link to={`/enroll-course/${userId}`}>
                        <p className="text-xl font-medium text-rose-600 hover:text-blue-500 hover:underline">
                          Enrolled Courses
                          <br />
                        </p>
                      </Link>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {dashStats?.data?.totalCourse}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-rose-500/10">
                      <FaGraduationCap size={28} style={{ color: '#2A2A48' }} />
                    </div>

                  </div>
                </div>

                <div className="flex flex-col justify-center w-full max-w-xs p-6 py-6 transition-transform duration-300 ease-in-out transform border-2 border-gray-200 rounded-lg shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <div className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-xl font-medium hover:text-blue-500 hover:underline text-emerald-600">
                        Wallet Balance
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {dashStats?.data?.walletBalance}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-500/10" >
                      <FaWallet size={28} style={{ color: '#2A2A48' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="shrink-0 sm:w-[400px] w-full border-2 border-white rounded-lg shadow-md mt-3 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="p-2">
                <h1 className="flex items-center justify-between text-lg ">
                  <div className="flex items-center p-1 gap-x-2">
                    <FaTrophy />
                    BADGES EARNED:
                  </div>
                  <div className="hover:scale-110">
                    <FaExpand />
                  </div>
                </h1>
                <div className="py-11">
                </div>
              </div>
            </div>
          </div>

          {/* Third section */}
          <div className="flex flex-col items-start pt-2 mt-3 jus sm:flex-row lg:pr-36 lg:pl-36 gap-x-4 gap-y-4">
            <div className="w-full pt-2 pb-1 overflow-hidden rounded-lg basis-3/4">
              <HeatMapComponent user={userData} />
            </div>
            <div className="shrink-0 sm:w-[400px] w-full ">
              <RadialChart user={userData} problemCount={problemCounts} />
            </div>
          </div>

          {/* Fourth Section */}
          <div className="flex flex-col items-start pt-2 mt-3 jus sm:flex-row lg:pr-36 lg:pl-36 gap-x-4 gap-y-4">
             <div>
                <HomeTabs user = {userData}/>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
