import React, { useEffect, useState } from 'react'
import Logo from '../Logo/Logo'
import { Link } from 'react-router-dom'

interface Header{
  linkText: string,
  linkTo: string,
  linkClassName?: string
}


const AuthHeaders:React.FC<Header> = ({linkText, linkTo, linkClassName}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScore = () => {
        if(window.scrollY > 50){
            setIsScrolled(true)
        }else {
            setIsScrolled(false)
        }
    };

    window.addEventListener('scroll',handleScore)

    return () => {
        window.removeEventListener('scroll',handleScore)
    }
  },[])
  
  return (
      <header className={`flex items-center justify-between mb-16 fixed z-50 top-0 left-0 w-full p-4 px-16 py-7 transition-all duration-300
        ${isScrolled ? 'bg-customGrey shadow-md' : 'bg-transparent'}
      `}>
        <Logo className=''/>
        <Link 
          to = {linkTo}
          className={`px-4 py-2 font-semibold rounded-lg bg-[#3D3D7E] text-customGrey ${linkClassName}`}
          >
          {linkText}
        </Link>
    </header>
  )
}

export default AuthHeaders
