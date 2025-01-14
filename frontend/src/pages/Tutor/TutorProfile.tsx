import React, { useState } from "react";
import {
  Camera,
  Heart,
  History,
  Lock,
  Settings,
  ShoppingCart,
  User,
  Wallet2,
} from "lucide-react";
import { FaBars } from "react-icons/fa";
import { useFormik } from "formik";
import { useParams } from "react-router-dom";
import { APIError } from "../../types/types";
import { Toaster, toast } from "sonner";
import UploadImageModal from "../../components/Modals/UploadImageModal";
import { TutorProfileFormType } from "../../types/tutorTypes";
import TutorHeader from "../../components/Headers/TutorHeader";
import { useGetTutorByIdQuery, useUpdateTutorDataMutation } from "../../services/tutorApiSlice";
import { tutorProfileValidationSchema } from "../../utils/validation";



const TutorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState({
    bio: false,
    fullname: false,
    dob: false,
    contact:false,
    age: false,
    country: false,
    website: false,
    education: false,
    experience:false,
    specialization:false,
    company:false
  });


  const { data: tutorData, refetch } = useGetTutorByIdQuery(id || '', {
    skip: !id,
  })
  
  const [updateTutor] = useUpdateTutorDataMutation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const formik = useFormik({
    validationSchema:tutorProfileValidationSchema,
    enableReinitialize: true,
    initialValues: {
      bio: tutorData?.data?.bio || "Write something about you",
      fullname: tutorData?.data?.fullname || "Not Provided",
      dob: tutorData?.data?.birthday || "Not Provided",
      contact: tutorData?.data?.contact || "Not Provided",
      country: tutorData?.data?.country || "Not Provided",
      age: tutorData?.data?.age || "Not Provided",
      website: tutorData?.data?.website || "https://example.com",
      education: tutorData?.data?.education || "Not Provided",
      experience: tutorData?.data?.experience || "Not Provided",
      specialization: tutorData?.data?.specialization || "Not Provided",
      company: tutorData?.data?.company || 'Not Provided'
    },
    
    
    onSubmit: async (values) => {
     console.log('values',values);
     
     const updatedTutorData = {
      tutorId: id,
      tutorData: {} as TutorProfileFormType
     }
     
     
     if (tutorData?.data) {
      Object.keys(values).forEach((key) => {
        const userKey = key as keyof TutorProfileFormType;
        const newValue = values[userKey];
        const initialValues = formik.initialValues[userKey]
        

        if( newValue !== initialValues) {
          updatedTutorData.tutorData[userKey] = newValue;
        }
      });
    }
    
    console.log(updatedTutorData.tutorData)
     if (Object.keys(updatedTutorData.tutorData).length === 0) {
        toast.info('Sorry! No changes detected. Try again');
        return;
     }
     
      try {
        await updateTutor(updatedTutorData);
        toast.success("Profile Updated Successfully");
        setIsEditing({
            bio: false,
            fullname: false,
            dob: false,
            contact:false,
            age: false,
            country: false,
            website: false,
            education: false,
            experience:false,
            specialization:false,
            company:false
        });
        setIsModified(false);
      } catch (error) {
        const apiError = error as APIError;
        toast.error(apiError.data?.message || "An unknown error occurred");
        console.error("An unknown error occurred", apiError.data?.message);
      }
    },
  });

  const handleEdit = (field: string) => {
    setIsEditing({ ...isEditing, [field]: true });
    setIsModified(true);
  };

  type EditingField = keyof typeof isEditing;

  const handleCancel = (field: string) => {
    setIsEditing((prev) => ({
      ...prev,
      [field]: false,
    }));
    setIsModified(false);
  };

  const handleProfileModule = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-customGrey">
      <TutorHeader/>
      <Toaster
        position="top-center"
        toastOptions={{ style: { backgroundColor: "#fffff" } }}
        richColors
      />
      <div className="flex flex-col h-full gap-8 pr-4 mt-32 md:flex-row md:pl-12 lg:pl-36 md:pr-28 ">
        <div className="flex flex-col items-center w-full ml-2 bg-white rounded-lg shadow-lg md:w-1/4 md:ml-0  md:h-[calc(100vh-160px)] overflow-y-auto ">
          <div className="w-full bg-themeColor h-[100px] rounded-t-lg"></div>

          <div className="relative w-24 h-24 overflow-hidden border-4 rounded-full -top-14 border-customGrey md:h-20 md:w-20 lg:w-32 lg:h-32">
            <img
              src={tutorData?.data.profileImage
                 ||"/profile.webp"}
              alt="profile"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-black bg-opacity-50 opacity-0 hover:opacity-100" onClick={() => handleProfileModule()}>
              <Camera size={24} className="text-white" />
              <span className="ml-2 text-sm text-white">Edit</span>
            </div>
          </div>

          <div className="flex flex-col items-center -mt-10 text-gray-500">
            <h1 className="font-semibold">{tutorData?.data.username}</h1>
            <h1 className="font-semibold">{tutorData?.data.email}</h1>
          </div>

          <button
            className="pb-2 mt-3 text-gray-600 md:hidden"
            onClick={toggleMenu}
          >
            <FaBars size={24} />
          </button>

          <div
            className={`${
              isMenuOpen ? "flex" : "hidden"
            } md:flex flex-col items-start mt-4 md:mt-14 space-y-7 text-sm text-gray-600 w-full pl-6`}
          >
            <div className="flex items-center gap-x-2">
              <Settings size={20} />
              <button className="transition-colors duration-300 hover:text-themeColor">
                <h1 className="text-sm">Account</h1>
              </button>
            </div>

            <div className="flex items-center gap-x-2">
              <User size={20} />
              <button className="transition-colors duration-300 hover:text-themeColor">
                <h1 className="text-sm">Basic Info</h1>
              </button>
            </div>

            <div className="flex items-center gap-x-2">
              <Wallet2 size={20} />
              <button className="transition-colors duration-300 hover:text-themeColor">
                <h1 className="text-sm">Wallet</h1>
              </button>
            </div>

            <div className="flex items-center gap-x-2">
              <Heart size={20} />
              <button className="transition-colors duration-300 hover:text-themeColor">
                <h1 className="text-sm">Favourite</h1>
              </button>
            </div>

            <div className="flex items-center gap-x-2">
              <ShoppingCart size={20} />
              <button className="transition-colors duration-300 hover:text-themeColor">
                <h1 className="text-sm">Cart</h1>
              </button>
            </div>

            <div className="flex items-center gap-x-2">
              <History size={20} />
              <button className="transition-colors duration-300 hover:text-themeColor">
                <h1 className="text-sm">Payment History</h1>
              </button>
            </div>
            <div className="flex items-center gap-x-2">
              <Lock size={20} />
              <button className="transition-colors duration-300 hover:text-themeColor">
                <h1 className="text-sm">Privacy Policy</h1>
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full p-4 mb-4 ml-2 overflow-y-auto text-sm bg-white rounded-lg shadow-lg md:w-3/4 md:p-8 md:mb-36 md:ml-0 md:text-base md:mt-0">
          <form onSubmit={formik.handleSubmit}>
            <h1 className="font-bold">BASIC INFO</h1>

            {["bio", "fullname", "dob", "age", "country","contact", "website"].map(
              (field) => (
                <div className="mt-5" key={field}>
                  <div className="flex items-center justify-between space-x-4">
                    <h1 className="w-24 text-sm text-gray-700 md:text-md">
                      {field.charAt(0).toUpperCase() + field.slice(1)}:
                    </h1>
                    {isEditing[field as EditingField] ? (
                      <>
                        {field === "dob" ? (
                          <input
                            type="date"
                            name={field}
                            value={
                              formik.values[field as keyof typeof formik.values]
                            }
                            onChange={formik.handleChange}
                            className="flex-1 p-2 text-xs bg-white border border-gray-300 rounded md:text-base focus:border-blue-500 focus:ring focus:ring-blue-200"
                          />
                        ) : (
                          <input
                            type="text"
                            name={field}
                            value={
                              formik.values[field as keyof typeof formik.values]
                            }
                            onChange={formik.handleChange}
                            className="flex-1 p-2 text-xs bg-white border border-gray-300 rounded md:text-base focus:border-blue-500 focus:ring focus:ring-blue-200"
                          />
                        )}
                        <button
                          type="button"
                          className="px-2 py-1 text-red-500"
                          onClick={() => handleCancel(field)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <h1 className="flex-1 text-sm text-center text-gray-500">
                        {formik.values[field as keyof typeof formik.values]}
                      </h1>
                    )}
                    <h1
                      className="text-sm font-normal text-blue-500 cursor-pointer"
                      onClick={() => handleEdit(field)}
                    >
                      Edit
                    </h1>
                  </div>
                  {formik.touched[field as keyof typeof formik.values] && formik.errors[field as keyof typeof formik.errors] && (
                    <div className="mt-1 text-sm text-red-500">
                      {formik.errors[field as keyof typeof formik.errors]}
                    </div>
                  )}
                </div>
              )
            )}

            <h1 className="mt-16 font-bold">EXPERIENCE AND SKILLS</h1>

            {["experience", "education", "company", "specialization"].map((field) => (
              <div className="mt-5" key={field}>
                <div className="flex items-center justify-between space-x-4">
                  <h1 className="w-24 text-gray-700 text-md">
                    {field.charAt(0).toUpperCase() + field.slice(1)}:
                  </h1>
                  {isEditing[field as EditingField] ? (
                    <>
                      <input
                        type="text"
                        name={field}
                        value={
                          formik.values[field as keyof typeof formik.values]
                        }
                        onChange={formik.handleChange}
                        className="flex-1 p-2 text-xs bg-white border border-gray-300 rounded md:text-base focus:border-blue-500 focus:ring focus:ring-blue-200"
                      />
                      <button
                        type="button"
                        className="px-2 py-1 text-red-500"
                        onClick={() => handleCancel(field)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <h1 className="flex-1 text-sm text-center text-gray-500">
                      {formik.values[field as keyof typeof formik.values]}
                    </h1>
                  )}
                  <h1
                    className="text-sm font-normal text-blue-500 cursor-pointer"
                    onClick={() => handleEdit(field)}
                  >
                    Edit
                  </h1>
                </div>
                {formik.touched[field as keyof typeof formik.values] && formik.errors[field as keyof typeof formik.errors] && (
                    <div className="mt-1 text-sm text-red-500">
                      {formik.errors[field as keyof typeof formik.errors]}
                    </div>
                  )}
              </div>
            ))}

            <div className="flex justify-end mt-5">
              {isModified && (
                <button
                  type="submit"
                  className="px-4 py-2 mt-12 mb-6 border rounded text-themeColor border-highlightBlue"
                >
                  Save Changes
                </button>
              )}
            </div>
          </form>
        </div>
        {isProfileOpen && id && (
           <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
           <UploadImageModal handleProfile = {handleProfileModule} userId={id} refetch={refetch} roleId='tutor'/>
          
         </div>
        )}
      </div>
    </div>
  );
};

export default TutorProfile;
