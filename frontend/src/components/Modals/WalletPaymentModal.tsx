import React from 'react';;
import { Formik, Field, ErrorMessage, Form } from 'formik';
import { walletValidationSchema } from '../../utils/validation';
import { useWalletPaymentMutation } from '../../services/userApiSlice';
import Swal from 'sweetalert2';
import { APIError } from '../../types/types';
import { loadStripe } from '@stripe/stripe-js';

export interface WalletPaymentProps {
    onClose: () => void;
    id?: string
};

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const WalletPaymentModal: React.FC<WalletPaymentProps> = ({ onClose, id }) => {
    const [ handlePayment ] = useWalletPaymentMutation()
 
    const handleSubmit = async (values: { amount: number }) => {
        try{
            const stripe = await stripePromise;
            if(!stripe) {
                throw new Error('Stripe failed to initialize')
            }
            const response = await handlePayment({userId: id, amount: values.amount}).unwrap();
            console.log(response)
            if(response.data) {
                window.location.href = response.data;
            }
        }  catch (error ) {
            const apiError = error as APIError;
            if(apiError.data && apiError.data.message) {
                Swal.fire({
                    icon: 'error',
                    title: 'Payment Failed',
                    text: apiError.data.message,
                    confirmButtonColor: '#d33',
                });
            } 
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="p-6 bg-white rounded-lg shadow-lg w-96">
                <h2 className="mb-4 text-lg font-semibold text-gray-700">Wallet Payment</h2>
                <p className="mb-6 text-sm text-gray-600">
                    <span className="font-semibold"></span> Please enter the amount and proceed with the payment.
                </p>
                <Formik
                    initialValues={{ amount: 0}}
                    validationSchema={walletValidationSchema}
                    onSubmit={handleSubmit}
                >
                    {() => (
                        <Form>
                            <div className="mb-4">
                                <div className="relative z-0 w-full mb-5 group">
                                    <Field
                                        type="number"
                                        name="amount"
                                        id="amount"
                                        className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                        placeholder=" "
                                    />
                                    <label
                                        htmlFor="amount"
                                        className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                                    >
                                        Enter Amount
                                    </label>
                                </div>
                                <ErrorMessage
                                    name="amount"
                                    component="div"
                                    className="text-sm italic text-red-500"
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm text-white rounded-md hover:bg-themeColor bg-highlightBlue"
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default WalletPaymentModal;
