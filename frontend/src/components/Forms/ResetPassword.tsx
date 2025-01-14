import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useResetPasswordMutation } from "../../services/userApiSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import TutorLogo from "../Logo/TutorLogo";
import { Toaster, toast } from "sonner";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { resetPasswordValidationScheama } from "../../utils/validation";
import { ResetPasswordFormData } from "../../types/types";
import { APIError } from "../../types/types";

const ResetPassword: React.FC = () => {
  const { id, token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassword] = useResetPasswordMutation();
  const navigate = useNavigate();

  const handleSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword({ id, token, password: data.password }).unwrap();
      toast.success('Password successfully reset');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const apiError = error as APIError;
      if (apiError.data && apiError.data.message) {
        toast.error(apiError.data.message);
      } else {
        toast.error('An unknown error occurred. Please try again.');
      }
      console.error("Error resetting password:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { backgroundColor: '#D8D8FD' } }} richColors />
      <div className="flex flex-col items-center justify-center min-h-screen bg-customGrey">
        <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-themeColor">
          <div className="mb-8">
            <TutorLogo />
          </div>
          <h2 className="mb-6 text-2xl font-semibold text-center">Reset Password</h2>
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={resetPasswordValidationScheama}
            onSubmit={handleSubmit}
          >
            <Form>
              <div className="relative mb-4"> 
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-customGrey"
                >
                  Enter New Password
                </label>
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="new password"
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:italic placeholder:text-sm"
                />
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  onClick={togglePasswordVisibility}
                  className="absolute text-gray-400 cursor-pointer top-10 right-4" 
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="mt-1 text-sm text-red-500"
                />
              </div>
              <div className="relative mb-4"> 
                <label
                  htmlFor="confirmPassword"
                  className="block mb-2 text-sm font-medium text-customGrey"
                >
                  Confirm Password
                </label>
                <Field
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="confirm password"
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:italic placeholder:text-sm"
                />
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  onClick={togglePasswordVisibility}
                  className="absolute text-gray-400 cursor-pointer top-10 right-4" 
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="mt-1 text-sm text-red-500"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Reset Password
              </button>
            </Form>
          </Formik>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
