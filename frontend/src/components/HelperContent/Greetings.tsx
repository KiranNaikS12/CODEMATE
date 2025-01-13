import { useEffect, useState } from 'react'
import { getGreetings } from '../../utils/getGreetings';


const Greetings: React.FC = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(getGreetings())
  }, [])

  return (
    <>
      <p>{greeting.toUpperCase()}</p>
    </>
  )
}

export default Greetings
