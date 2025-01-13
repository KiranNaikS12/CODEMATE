import React from 'react'

interface ButtonProps {
    text: string;
    className?: string
}

const AuthButton: React.FC<ButtonProps> = ({text, className}) => {
  return (
    <>
      <button 
        type='submit'
        className={`w-full py-3 text-white rounded-full bg-themeColor font-semibold shadow-md hover:bg-[#3d3d7ef3] transition duration-300 ${className}`} >
        {text}
      </button>
    </>
  )
}

export default AuthButton
