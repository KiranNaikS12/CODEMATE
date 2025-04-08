import React, { useState, useCallback, useEffect, SetStateAction } from 'react'
import { Formik, Field, Form, ErrorMessage } from "formik";
import {
    faEnvelope,
    faLock,
    faEye,
    faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useNavigate } from 'react-router-dom';
import { baseValidationSchema } from '../../utils/validation';
import AuthButton from '../Buttons/AuthButton';
import { useDispatch, useSelector } from 'react-redux';
import { useGoogleAuthMutation, useLoginUserMutation } from "../../services/userApiSlice";
import { setCredentials } from '../../store/slices/authSlice';
import { APIError, Role } from '../../types/types';
import { toast } from "sonner";
import { RootState } from '../../store/store';
import { auth, googleProvider } from '../../config/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';

type FormData = {
  email: string;
  password: string;
};

interface LoginFormProps {
    onPasswordModal: React.Dispatch<SetStateAction<boolean>>;
    onMobileView: boolean;
}

const UserLoginForm:React.FC<LoginFormProps> = ({ onPasswordModal, onMobileView}) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
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

    
    //Function to handle form submit
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

     //Function to handle google singIn
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

    // Toggle visibility for password
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    return (
        <div
            className={`w-full max-w-md p-6 rounded-lg 
         ${onMobileView
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
                                className={`absolute transform -translate-y-1/2 top-12 left-4 ${errors.email && touched.email
                                    ? "text-red-400"
                                    : "text-gray-400"
                                    }`}
                            />
                            <Field
                                type="email"
                                name="email"
                                className={`w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full  placeholder:font-thin placeholder:italic ${onMobileView ? "shadow-xl" : ""
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
                                className={`absolute transform -translate-y-1/2 top-12 left-4 ${errors.password && touched.password
                                    ? "text-red-400"
                                    : "text-gray-400"
                                    }`}
                            />
                            <Field
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className={`w-full py-2 pl-10 pr-4 placeholder-gray-400 rounded-full  placeholder:font-thin placeholder:italic ${onMobileView ? "shadow-xl" : ""
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
                                onClick={() => onPasswordModal(true)}
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
    )
};

export default React.memo(UserLoginForm)

