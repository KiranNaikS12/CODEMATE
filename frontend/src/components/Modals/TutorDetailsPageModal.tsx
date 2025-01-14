import React, { useEffect, useRef, useState } from "react";
import { DetailsPageProps } from "../../types/adminTypes";
import { Alert } from "@mui/material";
import CommonButton from "../Buttons/CommonButton";
import { APIError } from "../../types/types";
import { Toaster, toast } from "sonner";
import { useUpdateTutorApprovalMutation } from "../../services/adminApiSlice";
import Spinner from "../Loader/Spinner";

const TutorDetailPageModal: React.FC<DetailsPageProps> = ({
  isOpen,
  onClose,
  data,
  isLoading,
  isError,
}) => {
  const modelRef = useRef<HTMLDivElement | null>(null);
  const [updateApprovalData, ] = useUpdateTutorApprovalMutation();
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  

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
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error Loading tutor details</div>;
  if (!data) return <div>No tutor data available</div>;


  const handleApprove = async(isApproved: boolean, isVerified:boolean, reason?: string) => {
    setLoading(true)
    if(data && data._id){ 
      try {
        const response = await updateApprovalData({tutorId:data._id, isApproved, isVerified, reason}).unwrap()
        if(response) {
          const action = isApproved ? 'Approved' : 'Rejected';
          const textColor = isApproved ? 'green' : 'red';
          toast.success(`Tutor ${action} successfully`,{
            style:{
              color:textColor
            }
          })
        }
        
        setTimeout(() => {
          setLoading(false) 
          onClose();
        },500)
      } catch (error) {
        const apiError = error as APIError;
        toast.error(apiError.data && apiError.data?.message)
        console.log('An unkown error occured', apiError.data && apiError.data?.message)
        setLoading(false);
      }
    }
  }


  const handleRejectClick = () => {
    setShowRejectionInput(true)
  }

  const handleSubmitRejection  = () => {
    if(rejectionReason.trim()) {
      handleApprove(false, true, rejectionReason)
      setRejectionReason("")
      setShowRejectionInput(false);
    } else {
      toast.error("Please provide a reason for rejection.")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Toaster position="bottom-center" toastOptions={{ style: { backgroundColor: '#D8D8FD' } }} richColors />
      <div
        ref={modelRef}
        className="w-3/4 rounded-lg shadow-lg bg-customGrey h-3/4"
      >
       <Spinner isLoading={loading}/>
        <div className="flex flex-col h-full md:flex-row">
          <div className="flex flex-col items-center justify-between w-full h-full p-8 rounded-lg md:w-1/4 bg-themeColor">
            <div className="flex flex-col items-center">
              {data.isBlocked ? (
                <div className="w-24 h-24 overflow-auto border-4 border-red-400 rounded-full md:h-20 md:w-20 lg:w-32 lg:h-32">
                  <img
                    src={ data.profileImage ||"/profile.webp"}
                    alt="profile"
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 overflow-auto border-4 border-green-400 rounded-full md:h-20 md:w-20 lg:w-32 lg:h-32">
                  <img
                    src={ data.profileImage || "/profile.webp"}
                    alt="profile"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="mt-4 text-sm text-center text-customGrey lg:text-lg">
                <h1 className="font-semibold ">
                  {data.username || "UserName"}
                </h1>
                <h1 className="font-semibold ">
                  {data.email || "EmailAddress"}
                </h1>
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
          <div className="w-full h-full overflow-x-auto text-sm rounded-lg bg-customGrey md:w-3/4 custom-scrollbar">
          {!data.isVerified && (  
            <Alert severity="warning" variant='standard' style={{background:'#FEFF9F', margin:'8px'}}>This account is not been approved</Alert>
          )}
            <div className="p-8">
              <div className="grid grid-cols-1">
                <h1>Bio:</h1>
                <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-lg">
                  <h1>{data.bio || "Not Provided"}</h1>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
                <div>
                  <h1>Full Name:</h1>
                  <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-l">
                    <h1>{data.fullname || "Not Provided"}</h1>
                  </div>
                </div>
                <div>
                  <h1>Contact:</h1>
                  <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-lg">
                    <h1>{data.contact || "Not Provided"}</h1>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-3">
                <div>
                  <h1>Age:</h1>
                  <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-l">
                    <h1>{data.age || "Not Provided"}</h1>
                  </div>
                </div>
                <div>
                  <h1>Country:</h1>
                  <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-lg">
                    <h1>{data.country || "Not Provided"}</h1>
                  </div>
                </div>
                <div>
                  <h1>DOB:</h1>
                  <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-lg">
                    <h1>{data.birthday || "Not Provided"}</h1>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
                <div>
                  <h1>Education:</h1>
                  <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-l">
                    <h1>{data.education || "Not Provided"}</h1>
                  </div>
                </div>
                <div>
                  <h1>Expierence:</h1>
                  <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-lg">
                    <h1>{data.experience || "Not Provided"}</h1>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
                <div>
                  <h1>Specialization:</h1>
                  <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-l">
                    <h1>{data.specialization || "Not Provided"}</h1>
                  </div>
                </div>
                <div>
                  <h1>Company/Brand:</h1>
                  <div className="p-2 mt-2 text-sm text-gray-600 bg-gray-300 rounded-lg">
                    <h1>{data.company || "Not Provided"}</h1>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-8 cursor-pointer">
                <h1>Certificate:</h1>
                <div className="text-sm font-thin text-blue-500 underline rounded-lg">
                  {data.certificate ? (
                    <a
                      href={String(data.certificate)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <h1>Click here to view Certificate</h1>
                    </a>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              {!showRejectionInput && !data.isVerified && (             
              <div className="grid grid-cols-1 mt-8 md:grid-cols-2">
                <CommonButton buttonText="Approve" 
                   onClick={() => handleApprove(true, true)}
                   className="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800"/>
                <CommonButton buttonText="Reject"
                   onClick={handleRejectClick} 
                   className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"/>
              </div>
              )}
              {showRejectionInput && (
                 <div className="mt-8">
                 <textarea
                   className="w-full p-2 text-sm text-gray-800 bg-gray-300 rounded-lg"
                   rows={4}
                   placeholder="Enter the reason for Rejection"
                   value={rejectionReason}
                   onChange={(e) => setRejectionReason(e.target.value)}
                 />
                 <div className="grid grid-cols-1">          
                 <CommonButton 
                   buttonText="Send"
                   onClick={handleSubmitRejection}
                   className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                 />
                 </div>
                 </div>
              )}
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default TutorDetailPageModal;
