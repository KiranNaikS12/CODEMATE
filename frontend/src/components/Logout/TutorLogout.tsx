import { useDispatch } from "react-redux";
import { useLogoutTutorMutation } from "../../services/tutorApiSlice";
import { useNavigate } from "react-router-dom";
import { clearCredentials } from "../../store/slices/tutorSlice";

const TutorLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutTutorMutation();

  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
      dispatch(clearCredentials());
      navigate("/tutor/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <div>
      <button onClick={handleLogout}></button>
    </div>
  );
};

export default TutorLogout;
