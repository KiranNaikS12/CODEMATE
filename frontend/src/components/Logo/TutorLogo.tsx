import React from "react"

const TutorLogo:React.FC = () => {
  return (
    <div className='flex items-center justify-center cursor-pointer gap-x-1'>
      <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 200 200">
        <path d="M 130,50 A 70,70 0 1,0 130,150" fill="none" stroke='#D8D8FD' strokeWidth="20"/>
        <path d="M 135,150 L 120,60 L 150,110 L 180,60 L 180,150" fill="none" stroke="#247CFF" strokeWidth="20"/>
      </svg>
      <h1 className="text-xl md:text-md text-customGrey">CODE
        <span className="text-[#247CFF]">MATE</span>
      </h1>
    </div>
  )
}

export default TutorLogo
