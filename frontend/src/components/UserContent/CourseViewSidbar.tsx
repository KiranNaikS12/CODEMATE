import React, { useState } from 'react';
import {  Menu, ChevronDown, ChevronRight, CircleX } from 'lucide-react';
import { AccessVideoUrl } from '../../types/courseTypes';

// Define props interface
interface SidebarProps {
  chapters?: AccessVideoUrl[];
}

const CourseViewSidebar: React.FC<SidebarProps> = ({ chapters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openChapters, setOpenChapters] = useState<{ [key: number]: boolean }>({});
  
  console.log(chapters)

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleChapter = (chapterIndex: number) => {
    setOpenChapters(prev => ({
      ...prev,
      [chapterIndex]: !prev[chapterIndex]
    }));
  };

  return (
    <div className={`fixed top-24 left-5 h-full bg-white shadow-lg border-2 border-white transition-all duration-300 ease-in-out rounded-lg 
      ${isOpen ? 'w-64' : 'w-16'} z-50`}>
      <button 
        onClick={toggleSidebar} 
        className="absolute top-5 right-4 z-60"
      >
        {isOpen ? <CircleX size={24} color='#f87171'/> : <Menu size={28} />}
      </button>

      {isOpen && (
        <div className="p-4">
          <h2 className="mb-6 text-xl font-bold text-themeColor">Course Curriculum</h2>
          
          {chapters && chapters.map((chapter, chapterIndex) => (
            <div key={chapterIndex} className="mb-4">
              <div 
                onClick={() => toggleChapter(chapterIndex)}
                className="flex items-center p-2 transition-colors rounded-md cursor-pointer hover:bg-gray-100"
              >
                {openChapters[chapterIndex] ? (
                  <ChevronDown className="mr-2 text-themeColor" size={20} />
                ) : (
                  <ChevronRight className="mr-2 text-themeColor" size={20} />
                )}
                <h3 className="flex-grow font-semibold text-themeColor">
                  {chapter.title}
                </h3>
              </div>

              {openChapters[chapterIndex] && (
                <ul className='pl-6 mt-2 space-y-2 cursor-pointer'>
                  {chapter.videos.map((video, videoIndex) => (
                    <li 
                      key={videoIndex} 
                      className="flex items-center text-sm text-gray-700 transition-colors hover:text-themeColor"
                    >
                      <span className="mr-2 text-themeColor">•</span>
                      {video.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseViewSidebar;