import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import UserCheckoutPage from '../../pages/User/UserCheckoutPage';

const stripePromise = loadStripe('pk_test_51QNTKFFTp9KMBavlm3nGo8JKJyMdXjTMveaCHNKP8iywZs1vGntj1YwAfMfoaoy75Ro47s2gZDAZikozzwVhIt7c00f4Fg9pP6')

const StripeCheckoutpage:React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
        <UserCheckoutPage/>
    </Elements>
  )
}

export default StripeCheckoutpage
