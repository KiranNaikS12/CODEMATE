import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useForgetPasswordMutation as useUserForgetPassword } from "../../services/userApiSlice";
import { useForgetPasswordMutation as useTutorForgetPassword } from "../../services/userApiSlice";
import { Toaster, toast } from "sonner";
import { APIError } from "../../types/types";

interface ForgetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'user' | 'tutor';
}

const ForgetPasswordModal: React.FC<ForgetPasswordModalProps> = ({
  isOpen,
  onClose,
  role
}) => {
  const [userForgetPassword] = useUserForgetPassword();
  const [tutorForgetPassword] = useTutorForgetPassword();

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  const handleSubmit = async (
    values: { email: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      let response;
      if (role === "user") {
        response = await userForgetPassword({ email: values.email, role: "user" }).unwrap();
      } else if (role === "tutor") {
        response = await tutorForgetPassword({ email: values.email, role: "tutor" }).unwrap();
      }

      toast.success(response.message);
      onClose();
    } catch (error) {
      const apiError = error as APIError;
      toast.error(apiError.data?.message);
    } finally {
      setSubmitting(false);
    }
  };

  
  if (!isOpen) return null;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{ style: { backgroundColor: "#D8D8FD" } }}
        richColors
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-[450px] p-8 bg-white rounded-lg shadow-lg">
          <h2 className="mb-4 text-2xl font-bold">Forget Password</h2>
          <div
            className="flex justify-start mb-8 text-sm text-blue-800 rounded-lg bg-blue-50 dark:text-blue-400"
            role="alert"
          >
            <span className="sr-only">Info</span>
            <div>
              <span className="font-medium"></span>Enter you email to get a link to reset password.
            </div>
          </div>
          <Formik
            initialValues={{ email: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Enter Email
                  </label>
                  <Field
                    type="email"
                    name="email"
                    placeholder="example@gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:italic"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 mr-2 text-gray-600 bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-md text-customGrey bg-themeColor"
                  >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default ForgetPasswordModal;
