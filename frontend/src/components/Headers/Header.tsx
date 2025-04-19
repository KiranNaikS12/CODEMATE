import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCog,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  Home,
  Notebook,
  GraduationCap,
} from "lucide-react";
import Logout from "../Logout/Logout.tsx";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";
import { Link } from "react-router-dom";
import { useClearAllNotificationMutation, useGetNotificationQuery } from "../../services/userApiSlice.ts";
import NotificationItem from "../NotificationTab/NotificationItem.tsx";
import { APIError } from "../../types/types.ts";
import { toast } from "sonner";


const Header: React.FC = () => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMessageDropdown, setIsMessageDropdown] = useState<boolean>(false);

  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const userId = userInfo?._id;
  const { data: notificationResponse } = useGetNotificationQuery({ id: userId! });
  const notification = notificationResponse?.data;
  const [clearAll] = useClearAllNotificationMutation();

  const toggleSideBar = () => {
    setIsSideBarOpen(!isSideBarOpen);
  };

  const toggleDropDown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const messageDropdown = () => {
    setIsMessageDropdown(!isMessageDropdown)
  }

  const removeAllNotification = async (userId: string) => {
    try {
      await clearAll({ userId }).unwrap();
    } catch (error) {
      const apiError = error as APIError;
      toast.error(apiError.data?.message);
    }
  }

  return (
    <>
      <header className="flex w-full p-5 bg-gray-200 gap-x-4">
        <div className="flex-[2] rounded-lg lg:shadow-md bg-white flex items-center px-2">
          <div className="flex items-center gap-4">
            <FontAwesomeIcon
              icon={isSideBarOpen ? faTimes : faBars}
              className="cursor-pointer text-2xl lg:hidden text-themeColor hover:text-[#247cff] transition-colors duration-200"
              onClick={toggleSideBar}
            />

            {/* Only show logo in header when sidebar is closed */}
            {!isSideBarOpen && (
              <Link to="/home" className="flex items-center transition-opacity duration-200 hover:opacity-80">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="35"
                  height="35"
                  viewBox="0 0 200 200"
                >
                  <path
                    d="M 130,50 A 70,70 0 1,0 130,150"
                    fill="none"
                    stroke="#2A2A48"
                    strokeWidth="20"
                  />
                  <path
                    d="M 135,150 L 120,60 L 150,110 L 180,60 L 180,150"
                    fill="none"
                    stroke="#247CFF"
                    strokeWidth="20"
                  />
                </svg>
                <h1 className="text-base md:text-lg text-themeColor">
                  CODE<span className="text-[#247cff]">MATE</span>
                </h1>
              </Link>
            )}

            <nav className="hidden ml-8 space-x-16 font-medium lg:flex text-themeColor text-md">
              <Link to="/home" className="hover:text-[#247cff] transition-colors duration-200">
                Home
              </Link>
              <Link to="/problem" className="hover:text-[#247cff] transition-colors duration-200">
                Problem
              </Link>
              <Link to="/course" className="hover:text-[#247cff] transition-colors duration-200">
                Course
              </Link>
            </nav>
          </div>
        </div>

        {/* User controls section */}
        <div className="flex items-center p-4 space-x-8 bg-white rounded-lg md:space-x-11 text-themeColor lg:shadow-md sm:space-x-4">
          <div className="relative z-50 group">
            <div className="relative inline-block">
              <FontAwesomeIcon
                icon={faBell}
                className="text-lg md:text-xl cursor-pointer hover:text-[#247cff] hidden md:block transition-colors duration-200"
                onClick={messageDropdown}
              />
              {notification && notification?.length > 0 && (
                <span className="absolute flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
                  {notification?.length}
                </span>
              )}
            </div>
            {isMessageDropdown && (
              <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg w-96 max-h-[500px] overflow-y-auto">
                {notification && notification?.length > 0 && (
                    <div className='flex items-center justify-between p-2'>
                      <h1></h1>
                      <button className='px-3 py-1 bg-gray-300 rounded-md shadow-md hover:bg-gray-400'
                        onClick={() => removeAllNotification(userId!)}
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                {notification && notification?.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                  notification?.map((data) => (
                    <NotificationItem
                      key={data?._id}
                      notification={data}
                    />
                  ))
                )}
              </div>
            )}
          </div>
          <Link to={`/profile/${userId}`}>
            <img
              src={userInfo?.profileImage || '/profile.webp'}
              alt="avatar"
              className="w-8 h-8 border-2 border-[#247cff] rounded-full cursor-pointer hover:border-3 transition duration-200 object-cover"
            />
          </Link>
          <div className="relative z-50 group">
            <FontAwesomeIcon
              icon={faCog}
              className="text-lg md:text-xl cursor-pointer hover:text-[#247cff] transition-colors duration-200"
              onClick={toggleDropDown}
            />
            {isDropdownOpen && (
              <div className="absolute right-0 w-48 mt-2 text-current bg-gray-200 border rounded-lg shadow-lg">
                <ul className="py-2">
                  <li className="px-4 py-2 text-sm transition-colors duration-200 cursor-pointer hover:bg-themeColor hover:text-customGrey text-themeColor">
                    Appearance
                  </li>
                  <li className="px-4 py-2 text-sm transition-colors duration-200 cursor-pointer hover:bg-themeColor hover:text-customGrey text-themeColor">
                    <Logout />
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Improved Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-themeColor w-64 transform transition-transform duration-300 ease-in-out z-50 ${isSideBarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Logo section inside sidebar */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <Link to="/home" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="35"
              height="35"
              viewBox="0 0 200 200"
              className="text-customGrey"
            >
              <path
                d="M 130,50 A 70,70 0 1,0 130,150"
                fill="none"
                stroke="currentColor"
                strokeWidth="20"
              />
              <path
                d="M 135,150 L 120,60 L 150,110 L 180,60 L 180,150"
                fill="none"
                stroke="#247CFF"
                strokeWidth="20"
              />
            </svg>
            <h1 className="text-xl font-bold text-customGrey">
              CODE<span className="text-[#247cff]">MATE</span>
            </h1>
          </Link>
          <button
            onClick={toggleSideBar}
            className="p-2 text-customGrey hover:text-[#247cff] transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-3">
          <Link
            to="/home"
            className="flex items-center p-3 space-x-4 text-customGrey rounded-lg hover:bg-[#3D3D7E] transition-colors duration-200 group"
          >
            <Home className="w-5 h-5 group-hover:text-[#247cff] transition-colors duration-200" />
            <span className="font-medium">Home</span>
          </Link>

          <Link
            to="/problem"
            className="flex items-center p-3 space-x-4 text-customGrey rounded-lg hover:bg-[#3D3D7E] transition-colors duration-200 group"
          >
            <Notebook className="w-5 h-5 group-hover:text-[#247cff] transition-colors duration-200" />
            <span className="font-medium">Problems</span>
          </Link>

          <Link
            to="/course"
            className="flex items-center p-3 space-x-4 text-customGrey rounded-lg hover:bg-[#3D3D7E] transition-colors duration-200 group"
          >
            <GraduationCap className="w-5 h-5 group-hover:text-[#247cff] transition-colors duration-200" />
            <span className="font-medium">Course</span>
          </Link>
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 text-customGrey">
            <img
              src={userInfo?.profileImage || '/profile.webp'}
              alt="profile"
              className="w-10 h-10 rounded-full border-2 border-[#247cff]"
            />
            <div>
              <p className="font-medium">{userInfo?.fullname || "Full Name"}</p>
              <p className="text-sm opacity-75">{userInfo?.username || "username"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {isSideBarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={toggleSideBar}
        />
      )}
    </>
  );
};

export default React.memo(Header);
