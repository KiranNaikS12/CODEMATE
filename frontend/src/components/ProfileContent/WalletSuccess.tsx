import React, { useState, useEffect } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { PaymentSuccessResponse } from "../../types/walletTypes";
import { useVerifySuccessfullWallPaymentMutation } from "../../services/userApiSlice";
import usePriceCalculations from "../../hooks/usePriceCalculation";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const WalletSuccess: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get("session_id");
  const { formatPrice } = usePriceCalculations();
  const [paymentDetails, setPaymentDetails] = useState<PaymentSuccessResponse | null>(null);
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const id = userInfo?._id;

  const [verifyPayment, { isLoading }] =
    useVerifySuccessfullWallPaymentMutation();

  const handleAnimationComplete = () => {
    setShowDetails(true);
  };

  useEffect(() => {
    if (sessionId && !hasFetched) {
      setHasFetched(true);
      verifyPayment(sessionId)
        .unwrap()
        .then((response) => {
          setPaymentDetails(response.data);
        })
        .catch((error) => {
          console.log(`Payment verification failed`, error);
          setHasFetched(false);
        });
    }
  }, [sessionId, verifyPayment, hasFetched]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Verifying your payment...
          </h2>
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
                  if (event === "complete") {
                    handleAnimationComplete();
                  }
                }}
                style={{ height: "400px", width: "400px" }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="p-6 border border-b-0"
            >
              <Player
                autoplay
                loop
                src="/payment-success2.json"
                style={{ height: "120px", width: "120px" }}
              />
              {/* Payment Details */}
              <h1 className="mt-0 text-3xl font-bold text-green-500">
                Payment Successful!
              </h1>
              <p className="mt-1 text-lg text-gray-400">
                You’ve successfully made coupon top up of amount{" "}
                {formatPrice(paymentDetails?.amount || 0)}
              </p>
              <div className="flex flex-col items-center justify-center max-w-3xl p-4 mx-auto mt-4 text-left">
                <p className="text-base font-light text-gray-500">
                  <span className="font-medium">
                    Transaction ID: {paymentDetails?.transactionId}
                  </span>
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-center mt-8 space-x-4">
                <Link to={`/profile/${id}`}>
                  <button className="px-4 py-2 text-lg text-white bg-blue-500 rounded-full shadow-lg hover:bg-blue-600">
                    View Wallet
                  </button>
                </Link>
                <Link to="/course">
                  <button className="px-4 py-2 text-lg text-white bg-gray-500 rounded-full shadow-lg hover:bg-gray-600">
                    Purchase Courses
                  </button>
                </Link>
              </div>
              {/* Support Information */}
              <p className="mt-8 text-sm text-gray-500">
                If you have any questions, please contact our support at{" "}
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

export default WalletSuccess;
