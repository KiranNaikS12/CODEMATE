import { useLocation } from "react-router-dom";


interface ClassType {
    className:string
}

const Logo:React.FC<ClassType> = ({className}) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/home'
  const isLoginPage = location.pathname === '/login'
  const isRegisterPage = location.pathname === '/register'
  const isProfilePage = location.pathname === '/profile/:id'
  const isLandingPage = location.pathname === '/'
    
  return (
    <div className="flex items-center justify-center gap-x-1">
      {!isLoginPage && !isRegisterPage && !isLandingPage &&(    
      <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 200 200" className={className}>
        <path d="M 130,50 A 70,70 0 1,0 130,150" fill="none" stroke='#2A2A48' strokeWidth="20"/>
        <path d="M 135,150 L 120,60 L 150,110 L 180,60 L 180,150" fill="none" stroke="#247CFF" strokeWidth="20"/>
      </svg>
      )}

      { isLoginPage &&  (
        <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 200 200" className={className}>
        <path d="M 130,50 A 70,70 0 1,0 130,150" fill="none" stroke='#D8D8FD' strokeWidth="20"/>
        <path d="M 135,150 L 120,60 L 150,110 L 180,60 L 180,150" fill="none" stroke="#247CFF" strokeWidth="20"/>
      </svg>
      )}
      
      { isRegisterPage &&  (
        <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 200 200" className={className}>
        <path d="M 130,50 A 70,70 0 1,0 130,150" fill="none" stroke='#D8D8FD' strokeWidth="20"/>
        <path d="M 135,150 L 120,60 L 150,110 L 180,60 L 180,150" fill="none" stroke="#247CFF" strokeWidth="20"/>
      </svg>
      )}

      {!isHomePage &&  !isLoginPage && !isProfilePage && !isRegisterPage && !isLandingPage &&(
        <h1 className="text-4xl font-bold text-themeColor">Code<span className="text-[#247CFF]">MATE</span></h1>
      )}

      {
        isLoginPage &&  (
          <h1 className="text-4xl font-bold text-customGrey">Code<span className="text-[#247CFF]">MATE</span></h1>
        )
      }
      {
        isRegisterPage &&  (
          <h1 className="text-4xl font-bold text-customGrey">Code<span className="text-[#247CFF]">MATE</span></h1>
        )
      }
      {
        isLandingPage &&  (
          <h1 className="text-4xl font-bold text-customGrey">Code<span className="text-[#247CFF]">MATE</span></h1>
        )
      }
      
    </div>
  )
}

export default Logo
