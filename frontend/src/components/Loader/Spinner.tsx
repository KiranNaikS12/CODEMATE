import React from "react"
import PulseLoader from "react-spinners/PulseLoader"

interface LoadingProps {
    isLoading: boolean
}

const Spinner:React.FC<LoadingProps> = ({isLoading}) => {
  if(!isLoading) return null;  
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>  
        <div className='flex flex-col items-center justify-center'>
           <PulseLoader
            color='#247cff'
            />
        </div>
    </div>    
  )
}

export default Spinner
