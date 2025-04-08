import React, { useEffect, useState } from "react";
import AuthHeaders from "../../components/Headers/AuthHeaders";
import { Toaster } from "sonner";
import ForgetPasswordModal from "../../components/Modals/ForgetPasswordModel";
import UserLoginForm from "../../components/Forms/UserLoginForm";

const UserLogin: React.FC = () => {
  const [showForgetPasswordModel, setShowForgetPasswordModel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 800)
    }
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);


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
            <UserLoginForm
              onPasswordModal={setShowForgetPasswordModel}
              onMobileView={isMobile}
            />
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
          <UserLoginForm
            onPasswordModal={setShowForgetPasswordModel}
            onMobileView={isMobile}
          />
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
