import React, { useState } from "react";
import AdminHeader from "../../components/Headers/AdminHeader";  
import AdminSidebar from "../../components/Sidebar/AdminSidebar";  
import { Outlet } from "react-router-dom";

const AdminHome: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="relative flex h-screen overflow-x-hidden bg-customGrey">
      
      <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 ">
        <AdminHeader toggleSidebar={toggleSidebar} />
           
          {/* dynamic content   */}
          <main  className="absolute m-16 xl:w-[1160px] xl:left-52  top-10  lg:w-[740px] lg:left-52 md:left-52 md:w-[480px] sm:-left-12 sm:w-[630px] -left-12 xs:w-[395px] xxs:w-[345px] w-[290px] ">
              <Outlet/>
          </main>
      </div>
    </div>
  );
};

export default AdminHome;
