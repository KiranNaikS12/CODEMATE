import React from "react";
import { FaBars } from "react-icons/fa";
import { Bell, Settings, User } from "lucide-react";

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="fixed z-10 flex items-center justify-between w-full p-4 border-b shadow-md bg-customGrey">
      
      <button className="text-gray-600 md:hidden" onClick={toggleSidebar}>
        <FaBars className="w-6 h-6" />
      </button>


      <div className="relative flex-1 mx-4 xl:left-60 lg:left-60 md:left-60">
        <input
          type="text"
          placeholder="Search..."
          className="relative z-20 w-full px-4 py-2 border border-gray-300 rounded md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
        <Settings className="w-6 h-6 text-gray-600 cursor-pointer" />
        <User className="w-6 h-6 text-gray-600 cursor-pointer" />
      </div>
    </header>
  );
};

export default React.memo(AdminHeader);
