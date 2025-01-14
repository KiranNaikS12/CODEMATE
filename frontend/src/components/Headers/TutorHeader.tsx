import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes} from '@fortawesome/free-solid-svg-icons';
import TutorLogo from '../Logo/TutorLogo';
import { Plus } from 'lucide-react';
import { TutorHeaderProps } from '../../types/tutorTypes';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';



const TutorHeader:React.FC<TutorHeaderProps> = ({toggleSearch, isSearchOpen}) => {

  const tutorInfo = useSelector((state:RootState) => state.tutor.tutorInfo)
  const tutorId = tutorInfo?._id;

 
  
  return (
    <header className="fixed z-50 w-full p-4 shadow-md bg-themeColor">
      <div className="container flex items-center justify-between mx-auto">
        <div className="flex items-center">
          <TutorLogo />
        </div>
        
        <div className="items-center hidden w-1/2 pl-10 md:flex">
          <input 
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 text-gray-900 rounded-md outline-none bg-customGrey"
          />
          <button className="p-2 ml-2 text-white rounded-md bg-highlightBlue hover:bg-hoverColor">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            className="p-2 text-white rounded-md bg-themeColor md:hidden hover:bg-highlightBlue"
            onClick={toggleSearch}
          >
            {isSearchOpen ? <FontAwesomeIcon icon={faTimes} /> : <FontAwesomeIcon icon={faSearch} />}
          </button>

          
          <div className="flex items-center lg:space-x-8 md:space-x-6">
            <Link to={`/tutor/profile/${tutorId}`}>
            <img 
              src={tutorInfo?.profileImage || '/profile.webp'} alt="avatar" 
              className="w-9 h-9 border border-hoverColor rounded-full cursor-pointer hover:border-2 hover:border-[#247cff] transition duration-200 object-cover"/>
            </Link>    
          
            <Link to='/tutor/home/course/upload'>
            <button className="hidden md:flex items-center gap-2 px-3 py-1 border border-[#247cff] text-customGrey rounded-md shadow-md hover:bg-hoverColor">
              Upload 
              <div className="p-1 rounded-full bg-highlightBlue">
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </button>
            </Link>
          </div>
        </div>
      </div>

      
      {isSearchOpen && (
        <div className="relative mt-4 ml-10 md:hidden">
          <input 
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 text-gray-900 rounded-md outline-none bg-customGrey"
          />
        </div>
      )}
    </header>
  );
};

export default TutorHeader;
