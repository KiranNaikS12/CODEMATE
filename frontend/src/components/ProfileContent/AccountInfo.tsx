import React, { useState } from "react";
import { useFormik } from "formik";
import { UserAdditional } from "../../types/userTypes";
import { Toaster, toast } from "sonner";
import { useDispatch } from "react-redux";
import ResetPasswordModal from "../Modals/ResetPasswordModal";
import { APIError } from "../../types/types";
import { useUpdateUserAccountInfoMutation } from "../../services/userApiSlice";
import {  updateCredentials } from "../../store/slices/authSlice";
import { motion } from "framer-motion";
import { FaLinkedin, FaGithub, FaGoogle, FaFacebook } from "react-icons/fa";


interface AccountInfoProps {
  userId?: string;
  userData?: UserAdditional;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ userId, userData }) => {
  const [isModified, setIsModified] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [isEditing, setIsEditing] = useState({
    username: false,
    email: false,
  });
  const dispatch = useDispatch();
  const [updateAccount] = useUpdateUserAccountInfoMutation();

  const formik = useFormik({
    initialValues: {
      username: userData?.username || "",
      email: userData?.email || "",
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      const changedValues = {} as Partial<typeof values>;
      if (values.username !== userData?.username) {
        changedValues.username = values.username;
      }
      if (values.email !== userData?.email) {
        changedValues.email = values.email;
      }

      const updateAccountInfo = {
        userId: userId,
        userData: changedValues,
      };
      try {
        const response = await updateAccount(updateAccountInfo).unwrap();
        if (response) {
          toast.success(response?.message);
        }
        setIsEditing({
          username: false,
          email: false,
        });
        setIsModified(false);
        
        
        dispatch(updateCredentials({data: {
          ...userData,
          ...updateAccountInfo.userData
        }}));
        
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
    //Reset only the specific field to its initial value
    formik.setFieldValue(
      field,
      userData?.[field as keyof UserAdditional] || ""
    );
    setIsEditing((prev) => ({
      ...prev,
      [field]: false,
    }));
    setIsModified(false);
  };

  const handlePassowrdModal = () => {
    setPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setPasswordModal(false);
  };

  type EditingField = keyof typeof isEditing;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            backgroundColor: "#D8D8FD",
            position: "fixed",
            zIndex: 9999,
          },
        }}
        richColors
      />
      <div className="flex justify-start flex-col w-full overflow-y-auto text-sm bg-white rounded-lg shadow-lg md:w-3/4 md:text-base md:h-[calc(100vh-190px)] p-8 ">
        <form onSubmit={formik.handleSubmit}>
          <h1 className="mb-2 font-bold md:mt-10">ACCOUNT INFORMATION</h1>
          {["username", "email"].map((field) => (
            <div className="flex items-center justify-between py-3 space-x-4">
              <h1 className="w-24 text-sm text-gray-700 md:text-md">
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
                whileHover={{scaleX:1.1, color:'#2563EB'}}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                Edit
              </motion.h1>
            </div>
          ))}
          <div className="flex items-center justify-between py-3 space-x-4">
            <h1 className="w-24 text-sm text-gray-700 md:text-md">Password:</h1>
            <motion.h1
              className="text-sm font-medium text-blue-500 cursor-pointer"
              onClick={() => handlePassowrdModal()}
              whileHover={{scaleX:1.1, color:'#2563EB'}}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Change Password
            </motion.h1>
            <h1></h1>
          </div>

          <div className="flex justify-end mt-12 ">
            {isModified && (
              <button
                type="submit"
                className="px-4 py-2 mb-6 border rounded text-themeColor border-highlightBlue"
              >
                Save Changes
              </button>
            )}
          </div>
        </form>
        <div className="-mt-4">
          <motion.button className="px-2 py-2 text-sm bg-red-100 border border-red-500 rounded-md"
            whileHover={{scale:1.1, background:'#fecaca'}}
            transition={{ type: 'spring', stiffness: 300 }}
            >
            DELETE ACCOUNT
          </motion.button>
        </div>
        <div className="mt-8">
          <h1 className="block mb-2 font-bold md:mt-4">LINK ACCOUNT</h1>
          <motion.div className="flex flex-col">
            {[
              { name: "LinkedIn", icon: <FaLinkedin color="#0077B5" /> },
              { name: "GitHub", icon: <FaGithub color="#333" /> }, 
              { name: "Google", icon: <FaGoogle color="#DB4437" /> }, 
              { name: "Facebook", icon: <FaFacebook color="#4267B2" /> }, 
            ].map((field) => (
              <div
                className="flex items-center justify-between py-3 space-x-4"
                key={field.name}
              >
                <div className="flex items-start space-x-2">
                  <motion.span className="text-lg"
                    whileHover={{scale: 1.3}}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >{field.icon}</motion.span>
                  <h1 className="w-24 text-sm text-gray-700 md:text-md">
                    {field.name}
                  </h1>
                  
                </div>
                <motion.button className="text-sm font-medium text-blue-500 cursor-pointer"
                  whileHover={{scaleX:1.1, color:'#2563EB'}}
                  transition={{ type: 'spring', stiffness: 300 }}
                >Link</motion.button>
                  <h1></h1>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      {passwordModal && (
        <ResetPasswordModal
          onClose={handleClosePasswordModal}
          userId={userId}
        />
      )}
    </>
  );
};

export default React.memo(AccountInfo);
