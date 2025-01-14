import React from "react";
import { useFormik } from "formik";
import {  toast } from "sonner";
import { APIError } from "../../types/types";
import { useUpdatePasswordMutation } from "../../services/userApiSlice";
import { updateValidationPasswordSchema } from "../../utils/validation";

interface ResetPasswordModalProps {
  userId?: string;
  onClose: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({onClose, userId}) => {
  
  const [resetPassword] = useUpdatePasswordMutation();
  const formik = useFormik({
    initialValues:{
      current_password:'',
      password:'',
      confirmPassword:''
    },
    validationSchema:updateValidationPasswordSchema,
    onSubmit: async(values) => {
      try {
        const updatedPasswordData = {
          userId,
          currentPassword:values.current_password,
          newPassword:values.password
        }
        console.log('userdata', updatedPasswordData)
        const response = await resetPassword(updatedPasswordData).unwrap();
        if(response) {
          toast.success(response.message)
        }
        onClose();
      } catch (error){
        const apiError = error as APIError;
        toast.error(apiError.data?.message || "An unknown error occurred");
        console.error("An unknown error occurred", apiError.data?.message);
      }
    }
  })

  //handling clicking outside the modal
  const handleBackdropClikc = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClikc}
    >
      <div className="w-[450px] p-8 bg-customGrey rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
          <h2 className="font-normal text-md">RESET PASSWORD</h2>
          <button 
            onClick={onClose}
            className="font-normal text-red-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
        <form className="max-w-md mx-auto" onSubmit={formik.handleSubmit}>
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="password"
              name="current_password"
              value={formik.values.current_password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              id="floating_current_password"
              className={`block py-2.5 px-0 w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                formik.touched.current_password && formik.errors.current_password ? 'border-red-500' : ''
              }`}
              placeholder=""
            />
            <label
              htmlFor="floating_current_password"
              className="peer-focus:font-medium absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Current Password
            </label>
            {formik.touched.current_password && formik.errors.current_password && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.current_password}</p>
            )}
          </div>
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="password"
              name="password"
              id="floating_new_password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`block py-2.5 px-0 w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                formik.touched.password && formik.errors.password ? 'border-red-500' : ''
              }`}
              placeholder=" "
            />
            <label
              htmlFor="floating_new_password"
              className="peer-focus:font-medium absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              New Password
            </label>
            {formik.touched.password && formik.errors.password && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.password}</p>
            )}
          </div>
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="password"
              name="confirmPassword"
              id="floating_repeat_password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`block py-2.5 px-0 w-full text-base text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : ''
              }`}
              placeholder=" "
            />
            <label
              htmlFor="floating_repeat_password"
              className="peer-focus:font-medium absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Confirm password
            </label>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.confirmPassword}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="text-white w-full bg-themeColor hover:bg-opacity-70 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm  px-5 py-2.5 text-center "
          >
           {formik.isSubmitting ? 'UPDATING...' : 'CONFIRM RESET'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
