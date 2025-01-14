import {  useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FaFrown } from 'react-icons/fa';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { registrationValidationSchema } from '../../utils/validation';
import { RegisterFormData } from '../../types/types';
import { useNavigate } from 'react-router-dom';
import { useGoogleAuthMutation, useRegisterTutorMutation, useVerifyTutorMutation } from '../../services/tutorApiSlice';
import { APIError } from '../../types/types';
import { Toaster, toast } from "sonner";
import { Link } from 'react-router-dom';
import OtpModal from '../../components/Modals/OtpModal';
import AuthHeaders from '../../components/Headers/AuthHeaders';
import AuthButton from '../../components/Buttons/AuthButton';
import {auth, googleProvider} from '../../config/firebaseConfig';
import {  signInWithPopup } from "firebase/auth";
import { Role } from "../../types/types";
import Spinner from '../../components/Loader/Spinner';
import { useDispatch } from 'react-redux';
import { setCredentials, TutorData } from '../../store/slices/tutorSlice';




const TutorRegister = () => {
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [registrationToken, setRegistrationToken] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<RegisterFormData | null>(null);
  const dispatch = useDispatch()
  const navigate = useNavigate();

  const [initiateRegistration] = useRegisterTutorMutation();
  const [verifyUser] = useVerifyTutorMutation();
  const [googleAuth] = useGoogleAuthMutation();
  
  const handleSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
     try{
        const response = await initiateRegistration(data).unwrap();
        setRegistrationToken(response.data.token);
        setFormData(data);
        setTimeout(() => {
          setIsLoading(false);
          setShowOTPModal(true);
        },1000)
        toast.success('OTP sent to your email')
     }catch(error){
        const apiError = error as APIError 
        if(apiError.data?.message && apiError.data){
          toast.error(apiError.data.message, {
            icon: <FaFrown size={20}/>
          });
        }else {
            toast.error('An unknown error occurred. Please try again.');
        }
        setIsLoading(false)
     }
  }

  
  const handleOtpSubmit = async (otp: string) => {
    try{
        const response = await verifyUser({token:registrationToken, otp}).unwrap();
        if(response.data._id){
           setShowOTPModal(false);
           navigate(`/tutor/approval/${response.data._id}`)
           toast.success('Welcome! You have created your account')
        }else{
            toast.error('Invalid OTP')
        }
    }catch(error){
        const apiError = error as APIError;
        if(apiError.data && apiError.data.message){
            toast.error(apiError.data.message);
         }
    }
  }
  

  const handleResendOTP = async () => {
    if(formData){
        await handleSubmit(formData)
    }
  }

  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }


  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const response = await googleAuth({
        uid:user.uid,
        email:user.email,
        username:user.displayName,
        emailVerified: user.emailVerified,
        role: Role.Tutor
      }).unwrap();
      if(response?.data?.isApproved){
        const tutorData: TutorData = {
           _id: response?.data?._id,
           username: response?.data?.username,
           email: response?.data?.email,
           roleId: response?.data?.roleId,
           isBlocked: response?.data?.isBlocked,
           isApproved: response?.data?.isApproved,
           profileImage: response?.data?.profileImage ,
           createdAt: response.data.createdAt ? new Date(response.data.createdAt) : null
        }
        dispatch(setCredentials({data: tutorData}))
        navigate('/tutor/home')
      }else{
        navigate(`/tutor/approval/${response.data._id}`)
      }
      toast.success('Google sign-in successfull');
    } catch (error) {
      const apiError = error as APIError;
      if(apiError.data && apiError.data?.message){
        toast.error(apiError.data?.message)
      }else {
        toast.error('A unknown error occured')
      }
    }
  }

  
  return (
    <div className="relative min-h-screen p-4 overflow-hidden bg-customGrey">
       <Toaster
        position="top-center"
        toastOptions={{ style: { backgroundColor: "#D8D8FD" } }}
        richColors
      />
      <div className='relative flex flex-col min-h-screen p-8'>
        <AuthHeaders linkText='Login' linkTo='/tutor/login'/>
        <div className='flex flex-1'>
          <div className="relative flex flex-col justify-center w-1/2 py-4 pr-8 -top-32 left-10 ">
            <h1 className="text-4xl font-medium text-themeColor">BECOME AN INSTRUCTOR!</h1>
            <p className="py-2 text-lg text-themeColor w-[600px] break-words">
               Instructors from around the world teach millions of students on Byway. We provide the tools and skills to teach what you love.
            </p>
          </div>
          <div className="relative z-40 flex items-center justify-center w-1/2 ">
            <div className="w-full max-w-md p-8 rounded-lg bg-customGrey">
              <h2 className="mb-6 text-3xl font-bold text-themeColor">Register</h2>
              <div>
                
              </div>
              <Formik
                initialValues={{
                  username: "",
                  email: "",
                  roleId:Role.Tutor,
                  password: "",
                  confirmPassword: "",
                }}
                validationSchema={registrationValidationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched}) => (
                <Form>
                  <div className="relative mb-4">
                    <label
                      htmlFor="username"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Enter Username
                    </label>
                    <FontAwesomeIcon
                      icon={faUser}
                      className={`absolute transform -translate-y-1/2 top-12 left-4 ${
                        errors.username && touched.username ? "text-red-400" : "text-gray-400"
                      }`}
                    />
                    <Field
                      type="text"
                      name="username"
                      className="w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full placeholder:font-thin placeholder:italic"
                      placeholder="Username"
                    />
                    <ErrorMessage
                      name="username"
                      component="div"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>

                  <div className="relative mb-4">
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
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
                      className="w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full placeholder:font-thin placeholder:italic"
                      placeholder="example@gmail.com"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>

                  <div className="relative mb-4">
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Enter Password
                    </label>
                    <FontAwesomeIcon
                      icon={faLock}
                      className={`absolute transform -translate-y-1/2 top-12 left-4 ${
                        errors.password && touched.password ? "text-red-400" : "text-gray-400"
                      }`}
                    />
                    <Field
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full placeholder:font-thin placeholder:italic"
                      placeholder="Password"
                    />
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                      onClick={togglePasswordVisibility}
                      className="absolute text-gray-400 transform -translate-y-1/2 cursor-pointer top-12 right-4"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>

                  <div className="relative mb-4">
                    <label
                      htmlFor="ConfirmPassword"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Confirm Password
                    </label>
                    <FontAwesomeIcon
                      icon={faLock}
                      className={`absolute transform -translate-y-1/2 top-12 left-4 ${
                        errors.confirmPassword && touched.confirmPassword ? "text-red-400" : "text-gray-400"
                      }`}
                    />
                    <Field
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      className="w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full placeholder:font-thin placeholder:italic"
                      placeholder="Confirm Password"
                    />
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                      onClick={togglePasswordVisibility}
                      className="absolute text-gray-400 transform -translate-y-1/2 cursor-pointer top-12 right-4"
                    />
                    <ErrorMessage
                      name="confirmPassword"
                      component="div"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>
                  <div className="-mt-2 text-right">
                    <Link
                      to="/forget-password"
                      className="text-sm text-blue-500"
                    >
                      Forget Password
                    </Link>
                  </div>

                  <div className="mt-5">
                    <AuthButton text="Register" />
                  </div>
                </Form>
                )}
              </Formik>
              <Spinner isLoading = {isLoading}/>
              <div className="flex items-center justify-center mt-6">
                <div className="w-full border-t border-gray-300"></div>
                <span className="mx-4 text-sm text-gray-600">or</span>
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="flex items-center justify-center mt-4">
                <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                <span className="text-sm cursor-pointer text-themeColor" onClick={handleGoogleSignIn}>Sign up with Google</span>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/tutor/login" className="text-themeColor">
                    Register Here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute -bottom-20 -left-72 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-themeColor rounded-t-full"></div>
        <div className="absolute -bottom-52 left-2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-themeColor rounded-t-full"></div>
        <div className="absolute -bottom-80 left-80 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-themeColor rounded-t-full"></div>
      </div>
       {showOTPModal && (
        <OtpModal onSubmit={handleOtpSubmit} onClose={() => setShowOTPModal(false)} onResend={handleResendOTP}/>
       )}
    </div>
  )
}

export default TutorRegister;
