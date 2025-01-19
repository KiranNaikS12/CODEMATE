import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { baseValidationSchema } from "../../utils/validation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  useGoogleAuthMutation,
  useLoginUserMutation,
} from "../../services/userApiSlice";
import { setCredentials } from "../../store/slices/authSlice";
import { APIError } from "../../types/types";
import AuthButton from "../../components/Buttons/AuthButton";
import AuthHeaders from "../../components/Headers/AuthHeaders";
import { Toaster, toast } from "sonner";
import ForgetPasswordModal from "../../components/Modals/ForgetPasswordModel";
import { auth, googleProvider } from "../../config/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { Role } from "../../types/types";

type FormData = {
  email: string;
  password: string;
};

const UserLogin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgetPasswordModel, setShowForgetPasswordModel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state: RootState) => state.auth);

  const [login] = useLoginUserMutation();
  const [googleAuth] = useGoogleAuthMutation();

  useEffect(() => {
    if (userInfo) {
      toast.success("Login successful!");
      navigate("/home");
    }
  }, [navigate, userInfo]);

  //handling mobile div
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSubmit = async (data: FormData) => {
    try {
      const response = await login(data).unwrap();
      dispatch(setCredentials({ ...response }));
    } catch (error: unknown) {
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
      className={`w-full max-w-md p-6 rounded-lg 
         ${
        isMobile
          ? "shadow-lg bg-white/80 backdrop-blur-sm mb-4"
          : "border-none mb-4"
      }`}
    >
      <h2 className={`mb-6 text-xl font-bold md:text-3xl text-themeColor`}>
        LOGIN
      </h2>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={baseValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form className="space-y-4">
            <div className="relative">
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

            <div className="relative">
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

            <div className="text-right">
              <button
                className="text-sm italic text-blue-500"
                type="button"
                onClick={() => setShowForgetPasswordModel(true)}
              >
                forget password
              </button>
            </div>

            <div className="pt-2">
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
        <span
          className="text-sm cursor-pointer text-themeColor"
          onClick={handleGoogleSignIn}
        >
          Sign up with Google
        </span>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-themeColor">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );

  const DesktopView = () => (
    <div className="relative min-h-screen p-4 bg-customGrey">
      <div className="absolute -left-40 -top-64 w-[120vh] h-[120vh] bg-themeColor rounded-full" />
      <div className="relative z-10 flex flex-col min-h-screen p-8">
        <AuthHeaders linkText="register" linkTo="/register" />
        <div className="flex flex-1">
          <div className="relative flex flex-col justify-center w-1/2 pr-8 -top-24">
            <h1 className="text-5xl font-medium text-customGrey">WELCOME</h1>
            <p className="text-xl text-customGrey w-[600px] break-words">
              Start your journey today and turn your coding dreams into reality
              with CodeMATE.
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
      <div className="relative z-10 flex flex-col items-center h-full px-4 pt-16">
        <h1 className="mb-2 text-4xl font-medium text-customGrey">WELCOME</h1>
        <p className="mb-8 text-lg text-center text-customGrey">
          Start your journey today and turn your coding dreams into reality with
          CodeMATE.
        </p>
        <div className="w-full pt-12">
          <LoginForm />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Toaster position="top-center" richColors />
      {isMobile ? <MobileView /> : <DesktopView />}
      <ForgetPasswordModal
        isOpen={showForgetPasswordModel}
        onClose={() => setShowForgetPasswordModel(false)}
        role="user"
      />
    </>
  );
};

export default UserLogin;
