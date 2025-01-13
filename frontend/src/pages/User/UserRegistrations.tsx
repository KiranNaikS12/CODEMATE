import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUser,
  faEyeSlash,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { FaFrown } from "react-icons/fa";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { registrationValidationSchema } from "../../utils/validation";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  useGoogleAuthMutation,
  useRegisterMutation,
  useVerifyUserMutation,
} from "../../services/userApiSlice";
import { setCredentials } from "../../store/slices/authSlice";
import { Toaster, toast } from "sonner";
import OtpModal from "../../components/Modals/OtpModal";
import { Link } from "react-router-dom";
import { APIError } from "../../types/types";
import AuthButton from "../../components/Buttons/AuthButton";
import AuthHeaders from "../../components/Headers/AuthHeaders";
import { auth, googleProvider } from "../../config/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { Role } from "../../types/types";
import { RootState } from "../../store/store";

type FormData = {
  username: string;
  email: string;
  roleId: Role.User;
  password: string;
  confirmPassword: string;
};

const UserRegistrations: React.FC = () => {
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [registrationToken, setRegistrationToken] = useState("");
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [initiateRegistration] = useRegisterMutation();
  const [verifyUser] = useVerifyUserMutation();
  const [googleAuth] = useGoogleAuthMutation();

  const { userInfo } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate("/home");
    }
  }, [navigate, userInfo]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("reset", checkMobile);
  }, []);

  const handleSubmit = async (data: FormData) => {
    try {
      const response = await initiateRegistration(data).unwrap();
      setRegistrationToken(response.data.token);
      setFormData(data);
      setShowOTPModal(true);
      toast.success("OTP sent to your email");
    } catch (error: unknown) {
      const apiError = error as APIError;
      if (apiError.data && apiError.data.message) {
        toast.error(apiError.data.message, {
          icon: <FaFrown size={20} />,
        });
      } else {
        toast.error("An unknown error occurred. Please try again.");
      }
    }
  };

  const handleResendOTP = async () => {
    if (formData) {
      await handleSubmit(formData);
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    try {
      const response = await verifyUser({
        token: registrationToken,
        otp,
      }).unwrap();
      if (response.data._id) {
        dispatch(setCredentials({ ...response }));
        setShowOTPModal(false);
        toast.success("Welcome! You have successfully created an account");
        navigate("/home");
      } else {
        toast.error("Invalid OTP");
      }
    } catch (error: unknown) {
      const apiError = error as APIError;
      if (apiError.data && apiError.data.message) {
        toast.error(apiError.data.message);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Handling google sing-up
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const response = await googleAuth({
        uid: user.uid,
        email: user.email,
        username: user.displayName,
        emailVerified: user.emailVerified,
        role: Role.User,
      }).unwrap();
      dispatch(setCredentials(response));
      toast.success("Google sign-in successfull");
      navigate("/home");
    } catch (error) {
      const apiError = error as APIError;
      if (apiError.data && apiError.data?.message) {
        toast.error(apiError.data && apiError.data?.message);
      } else {
        toast.error("A unknown error occured");
      }
    }
  };

  const LoginForm = () => (
    <div
      className={`w-full max-w-md p-6 rounded-lg  ${
        isMobile
          ? "shadow-lg bg-white/80 backdrop-blur-sm mb-4"
          : "border-none mb-4"
      }`}
    >
      <h2 className={`mb-6 text-xl font-bold md:text-3xl text-themeColor`}>
        REGISTER
      </h2>
      <Formik
        initialValues={{
          username: "",
          email: "",
          roleId: Role.User,
          password: "",
          confirmPassword: "",
        }}
        validationSchema={registrationValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form className="space-y-4">
            <div className="relative">
              <label
                htmlFor="username"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Enter Username
              </label>
              <FontAwesomeIcon
                icon={faUser}
                className={`absolute transform -translate-y-1/2 top-12 left-4 ${
                  errors.username && touched.username
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              />
              <Field
                type="text"
                id="username"
                name="username"
                className={`w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full  placeholder:font-thin placeholder:italic ${
                  isMobile ? "shadow-xl" : ""
                }`}
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
                  errors.email && touched.email
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              />
              <Field
                type="email"
                id="email"
                name="email"
                className={`w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full  placeholder:font-thin placeholder:italic ${
                  isMobile ? "shadow-xl" : ""
                }`}
                
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
                 type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                className={`w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full  placeholder:font-thin placeholder:italic ${
                  isMobile ? "shadow-xl" : ""
                }`}
               
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
                htmlFor="confirmPassword"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <FontAwesomeIcon
                icon={faLock}
                className={`absolute transform -translate-y-1/2 top-12 left-4 ${
                  errors.confirmPassword && touched.confirmPassword
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              />
              <Field
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                id="confirmPassword"
                className={`w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full  placeholder:font-thin placeholder:italic ${
                  isMobile ? "shadow-xl" : ""
                }`}
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
            <div className="mt-10">
              <AuthButton text="Register" />
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
        <span
          className="text-sm cursor-pointer text-themeColor"
          onClick={handleGoogleSignIn}
        >
          Sign up with Google
        </span>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-themeColor">
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );

  const DesktopView = () => (
    <div className="relative min-h-screen p-4 bg-customGrey ">
      <div className="absolute -left-40 -top-64 w-[120vh] h-[120vh] bg-themeColor rounded-full" />
      <div className="relative z-10 flex flex-col min-h-screen p-8">
        <AuthHeaders linkText="Login" linkTo="/login" />
        <div className="flex flex-1">
          <div className="relative flex flex-col justify-center w-1/2 pr-8 -top-24">
            <h1 className="text-5xl font-medium text-customGrey">JOIN US</h1>
            <p className="text-xl text-customGrey w-[600px] break-words">
              Embark on a journey of learning and discovery with CodeMATE. Start
              today!
            </p>
          </div>
          <div className="relative flex items-center justify-center w-1/2 -top-10">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );

  const MobileView = () => (
    <div className="relative w-full min-h-screen overflow-hidden bg-customGrey">
      <div className="absolute -left-1/4 -top-2 w-[150vw] h-[50vh] bg-themeColor rounded-b-[100%]" />
      <div className="relative z-10 flex flex-col items-center px-4 pt-10">
        <h1 className="mb-2 text-4xl font-medium text-customGrey">JOIN US</h1>
        <p className="mb-8 text-lg text-center text-customGrey">
          Embark on a journey of learning and discovery with CodeMATE. Start
          today!
        </p>
        <LoginForm />
      </div>
    </div>
  );

  return (
    <>
      <Toaster position="top-center" richColors />
      {isMobile ? <MobileView /> : <DesktopView />}
      {showOTPModal && (
        <OtpModal
          onSubmit={handleOtpSubmit}
          onClose={() => setShowOTPModal(false)}
          onResend={handleResendOTP}
        />
      )}
    </>
  );
};

export default UserRegistrations;
