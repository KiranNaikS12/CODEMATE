import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useRegisterMutation, useVerifyUserMutation } from "../../services/userApiSlice";
import { setCredentials } from "../../store/slices/authSlice";
import { Toaster, toast } from "sonner";
import OtpModal from "../../components/Modals/OtpModal";
import { APIError } from "../../types/types";
import AuthHeaders from "../../components/Headers/AuthHeaders";
import { Role } from "../../types/types";
import UserRegisterForm from "../../components/Forms/UserRegisterForm";
import { FaFrown } from "react-icons/fa";


export type FormData = {
  username: string;
  email: string;
  roleId: Role.User;
  password: string;
  confirmPassword: string;
};

const UserRegistrations: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [registrationToken, setRegistrationToken] = useState<string>("");
  const [showOTPModal, setShowOTPModal] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);


  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [initiateRegistration] = useRegisterMutation();
  const [verifyUser] = useVerifyUserMutation();

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
            <UserRegisterForm           
              isMobile={isMobile}
              onSubmit = {handleSubmit}
            />
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
        <UserRegisterForm
          isMobile={isMobile}
          onSubmit = {handleSubmit}
        />
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
