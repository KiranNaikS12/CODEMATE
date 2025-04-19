import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import TutorLogo from '../Logo/TutorLogo';
import { Plus } from 'lucide-react';
import { TutorHeaderProps } from '../../types/tutorTypes';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useClearAllNotificationMutation, useGetNotificationQuery } from '../../services/tutorApiSlice';
import NotificationItem from '../NotificationTab/NotificationItem';
import { APIError } from '../../types/types';
import { toast } from 'sonner';



const TutorHeader: React.FC<TutorHeaderProps> = ({ toggleSearch, isSearchOpen }) => {
  const [isMessageDropdown, setIsMessageDropdown] = useState<boolean>(false);
  const tutorInfo = useSelector((state: RootState) => state.tutor.tutorInfo)
  const tutorId = tutorInfo?._id;
  const { data: notificationResponse } = useGetNotificationQuery({ id: tutorId! })
  const notification = notificationResponse?.data;
  const [clearAll] = useClearAllNotificationMutation()

  const messageDropdown = () => {
    setIsMessageDropdown(!isMessageDropdown)
  }

  const removeAllNotification = async (tutorId: string) => {
    try {
      await clearAll({ tutorId }).unwrap();
    } catch (error) {
      const apiError = error as APIError;
      toast.error(apiError.data?.message);
    }
  }

  return (
    <header className="fixed z-50 w-full p-4 shadow-md bg-themeColor">
      <div className="container flex items-center justify-between mx-auto">
        <div className="flex items-center">
          <TutorLogo />
        </div>

        <div className="items-center hidden w-1/2 pl-10 md:flex">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 text-gray-900 rounded-md outline-none bg-customGrey"
          />
          <button className="p-2 ml-2 text-white rounded-md bg-highlightBlue hover:bg-hoverColor">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button
            className="p-2 text-white rounded-md bg-themeColor md:hidden hover:bg-highlightBlue"
            onClick={toggleSearch}
          >
            {isSearchOpen ? <FontAwesomeIcon icon={faTimes} /> : <FontAwesomeIcon icon={faSearch} />}
          </button>


          <div className="flex items-center lg:space-x-8 md:space-x-6">
            <div className="relative z-50 group">
              <div className="relative inline-block">
                <FontAwesomeIcon
                  icon={faBell}
                  className="text-xl md:text-xl text-customGrey cursor-pointer hover:text-[#247cff] hidden md:block transition-colors duration-200"
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
                        onClick={() => removeAllNotification(tutorId!)}
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
            <Link to={`/tutor/profile/${tutorId}`}>
              <img
                src={tutorInfo?.profileImage || '/profile.webp'} alt="avatar"
                className="w-9 h-9 border border-hoverColor rounded-full cursor-pointer hover:border-2 hover:border-[#247cff] transition duration-200 object-cover" />
            </Link>

            <Link to='/tutor/home/course/upload'>
              <button className="hidden md:flex items-center gap-2 px-3 py-1 border border-[#247cff] text-customGrey rounded-md shadow-md hover:bg-hoverColor">
                Upload
                <div className="p-1 rounded-full bg-highlightBlue">
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              </button>
            </Link>
          </div>
        </div>
      </div>


      {isSearchOpen && (
        <div className="relative mt-4 ml-10 md:hidden">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 text-gray-900 rounded-md outline-none bg-customGrey"
          />
        </div>
      )}
    </header>
  );
};

export default React.memo(TutorHeader);
