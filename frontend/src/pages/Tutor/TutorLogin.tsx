import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { baseValidationSchema } from "../../utils/validation";
import { LoginFormData } from "../../types/types";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleAuthMutation, useLoginTutorMutation } from "../../services/tutorApiSlice";
import { setCredentials, TutorData } from "../../store/slices/tutorSlice";
import { toast } from "react-toastify";
import { APIError } from "../../types/types";
import { RootState } from "../../store/store";
import AuthHeaders from "../../components/Headers/AuthHeaders";
import AuthButton from "../../components/Buttons/AuthButton";
import ForgetPasswordModal from "../../components/Modals/ForgetPasswordModel";
import {auth, googleProvider} from '../../config/firebaseConfig';
import {  signInWithPopup } from "firebase/auth";
import { Role } from "../../types/types";


const TutorLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgetPasswordModel, setShowForgetPasswordModel] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [googleAuth] = useGoogleAuthMutation();

  const { tutorInfo } = useSelector((state: RootState) => state.tutor);

  const [login] = useLoginTutorMutation();

  useEffect(() => {
    if (tutorInfo) {
      navigate("/tutor/home");
    }
  }, [navigate, tutorInfo]);

  const handleSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data).unwrap();
      dispatch(setCredentials({ ...response }));
      toast.success("Logged In Successfully");
      setTimeout(() => {
        navigate("/tutor/home");
      }, 1000);
    } catch (error) {
      const apiError = error as APIError;
      if (apiError.data && apiError.data.message) {
        toast.error(apiError.data.message);
      } else {
        toast.error("An unknown error occurred. Please try again.");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
        toast.success('Google sign-in successfull');
      }else{
        navigate(`/tutor/approval/${response.data._id}`)
      }
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
    <div className="relative min-h-screen overflow-hidden bg-customGrey">
      <div className="relative flex flex-col min-h-screen p-8">
        <AuthHeaders linkText="register" linkTo="/tutor/register" />
        <div className="flex flex-1">
          <div className="relative flex flex-col justify-center w-1/2 py-4 pr-8 -top-32 left-10 ">
            <h1 className="text-4xl font-medium text-themeColor">
              WELCOME BACK :)
            </h1>
            <p className="py-2 text-lg text-themeColor w-[600px] break-words">
              To keep connected with us please login with your personal details
              by email address and password
            </p>
          </div>
          <div className="relative z-40 flex items-center justify-center w-1/2 -top-6">
            <div className="w-full max-w-md p-8 rounded-lg bg-customGrey">
              <h2 className="mb-6 text-3xl font-bold text-themeColor">LOGIN</h2>
              <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={baseValidationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched }) => (
                  <Form>
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
                          errors.email && touched.email
                            ? "text-red-400"
                            : "text-gray-400"
                        }`}
                      />
                      <Field
                        type="email"
                        name="email"
                        className="w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full shadow-md placeholder:font-thin placeholder:italic"
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
                          errors.password && touched.password
                            ? "text-red-400"
                            : "text-gray-400"
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
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>

                    <div className="-mt-2 text-right">
                      <button
                        className="text-sm text-right"
                        type="button"
                        onClick={() => setShowForgetPasswordModel(true)}
                      >
                        {" "}
                        Forget Password
                      </button>
                    </div>

                    <div className="mt-5">
                      <AuthButton text="Login" />
                    </div>
                  </Form>
                )}
              </Formik>
              <div className="flex items-center justify-center mt-6">
                <div className="w-full border-t border-gray-300"></div>
                <span className="mx-4 text-sm text-gray-600">or</span>
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="flex items-center justify-center mt-4">
                <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                <span className="text-sm cursor-pointer text-themeColor" onClick={handleGoogleSignIn}>
                  Sign up with Google
                </span>
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
      <div className="absolute inset-0 z-10">
        <div className="absolute -bottom-20 -left-72 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-themeColor rounded-t-full"></div>
        <div className="absolute -bottom-52 left-2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-themeColor rounded-t-full"></div>
        <div className="absolute -bottom-80 left-80 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-themeColor rounded-t-full"></div>
      </div>
      <ForgetPasswordModal
        isOpen={showForgetPasswordModel}
        onClose={() => setShowForgetPasswordModel(false)}
        role="tutor"
      />
    </div>
  );
};

export default TutorLogin;
