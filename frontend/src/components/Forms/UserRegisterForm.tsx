import React, {  useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faLock,
    faUser,
    faEyeSlash,
    faEye,
} from "@fortawesome/free-solid-svg-icons";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { APIError, Role } from "../../types/types";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { toast } from "sonner";
import { useGoogleAuthMutation } from "../../services/userApiSlice";
import { setCredentials } from "../../store/slices/authSlice";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebaseConfig";
import { registrationValidationSchema } from "../../utils/validation";
import AuthButton from "../Buttons/AuthButton";
import { FormData } from "../../pages/User/UserRegistrations";


interface UserRegisterFormProps {
    isMobile: boolean;
    onSubmit: (data: FormData) => Promise<void>;
}

const UserRegisterForm: React.FC<UserRegisterFormProps> = ({  isMobile, onSubmit }) => {
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state: RootState) => state.auth);
    const [googleAuth] = useGoogleAuthMutation();

    useEffect(() => {
        if (userInfo) { 
            navigate("/home");
        }
    }, [navigate, userInfo]);


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

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev)
    },[])


    return (
        <div
            className={`w-full max-w-md p-6 rounded-lg  ${isMobile
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
                onSubmit={onSubmit}
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
                                className={`absolute transform -translate-y-1/2 top-12 left-4 ${errors.username && touched.username
                                    ? "text-red-400"
                                    : "text-gray-400"
                                    }`}
                            />
                            <Field
                                type="text"
                                id="username"
                                name="username"
                                className={`w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full  placeholder:font-thin placeholder:italic ${isMobile ? "shadow-xl" : ""
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
                                className={`absolute transform -translate-y-1/2 top-12 left-4 ${errors.email && touched.email
                                    ? "text-red-400"
                                    : "text-gray-400"
                                    }`}
                            />
                            <Field
                                type="email"
                                id="email"
                                name="email"
                                className={`w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full  placeholder:font-thin placeholder:italic ${isMobile ? "shadow-xl" : ""
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
                                className={`absolute transform -translate-y-1/2 top-12 left-4 ${errors.password && touched.password
                                    ? "text-red-400"
                                    : "text-gray-400"
                                    }`}
                            />
                            <Field
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                id="password"
                                className={`w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full  placeholder:font-thin placeholder:italic ${isMobile ? "shadow-xl" : ""
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
                                className={`absolute transform -translate-y-1/2 top-12 left-4 ${errors.confirmPassword && touched.confirmPassword
                                    ? "text-red-400"
                                    : "text-gray-400"
                                    }`}
                            />
                            <Field
                                type={showPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                id="confirmPassword"
                                className={`w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full  placeholder:font-thin placeholder:italic ${isMobile ? "shadow-xl" : ""
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
    )
};

export default React.memo(UserRegisterForm)