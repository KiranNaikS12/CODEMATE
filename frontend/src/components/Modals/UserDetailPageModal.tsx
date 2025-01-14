import React, { useEffect,  useRef } from 'react'
import { UserDetailsPageProps } from '../../types/adminTypes';
import CommonButton from '../Buttons/CommonButton';

const UserDetailPageModal:React.FC<UserDetailsPageProps> = ({isOpen, onClose, data, isError, isLoading}) => {
  const modelRef = useRef<HTMLDivElement | null>(null);  

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modelRef.current &&
        !modelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);    

  if (!isOpen) return null;
  if (isLoading)  return <div>Loading...</div>
  if (isError)  return <div>Error Loading tutor details</div>
  if (!data  ) return <div>No user data available</div>;
    
  console.log('data',data)
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modelRef}
        className="w-3/4 rounded-lg shadow-lg bg-customGrey h-3/4"
      >
        <div className="flex flex-col h-full md:flex-row">
          <div className="flex flex-col items-center justify-between w-full h-full p-8 rounded-lg md:w-1/4 bg-themeColor">
            <div className="flex flex-col items-center">
              {data.isBlocked ? (
              <div className="w-24 h-24 overflow-auto border-4 border-red-400 rounded-full md:h-20 md:w-20 lg:w-32 lg:h-32">
                <img
                  src={data?.profileImage || '/profile.webp'}
                  alt="profile"
                  className="object-cover w-full h-full "
                />
              </div>
                
              ) : (
                <div className="w-24 h-24 overflow-auto border-4 border-green-400 rounded-full md:h-20 md:w-20 lg:w-32 lg:h-32">
                <img
                  src={ data.profileImage ||"/profile.webp"}
                  alt="profile"
                  className="object-cover w-full h-full"
                />
              </div>
              )}
              <div className="mt-4 text-sm text-center text-customGrey lg:text-lg">
                <h1 className="font-semibold ">{data.username}</h1>
                <h1 className="font-semibold ">{data.email}</h1>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm ">
                <div className="flex items-center">
                  {data.isBlocked ? (
                  <>
                    <img
                      src="/blocked.svg"
                      alt="status"
                      className="w-4 lg:w-6"
                    />
                    <h1 className="text-red-500">BLOCKED</h1>
                  </>      
                  ) : (
                   <>
                    <img
                      src="/statusActive.svg"
                      alt="status"
                      className="w-4 lg:w-6"
                    />
                    <h1 className="text-green-500 ">ACTIVE</h1>
                   </>
                  )}
                </div>
                <div>
                  <a href="#">
                    <img
                      src="/editIcon.svg"
                      alt="edit"
                      className="w-3 lg:w-4"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="relative w-full h-full overflow-x-auto text-sm rounded-lg bg-customGrey md:w-3/4 custom-scrollbar">
            <div className="p-8">
              <div className="grid grid-cols-1">
                <h1>Bio:</h1>
                <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-lg">
                  <h1>{data?.bio || "Not Provided"}</h1>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-1">
                <div>
                  <h1>Full Name:</h1>
                  <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-l">
                    <h1>{data?.fullname || "Not Provided"}</h1>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
                <div>
                  <h1>DOB:</h1>
                  <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-lg">
                    <h1>{data?.birthday || "Not Provided"}</h1>
                  </div>
                </div>
                <div>
                  <h1>Country:</h1>
                  <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-lg">
                    <h1>{data?.country || "Not Provided"}</h1>
                  </div>
                </div>
              </div>
              <div className='grid grid-cols-1 gap-6 mt-6'>
                <div>
                  <h1>Website</h1>
                  <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-l">
                    <h1>{data?.website || "Not Provided"}</h1>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
                <div>
                  <h1>Education:</h1>
                  <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-l">
                    <h1>{data?.education || "Not Provided"}</h1>
                  </div>
                </div>
                <div>
                  <h1>Work:</h1>
                  <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-l">
                    <h1>{data?.work || "Not Provided"}</h1>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-1">
                <div>
                  <h1>Technicall Skills:</h1>
                  <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-lg">
                    <h1>{data?.TechnicallSkills || "Not Provided"}</h1>
                  </div>
                </div>
              </div>
            </div>
            <CommonButton 
             onClick={onClose}
             buttonText='BACK'
             className='absolute w-20 p-2 rounded-lg right-10 bottom-4 bg-themeColor text-customGrey'
            />
          </div> 
        </div>
      </div>
    </div>
  )
}

export default UserDetailPageModal
