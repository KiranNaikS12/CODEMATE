import { useLogoutMutation } from '../../services/userApiSlice'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCredentials } from '../../store/slices/authSlice';


const Logout = () => {

  const [logoutApiCall] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();  
    
  const handleLogout = async() => {
    try{
        await logoutApiCall({}).unwrap();
        
        dispatch(clearCredentials());
        navigate('/login')
    }catch(error){
        console.error('Failed to register:', error);
    }
  }  
    
  return (
    <div>
        <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Logout
