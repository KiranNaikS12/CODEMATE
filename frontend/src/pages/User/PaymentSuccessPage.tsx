import React, { useEffect, useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom'
import { useVerifySuccessPaymentMutation } from '../../services/userApiSlice';
import { PaymentSuccessResponse } from '../../types/orderTypes';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const PaymentSuccessPage: React.FC = () => {
  const userInfo = useSelector((state:RootState) => state.auth.userInfo)
  const [showDetails, setShowDetails] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session_id');
  const [paymentDetails, setPaymentDetails] = useState<PaymentSuccessResponse | null>(null)

  const handleAnimationComplete = () => {
    setShowDetails(true);
  };

  console.log(userInfo?._id)

  const [verifyPayment, { isLoading }] = useVerifySuccessPaymentMutation();

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId).unwrap()
        .then((response) => {
          setPaymentDetails(response.data)
        })
        .catch((error) => {
          console.log(`Payment verification failed`, error)
        })
    }
  }, [sessionId, verifyPayment])

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative w-full max-w-3xl p-8 text-center bg-white ">
        <AnimatePresence>
          {!showDetails ? (
            <motion.div
              key="animation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {/* Animated Lottie File */}
              <Player
                autoplay
                keepLastFrame
                src="/payment-success.json"
                onEvent={(event) => {
                  if (event === 'complete') {
                    handleAnimationComplete();
                  }
                }}
                style={{ height: '400px', width: '400px' }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut", }}
              className="p-6 border border-b-0"
            >
              <Player
                autoplay
                loop
                src="/payment-success2.json"
                style={{ height: '120px', width: '120px' }}
              />
              {/* Payment Details */}
              <h1 className="mt-0 text-3xl font-bold text-green-500">
                Payment Successful!
              </h1>
              <p className="mt-1 text-lg text-gray-400">
                You’ve successfully purchased your course. Check out the details below:
              </p>
              {paymentDetails?.orderId && paymentDetails?.paymentId && (
                <div className="flex flex-col items-center justify-center max-w-3xl p-4 mx-auto mt-4 text-left">
                  <p className="text-base font-light text-gray-500">
                    <span className="font-medium">Order ID:</span> {paymentDetails?.orderId}
                  </p>
                  <p className="text-base font-light text-gray-500">
                    <span className="font-medium">Payment ID:</span> {paymentDetails?.paymentId}
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-center mt-8 space-x-4">
                <Link to={`/enroll-course/${paymentDetails?.userId}`}>
                  <button className="px-4 py-2 text-lg text-white bg-blue-500 rounded-full shadow-lg hover:bg-blue-600">
                    Access Your Course
                  </button>
                </Link>
                <Link to='/course'>
                  <button className="px-4 py-2 text-lg text-white bg-gray-500 rounded-full shadow-lg hover:bg-gray-600">
                    Explore More Courses
                  </button>
                </Link>
              </div>
              {/* Support Information */}
              <p className="mt-8 text-sm text-gray-500">
                If you have any questions, please contact our support at{' '}
                <a
                  href="mailto:support@example.com"
                  className="font-semibold text-blue-500 hover:underline"
                >
                  support@skirannaikz@gmail.com
                </a>
                .
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
