import React,{useState} from "react";
import TutorSidebar from "../../components/Sidebar/TutorSidebar";
import TutorHeader from '../../components/Headers/TutorHeader'
import { Outlet } from "react-router-dom";

const TutorHome:React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = () => {
    setIsSearchOpen(prev => !prev)
  }
  
  return (
    <div className="flex min-h-screen bg-white">
      <TutorHeader toggleSearch = {toggleSearch} isSearchOpen = {isSearchOpen} />
      <div>
       <TutorSidebar isSearchOpen = {isSearchOpen}/>
      </div>
       <main className="z-10 flex-1 ml-8 rounded-lg absoulte mt-28">
        <Outlet/>
       </main>
    </div>
    
  )
};

export default TutorHome;
