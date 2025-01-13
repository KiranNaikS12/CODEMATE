import { useEffect, useState } from "react"


const DateTime = () => {
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
        const now = new Date();
        setCurrentDateTime(
            now.toLocaleString('en-Us', {
               year: 'numeric',
               month: 'short',  
               day: 'numeric',  
               hour: 'numeric', 
               minute: 'numeric', 
               hour12: true,  
            })
        );
    };

    const intervalId = setInterval(updateDateTime, 1000);
    updateDateTime();
    return () => clearInterval(intervalId)
  },[])

  return (
   <>
   <p className="text-xs">{currentDateTime}</p>
   </>
  )
}

export default DateTime
