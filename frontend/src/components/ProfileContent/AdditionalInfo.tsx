import React,{useState} from "react";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import {  useUpdateUserDataMutation } from "../../services/userApiSlice";
import { ProfileFormType, UserAdditional } from "../../types/userTypes";
import { Toaster, toast } from "sonner";
import { profileValidationSchema } from "../../utils/validation";
import { APIError } from "../../types/types";
import { PROFILE_DEFAULTS } from "../../types/userTypes";
import {  updateCredentials } from "../../store/slices/authSlice";
import { motion } from "framer-motion";


export interface AdditionalInfoProps {
    userId?:string;
    userData?:UserAdditional;
    refetch: () => void;
    
}

const AdditionalInfo: React.FC<AdditionalInfoProps> = ({userId, userData}) => { 
  const [isModified, setIsModified] = useState(false);
  const [isEditing, setIsEditing] = useState({
        bio: false,
        fullname: false,
        birthday: false,
        country: false,
        website: false,
        work: false,
        education: false,
        TechnicallSkills: false,
  });  
  const dispatch = useDispatch();

  

  const [updateUser] = useUpdateUserDataMutation()

  const formik = useFormik({
    validationSchema:profileValidationSchema,
    enableReinitialize: true,
    initialValues: {
      bio: userData?.bio || PROFILE_DEFAULTS.bio,
      fullname: userData?.fullname || PROFILE_DEFAULTS.fullname,
      birthday: userData?.birthday || PROFILE_DEFAULTS.birthday,
      country: userData?.country || PROFILE_DEFAULTS.country,
      website: userData?.website || PROFILE_DEFAULTS.website,
      work: userData?.work || PROFILE_DEFAULTS.work,
      education: userData?.education || PROFILE_DEFAULTS.education,
      TechnicallSkills: userData?.TechnicallSkills || PROFILE_DEFAULTS.TechnicallSkills,
    },
    
    
    onSubmit: async (values) => {
     const updatedUserData = {
      userId: userId,
      userData: {} as ProfileFormType
     }

     
     if (userData) {
      Object.keys(values).forEach((key) => {
        const userKey = key as keyof ProfileFormType;
        const formValue = values[key as keyof typeof values];
        const defaultValue = PROFILE_DEFAULTS[userKey as keyof typeof PROFILE_DEFAULTS];
  
        if (formValue !== defaultValue && formValue !== userData[userKey as keyof UserAdditional]) {
          updatedUserData.userData[userKey] = formValue;
        }
      });
    }
     
     if (Object.keys(updatedUserData.userData).length === 0) {
        toast.info('Sorry! No changes detected. Try again');
        return;
     }
     
      try {
        await updateUser(updatedUserData);
        toast.success("Profile Updated Successfully");
        setIsEditing({
          bio: false,
          fullname: false,
          birthday: false,
          country: false,
          website: false,
          work: false,
          education: false,
          TechnicallSkills: false,
        });
        setIsModified(false);

        dispatch(updateCredentials({data: {
          ...userData,
          ...updatedUserData.userData
        }}))
        
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

  

  const handleCancel = (field: string) => {
    formik.setFieldValue(field, userData?.[field as keyof UserAdditional] || '');
    setIsEditing((prev) => ({
      ...prev,
      [field]: false,
    }));
    setIsModified(false);
  };
  
  type EditingField = keyof typeof isEditing;

  return (
    <>
    <Toaster
        position="top-center"
        toastOptions={{ style: { backgroundColor: "#fffff" } }}
        richColors
      />
    <div className="flex justify-center flex-col w-full overflow-y-auto text-sm bg-white rounded-lg shadow-lg md:w-3/4 md:text-base md:h-[calc(100vh-190px)] p-8">
    <form onSubmit={formik.handleSubmit}>
      <h1 className="font-bold">BASIC INFO</h1>
      {["bio", "fullname", "birthday", "country", "website"].map((field) => (
        <div className="mt-5" key={field}>
          <div className="flex items-center justify-between space-x-4">
            <h1 className="w-24 text-sm text-gray-700 md:text-md">
              {field.charAt(0).toUpperCase() + field.slice(1)}:
            </h1>
            {isEditing[field as EditingField] ? (
              <>
                {field === "birthday" ? (
                  <input
                    type="date"
                    name={field}
                    value={formik.values[field as keyof typeof formik.values]}
                    onChange={formik.handleChange}
                    className="flex-1 p-2 text-xs bg-white border border-gray-300 rounded md:text-base focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                ) : (
                  <input
                    type="text"
                    name={field}
                    value={formik.values[field as keyof typeof formik.values]}
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
            <motion.h1
              className="text-sm font-normal text-blue-500 cursor-pointer"
              onClick={() => handleEdit(field)}
              whileHover={{scaleX:1.2, color:'#2563EB'}}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Edit
            </motion.h1>
          </div>
          {formik.touched[field as keyof typeof formik.values] &&
            formik.errors[field as keyof typeof formik.errors] && (
              <div className="mt-1 text-sm text-red-500">
                {formik.errors[field as keyof typeof formik.errors]}
              </div>
            )}
        </div>
      ))}

      <h1 className="mt-12 font-bold">EXPERIENCE AND SKILLS</h1>

      {["work", "education", "TechnicallSkills"].map((field) => (
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
                  value={formik.values[field as keyof typeof formik.values]}
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
            <motion.h1
              className="text-sm font-normal text-blue-500 cursor-pointer"
              onClick={() => handleEdit(field)}
              whileHover={{scaleX:1.2, color:'#2563EB'}}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Edit
            </motion.h1>
          </div>
          {formik.touched[field as keyof typeof formik.values] &&
            formik.errors[field as keyof typeof formik.errors] && (
              <div className="mt-1 text-sm text-red-500">
                {formik.errors[field as keyof typeof formik.errors]}
              </div>
            )}
        </div>
      ))}

      <div className="flex justify-end mt-12 ">
        {isModified && (
          <motion.button
            type="submit"
            className="px-4 py-2 mb-6 border rounded text-themeColor border-highlightBlue"
            whileHover={{scale:1.1}}
          >
            Save Changes
          </motion.button>
        )}
      </div>
    </form>
    </div>
    </>
  );
};

export default AdditionalInfo;
