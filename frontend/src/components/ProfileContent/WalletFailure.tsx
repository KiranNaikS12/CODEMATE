import React, { useEffect, useState } from 'react'
import { FaExclamationTriangle } from "react-icons/fa";
import { Link,  } from 'react-router-dom';
import { PaymentSuccessResponse } from '../../types/walletTypes';
import { RootState } from '../../store/store';
import { useSelector } from 'react-redux';
import { useVerifyFailureWalletPaymentMutation } from '../../services/userApiSlice';

const WalletFailure:React.FC = () => {
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session_id');
  const [paymentDetails, setPaymentDetails] = useState<PaymentSuccessResponse | null> (null);

  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const id = userInfo?._id;

  const [ verifyPayment , {isLoading} ] = useVerifyFailureWalletPaymentMutation();

  useEffect(() => {
    if(sessionId) {
      verifyPayment(sessionId).unwrap()
      .then((response) => {
        setPaymentDetails(response.data)
      })
    }
  },[sessionId, verifyPayment]) 

  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Verifying your payment...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
        <FaExclamationTriangle size={64} color="red" className='mb-6 animate-pulse'/>
        <h1 className='text-2xl'>{`PAYMENT FAILED`}</h1>
        <div className=''>
           <p className='text-xl font-thin text-gray-500'>Sorry we're not able to process you're payment at the moment. Please try again later</p>
           <p className='mt-2 text-base text-center text-gray-500'>Transaction ID: {paymentDetails?.transactionId}</p>
        </div>
        <div className='flex items-center mt-8 gap-x-4'>
          
          <button className='px-3 py-2 bg-red-300 rounded-md hover:bg-red-400 text-themeColor'>Try again</button>
          <Link to = {`/profile/${id}`}>
            <button className='text-blue-500 hover:text-blue-700'>Back To Wallet</button>
          </Link>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Having a trouble? <button className="mr-1 text-blue-600 hover:text-blue-700">Contact Support </button>
            and we'll get back to you
          </p>
        </div>
    </div>
  )
}

export default React.memo(WalletFailure)
