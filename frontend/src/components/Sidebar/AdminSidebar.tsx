import React from "react";
import {
  LayoutDashboard,
  Users,
  Contact,
  Notebook,
  FlaskConical,
  LogOut,
} from "lucide-react";
import { FaTimes } from "react-icons/fa";
import TutorLogo from "../Logo/TutorLogo"; 
import { Link, useNavigate } from "react-router-dom";
import { useLogoutAdminMutation } from "../../services/adminApiSlice";
import { useDispatch } from "react-redux";
import { clearCredentials } from "../../store/slices/adminSlice";
import { APIError } from "../../types/types";
import {toast} from 'sonner'

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isSidebarOpen,
  toggleSidebar,
}) => {
  const [logout] = useLogoutAdminMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate()

  const handleLogout = async() => {
    try{
      await logout({}).unwrap();
      dispatch(clearCredentials())
      navigate('/admin/login/')
    } catch (error){
      const apiError = error as APIError;
      if(apiError.data && apiError.data.message){
        toast.error(apiError.data.message)
      }
    }
  }
  
  return (
    <>
      <aside
        className={`fixed z-30 top-0 left-0 h-full w-64 bg-themeColor text-customGrey transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between h-16 px-4 mt-4 bg-themeColor">
          <TutorLogo />

          {/* Close Button for Mobile */}
          <button className="text-white md:hidden" onClick={toggleSidebar}>
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex flex-col p-4 mt-4 mb-10 space-y-6">
        <Link
            to="/admin"
            className="flex p-2 rounded hover:bg-highlightBlue gap-x-2 hover:rounded-lg hover:p-3"
          >
            <LayoutDashboard />
            Dashboard
          </Link>
          <Link
            to="/admin/listuser"
            className="flex p-2 rounded hover:bg-highlightBlue gap-x-2 hover:rounded-lg hover:p-3"
          >
            <Users />
            Users
          </Link>
          <Link
            to="/admin/instructors"
            className="flex p-2 rounded hover:bg-highlightBlue gap-x-2 hover:rounded-lg hover:p-3"
          >
            <Contact />
            Instructors
          </Link>
          <Link
            to="/admin/courses"
            className="flex p-2 rounded hover:bg-highlightBlue gap-x-2 hover:rounded-lg hover:p-3"
          >
            <Notebook />
            Total Course
          </Link>
          <Link
            to="/admin/problems"
            className="flex p-2 rounded hover:bg-highlightBlue gap-x-2 hover:rounded-lg hover:p-3"
          >
            <FlaskConical />
            Problems
          </Link>
          <button
            className="flex gap-2 p-2 rounded hover:bg-highlightBlue gap-x-2 hover:rounded-lg hover:p-3"
            onClick={handleLogout}
          >
            <LogOut />
            Logout
          </button>
        </nav>
      </aside>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default AdminSidebar;
