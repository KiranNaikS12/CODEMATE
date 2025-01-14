import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye , faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import {Formik, Field, Form, ErrorMessage} from 'formik';
import { adminValidationSchema } from '../../utils/validation';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthHeaders from '../../components/Headers/AuthHeaders';
import { RootState } from "../../store/store";
import AuthButton from '../../components/Buttons/AuthButton';
import { APIError, LoginFormData } from "../../types/types";
import { useLoginAdminMutation } from "../../services/adminApiSlice";
import { setCredentials } from "../../store/slices/adminSlice";
import {toast} from 'react-toastify';


const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const adminInfo = useSelector((state:RootState) => state.admin.adminInfo);

  const [login,] = useLoginAdminMutation();

  useEffect(() => {
    if (adminInfo) {
      navigate('/admin/');
    }
  }, [navigate, adminInfo]);

  const handleSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data).unwrap();
      if (response && response.data) {
        dispatch(setCredentials({ ...response }));
        toast.success('Logged In Successfully');
        setTimeout(() => {
          navigate('/admin/');
        }, 1000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      const apiError = error as APIError;
      if (apiError.data && apiError.data.message) {
        toast.error(apiError.data.message);
      } else {
        toast.error('An unknown error occurred. Please try again.');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-customGrey">
      <div className='relative flex flex-col min-h-screen p-8'>
        <AuthHeaders linkText='register' linkTo='/tutor/register'/>
        <div className='flex flex-1'>
          <div className="relative flex flex-col justify-center w-1/2 py-4 pr-8 -top-32 left-10 ">
            <h1 className="text-4xl font-medium text-themeColor">WELCOME BACK :)</h1>
            <p className="py-2 text-lg text-themeColor w-[600px] break-words">
               Admin! Please log in using your credentials to manage the platform and access administrative features.
            </p>
          </div>
          <div className="relative z-40 flex items-center justify-center w-1/2 -top-6">
            <div className="w-full max-w-md p-8 rounded-lg bg-customGrey">
              <h2 className="mb-6 text-3xl font-bold text-themeColor">LOGIN</h2>
              <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={adminValidationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched }) => (
                  <Form>
                    <div className="relative mb-4">
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                        Enter Email
                      </label>
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className={`absolute transform -translate-y-1/2 top-12 left-4 ${
                          errors.email && touched.email ? "text-red-400" : "text-gray-400"
                        }`}
                      />
                      <Field
                        type="email"
                        name="email"
                        className="w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full shadow-md placeholder:font-thin placeholder:italic"
                        placeholder="example@gmail.com"
                      />
                      <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-500" />
                    </div>

                    <div className="relative mb-4">
                      <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                        Enter Password
                      </label>
                      <FontAwesomeIcon icon={faLock} 
                      className={`absolute transform -translate-y-1/2 top-12 left-4 ${
                        errors.password && touched.password ? "text-red-400" : "text-gray-400"
                      }`}
                      />
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full shadow-md placeholder:font-thin placeholder:italic"
                        placeholder="Password"
                      />
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        onClick={togglePasswordVisibility}
                        className="absolute text-gray-400 transform -translate-y-1/2 cursor-pointer top-12 right-4"
                      />
                      <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-500" />
                    </div>

                    <div className="mt-10">
                      <AuthButton text="Login" />
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 z-10">
        <div className="absolute -bottom-20 -left-72 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-themeColor rounded-t-full"></div>
        <div className="absolute -bottom-52 left-2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-themeColor rounded-t-full"></div>
        <div className="absolute -bottom-80 left-80 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-themeColor rounded-t-full"></div>
      </div>
    </div>
  );
};

export default AdminLogin;
