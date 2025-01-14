import React, { useState} from "react";
import {
  LayoutGrid,
  BookOpen,
  Users,
  LogOut,
  Settings,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { TutorHeaderProps } from "../../types/tutorTypes";
import { useLogoutTutorMutation } from "../../services/tutorApiSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCredentials } from "../../store/slices/tutorSlice";
import { Link } from "react-router-dom";

const Sidebar: React.FC<TutorHeaderProps> = ({ isSearchOpen }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePageChange = (page: string) => {
    if (page === "logout") {
      handleLogout();
    }
    setActivePage(page);
  };

  const menuItems = [
    {
      name: "DashBoard",
      icon: <LayoutGrid className="w-5 h-5" />,
      key: "dashboard",
      path: "",
    },

    {
      name: "My Course",
      icon: <BookOpen className="w-5 h-5" />,
      key: "courses",
      path: "course",
    },
    {
      name: "Enrolled Students",
      icon: <Users className="w-5 h-5" />,
      key: "students",
      path: "student",
    },
    {
      name: "Settings",
      icon: <Settings className="w-5 h-5" />,
      key: "settings",
      path: "settings",
    },
    { name: "Logout", icon: <LogOut className="w-5 h-5" />, key: "logout" },
  ];

  return (
    <div>
      <aside
        className={`fixed top-16 left-0 lg:top-0 lg:static w-64 h-full bg-gray-200 p-6 transition-transform duration-300 ease-in-out transform z-30 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:ml-12 lg:rounded-lg xl:rounded-lg xl:mt-28 xl:pt-8 pt-16 lg:mt-28 shadow-lg`}
      >
        <nav className="space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.key}
              to={`/tutor/home/${item.path}`}
              onClick={() => handlePageChange(item.key)}
              className={`flex items-center gap-x-2 p-3 rounded-md transition-all duration-200 ease-in-out bg-gray-200 ${
                activePage === item.key
                  ? "bg-gradient-to-r from-highlightBlue to-themeColor text-white shadow-md transform  border-none"
                  : "text-themeColor hover:bg-gray-300  hover:scale-105 shadow-md"
              }`}
            >
              <div className="text-2xl">{item.icon}</div>
              <span className="font-semibold">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Toggle Button */}
      <div className="fixed z-20 lg:hidden top-20 left-4 ">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 focus:outline-none"
        >
          {sidebarOpen ? (
            <FontAwesomeIcon
              icon={faTimes}
              className="text-customGrey"
              size="2x"
            />
          ) : (
            <FontAwesomeIcon
              icon={faBars}
              className={isSearchOpen ? "text-customGrey" : "text-themeColor"}
              size="2x"
            />
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

