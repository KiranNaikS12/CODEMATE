import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config()

const stripeConfig = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-11-20.acacia'
});

export default stripeConfig;

