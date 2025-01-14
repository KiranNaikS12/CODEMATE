import React from 'react'
import { loadStripe } from '@stripe/stripe-js';
import { useRetryPaymentMutation } from '../../services/userApiSlice';
import {toast} from 'sonner'
import { APIError } from '../../types/types';

export interface RetryModalProps {
    order_id: string;
    userId: string;
    onClose: () => void;
    refetch: () => void;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');


const PaymentRetryModal: React.FC<RetryModalProps> = ({  order_id, userId, onClose, refetch }) => {
    const [createCheckoutSession] = useRetryPaymentMutation();
    
    
    const handleRetryPayment = async (userId: string, order_id: string) => {
        try {
          const stripe = await stripePromise;
          if (!stripe) {
            throw new Error('Stripe failed to initialize');
          }
          const response = await createCheckoutSession({userId, order_id}).unwrap();
          if(response.data) {
             window.location.href = response.data;
          }
          refetch()
        } catch (error) {
          const apiError = error as APIError;
          if (apiError.data && apiError.data.message) {
            toast.error(apiError.data.message)
          }
          console.error('Error in Stripe Checkout:', error);
        }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="p-6 bg-white rounded-lg shadow-lg w-96">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">Retry Payment</h2>
          <p className="mb-6 text-sm text-gray-600">
            Your payment for order
            <span className="font-semibold"></span> failed or is
            pending. Would you like to retry?
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose} 
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-700"
               onClick={() => handleRetryPayment(userId, order_id)}
              >
              Retry Payment
            </button>
          </div>
        </div>
      </div>
    );
  }
  
export default PaymentRetryModal;
