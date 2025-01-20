import { ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store/rootReducer";
import { clearCredentials as userClearCredentials } from "../store/slices/authSlice";
import { clearCredentials as tutorClearCredentials } from "../store/slices/tutorSlice";
import { clearCredentials as adminClearCredentials } from "../store/slices/adminSlice";
import axiosInstance from "../utils/axiosInstance";    
import socketService from "../services/socket.service";
import NotFound from "../pages/CommonPages/NotFound";

interface AuthRouteProps {
  children: ReactNode;
  role: "user" | "tutor" | "admin";
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children, role }) => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const tutorInfo = useSelector((state: RootState) => state.tutor.tutorInfo);
  const adminInfo = useSelector((state: RootState) => state.admin.adminInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await axiosInstance.get("/auth/verify-token", {
          withCredentials: true,
        });

        if (role === "user" && userInfo?.isBlocked) {
          handleLogout();
          return;
        }
        if (role === "tutor" && tutorInfo?.isBlocked) {
          handleLogout();
          return;
        }

        if(role === 'user' || role === 'tutor') {
          if(!socketService.isConnected()) {
            socketService.connect();
          }
        }

      } catch (error) {
        console.log("Token verification failed: ", error);
      }
    };

     const handleLogout = () => {
      switch (role) {
        case "user":
          dispatch(userClearCredentials());
          navigate("/");
          break;
        case "tutor":
          dispatch(tutorClearCredentials());
          navigate("/");
          break;
        case "admin":
          dispatch(adminClearCredentials());
          navigate("/admin/login");
          break;
      }
      socketService.disconnect();
    };

    verifyAuth();
    
    //automatic-logout
    const interval = setInterval(verifyAuth, 90000);
    return () =>  {
      clearInterval(interval);
      socketService.disconnect();
    }
  }, [userInfo, tutorInfo, adminInfo, role, navigate, dispatch]);

  const isAuthenticated =
    (role === "user" && userInfo && !userInfo.isBlocked) ||
    (role === "tutor" && tutorInfo && !tutorInfo.isBlocked) ||
    (role === "admin" && adminInfo);

  return isAuthenticated ? <>{children}</> : <NotFound/>;
};

export default AuthRoute;
